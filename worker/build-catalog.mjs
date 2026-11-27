// Builds worker/src/catalog.json from src/data.js: the only price list the payment Worker trusts.
// Runs in CI before every Worker deploy, so adding or repricing a product, package or bundle in data.js is all it takes.
// Packages/bundles: give a product `includes: ['id-a', 'id-b']` and buying it grants each included product.
import { writeFileSync } from 'node:fs';
import { PRODUCTS, STORE } from '../src/data.js';

const label = cat => STORE.find(c => c.cat === cat)?.name || 'Product';
const catalog = PRODUCTS.map(p => ({
  id: p.id, title: p.title, price: p.price, category: label(p.cat),
  ...(p.placeholder ? { placeholder: true } : {}),
  ...(p.includes ? { includes: p.includes } : {}),
}));
for (const p of catalog) for (const id of p.includes || []) if (!catalog.some(x => x.id === id)) throw new Error(`${p.id} includes unknown product ${id}`);
writeFileSync(new URL('./src/catalog.json', import.meta.url), JSON.stringify(catalog, null, 1));
console.log(`catalog: ${catalog.length} products, ${catalog.filter(p => !p.placeholder && p.price > 0).length} paid and listed`);
