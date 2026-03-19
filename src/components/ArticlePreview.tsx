import React from 'react';
import DOMPurify from 'dompurify';
import { format } from 'date-fns';
import { ExternalLink, Bookmark, Share2, CheckCircle, X, Circle } from 'lucide-react';
import { useFeedStore } from '../store/useFeedStore';
import { useSettingsStore } from '../store/useSettingsStore';

export function ArticlePreview() {
  const {
    articles,
    feeds,
    selectedArticleId,
    setSelectedArticleId,
    toggleSaved,
    toggleRead,
  } = useFeedStore();

  const { togglePreview, fontSize } = useSettingsStore();

  const article = articles.find(a => a.id === selectedArticleId);
  const feed = article ? feeds.find(f => f.id === article.feedId) : null;

  if (!article) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-zinc-500 p-8 text-center bg-white dark:bg-zinc-950">
        <div className="w-16 h-16 mb-4 rounded-full bg-slate-100 dark:bg-zinc-900 flex items-center justify-center">
          <CheckCircle size={32} className="text-slate-300 dark:text-zinc-700" />
        </div>
        <p className="text-lg font-medium text-slate-600 dark:text-zinc-400">No article selected</p>
        <p className="text-sm mt-2">Select an article from the list to read it here.</p>
      </div>
    );
  }

  const sanitizedContent = DOMPurify.sanitize(article.content, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'blockquote', 'code', 'pre', 'span', 'div', 'figure', 'figcaption'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'target', 'rel'],
  });

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          url: article.link,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(article.link);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-950 overflow-hidden relative">
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm p-1 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-sm">
        <button
          onClick={() => toggleRead(article.id)}
          className={`p-2 rounded-md transition-colors ${
            !article.isRead 
              ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10' 
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
          title={article.isRead ? "Mark as unread" : "Mark as read"}
        >
          {article.isRead ? <CheckCircle size={18} /> : <Circle size={18} />}
        </button>
        <button
          onClick={() => toggleSaved(article.id)}
          className={`p-2 rounded-md transition-colors ${
            article.isSaved 
              ? 'text-amber-500 bg-amber-50 dark:bg-amber-500/10' 
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
          title={article.isSaved ? "Unsave" : "Save"}
        >
          <Bookmark size={18} className={article.isSaved ? 'fill-current' : ''} />
        </button>
        <button
          onClick={handleShare}
          className="p-2 rounded-md text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          title="Share"
        >
          <Share2 size={18} />
        </button>
        <a
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-md text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          title="Open original"
        >
          <ExternalLink size={18} />
        </a>
        <div className="w-px h-6 bg-slate-200 dark:bg-zinc-800 mx-1" />
        <button
          onClick={() => setSelectedArticleId(null)}
          className="p-2 rounded-md text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          title="Close preview"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {article.thumbnail && (
          <div className="w-full h-64 sm:h-80 bg-slate-100 dark:bg-zinc-900 shrink-0">
            <img 
              src={article.thumbnail} 
              alt="" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
        
        <div className="p-6 sm:p-8 max-w-3xl mx-auto">
          <div className={`flex items-center gap-3 mb-4 ${fontSize === 'small' ? 'text-xs' : fontSize === 'large' ? 'text-base' : 'text-sm'}`}>
            {feed?.icon && <img src={feed.icon} alt="" className="w-6 h-6 rounded-sm" />}
            <span className="font-medium text-indigo-600 dark:text-indigo-400">{feed?.title}</span>
            <span className="text-slate-300 dark:text-zinc-700">•</span>
            <span className="text-slate-500 dark:text-zinc-400">
              {format(article.pubDate, 'MMM d, yyyy • h:mm a')}
            </span>
          </div>
          
          <h1 className={`font-bold text-slate-900 dark:text-zinc-50 mb-6 leading-tight ${fontSize === 'small' ? 'text-xl sm:text-2xl' : fontSize === 'large' ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'}`}>
            {article.title}
          </h1>
          
          {article.creator && (
            <div className={`mb-8 text-slate-600 dark:text-zinc-400 font-medium ${fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-lg' : 'text-base'}`}>
              By {article.creator}
            </div>
          )}
          
          <div 
            className={`prose prose-slate dark:prose-invert max-w-none prose-img:rounded-xl prose-img:mx-auto prose-a:text-indigo-600 dark:prose-a:text-indigo-400 hover:prose-a:text-indigo-500 ${
              fontSize === 'small' ? 'prose-sm' : fontSize === 'large' ? 'prose-lg' : 'prose-base'
            }`}
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        </div>
      </div>
    </div>
  );
}
