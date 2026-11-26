// Atlas demo data. Visa details are SAMPLE content for the theme demo, not real advice.
export const HOME = { name: 'Dubai', ll: [55.27, 25.2] };

export const DEST = [
  { id: 'uk', img: 'london', city: 'London', country: 'United Kingdom', code: 'GB', ll: [-0.13, 51.5], visa: 'Standard Visitor', days: '15 working days', from: 690, docs: 7, hue: [214, 340], note: 'Up to 6 months per visit' },
  { id: 'schengen', img: 'paris', city: 'Paris', country: 'Schengen Area', code: 'EU', ll: [2.35, 48.86], visa: 'Schengen Short-Stay', days: '10–15 days', from: 520, docs: 8, hue: [228, 270], note: '90 days in any 180' },
  { id: 'usa', img: 'new-york', city: 'New York', country: 'United States', code: 'US', ll: [-74, 40.7], visa: 'B1/B2 Visitor', days: 'Interview based', from: 950, docs: 6, hue: [205, 12], note: 'Interview at the embassy' },
  { id: 'japan', img: 'tokyo', city: 'Tokyo', country: 'Japan', code: 'JP', ll: [139.7, 35.7], visa: 'Tourist (Single entry)', days: '5–7 working days', from: 450, docs: 6, hue: [345, 20], note: 'Stay up to 15–90 days' },
  { id: 'turkey', img: 'istanbul', city: 'Istanbul', country: 'Türkiye', code: 'TR', ll: [28.97, 41], visa: 'e-Visa', days: '1–2 days', from: 220, docs: 3, hue: [0, 28], note: 'Online, no embassy visit' },
  { id: 'canada', img: 'toronto', city: 'Toronto', country: 'Canada', code: 'CA', ll: [-79.4, 43.7], visa: 'Visitor Visa (TRV)', days: '4–8 weeks', from: 880, docs: 9, hue: [355, 200], note: 'Biometrics required' },
  { id: 'australia', img: 'sydney', city: 'Sydney', country: 'Australia', code: 'AU', ll: [151.2, -33.9], visa: 'Visitor (subclass 600)', days: '2–4 weeks', from: 760, docs: 7, hue: [190, 40], note: 'Fully online application' },
  { id: 'indonesia', img: 'bali', city: 'Bali', country: 'Indonesia', code: 'ID', ll: [115.2, -8.6], visa: 'e-Visa on Arrival', days: '1–3 days', from: 260, docs: 3, hue: [165, 45], note: '30 days, extendable once' },
  { id: 'azerbaijan', img: 'baku', city: 'Baku', country: 'Azerbaijan', code: 'AZ', ll: [49.9, 40.4], visa: 'ASAN e-Visa', days: '3 working days', from: 180, docs: 2, hue: [195, 140], note: 'Single entry, 30 days' },
];

export const NATIONS = ['India', 'Pakistan', 'Philippines', 'Sri Lanka', 'Egypt', 'Bangladesh', 'Nigeria', 'United Kingdom', 'Other'];
// Sample exemptions so the checker shows different outcomes.
export const FREE = { 'United Kingdom': ['schengen', 'japan', 'turkey', 'indonesia'] };

export const TYPES = [
  ['Tourist', 'Holidays, family visits and short trips.', ['Passport valid 6+ months', 'Bank statements (3–6 months)', 'Hotel and flight booking', 'UAE residence visa copy']],
  ['Business', 'Meetings, conferences and trade fairs.', ['Invitation letter', 'Company NOC', 'Trade licence copy', 'Bank statements']],
  ['Student', 'Courses, degrees and exchange programmes.', ['Offer letter', 'Proof of funds', 'Academic certificates', 'Health insurance']],
  ['Family', 'Visiting relatives or travelling together.', ['Invitation from host', 'Proof of relationship', 'Host\'s ID or residence', 'Travel insurance']],
];

export const CHECK = ['Passport (valid 6+ months)', 'Passport photo (white background)', 'UAE residence visa', 'Emirates ID', 'Bank statement, 6 months', 'Salary certificate / NOC', 'Flight reservation', 'Hotel booking', 'Travel insurance'];
