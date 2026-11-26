// news-image-20261125 v2 — "THE WORLD IN ONE DAY"
// A dense newspaper front page summing up Wednesday 25 November 2026:
// 50 real stories from 10 regions, drawn with a hand-built 5x7 bitmap font
// and a from-scratch PNG encoder. Node 22 standard library only: no network,
// no randomness, no timestamps — repeated runs write byte-identical output.
import { mkdirSync, writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { dirname, join } from "node:path";

const W = 1024;
const H = 1024;

// ---------------------------------------------------------------------------
// 5x7 bitmap font. Each glyph is 7 rows of 5 bits; bit 4 is the left pixel.
// Uppercase A-Z, digits 0-9 and common punctuation. Text is uppercased and
// sanitised to this set before drawing, so every string renders identically.
// ---------------------------------------------------------------------------
const FONT: Record<string, number[]> = {
  A: [0b01110, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
  B: [0b11110, 0b10001, 0b10001, 0b11110, 0b10001, 0b10001, 0b11110],
  C: [0b01110, 0b10001, 0b10000, 0b10000, 0b10000, 0b10001, 0b01110],
  D: [0b11110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b11110],
  E: [0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b11111],
  F: [0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b10000],
  G: [0b01110, 0b10001, 0b10000, 0b10111, 0b10001, 0b10001, 0b01111],
  H: [0b10001, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
  I: [0b01110, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b01110],
  J: [0b00111, 0b00010, 0b00010, 0b00010, 0b00010, 0b10010, 0b01100],
  K: [0b10001, 0b10010, 0b10100, 0b11000, 0b10100, 0b10010, 0b10001],
  L: [0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b11111],
  M: [0b10001, 0b11011, 0b10101, 0b10101, 0b10001, 0b10001, 0b10001],
  N: [0b10001, 0b11001, 0b10101, 0b10011, 0b10001, 0b10001, 0b10001],
  O: [0b01110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
  P: [0b11110, 0b10001, 0b10001, 0b11110, 0b10000, 0b10000, 0b10000],
  Q: [0b01110, 0b10001, 0b10001, 0b10001, 0b10101, 0b10010, 0b01101],
  R: [0b11110, 0b10001, 0b10001, 0b11110, 0b10100, 0b10010, 0b10001],
  S: [0b01111, 0b10000, 0b10000, 0b01110, 0b00001, 0b00001, 0b11110],
  T: [0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100],
  U: [0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
  V: [0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01010, 0b00100],
  W: [0b10001, 0b10001, 0b10001, 0b10101, 0b10101, 0b11011, 0b10001],
  X: [0b10001, 0b10001, 0b01010, 0b00100, 0b01010, 0b10001, 0b10001],
  Y: [0b10001, 0b10001, 0b01010, 0b00100, 0b00100, 0b00100, 0b00100],
  Z: [0b11111, 0b00001, 0b00010, 0b00100, 0b01000, 0b10000, 0b11111],
  "0": [0b01110, 0b10001, 0b10011, 0b10101, 0b11001, 0b10001, 0b01110],
  "1": [0b00100, 0b01100, 0b00100, 0b00100, 0b00100, 0b00100, 0b01110],
  "2": [0b01110, 0b10001, 0b00001, 0b00110, 0b01000, 0b10000, 0b11111],
  "3": [0b11111, 0b00010, 0b00100, 0b00010, 0b00001, 0b10001, 0b01110],
  "4": [0b00010, 0b00110, 0b01010, 0b10010, 0b11111, 0b00010, 0b00010],
  "5": [0b11111, 0b10000, 0b11110, 0b00001, 0b00001, 0b10001, 0b01110],
  "6": [0b00110, 0b01000, 0b10000, 0b11110, 0b10001, 0b10001, 0b01110],
  "7": [0b11111, 0b00001, 0b00010, 0b00100, 0b01000, 0b01000, 0b01000],
  "8": [0b01110, 0b10001, 0b10001, 0b01110, 0b10001, 0b10001, 0b01110],
  "9": [0b01110, 0b10001, 0b10001, 0b01111, 0b00001, 0b00010, 0b01100],
  " ": [0, 0, 0, 0, 0, 0, 0],
  ".": [0, 0, 0, 0, 0, 0b01100, 0b01100],
  ",": [0, 0, 0, 0, 0b01100, 0b00100, 0b01000],
  "'": [0b00100, 0b00100, 0b01000, 0, 0, 0, 0],
  "-": [0, 0, 0, 0b01110, 0, 0, 0],
  ":": [0, 0b01100, 0, 0, 0, 0b01100, 0],
  ";": [0, 0b01100, 0, 0, 0b01100, 0b00100, 0b01000],
  "!": [0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0, 0b00100],
  "?": [0b01110, 0b10001, 0b00001, 0b00110, 0b00100, 0, 0b00100],
  "&": [0b01100, 0b10010, 0b10100, 0b01000, 0b10101, 0b10010, 0b01101],
  "%": [0b11001, 0b11010, 0b00010, 0b00100, 0b01000, 0b01011, 0b10011],
  "/": [0b00001, 0b00010, 0b00010, 0b00100, 0b01000, 0b01000, 0b10000],
  "(": [0b00010, 0b00100, 0b01000, 0b01000, 0b01000, 0b00100, 0b00010],
  ")": [0b01000, 0b00100, 0b00010, 0b00010, 0b00010, 0b00100, 0b01000],
  $: [0b00100, 0b01111, 0b10100, 0b01110, 0b00101, 0b11110, 0b00100],
  "+": [0, 0b00100, 0b00100, 0b11111, 0b00100, 0b00100, 0],
  "=": [0, 0, 0b11111, 0, 0b11111, 0, 0],
  '"': [0b01010, 0b01010, 0, 0, 0, 0, 0],
  "#": [0b01010, 0b01010, 0b11111, 0b01010, 0b11111, 0b01010, 0b01010],
  "*": [0, 0b00100, 0b10101, 0b01110, 0b10101, 0b00100, 0],
  "@": [0b01110, 0b10001, 0b10111, 0b10101, 0b10110, 0b10000, 0b01110],
  _: [0, 0, 0, 0, 0, 0, 0b11111],
  "[": [0b01110, 0b01000, 0b01000, 0b01000, 0b01000, 0b01000, 0b01110],
  "]": [0b01110, 0b00010, 0b00010, 0b00010, 0b00010, 0b00010, 0b01110],
  "|": [0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100],
};

// ---------------------------------------------------------------------------
// Canvas: a plain RGB buffer, white by default. All drawing clips to it.
// ---------------------------------------------------------------------------
const px = new Uint8Array(W * H * 3).fill(255);

function setPixel(x: number, y: number, r: number, g: number, b: number): void {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 3;
  px[i] = r;
  px[i + 1] = g;
  px[i + 2] = b;
}

function fillRect(x: number, y: number, w: number, h: number, r: number, g: number, b: number): void {
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = x; xx < x + w; xx++) setPixel(xx, yy, r, g, b);
  }
}

function frame(x: number, y: number, w: number, h: number): void {
  fillRect(x, y, w, 1, 0, 0, 0);
  fillRect(x, y + h - 1, w, 1, 0, 0, 0);
  fillRect(x, y, 1, h, 0, 0, 0);
  fillRect(x + w - 1, y, 1, h, 0, 0, 0);
}

// Map stray characters to the font set; anything else is dropped.
const SANITISE: Record<string, string> = {
  "’": "'",
  "‘": "'",
  "–": "-",
  "—": "-",
  "…": "...",
  "•": "|",
  Á: "A",
  É: "E",
  Í: "I",
  Ó: "O",
  Ú: "U",
  Ñ: "N",
  Ü: "U",
};

function clean(s: string): string {
  let out = "";
  for (const ch of s.toUpperCase()) {
    if (FONT[ch]) out += ch;
    else if (SANITISE[ch]) out += SANITISE[ch];
  }
  return out;
}

function textWidth(s: string, scale: number): number {
  return clean(s).length * 6 * scale;
}

// Draw text at (x, y); scale multiplies the 5x7 glyphs. Returns width drawn.
function drawText(s: string, x: number, y: number, scale: number, r: number, g: number, b: number): number {
  const str = clean(s);
  let cx = x;
  for (const ch of str) {
    const glyph = FONT[ch] || FONT[" "];
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 5; col++) {
        if ((glyph[row] >> (4 - col)) & 1) {
          fillRect(cx + col * scale, y + row * scale, scale, scale, r, g, b);
        }
      }
    }
    cx += 6 * scale;
  }
  return cx - x;
}

function drawCentred(s: string, y: number, scale: number, r: number, g: number, b: number): void {
  drawText(s, Math.floor((W - textWidth(s, scale)) / 2), y, scale, r, g, b);
}

// Word-wrap to lines of at most maxChars characters (whole words kept).
function wrap(s: string, maxChars: number): string[] {
  const words = clean(s).split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if (!word) continue;
    const next = line ? line + " " + word : word;
    if (next.length <= maxChars) {
      line = next;
    } else {
      if (line) lines.push(line);
      line = word.length > maxChars ? word.slice(0, maxChars) : word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Cut a line to maxChars, ending with "..." when cut.
function truncate(s: string, maxChars: number): string {
  const str = clean(s);
  if (str.length <= maxChars) return str;
  return str.slice(0, Math.max(0, maxChars - 3)) + "...";
}

// ---------------------------------------------------------------------------
// PNG encoder (colour type 2, 8-bit RGB, filter 0, zlib level 9). The deflate
// output is a pure function of the pixels, so the file is byte-identical
// on every run.
// ---------------------------------------------------------------------------
const CRC_TABLE: number[] = (() => {
  const table: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePNG(): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const raw = Buffer.alloc(H * (1 + W * 3));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 3)] = 0; // filter: none
    // Uint8Array has .set, not .copy: copy this scanline after the filter byte.
    raw.set(px.subarray(y * W * 3, (y + 1) * W * 3), y * (1 + W * 3) + 1);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", idat),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------------------------
// The day's news: 50 real stories reported on Wednesday 25 November 2026,
// across 10 regions. Headlines are short; captions are one factual sentence.
// ---------------------------------------------------------------------------
type Story = { region: string; code: string; headline: string; caption: string };

const REGION_COLOUR: Record<string, [number, number, number]> = {
  NA: [0, 60, 120],
  SA: [0, 120, 60],
  EU: [20, 40, 120],
  AF: [200, 110, 0],
  ME: [180, 0, 0],
  SAS: [120, 0, 120],
  EA: [0, 120, 120],
  SEA: [140, 90, 0],
  OC: [0, 140, 180],
  CA: [100, 100, 100],
};

const LEAD: Story = {
  region: "NORTH AMERICA",
  code: "NA",
  headline: "CIA, ODNI HACKED IN AI ATTACK",
  caption:
    "Hackers breached the agencies' unclassified open-source intelligence system; no classified data exposed.",
};

const TRIO: Story[] = [
  {
    region: "EUROPE",
    code: "EU",
    headline: "UKRAINE SINKS RUSSIAN WARSHIP OFF LIBYA",
    caption:
      "Kyiv says seven sea drones sank the corvette Merkury and hit cargo ship Angara near Benghazi.",
  },
  {
    region: "MIDDLE EAST",
    code: "ME",
    headline: "IRAN SAYS TANKERS HIT MINES",
    caption:
      "IRGC said two oil tankers struck naval mines and caught fire in the Strait of Hormuz.",
  },
  {
    region: "EAST ASIA",
    code: "EA",
    headline: "HUAWEI CONVICTED OF TRADE-SECRET THEFT",
    caption:
      "A New York jury found Huawei guilty of stealing US trade secrets but acquitted it of racketeering.",
  },
];

const GRID: Story[] = [
  { region: "NORTH AMERICA", code: "NA", headline: "US PROPOSES TARIFFS ON 14 PARTNERS", caption: "Washington proposes new duties up to 20-40% on China, EU and others over excess factory capacity." },
  { region: "NORTH AMERICA", code: "NA", headline: "IOWA ARMY DETONATES EXPLOSIVES STOCKPILE", caption: "US Army destroyed 68 barrels of unstable lead azide after evacuating Middletown, Iowa." },
  { region: "NORTH AMERICA", code: "NA", headline: "MISSISSIPPI PLANE CRASH KILLS SIX", caption: "Small plane crashed into the Gulf off Mississippi, killing an extended family of six." },
  { region: "NORTH AMERICA", code: "NA", headline: "ABREGO GARCIA ARRIVES IN SPAIN", caption: "Salvadoran man mistakenly deported by the US lands in Spain, ending his legal battle." },
  { region: "SOUTH AMERICA", code: "SA", headline: "CARTAGENA HOSTAGES FREED AFTER SIEGE", caption: "Colombian police stormed a supermarket, freeing 76 hostages held for 17 hours." },
  { region: "SOUTH AMERICA", code: "SA", headline: "BOLSONARO FLEES BRAZIL AFTER DEFEAT", caption: "Flavio Bolsonaro left Brazil for the US after losing Sunday's presidential election to Lula." },
  { region: "SOUTH AMERICA", code: "SA", headline: "POPE LEO RETURNS TO CHICLAYO", caption: "Pope Leo thanked crowds in his former Peruvian diocese a month after lung surgery." },
  { region: "SOUTH AMERICA", code: "SA", headline: "WORLD'S SOUTHERNMOST HOTEL OPENS", caption: "The 150-room Cormorant at 55 South opens in Puerto Williams, Chile." },
  { region: "EUROPE", code: "EU", headline: "UKRAINE CONFIRMS BALTIC CARGO SHIP STRIKE", caption: "Zelensky confirmed Saturday's drone strike on Russian cargo ship Sparta Two in the Gulf of Finland." },
  { region: "EUROPE", code: "EU", headline: "RUSSIA'S OWN DATA SHOWS 490,000 DEAD", caption: "Leaked Russian records analysed by the BBC show at least 490,334 soldiers killed in Ukraine." },
  { region: "EUROPE", code: "EU", headline: "FIVE RUSSIAN JETS HIT IN STRIKE", caption: "Ukraine says five Russian military jets were hit in an airfield strike." },
  { region: "EUROPE", code: "EU", headline: "EUROSTAR CANCELS PARIS-LONDON TRAINS", caption: "Eurostar cancelled services after staff staged an unannounced strike." },
  { region: "EUROPE", code: "EU", headline: "POUNDLAND COLLAPSES, 11,000 JOBS AT RISK", caption: "UK discount chain Poundland collapsed, putting about 11,000 jobs at risk." },
  { region: "EUROPE", code: "EU", headline: "HERA REVEALS GIANT ASTEROID CRATER", caption: "ESA's Hera released first images showing a stadium-sized crater on asteroid Dimorphos." },
  { region: "EUROPE", code: "EU", headline: "POPE LAMENTS COP31 CLIMATE FAILURE", caption: "Pope Leo XIV expressed concern over the COP31 talks collapsing without a fossil-fuel deal." },
  { region: "AFRICA", code: "AF", headline: "EBOLA WORKERS EVACUATED AMID CONGO FIGHTING", caption: "UN peacekeepers evacuated 10 health workers trapped three days in an Ituri hospital." },
  { region: "AFRICA", code: "AF", headline: "CAIRO FUEL TANKER FIRE KILLS 31", caption: "At least 31 people died in a massive fire after a fuel truck crashed on a Cairo highway." },
  { region: "AFRICA", code: "AF", headline: "SUDAN RSF DRONE STRIKES KILL 19", caption: "RSF drone strikes killed 19 civilians and wounded 20 in Sudan's Blue Nile state." },
  { region: "AFRICA", code: "AF", headline: "LIBYA VOWS REVENGE FOR SLAIN OFFICERS", caption: "Libya's eastern army vowed retaliation after two officers died from Ukraine's Benghazi strike." },
  { region: "AFRICA", code: "AF", headline: "SAUDI NATIONAL KIDNAPPED IN NIGER", caption: "Suspected Islamic State militants kidnapped a Saudi national in Niger at the weekend." },
  { region: "AFRICA", code: "AF", headline: "NOLLYWOOD STAR PETE EDOCHIE DIES", caption: "Veteran Nigerian actor Pete Edochie died aged 79 after a long illness." },
  { region: "MIDDLE EAST", code: "ME", headline: "HOUTHIS STRIKE SAUDI OIL REFINERY", caption: "Yemen's Houthis said they attacked Saudi Arabia's Ras Tanura oil refinery, causing fires." },
  { region: "MIDDLE EAST", code: "ME", headline: "SAUDI COALITION STRIKES HODEIDAH PORT", caption: "Saudi-led coalition struck Yemen's Hodeidah port and intercepted Houthi drones." },
  { region: "MIDDLE EAST", code: "ME", headline: "ISRAEL KILLS HAMAS SECURITY CHIEF", caption: "Israeli strike in Gaza City killed Hamas internal security chief Mohammad Abuelouf and his family." },
  { region: "MIDDLE EAST", code: "ME", headline: "JUDGES URGE DROPPING NETANYAHU CHARGES", caption: "Israeli judges recommended dropping the most serious charges against Prime Minister Netanyahu." },
  { region: "MIDDLE EAST", code: "ME", headline: "BAHRAIN BLAMES IRAN FOR FACILITY FIRE", caption: "Bahrain accused Iran of a strike that sparked a fire at an industrial facility." },
  { region: "SOUTH ASIA", code: "SAS", headline: "INDIA BARS 'COCKROACH' LEADER'S PASSPORT", caption: "India told protest movement leader Saurav Das not to use his passport pending a birthplace check." },
  { region: "SOUTH ASIA", code: "SAS", headline: "BANGLADESH RAISES GARMENT WAGE 36%", caption: "Bangladesh raised garment workers' minimum wage to Tk17,000 after weeks of protests." },
  { region: "SOUTH ASIA", code: "SAS", headline: "HASINA PLANS RETURN ON 16 DECEMBER", caption: "Ousted Bangladeshi leader Sheikh Hasina plans to return home on 16 December." },
  { region: "SOUTH ASIA", code: "SAS", headline: "INDIA'S FOOD PRICES KEEP RISING", caption: "The rising cost of putting food on the table is squeezing Indian households." },
  { region: "EAST ASIA", code: "EA", headline: "SHENZHOU 24 CARRIES PAKISTANI ASTRONAUT", caption: "China launched Shenzhou 24 with Pakistan's first astronaut, Muhammad Zeeshan Ali, aboard." },
  { region: "EAST ASIA", code: "EA", headline: "XI PROBES SHANGHAI CHIEF CHEN JINING", caption: "China's graft probe of Shanghai party chief Chen Jining upends the path to top leadership." },
  { region: "EAST ASIA", code: "EA", headline: "NORTH KOREA EXPELS SWISS DIPLOMAT", caption: "Pyongyang expelled the head of Switzerland's newly reopened diplomatic office in a sanctions row." },
  { region: "EAST ASIA", code: "EA", headline: "CHINA AI FAKES TARGET TAIWAN VOTE", caption: "A China-linked network used AI fakes to smear Taiwan election candidates, BBC Verify found." },
  { region: "SOUTHEAST ASIA", code: "SEA", headline: "HANOI HOTPOT BLAST KILLS SIX", caption: "An explosion at a Hanoi hotpot restaurant killed six people and injured more than a dozen." },
  { region: "SOUTHEAST ASIA", code: "SEA", headline: "THAILAND, MYANMAR TO MONITOR RIVERS", caption: "Thailand and Myanmar agreed six water-quality stations to probe heavy-metal river pollution." },
  { region: "SOUTHEAST ASIA", code: "SEA", headline: "INDONESIA RESCUES 72 ORANGUTANS", caption: "Indonesia rescued 72 orangutans from wildfires in West Kalimantan since August." },
  { region: "SOUTHEAST ASIA", code: "SEA", headline: "VIETNAM HIGH-SPEED RAIL EYES 2028", caption: "Vietnam targets late 2028 to start building its $67 billion North-South high-speed railway." },
  { region: "SOUTHEAST ASIA", code: "SEA", headline: "MALAYSIA TO REPATRIATE ROHINGYA", caption: "Malaysia will repatriate 6,803 Myanmar nationals next month despite an ICJ warning." },
  { region: "OCEANIA", code: "OC", headline: "SOLOMON ISLANDS PICKS AUSTRALIA PACT", caption: "Solomon Islands signed a security pact making Australia its defence partner of choice." },
  { region: "OCEANIA", code: "OC", headline: "AUSTRALIA PASSES BIG TECH DUTY", caption: "Australia's parliament passed a Digital Duty of Care law for Big Tech platforms." },
  { region: "OCEANIA", code: "OC", headline: "AUSTRALIAN INFLATION JUMPS TO 4.9%", caption: "Australia's inflation rose to 4.9%, squeezing households and young jobseekers." },
  { region: "OCEANIA", code: "OC", headline: "NZ PUBLIC RADIO STAFF STRIKE", caption: "RNZ union members walked out again as job cuts loom at New Zealand's public broadcaster." },
  { region: "CENTRAL ASIA", code: "CA", headline: "KYRGYZSTAN PLEDGES $10M FOR ISSYK-KUL", caption: "Kyrgyzstan pledged $10 million to the Issyk-Kul Trust Fund for environmental protection." },
  { region: "CENTRAL ASIA", code: "CA", headline: "CENTRAL ASIA-KOREA SUMMIT HELD", caption: "Turkmenistan's president joined the inaugural Central Asia-Republic of Korea summit." },
  { region: "CENTRAL ASIA", code: "CA", headline: "KYRGYZSTAN SHUTS RUSSIA-LINKED FIRMS", caption: "Kyrgyzstan closed companies amid fears they are helping Russia evade sanctions." },
];

// ---------------------------------------------------------------------------
// Layout: masthead, one lead story, three second stories, then a dense grid
// of the remaining 46 stories in two columns, and a footer ticker.
// ---------------------------------------------------------------------------

// Masthead.
drawCentred("THE WORLD IN ONE DAY", 8, 4, 0, 0, 0);
drawCentred("WEDNESDAY 25 NOVEMBER 2026", 44, 2, 0, 0, 0);
drawCentred("50 STORIES FROM 10 REGIONS", 62, 1, 80, 80, 80);
fillRect(8, 76, W - 16, 2, 0, 0, 0);

// Lead story: full-width panel with a black frame.
{
  const x = 8;
  const y = 84;
  const w = W - 16;
  const h = 96;
  frame(x, y, w, h);
  const [r, g, b] = REGION_COLOUR[LEAD.code];
  fillRect(x + 1, y + 1, 6, h - 2, r, g, b);
  drawText(LEAD.region, x + 14, y + 8, 1, r, g, b);
  const headlineLines = wrap(LEAD.headline, 52);
  headlineLines.slice(0, 1).forEach((line, i) => {
    drawText(line, x + 14, y + 24 + i * 30, 4, 0, 0, 0);
  });
  const captionLines = wrap(LEAD.caption, 158);
  captionLines.slice(0, 2).forEach((line, i) => {
    drawText(line, x + 14, y + 62 + i * 11, 1, 40, 40, 40);
  });
}

// Three second stories in a row.
{
  const y = 188;
  const h = 96;
  const gap = 8;
  const w = Math.floor((W - 16 - gap * 2) / 3);
  TRIO.forEach((story, i) => {
    const x = 8 + i * (w + gap);
    frame(x, y, w, h);
    const [r, g, b] = REGION_COLOUR[story.code];
    fillRect(x + 1, y + 1, 5, h - 2, r, g, b);
    drawText(story.region, x + 11, y + 7, 1, r, g, b);
    const headlineLines = wrap(story.headline, 26);
    headlineLines.slice(0, 2).forEach((line, j) => {
      drawText(line, x + 11, y + 22 + j * 16, 2, 0, 0, 0);
    });
    const captionLines = wrap(story.caption, 52);
    captionLines.slice(0, 2).forEach((line, j) => {
      drawText(line, x + 11, y + 58 + j * 10, 1, 40, 40, 40);
    });
  });
}

// Dense grid: the remaining 46 stories, two columns, 23 rows.
{
  const y0 = 292;
  const rowH = 29;
  const colW = 500;
  const gap = 8;
  GRID.forEach((story, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 8 + col * (colW + gap);
    const y = y0 + row * rowH;
    const [r, g, b] = REGION_COLOUR[story.code];
    fillRect(x, y + 3, 5, rowH - 7, r, g, b);
    const headMax = Math.floor((colW - 52) / 6);
    const capMax = Math.floor((colW - 22) / 6);
    drawText(story.code + " | " + truncate(story.headline, headMax - 5), x + 10, y + 4, 1, 0, 0, 0);
    drawText(truncate(story.caption, capMax), x + 10, y + 15, 1, 90, 90, 90);
    fillRect(x, y + rowH - 1, colW, 1, 220, 220, 220);
  });
}

// Footer ticker.
fillRect(8, 968, W - 16, 2, 0, 0, 0);
drawCentred("50 STORIES - 10 REGIONS - WEDNESDAY 25 NOVEMBER 2026", 980, 1, 0, 0, 0);
drawCentred("SOURCES: REUTERS, AP, BBC, CNN, AL JAZEERA, RFE/RL", 996, 1, 100, 100, 100);

// ---------------------------------------------------------------------------
// Write entry.png: to $MAKEFUN_OUTPUT_DIR when the harness sets it, else
// next to this program. Never __dirname (undefined under Node 22 ESM).
// ---------------------------------------------------------------------------
const outDir = process.env.MAKEFUN_OUTPUT_DIR || dirname(process.argv[1]);
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.png"), encodePNG());
