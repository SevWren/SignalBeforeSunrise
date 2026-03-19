import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0'
];

function getRandomUserAgent() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // RSS Proxy Endpoint
  app.get("/api/rss", async (req, res) => {
    const feedUrl = req.query.url as string;
    if (!feedUrl) {
      return res.status(400).json({ error: "Missing URL parameter" });
    }

    try {
      console.log(`[Proxy] Fetching: ${feedUrl}`);
      
      const urlObj = new URL(feedUrl);
      let response = await fetch(feedUrl, {
        headers: {
          'User-Agent': getRandomUserAgent(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'en-US,en;q=0.9',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1',
          'Referer': `${urlObj.protocol}//${urlObj.hostname}/`,
          'Connection': 'keep-alive'
        }
      });
      
      // Fallback to RSS2JSON if direct fetch fails
      if (!response.ok) {
        console.warn(`[Proxy] Direct fetch failed for ${feedUrl} (${response.status}). Trying fallback...`);
        const fallbackUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
        response = await fetch(fallbackUrl);
        
        if (response.ok) {
          const jsonContent = await response.json();
          res.set('Content-Type', 'application/json');
          return res.send(jsonContent);
        }
      }
      
      if (!response.ok) {
        throw new Error(`Target returned ${response.status} ${response.statusText}`);
      }
      
      const xmlContent = await response.text();
      res.set('Content-Type', 'application/xml');
      res.send(xmlContent);
    } catch (error) {
      console.error(`[Proxy] Error fetching RSS feed: ${feedUrl}`, error);
      res.status(500).json({ 
        error: "Failed to fetch RSS feed", 
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
