import React, { useState } from 'react';
import { Search, Bell, Menu, ShieldCheck, Edit3, Trash2, AlertTriangle, User } from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  organizerProfile?: { fullName: string; email: string; roleTitle: string; avatarUrl?: string };
  onUpdateOrganizerProfile?: (profile: { fullName: string; email: string; roleTitle: string; avatarUrl?: string }) => void;
  onOpenMobileMenu?: () => void;
  onEraseAllData?: () => void;
  unreadCount?: number;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
];

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  setRole,
  organizerProfile = {
    fullName: 'Alex Chen',
    email: 'alex.chen@example.com',
    roleTitle: 'Organizer Lead',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  },
  onUpdateOrganizerProfile,
  onOpenMobileMenu,
  onEraseAllData,
  unreadCount = 2,
}) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEraseModalOpen, setIsEraseModalOpen] = useState(false);

  const [editName, setEditName] = useState(organizerProfile.fullName);
  const [editEmail, setEditEmail] = useState(organizerProfile.email);
  const [editRoleTitle, setEditRoleTitle] = useState(organizerProfile.roleTitle);
  const [editAvatarUrl, setEditAvatarUrl] = useState(
    organizerProfile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
  );

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateOrganizerProfile) {
      onUpdateOrganizerProfile({
        fullName: editName,
        email: editEmail,
        roleTitle: editRoleTitle,
        avatarUrl: editAvatarUrl,
      });
    }
    setIsProfileModalOpen(false);
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setEditAvatarUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmErase = () => {
    if (onEraseAllData) {
      onEraseAllData();
    }
    setIsEraseModalOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 px-6 md:px-8 flex items-center justify-between sticky top-0 z-20 shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-xl font-bold text-gray-900 tracking-tight hidden sm:block">Control Center</h1>
        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> LIVE
        </span>

        <div className="relative w-40 sm:w-60 lg:w-72 hidden md:block ml-2">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search attendees, sessions, QR..."
            className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        {/* Erase Example Data Button */}
        {onEraseAllData && (
          <button
            onClick={() => setIsEraseModalOpen(true)}
            className="hidden sm:flex items-center gap-1 px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-[10px] font-medium rounded-md transition-colors cursor-pointer"
            title="Erase all example data"
          >
            <Trash2 className="w-3 h-3" /> Erase Data
          </button>
        )}

        {/* Role Switcher */}
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-medium text-gray-500 hidden sm:inline">Role:</span>
          <select
            value={currentRole}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="bg-transparent text-xs font-semibold text-gray-900 focus:outline-none cursor-pointer"
          >
            <option value="organizer">Organizer</option>
            <option value="volunteer">Volunteer</option>
            <option value="attendee">Attendee</option>
          </select>
        </div>

        {/* Notifications */}
        <button
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full relative transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full animate-ping"></span>
          )}
        </button>

        {/* Profile Avatar (Clickable to Edit Profile) */}
        <button
          onClick={() => {
            setEditName(organizerProfile.fullName);
            setEditEmail(organizerProfile.email);
            setEditRoleTitle(organizerProfile.roleTitle);
            setEditAvatarUrl(
              organizerProfile.avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
            );
            setIsProfileModalOpen(true);
          }}
          className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-gray-100 transition-colors text-left cursor-pointer group"
          title="Click to edit Lead Profile"
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-900 flex items-center gap-1 group-hover:text-blue-600">
              {organizerProfile.fullName} <Edit3 className="w-3 h-3 text-gray-400 group-hover:text-blue-600" />
            </p>
            <p className="text-[11px] text-gray-500 font-medium">
              {currentRole === 'organizer' ? organizerProfile.roleTitle : `${currentRole.toUpperCase()} Lead`}
            </p>
          </div>
          <img
            src={
              organizerProfile.avatarUrl ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
            }
            alt={organizerProfile.fullName}
            className="w-9 h-9 rounded-full object-cover border border-gray-200 group-hover:border-blue-500 shadow-xs"
          />
        </button>
      </div>

      {/* Edit Organizer Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" /> Edit Lead Profile
            </h3>
            <p className="text-xs text-gray-500 mb-4">Update Organizer info & Profile Picture.</p>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Profile Picture Selector */}
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-3">
                <label className="block text-xs font-semibold text-gray-700">Profile Picture</label>
                <div className="flex items-center gap-4">
                  <img
                    src={editAvatarUrl}
                    alt="Preview"
                    className="w-14 h-14 rounded-full object-cover border-2 border-blue-500 shadow-md shrink-0"
                  />
                  <div className="flex-1 space-y-2">
                    <label className="inline-block px-3 py-1.5 bg-white border border-gray-300 hover:border-blue-500 text-gray-700 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs">
                      Upload New Photo
                      <input type="file" accept="image/*" onChange={handleAvatarFileUpload} className="hidden" />
                    </label>
                    <p className="text-[10px] text-gray-500">Or enter image URL below:</p>
                  </div>
                </div>

                <input
                  type="text"
                  value={editAvatarUrl}
                  onChange={(e) => setEditAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-mono text-gray-800 focus:outline-none focus:border-blue-600"
                />

                {/* Preset Avatars */}
                <div>
                  <span className="text-[10px] font-semibold text-gray-500 block mb-1.5">Quick Presets:</span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {PRESET_AVATARS.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setEditAvatarUrl(url)}
                        className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                          editAvatarUrl === url ? 'border-blue-600 scale-110 shadow-xs' : 'border-transparent opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Role Title</label>
                <input
                  type="text"
                  required
                  value={editRoleTitle}
                  onChange={(e) => setEditRoleTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold cursor-pointer shadow-sm"
                >
                  Save Profile
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
              This will permanently clear all demo registrations, volunteers, sessions, announcements, and certificates. You will start with a completely empty event database.
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
                onClick={handleConfirmErase}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold cursor-pointer shadow-sm"
              >
                Yes, Erase Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
