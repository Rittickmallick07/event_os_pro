import React, { useState } from 'react';
import {
  Users,
  Search,
  Download,
  Plus,
  Ticket,
  CheckCircle2,
  Clock,
  QrCode,
  Filter,
  Edit3,
  Trash2,
} from 'lucide-react';
import { Registration, TicketType, RegistrationStatus } from '../types';
import { QRCodeImage } from './QRCodeImage';

interface RegistrationsViewProps {
  registrations: Registration[];
  onAddRegistration: (reg: { attendeeName: string; attendeeEmail: string; ticketType: TicketType }) => void;
  onEditRegistration?: (id: string, updated: Partial<Registration>) => void;
  onDeleteRegistration?: (id: string) => void;
  onOpenKioskWithQR?: (qr: string) => void;
}

export const RegistrationsView: React.FC<RegistrationsViewProps> = ({
  registrations,
  onAddRegistration,
  onEditRegistration,
  onDeleteRegistration,
  onOpenKioskWithQR,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [ticketFilter, setTicketFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReg, setEditingReg] = useState<Registration | null>(null);

  // New attendee form state
  const [attendeeName, setAttendeeName] = useState('');
  const [attendeeEmail, setAttendeeEmail] = useState('');
  const [ticketType, setTicketType] = useState<TicketType>('General');

  // Edit attendee form state
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editTicketType, setEditTicketType] = useState<TicketType>('General');
  const [editStatus, setEditStatus] = useState<RegistrationStatus>('paid');
  const [editQrCode, setEditQrCode] = useState('');

  // Filter logic
  const filtered = registrations.filter((reg) => {
    const matchesSearch =
      reg.attendeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.attendeeEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.qrCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTicket = ticketFilter === 'all' || reg.ticketType === ticketFilter;
    const matchesStatus = statusFilter === 'all' || reg.status === statusFilter;

    return matchesSearch && matchesTicket && matchesStatus;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attendeeName.trim() || !attendeeEmail.trim()) return;

    onAddRegistration({
      attendeeName: attendeeName.trim(),
      attendeeEmail: attendeeEmail.trim(),
      ticketType,
    });

    setAttendeeName('');
    setAttendeeEmail('');
    setTicketType('General');
    setIsModalOpen(false);
  };

  const handleOpenEdit = (reg: Registration) => {
    setEditingReg(reg);
    setEditName(reg.attendeeName);
    setEditEmail(reg.attendeeEmail);
    setEditTicketType(reg.ticketType);
    setEditStatus(reg.status);
    setEditQrCode(reg.qrCode);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReg || !onEditRegistration) return;

    onEditRegistration(editingReg.id, {
      attendeeName: editName.trim(),
      attendeeEmail: editEmail.trim(),
      ticketType: editTicketType,
      status: editStatus,
      qrCode: editQrCode.trim(),
    });

    setEditingReg(null);
  };

  const exportCSV = () => {
    const headers = ['ID', 'Attendee Name', 'Email', 'Ticket Type', 'QR Code', 'Status', 'Checked In'];
    const rows = filtered.map((r) => [
      r.id,
      `"${r.attendeeName}"`,
      r.attendeeEmail,
      r.ticketType,
      r.qrCode,
      r.status,
      r.checkedIn ? 'Yes' : 'No',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Community_Event_OS_Registrations.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 md:p-8 max-w-[1440px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" /> Event Registrations & Tickets
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage attendee list, edit ticket tiers, issue QR badges, and filter registration statuses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3.5 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Register Attendee
          </button>
        </div>
      </div>

      {/* Controls: Search & Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <Filter className="w-4 h-4" /> Filters:
          </div>

          <select
            value={ticketFilter}
            onChange={(e) => setTicketFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-800 font-medium focus:outline-none cursor-pointer"
          >
            <option value="all">Ticket Type (All)</option>
            <option value="VIP">VIP</option>
            <option value="General">General</option>
            <option value="Student">Student</option>
            <option value="Speaker">Speaker</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-800 font-medium focus:outline-none cursor-pointer"
          >
            <option value="all">Status (All)</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, email, or QR..."
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-blue-600"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500">
              <tr>
                <th className="py-3 px-4">ATTENDEE NAME</th>
                <th className="py-3 px-4">EMAIL</th>
                <th className="py-3 px-4">TICKET TYPE</th>
                <th className="py-3 px-4">BADGE QR CODE</th>
                <th className="py-3 px-4">PAYMENT</th>
                <th className="py-3 px-4">CHECK-IN STATUS</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    No registrations found. {registrations.length === 0 ? 'Example data has been erased.' : 'Try adjusting search or filters.'}
                  </td>
                </tr>
              ) : (
                filtered.map((reg) => (
                  <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-sm text-gray-900">
                      {reg.attendeeName}
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 font-mono">{reg.attendeeEmail}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        <Ticket className="w-3 h-3" /> {reg.ticketType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      <div className="flex items-center gap-2">
                        <QRCodeImage value={reg.qrCode} size={36} />
                        <div>
                          <span className="font-mono text-xs">{reg.qrCode}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {reg.status === 'paid' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 uppercase">
                          <CheckCircle2 className="w-3 h-3" /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {reg.checkedIn ? (
                        <span className="text-xs font-semibold text-green-700 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-green-600" /> Checked In
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Not Checked In</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {onOpenKioskWithQR && (
                          <button
                            onClick={() => onOpenKioskWithQR(reg.qrCode)}
                            className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-semibold rounded text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                            title="Test QR Kiosk"
                          >
                            <QrCode className="w-3 h-3" /> Kiosk
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEdit(reg)}
                          className="p-1 bg-gray-100 hover:bg-blue-100 hover:text-blue-600 text-gray-600 rounded transition-colors cursor-pointer"
                          title="Edit Attendee"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {onDeleteRegistration && (
                          <button
                            onClick={() => onDeleteRegistration(reg.id)}
                            className="p-1 bg-gray-100 hover:bg-red-100 hover:text-red-600 text-gray-600 rounded transition-colors cursor-pointer"
                            title="Delete Registration"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Attendee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              New Attendee Registration
            </h3>
            <p className="text-xs text-gray-500 mb-5">
              Issue a new event ticket and generate an instant QR code badge.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={attendeeName}
                  onChange={(e) => setAttendeeName(e.target.value)}
                  placeholder="e.g. Samantha Wright"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={attendeeEmail}
                  onChange={(e) => setAttendeeEmail(e.target.value)}
                  placeholder="e.g. samantha@eventos.org"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Ticket Tier
                </label>
                <select
                  value={ticketType}
                  onChange={(e) => setTicketType(e.target.value as TicketType)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none"
                >
                  <option value="General">General Admission</option>
                  <option value="VIP">VIP Ticket</option>
                  <option value="Student">Student Ticket</option>
                  <option value="Speaker">Speaker Access</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold cursor-pointer shadow-sm"
                >
                  Issue Ticket & Badge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Attendee Registration Modal */}
      {editingReg && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-blue-600" /> Edit Registration Details
            </h3>
            <p className="text-xs text-gray-500 mb-4">Modify attendee name, ticket tier, or badge QR code.</p>

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
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
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
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Ticket Tier</label>
                  <select
                    value={editTicketType}
                    onChange={(e) => setEditTicketType(e.target.value as TicketType)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none"
                  >
                    <option value="General">General</option>
                    <option value="VIP">VIP</option>
                    <option value="Student">Student</option>
                    <option value="Speaker">Speaker</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as RegistrationStatus)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none"
                  >
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Badge QR Code</label>
                <input
                  type="text"
                  required
                  value={editQrCode}
                  onChange={(e) => setEditQrCode(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono text-gray-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingReg(null)}
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
