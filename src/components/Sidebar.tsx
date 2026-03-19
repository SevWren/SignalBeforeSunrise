import React, { useState } from 'react';
import { Rss, Folder, Trash2, Edit2, Check, X, ChevronRight, ChevronDown, GripVertical, AlertCircle } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useFeedStore } from '../store/useFeedStore';

export function Sidebar() {
  const {
    feeds,
    categories,
    selectedFeedId,
    selectedCategoryId,
    setSelectedFeedId,
    setSelectedCategoryId,
    removeFeed,
    addCategory,
    removeCategory,
    updateCategory,
    reorderCategories,
    reorderFeeds,
    articles,
  } = useFeedStore();

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(
    categories.reduce((acc, cat) => ({ ...acc, [cat.id]: true }), {})
  );

  const toggleCategory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      addCategory(newCategoryName.trim());
      setNewCategoryName('');
      setIsAddingCategory(false);
    }
  };

  const handleEditCategory = (id: string) => {
    if (editCategoryName.trim()) {
      updateCategory(id, editCategoryName.trim());
      setEditingCategoryId(null);
    }
  };

  const getUnreadCountForFeed = (feedId: string) => {
    return articles.filter(a => a.feedId === feedId && !a.isRead).length;
  };

  const getUnreadCountForCategory = (categoryId: string) => {
    const feedIds = feeds.filter(f => f.categoryId === categoryId).map(f => f.id);
    return articles.filter(a => feedIds.includes(a.feedId) && !a.isRead).length;
  };

  const totalUnread = articles.filter(a => !a.isRead).length;

  const onDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;

    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    if (type === 'category') {
      const newCategories = Array.from(categories);
      const [removed] = newCategories.splice(source.index, 1);
      newCategories.splice(destination.index, 0, removed);
      
      // Update order property
      const updatedCategories = newCategories.map((cat, index) => ({ ...cat, order: index }));
      reorderCategories(updatedCategories);
    } else if (type === 'feed') {
      const sourceCategoryId = source.droppableId;
      const destCategoryId = destination.droppableId;

      const newFeeds = Array.from(feeds);
      
      const sourceFeeds = newFeeds.filter(f => f.categoryId === sourceCategoryId);
      const destFeeds = sourceCategoryId === destCategoryId ? sourceFeeds : newFeeds.filter(f => f.categoryId === destCategoryId);
      
      const [movedFeed] = sourceFeeds.splice(source.index, 1);
      movedFeed.categoryId = destCategoryId;
      
      destFeeds.splice(destination.index, 0, movedFeed);

      // Reconstruct the feeds array
      const otherFeeds = newFeeds.filter(f => f.categoryId !== sourceCategoryId && f.categoryId !== destCategoryId);
      
      let finalFeeds = [];
      if (sourceCategoryId === destCategoryId) {
        finalFeeds = [...otherFeeds, ...destFeeds];
      } else {
        finalFeeds = [...otherFeeds, ...sourceFeeds, ...destFeeds];
      }
      
      reorderFeeds(finalFeeds);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
        <h2 className="font-semibold text-sm text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Feeds</h2>
        <button
          onClick={() => setIsAddingCategory(true)}
          className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          title="Add Category"
        >
          <Folder size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <button
          onClick={() => { setSelectedFeedId(null); setSelectedCategoryId(null); }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
            !selectedFeedId && !selectedCategoryId
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 font-medium'
              : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-200/50 dark:hover:bg-zinc-800/50'
          }`}
        >
          <div className="flex items-center gap-2">
            <Rss size={16} className={!selectedFeedId && !selectedCategoryId ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'} />
            <span className="truncate">All Articles</span>
          </div>
          {totalUnread > 0 && (
            <span className="text-xs font-medium bg-slate-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded-full">
              {totalUnread}
            </span>
          )}
        </button>

        {isAddingCategory && (
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-zinc-800/50 rounded-md">
            <input
              autoFocus
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddCategory();
                if (e.key === 'Escape') setIsAddingCategory(false);
              }}
              placeholder="Category name..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm p-0"
            />
            <button onClick={handleAddCategory} className="text-green-600 hover:text-green-700"><Check size={14} /></button>
            <button onClick={() => setIsAddingCategory(false)} className="text-red-600 hover:text-red-700"><X size={14} /></button>
          </div>
        )}

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="categories" type="category">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-1">
                {categories.map((category, index) => {
                  const categoryFeeds = feeds.filter(f => f.categoryId === category.id);
                  const isExpanded = expandedCategories[category.id];
                  const unreadCount = getUnreadCountForCategory(category.id);
                  
                  return (
                    <Draggable key={category.id} draggableId={category.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`space-y-0.5 ${snapshot.isDragging ? 'opacity-50' : ''}`}
                        >
                          {editingCategoryId === category.id ? (
                            <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-zinc-800/50 rounded-md">
                              <input
                                autoFocus
                                type="text"
                                value={editCategoryName}
                                onChange={(e) => setEditCategoryName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleEditCategory(category.id);
                                  if (e.key === 'Escape') setEditingCategoryId(null);
                                }}
                                className="flex-1 bg-transparent border-none focus:ring-0 text-sm p-0"
                              />
                              <button onClick={() => handleEditCategory(category.id)} className="text-green-600 hover:text-green-700"><Check size={14} /></button>
                              <button onClick={() => setEditingCategoryId(null)} className="text-red-600 hover:text-red-700"><X size={14} /></button>
                            </div>
                          ) : (
                            <div
                              className={`group flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                                selectedCategoryId === category.id
                                  ? 'bg-slate-200 dark:bg-zinc-800 font-medium'
                                  : 'hover:bg-slate-200/50 dark:hover:bg-zinc-800/50'
                              }`}
                              onClick={() => setSelectedCategoryId(category.id)}
                            >
                              <div className="flex items-center gap-1.5 overflow-hidden">
                                <div {...provided.dragHandleProps} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-grab active:cursor-grabbing">
                                  <GripVertical size={14} />
                                </div>
                                <button onClick={(e) => toggleCategory(category.id, e)} className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </button>
                                <Folder size={14} className="text-slate-400 shrink-0" />
                                <span className="truncate text-sm text-slate-700 dark:text-zinc-300">{category.name}</span>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                {unreadCount > 0 && (
                                  <span className="text-xs font-medium bg-slate-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded-full text-slate-600 dark:text-zinc-400">
                                    {unreadCount}
                                  </span>
                                )}
                                <div className="hidden group-hover:flex items-center gap-1">
                                  {category.id !== 'default' && (
                                    <>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); setEditCategoryName(category.name); setEditingCategoryId(category.id); }}
                                        className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                                      >
                                        <Edit2 size={12} />
                                      </button>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); removeCategory(category.id); }}
                                        className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {isExpanded && categoryFeeds.length > 0 && (
                            <Droppable droppableId={category.id} type="feed">
                              {(provided) => (
                                <div ref={provided.innerRef} {...provided.droppableProps} className="pl-6 space-y-0.5">
                                  {categoryFeeds.map((feed, feedIndex) => {
                                    const feedUnread = getUnreadCountForFeed(feed.id);
                                    return (
                                      <Draggable key={feed.id} draggableId={feed.id} index={feedIndex}>
                                        {(provided, snapshot) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            onClick={() => setSelectedFeedId(feed.id)}
                                            className={`group flex items-center justify-between px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
                                              selectedFeedId === feed.id
                                                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 font-medium'
                                                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200/50 dark:hover:bg-zinc-800/50'
                                            } ${snapshot.isDragging ? 'opacity-50' : ''}`}
                                          >
                                            <div className="flex items-center gap-2 overflow-hidden">
                                              <div {...provided.dragHandleProps} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
                                                <GripVertical size={14} />
                                              </div>
                                              {feed.icon ? (
                                                <img src={feed.icon} alt="" className="w-4 h-4 rounded-sm shrink-0" />
                                              ) : (
                                                <Rss size={14} className="shrink-0 opacity-70" />
                                              )}
                                              <span className="truncate text-sm">{feed.title}</span>
                                              {feed.error && (
                                                <span title={feed.error}>
                                                  <AlertCircle size={16} className="text-red-500 shrink-0" />
                                                </span>
                                              )}
                                            </div>
                                            
                                            <div className="flex items-center gap-1 shrink-0">
                                              {feedUnread > 0 && (
                                                <span className="text-xs font-medium bg-slate-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded-full">
                                                  {feedUnread}
                                                </span>
                                              )}
                                              <button
                                                onClick={(e) => { e.stopPropagation(); removeFeed(feed.id); }}
                                                className="hidden group-hover:block p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                                                title="Remove Feed"
                                              >
                                                <Trash2 size={12} />
                                              </button>
                                            </div>
                                          </div>
                                        )}
                                      </Draggable>
                                    );
                                  })}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          )}
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}
