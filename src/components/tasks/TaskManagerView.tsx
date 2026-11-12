import React, { useState } from 'react';
import {
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Edit2,
  Calendar,
  Clock,
  Sparkles,
  Search,
  Filter,
  AlertCircle,
  X,
  Check,
  Tag
} from 'lucide-react';
import { Task, Priority, ViewSection } from '../../types';
import { getTodayDateString } from '../../services/storage';

interface TaskManagerViewProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'completedBlocks' | 'completed'>) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleTask: (taskId: string) => void;
  onNavigate: (section: ViewSection) => void;
}

export const TaskManagerView: React.FC<TaskManagerViewProps> = ({
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleTask,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'high'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('HIGH');
  const [newEstimatedBlocks, setNewEstimatedBlocks] = useState(2);
  const [newDueDate, setNewDueDate] = useState(getTodayDateString());
  const [newCategory, setNewCategory] = useState('Deep Work');

  const categories = ['All', 'Deep Work', 'Strategy', 'Code', 'Study', 'Admin', 'Health'];

  const handleOpenAdd = () => {
    setNewTitle('');
    setNewDescription('');
    setNewPriority('HIGH');
    setNewEstimatedBlocks(2);
    setNewDueDate(getTodayDateString());
    setNewCategory('Deep Work');
    setIsAddModalOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTask({
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      priority: newPriority,
      estimatedBlocks: Number(newEstimatedBlocks) || 1,
      dueDate: newDueDate || undefined,
      category: newCategory,
    });

    setIsAddModalOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editingTask.title.trim()) return;

    onUpdateTask(editingTask.id, {
      title: editingTask.title.trim(),
      description: editingTask.description?.trim(),
      priority: editingTask.priority,
      estimatedBlocks: Number(editingTask.estimatedBlocks),
      dueDate: editingTask.dueDate,
      category: editingTask.category,
    });

    setEditingTask(null);
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchCat = t.category.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCat) return false;
    }

    // Status filter
    if (filterStatus === 'pending' && t.completed) return false;
    if (filterStatus === 'completed' && !t.completed) return false;
    if (filterStatus === 'high' && t.priority !== 'HIGH') return false;

    // Category filter
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;

    return true;
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100 font-display">
            High-Leverage Tasks
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            {pendingCount} pending · {completedCount} completed · Single-tasking discipline
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('mentor')}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-emerald-400 bg-emerald-950/30 hover:bg-emerald-950/50 border border-emerald-900/50 rounded-lg transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Prioritize</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#111114] border border-[#1f1f24] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks, descriptions, or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#15151a] border border-[#24242c] rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Status segmented tabs */}
        <div className="flex items-center gap-1 bg-[#15151a] p-1 rounded-lg border border-[#24242c] text-xs">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'pending', label: 'Pending' },
              { id: 'high', label: 'High Priority' },
              { id: 'completed', label: 'Completed' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                filterStatus === tab.id
                  ? 'bg-[#22222a] text-zinc-100 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category selector */}
        <div className="flex items-center gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 text-xs bg-[#15151a] border border-[#24242c] rounded-lg text-zinc-300 focus:outline-none focus:border-emerald-500"
          >
            {categories.map((c) => (
              <option key={c} value={c === 'All' ? 'all' : c}>
                {c === 'All' ? 'All Categories' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Task List Table */}
      <div className="rounded-xl bg-[#111114] border border-[#1f1f24] overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-zinc-600 mx-auto" />
            <h3 className="text-sm font-semibold text-zinc-300">No tasks match criteria</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Clear your filters or create a new high-leverage focus item.
            </p>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 text-xs text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg font-semibold"
            >
              Add First Task
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#1a1a20]">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 sm:px-6 flex items-start justify-between gap-4 hover:bg-[#141418] transition-colors group"
              >
                {/* Left: Checkbox & Content */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className="mt-1 text-zinc-500 hover:text-emerald-400 transition-colors shrink-0"
                    aria-label={task.completed ? 'Mark task incomplete' : 'Mark task complete'}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-zinc-600 hover:text-zinc-400" />
                    )}
                  </button>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-sm font-semibold leading-snug break-words ${
                          task.completed ? 'line-through text-zinc-500' : 'text-zinc-100'
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>

                    {task.description && (
                      <p
                        className={`text-xs leading-relaxed max-w-3xl ${
                          task.completed ? 'text-zinc-600' : 'text-zinc-400'
                        }`}
                      >
                        {task.description}
                      </p>
                    )}

                    {/* Clean unboxed metadata with separators */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-500 font-mono pt-1">
                      <span
                        className={
                          task.priority === 'HIGH'
                            ? 'text-rose-400 font-semibold'
                            : task.priority === 'MEDIUM'
                            ? 'text-amber-400'
                            : 'text-zinc-400'
                        }
                      >
                        {task.priority}
                      </span>
                      <span>·</span>
                      <span className="text-zinc-400">{task.category}</span>
                      <span>·</span>
                      <span className="text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {task.completedBlocks}/{task.estimatedBlocks} blocks ({task.estimatedBlocks * 25}m)
                        </span>
                      </span>
                      {task.dueDate && (
                        <>
                          <span>·</span>
                          <span className="text-zinc-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Due {task.dueDate}</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {!task.completed && (
                    <button
                      onClick={() => onNavigate('timer')}
                      title="Start focus timer on this task"
                      className="p-2 text-zinc-400 hover:text-emerald-400 hover:bg-[#1a1a20] rounded-lg transition-colors"
                    >
                      <Clock className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => setEditingTask(task)}
                    title="Edit task"
                    className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1a20] rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeleteTask(task.id)}
                    title="Delete task"
                    className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-[#1a1a20] rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-[#111114] border border-[#24242c] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1a1a20] pb-3">
              <h3 className="text-base font-bold text-zinc-100 font-display">
                Create High-Leverage Task
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Write RFC for real-time messaging architecture"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#16161c] border border-[#2a2a34] rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">
                  Description / Definition of Done
                </label>
                <textarea
                  rows={3}
                  placeholder="What concrete deliverable marks this task as completely finished?"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#16161c] border border-[#2a2a34] rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 text-xs bg-[#16161c] border border-[#2a2a34] rounded-lg text-zinc-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="HIGH">HIGH (Needle-Mover)</option>
                    <option value="MEDIUM">MEDIUM (Important)</option>
                    <option value="LOW">LOW (Batch / Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#16161c] border border-[#2a2a34] rounded-lg text-zinc-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Deep Work">Deep Work</option>
                    <option value="Strategy">Strategy</option>
                    <option value="Code">Code</option>
                    <option value="Study">Study</option>
                    <option value="Admin">Admin</option>
                    <option value="Health">Health</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">
                    Estimated 25m Blocks
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={newEstimatedBlocks}
                    onChange={(e) => setNewEstimatedBlocks(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-[#16161c] border border-[#2a2a34] rounded-lg text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#16161c] border border-[#2a2a34] rounded-lg text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1a1a20]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-[#111114] border border-[#24242c] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1a1a20] pb-3">
              <h3 className="text-base font-bold text-zinc-100 font-display">
                Edit Task
              </h3>
              <button
                onClick={() => setEditingTask(null)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#16161c] border border-[#2a2a34] rounded-lg text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editingTask.description || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#16161c] border border-[#2a2a34] rounded-lg text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">
                    Priority
                  </label>
                  <select
                    value={editingTask.priority}
                    onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as Priority })}
                    className="w-full px-3 py-2 text-xs bg-[#16161c] border border-[#2a2a34] rounded-lg text-zinc-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="HIGH">HIGH (Needle-Mover)</option>
                    <option value="MEDIUM">MEDIUM (Important)</option>
                    <option value="LOW">LOW (Batch / Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">
                    Estimated Blocks
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={editingTask.estimatedBlocks}
                    onChange={(e) => setEditingTask({ ...editingTask, estimatedBlocks: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-[#16161c] border border-[#2a2a34] rounded-lg text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1a1a20]">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 text-xs text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
