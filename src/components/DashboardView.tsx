import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  TrendingUp,
  Star,
  Plus,
  Megaphone,
  CheckSquare,
  Clock,
  Sparkles,
  Award,
  Edit3,
  Trash2,
  AlertTriangle,
  Calendar,
  MapPin,
  QrCode,
  Download,
  Printer,
  Copy,
  Check,
  Database,
} from 'lucide-react';
import { AnalyticsSummary, Session, EventItem } from '../types';
import { QRCodeImage } from './QRCodeImage';

interface DashboardViewProps {
  eventDetails?: EventItem;
  onUpdateEventDetails?: (event: Partial<EventItem>) => void;
  analytics: AnalyticsSummary;
  sessions: Session[];
  onNavigate: (tab: any) => void;
  onEraseAllData?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  eventDetails = {
    id: 'evt-101',
    title: 'TechSummit 2026 Global Conference',
    description: 'The premier community conference for engineering, AI innovation, and web leadership.',
    startDate: '2026-08-15T08:00:00Z',
    endDate: '2026-08-17T18:00:00Z',
    location: 'Metropolitan Convention Center, Main Hall & Online',
    capacity: 5000,
    organizerId: 'usr-1',
    status: 'ongoing',
  },
  onUpdateEventDetails,
  analytics,
  sessions,
  onNavigate,
  onEraseAllData,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEraseModalOpen, setIsEraseModalOpen] = useState(false);

  // Event QR Code Modal State
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [eventQRValue, setEventQRValue] = useState(`EVT-${eventDetails.title.replace(/[^A-Z0-9]/gi, '').toUpperCase()}-2026`);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);

  const [title, setTitle] = useState(eventDetails.title);
  const [description, setDescription] = useState(eventDetails.description);
  const [location, setLocation] = useState(eventDetails.location);
  const [capacity, setCapacity] = useState(eventDetails.capacity);

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateEventDetails) {
      onUpdateEventDetails({
        title,
        description,
        location,
        capacity: Number(capacity),
      });
    }
    setIsEditModalOpen(false);
  };

  const [isSavedToDb, setIsSavedToDb] = useState(false);

  const handleSaveQRToDatabase = async () => {
    try {
      const res = await fetch('/api/qr-codes/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode: eventQRValue }),
      });
      const data = await res.json();
      if (data.success) {
        setIsSavedToDb(true);
        setTimeout(() => setIsSavedToDb(false), 2500);
      } else {
        alert(data.message || 'QR Code already in database.');
      }
    } catch {
      alert('Error adding QR code to database.');
    }
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `${eventDetails.id}-event-qr-code.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyQRValue = () => {
    navigator.clipboard.writeText(eventQRValue);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePrintQR = () => {
    window.print();
  };

  return (
    <div className="p-4 md:p-8 max-w-[1440px] mx-auto space-y-8">
      {/* Event Header Banner with Edit Option & QR Code Option */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full uppercase border border-blue-200">
              Organizer Lead Dashboard
            </span>
            <span className="text-xs text-gray-400 font-mono">ID: {eventDetails.id}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            {eventDetails.title}
          </h1>
          <p className="text-xs md:text-sm text-gray-500 max-w-3xl leading-relaxed">
            {eventDetails.description}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 pt-2 font-medium">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-600" /> {eventDetails.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-600" /> Capacity: {eventDetails.capacity.toLocaleString()} Max Attendees
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => setIsQRModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <QrCode className="w-4 h-4" /> Generate Event QR
          </button>

          <button
            onClick={() => {
              setTitle(eventDetails.title);
              setDescription(eventDetails.description);
              setLocation(eventDetails.location);
              setCapacity(eventDetails.capacity);
              setIsEditModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-lg transition-all border border-blue-200 flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Edit3 className="w-4 h-4" /> Edit Event Details
          </button>

          {onEraseAllData && (
            <button
              onClick={() => setIsEraseModalOpen(true)}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-lg transition-all border border-red-200 flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Trash2 className="w-4 h-4" /> Erase Example Data
            </button>
          )}
        </div>
      </div>

      {/* Control Buttons Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Real-Time Metrics Overview</h2>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('qr-kiosk')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <UserCheck className="w-4 h-4" /> Open Check-in Kiosk
          </button>
          <button
            onClick={() => onNavigate('announcements')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Broadcast Update
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-gray-500 text-xs font-semibold uppercase mb-1">
            Total Registrations
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold text-gray-900">
              {analytics.totalRegistrations.toLocaleString()}
            </div>
            <div className="flex items-center text-green-600 text-xs font-bold gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +12%
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between text-gray-500 text-xs font-semibold uppercase mb-1">
            <span>Checked-In</span>
            <span className="text-gray-900 font-bold">{analytics.checkedInPercentage}%</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-2">
            {analytics.checkedInCount.toLocaleString()}
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${analytics.checkedInPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-gray-500 text-xs font-semibold uppercase mb-1">
            Active Volunteers
          </div>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-gray-900">
              {analytics.activeVolunteers}
            </div>
            <div className="flex -space-x-2">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
                alt="Vol"
                className="w-7 h-7 rounded-full border-2 border-white object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"
                alt="Vol"
                className="w-7 h-7 rounded-full border-2 border-white object-cover"
              />
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-gray-500 text-xs font-semibold uppercase mb-1">
            Avg Feedback
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold text-gray-900">
              {analytics.avgFeedbackRating}
            </div>
            <span className="text-xs text-gray-400 font-medium">/ 5.0</span>
          </div>
          <div className="flex text-amber-400 mt-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Live Schedule vs Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2/3: Live Schedule Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm min-h-[380px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" /> Live Event Schedule
              </h3>
              <button
                onClick={() => onNavigate('schedule')}
                className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                View Full Schedule &rarr;
              </button>
            </div>

            {sessions.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <h4 className="font-bold text-sm text-gray-700">No sessions currently scheduled</h4>
                <p className="text-xs text-gray-400 mt-1 mb-4">
                  Example data has been erased or no talk has been added yet.
                </p>
                <button
                  onClick={() => onNavigate('schedule')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-4 h-4 inline mr-1" /> Add First Session
                </button>
              </div>
            ) : (
              <div className="relative border-l-2 border-gray-100 ml-3 space-y-6">
                {sessions.map((ses) => (
                  <div key={ses.id} className="relative pl-6">
                    <div
                      className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-white ${
                        ses.isLive ? 'bg-green-500 animate-pulse' : 'bg-blue-600'
                      }`}
                    ></div>
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                      <h4 className="font-semibold text-sm text-gray-900">{ses.title}</h4>
                      <span className="font-mono text-xs text-gray-400 font-medium">
                        {ses.startTime} - {ses.endTime}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {ses.locationRoom} • Track: {ses.track} • Speaker: {ses.speakerName}
                    </p>

                    {ses.isLive && (
                      <span className="inline-block mt-2 px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold uppercase tracking-wider">
                        STARTING NOW
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1/3: Quick Actions & Operations */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 text-base mb-4">Quick Operations</h3>

            <div className="space-y-3">
              <button
                onClick={() => onNavigate('announcements')}
                className="w-full flex items-center justify-between p-3.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-white hover:border-blue-500/40 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      Broadcast Alert
                    </div>
                    <div className="text-xs text-gray-500">Send message to all attendees</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => onNavigate('volunteers')}
                className="w-full flex items-center justify-between p-3.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-white hover:border-emerald-500/40 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Assign Shifts</div>
                    <div className="text-xs text-gray-500">Manage volunteer staff roster</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => onNavigate('feedback-certs')}
                className="w-full flex items-center justify-between p-3.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-white hover:border-purple-500/40 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      Issue Certificates
                    </div>
                    <div className="text-xs text-gray-500">Auto generate attendee certs</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Event QR Code Modal */}
      {isQRModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 text-center space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-600" /> Official Event QR Pass Generator
              </h3>
              <button
                onClick={() => setIsQRModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* QR Code Printable Card */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center space-y-4">
              <div className="bg-white p-3.5 rounded-xl shadow-lg">
                <QRCodeImage
                  value={eventQRValue}
                  size={200}
                  onGenerated={(url) => setQrDataUrl(url)}
                />
              </div>

              <div className="text-center space-y-1 max-w-xs">
                <p className="font-extrabold text-base text-white">{eventDetails.title}</p>
                <p className="text-xs text-slate-400 font-mono">{eventDetails.location}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold rounded-md border border-emerald-500/30">
                  {eventQRValue}
                </span>
              </div>
            </div>

            {/* Custom QR String Editor */}
            <div className="text-left space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700">Custom QR Payload / Entrance Code</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={eventQRValue}
                  onChange={(e) => setEventQRValue(e.target.value)}
                  placeholder="e.g. EVT-TECHSUMMIT-2026"
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono text-gray-900 focus:outline-none focus:border-emerald-600"
                />
                <button
                  type="button"
                  onClick={handleCopyQRValue}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {isCopied ? 'Copied' : 'Copy Code'}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={handleSaveQRToDatabase}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                {isSavedToDb ? <Check className="w-4 h-4 text-green-300" /> : <Database className="w-4 h-4" />}
                {isSavedToDb ? 'Saved to DB!' : 'Add QR to Database'}
              </button>
              <button
                type="button"
                onClick={handlePrintQR}
                className="px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print Event Poster
              </button>
              <button
                type="button"
                onClick={handleDownloadQR}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4" /> Download PNG
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Event Details */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-blue-600" /> Edit Event Details
            </h3>
            <p className="text-xs text-gray-500 mb-4">Modify primary event information for Organizer Lead view.</p>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Location / Venue</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Capacity</label>
                <input
                  type="number"
                  required
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold cursor-pointer shadow-sm"
                >
                  Save Event Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Erasing All Example Data */}
      {isEraseModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-200 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Erase All Example Data?</h3>
            <p className="text-xs text-gray-500 mb-6">
              This will permanently clear all example registrations, volunteers, sessions, announcements, and certificates.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsEraseModalOpen(false)}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onEraseAllData) onEraseAllData();
                  setIsEraseModalOpen(false);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold cursor-pointer shadow-sm"
              >
                Yes, Erase Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
