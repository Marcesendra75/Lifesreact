// ============================================
// LIFE'S — Integración con GIPHY (GIFs y Stickers)
// El backend hace de intermediario para no exponer tu API key en el
// frontend — el cliente nunca ve la key, solo pide "gifs" o "stickers".
// ============================================
const GIPHY_BASE = 'https://api.giphy.com/v1';

async function giphyFetch(path: string, params: Record<string, string>) {
  const apiKey = process.env.GIPHY_API_KEY;
  if (!apiKey) throw new Error('Falta configurar GIPHY_API_KEY en el backend');

  const query = new URLSearchParams({ api_key: apiKey, ...params });
  const res = await fetch(`${GIPHY_BASE}${path}?${query}`);
  if (!res.ok) throw new Error('Error al consultar GIPHY');

  const data = await res.json() as any;
  return (data.data || []).map((item: any) => ({
    id: item.id,
    url: item.images?.fixed_height?.url || item.images?.original?.url,
    previewUrl: item.images?.fixed_height_small?.url || item.images?.preview_gif?.url || item.images?.fixed_height?.url,
    width: Number(item.images?.fixed_height?.width) || undefined,
    height: Number(item.images?.fixed_height?.height) || undefined,
  }));
}

export function searchGifs(q: string) {
  return giphyFetch('/gifs/search', { q, limit: '24', rating: 'pg-13' });
}
export function trendingGifs() {
  return giphyFetch('/gifs/trending', { limit: '24', rating: 'pg-13' });
}
export function searchStickers(q: string) {
  return giphyFetch('/stickers/search', { q, limit: '24', rating: 'pg-13' });
}
export function trendingStickers() {
  return giphyFetch('/stickers/trending', { limit: '24', rating: 'pg-13' });
}