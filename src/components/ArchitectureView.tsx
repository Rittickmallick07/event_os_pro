import React, { useState, useEffect } from 'react';
import { Database, FolderTree, Server, Copy, Check, Terminal, Sparkles } from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'sql' | 'folder' | 'api'>('sql');
  const [sqlCode, setSqlCode] = useState<string>('Loading schema SQL...');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/architecture/schema')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.schemaSql) {
          setSqlCode(data.schemaSql);
        }
      })
      .catch(() => {
        setSqlCode('-- Could not load schema from backend endpoint.');
      });
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const folderStructureText = `
community-event-os/
├── server.ts                  # Part 3: Node.js Express REST API server entry point
├── package.json               # Dependencies & esbuild build scripts
├── vite.config.ts             # Vite SPA & proxy configuration
├── metadata.json              # Applet metadata & camera permissions
├── .env.example               # Environment variables template
├── src/
│   ├── main.tsx               # Client React 19 entry point
│   ├── App.tsx                # Primary state engine & routing manager
│   ├── types.ts               # Shared TypeScript data interfaces
│   ├── schema.sql             # Part 1: Relational PostgreSQL DDL script
│   ├── data/
│   │   └── initialData.ts     # Seed data for users, tickets, and schedule
│   └── components/
│       ├── Sidebar.tsx        # Navigation drawer
│       ├── Header.tsx         # Search & role selector
│       ├── DashboardView.tsx  # Post-event analytics & live timeline
│       ├── RegistrationsView.tsx # Ticket registry & CSV exporter
│       ├── QRKioskView.tsx    # Part 4: Core QR Verification & Check-in Kiosk
│       ├── ScheduleView.tsx   # Speaker schedule & tracks board
│       ├── VolunteersView.tsx # Volunteer roster & shift manager
│       ├── AnnouncementsView.tsx # Global broadcast message stream
│       ├── FeedbackCertificatesView.tsx # Feedback & cert generator
│       └── ArchitectureView.tsx # Part 1-3 Documentation viewer
`;

  const apiRoutes = [
    {
      method: 'POST',
      endpoint: '/api/checkin/:qr_code',
      desc: 'Part 4: Validates QR code, updates attendee checked_in = true, and issues certificate.',
    },
    {
      method: 'GET',
      endpoint: '/api/checkin/:qr_code',
      desc: 'Retrieves registration badge status by QR code.',
    },
    {
      method: 'POST',
      endpoint: '/api/auth/login',
      desc: 'Authenticates user and returns role permissions (Organizer, Volunteer, Attendee).',
    },
    {
      method: 'GET',
      endpoint: '/api/registrations',
      desc: 'Fetches total registration roster, ticket tiers, and payment status.',
    },
    {
      method: 'POST',
      endpoint: '/api/registrations',
      desc: 'Registers new attendee and generates unique QR badge code.',
    },
    {
      method: 'GET',
      endpoint: '/api/schedule',
      desc: 'Retrieves speaker schedule and track room allocations.',
    },
    {
      method: 'POST',
      endpoint: '/api/announcements',
      desc: 'Broadcasts global broadcast alert to attendees.',
    },
    {
      method: 'GET',
      endpoint: '/api/analytics',
      desc: 'Calculates check-in percentages, volunteer counts, and feedback NPS.',
    },
  ];

  return (
    <div className="p-4 md:p-8 max-w-[1440px] mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Database className="w-6 h-6 text-blue-600" /> Project Architecture & Code Scaffolding
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Comprehensive documentation for SQL schema DDL, folder structure, and Express API routes.
        </p>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-gray-200 gap-4">
        <button
          onClick={() => setActiveSubTab('sql')}
          className={`pb-3 px-2 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'sql'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Database className="w-4 h-4" /> Part 1: Relational SQL Schema
        </button>

        <button
          onClick={() => setActiveSubTab('folder')}
          className={`pb-3 px-2 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'folder'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <FolderTree className="w-4 h-4" /> Part 2: Folder Structure
        </button>

        <button
          onClick={() => setActiveSubTab('api')}
          className={`pb-3 px-2 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'api'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Server className="w-4 h-4" /> Part 3: Express REST API Routes
        </button>
      </div>

      {/* Part 1: SQL Schema Sub-Tab */}
      {activeSubTab === 'sql' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900 text-white px-4 py-3 rounded-t-xl border-b border-slate-800">
            <span className="text-xs font-mono font-bold text-blue-400 flex items-center gap-2">
              <Terminal className="w-4 h-4" /> src/schema.sql (PostgreSQL DDL Statements)
            </span>

            <button
              onClick={() => copyToClipboard(sqlCode)}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy SQL
                </>
              )}
            </button>
          </div>

          <pre className="bg-slate-950 text-slate-200 p-6 rounded-b-xl font-mono text-xs overflow-x-auto leading-relaxed border border-t-0 border-slate-800">
            {sqlCode}
          </pre>
        </div>
      )}

      {/* Part 2: Folder Structure Sub-Tab */}
      {activeSubTab === 'folder' && (
        <div className="space-y-4">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-t-xl border-b border-slate-800">
            <span className="text-xs font-mono font-bold text-blue-400 flex items-center gap-2">
              <FolderTree className="w-4 h-4" /> Vercel & Node.js Full-Stack Directory Layout
            </span>
          </div>

          <pre className="bg-slate-950 text-green-400 p-6 rounded-b-xl font-mono text-xs overflow-x-auto leading-relaxed border border-t-0 border-slate-800">
            {folderStructureText}
          </pre>
        </div>
      )}

      {/* Part 3: Express REST API Routes */}
      {activeSubTab === 'api' && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-gray-900 mb-2">
            Core Node.js / Express Route Handlers
          </h3>

          <div className="space-y-3">
            {apiRoutes.map((route, i) => (
              <div
                key={i}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-2"
              >
                <div className="flex items-center gap-3 font-mono text-xs">
                  <span
                    className={`px-2 py-0.5 rounded font-bold text-[11px] uppercase ${
                      route.method === 'POST'
                        ? 'bg-blue-100 text-blue-800'
                        : route.method === 'GET'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {route.method}
                  </span>
                  <span className="font-bold text-slate-900 text-sm">{route.endpoint}</span>
                </div>

                <div className="text-xs text-gray-500 max-w-md">{route.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
