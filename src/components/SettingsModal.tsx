import React, { useState } from 'react';
import { X, Save, Upload, Download, Trash2, Layout } from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';
import { useFeedStore } from '../store/useFeedStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const {
    theme, setTheme,
    fontSize, setFontSize,
    cardSize, setCardSize,
    columnCount, setColumnCount,
    layoutPresets, saveLayoutPreset, loadLayoutPreset, removeLayoutPreset
  } = useSettingsStore();

  const { exportData, importData } = useFeedStore();

  const [newPresetName, setNewPresetName] = useState('');
  const [activeTab, setActiveTab] = useState<'general' | 'layout' | 'data'>('general');

  if (!isOpen) return null;

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rss-reader-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        importData(data);
        alert('Data imported successfully!');
      } catch (err) {
        alert('Failed to parse backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">Settings</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-48 bg-slate-50 dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800 p-2 space-y-1">
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'general' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'}`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab('layout')}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'layout' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'}`}
            >
              Layout Presets
            </button>
            <button
              onClick={() => setActiveTab('data')}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'data' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'}`}
            >
              Data & Backup
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-zinc-100 mb-3">Theme</h3>
                  <div className="flex gap-3">
                    {['light', 'dark', 'system'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t as any)}
                        className={`px-4 py-2 rounded-md text-sm font-medium capitalize border transition-all ${theme === t ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-zinc-600'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-zinc-100 mb-3">Font Size</h3>
                  <div className="flex gap-3">
                    {['small', 'medium', 'large'].map((s) => (
                      <button
                        key={s}
                        onClick={() => setFontSize(s as any)}
                        className={`px-4 py-2 rounded-md text-sm font-medium capitalize border transition-all ${fontSize === s ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-zinc-600'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-zinc-100 mb-3">Grid Columns</h3>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="6"
                      value={columnCount}
                      onChange={(e) => setColumnCount(Number(e.target.value))}
                      className="w-full max-w-xs accent-indigo-600"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-zinc-300 w-8">{columnCount}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Number of columns in grid view.</div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-zinc-100 mb-3">Grid Card Size</h3>
                  <input
                    type="range"
                    min="60"
                    max="150"
                    value={cardSize}
                    onChange={(e) => setCardSize(Number(e.target.value))}
                    className="w-full max-w-xs accent-indigo-600"
                  />
                  <div className="text-xs text-slate-500 mt-1">Adjust the minimum width of cards in grid view.</div>
                </div>
              </div>
            )}

            {activeTab === 'layout' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-zinc-100 mb-3">Save Current Layout</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPresetName}
                      onChange={(e) => setNewPresetName(e.target.value)}
                      placeholder="Preset name..."
                      className="flex-1 px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-md text-sm"
                    />
                    <button
                      onClick={() => {
                        if (newPresetName.trim()) {
                          saveLayoutPreset(newPresetName.trim());
                          setNewPresetName('');
                        }
                      }}
                      disabled={!newPresetName.trim()}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium flex items-center gap-2"
                    >
                      <Save size={16} />
                      Save
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-zinc-100 mb-3">Saved Presets</h3>
                  <div className="space-y-2">
                    {layoutPresets.map(preset => (
                      <div key={preset.id} className="flex items-center justify-between p-3 border border-slate-200 dark:border-zinc-800 rounded-md bg-slate-50 dark:bg-zinc-950">
                        <div className="flex items-center gap-3">
                          <Layout size={18} className="text-slate-400" />
                          <span className="font-medium text-sm text-slate-700 dark:text-zinc-300">{preset.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => loadLayoutPreset(preset.id)}
                            className="px-3 py-1.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 rounded text-xs font-medium hover:bg-slate-50 dark:hover:bg-zinc-700"
                          >
                            Load
                          </button>
                          {preset.id !== 'default' && (
                            <button
                              onClick={() => removeLayoutPreset(preset.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-6">
                <div className="p-4 border border-slate-200 dark:border-zinc-800 rounded-lg bg-slate-50 dark:bg-zinc-950">
                  <h3 className="text-sm font-medium text-slate-900 dark:text-zinc-100 mb-1">Export Data</h3>
                  <p className="text-sm text-slate-500 dark:text-zinc-400 mb-4">
                    Download a JSON backup of all your feeds, categories, and saved articles.
                  </p>
                  <button
                    onClick={handleExport}
                    className="px-4 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 rounded-md hover:bg-slate-50 dark:hover:bg-zinc-700 text-sm font-medium flex items-center gap-2"
                  >
                    <Download size={16} />
                    Export Backup
                  </button>
                </div>

                <div className="p-4 border border-slate-200 dark:border-zinc-800 rounded-lg bg-slate-50 dark:bg-zinc-950">
                  <h3 className="text-sm font-medium text-slate-900 dark:text-zinc-100 mb-1">Import Data</h3>
                  <p className="text-sm text-slate-500 dark:text-zinc-400 mb-4">
                    Restore your feeds and settings from a previous backup file.
                  </p>
                  <label className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium flex items-center gap-2 w-fit cursor-pointer">
                    <Upload size={16} />
                    Import Backup
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
