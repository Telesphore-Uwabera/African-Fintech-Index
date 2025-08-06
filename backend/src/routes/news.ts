import express, { Request, Response } from 'express';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const apiKey = '07aa92b29bb24f65a26a7b4616056889';
    const url = `https://newsapi.org/v2/everything?q=fintech+africa+OR+financial+technology+africa&sortBy=publishedAt&pageSize=6&apiKey=${apiKey}`;
    
    // Add timeout and better error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'African-Fintech-Index/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`News API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check if the API returned an error
    if (data.status === 'error') {
      throw new Error(`News API error: ${data.message || 'Unknown error'}`);
    }
    
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching news:', error);
    
    // Provide more specific error messages
    if (error.name === 'AbortError') {
      res.status(504).json({ 
        error: 'News service timeout', 
        message: 'The news service is taking too long to respond. Please try again later.' 
      });
    } else if (error.code === 'UND_ERR_CONNECT_TIMEOUT') {
      res.status(503).json({ 
        error: 'News service unavailable', 
        message: 'Unable to connect to the news service. Please try again later.' 
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to fetch news', 
        message: 'An unexpected error occurred while fetching news.' 
      });
    }
  }
});

export default router; 