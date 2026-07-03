// src/services/atlasApi.js

const BASE = 'https://api.atlasacademy.io';
const CACHE_KEY_LIST = 'atlas_servant_list';

const niceCache = new Map();
let listCache = null;

export async function fetchServantList() {
  if (listCache) return listCache;

  const cached = sessionStorage.getItem(CACHE_KEY_LIST);
  if (cached) {
    listCache = JSON.parse(cached);
    return listCache;
  }

  const res = await fetch(`${BASE}/basic/JP/servant/search?type=normal&limit=500`);
  if (!res.ok) throw new Error(`Atlas API error: ${res.status}`);
  const data = await res.json();
  listCache = data;
  sessionStorage.setItem(CACHE_KEY_LIST, JSON.stringify(data));
  return data;
}

export async function fetchNiceServant(id) {
  if (niceCache.has(id)) return niceCache.get(id);

  const res = await fetch(`${BASE}/nice/JP/servant/${id}?lang=en`);
  if (!res.ok) throw new Error(`Atlas API error: ${res.status}`);
  const data = await res.json();
  niceCache.set(id, data);
  return data;
}

export async function fetchNiceEquip(id) {
  const res = await fetch(`${BASE}/nice/JP/equip/${id}?lang=en`);
  if (!res.ok) throw new Error(`Atlas API error: ${res.status}`);
  return res.json();
}

export function clearRuntimeCache() {
  niceCache.clear();
  listCache = null;
}
