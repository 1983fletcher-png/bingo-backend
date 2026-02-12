/**
 * Market Match MVP — local dataset of price-guessing items.
 * @see docs/MARKET-MATCH-SURVEY-SHOWDOWN-SPEC.md
 */

export interface MarketMatchItem {
  id: string;
  title: string;
  year: number;
  priceUsd: number;
  unit: string;
  citation?: string;
}

export const MARKET_MATCH_DATASET: MarketMatchItem[] = [
  { id: '1', title: 'Gallon of gasoline (U.S. city average)', year: 1985, priceUsd: 1.20, unit: 'per gallon', citation: 'BLS CPI Average Price Data' },
  { id: '2', title: 'Movie ticket (U.S. average)', year: 1990, priceUsd: 4.22, unit: 'per ticket', citation: 'National Association of Theatre Owners' },
  { id: '3', title: 'White bread (1 lb)', year: 1980, priceUsd: 0.50, unit: 'per lb', citation: 'BLS CPI Average Price Data' },
  { id: '4', title: 'Gallon of whole milk', year: 1995, priceUsd: 2.50, unit: 'per gallon', citation: 'BLS CPI Average Price Data' },
  { id: '5', title: 'First-class postage stamp', year: 1975, priceUsd: 0.10, unit: 'per stamp', citation: 'USPS' },
  { id: '6', title: 'Dozen eggs (U.S. city average)', year: 2000, priceUsd: 0.98, unit: 'per dozen', citation: 'BLS CPI Average Price Data' },
  { id: '7', title: 'McDonald\'s Big Mac', year: 1995, priceUsd: 2.32, unit: 'per item', citation: 'Big Mac index (historical)' },
  { id: '8', title: 'Average new car (U.S.)', year: 1985, priceUsd: 9200, unit: 'MSRP', citation: 'BEA / industry estimates' },
  { id: '9', title: 'Gallon of gasoline (U.S. city average)', year: 2008, priceUsd: 3.27, unit: 'per gallon', citation: 'BLS CPI Average Price Data' },
  { id: '10', title: 'Movie ticket (U.S. average)', year: 2000, priceUsd: 5.39, unit: 'per ticket', citation: 'NATO' },
];

export function getMarketMatchItem(index: number): MarketMatchItem | null {
  if (index < 0 || index >= MARKET_MATCH_DATASET.length) return null;
  return MARKET_MATCH_DATASET[index] ?? null;
}
