import { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware';
import * as giphyService from '../services/giphy.service';

export async function gifs(req: AuthRequest, res: Response) {
  try {
    const q = (req.query.q as string) || '';
    const data = q ? await giphyService.searchGifs(q) : await giphyService.trendingGifs();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Error al buscar GIFs' });
  }
}

export async function stickers(req: AuthRequest, res: Response) {
  try {
    const q = (req.query.q as string) || '';
    const data = q ? await giphyService.searchStickers(q) : await giphyService.trendingStickers();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Error al buscar stickers' });
  }
}