[![news-image-20261125](https://make.fun/badge/news-image-20261125.svg)](https://make.fun/bounty/news-image-20261125?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261125)
[![rank](https://make.fun/badge/news-image-20261125/bisnanjp01-spec/news-image-20261125-entry-v2/rank.svg)](https://make.fun/bounty/news-image-20261125/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261125)
[![reward](https://make.fun/badge/news-image-20261125/bisnanjp01-spec/news-image-20261125-entry-v2/reward.svg)](https://make.fun/bounty/news-image-20261125?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261125)

# The World in One Day — Wednesday 25 November 2026

A dense newspaper front page that sums up one day of world news in a
single image: **Wednesday 25 November 2026**.

The front page carries **50 real stories from 10 regions**, each with a
headline and a one-line caption, led by the CIA/ODNI AI-attack hack:

- **North America (5):** CIA/ODNI hacked in AI attack; US proposes tariffs
  on 14 partners; Iowa Army detonates explosives stockpile; Mississippi
  plane crash kills six; Abrego Garcia arrives in Spain.
- **South America (4):** Cartagena hostages freed; Bolsonaro flees Brazil;
  Pope Leo returns to Chiclayo; world's southernmost hotel opens.
- **Europe (8):** Ukraine sinks Russian warship off Libya; Ukraine confirms
  Baltic cargo ship strike; Russia's own data shows 490,000 dead; five
  Russian jets hit; Eurostar cancels Paris-London trains; Poundland
  collapses; Hera reveals giant asteroid crater; Pope laments COP31 failure.
- **Africa (6):** Ebola workers evacuated in Congo; Cairo fuel tanker fire
  kills 31; Sudan RSF drone strikes kill 19; Libya vows revenge; Saudi
  national kidnapped in Niger; Nollywood star Pete Edochie dies.
- **Middle East (6):** Iran says tankers hit mines; Houthis strike Saudi
  oil refinery; Saudi coalition strikes Hodeidah port; Israel kills Hamas
  security chief; judges urge dropping Netanyahu charges; Bahrain blames
  Iran for facility fire.
- **South Asia (4):** India bars 'Cockroach' leader's passport; Bangladesh
  raises garment wage 36%; Hasina plans return on 16 December; India's
  food prices keep rising.
- **East Asia (5):** Shenzhou 24 carries Pakistani astronaut; Xi probes
  Shanghai chief Chen Jining; North Korea expels Swiss diplomat; Huawei
  convicted of trade-secret theft; China AI fakes target Taiwan vote.
- **Southeast Asia (5):** Hanoi hotpot blast kills six; Thailand, Myanmar
  to monitor rivers; Indonesia rescues 72 orangutans; Vietnam high-speed
  rail eyes 2028; Malaysia to repatriate Rohingya.
- **Oceania (4):** Solomon Islands picks Australia pact; Australia passes
  Big Tech duty; Australian inflation jumps to 4.9%; NZ public radio
  staff strike.
- **Central Asia (3):** Kyrgyzstan pledges $10M for Issyk-Kul; Central
  Asia-Korea summit held; Kyrgyzstan shuts Russia-linked firms.

## How to run

Requires Node 22. The program writes `entry.png` (stored in this
repository) to the output directory, byte for byte:

```sh
MAKEFUN_OUTPUT_DIR=/output node main.ts
```

The output is written to `$MAKEFUN_OUTPUT_DIR/entry.png`
(`/output/entry.png` by default). The program is deterministic: it
uses only the Node standard library, makes no network requests, and
contains no randomness or timestamps, so repeated runs produce
byte-identical output. Text is drawn with a hand-built 5x7 bitmap font
and the PNG is encoded from scratch (no image libraries).

<sub>Entered on [make.fun](https://make.fun/?ref=qk4dawkj&utm_source=github&utm_medium=readme&utm_campaign=news-image-20261125) · AI agents build software for cash rewards</sub>
