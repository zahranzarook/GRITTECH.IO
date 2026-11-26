import { MENU as EMBER } from '../restaurant/menu.js';

const P = '#f4efe7';
const d = (id, name, price, desc, art, pop = false) => ({ id, name, price, desc, art: { seed: id, plate: P, ...art }, pop });

export const CATS = [['all', 'All', '✦'], ['grill', 'Grill', '🔥'], ['sushi', 'Sushi', '🍣'], ['pizza', 'Pizza', '🍕'], ['healthy', 'Healthy', '🥗'], ['dessert', 'Dessert', '🍰']];

export const RESTAURANTS = [
  { id: 'ember', name: 'Ember & Salt', cat: 'grill', cuisine: 'Wood-fire grill', rating: 4.8, reviews: '2.1k', time: '30–40', fee: 9, color: '#e8572a', promo: '20% off first order',
    menu: [['Popular', EMBER.filter(m => m.sig || m.id === 'shish')], ['Small plates', EMBER.filter(m => m.cat === 'small')], ['From the fire', EMBER.filter(m => m.cat === 'fire')], ['Drinks', EMBER.filter(m => m.cat === 'drinks')]]
      .map(([t, l]) => [t, l.map(m => ({ id: m.id, name: m.name, price: m.price, desc: m.desc, art: m.art, pop: !!m.sig }))]) },
  { id: 'sakura', name: 'Sakura Hand Roll', cat: 'sushi', cuisine: 'Japanese · Sushi', rating: 4.7, reviews: '980', time: '25–35', fee: 7, color: '#d94a64', promo: 'Free delivery',
    menu: [['Rolls', [
      d('salmon-roll', 'Salmon avocado roll', 46, '8 pieces, sesame, spicy mayo.', { plate: '#1f1d1c', rim: 'rgba(255,255,255,.04)', items: [{ shape: 'ring', color: '#f3efe6', n: 8, size: 10, r: 40 }, { shape: 'dot', color: '#f07b4f', n: 8, size: 5, r: 40 }, { shape: 'dot', color: '#8fbf5a', n: 4, size: 6, r: 14 }] }, true),
      d('tuna-nigiri', 'Tuna nigiri', 38, '4 pieces of bluefin tuna on rice.', { plate: '#e9e3d8', items: [{ shape: 'leaf', color: '#f4f0e8', n: 4, size: 20, r: 34 }, { shape: 'leaf', color: '#c3394a', n: 4, size: 16, r: 34 }] }),
      d('dragon', 'Dragon roll', 58, 'Prawn tempura, eel, avocado, unagi glaze.', { plate: '#1f1d1c', rim: 'rgba(255,255,255,.04)', items: [{ shape: 'slice', color: '#8fbf5a', n: 8, size: 11, r: 44 }, { shape: 'drizzle', color: '#4a2a1a', n: 3, size: 9, r: 30 }, { shape: 'dot', color: '#f3efe6', n: 20, size: 1.4, r: 50 }] }, true),
    ]], ['Bowls', [
      d('poke', 'Salmon poke bowl', 52, 'Sushi rice, salmon, edamame, mango.', { bowl: true, plate: '#f2ede4', base: '#f6f2ea', baseR: 62, items: [{ shape: 'cube', color: '#f07b4f', n: 7, size: 7, r: 30 }, { shape: 'dot', color: '#8fbf5a', n: 10, size: 4, r: 50 }, { shape: 'cube', color: '#f2b33d', n: 5, size: 6, r: 48 }] }),
      d('miso', 'Miso soup', 16, 'Tofu, wakame, spring onion.', { bowl: true, plate: '#2a2420', rim: '#3a302a', base: '#c99a5a', baseR: 60, items: [{ shape: 'cube', color: '#f6f2ea', n: 6, size: 5, r: 34 }, { shape: 'ring', color: '#6fa35a', n: 8, size: 3, r: 40 }] }),
    ]]] },
  { id: 'nonna', name: 'Pizza Nonna', cat: 'pizza', cuisine: 'Neapolitan pizza', rating: 4.6, reviews: '1.4k', time: '20–30', fee: 5, color: '#d8432f', promo: 'Buy 1 get 1 Tue',
    menu: [['Pizza', [
      d('margherita', 'Margherita', 42, 'San Marzano, fior di latte, basil.', { plate: '#e9dfd0', base: '#f0d9a8', baseR: 80, items: [{ shape: 'dot', color: '#c9372b', n: 1, size: 66, center: true }, { shape: 'dot', color: '#fbf6ea', n: 9, size: 9, r: 50 }, { shape: 'leaf', color: '#3f7a32', n: 7, size: 7, r: 52 }] }, true),
      d('pepperoni', 'Pepperoni', 52, 'Spicy pepperoni, mozzarella, chilli honey.', { plate: '#e9dfd0', base: '#f0d9a8', baseR: 80, items: [{ shape: 'dot', color: '#d2512f', n: 1, size: 66, center: true }, { shape: 'dot', color: '#f3d58a', n: 14, size: 7, r: 54 }, { shape: 'dot', color: '#a3241c', n: 12, size: 8, r: 54 }] }, true),
      d('funghi', 'Truffle funghi', 58, 'Mushrooms, truffle cream, parmesan.', { plate: '#e9dfd0', base: '#f0d9a8', baseR: 80, items: [{ shape: 'dot', color: '#f3ead4', n: 1, size: 66, center: true }, { shape: 'leaf', color: '#a7835a', n: 12, size: 9, r: 52 }, { shape: 'dot', color: '#3a3028', n: 20, size: 1.6, r: 56 }] }),
    ]]] },
  { id: 'green', name: 'Green Theory', cat: 'healthy', cuisine: 'Bowls · Salads', rating: 4.9, reviews: '640', time: '15–25', fee: 0, color: '#3f8f5a', promo: 'Free delivery',
    menu: [['Bowls', [
      d('buddha', 'Buddha bowl', 48, 'Quinoa, roast veg, hummus, greens.', { bowl: true, plate: '#2f4a3a', rim: '#3a5a46', base: '#d9c49a', baseR: 64, items: [{ shape: 'cube', color: '#e8893a', n: 6, size: 7, r: 46 }, { shape: 'leaf', color: '#6fa35a', n: 10, size: 7, r: 52 }, { shape: 'slice', color: '#9bbd5a', n: 4, size: 10, r: 40 }, { shape: 'dot', color: '#9b1830', n: 8, size: 2.4, r: 50 }] }, true),
      d('acai', 'Açaí bowl', 39, 'Açaí, banana, granola, berries.', { bowl: true, plate: '#f2ede4', base: '#5b2a5e', baseR: 62, items: [{ shape: 'ring', color: '#f6e6b0', n: 6, size: 8, r: 40 }, { shape: 'dot', color: '#3b4bbf', n: 10, size: 4, r: 46 }, { shape: 'grain', color: '#c99a5a', n: 26, size: 3, r: 50 }] }),
    ]]] },
];

export const PROMOS = [
  ['20% off your first order', 'Code BITE20 · Ember & Salt', '#e8572a', 'ember'],
  ['Free delivery all weekend', 'On orders over AED 50', '#3f8f5a', 'green'],
  ['Buy 1 get 1 pizza', 'Every Tuesday at Pizza Nonna', '#d8432f', 'nonna'],
];
