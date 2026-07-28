 import React, { useState, useEffect } from 'react';
import {
  MoodEntry,
  MOOD_EMOJI,
  MOOD_COLORS,
  MOODS,
  MOOD_HEX_COLORS,
} from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { api, apiDownloadPDF } from '../services/api';

const HistoryPage: React.FC = () => {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [editingEntry, setEditingEntry] = useState<MoodEntry | null>(null);

  /* ================= FETCH HISTORY ================= */
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        const data = await api(`/mood/user/${userId}`);

        const formatted = data.map((item: any) => ({
          id: item._id,
          date: item.date || item.createdAt,
          mood: item.mood.charAt(0).toUpperCase() + item.mood.slice(1),
          text: item.notes || '',
        }));

        setEntries(formatted);
      } catch (err) {
        console.error(err);
        setEntries([]);
      }
    };

    fetchHistory();
  }, []);

  /* ================= CHART DATA ================= */
  useEffect(() => {
    if (entries.length === 0) return;

    const data = entries.reduce((acc: any, entry) => {
      const date = new Date(entry.date).toLocaleDateString('en-CA');

      if (!acc[date]) {
        acc[date] = {
          date,
          ...MOODS.reduce(
            (m: any, mood) => ({ ...m, [mood]: 0 }),
            {}
          ),
        };
      }

      acc[date][entry.mood]++;
      return acc;
    }, {});

    setChartData(Object.values(data).slice(-30));
  }, [entries]);

  /* ================= DELETE ================= */
  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this entry?')) return;

    try {
      await api(`/mood/${id}`, 'DELETE');
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= EDIT SAVE ================= */
  const handleEditSave = async () => {
    if (!editingEntry) return;

    try {
      await api(`/mood/${editingEntry.id}`, 'PUT', {
        mood: editingEntry.mood.toLowerCase(),
        notes: editingEntry.text,
      });

      setEntries(prev =>
        prev.map(e =>
          e.id === editingEntry.id ? editingEntry : e
        )
      );

      setEditingEntry(null);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= WEEKLY PDF ================= */
  const handleWeeklyPDF = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      const blob = await apiDownloadPDF(
        `/mood/pdf/week/${userId}`
      );

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'mood-last-7-days.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to download weekly PDF');
    }
  };

  return (
    <div className="space-y-8">

      {/* ================= CHART ================= */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Your Mood Trends</h2>

          <button
            onClick={handleWeeklyPDF}
            className="px-4 py-2 bg-primary text-white rounded-lg"
          >
            📄 Last 7 Days PDF
          </button>
        </div>

        {entries.length > 0 ? (
          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                {MOODS.map(mood => (
                  <Bar
                    key={mood}
                    dataKey={mood}
                    stackId="a"
                    fill={MOOD_HEX_COLORS[mood]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p>No data yet</p>
        )}
      </div>

      {/* ================= HISTORY LIST ================= */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold mb-4">Full History</h3>

        {entries.map(entry => (
          <div
            key={entry.id}
            className="p-4 mb-3 rounded-lg border-l-4"
            style={{ borderColor: MOOD_HEX_COLORS[entry.mood] }}
          >
            <div className="flex justify-between">
              <div>
                <span className="text-2xl">
                  {MOOD_EMOJI[entry.mood]}
                </span>
                <span className={`ml-2 ${MOOD_COLORS[entry.mood]}`}>
                  {entry.mood}
                </span>
                <p className="mt-2">{entry.text}</p>
              </div>

              <div className="text-right space-y-2">
                <span className="text-sm block">
                  {new Date(entry.date).toLocaleString()}
                </span>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setEditingEntry(entry)}
                    className="text-blue-600"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-red-600"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ================= EDIT MODAL ================= */}
      {editingEntry && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96">
            <h3 className="font-bold mb-3">Edit Entry</h3>

            <select
              className="w-full border p-2 rounded"
              value={editingEntry.mood}
              onChange={e =>
                setEditingEntry({
                  ...editingEntry,
                  mood: e.target.value,
                })
              }
            >
              {MOODS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <textarea
              className="w-full border p-2 rounded mt-3"
              value={editingEntry.text}
              onChange={e =>
                setEditingEntry({
                  ...editingEntry,
                  text: e.target.value,
                })
              }
            />

            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setEditingEntry(null)}>
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                className="bg-primary text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default HistoryPage;
