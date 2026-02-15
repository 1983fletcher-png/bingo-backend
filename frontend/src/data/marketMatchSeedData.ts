/**
 * Market Match — seed data for ~100 items. Verifiable historical prices; images PD/CC/Unsplash.
 * BLS = U.S. Bureau of Labor Statistics CPI Average Price Data. NATO = National Association of Theatre Owners.
 */

export type MarketMatchAnswerMode = 'multiple_choice' | 'closest_to';

export interface MarketMatchSeed {
  id: string;
  title: string;
  question?: string;
  year: number;
  priceUsd: number;
  unit: string;
  citation: string;
  /** Image for "then" — era-appropriate (PD/CC/Unsplash); matches item and period. */
  imageUrl?: string;
  /** How players answer: four options, or type a number (closest wins). */
  answerMode?: MarketMatchAnswerMode;
  /** Approximate price for same/similar item today (for then-and-now comparison). */
  priceTodayUsd?: number;
  /** Optional "now" image for then-and-now comparison (modern equivalent). */
  imageUrlToday?: string;
  /** Short comparison note, e.g. "Similar model today" (optional). */
  funFact?: string;
}

/** Era-appropriate images: Wikimedia (PD/CC), Unsplash. Keyed by category and decade band where available. */
const IMG: Record<string, string> = {
  // Gas — vintage pump for older decades, modern for 2000s+
  gas: 'https://images.unsplash.com/photo-1627856015091-0f182b9b1f1d?w=600&q=80',
  gas_70s: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Old_Gas_Pump.jpg/640px-Old_Gas_Pump.jpg',
  gas_80s: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Old_Gas_Pump.jpg/640px-Old_Gas_Pump.jpg',
  gas_90s: 'https://images.unsplash.com/photo-1627856015091-0f182b9b1f1d?w=600&q=80',
  // Bread — era variants (vintage loaf / classic)
  bread: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80',
  bread_70s: 'https://images.unsplash.com/photo-1549931319-a0e2a7d15ab2?w=600&q=80',
  bread_80s: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80',
  bread_90s: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=600&q=80',
  // Milk
  milk: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80',
  milk_70s: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&q=80',
  milk_80s: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80',
  // Eggs
  eggs: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&q=80',
  // Stamps — period-accurate where we have them
  stamp: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/US_10cent_1975_stamp.jpg/440px-US_10cent_1975_stamp.jpg',
  stamp_75: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/US_10cent_1975_stamp.jpg/440px-US_10cent_1975_stamp.jpg',
  stamp_80s: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/US_22cent_1988_stamp.jpg/440px-US_22cent_1988_stamp.jpg',
  stamp_90s: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/US_10cent_1975_stamp.jpg/440px-US_10cent_1975_stamp.jpg',
  // Movie / cinema
  movie: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80',
  movie_70s: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=80',
  movie_80s: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80',
  movie_90s: 'https://images.unsplash.com/photo-1595766613215-fe76b7220f58?w=600&q=80',
  // Cars — specific where we have (1968 Corvette), else era
  car: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&q=80',
  car_68: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/1968_Chevrolet_Corvette_Stingray.jpg/640px-1968_Chevrolet_Corvette_Stingray.jpg',
  car_70s: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/1968_Chevrolet_Corvette_Stingray.jpg/640px-1968_Chevrolet_Corvette_Stingray.jpg',
  car_80s: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&q=80',
  car_90s: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=600&q=80',
  car_2000s: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&q=80',
  // Burger / Big Mac
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
  burger_80s: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
  // Other food & drink
  coffee: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
  pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80',
  banana: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&q=80',
  chicken: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600&q=80',
  soda: 'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?w=600&q=80',
  popcorn: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=600&q=80',
  iceCream: 'https://images.unsplash.com/photo-1560008581-09ca1ccbda5a?w=600&q=80',
  candy: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  // Goods
  newspaper: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80',
  record: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80',
  jeans: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80',
  sneakers: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
  camera: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80',
  microwave: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Microwave_oven_1970s.jpg/640px-Microwave_oven_1970s.jpg',
};

/** Pick era-appropriate image key by year band. */
function era(y: number): '70s' | '80s' | '90s' | '2000s' {
  if (y < 1980) return '70s';
  if (y < 1990) return '80s';
  if (y < 2000) return '90s';
  return '2000s';
}

function img(category: string, year: number): string {
  const e = era(year);
  const key = `${category}_${e}`;
  return IMG[key] ?? IMG[category] ?? IMG.bread;
}

export const MARKET_MATCH_SEED: MarketMatchSeed[] = [
  { id: '1', title: 'Gallon of gasoline (U.S. city average)', question: 'How much was a gallon of gas?', year: 1985, priceUsd: 1.2, unit: 'per gallon', citation: 'BLS CPI Average Price Data', imageUrl: img('gas', 1985), answerMode: 'closest_to', priceTodayUsd: 3.5 },
  { id: '2', title: 'Movie ticket (U.S. average)', question: 'How much was a movie ticket?', year: 1990, priceUsd: 4.22, unit: 'per ticket', citation: 'National Association of Theatre Owners', imageUrl: img('movie', 1990), priceTodayUsd: 12 },
  { id: '3', title: 'White bread (1 lb)', question: 'How much did a pound of white bread cost?', year: 1980, priceUsd: 0.5, unit: 'per lb', citation: 'BLS CPI Average Price Data', imageUrl: img('bread', 1980), answerMode: 'closest_to', priceTodayUsd: 1.8 },
  { id: '4', title: 'Gallon of whole milk', question: 'How much was a gallon of whole milk?', year: 1995, priceUsd: 2.5, unit: 'per gallon', citation: 'BLS CPI Average Price Data', imageUrl: img('milk', 1995), answerMode: 'closest_to', priceTodayUsd: 3.8 },
  { id: '5', title: 'First-class postage stamp', question: 'How much did a first-class stamp cost?', year: 1975, priceUsd: 0.1, unit: 'per stamp', citation: 'USPS', imageUrl: IMG.stamp_75, answerMode: 'closest_to', priceTodayUsd: 0.68 },
  { id: '6', title: 'Dozen eggs (U.S. city average)', question: 'How much was a dozen eggs?', year: 2000, priceUsd: 0.98, unit: 'per dozen', citation: 'BLS CPI Average Price Data', imageUrl: img('eggs', 2000), answerMode: 'closest_to', priceTodayUsd: 2.9 },
  { id: '7', title: "McDonald's Big Mac", question: "How much did a Big Mac cost?", year: 1995, priceUsd: 2.32, unit: 'per item', citation: 'Big Mac index (historical)', imageUrl: img('burger', 1995), priceTodayUsd: 5.99 },
  { id: '8', title: 'Average new car (U.S.)', question: 'What was the average price of a new car?', year: 1985, priceUsd: 9200, unit: 'MSRP', citation: 'BEA / industry estimates', imageUrl: img('car', 1985), priceTodayUsd: 48000, funFact: 'Similar new car today' },
  { id: '9', title: 'Gallon of gasoline (U.S. city average)', question: 'How much was a gallon of gas?', year: 2008, priceUsd: 3.27, unit: 'per gallon', citation: 'BLS CPI Average Price Data', imageUrl: img('gas', 2008), answerMode: 'closest_to', priceTodayUsd: 3.5 },
  { id: '10', title: 'Movie ticket (U.S. average)', question: 'How much was a movie ticket?', year: 2000, priceUsd: 5.39, unit: 'per ticket', citation: 'NATO', imageUrl: img('movie', 2000), priceTodayUsd: 12 },
  { id: '11', title: '1968 Chevrolet Corvette (base)', question: 'How much did a brand-new 1968 Corvette cost?', year: 1968, priceUsd: 4320, unit: 'MSRP (convertible)', citation: 'Corvette factory pricing / Hagerty', imageUrl: IMG.car_68, priceTodayUsd: 70000, funFact: 'New Corvette today (similar idea)' },
  { id: '12', title: 'Gallon of gasoline', question: 'How much was a gallon of gas?', year: 1975, priceUsd: 0.57, unit: 'per gallon', citation: 'BLS CPI Average Price Data', imageUrl: img('gas', 1975), answerMode: 'closest_to', priceTodayUsd: 3.5 },
  { id: '13', title: 'White bread (1 lb)', question: 'How much did a pound of white bread cost?', year: 1970, priceUsd: 0.24, unit: 'per lb', citation: 'BLS CPI Average Price Data', imageUrl: img('bread', 1970) },
  { id: '14', title: 'Dozen eggs', question: 'How much was a dozen eggs?', year: 1985, priceUsd: 0.82, unit: 'per dozen', citation: 'BLS CPI Average Price Data', imageUrl: img('eggs', 1985), answerMode: 'closest_to', priceTodayUsd: 2.9 },
  { id: '15', title: 'Gallon of whole milk', question: 'How much was a gallon of milk?', year: 1980, priceUsd: 1.6, unit: 'per gallon', citation: 'BLS CPI Average Price Data', imageUrl: img('milk', 1980), answerMode: 'closest_to', priceTodayUsd: 3.8 },
  { id: '16', title: 'First-class postage stamp', question: 'How much did a first-class stamp cost?', year: 1980, priceUsd: 0.15, unit: 'per stamp', citation: 'USPS', imageUrl: img('stamp', 1980), priceTodayUsd: 0.68 },
  { id: '17', title: 'Movie ticket (U.S. average)', question: 'How much was a movie ticket?', year: 1980, priceUsd: 2.69, unit: 'per ticket', citation: 'NATO', imageUrl: img('movie', 1980), priceTodayUsd: 12 },
  { id: '18', title: 'Pound of ground beef', question: 'How much did a pound of ground beef cost?', year: 1990, priceUsd: 1.9, unit: 'per lb', citation: 'BLS CPI Average Price Data', imageUrl: img('chicken', 1990), priceTodayUsd: 5 },
  { id: '19', title: 'Pound of bananas', question: 'How much did a pound of bananas cost?', year: 1985, priceUsd: 0.43, unit: 'per lb', citation: 'BLS CPI Average Price Data', imageUrl: img('banana', 1985), priceTodayUsd: 0.62 },
  { id: '20', title: 'Gallon of gasoline', question: 'How much was a gallon of gas?', year: 2000, priceUsd: 1.51, unit: 'per gallon', citation: 'BLS CPI Average Price Data', imageUrl: img('gas', 2000), answerMode: 'closest_to', priceTodayUsd: 3.5 },
  { id: '21', title: 'Dozen eggs', question: 'How much was a dozen eggs?', year: 1995, priceUsd: 0.93, unit: 'per dozen', citation: 'BLS CPI Average Price Data', imageUrl: img('eggs', 1995), answerMode: 'closest_to', priceTodayUsd: 2.9 },
  { id: '22', title: 'White bread (1 lb)', question: 'How much did a pound of white bread cost?', year: 1990, priceUsd: 0.7, unit: 'per lb', citation: 'BLS CPI Average Price Data', imageUrl: img('bread', 1990) },
  { id: '23', title: 'Average new car (U.S.)', question: 'What was the average price of a new car?', year: 1990, priceUsd: 16100, unit: 'MSRP', citation: 'BEA / industry estimates', imageUrl: img('car', 1990), priceTodayUsd: 48000 },
  { id: '24', title: 'Movie ticket (U.S. average)', question: 'How much was a movie ticket?', year: 1995, priceUsd: 4.35, unit: 'per ticket', citation: 'NATO', imageUrl: img('movie', 1995), priceTodayUsd: 12 },
  { id: '25', title: "McDonald's Big Mac", question: "How much did a Big Mac cost?", year: 2000, priceUsd: 2.51, unit: 'per item', citation: 'Big Mac index', imageUrl: img('burger', 2000), priceTodayUsd: 5.99 },
  { id: '26', title: 'First-class postage stamp', question: 'How much did a first-class stamp cost?', year: 1990, priceUsd: 0.25, unit: 'per stamp', citation: 'USPS', imageUrl: img('stamp', 1990), answerMode: 'closest_to', priceTodayUsd: 0.68 },
  { id: '27', title: 'Gallon of whole milk', question: 'How much was a gallon of milk?', year: 2000, priceUsd: 2.78, unit: 'per gallon', citation: 'BLS CPI Average Price Data', imageUrl: img('milk', 2000), answerMode: 'closest_to', priceTodayUsd: 3.8 },
  { id: '28', title: 'Gallon of gasoline', question: 'How much was a gallon of gas?', year: 1970, priceUsd: 0.36, unit: 'per gallon', citation: 'BLS CPI Average Price Data', imageUrl: img('gas', 1970), answerMode: 'closest_to', priceTodayUsd: 3.5 },
  { id: '29', title: 'Dozen eggs', question: 'How much was a dozen eggs?', year: 1975, priceUsd: 0.77, unit: 'per dozen', citation: 'BLS CPI Average Price Data', imageUrl: img('eggs', 1975), answerMode: 'closest_to', priceTodayUsd: 2.9 },
  { id: '30', title: 'Movie ticket (U.S. average)', question: 'How much was a movie ticket?', year: 1975, priceUsd: 2.03, unit: 'per ticket', citation: 'NATO', imageUrl: img('movie', 1975), priceTodayUsd: 12 },
  { id: '31', title: 'White bread (1 lb)', question: 'How much did a pound of white bread cost?', year: 1995, priceUsd: 0.75, unit: 'per lb', citation: 'BLS CPI Average Price Data', imageUrl: img('bread', 1995), priceTodayUsd: 1.8 },
  { id: '32', title: 'Average new car (U.S.)', question: 'What was the average price of a new car?', year: 1995, priceUsd: 20500, unit: 'MSRP', citation: 'BEA / industry estimates', imageUrl: img('car', 1995), priceTodayUsd: 48000 },
  { id: '33', title: 'First-class postage stamp', question: 'How much did a first-class stamp cost?', year: 2000, priceUsd: 0.33, unit: 'per stamp', citation: 'USPS', imageUrl: img('stamp', 2000), priceTodayUsd: 0.68 },
  { id: '34', title: 'Gallon of gasoline', question: 'How much was a gallon of gas?', year: 2010, priceUsd: 2.79, unit: 'per gallon', citation: 'BLS CPI Average Price Data', imageUrl: img('gas', 2010), answerMode: 'closest_to', priceTodayUsd: 3.5 },
  { id: '35', title: 'Dozen eggs', question: 'How much was a dozen eggs?', year: 2010, priceUsd: 1.66, unit: 'per dozen', citation: 'BLS CPI Average Price Data', imageUrl: img('eggs', 2010), answerMode: 'closest_to', priceTodayUsd: 2.9 },
  { id: '36', title: 'Movie ticket (U.S. average)', question: 'How much was a movie ticket?', year: 2010, priceUsd: 7.89, unit: 'per ticket', citation: 'NATO', imageUrl: img('movie', 2010), priceTodayUsd: 12 },
  { id: '37', title: "McDonald's Big Mac", question: "How much did a Big Mac cost?", year: 2010, priceUsd: 3.73, unit: 'per item', citation: 'Big Mac index', imageUrl: img('burger', 2010), priceTodayUsd: 5.99 },
  { id: '38', title: 'Gallon of whole milk', question: 'How much was a gallon of milk?', year: 2010, priceUsd: 3.32, unit: 'per gallon', citation: 'BLS CPI Average Price Data', imageUrl: img('milk', 2010), priceTodayUsd: 3.8 },
  { id: '39', title: 'White bread (1 lb)', question: 'How much did a pound of white bread cost?', year: 2000, priceUsd: 0.93, unit: 'per lb', citation: 'BLS CPI Average Price Data', imageUrl: img('bread', 2000) },
  { id: '40', title: 'Average new car (U.S.)', question: 'What was the average price of a new car?', year: 2000, priceUsd: 24750, unit: 'MSRP', citation: 'BEA / industry estimates', imageUrl: img('car', 2000), priceTodayUsd: 48000 },
  { id: '41', title: 'First-class postage stamp', question: 'How much did a first-class stamp cost?', year: 1985, priceUsd: 0.22, unit: 'per stamp', citation: 'USPS', imageUrl: img('stamp', 1985), answerMode: 'closest_to', priceTodayUsd: 0.68 },
  { id: '42', title: 'Pound of ground beef', question: 'How much did a pound of ground beef cost?', year: 1985, priceUsd: 1.85, unit: 'per lb', citation: 'BLS CPI Average Price Data', imageUrl: img('chicken', 1985), priceTodayUsd: 5 },
  { id: '43', title: 'Pound of bananas', question: 'How much did a pound of bananas cost?', year: 1990, priceUsd: 0.49, unit: 'per lb', citation: 'BLS CPI Average Price Data', imageUrl: img('banana', 1990), priceTodayUsd: 0.62 },
  { id: '44', title: 'Cup of coffee (restaurant)', question: 'How much was a cup of coffee?', year: 1990, priceUsd: 1.25, unit: 'per cup', citation: 'Industry estimates', imageUrl: img('coffee', 1990), answerMode: 'closest_to', priceTodayUsd: 3 },
  { id: '45', title: 'Large cheese pizza', question: 'How much did a large cheese pizza cost?', year: 1985, priceUsd: 8.99, unit: 'per pizza', citation: 'Industry estimates', imageUrl: img('pizza', 1985), priceTodayUsd: 15 },
  { id: '46', title: '12-oz can of soda', question: 'How much did a can of soda cost?', year: 1990, priceUsd: 0.5, unit: 'per can', citation: 'BLS / industry', imageUrl: img('soda', 1990), priceTodayUsd: 1.5 },
  { id: '47', title: 'Gallon of gasoline', question: 'How much was a gallon of gas?', year: 1980, priceUsd: 1.19, unit: 'per gallon', citation: 'BLS CPI Average Price Data', imageUrl: img('gas', 1980), answerMode: 'closest_to', priceTodayUsd: 3.5 },
  { id: '48', title: 'Dozen eggs', question: 'How much was a dozen eggs?', year: 1980, priceUsd: 0.84, unit: 'per dozen', citation: 'BLS CPI Average Price Data', imageUrl: img('eggs', 1980), answerMode: 'closest_to', priceTodayUsd: 2.9 },
  { id: '49', title: 'Movie ticket (U.S. average)', question: 'How much was a movie ticket?', year: 1985, priceUsd: 3.55, unit: 'per ticket', citation: 'NATO', imageUrl: img('movie', 1985), priceTodayUsd: 12 },
  { id: '50', title: 'White bread (1 lb)', question: 'How much did a pound of white bread cost?', year: 1985, priceUsd: 0.58, unit: 'per lb', citation: 'BLS CPI Average Price Data', imageUrl: img('bread', 1985) },
  { id: '51', title: 'Gallon of whole milk', question: 'How much was a gallon of milk?', year: 1985, priceUsd: 2.24, unit: 'per gallon', citation: 'BLS CPI Average Price Data', imageUrl: img('milk', 1985), priceTodayUsd: 3.8 },
  { id: '52', title: 'Average new car (U.S.)', question: 'What was the average price of a new car?', year: 1980, priceUsd: 7500, unit: 'MSRP', citation: 'BEA / industry estimates', imageUrl: img('car', 1980), priceTodayUsd: 48000 },
  { id: '53', title: 'First-class postage stamp', question: 'How much did a first-class stamp cost?', year: 1970, priceUsd: 0.06, unit: 'per stamp', citation: 'USPS', imageUrl: IMG.stamp_75, answerMode: 'closest_to', priceTodayUsd: 0.68 },
  { id: '54', title: 'Pound of ground beef', question: 'How much did a pound of ground beef cost?', year: 2000, priceUsd: 2.09, unit: 'per lb', citation: 'BLS CPI Average Price Data', imageUrl: img('chicken', 2000), priceTodayUsd: 5 },
  { id: '55', title: 'Pound of bananas', question: 'How much did a pound of bananas cost?', year: 2000, priceUsd: 0.51, unit: 'per lb', citation: 'BLS CPI Average Price Data', imageUrl: img('banana', 2000), priceTodayUsd: 0.62 },
  { id: '56', title: 'Cup of coffee (restaurant)', question: 'How much was a cup of coffee?', year: 2000, priceUsd: 1.75, unit: 'per cup', citation: 'Industry estimates', imageUrl: img('coffee', 2000), priceTodayUsd: 3 },
  { id: '57', title: 'Large cheese pizza', question: 'How much did a large cheese pizza cost?', year: 1995, priceUsd: 10.99, unit: 'per pizza', citation: 'Industry estimates', imageUrl: img('pizza', 1995), priceTodayUsd: 15 },
  { id: '58', title: 'Movie theater popcorn (medium)', question: 'How much was a medium popcorn?', year: 1990, priceUsd: 2.5, unit: 'per item', citation: 'Industry estimates', imageUrl: img('popcorn', 1990), priceTodayUsd: 8 },
  { id: '59', title: 'Candy bar (standard)', question: 'How much did a candy bar cost?', year: 1985, priceUsd: 0.4, unit: 'per bar', citation: 'BLS / industry', imageUrl: img('candy', 1985), priceTodayUsd: 1.5 },
  { id: '60', title: 'Pint of ice cream', question: 'How much did a pint of ice cream cost?', year: 1990, priceUsd: 2.2, unit: 'per pint', citation: 'BLS CPI Average Price Data', imageUrl: img('iceCream', 1990), priceTodayUsd: 5 },
  { id: '61', title: 'Sunday newspaper', question: 'How much did a Sunday paper cost?', year: 1990, priceUsd: 1.5, unit: 'per copy', citation: 'Industry estimates', imageUrl: img('newspaper', 1990), priceTodayUsd: 3 },
  { id: '62', title: 'Vinyl LP album', question: 'How much did a new LP record cost?', year: 1980, priceUsd: 8.99, unit: 'per album', citation: 'Industry estimates', imageUrl: img('record', 1980), priceTodayUsd: 25 },
  { id: '63', title: 'Pair of jeans (Levi\'s 501)', question: 'How much did a pair of Levi\'s 501s cost?', year: 1985, priceUsd: 25, unit: 'per pair', citation: 'Industry estimates', imageUrl: img('jeans', 1985), priceTodayUsd: 70 },
  { id: '64', title: 'Pair of athletic sneakers', question: 'How much did a pair of sneakers cost?', year: 1990, priceUsd: 45, unit: 'per pair', citation: 'Industry estimates', imageUrl: img('sneakers', 1990), priceTodayUsd: 120 },
  { id: '65', title: '35mm film camera (basic)', question: 'How much did a basic 35mm camera cost?', year: 1985, priceUsd: 120, unit: 'MSRP', citation: 'Industry estimates', imageUrl: img('camera', 1985), priceTodayUsd: 0, funFact: 'Phone camera replaced it' },
  { id: '66', title: 'Microwave oven (countertop)', question: 'How much did a countertop microwave cost?', year: 1990, priceUsd: 150, unit: 'MSRP', citation: 'Industry estimates', imageUrl: img('microwave', 1990), priceTodayUsd: 80 },
  { id: '67', title: 'Gallon of gasoline', question: 'How much was a gallon of gas?', year: 1995, priceUsd: 1.15, unit: 'per gallon', citation: 'BLS CPI Average Price Data', imageUrl: img('gas', 1995), answerMode: 'closest_to', priceTodayUsd: 3.5 },
  { id: '68', title: 'Dozen eggs', question: 'How much was a dozen eggs?', year: 1970, priceUsd: 0.53, unit: 'per dozen', citation: 'BLS CPI Average Price Data', imageUrl: img('eggs', 1970), answerMode: 'closest_to', priceTodayUsd: 2.9 },
  { id: '69', title: 'White bread (1 lb)', question: 'How much did a pound of white bread cost?', year: 1975, priceUsd: 0.36, unit: 'per lb', citation: 'BLS CPI Average Price Data', imageUrl: img('bread', 1975), answerMode: 'closest_to', priceTodayUsd: 1.8 },
  { id: '70', title: 'Gallon of whole milk', question: 'How much was a gallon of milk?', year: 1970, priceUsd: 1.15, unit: 'per gallon', citation: 'BLS CPI Average Price Data', imageUrl: img('milk', 1970), answerMode: 'closest_to', priceTodayUsd: 3.8 },
  { id: '71', title: 'Movie ticket (U.S. average)', question: 'How much was a movie ticket?', year: 1970, priceUsd: 1.55, unit: 'per ticket', citation: 'NATO', imageUrl: img('movie', 1970), priceTodayUsd: 12 },
  { id: '72', title: 'First-class postage stamp', question: 'How much did a first-class stamp cost?', year: 1995, priceUsd: 0.32, unit: 'per stamp', citation: 'USPS', imageUrl: img('stamp', 1995), priceTodayUsd: 0.68 },
  { id: '73', title: "McDonald's Big Mac", question: "How much did a Big Mac cost?", year: 1985, priceUsd: 1.6, unit: 'per item', citation: 'Big Mac index', imageUrl: img('burger', 1985), priceTodayUsd: 5.99 },
  { id: '74', title: 'Average new car (U.S.)', question: 'What was the average price of a new car?', year: 1975, priceUsd: 4500, unit: 'MSRP', citation: 'BEA / industry estimates', imageUrl: img('car', 1975), priceTodayUsd: 48000 },
  { id: '75', title: 'Gallon of gasoline', question: 'How much was a gallon of gas?', year: 1968, priceUsd: 0.34, unit: 'per gallon', citation: 'BLS CPI Average Price Data', imageUrl: img('gas', 1968), answerMode: 'closest_to', priceTodayUsd: 3.5 },
  { id: '76', title: 'Dozen eggs', question: 'How much was a dozen eggs?', year: 1990, priceUsd: 0.99, unit: 'per dozen', citation: 'BLS CPI Average Price Data', imageUrl: img('eggs', 1990), answerMode: 'closest_to', priceTodayUsd: 2.9 },
  { id: '77', title: 'White bread (1 lb)', question: 'How much did a pound of white bread cost?', year: 2005, priceUsd: 1.03, unit: 'per lb', citation: 'BLS CPI Average Price Data', imageUrl: img('bread', 2005), answerMode: 'closest_to', priceTodayUsd: 1.8 },
  { id: '78', title: 'Gallon of whole milk', question: 'How much was a gallon of milk?', year: 2005, priceUsd: 3.14, unit: 'per gallon', citation: 'BLS CPI Average Price Data', imageUrl: img('milk', 2005), answerMode: 'closest_to', priceTodayUsd: 3.8 },
  { id: '79', title: 'Movie ticket (U.S. average)', question: 'How much was a movie ticket?', year: 2005, priceUsd: 6.41, unit: 'per ticket', citation: 'NATO', imageUrl: img('movie', 2005), priceTodayUsd: 12 },
  { id: '80', title: 'First-class postage stamp', question: 'How much did a first-class stamp cost?', year: 2005, priceUsd: 0.37, unit: 'per stamp', citation: 'USPS', imageUrl: img('stamp', 2005), priceTodayUsd: 0.68 },
  { id: '81', title: "McDonald's Big Mac", question: "How much did a Big Mac cost?", year: 1980, priceUsd: 1.1, unit: 'per item', citation: 'Big Mac index', imageUrl: img('burger', 1980), priceTodayUsd: 5.99 },
  { id: '82', title: 'Average new car (U.S.)', question: 'What was the average price of a new car?', year: 1970, priceUsd: 3500, unit: 'MSRP', citation: 'BEA / industry estimates', imageUrl: img('car', 1970), priceTodayUsd: 48000 },
  { id: '83', title: 'Pound of ground beef', question: 'How much did a pound of ground beef cost?', year: 1995, priceUsd: 1.95, unit: 'per lb', citation: 'BLS CPI Average Price Data', imageUrl: img('chicken', 1995), priceTodayUsd: 5 },
  { id: '84', title: 'Pound of bananas', question: 'How much did a pound of bananas cost?', year: 1995, priceUsd: 0.48, unit: 'per lb', citation: 'BLS CPI Average Price Data', imageUrl: img('banana', 1995), priceTodayUsd: 0.62 },
  { id: '85', title: 'Cup of coffee (restaurant)', question: 'How much was a cup of coffee?', year: 1995, priceUsd: 1.5, unit: 'per cup', citation: 'Industry estimates', imageUrl: img('coffee', 1995), priceTodayUsd: 3 },
  { id: '86', title: 'Large cheese pizza', question: 'How much did a large cheese pizza cost?', year: 2000, priceUsd: 12.99, unit: 'per pizza', citation: 'Industry estimates', imageUrl: img('pizza', 2000), priceTodayUsd: 15 },
  { id: '87', title: 'Movie theater popcorn (medium)', question: 'How much was a medium popcorn?', year: 2000, priceUsd: 4, unit: 'per item', citation: 'Industry estimates', imageUrl: img('popcorn', 2000), priceTodayUsd: 8 },
  { id: '88', title: 'Candy bar (standard)', question: 'How much did a candy bar cost?', year: 1990, priceUsd: 0.5, unit: 'per bar', citation: 'BLS / industry', imageUrl: img('candy', 1990), priceTodayUsd: 1.5 },
  { id: '89', title: 'Pint of ice cream', question: 'How much did a pint of ice cream cost?', year: 2000, priceUsd: 2.8, unit: 'per pint', citation: 'BLS CPI Average Price Data', imageUrl: img('iceCream', 2000), priceTodayUsd: 5 },
  { id: '90', title: 'Sunday newspaper', question: 'How much did a Sunday paper cost?', year: 2000, priceUsd: 2, unit: 'per copy', citation: 'Industry estimates', imageUrl: img('newspaper', 2000), priceTodayUsd: 3 },
  { id: '91', title: 'Vinyl LP album', question: 'How much did a new LP record cost?', year: 1985, priceUsd: 9.99, unit: 'per album', citation: 'Industry estimates', imageUrl: img('record', 1985), priceTodayUsd: 25 },
  { id: '92', title: 'Pair of jeans (Levi\'s 501)', question: 'How much did a pair of Levi\'s 501s cost?', year: 1990, priceUsd: 30, unit: 'per pair', citation: 'Industry estimates', imageUrl: img('jeans', 1990), priceTodayUsd: 70 },
  { id: '93', title: 'Pair of athletic sneakers', question: 'How much did a pair of sneakers cost?', year: 1995, priceUsd: 55, unit: 'per pair', citation: 'Industry estimates', imageUrl: img('sneakers', 1995), priceTodayUsd: 120 },
  { id: '94', title: 'Gallon of gasoline', question: 'How much was a gallon of gas?', year: 2012, priceUsd: 3.64, unit: 'per gallon', citation: 'BLS CPI Average Price Data', imageUrl: img('gas', 2012), answerMode: 'closest_to', priceTodayUsd: 3.5 },
  { id: '95', title: 'Dozen eggs', question: 'How much was a dozen eggs?', year: 2015, priceUsd: 2.47, unit: 'per dozen', citation: 'BLS CPI Average Price Data', imageUrl: img('eggs', 2015), answerMode: 'closest_to', priceTodayUsd: 2.9 },
  { id: '96', title: 'Movie ticket (U.S. average)', question: 'How much was a movie ticket?', year: 2015, priceUsd: 8.43, unit: 'per ticket', citation: 'NATO', imageUrl: img('movie', 2015), priceTodayUsd: 12 },
  { id: '97', title: "McDonald's Big Mac", question: "How much did a Big Mac cost?", year: 2015, priceUsd: 4.79, unit: 'per item', citation: 'Big Mac index', imageUrl: img('burger', 2015), priceTodayUsd: 5.99 },
  { id: '98', title: 'First-class postage stamp', question: 'How much did a first-class stamp cost?', year: 2015, priceUsd: 0.49, unit: 'per stamp', citation: 'USPS', imageUrl: img('stamp', 2015), answerMode: 'closest_to', priceTodayUsd: 0.68 },
  { id: '99', title: 'Average new car (U.S.)', question: 'What was the average price of a new car?', year: 2010, priceUsd: 28500, unit: 'MSRP', citation: 'BEA / industry estimates', imageUrl: img('car', 2010), priceTodayUsd: 48000 },
  { id: '100', title: 'Gallon of whole milk', question: 'How much was a gallon of milk?', year: 2015, priceUsd: 3.23, unit: 'per gallon', citation: 'BLS CPI Average Price Data', imageUrl: img('milk', 2015), answerMode: 'closest_to', priceTodayUsd: 3.8 },
];
