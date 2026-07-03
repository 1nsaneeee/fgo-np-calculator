import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const input = path.resolve(__dirname, '..', 'nice_servant.json');
const outNpColors = path.resolve(__dirname, '..', 'src', 'translations', 'npColors.json');
const outDecks = path.resolve(__dirname, '..', 'src', 'translations', 'decks.json');
const outRarities = path.resolve(__dirname, '..', 'src', 'translations', 'rarities.json');

const cardMap = { '1': 'Arts', '2': 'Buster', '3': 'Quick' };
const bqMap = { '1': 'A', '2': 'B', '3': 'Q' };

const data = JSON.parse(fs.readFileSync(input, 'utf-8'));

const npColors = {};
const decks = {};
const rarities = {};

for (const s of data) {
  const id = s.id;
  const np = s.noblePhantasms?.[0];
  if (np) npColors[id] = cardMap[np.card] || null;
  if (s.cards) {
    const deck = s.cards.map(c => bqMap[c] || c).join('');
    decks[id] = deck;
  }
  rarities[id] = s.rarity;
}

fs.writeFileSync(outNpColors, JSON.stringify(npColors));
fs.writeFileSync(outDecks, JSON.stringify(decks));
fs.writeFileSync(outRarities, JSON.stringify(rarities));
console.log(`Generated: npColors (${Object.keys(npColors).length}), decks (${Object.keys(decks).length}), rarities (${Object.keys(rarities).length})`);
