import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AudioLines,
  Play,
  Pause,
  Square,
  Trash2,
  Mic,
  ChevronDown,
} from 'lucide-react';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { WaveformVisualizer } from '@/components/WaveformVisualizer';
import { VoiceSettings } from '@/components/VoiceSettings';
import { HistoryList } from '@/components/HistoryList';
import { supabase, type TTSHistoryEntry } from '@/lib/supabase';

const MAX_CHARS = 5000;

export default function App() {
  const { voices, isSpeaking, isPaused, progress, supported, speak, pause, resume, stop } =
    useSpeechSynthesis();

  const [text, setText] = useState('');
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [history, setHistory] = useState<TTSHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [voiceMenuOpen, setVoiceMenuOpen] = useState(false);
  const [saveError, setSaveError] = useState(false);

  // Default to first available English voice
  useEffect(() => {
    if (voices.length > 0 && !selectedVoiceURI) {
      const englishVoice =
        voices.find((v) => v.lang.startsWith('en') && v.default) ||
        voices.find((v) => v.lang.startsWith('en')) ||
        voices[0];
      setSelectedVoiceURI(englishVoice.voiceURI);
    }
  }, [voices, selectedVoiceURI]);

  const selectedVoice = useMemo(
    () => voices.find((v) => v.voiceURI === selectedVoiceURI) ?? null,
    [voices, selectedVoiceURI]
  );

  // Load history from Supabase
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('tts_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        setHistory(data as TTSHistoryEntry[]);
      }
      setHistoryLoading(false);
    })();
  }, []);

  const handleSpeak = useCallback(async () => {
    if (!text.trim() || !selectedVoice) return;

    speak(text, { voice: selectedVoice, rate, pitch, volume });

    const { error } = await supabase.from('tts_history').insert({
      text: text.trim(),
      voice_name: selectedVoice.name,
      rate,
      pitch,
      volume,
    });

    if (error) {
      setSaveError(true);
      setTimeout(() => setSaveError(false), 3000);
      return;
    }

    const { data } = await supabase
      .from('tts_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) {
      setHistory(data as TTSHistoryEntry[]);
    }
  }, [text, selectedVoice, rate, pitch, volume, speak]);

  const handlePauseResume = useCallback(() => {
    if (isPaused) resume();
    else pause();
  }, [isPaused, pause, resume]);

  const handleStop = useCallback(() => {
    stop();
  }, [stop]);

  const handleClear = useCallback(() => {
    setText('');
    stop();
  }, [stop]);

  const handleDelete = useCallback(async (id: string) => {
    setHistory((prev) => prev.filter((e) => e.id !== id));
    await supabase.from('tts_history').delete().eq('id', id);
  }, []);

  const handleReplay = useCallback(
    (entry: TTSHistoryEntry) => {
      const voice = voices.find((v) => v.name === entry.voice_name);
      speak(entry.text, {
        voice: voice ?? selectedVoice,
        rate: entry.rate,
        pitch: entry.pitch,
        volume: entry.volume,
      });
    },
    [voices, selectedVoice, speak]
  );

  // Group voices by language
  const groupedVoices = useMemo(() => {
    const groups: Record<string, SpeechSynthesisVoice[]> = {};
    for (const voice of voices) {
      const lang = voice.lang;
      if (!groups[lang]) groups[lang] = [];
      groups[lang].push(voice);
    }
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [voices]);

  const charCount = text.length;
  const canSpeak = text.trim().length > 0 && !!selectedVoice && supported;

  if (!supported) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-6">
            <AudioLines className="w-8 h-8 text-slate-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-200 mb-3">
            Speech Not Supported
          </h1>
          <p className="text-slate-400">
            Your browser does not support the Web Speech API. Please try a
            modern browser like Chrome, Edge, or Safari.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Ambient background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <header className="flex flex-col items-center text-center mb-10 sm:mb-12">
          <div className="relative mb-5">
            <div className="absolute inset-0 bg-cyan-400/30 blur-2xl rounded-2xl" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <AudioLines className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-b from-white to-slate-300 bg-clip-text text-transparent">
            VoiceCraft
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-md">
            Transform any text into natural speech. Pick a voice, adjust the
            tone, and let it speak.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Text editor card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
              {/* Voice selector */}
              <div className="border-b border-slate-800 p-4">
                <div className="relative">
                  <button
                    onClick={() => setVoiceMenuOpen((v) => !v)}
                    className="w-full flex items-center justify-between gap-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 px-4 py-3 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center flex-shrink-0">
                        <Mic className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="text-left min-w-0">
                        <div className="text-sm font-medium text-slate-200 truncate">
                          {selectedVoice?.name ?? 'Select a voice'}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {selectedVoice?.lang ?? '—'}
                        </div>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                        voiceMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {voiceMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setVoiceMenuOpen(false)}
                      />
                      <div className="absolute top-full left-0 right-0 mt-2 z-20 rounded-xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/50 max-h-72 overflow-y-auto
                        [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent
                        [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
                        {groupedVoices.map(([lang, langVoices]) => (
                          <div key={lang}>
                            <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide bg-slate-800/40 sticky top-0">
                              {lang}
                            </div>
                            {langVoices.map((voice) => (
                              <button
                                key={voice.voiceURI}
                                onClick={() => {
                                  setSelectedVoiceURI(voice.voiceURI);
                                  setVoiceMenuOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between gap-2 ${
                                  voice.voiceURI === selectedVoiceURI
                                    ? 'bg-cyan-500/10 text-cyan-300'
                                    : 'text-slate-300 hover:bg-slate-800/60'
                                }`}
                              >
                                <span className="truncate">{voice.name}</span>
                                {voice.voiceURI === selectedVoiceURI && (
                                  <span className="text-xs text-cyan-400 flex-shrink-0">
                                    Selected
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Text area */}
              <div className="p-4">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
                  placeholder="Type or paste any text here..."
                  className="w-full h-44 bg-transparent text-slate-100 placeholder:text-slate-600 text-base leading-relaxed resize-none outline-none
                    [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent
                    [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full"
                />
                <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-800">
                  <button
                    onClick={handleClear}
                    disabled={!text}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear
                  </button>
                  <span
                    className={`text-xs font-mono tabular-nums ${
                      charCount > MAX_CHARS * 0.9
                        ? 'text-amber-400'
                        : 'text-slate-600'
                    }`}
                  >
                    {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Playback card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm p-6">
              <WaveformVisualizer active={isSpeaking && !isPaused} />

              {/* Progress bar */}
              <div className="mt-4 h-1 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3 mt-6">
                {!isSpeaking ? (
                  <button
                    onClick={handleSpeak}
                    disabled={!canSpeak}
                    className="flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-8 py-3.5 font-semibold text-white shadow-lg shadow-cyan-500/20
                      hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98]
                      disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none
                      transition-all duration-200"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    Speak
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handlePauseResume}
                      className="flex items-center gap-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-6 py-3.5 font-semibold text-slate-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {isPaused ? (
                        <>
                          <Play className="w-5 h-5 fill-current" />
                          Resume
                        </>
                      ) : (
                        <>
                          <Pause className="w-5 h-5 fill-current" />
                          Pause
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleStop}
                      className="flex items-center gap-2.5 rounded-xl bg-slate-800 hover:bg-red-500/20 hover:text-red-400 px-6 py-3.5 font-semibold text-slate-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Square className="w-4 h-4 fill-current" />
                      Stop
                    </button>
                  </>
                )}
              </div>

              {saveError && (
                <p className="text-center text-amber-400 text-xs mt-3">
                  Could not save to history — playback still works.
                </p>
              )}
            </div>

            {/* Voice settings */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm p-6">
              <VoiceSettings
                rate={rate}
                pitch={pitch}
                volume={volume}
                onRateChange={setRate}
                onPitchChange={setPitch}
                onVolumeChange={setVolume}
              />
            </div>
          </div>

          {/* History sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm p-6 lg:sticky lg:top-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                  <AudioLines className="w-4 h-4 text-slate-400" />
                </div>
                <h2 className="font-semibold text-slate-200">History</h2>
                {history.length > 0 && (
                  <span className="ml-auto text-xs text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded-full">
                    {history.length}
                  </span>
                )}
              </div>
              {historyLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-20 rounded-xl bg-slate-800/40 animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <HistoryList
                  entries={history}
                  onReplay={handleReplay}
                  onDelete={handleDelete}
                />
              )}
            </div>
          </div>
        </div>

        <footer className="text-center text-slate-600 text-xs mt-12">
          Powered by the Web Speech API · Voices depend on your browser and OS
        </footer>
      </div>
    </div>
  );
}
