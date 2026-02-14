/**
 * Market Match — local dataset: price-guessing items with interchangeable image,
 * four multiple-choice options (one correct, three wrong).
 * @see docs/MARKET-MATCH-SURVEY-SHOWDOWN-SPEC.md
 */

export interface MarketMatchItem {
  id: string;
  title: string;
  year: number;
  priceUsd: number;
  unit: string;
  citation?: string;
  /** Optional image URL (e.g. Corvette, loaf of bread). Interchangeable per item. */
  imageUrl?: string;
  /** Four options shown to the player; one correct, three wrong. */
  options: [string, string, string, string];
  /** Index of the correct answer in options (0–3). */
  correctIndex: 0 | 1 | 2 | 3;
}

function fmt(price: number): string {
  const isSmall = price > 0 && price < 100 && Math.round(price * 100) !== price * 100;
  return '$' + price.toLocaleString(undefined, {
    minimumFractionDigits: isSmall || (price >= 0.01 && price < 10) ? 2 : 0,
    maximumFractionDigits: price >= 10 ? 0 : 2,
  });
}

/** Generate three plausible wrong prices for a given correct price. */
function wrongOptions(correct: number): [string, string, string] {
  const round = (n: number) => (correct >= 10 ? Math.round(n) : Math.round(n * 100) / 100);
  const a = round(correct * 0.65) || (correct >= 10 ? 1 : 0.01);
  const b = round(correct * 1.4);
  const c = round(correct * 0.48) || (correct >= 10 ? 1 : 0.01);
  const wrongs: number[] = [];
  for (const v of [a, b, c]) {
    const diff = Math.abs(v - correct);
    if ((correct >= 10 ? diff >= 1 : diff >= 0.01) && !wrongs.some((w) => Math.abs(w - v) < (correct >= 10 ? 0.5 : 0.01))) {
      wrongs.push(v);
    }
  }
  while (wrongs.length < 3) {
    const mult = [0.55, 1.35, 0.75][wrongs.length] ?? 0.6;
    const extra = round(correct * mult);
    if (Math.abs(extra - correct) >= (correct >= 10 ? 1 : 0.01) && !wrongs.some((w) => Math.abs(w - extra) < (correct >= 10 ? 0.5 : 0.01))) {
      wrongs.push(extra);
    } else {
      wrongs.push(round(correct + (wrongs.length + 1) * (correct >= 10 ? 500 : 0.5)));
    }
  }
  return [fmt(wrongs[0]!), fmt(wrongs[1]!), fmt(wrongs[2]!)];
}

// Deterministic shuffle for seed data so builds are consistent.
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = (seed + i * 7) % (i + 1);
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

function buildOptionsSeeded(priceUsd: number, seed: number): { options: [string, string, string, string]; correctIndex: 0 | 1 | 2 | 3 } {
  const correctStr = fmt(priceUsd);
  const [w1, w2, w3] = wrongOptions(priceUsd);
  const all = seededShuffle([correctStr, w1, w2, w3], seed);
  const correctIndex = all.indexOf(correctStr) as 0 | 1 | 2 | 3;
  return { options: [all[0]!, all[1]!, all[2]!, all[3]!], correctIndex };
}

export const MARKET_MATCH_DATASET: MarketMatchItem[] = [
  {
    id: '1',
    title: 'Gallon of gasoline (U.S. city average)',
    year: 1985,
    priceUsd: 1.2,
    unit: 'per gallon',
    citation: 'BLS CPI Average Price Data',
    imageUrl: undefined,
    ...buildOptionsSeeded(1.2, 1),
  },
  {
    id: '2',
    title: 'Movie ticket (U.S. average)',
    year: 1990,
    priceUsd: 4.22,
    unit: 'per ticket',
    citation: 'National Association of Theatre Owners',
    imageUrl: undefined,
    ...buildOptionsSeeded(4.22, 2),
  },
  {
    id: '3',
    title: 'White bread (1 lb)',
    year: 1980,
    priceUsd: 0.5,
    unit: 'per lb',
    citation: 'BLS CPI Average Price Data',
    imageUrl: undefined,
    ...buildOptionsSeeded(0.5, 3),
  },
  {
    id: '4',
    title: 'Gallon of whole milk',
    year: 1995,
    priceUsd: 2.5,
    unit: 'per gallon',
    citation: 'BLS CPI Average Price Data',
    imageUrl: undefined,
    ...buildOptionsSeeded(2.5, 4),
  },
  {
    id: '5',
    title: 'First-class postage stamp',
    year: 1975,
    priceUsd: 0.1,
    unit: 'per stamp',
    citation: 'USPS',
    imageUrl: undefined,
    ...buildOptionsSeeded(0.1, 5),
  },
  {
    id: '6',
    title: 'Dozen eggs (U.S. city average)',
    year: 2000,
    priceUsd: 0.98,
    unit: 'per dozen',
    citation: 'BLS CPI Average Price Data',
    imageUrl: undefined,
    ...buildOptionsSeeded(0.98, 6),
  },
  {
    id: '7',
    title: "McDonald's Big Mac",
    year: 1995,
    priceUsd: 2.32,
    unit: 'per item',
    citation: 'Big Mac index (historical)',
    imageUrl: undefined,
    ...buildOptionsSeeded(2.32, 7),
  },
  {
    id: '8',
    title: 'Average new car (U.S.)',
    year: 1985,
    priceUsd: 9200,
    unit: 'MSRP',
    citation: 'BEA / industry estimates',
    imageUrl: undefined,
    ...buildOptionsSeeded(9200, 8),
  },
  {
    id: '9',
    title: 'Gallon of gasoline (U.S. city average)',
    year: 2008,
    priceUsd: 3.27,
    unit: 'per gallon',
    citation: 'BLS CPI Average Price Data',
    imageUrl: undefined,
    ...buildOptionsSeeded(3.27, 9),
  },
  {
    id: '10',
    title: 'Movie ticket (U.S. average)',
    year: 2000,
    priceUsd: 5.39,
    unit: 'per ticket',
    citation: 'NATO',
    imageUrl: undefined,
    ...buildOptionsSeeded(5.39, 10),
  },
];

export function getMarketMatchItem(index: number): MarketMatchItem | null {
  if (index < 0 || index >= MARKET_MATCH_DATASET.length) return null;
  return MARKET_MATCH_DATASET[index] ?? null;
}
