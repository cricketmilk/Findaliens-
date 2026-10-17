// carbon-class-ventures.mjs — the ventures cards, the live counter and the
// forecast for Carbon Class, built from the audited research by id.
// Imported by build-carbon-class.mjs. Every number below is read from an
// audited item and checked against that item's own quote: a figure the
// quote does not contain stops the build.

const has = (f, ...needles) => { for (const n of needles) if (!f.quote.replace(/\s+/g, " ").includes(n)) throw new Error(`"${f.id}": the quote does not contain "${n}"`); return f; };
const input = (name, value, f, extra = "") => ({ name, value, src: `${f.sources[0].publisher}${extra}`, url: f.sources[0].url, quote: f.quote });

export function build({ need, card, impacts, ventures }) {
  const pick = (...ids) => ids.map((id) => card(need(id)));

  // ---- the live counter: the latest world total, split by the WIR shares ----
  const ghg = has(need("unep-ghg-2024"), "57.7");
  const wir = has(need("wir2022-percap-by-group"), "47.6%", "12%");
  const counter = {
    globalGt: 57.7, globalYear: 2024, globalSrc: ghg.sources[0].publisher, globalUrl: ghg.sources[0].url,
    topShare: 47.6, bottomShare: 12, shareYear: 2019, shareSrc: "World Inequality Report 2022", shareUrl: wir.sources[0].url,
  };

  // ---- 04 the ventures ----
  const dc24 = has(need("iea-dc-electricity-2024"), "415");
  const dc25 = has(need("iea-dc-electricity-2025"), "485 TWh", "950 TWh");
  const dc35 = has(need("iea-dc-2035-base"), "1 200 TWh");
  const l19 = has(need("launches-2019"), "103");
  const l25 = has(need("launches-2025"), "329");
  const portfolio = [...impacts.filter((f) => f.section === "investments").map((f) => f.id), "oxfam-carbon-billionaires-2022", "oxfam-high-impact-60pct", "urgewald-fossil-holdings-2026", "urgewald-vanguard-blackrock"]
    // the same Oxfam 2025 figures arrived from both research passes: once
    .filter((id) => id !== "oxfam-308-billionaires-2024" && id !== "oxfam-investment-vs-lifestyle");
  const ventureCards = [
    { id: "ai", name: "AI DATA CENTRES", hot: true, tag: "The fastest-growing source of new electricity demand, and the companies of the richest people on earth building it out, much of it on gas.",
      unit: "TWh (IEA; hollow = projected, Base Case)",
      series: [
        { year: 2024, value: 415, src: dc24.sources[0].publisher },
        { year: 2025, value: 485, src: dc25.sources[0].publisher },
        { year: 2030, value: 950, projected: true, src: dc25.sources[0].publisher },
        { year: 2035, value: 1200, projected: true, src: dc35.sources[0].publisher },
      ],
      facts: pick("iea-dc-electricity-2025", "iea-dc-co2-today-2035", "iea-dc-co2-2035-update", "iea-dc-gas-2030", "iea-onsite-gas-2030", "doe-us-dc-2023-2028", "msft-emissions-fy25", "google-emissions-2024", "google-electricity-2025", "amazon-emissions-2025", "xai-memphis-35-turbines", "xai-memphis-permit-15", "xai-southaven-41-turbines", "iea-meta-entergy-gas") },
    { id: "jets", name: "PRIVATE JETS", hot: true, tag: "Measured from transponder data across the whole private fleet.",
      facts: pick("pa-emissions-2023", "pa-growth-2019-2023", "pa-flights-2023", "pa-hour-vs-person-year", "oxfam-billionaire-jets", "bizjet-deliveries-forecast") },
    { id: "yachts", name: "SUPERYACHTS", tag: "The single largest item in a billionaire’s personal footprint, where it has been measured.",
      facts: pick("superyacht-7020t", "abramovich-33859t", "oxfam-billionaire-yachts", "superyacht-fleet-2025") },
    { id: "space", name: "ROCKETS & SPACE TOURISM", tag: "The worry here is not CO₂ but soot injected straight into the stratosphere, where it stays for years.",
      unit: "launches a year (2019: documented launches; 2025: orbital launch attempts)",
      series: [{ year: 2019, value: 103, src: l19.sources[0].publisher }, { year: 2025, value: 329, src: l25.sources[0].publisher }],
      facts: pick("launches-2025", "starlink-launched-2025", "rocket-bc-current-1000t", "space-tourism-scenario", "rocket-bc-500x", "rocket-bc-10gg-warming", "space-flight-75t") },
    { id: "crypto", name: "CRYPTO MINING", tag: "Survey-based estimates; no agency publishes a projection.",
      facts: pick("cambridge-btc-2025", "eia-us-crypto-share") },
    { id: "portfolios", name: "THE PORTFOLIOS", hot: true, tag: "The inequality studies count a share of a company’s emissions against the people who own it. For the richest, this is most of their footprint.",
      facts: pick(...portfolio) },
  ];

  // Three headline figures per venture: a value the quote contains, and a
  // short label that says no more than the claim does. The rest of the
  // venture's findings are listed beneath them.
  const HEADS = {
    ai: [["iea-dc-electricity-2025", "485 TWh", "of electricity for data centres in 2025, heading for about 950 TWh by 2030", ["485 TWh", "950 TWh"]],
         ["iea-dc-co2-2035-update", "≈350 Mt", "of CO₂ a year from data centres by 2035, double today", ["350 million tonnes"]],
         ["xai-southaven-41-turbines", "41 turbines", "of gas power, 1.2 GW, permitted for xAI’s data centres in Mississippi", ["41", "1.2"]]],
    jets: [["pa-emissions-2023", "15.6 Mt", "of CO₂ from private jets in 2023, about 3.6 t per flight", ["15.6", "3.6"]],
           ["pa-growth-2019-2023", "+46%", "private-jet emissions from 2019 to 2023", ["46.0%"]],
           ["oxfam-billionaire-jets", "184 flights", "a year on average for 50 of the richest billionaires: 300 years of an average person’s carbon", ["184", "300 years"]]],
    yachts: [["superyacht-7020t", "7,020 t", "of CO₂ a year from one superyacht with crew, helipad, submarines and pools", ["7,020"]],
             ["oxfam-billionaire-yachts", "860 years", "of an average person’s emissions from one year of a billionaire’s yachts (average of 50)", ["860"]],
             ["superyacht-fleet-2025", "6,022", "yachts over 30 metres in service in early 2025; 228 more delivered in 2024", ["6,022", "228"]]],
    space: [["launches-2025", "329", "orbital launch attempts in 2025", ["329"]],
            ["rocket-bc-current-1000t", "≈1,000 t", "of rocket soot emitted a year now (NOAA)", ["1000"]],
            ["rocket-bc-500x", "≈500×", "the warming effect per tonne of rocket soot, against soot from the ground or from planes", ["500"]]],
    crypto: [["cambridge-btc-2025", "138 TWh", "of electricity a year for Bitcoin, about 0.5% of the world’s", ["138", "0.5%"]],
             ["cambridge-btc-2025", "39.8 Mt", "CO₂e a year from Bitcoin mining", ["39.8"]],
             ["eia-us-crypto-share", "0.6–2.3%", "of all US electricity went to Bitcoin mining in 2023 (EIA)", ["0.6%", "2.3%"]]],
    portfolios: [["chancel-investments-70pct-top1", "70%", "of the top 1%’s emissions come from what they own, up from 58% in 1990", ["70%", "58%"]],
                 ["oxfam-308-billionaires-586mt", "586 Mt", "CO₂e from the investments of 308 billionaires in 2024, more than 118 countries combined", ["586", "118"]],
                 ["urgewald-fossil-holdings-2026", "$6.5 trillion", "held by institutional investors in fossil-fuel shares and bonds", ["6.5 trillion"]]],
  };
  for (const v of ventureCards) {
    const heads = HEADS[v.id] || [];
    v.heads = heads.map(([id, big, label, needles]) => { has(need(id), ...needles); const c = card(need(id)); return { ...c, big, label }; });
    const used = new Set(heads.map((h) => need(h[0]).quote));
    v.facts = v.facts.filter((f) => !used.has(f.quote));
  }

  // ---- 05 the forecast ----
  const dcNow = has(need("iea-dc-co2-today-2035"), "180 million tonnes", "300 Mt in the Base Case by 2035", "500 Mt in the Lift-Off Case");
  const dcUpd = has(need("iea-dc-co2-2035-update"), "350 million tonnes in 2035");
  const dcRange = has(need("iea-dc-2035-range"), "700 TWh");
  has(dc35, "1 200 TWh");
  const dcLow2035 = Math.round(700 * 300 / 1200);       // Headwinds electricity at the 2025 edition's Base Case intensity for 2035
  const pa = has(need("pa-emissions-2023"), "15.6");
  const paGrowth = has(need("pa-growth-2019-2023"), "46.0%", "9.93% per year");
  const hw = has(need("bizjet-deliveries-forecast"), "3%");
  const paHighRate = 0.0993;                            // the paper's own yearly rate for 2019-2023
  const btc = has(need("cambridge-btc-2025"), "39.8");
  const mcc = has(need("mcc-226-per-mt"), "226");
  const tcre = has(need("ipcc-tcre-0.45"), "0.45");
  const grow = (v, r, years) => Math.round(v * Math.pow(1 + r, years) * 10) / 10;

  const forecast = {
    from: 2024, to: 2050, horizon: 2035, cumFrom: 2025,
    caseNames: { low: "LOW · HEADWINDS / NO GROWTH", base: "BASE · IEA / INDUSTRY OUTLOOK", high: "HIGH · LIFT-OFF / 2019–23 TREND" },
    caseNote: "Each case uses one source's own scenario, never a mix of editions.",
    caption: "Stacked: the chosen case. Dithered band: everything between the low and the high case. Past 2035 no published scenario exists; the hatched area extends each stream at its last growth rate, halved every ten years, and is shown only so the shape is visible.",
    streams: [
      { name: "AI data centres (electricity)", note: "IEA: 180 Mt (2024) → 350 Mt (2035, central, 2026 update); 500 Mt Lift-Off; low = Headwinds 700 TWh at the Base Case intensity",
        cases: { low: [[2024, 180], [2035, dcLow2035]], base: [[2024, 180], [2035, 350]], high: [[2024, 180], [2035, 500]] } },
      { name: "Private jets", note: "15.6 Mt (2023). Low: no growth. Base: Honeywell's 3%/yr. High: the 2019–23 rate (9.93%/yr, Gössling et al.) continues",
        cases: { low: [[2023, 15.6], [2035, 15.6]], base: [[2023, 15.6], [2035, grow(15.6, 0.03, 12)]], high: [[2023, 15.6], [2035, grow(15.6, paHighRate, 12)]] } },
      { name: "Bitcoin mining", note: "39.8 Mt CO₂e (Cambridge, 2025), held flat in every case: no projection is published",
        cases: { low: [[2025, 39.8], [2035, 39.8]], base: [[2025, 39.8], [2035, 39.8]], high: [[2025, 39.8], [2035, 39.8]] } },
    ],
    measured: [],
    deathsPerMt: 226,
    deathsNote: "Bressler’s central mortality cost of carbon, 226 deaths per million tonnes (for emissions in 2020, in a high-warming baseline); applied as a scale, not a count",
    tcre: 0.45,
    tcreNote: "IPCC best estimate, 0.45 °C per 1,000 Gt CO₂ (likely 0.27–0.63 °C)",
    formula: [
      "For each stream and case: anchor values at years, from the sources below.",
      "Between anchors: v(y) = v0 × (v1 / v0)^((y − y0)/(y1 − y0))   (a constant yearly growth rate)",
      `Past ${2035}: the last segment's yearly rate, halved every ten years (extrapolation, shown hatched).`,
      `Data centres, low case: 700 TWh × (300 Mt ÷ 1,200 TWh) = ${dcLow2035} Mt in 2035 (Headwinds electricity at the 2025 edition's Base Case intensity).`,
      "Private jets, high case: the 9.93% a year Gössling et al. measured for 2019–2023, continued.",
      "Excess deaths = cumulative Mt × 226.     Added warming (°C) = cumulative Gt × 0.45 ÷ 1,000.",
      "Not counted: rocket soot (not CO₂; see the card above), superyachts (no fleet total is published), and investment portfolios (they own the companies above, so adding them would count twice).",
    ].join("\n"),
    inputs: [
      input("Data-centre emissions, 2024", "180 Mt CO₂", dcNow),
      input("Data-centre emissions, 2035, central (2026 update)", "350 Mt CO₂", dcUpd),
      input("Data-centre emissions, 2035, Lift-Off / Base (2025 edition)", "500 / 300 Mt CO₂", dcNow),
      input("Data-centre electricity, 2035, low end of range", "700 TWh", dcRange),
      input("Data-centre electricity, 2035, Base Case", "1,200 TWh", dc35),
      input("Private aviation emissions, 2023", "15.6 Mt CO₂", pa),
      input("Private aviation emissions growth, 2019–2023", "+46.0% (9.93% a year)", paGrowth),
      input("Business-jet delivery growth, next decade", "3% a year", hw),
      input("Bitcoin network emissions", "39.8 Mt CO₂e", btc),
      input("Mortality cost of carbon", "226 deaths / Mt", mcc),
      input("Warming per 1,000 Gt CO₂ (TCRE)", "0.45 °C", tcre),
    ],
  };

  return { counter, ventures: ventureCards, forecast };
}

export function forecastFacts({ need, card }) {
  return ["oxfam-top1-2030-70t", "oxfam-top1-share-2030", "oxfam-top-cuts-2030", "unep-ghg-2024", "unep-warming-current-policy", "unep-cuts-2035", "ipcc-cuts-2030-2035", "gcb-total-2025", "gcb-remaining-budget", "oxfam-top1-heat-deaths", "mcc-226-per-mt"]
    .map((id) => card(need(id)));
}
