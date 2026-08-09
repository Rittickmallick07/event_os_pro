import React, { useState, useEffect } from 'react';
import { Sidebar, TabType } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { RegistrationsView } from './components/RegistrationsView';
import { QRKioskView } from './components/QRKioskView';
import { ScheduleView } from './components/ScheduleView';
import { VolunteersView } from './components/VolunteersView';
import { AnnouncementsView } from './components/AnnouncementsView';
import { FeedbackCertificatesView } from './components/FeedbackCertificatesView';
import { ArchitectureView } from './components/ArchitectureView';

import {
  initialEvent,
  initialRegistrations,
  initialSessions,
  initialVolunteers,
  initialAnnouncements,
  initialFeedback,
  initialCertificates,
  initialAnalytics,
} from './data/initialData';

import {
  UserRole,
  Registration,
  Session,
  VolunteerAssignment,
  Announcement,
  Feedback,
  Certificate,
  AnalyticsSummary,
  TicketType,
} from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('organizer');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Organizer profile state
  const [organizerProfile, setOrganizerProfile] = useState({
    fullName: 'Alex Chen',
    email: 'alex.chen@example.com',
    roleTitle: 'Organizer Lead',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  });

  // Event details state
  const [eventDetails, setEventDetails] = useState(initialEvent);

  // App state
  const [registrations, setRegistrations] = useState<Registration[]>(initialRegistrations);
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [volunteers, setVolunteers] = useState<VolunteerAssignment[]>(initialVolunteers);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [feedbackList, setFeedbackList] = useState<Feedback[]>(initialFeedback);
  const [certificatesList, setCertificatesList] = useState<Certificate[]>(initialCertificates);
  const [analytics, setAnalytics] = useState<AnalyticsSummary>(initialAnalytics);

  // Sync analytics dynamically whenever registrations or volunteers change
  useEffect(() => {
    const totalRegs = registrations.length;
    const checkedInCount = registrations.filter((r) => r.checkedIn).length;
    const activeVolunteers = volunteers.filter((v) => v.status === 'on_duty').length;
    const checkedInPercentage = totalRegs > 0 ? Math.round((checkedInCount / totalRegs) * 100) : 0;

    setAnalytics((prev) => ({
      ...prev,
      totalRegistrations: totalRegs,
      checkedInCount,
      checkedInPercentage,
      activeVolunteers,
    }));
  }, [registrations, volunteers]);

  // Handlers
  const handleUpdateEventDetails = async (updated: Partial<typeof initialEvent>) => {
    try {
      const res = await fetch('/api/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (data.success && data.event) {
        setEventDetails(data.event);
      } else {
        setEventDetails((prev) => ({ ...prev, ...updated }));
      }
    } catch {
      setEventDetails((prev) => ({ ...prev, ...updated }));
    }
  };

  const handleUpdateOrganizerProfile = (profile: { fullName: string; email: string; roleTitle: string; avatarUrl?: string }) => {
    setOrganizerProfile((prev) => ({ ...prev, ...profile }));
  };

  const handleEraseAllData = async () => {
    try {
      await fetch('/api/clear-all-data', { method: 'POST' });
    } catch {
      // Fallback local clear
    }
    setRegistrations([]);
    setSessions([]);
    setVolunteers([]);
    setAnnouncements([]);
    setFeedbackList([]);
    setCertificatesList([]);
  };

  const handleAddRegistration = async (newRegData: {
    attendeeName: string;
    attendeeEmail: string;
    ticketType: TicketType;
  }) => {
    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRegData),
      });
      const data = await res.json();
      if (data.success && data.registration) {
        setRegistrations((prev) => [data.registration, ...prev]);
      }
    } catch {
      const initials = newRegData.attendeeName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase();
      const newReg: Registration = {
        id: `reg-${Date.now()}`,
        eventId: eventDetails.id,
        userId: `usr-${Date.now()}`,
        attendeeName: newRegData.attendeeName,
        attendeeEmail: newRegData.attendeeEmail,
        ticketType: newRegData.ticketType,
        qrCode: `EVT-${initials}-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'paid',
        checkedIn: false,
        createdAt: new Date().toISOString(),
      };
      setRegistrations((prev) => [newReg, ...prev]);
    }
  };

  const handleEditRegistration = async (id: string, updatedData: Partial<Registration>) => {
    try {
      const res = await fetch(`/api/registrations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      const data = await res.json();
      if (data.success && data.registration) {
        setRegistrations((prev) => prev.map((r) => (r.id === id ? data.registration : r)));
        return;
      }
    } catch {
      // Fallback
    }
    setRegistrations((prev) => prev.map((r) => (r.id === id ? { ...r, ...updatedData } : r)));
  };

  const handleDeleteRegistration = async (id: string) => {
    try {
      await fetch(`/api/registrations/${id}`, { method: 'DELETE' });
    } catch {
      // Fallback
    }
    setRegistrations((prev) => prev.filter((r) => r.id !== id));
  };

  const handleCheckInSuccess = (reg: Registration) => {
    setRegistrations((prev) =>
      prev.map((r) =>
        r.id === reg.id ? { ...r, checkedIn: true, checkedInAt: new Date().toISOString() } : r
      )
    );
  };

  const handleAddSession = async (newSessionData: Partial<Session>) => {
    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSessionData),
      });
      const data = await res.json();
      if (data.success && data.session) {
        setSessions((prev) => [...prev, data.session]);
      }
    } catch {
      const newSes: Session = {
        id: `ses-${Date.now()}`,
        eventId: eventDetails.id,
        title: newSessionData.title || 'New Talk',
        description: newSessionData.description || 'Session overview',
        speakerName: newSessionData.speakerName || 'Speaker',
        track: newSessionData.track || 'Main Stage',
        locationRoom: newSessionData.locationRoom || 'Main Stage',
        startTime: newSessionData.startTime || '02:00 PM',
        endTime: newSessionData.endTime || '03:00 PM',
        maxCapacity: 200,
      };
      setSessions((prev) => [...prev, newSes]);
    }
  };

  const handleEditSession = async (id: string, updatedData: Partial<Session>) => {
    try {
      const res = await fetch(`/api/schedule/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      const data = await res.json();
      if (data.success && data.session) {
        setSessions((prev) => prev.map((s) => (s.id === id ? data.session : s)));
        return;
      }
    } catch {
      // Fallback
    }
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, ...updatedData } : s)));
  };

  const handleDeleteSession = async (id: string) => {
    try {
      await fetch(`/api/schedule/${id}`, { method: 'DELETE' });
    } catch {
      // Fallback
    }
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddVolunteer = async (volData: Partial<VolunteerAssignment>) => {
    try {
      const res = await fetch('/api/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(volData),
      });
      const data = await res.json();
      if (data.success && data.volunteer) {
        setVolunteers((prev) => [...prev, data.volunteer]);
      }
    } catch {
      const newVol: VolunteerAssignment = {
        id: `vol-${Date.now()}`,
        userId: `usr-${Date.now()}`,
        volunteerName: volData.volunteerName || 'New Volunteer',
        volunteerEmail: volData.volunteerEmail || 'volunteer@eventos.org',
        roleTitle: volData.roleTitle || 'Door Check-in',
        venueLocation: volData.venueLocation || 'Main Hall',
        shiftStart: volData.shiftStart || '09:00 AM',
        shiftEnd: volData.shiftEnd || '05:00 PM',
        status: 'assigned',
      };
      setVolunteers((prev) => [...prev, newVol]);
    }
  };

  const handleEditVolunteer = async (id: string, updatedData: Partial<VolunteerAssignment>) => {
    try {
      const res = await fetch(`/api/volunteers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      const data = await res.json();
      if (data.success && data.volunteer) {
        setVolunteers((prev) => prev.map((v) => (v.id === id ? data.volunteer : v)));
        return;
      }
    } catch {
      // Fallback
    }
    setVolunteers((prev) => prev.map((v) => (v.id === id ? { ...v, ...updatedData } : v)));
  };

  const handleDeleteVolunteer = async (id: string) => {
    try {
      await fetch(`/api/volunteers/${id}`, { method: 'DELETE' });
    } catch {
      // Fallback
    }
    setVolunteers((prev) => prev.filter((v) => v.id !== id));
  };

  const handleUpdateVolunteerStatus = async (id: string, newStatus: 'on_duty' | 'off_duty') => {
    setVolunteers((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: newStatus } : v))
    );
  };

  const handleBroadcast = async (
    title: string,
    message: string,
    priority: 'low' | 'normal' | 'urgent'
  ) => {
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          message,
          priority,
          authorName: `${currentRole.toUpperCase()} Lead`,
        }),
      });
      const data = await res.json();
      if (data.success && data.announcement) {
        setAnnouncements((prev) => [data.announcement, ...prev]);
      }
    } catch {
      const newAnc: Announcement = {
        id: `anc-${Date.now()}`,
        eventId: eventDetails.id,
        title,
        message,
        priority,
        createdAt: new Date().toISOString(),
        authorName: `${currentRole.toUpperCase()} Broadcast`,
      };
      setAnnouncements((prev) => [newAnc, ...prev]);
    }
  };

  const handleAddFeedback = async (fbData: Partial<Feedback>) => {
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fbData),
      });
      const data = await res.json();
      if (data.success && data.feedback) {
        setFeedbackList((prev) => [data.feedback, ...prev]);
      }
    } catch {
      const newFb: Feedback = {
        id: `fb-${Date.now()}`,
        eventId: eventDetails.id,
        userId: `usr-${Date.now()}`,
        userName: fbData.userName || 'Attendee',
        rating: fbData.rating || 5,
        comments: fbData.comments || '',
        category: fbData.category || 'Overall',
        createdAt: new Date().toISOString(),
      };
      setFeedbackList((prev) => [newFb, ...prev]);
    }
  };

  const handleGenerateCertificate = async (userName: string) => {
    try {
      const res = await fetch('/api/certificates/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName }),
      });
      const data = await res.json();
      if (data.success && data.certificate) {
        setCertificatesList((prev) => [...prev, data.certificate]);
      }
    } catch {
      const newCert: Certificate = {
        id: `cert-${Date.now()}`,
        registrationId: `reg-${Date.now()}`,
        userId: `usr-${Date.now()}`,
        userName,
        eventName: eventDetails.title,
        certificateNumber: `EOS-2026-${Math.floor(1000 + Math.random() * 9000)}-MAN`,
        issuedAt: new Date().toISOString(),
      };
      setCertificatesList((prev) => [...prev, newCert]);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] flex flex-col font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpenMobile={isMobileMenuOpen}
        setIsOpenMobile={setIsMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="md:pl-[260px] flex-1 flex flex-col min-w-0">
        <Header
          currentRole={currentRole}
          setRole={setCurrentRole}
          organizerProfile={organizerProfile}
          onUpdateOrganizerProfile={handleUpdateOrganizerProfile}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onEraseAllData={handleEraseAllData}
          unreadCount={announcements.length}
        />

        <main className="flex-1 pb-16">
          {activeTab === 'dashboard' && (
            <DashboardView
              eventDetails={eventDetails}
              onUpdateEventDetails={handleUpdateEventDetails}
              analytics={analytics}
              sessions={sessions}
              onNavigate={setActiveTab}
              onEraseAllData={handleEraseAllData}
            />
          )}

          {activeTab === 'registrations' && (
            <RegistrationsView
              registrations={registrations}
              onAddRegistration={handleAddRegistration}
              onEditRegistration={handleEditRegistration}
              onDeleteRegistration={handleDeleteRegistration}
              onOpenKioskWithQR={() => {
                setActiveTab('qr-kiosk');
              }}
            />
          )}

          {activeTab === 'qr-kiosk' && (
            <QRKioskView onCheckInSuccess={handleCheckInSuccess} />
          )}

          {activeTab === 'schedule' && (
            <ScheduleView
              sessions={sessions}
              onAddSession={handleAddSession}
              onEditSession={handleEditSession}
              onDeleteSession={handleDeleteSession}
            />
          )}

          {activeTab === 'volunteers' && (
            <VolunteersView
              volunteers={volunteers}
              onAddVolunteer={handleAddVolunteer}
              onEditVolunteer={handleEditVolunteer}
              onDeleteVolunteer={handleDeleteVolunteer}
              onUpdateStatus={handleUpdateVolunteerStatus}
            />
          )}

          {activeTab === 'announcements' && (
            <AnnouncementsView
              announcements={announcements}
              onBroadcast={handleBroadcast}
            />
          )}

          {activeTab === 'feedback-certs' && (
            <FeedbackCertificatesView
              feedbackList={feedbackList}
              certificatesList={certificatesList}
              onAddFeedback={handleAddFeedback}
              onGenerateCertificate={handleGenerateCertificate}
            />
          )}

          {activeTab === 'architecture' && <ArchitectureView />}
        </main>
      </div>
    </div>
  );
}

export default App;
