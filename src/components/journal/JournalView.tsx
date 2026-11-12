import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  Save,
  Star,
  Search,
  Trash2,
  Edit3,
  Quote,
  CheckCircle,
  Plus,
  ArrowRight,
  Shield,
  FileText
} from 'lucide-react';
import { JournalEntry } from '../../types';
import { getTodayDateString } from '../../services/storage';

interface JournalViewProps {
  entries: JournalEntry[];
  onSaveEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteEntry: (entryId: string) => void;
}

export const JournalView: React.FC<JournalViewProps> = ({
  entries,
  onSaveEntry,
  onDeleteEntry,
}) => {
  const todayStr = getTodayDateString();
  const existingToday = entries.find((e) => e.date === todayStr);

  const [date, setDate] = useState(todayStr);
  const [clarityScore, setClarityScore] = useState<number>(existingToday?.clarityScore || 5);
  const [morningIntention, setMorningIntention] = useState(existingToday?.morningIntention || '');
  const [eveningReview, setEveningReview] = useState(existingToday?.eveningReview || '');
  const [distractionsEncountered, setDistractionsEncountered] = useState(
    existingToday?.distractionsEncountered || ''
  );
  const [oneBigVictory, setOneBigVictory] = useState(existingToday?.oneBigVictory || '');
  const [gratitudeOrStoicNote, setGratitudeOrStoicNote] = useState(
    existingToday?.gratitudeOrStoicNote || ''
  );
  const [tagsInput, setTagsInput] = useState(existingToday?.tags.join(', ') || 'Deep Work, Focus');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSaveEntry({
      date,
      clarityScore,
      morningIntention,
      eveningReview,
      distractionsEncountered,
      oneBigVictory,
      gratitudeOrStoicNote,
      tags: parsedTags,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const loadEntryIntoForm = (entry: JournalEntry) => {
    setDate(entry.date);
    setClarityScore(entry.clarityScore);
    setMorningIntention(entry.morningIntention);
    setEveningReview(entry.eveningReview);
    setDistractionsEncountered(entry.distractionsEncountered);
    setOneBigVictory(entry.oneBigVictory);
    setGratitudeOrStoicNote(entry.gratitudeOrStoicNote);
    setTagsInput(entry.tags.join(', '));
    setSelectedEntry(null);
  };

  const filteredEntries = entries.filter((e) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      e.date.includes(q) ||
      e.morningIntention.toLowerCase().includes(q) ||
      e.eveningReview.toLowerCase().includes(q) ||
      e.oneBigVictory.toLowerCase().includes(q) ||
      e.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100 font-display">
            Monk Mode Reflective Journal
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            "An unexamined life of distraction is not worth living." — Marcus Aurelius
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-zinc-400">Total Entries:</span>
          <span className="text-xs font-mono font-bold text-emerald-400">{entries.length}</span>
        </div>
      </div>

      {/* Main Split: Left Writer & Right Archive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: The Journal Editor */}
        <div className="lg:col-span-2 rounded-2xl bg-[#111114] border border-[#1f1f24] p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1a1a20] pb-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="px-2.5 py-1 text-xs bg-[#16161c] border border-[#2a2a34] rounded-lg text-zinc-200 font-mono focus:outline-none focus:border-emerald-500"
              />
              {date === todayStr && (
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/40">
                  Today's Reflection
                </span>
              )}
            </div>

            {/* Clarity Score Rating (1 to 5) */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-400">Mind Clarity:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setClarityScore(star)}
                    className="p-1 text-zinc-500 hover:text-amber-400 transition-colors"
                    title={`Rate clarity ${star}/5`}
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= clarityScore
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-zinc-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            {/* Morning Intention */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-200 font-display flex items-center justify-between">
                <span>1. Morning Anchor & Singular Priority</span>
                <span className="text-[11px] font-mono font-normal text-zinc-500">Am</span>
              </label>
              <textarea
                rows={2}
                placeholder="What is the non-negotiable needle-moving outcome for today? What will I ignore?"
                value={morningIntention}
                onChange={(e) => setMorningIntention(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#15151a] border border-[#222228] rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 leading-relaxed"
              />
            </div>

            {/* Evening Review */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-200 font-display flex items-center justify-between">
                <span>2. Evening Stoic Review & Discipline Audit</span>
                <span className="text-[11px] font-mono font-normal text-zinc-500">Pm</span>
              </label>
              <textarea
                rows={3}
                placeholder="Did my actions match my intentions? Where was my energy squandered or preserved?"
                value={eveningReview}
                onChange={(e) => setEveningReview(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#15151a] border border-[#222228] rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 leading-relaxed"
              />
            </div>

            {/* Distraction Vector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-200 font-display">
                3. Distractions & Friction Encountered
              </label>
              <input
                type="text"
                placeholder="e.g. Felt temptation to open social feed around 3 PM; switched to water break."
                value={distractionsEncountered}
                onChange={(e) => setDistractionsEncountered(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#15151a] border border-[#222228] rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* One Big Victory */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-200 font-display">
                4. The Decisive Victory of the Day
              </label>
              <input
                type="text"
                placeholder="e.g. Finished the complete backend architecture without context switching."
                value={oneBigVictory}
                onChange={(e) => setOneBigVictory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#15151a] border border-[#222228] rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Stoic Note / Memento Mori */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-200 font-display">
                5. Stoic Principle / Gratitude Note
              </label>
              <input
                type="text"
                placeholder="e.g. The impediment to action advances action. What stands in the way becomes the way."
                value={gratitudeOrStoicNote}
                onChange={(e) => setGratitudeOrStoicNote(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#15151a] border border-[#222228] rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-zinc-400">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                placeholder="Deep Work, Flow, Stoic, Architecture"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-[#15151a] border border-[#222228] rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Save Action */}
            <div className="flex items-center justify-between pt-4 border-t border-[#1a1a20]">
              <div>
                {saveSuccess && (
                  <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5 animate-fade-in">
                    <CheckCircle className="w-4 h-4" />
                    <span>Reflection saved to persistent vault.</span>
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-md active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Save Reflection</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right 1 Col: Previous Entries Archive */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#111114] border border-[#1f1f24] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-100 font-display">
                Past Reflections
              </h3>
              <BookOpen className="w-4 h-4 text-emerald-400" />
            </div>

            {/* Search archive */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search past logs..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#16161c] border border-[#24242c] rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Entry cards list */}
            <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
              {filteredEntries.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500">
                  No matching reflections found.
                </div>
              ) : (
                filteredEntries.map((entry) => (
                  <div
                    key={entry.id}
                    onClick={() => setSelectedEntry(entry)}
                    className="p-3.5 rounded-xl bg-[#141418] hover:bg-[#18181f] border border-[#202028] hover:border-zinc-700 cursor-pointer transition-all space-y-2 group"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-zinc-200 font-medium">{entry.date}</span>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: entry.clarityScore }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>

                    {entry.morningIntention && (
                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {entry.morningIntention}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1 border-t border-[#1a1a22]">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {entry.tags.slice(0, 2).map((tag, idx) => (
                          <span key={idx} className="text-zinc-400 font-mono">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            loadEntryIntoForm(entry);
                          }}
                          title="Load into editor"
                          className="p-1 hover:text-emerald-400 rounded"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteEntry(entry.id);
                          }}
                          title="Delete entry"
                          className="p-1 hover:text-rose-400 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Entry Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl bg-[#111114] border border-[#24242c] p-6 space-y-5 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1a1a20] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <h3 className="text-base font-bold text-zinc-100 font-display">
                  Reflection for {selectedEntry.date}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => loadEntryIntoForm(selectedEntry)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-mono"
                >
                  Edit in form
                </button>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="text-zinc-400 hover:text-zinc-200 text-xs font-mono"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-[#15151a] rounded-lg border border-[#202028]">
                <span className="font-mono text-zinc-400 block mb-1">Morning Intention</span>
                <p className="text-zinc-200 leading-relaxed">{selectedEntry.morningIntention || '—'}</p>
              </div>

              <div className="p-3 bg-[#15151a] rounded-lg border border-[#202028]">
                <span className="font-mono text-zinc-400 block mb-1">Evening Stoic Review</span>
                <p className="text-zinc-200 leading-relaxed">{selectedEntry.eveningReview || '—'}</p>
              </div>

              {selectedEntry.distractionsEncountered && (
                <div className="p-3 bg-[#15151a] rounded-lg border border-[#202028]">
                  <span className="font-mono text-zinc-400 block mb-1">Distractions Encountered</span>
                  <p className="text-zinc-300 leading-relaxed">{selectedEntry.distractionsEncountered}</p>
                </div>
              )}

              {selectedEntry.oneBigVictory && (
                <div className="p-3 bg-[#15151a] rounded-lg border border-[#202028]">
                  <span className="font-mono text-emerald-400 block mb-1">One Big Victory</span>
                  <p className="text-zinc-200 font-medium leading-relaxed">{selectedEntry.oneBigVictory}</p>
                </div>
              )}

              {selectedEntry.gratitudeOrStoicNote && (
                <div className="p-3 bg-[#15151a] rounded-lg border border-[#202028]">
                  <span className="font-mono text-amber-400 block mb-1">Stoic Note / Principle</span>
                  <p className="text-zinc-300 italic leading-relaxed">"{selectedEntry.gratitudeOrStoicNote}"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
