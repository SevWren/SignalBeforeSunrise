export interface ParsedFeed {
  title: string;
  description: string;
  link: string;
  items: ParsedArticle[];
}

export interface ParsedArticle {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  content: string;
  contentSnippet: string;
  creator?: string;
  categories?: string[];
  thumbnail?: string;
}

export async function fetchFeed(url: string): Promise<ParsedFeed> {
  const proxyUrl = `/api/rss?url=${encodeURIComponent(url)}`;

  try {
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`Server returned ${response.status} ${response.statusText}`);
    }
    
    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.includes('application/json')) {
      const jsonContent = await response.json();
      return parseJsonFeed(jsonContent);
    }
    
    let xmlContent = await response.text();
    if (!xmlContent) {
      throw new Error(`Failed to fetch feed: Empty response`);
    }

    // Clean up common XML issues in RSS feeds before parsing
    xmlContent = xmlContent.trim();
    
    // Handle base64 data URIs
    if (xmlContent.startsWith('data:application/rss+xml;')) {
      try {
        const base64Content = xmlContent.split(',')[1].replace(/\s/g, '');
        xmlContent = atob(base64Content);
      } catch (e) {
        console.error('Failed to decode base64 content:', e);
        throw new Error('Failed to decode base64 RSS feed content');
      }
    }
    
    if (xmlContent.toLowerCase().startsWith('<!doctype html') || xmlContent.toLowerCase().startsWith('<html')) {
      throw new Error('Proxy returned an HTML page instead of an RSS feed. The target site might be blocking proxies.');
    }

    // Fix common HTML entities that break strict XML parsing, then fix bare ampersands
    xmlContent = xmlContent
      .replace(/&nbsp;/g, '&#160;')
      .replace(/&copy;/g, '&#169;')
      .replace(/&mdash;/g, '&#8212;')
      .replace(/&ndash;/g, '&#8211;')
      .replace(/&ldquo;/g, '&#8220;')
      .replace(/&rdquo;/g, '&#8221;')
      .replace(/&lsquo;/g, '&#8216;')
      .replace(/&rsquo;/g, '&#8217;')
      .replace(/&hellip;/g, '&#8230;')
      .replace(/&middot;/g, '&#183;')
      .replace(/&trade;/g, '&#8482;')
      .replace(/&reg;/g, '&#174;')
      .replace(/&bull;/g, '&#8226;')
      .replace(/&pound;/g, '&#163;')
      .replace(/&euro;/g, '&#8364;')
      .replace(/&(?!(amp|lt|gt|quot|apos|#\d+|#x[a-fA-F0-9]+);)/g, '&amp;');

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, "text/xml");

    const parseError = xmlDoc.querySelector("parsererror");
    if (parseError) {
      console.error('Failed to parse XML content. Content snippet:', xmlContent.substring(0, 500));
      throw new Error(`Error parsing XML: ${parseError.textContent || 'Unknown syntax error'}`);
    }

    const isAtom = xmlDoc.documentElement.nodeName === 'feed';
    
    let title = '';
    let description = '';
    let link = url;
    const items: ParsedArticle[] = [];

    if (isAtom) {
      title = xmlDoc.querySelector('feed > title')?.textContent || 'Unknown Feed';
      description = xmlDoc.querySelector('feed > subtitle')?.textContent || '';
      link = xmlDoc.querySelector('feed > link[rel="alternate"]')?.getAttribute('href') || url;

      const entries = xmlDoc.querySelectorAll('entry');
      entries.forEach(entry => {
        const itemTitle = entry.querySelector('title')?.textContent || 'Untitled';
        const itemLink = entry.querySelector('link[rel="alternate"]')?.getAttribute('href') || entry.querySelector('link')?.getAttribute('href') || '';
        const itemPubDate = entry.querySelector('updated')?.textContent || entry.querySelector('published')?.textContent || new Date().toISOString();
        const itemContent = entry.querySelector('content')?.textContent || entry.querySelector('summary')?.textContent || '';
        const itemCreator = entry.querySelector('author > name')?.textContent || '';
        const itemId = entry.querySelector('id')?.textContent || itemLink || Math.random().toString(36).substring(7);
        
        let thumbnail = '';
        const mediaThumbnail = entry.getElementsByTagNameNS('*', 'thumbnail')[0];
        if (mediaThumbnail) {
           thumbnail = mediaThumbnail.getAttribute('url') || '';
        } else {
           const imgMatch = itemContent.match(/<img[^>]+src="([^">]+)"/);
           if (imgMatch) {
             thumbnail = imgMatch[1];
           }
        }

        const tmp = document.createElement('div');
        tmp.innerHTML = itemContent;
        const contentSnippet = tmp.textContent || tmp.innerText || '';

        items.push({
          id: itemId,
          title: itemTitle,
          link: itemLink,
          pubDate: itemPubDate,
          content: itemContent,
          contentSnippet: contentSnippet.substring(0, 200),
          creator: itemCreator,
          thumbnail
        });
      });
    } else {
      // RSS
      title = xmlDoc.querySelector('channel > title')?.textContent || 'Unknown Feed';
      description = xmlDoc.querySelector('channel > description')?.textContent || '';
      link = xmlDoc.querySelector('channel > link')?.textContent || url;

      const entries = xmlDoc.querySelectorAll('item');
      entries.forEach(entry => {
        const itemTitle = entry.querySelector('title')?.textContent || 'Untitled';
        const itemLink = entry.querySelector('link')?.textContent || '';
        const itemPubDate = entry.querySelector('pubDate')?.textContent || entry.getElementsByTagNameNS('*', 'date')[0]?.textContent || new Date().toISOString();
        
        const contentEncoded = entry.getElementsByTagNameNS('*', 'encoded')[0]?.textContent;
        const descriptionNode = entry.querySelector('description')?.textContent;
        const itemContent = contentEncoded || descriptionNode || '';
        
        const itemCreator = entry.getElementsByTagNameNS('*', 'creator')[0]?.textContent || entry.querySelector('author')?.textContent || '';
        const itemId = entry.querySelector('guid')?.textContent || itemLink || Math.random().toString(36).substring(7);

        let thumbnail = '';
        const mediaContent = entry.getElementsByTagNameNS('*', 'content')[0];
        const mediaThumbnail = entry.getElementsByTagNameNS('*', 'thumbnail')[0];
        
        if (mediaContent && mediaContent.getAttribute('url')) {
          thumbnail = mediaContent.getAttribute('url') || '';
        } else if (mediaThumbnail && mediaThumbnail.getAttribute('url')) {
          thumbnail = mediaThumbnail.getAttribute('url') || '';
        } else {
          const imgMatch = itemContent.match(/<img[^>]+src="([^">]+)"/);
          if (imgMatch) {
            thumbnail = imgMatch[1];
          }
        }

        const tmp = document.createElement('div');
        tmp.innerHTML = itemContent;
        const contentSnippet = tmp.textContent || tmp.innerText || '';

        items.push({
          id: itemId,
          title: itemTitle,
          link: itemLink,
          pubDate: itemPubDate,
          content: itemContent,
          contentSnippet: contentSnippet.substring(0, 200),
          creator: itemCreator,
          thumbnail
        });
      });
    }

    return {
      title,
      description,
      link,
      items
    };
  } catch (error) {
    console.error('Error fetching feed:', error);
    throw error;
  }
}

function parseJsonFeed(jsonContent: any): ParsedFeed {
  return {
    title: jsonContent.feed.title,
    description: jsonContent.feed.description,
    link: jsonContent.feed.link,
    items: jsonContent.items.map((item: any) => ({
      id: item.guid,
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      content: item.content,
      contentSnippet: item.description.substring(0, 200),
      creator: item.author,
      thumbnail: item.thumbnail
    }))
  };
}
