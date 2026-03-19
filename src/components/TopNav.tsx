import React, { useState } from 'react';
import { Search, Plus, Settings, Filter, Layout, Sun, Moon, Monitor, ArrowDownAZ, ArrowUpZA } from 'lucide-react';
import { useFeedStore } from '../store/useFeedStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { fetchFeed } from '../lib/rss';

import { SettingsModal } from './SettingsModal';

export function TopNav() {
  const {
    searchQuery,
    setSearchQuery,
    filterMode,
    setFilterMode,
    sortOrder,
    setSortOrder,
    addFeed,
    addArticles,
    articles,
  } = useFeedStore();

  const {
    theme,
    setTheme,
    toggleSidebar,
    togglePreview,
    sidebarVisible,
    previewVisible,
  } = useSettingsStore();

  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unreadCount = articles.filter(a => !a.isRead).length;

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleAddFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedUrl) return;
    
    setIsAdding(true);
    setError(null);
    
    try {
      const parsed = await fetchFeed(newFeedUrl);
      const feedId = Math.random().toString(36).substring(7);
      
      const feed = {
        id: feedId,
        title: parsed.title,
        url: newFeedUrl,
        categoryId: 'default',
        lastFetched: Date.now(),
      };
      
      addFeed(feed);
      
      const newArticles = parsed.items.map(item => ({
        id: item.id,
        feedId: feedId,
        title: item.title,
        link: item.link,
        pubDate: new Date(item.pubDate).getTime(),
        content: item.content,
        contentSnippet: item.contentSnippet,
        creator: item.creator,
        thumbnail: item.thumbnail,
      }));
      
      addArticles(newArticles);
      setNewFeedUrl('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <header className="h-14 bg-white dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className={`p-2 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors ${sidebarVisible ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}
          title="Toggle Sidebar"
        >
          <Layout size={20} />
        </button>
        
        <h1 className="font-bold text-lg tracking-tight hidden sm:block">RSS Reader</h1>
        
        {unreadCount > 0 && (
          <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {unreadCount} unread
          </span>
        )}
      </div>

      <div className="flex-1 max-w-xl px-4 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-100 dark:bg-zinc-900 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-950 focus:ring-1 focus:ring-indigo-500 rounded-md text-sm transition-all"
          />
        </div>
        
        <form onSubmit={handleAddFeed} className="flex items-center gap-2 relative">
          <input
            type="url"
            placeholder="Add RSS URL..."
            value={newFeedUrl}
            onChange={(e) => setNewFeedUrl(e.target.value)}
            className="w-48 px-3 py-1.5 bg-slate-100 dark:bg-zinc-900 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-950 focus:ring-1 focus:ring-indigo-500 rounded-md text-sm transition-all"
          />
          <button
            type="submit"
            disabled={isAdding || !newFeedUrl}
            className="p-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            <Plus size={18} />
          </button>
          {error && (
            <div className="absolute top-full mt-1 right-0 bg-red-100 text-red-800 text-xs p-2 rounded shadow-lg z-50 whitespace-nowrap">
              {error}
            </div>
          )}
        </form>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center bg-slate-100 dark:bg-zinc-900 rounded-md p-1">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${filterMode === 'all' ? 'bg-white dark:bg-zinc-800 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilterMode('unread')}
            className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${filterMode === 'unread' ? 'bg-white dark:bg-zinc-800 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Unread
          </button>
          <button
            onClick={() => setFilterMode('saved')}
            className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${filterMode === 'saved' ? 'bg-white dark:bg-zinc-800 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Saved
          </button>
        </div>

        <button
          onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
          className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 transition-colors"
          title={`Sort: ${sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}`}
        >
          {sortOrder === 'newest' ? <ArrowDownAZ size={20} /> : <ArrowUpZA size={20} />}
        </button>

        <button
          onClick={togglePreview}
          className={`p-2 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors ${previewVisible ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}
          title="Toggle Preview Pane"
        >
          <Layout className="rotate-180" size={20} />
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-zinc-800 mx-1" />

        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light')}
          className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 transition-colors"
          title={`Theme: ${theme}`}
        >
          {theme === 'light' ? <Sun size={20} /> : theme === 'dark' ? <Moon size={20} /> : <Monitor size={20} />}
        </button>
        
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 transition-colors"
          title="Settings"
        >
          <Settings size={20} />
        </button>
      </div>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </header>
  );
}
