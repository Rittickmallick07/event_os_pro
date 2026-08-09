import React, { useState } from 'react';
import { Megaphone, Send, AlertTriangle, BellRing, Sparkles, Clock } from 'lucide-react';
import { Announcement } from '../types';

interface AnnouncementsViewProps {
  announcements: Announcement[];
  onBroadcast: (title: string, message: string, priority: 'low' | 'normal' | 'urgent') => void;
}

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({
  announcements,
  onBroadcast,
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'low' | 'normal' | 'urgent'>('normal');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    onBroadcast(title.trim(), message.trim(), priority);

    setTitle('');
    setMessage('');
    setPriority('normal');
  };

  return (
    <div className="p-4 md:p-8 max-w-[1440px] mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-blue-600" /> Global Announcements & Broadcasting
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Push real-time broadcast alerts to attendees across mobile badges and web apps.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Broadcast Composer */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm sticky top-24">
            <h3 className="font-bold text-base text-gray-900 mb-1 flex items-center gap-2">
              <BellRing className="w-5 h-5 text-blue-600" /> Broadcast Alert
            </h3>
            <p className="text-xs text-gray-500 mb-5">
              Send immediate notification to all checked-in attendees.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Announcement Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Main Keynote Starting in 10 Minutes"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Broadcast Priority
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPriority('low')}
                    className={`py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      priority === 'low'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    Low Info
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriority('normal')}
                    className={`py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      priority === 'normal'
                        ? 'bg-green-50 border-green-500 text-green-800'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriority('urgent')}
                    className={`py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      priority === 'urgent'
                        ? 'bg-red-50 border-red-500 text-red-800'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    Urgent Alert
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Message Content
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. Please proceed towards Main Hall A. Keynote speaker Dr. Sarah Jenkins is taking stage."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-600"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" /> Broadcast Announcement Now
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Live Broadcast History Feed */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-base text-gray-900 mb-4">Live Announcement Stream</h3>

            <div className="space-y-4">
              {announcements.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs">
                  No announcements broadcast yet.
                </div>
              ) : (
                announcements.map((anc) => (
                  <div
                    key={anc.id}
                    className={`p-5 rounded-xl border transition-all ${
                      anc.priority === 'urgent'
                        ? 'bg-red-50/50 border-red-200'
                        : anc.priority === 'low'
                        ? 'bg-blue-50/50 border-blue-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        {anc.priority === 'urgent' && (
                          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                        )}
                        <h4 className="font-bold text-base text-gray-900">{anc.title}</h4>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          anc.priority === 'urgent'
                            ? 'bg-red-100 text-red-800'
                            : anc.priority === 'low'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {anc.priority}
                      </span>
                    </div>

                    <p className="text-xs text-gray-700 leading-relaxed mb-3">{anc.message}</p>

                    <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono pt-3 border-t border-current/10">
                      <span>Sender: {anc.authorName}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(anc.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
