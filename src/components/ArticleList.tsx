import React, { useMemo, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { LayoutGrid, List, CheckCircle, Bookmark } from 'lucide-react';
import { useFeedStore } from '../store/useFeedStore';
import { useSettingsStore } from '../store/useSettingsStore';

export function ArticleList() {
  const {
    articles,
    feeds,
    selectedFeedId,
    selectedCategoryId,
    selectedArticleId,
    setSelectedArticleId,
    searchQuery,
    filterMode,
    sortOrder,
    markAsRead,
    toggleRead,
    markAllAsRead,
    toggleSaved,
  } = useFeedStore();

  const {
    viewMode,
    setViewMode,
    columnCount,
    setColumnCount,
    cardSize,
    setCardSize,
    fontSize,
  } = useSettingsStore();

  const filteredArticles = useMemo(() => {
    let filtered = articles;

    if (selectedFeedId) {
      filtered = filtered.filter(a => a.feedId === selectedFeedId);
    } else if (selectedCategoryId) {
      const feedIds = feeds.filter(f => f.categoryId === selectedCategoryId).map(f => f.id);
      filtered = filtered.filter(a => feedIds.includes(a.feedId));
    }

    if (filterMode === 'unread') {
      filtered = filtered.filter(a => !a.isRead);
    } else if (filterMode === 'saved') {
      filtered = filtered.filter(a => a.isSaved);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(query) || 
        a.contentSnippet.toLowerCase().includes(query)
      );
    }

    filtered.sort((a, b) => {
      if (sortOrder === 'newest') return b.pubDate - a.pubDate;
      return a.pubDate - b.pubDate;
    });

    return filtered;
  }, [articles, feeds, selectedFeedId, selectedCategoryId, filterMode, searchQuery, sortOrder]);

  const handleArticleClick = (id: string) => {
    setSelectedArticleId(id);
    markAsRead(id);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'j' || e.key === 'k') {
        e.preventDefault();
        if (filteredArticles.length === 0) return;

        const currentIndex = filteredArticles.findIndex(a => a.id === selectedArticleId);
        let nextIndex = 0;

        if (e.key === 'j') {
          // Next article
          nextIndex = currentIndex === -1 ? 0 : Math.min(currentIndex + 1, filteredArticles.length - 1);
        } else if (e.key === 'k') {
          // Previous article
          nextIndex = currentIndex <= 0 ? 0 : currentIndex - 1;
        }

        const nextArticle = filteredArticles[nextIndex];
        if (nextArticle) {
          handleArticleClick(nextArticle.id);
          
          // Scroll into view
          const element = document.getElementById(`article-${nextArticle.id}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      } else if (e.key === 'm' && selectedArticleId) {
        e.preventDefault();
        toggleRead(selectedArticleId);
      } else if (e.key === 's' && selectedArticleId) {
        e.preventDefault();
        toggleSaved(selectedArticleId);
      } else if (e.key === 'o' && selectedArticleId) {
        e.preventDefault();
        const article = filteredArticles.find(a => a.id === selectedArticleId);
        if (article) {
          window.open(article.link, '_blank', 'noopener,noreferrer');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredArticles, selectedArticleId, toggleRead, toggleSaved]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-white dark:bg-zinc-950 z-10">
        <div className="flex items-center gap-4">
          <h2 className="font-semibold text-lg truncate max-w-[200px] sm:max-w-xs">
            {selectedFeedId 
              ? feeds.find(f => f.id === selectedFeedId)?.title 
              : selectedCategoryId 
                ? 'Category' 
                : 'All Articles'}
          </h2>
          <span className="text-sm text-slate-500 dark:text-zinc-400">
            {filteredArticles.length} articles
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => markAllAsRead(selectedFeedId || undefined)}
            className="text-sm text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors"
          >
            <CheckCircle size={16} />
            <span className="hidden sm:inline">Mark all read</span>
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-zinc-800 mx-1" />

          <div className="flex items-center bg-slate-100 dark:bg-zinc-900 rounded-md p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-sm transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-zinc-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-sm transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-zinc-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pl-6 bg-slate-50/50 dark:bg-zinc-950/50">
        {filteredArticles.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-zinc-500 space-y-4">
            <div className="p-4 bg-slate-100 dark:bg-zinc-900 rounded-full">
              <CheckCircle size={32} />
            </div>
            <p className="text-lg font-medium">No articles found</p>
            <p className="text-sm">You're all caught up!</p>
          </div>
        ) : (
          <div 
            className={
              viewMode === 'grid' 
                ? `columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4` 
                : 'flex flex-col gap-2'
            }
            style={
              viewMode === 'grid' && columnCount > 0
                ? { columnCount: columnCount }
                : undefined
            }
          >
            {filteredArticles.map(article => {
              const feed = feeds.find(f => f.id === article.feedId);
              const isSelected = selectedArticleId === article.id;
              
              return (
                <div
                  key={article.id}
                  id={`article-${article.id}`}
                  onClick={() => handleArticleClick(article.id)}
                  className={`
                    group relative overflow-hidden rounded-xl border transition-all cursor-pointer break-inside-avoid
                    ${isSelected 
                      ? 'border-indigo-500 ring-1 ring-indigo-500 bg-white dark:bg-zinc-900 shadow-md' 
                      : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md'
                    }
                    ${!article.isRead ? 'opacity-100' : 'opacity-70 hover:opacity-100'}
                    ${viewMode === 'list' ? 'flex items-center gap-4 p-3' : 'flex flex-col'}
                  `}
                >
                  {!article.isRead && (
                    <div className="absolute top-3 left-3 w-2.5 h-2.5 bg-indigo-500 rounded-full z-10 shadow-sm" />
                  )}
                  
                  {viewMode === 'grid' && article.thumbnail && (
                    <div 
                      className="w-full overflow-hidden bg-slate-100 dark:bg-zinc-800 shrink-0"
                      style={{ height: `${cardSize * 1.6}px` }}
                    >
                      <img 
                        src={article.thumbnail} 
                        alt="" 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  <div className={`flex-1 flex flex-col ${viewMode === 'grid' ? 'p-4' : 'min-w-0'}`}>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 truncate">
                        {feed?.icon ? (
                          <img src={feed.icon} alt="" className="w-3.5 h-3.5 rounded-sm" />
                        ) : (
                          <span className="font-medium truncate">{feed?.title}</span>
                        )}
                        <span>•</span>
                        <span className="shrink-0">{formatDistanceToNow(article.pubDate, { addSuffix: true })}</span>
                      </div>
                      
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSaved(article.id); }}
                        className={`p-1.5 rounded-full transition-colors ${
                          article.isSaved 
                            ? 'text-amber-500 bg-amber-50 dark:bg-amber-500/10' 
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <Bookmark size={14} className={article.isSaved ? 'fill-current' : ''} />
                      </button>
                    </div>

                    <h3 className={`font-semibold text-slate-900 dark:text-zinc-100 mb-1.5 ${viewMode === 'list' ? 'truncate' : 'line-clamp-2'} ${fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-lg' : 'text-base'}`}>
                      {article.title}
                    </h3>

                    {viewMode === 'grid' && (
                      <p className={`text-slate-600 dark:text-zinc-400 line-clamp-3 mb-3 flex-1 ${fontSize === 'small' ? 'text-xs' : fontSize === 'large' ? 'text-base' : 'text-sm'}`}>
                        {article.contentSnippet}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
