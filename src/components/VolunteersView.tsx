import React, { useState } from 'react';
import { UserCheck, Plus, Clock, MapPin, CheckCircle2, Circle, Edit3, Trash2 } from 'lucide-react';
import { VolunteerAssignment } from '../types';

interface VolunteersViewProps {
  volunteers: VolunteerAssignment[];
  onAddVolunteer: (vol: Partial<VolunteerAssignment>) => void;
  onEditVolunteer?: (id: string, vol: Partial<VolunteerAssignment>) => void;
  onDeleteVolunteer?: (id: string) => void;
  onUpdateStatus: (id: string, status: 'on_duty' | 'off_duty') => void;
}

export const VolunteersView: React.FC<VolunteersViewProps> = ({
  volunteers,
  onAddVolunteer,
  onEditVolunteer,
  onDeleteVolunteer,
  onUpdateStatus,
}) => {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [editingVol, setEditingVol] = useState<VolunteerAssignment | null>(null);

  // New volunteer form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roleTitle, setRoleTitle] = useState('Door Check-in Lead');
  const [venueLocation, setVenueLocation] = useState('Main Entrance Kiosks');
  const [shiftStart, setShiftStart] = useState('09:00 AM');
  const [shiftEnd, setShiftEnd] = useState('05:00 PM');

  // Edit volunteer form state
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRoleTitle, setEditRoleTitle] = useState('');
  const [editVenueLocation, setEditVenueLocation] = useState('');
  const [editShiftStart, setEditShiftStart] = useState('');
  const [editShiftEnd, setEditShiftEnd] = useState('');
  const [editStatus, setEditStatus] = useState<'on_duty' | 'off_duty' | 'assigned'>('assigned');

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddVolunteer({
      volunteerName: name.trim(),
      volunteerEmail: email.trim() || 'volunteer@eventos.org',
      roleTitle,
      venueLocation,
      shiftStart,
      shiftEnd,
    });

    setName('');
    setEmail('');
    setIsAssignModalOpen(false);
  };

  const handleOpenEdit = (vol: VolunteerAssignment) => {
    setEditingVol(vol);
    setEditName(vol.volunteerName);
    setEditEmail(vol.volunteerEmail);
    setEditRoleTitle(vol.roleTitle);
    setEditVenueLocation(vol.venueLocation);
    setEditShiftStart(vol.shiftStart);
    setEditShiftEnd(vol.shiftEnd);
    setEditStatus(vol.status);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVol || !onEditVolunteer) return;

    onEditVolunteer(editingVol.id, {
      volunteerName: editName.trim(),
      volunteerEmail: editEmail.trim(),
      roleTitle: editRoleTitle,
      venueLocation: editVenueLocation,
      shiftStart: editShiftStart,
      shiftEnd: editShiftEnd,
      status: editStatus,
    });

    setEditingVol(null);
  };

  const activeCount = volunteers.filter((v) => v.status === 'on_duty').length;

  return (
    <div className="p-4 md:p-8 max-w-[1440px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-blue-600" /> Volunteer Assignments & Shifts
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage volunteer roster, venue allocations, shift times, and duty status.
          </p>
        </div>

        <button
          onClick={() => setIsAssignModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Assign Volunteer
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase">Total Volunteers</div>
          <div className="text-2xl font-extrabold text-gray-900 mt-1">{volunteers.length}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase">Currently On Duty</div>
          <div className="text-2xl font-extrabold text-green-600 mt-1">{activeCount}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase">Off Duty</div>
          <div className="text-2xl font-extrabold text-gray-400 mt-1">
            {volunteers.length - activeCount}
          </div>
        </div>
      </div>

      {/* Roster Bento Grid */}
      {volunteers.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-xl p-12 text-center">
          <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">No Volunteers Assigned</h3>
          <p className="text-xs text-gray-400 mt-1 mb-4">
            Example data has been erased or no volunteers have been assigned yet.
          </p>
          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-lg shadow-sm hover:bg-blue-500 cursor-pointer"
          >
            Assign First Volunteer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {volunteers.map((vol) => (
            <div
              key={vol.id}
              className={`bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center relative group ${
                vol.status === 'on_duty' ? 'border-green-200' : 'border-gray-200 opacity-90'
              }`}
            >
              {/* Action Buttons Overlay on Hover */}
              <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleOpenEdit(vol)}
                  className="p-1 bg-gray-100 hover:bg-blue-100 hover:text-blue-600 text-gray-600 rounded transition-colors cursor-pointer"
                  title="Edit Volunteer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                {onDeleteVolunteer && (
                  <button
                    onClick={() => onDeleteVolunteer(vol.id)}
                    className="p-1 bg-gray-100 hover:bg-red-100 hover:text-red-600 text-gray-600 rounded transition-colors cursor-pointer"
                    title="Delete Volunteer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="relative mb-3">
                <img
                  src={
                    vol.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
                  }
                  alt={vol.volunteerName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                />
                <span
                  className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                    vol.status === 'on_duty' ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                  title={vol.status === 'on_duty' ? 'On Duty' : 'Off Duty'}
                ></span>
              </div>

              <h3 className="font-bold text-base text-gray-900">{vol.volunteerName}</h3>
              <span className="inline-block mt-1 px-2.5 py-0.5 bg-blue-50 text-blue-700 font-bold text-xs rounded border border-blue-200">
                {vol.roleTitle}
              </span>

              <div className="mt-3 text-xs text-gray-500 space-y-1 w-full pt-3 border-t border-gray-100">
                <div className="flex items-center justify-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" /> {vol.venueLocation}
                </div>
                <div className="flex items-center justify-center gap-1 font-mono text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-gray-400" /> {vol.shiftStart} - {vol.shiftEnd}
                </div>
              </div>

              <button
                onClick={() =>
                  onUpdateStatus(vol.id, vol.status === 'on_duty' ? 'off_duty' : 'on_duty')
                }
                className={`w-full mt-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  vol.status === 'on_duty'
                    ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {vol.status === 'on_duty' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> On Duty (Toggle)
                  </>
                ) : (
                  <>
                    <Circle className="w-3.5 h-3.5 text-gray-400" /> Set On Duty
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Assign Volunteer Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Assign New Volunteer</h3>
            <p className="text-xs text-gray-500 mb-4">
              Assign event volunteer duty and shift location.
            </p>

            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Volunteer Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Lee"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jordan@eventos.org"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Role Title
                </label>
                <select
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none"
                >
                  <option value="Door Check-in Lead">Door Check-in Lead</option>
                  <option value="VIP Lounge Host">VIP Lounge Host</option>
                  <option value="Stage Usher">Stage Usher</option>
                  <option value="Info Desk Assistant">Info Desk Assistant</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Venue Allocation
                </label>
                <input
                  type="text"
                  value={venueLocation}
                  onChange={(e) => setVenueLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Shift Start</label>
                  <input
                    type="text"
                    value={shiftStart}
                    onChange={(e) => setShiftStart(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Shift End</label>
                  <input
                    type="text"
                    value={shiftEnd}
                    onChange={(e) => setShiftEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold cursor-pointer shadow-sm"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Volunteer Modal */}
      {editingVol && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-blue-600" /> Edit Volunteer Details
            </h3>
            <p className="text-xs text-gray-500 mb-4">Modify volunteer assignment, times, and venue.</p>

            <form onSubmit={handleSaveEdit} className="space-y-4">
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Role Title</label>
                  <input
                    type="text"
                    required
                    value={editRoleTitle}
                    onChange={(e) => setEditRoleTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none"
                  >
                    <option value="on_duty">On Duty</option>
                    <option value="off_duty">Off Duty</option>
                    <option value="assigned">Assigned</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Venue Allocation</label>
                <input
                  type="text"
                  required
                  value={editVenueLocation}
                  onChange={(e) => setEditVenueLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Shift Start</label>
                  <input
                    type="text"
                    value={editShiftStart}
                    onChange={(e) => setEditShiftStart(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Shift End</label>
                  <input
                    type="text"
                    value={editShiftEnd}
                    onChange={(e) => setEditShiftEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingVol(null)}
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
