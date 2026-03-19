import React, { useEffect } from 'react';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { useSettingsStore } from '../store/useSettingsStore';
import { TopNav } from './TopNav';
import { Sidebar } from './Sidebar';
import { ArticleList } from './ArticleList';
import { ArticlePreview } from './ArticlePreview';
import { useFeedStore } from '../store/useFeedStore';
import { fetchFeed } from '../lib/rss';

export function AppShell() {
  const {
    theme,
    sidebarSize,
    articleListSize,
    previewSize,
    sidebarVisible,
    previewVisible,
    setPanelSizes,
    fontSize,
  } = useSettingsStore();

  const { feeds, addArticles, updateFeed } = useFeedStore();

  // Apply theme
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  // Apply font size
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('text-sm', 'text-base', 'text-lg');
    if (fontSize === 'small') root.classList.add('text-sm');
    if (fontSize === 'medium') root.classList.add('text-base');
    if (fontSize === 'large') root.classList.add('text-lg');
  }, [fontSize]);

  // Auto-fetch feeds on startup and every 60 seconds
  useEffect(() => {
    const fetchAllFeeds = async () => {
      for (const feed of feeds) {
        // Only fetch if older than 60 seconds
        if (Date.now() - feed.lastFetched > 60 * 1000) {
          try {
            const parsed = await fetchFeed(feed.url);
            const newArticles = parsed.items.map(item => ({
              id: item.id,
              feedId: feed.id,
              title: item.title,
              link: item.link,
              pubDate: new Date(item.pubDate).getTime(),
              content: item.content,
              contentSnippet: item.contentSnippet,
              creator: item.creator,
              thumbnail: item.thumbnail,
            }));
            addArticles(newArticles);
            updateFeed(feed.id, { lastFetched: Date.now(), error: undefined });
          } catch (error) {
            updateFeed(feed.id, { error: (error as Error).message });
          }
        }
      }
    };
    
    // Initial fetch
    fetchAllFeeds();

    // Set up interval
    const interval = setInterval(fetchAllFeeds, 60 * 1000);
    return () => clearInterval(interval);
  }, [feeds.length]); // Re-run if feeds list changes

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 overflow-hidden font-sans">
      <TopNav />
      
      <div className="flex-1 overflow-hidden">
        <PanelGroup orientation="horizontal">
          <Panel
            defaultSize={sidebarVisible ? sidebarSize : 0}
            minSize={sidebarVisible ? 15 : 0}
            onResize={(size) => setPanelSizes({ sidebar: size.asPercentage })}
            className="bg-slate-100 dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800"
          >
            {sidebarVisible && <Sidebar />}
          </Panel>
          {sidebarVisible && (
            <PanelResizeHandle className="w-1 bg-slate-200 dark:bg-zinc-800 hover:bg-indigo-500 dark:hover:bg-indigo-500 transition-colors cursor-col-resize" />
          )}
          
          <Panel
            defaultSize={articleListSize}
            minSize={20}
            onResize={(size) => setPanelSizes({ articleList: size.asPercentage })}
            className="bg-white dark:bg-zinc-950"
          >
            <ArticleList />
          </Panel>
          
          {previewVisible && (
            <>
              <PanelResizeHandle className="w-1 bg-slate-200 dark:bg-zinc-800 hover:bg-indigo-500 dark:hover:bg-indigo-500 transition-colors cursor-col-resize" />
              <Panel
                defaultSize={previewSize}
                minSize={25}
                onResize={(size) => setPanelSizes({ preview: size.asPercentage })}
                className="bg-slate-50 dark:bg-zinc-900 border-l border-slate-200 dark:border-zinc-800"
              >
                <ArticlePreview />
              </Panel>
            </>
          )}
        </PanelGroup>
      </div>
    </div>
  );
}
