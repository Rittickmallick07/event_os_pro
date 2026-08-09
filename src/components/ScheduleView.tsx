import React, { useState } from 'react';
import { Calendar, Plus, Clock, MapPin, User, Edit3, Trash2 } from 'lucide-react';
import { Session } from '../types';

interface ScheduleViewProps {
  sessions: Session[];
  onAddSession: (newSession: Partial<Session>) => void;
  onEditSession?: (id: string, updated: Partial<Session>) => void;
  onDeleteSession?: (id: string) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  sessions,
  onAddSession,
  onEditSession,
  onDeleteSession,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);

  // New session form state
  const [title, setTitle] = useState('');
  const [speakerName, setSpeakerName] = useState('');
  const [track, setTrack] = useState('Main Stage');
  const [locationRoom, setLocationRoom] = useState('Main Stage Hall A');
  const [startTime, setStartTime] = useState('02:00 PM');
  const [endTime, setEndTime] = useState('03:00 PM');
  const [description, setDescription] = useState('Engaging community track session.');

  // Edit session form state
  const [editTitle, setEditTitle] = useState('');
  const [editSpeakerName, setEditSpeakerName] = useState('');
  const [editTrack, setEditTrack] = useState('Main Stage');
  const [editLocationRoom, setEditLocationRoom] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const tracks = ['Main Stage', 'Workshop Room A', 'Networking Lounge'];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !speakerName.trim()) return;

    onAddSession({
      title: title.trim(),
      speakerName: speakerName.trim(),
      track,
      locationRoom,
      startTime,
      endTime,
      description,
    });

    setTitle('');
    setSpeakerName('');
    setIsAddModalOpen(false);
  };

  const handleOpenEdit = (ses: Session) => {
    setEditingSession(ses);
    setEditTitle(ses.title);
    setEditSpeakerName(ses.speakerName);
    setEditTrack(ses.track);
    setEditLocationRoom(ses.locationRoom);
    setEditStartTime(ses.startTime);
    setEditEndTime(ses.endTime);
    setEditDescription(ses.description);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession || !onEditSession) return;

    onEditSession(editingSession.id, {
      title: editTitle.trim(),
      speakerName: editSpeakerName.trim(),
      track: editTrack,
      locationRoom: editLocationRoom,
      startTime: editStartTime,
      endTime: editEndTime,
      description: editDescription,
    });

    setEditingSession(null);
  };

  return (
    <div className="p-4 md:p-8 max-w-[1440px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" /> Speaker Schedule & Track Board
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage sessions, tracks, speaker allocations, and session times.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Session
        </button>
      </div>

      {/* Track Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tracks.map((trackName) => {
          const trackSessions = sessions.filter((s) => s.track === trackName);
          return (
            <div key={trackName} className="flex flex-col">
              <div className="bg-white border border-gray-200 rounded-t-xl p-4 border-b-2 border-b-blue-600">
                <h3 className="font-bold text-base text-gray-900">{trackName}</h3>
                <p className="text-xs text-gray-500">{trackSessions.length} Scheduled Sessions</p>
              </div>

              <div className="bg-gray-50/80 rounded-b-xl p-3 border border-gray-200 border-t-0 space-y-3 min-h-[450px]">
                {trackSessions.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-xs">
                    No sessions scheduled for this track yet.
                  </div>
                ) : (
                  trackSessions.map((ses) => (
                    <div
                      key={ses.id}
                      className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:border-blue-500 transition-all relative overflow-hidden group cursor-pointer"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>

                      <div className="flex justify-between items-center mb-2 pl-2">
                        <span className="font-mono text-xs font-bold text-blue-600 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {ses.startTime} - {ses.endTime}
                        </span>
                        <div className="flex items-center gap-1">
                          {ses.isLive && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase mr-1">
                              LIVE
                            </span>
                          )}
                          <button
                            onClick={() => handleOpenEdit(ses)}
                            className="p-1 text-gray-400 hover:text-blue-600 rounded hover:bg-gray-100 transition-colors"
                            title="Edit Session"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {onDeleteSession && (
                            <button
                              onClick={() => onDeleteSession(ses.id)}
                              className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-gray-100 transition-colors"
                              title="Delete Session"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <h4 className="font-bold text-sm text-gray-900 pl-2 mb-2 leading-snug">
                        {ses.title}
                      </h4>

                      <p className="text-xs text-gray-500 pl-2 mb-3 line-clamp-2">
                        {ses.description}
                      </p>

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between pl-2 text-xs text-gray-600">
                        <span className="flex items-center gap-1.5 font-medium text-gray-800">
                          <User className="w-3.5 h-3.5 text-blue-600" /> {ses.speakerName}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-gray-400">
                          <MapPin className="w-3 h-3" /> {ses.locationRoom}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Session Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Schedule New Session</h3>
            <p className="text-xs text-gray-500 mb-4">Add a new talk or workshop to the speaker schedule.</p>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Session Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Scaling Real-Time Microservices"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Speaker Name
                </label>
                <input
                  type="text"
                  required
                  value={speakerName}
                  onChange={(e) => setSpeakerName(e.target.value)}
                  placeholder="e.g. Dr. Sarah Jenkins"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Track</label>
                  <select
                    value={track}
                    onChange={(e) => setTrack(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none"
                  >
                    {tracks.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Room</label>
                  <input
                    type="text"
                    value={locationRoom}
                    onChange={(e) => setLocationRoom(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Start Time</label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono text-gray-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">End Time</label>
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono text-gray-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold cursor-pointer shadow-sm"
                >
                  Publish Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Session Modal */}
      {editingSession && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-blue-600" /> Edit Session
            </h3>
            <p className="text-xs text-gray-500 mb-4">Update session info, speaker, and time slot.</p>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Session Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Speaker Name</label>
                <input
                  type="text"
                  required
                  value={editSpeakerName}
                  onChange={(e) => setEditSpeakerName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Track</label>
                  <select
                    value={editTrack}
                    onChange={(e) => setEditTrack(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none"
                  >
                    {tracks.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Room</label>
                  <input
                    type="text"
                    value={editLocationRoom}
                    onChange={(e) => setEditLocationRoom(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Start Time</label>
                  <input
                    type="text"
                    value={editStartTime}
                    onChange={(e) => setEditStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono text-gray-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">End Time</label>
                  <input
                    type="text"
                    value={editEndTime}
                    onChange={(e) => setEditEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono text-gray-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingSession(null)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold cursor-pointer shadow-sm"
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
