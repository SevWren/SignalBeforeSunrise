import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';

// Custom storage for IndexedDB
const idbStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

export interface Feed {
  id: string;
  url: string;
  title: string;
  categoryId: string | null;
  lastFetched: number;
  icon?: string;
  error?: string;
}

export interface Category {
  id: string;
  name: string;
  order: number;
}

export interface Article {
  id: string;
  feedId: string;
  title: string;
  link: string;
  pubDate: number;
  content: string;
  contentSnippet: string;
  creator?: string;
  thumbnail?: string;
  isRead: boolean;
  isSaved: boolean;
}

interface FeedState {
  feeds: Feed[];
  categories: Category[];
  articles: Article[];
  selectedFeedId: string | null;
  selectedCategoryId: string | null;
  selectedArticleId: string | null;
  searchQuery: string;
  filterMode: 'all' | 'unread' | 'saved';
  sortOrder: 'newest' | 'oldest';
  
  // Actions
  addFeed: (feed: Feed) => void;
  updateFeed: (id: string, updates: Partial<Feed>) => void;
  removeFeed: (id: string) => void;
  reorderFeeds: (feeds: Feed[]) => void;
  
  addCategory: (name: string) => void;
  updateCategory: (id: string, name: string) => void;
  removeCategory: (id: string) => void;
  reorderCategories: (categories: Category[]) => void;
  
  addArticles: (articles: Omit<Article, 'isRead' | 'isSaved'>[]) => void;
  markAsRead: (id: string) => void;
  toggleRead: (id: string) => void;
  markAllAsRead: (feedId?: string) => void;
  toggleSaved: (id: string) => void;
  
  setSelectedFeedId: (id: string | null) => void;
  setSelectedCategoryId: (id: string | null) => void;
  setSelectedArticleId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setFilterMode: (mode: 'all' | 'unread' | 'saved') => void;
  setSortOrder: (order: 'newest' | 'oldest') => void;
  
  importData: (data: any) => void;
  exportData: () => any;
}

export const useFeedStore = create<FeedState>()(
  persist(
    (set, get) => ({
      feeds: [
        {
          id: 'default-1',
          title: 'Newsmax Newsfront',
          url: 'https://www.newsmax.com/rss/Newsfront/16',
          categoryId: 'default',
          lastFetched: 0,
        },
        {
          id: 'default-10',
          title: 'Newsmax America',
          url: 'https://www.newsmax.com/rss/US/18',
          categoryId: 'default',
          lastFetched: 0,
        },
        {
          id: 'default-11',
          title: 'Newsmax Politics',
          url: 'https://www.newsmax.com/rss/Politics/1',
          categoryId: 'default',
          lastFetched: 0,
        },
        {
          id: 'default-12',
          title: 'Newsmax The Wire',
          url: 'https://www.newsmax.com/rss/TheWire/118',
          categoryId: 'default',
          lastFetched: 0,
        },
        {
          id: 'default-13',
          title: 'Newsmax Science & Technology',
          url: 'https://www.newsmax.com/rss/SciTech/20',
          categoryId: 'default',
          lastFetched: 0,
        },
        {
          id: 'default-2',
          title: 'FoxNews',
          url: 'https://feeds.feedburner.com/foxnews/latest',
          categoryId: 'default',
          lastFetched: 0,
        },
        {
          id: 'default-3',
          title: 'Breitbart',
          url: 'https://feeds.feedburner.com/breitbart',
          categoryId: 'default',
          lastFetched: 0,
        },
        {
          id: 'default-4',
          title: 'The Daily Wire',
          url: 'https://www.dailywire.com/rss.xml',
          categoryId: 'default',
          lastFetched: 0,
        },
        {
          id: 'default-5',
          title: 'TheBlaze',
          url: 'https://www.theblaze.com/feeds/feed.rss',
          categoryId: 'default',
          lastFetched: 0,
        },
        {
          id: 'default-6',
          title: 'Daily Caller',
          url: 'https://dailycaller.com/feed/',
          categoryId: 'default',
          lastFetched: 0,
        },
        {
          id: 'default-7',
          title: 'National Review',
          url: 'https://www.nationalreview.com/feed',
          categoryId: 'default',
          lastFetched: 0,
        },
        {
          id: 'default-8',
          title: 'Washington Times',
          url: 'https://www.washingtontimes.com/rss/headlines/news/',
          categoryId: 'default',
          lastFetched: 0,
        },
        {
          id: 'default-9',
          title: 'OANN',
          url: 'https://www.oann.com/category/newsroom/feed/',
          categoryId: 'default',
          lastFetched: 0,
        }
      ],
      categories: [{ id: 'default', name: 'Uncategorized', order: 0 }],
      articles: [],
      selectedFeedId: null,
      selectedCategoryId: null,
      selectedArticleId: null,
      searchQuery: '',
      filterMode: 'all',
      sortOrder: 'newest',

      addFeed: (feed) => set((state) => ({
        feeds: [...state.feeds, feed]
      })),
      
      updateFeed: (id, updates) => set((state) => ({
        feeds: state.feeds.map(f => f.id === id ? { ...f, ...updates } : f)
      })),
      
      removeFeed: (id) => set((state) => ({
        feeds: state.feeds.filter(f => f.id !== id),
        articles: state.articles.filter(a => a.feedId !== id),
        selectedFeedId: state.selectedFeedId === id ? null : state.selectedFeedId
      })),

      reorderFeeds: (feeds) => set({ feeds }),

      addCategory: (name) => set((state) => ({
        categories: [...state.categories, { id: Math.random().toString(36).substring(7), name, order: state.categories.length }]
      })),
      
      updateCategory: (id, name) => set((state) => ({
        categories: state.categories.map(c => c.id === id ? { ...c, name } : c)
      })),
      
      removeCategory: (id) => set((state) => ({
        categories: state.categories.filter(c => c.id !== id),
        feeds: state.feeds.map(f => f.categoryId === id ? { ...f, categoryId: 'default' } : f),
        selectedCategoryId: state.selectedCategoryId === id ? null : state.selectedCategoryId
      })),
      
      reorderCategories: (categories) => set({ categories }),

      addArticles: (newArticles) => set((state) => {
        const existingIds = new Set(state.articles.map(a => a.id));
        const toAdd = newArticles
          .filter(a => !existingIds.has(a.id))
          .map(a => ({ ...a, isRead: false, isSaved: false }));
        
        // Keep only the last 1000 articles to prevent memory bloat
        const allArticles = [...toAdd, ...state.articles].sort((a, b) => b.pubDate - a.pubDate);
        return { articles: allArticles.slice(0, 1000) };
      }),

      markAsRead: (id) => set((state) => ({
        articles: state.articles.map(a => a.id === id ? { ...a, isRead: true } : a)
      })),
      
      toggleRead: (id) => set((state) => ({
        articles: state.articles.map(a => a.id === id ? { ...a, isRead: !a.isRead } : a)
      })),
      
      markAllAsRead: (feedId) => set((state) => ({
        articles: state.articles.map(a => 
          (!feedId || a.feedId === feedId) ? { ...a, isRead: true } : a
        )
      })),
      
      toggleSaved: (id) => set((state) => ({
        articles: state.articles.map(a => a.id === id ? { ...a, isSaved: !a.isSaved } : a)
      })),

      setSelectedFeedId: (id) => set({ selectedFeedId: id, selectedCategoryId: null, selectedArticleId: null }),
      setSelectedCategoryId: (id) => set({ selectedCategoryId: id, selectedFeedId: null, selectedArticleId: null }),
      setSelectedArticleId: (id) => set({ selectedArticleId: id }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setFilterMode: (mode) => set({ filterMode: mode }),
      setSortOrder: (order) => set({ sortOrder: order }),

      importData: (data) => set((state) => ({
        feeds: data.feeds || state.feeds,
        categories: data.categories || state.categories,
        articles: data.articles || state.articles,
      })),
      
      exportData: () => {
        const state = get();
        return {
          feeds: state.feeds,
          categories: state.categories,
          articles: state.articles,
        };
      }
    }),
    {
      name: 'rss-feed-storage',
      storage: createJSONStorage(() => idbStorage),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Remove The Verge and Hacker News feeds and their articles
          const state = persistedState as FeedState;
          const feedsToRemove = ['https://www.theverge.com/rss/index.xml', 'https://hnrss.org/frontpage'];
          const feedIdsToRemove = new Set(
            state.feeds.filter(f => feedsToRemove.includes(f.url)).map(f => f.id)
          );
          
          state.feeds = state.feeds.filter(f => !feedIdsToRemove.has(f.id));
          state.articles = state.articles.filter(a => !feedIdsToRemove.has(a.feedId));

          // Add new default feeds if they don't exist
          const newDefaults = [
            { id: 'default-1', title: 'Newsmax', url: 'https://www.newsmax.com/rss/Newsfront/16', categoryId: 'default', lastFetched: 0 },
            { id: 'default-2', title: 'FoxNews', url: 'https://feeds.feedburner.com/foxnews/latest', categoryId: 'default', lastFetched: 0 },
            { id: 'default-3', title: 'Breitbart', url: 'https://feeds.feedburner.com/breitbart', categoryId: 'default', lastFetched: 0 },
            { id: 'default-4', title: 'The Daily Wire', url: 'https://www.dailywire.com/rss.xml', categoryId: 'default', lastFetched: 0 },
            { id: 'default-5', title: 'TheBlaze', url: 'https://www.theblaze.com/feeds/feed.rss', categoryId: 'default', lastFetched: 0 },
            { id: 'default-6', title: 'Daily Caller', url: 'https://dailycaller.com/feed/', categoryId: 'default', lastFetched: 0 },
            { id: 'default-7', title: 'National Review', url: 'https://www.nationalreview.com/feed', categoryId: 'default', lastFetched: 0 },
            { id: 'default-8', title: 'Washington Times', url: 'https://www.washingtontimes.com/rss/headlines/news/', categoryId: 'default', lastFetched: 0 },
            { id: 'default-9', title: 'OANN', url: 'https://www.oann.com/category/newsroom/feed/', categoryId: 'default', lastFetched: 0 }
          ];

          const existingUrls = new Set(state.feeds.map(f => f.url));
          for (const def of newDefaults) {
            if (!existingUrls.has(def.url)) {
              state.feeds.push(def);
            }
          }
          
          return state;
        }
        return persistedState;
      }
    }
  )
);
