/**
 * Page & Menu Builder – shared types and scrape result shape.
 */

export interface ScrapeResult {
  logoUrl?: string | null;
  colors?: string[];
  title?: string | null;
  description?: string | null;
  siteUrl?: string;
  foodMenuUrl?: string | null;
  drinkMenuUrl?: string | null;
  eventsUrl?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  error?: string;
}

export interface PageBrand {
  logoUrl?: string;
  title?: string;
  subtitle?: string;
  accentColor?: string;
}

export type MenuType = 'food' | 'drinks' | 'specials' | 'custom';
export type MenuTheme = 'classic' | 'warm' | 'casual' | 'modern' | 'coastal';
export type OutputFormat = 'print' | 'tv' | 'phone' | 'instagram' | 'facebook';

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price?: string;
}

export interface MenuSection {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface MenuBuilderState {
  type: 'menu';
  menuType: MenuType;
  sections: MenuSection[];
  theme: MenuTheme;
  format: OutputFormat;
  brand: PageBrand;
}

const DEFAULT_SECTIONS_FOOD: Omit<MenuSection, 'id'>[] = [
  { name: 'Starters', items: [{ id: '1', name: 'House salad', description: 'Mixed greens, vinaigrette', price: '8' }] },
  { name: 'Mains', items: [{ id: '2', name: 'Grilled salmon', description: 'With seasonal vegetables', price: '22' }] },
  { name: 'Sides', items: [{ id: '3', name: 'Roasted potatoes', price: '6' }] },
  { name: 'Desserts', items: [{ id: '4', name: 'Chocolate cake', price: '9' }] },
];
const DEFAULT_SECTIONS_DRINKS: Omit<MenuSection, 'id'>[] = [
  { name: 'Beer', items: [{ id: '1', name: 'House lager', price: '6' }] },
  { name: 'Wine', items: [{ id: '2', name: 'House red / white', price: '8' }] },
  { name: 'Cocktails', items: [{ id: '3', name: 'Classic margarita', price: '12' }] },
  { name: 'Non-alcoholic', items: [{ id: '4', name: 'Soda, juice, water', price: '3' }] },
];
const DEFAULT_SECTIONS_SPECIALS: Omit<MenuSection, 'id'>[] = [
  { name: "Today's specials", items: [{ id: '1', name: 'Soup of the day', price: '7' }, { id: '2', name: "Chef's special", description: 'Ask your server', price: 'MP' }] },
];
const DEFAULT_SECTIONS_CUSTOM: Omit<MenuSection, 'id'>[] = [
  { name: 'Section 1', items: [{ id: '1', name: 'Item one', price: '' }] },
];

function addIds<T extends { items: { id?: string }[] }>(section: T, si: number): T & { id: string } {
  const id = `s-${si}-${Date.now()}`;
  const items = section.items.map((it, ii) => ({ ...it, id: it.id || `i-${si}-${ii}` }));
  return { ...section, id, items } as T & { id: string };
}

export function getDefaultSections(menuType: MenuType): MenuSection[] {
  const raw =
    menuType === 'food' ? DEFAULT_SECTIONS_FOOD
    : menuType === 'drinks' ? DEFAULT_SECTIONS_DRINKS
    : menuType === 'specials' ? DEFAULT_SECTIONS_SPECIALS
    : DEFAULT_SECTIONS_CUSTOM;
  return raw.map((s, i) => addIds(s, i));
}

export interface EventBuilderState {
  type: 'event';
  brand: PageBrand;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  description: string;
  imageUrl?: string;
  ctaLabel: string;
  ctaUrl?: string;
  theme: MenuTheme;
  format: OutputFormat;
}

export const DEFAULT_EVENT_STATE: EventBuilderState = {
  type: 'event',
  brand: { title: 'Your venue', accentColor: '#e94560' },
  eventTitle: 'Theme Night',
  eventDate: '',
  eventTime: '8:00 PM',
  description: 'Join us for a special evening. Good vibes, great company.',
  ctaLabel: 'Learn more',
  ctaUrl: '',
  theme: 'classic',
  format: 'print',
};

export interface LiveMusicBuilderState {
  type: 'live-music';
  brand: PageBrand;
  performerName: string;
  dateTime: string;
  blurb: string;
  imageUrl?: string;
  moreEventsUrl?: string;
  theme: MenuTheme;
  format: OutputFormat;
}

export const DEFAULT_LIVE_MUSIC_STATE: LiveMusicBuilderState = {
  type: 'live-music',
  brand: { title: 'Live at the House', accentColor: '#e94560' },
  performerName: 'Live Music Tonight',
  dateTime: 'Tonight at 9',
  blurb: 'Acoustic set — no cover. Full bar and kitchen.',
  moreEventsUrl: '',
  theme: 'classic',
  format: 'print',
};

export interface WelcomeBuilderState {
  type: 'welcome';
  brand: PageBrand;
  headline: string;
  hours: string;
  wifiName?: string;
  wifiPassword?: string;
  houseRules: string;
  contact: string;
  links: { label: string; url: string }[];
  theme: MenuTheme;
  format: OutputFormat;
}

export const DEFAULT_WELCOME_STATE: WelcomeBuilderState = {
  type: 'welcome',
  brand: { title: 'Welcome', accentColor: '#e94560' },
  headline: "We're glad you're here",
  hours: 'Mon–Thu 11am–10pm · Fri–Sat 11am–11pm · Sun 10am–9pm',
  wifiName: '',
  wifiPassword: '',
  houseRules: 'Please be kind to staff and other guests. No outside food or drink.',
  contact: 'Questions? Ask any team member.',
  links: [],
  theme: 'classic',
  format: 'print',
};

export type PageBuilderDocument =
  | MenuBuilderState
  | EventBuilderState
  | LiveMusicBuilderState
  | WelcomeBuilderState;
