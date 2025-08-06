import express, { Request, Response } from 'express';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const apiKey = '07aa92b29bb24f65a26a7b4616056889';
    const url = `https://newsapi.org/v2/everything?q=fintech+africa+OR+financial+technology+africa&sortBy=publishedAt&pageSize=6&apiKey=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

export default router; 