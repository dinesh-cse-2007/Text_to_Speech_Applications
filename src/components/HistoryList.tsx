import { History, Play, Trash2, RotateCcw } from 'lucide-react';
import type { TTSHistoryEntry } from '@/lib/supabase';

interface HistoryListProps {
  entries: TTSHistoryEntry[];
  onReplay: (entry: TTSHistoryEntry) => void;
  onDelete: (id: string) => void;
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function HistoryList({ entries, onReplay, onDelete }: HistoryListProps) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-800/60 flex items-center justify-center mb-4">
          <History className="w-6 h-6 text-slate-500" />
        </div>
        <p className="text-slate-400 text-sm">No history yet</p>
        <p className="text-slate-600 text-xs mt-1">Your spoken texts will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1
      [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent
      [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="group rounded-xl border border-slate-800 bg-slate-900/40 p-3.5
            hover:border-slate-700 hover:bg-slate-800/40 transition-all duration-200"
        >
          <p className="text-slate-200 text-sm leading-snug line-clamp-2 mb-2">
            {entry.text}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-medium text-slate-400">{entry.voice_name}</span>
              <span className="text-slate-700">·</span>
              <span>{timeAgo(entry.created_at)}</span>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onReplay(entry)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/10 transition-all"
                title="Replay"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(entry.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
