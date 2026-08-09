import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import {
  initialEvent,
  initialRegistrations,
  initialSessions,
  initialVolunteers,
  initialAnnouncements,
  initialFeedback,
  initialCertificates,
  initialUsers,
} from './src/data/initialData';
import { Registration, VolunteerAssignment, Announcement, Feedback, Certificate, Session } from './src/types';

// In-Memory Database Store for state persistence in active session
const db = {
  event: { ...initialEvent },
  users: [...initialUsers],
  registrations: [...initialRegistrations],
  sessions: [...initialSessions],
  volunteers: [...initialVolunteers],
  announcements: [...initialAnnouncements],
  feedback: [...initialFeedback],
  certificates: [...initialCertificates],
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ------------------------------------------------------------------
  // PART 3: BACKEND API ROUTES (Node.js / Express)
  // ------------------------------------------------------------------

  // 1. Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Community Event OS API',
      timestamp: new Date().toISOString(),
      database: 'Relational SQL (In-Memory Simulation)',
    });
  });

  // 2. Authentication simulation
  app.post('/api/auth/login', (req, res) => {
    const { email, role } = req.body;
    let user = db.users.find((u) => u.email.toLowerCase() === email?.toLowerCase());
    if (!user) {
      user = {
        id: `usr-${Date.now()}`,
        fullName: email ? email.split('@')[0] : 'Event User',
        email: email || 'user@eventos.org',
        role: role || 'organizer',
        createdAt: new Date().toISOString(),
      };
      db.users.push(user);
    } else if (role && user.role !== role) {
      user.role = role;
    }
    res.json({ success: true, user });
  });

  // 3. Event Details
  app.get('/api/events', (req, res) => {
    res.json({ success: true, event: db.event });
  });

  app.put('/api/events', (req, res) => {
    const { title, description, location, startDate, endDate, capacity } = req.body;
    if (title) db.event.title = title;
    if (description) db.event.description = description;
    if (location) db.event.location = location;
    if (startDate) db.event.startDate = startDate;
    if (endDate) db.event.endDate = endDate;
    if (capacity) db.event.capacity = Number(capacity);

    res.json({ success: true, event: db.event });
  });

  // 4. Registrations API
  app.get('/api/registrations', (req, res) => {
    res.json({
      success: true,
      totalCount: db.registrations.length,
      registrations: db.registrations,
    });
  });

  app.post('/api/registrations', (req, res) => {
    const { attendeeName, attendeeEmail, ticketType } = req.body;
    if (!attendeeName || !attendeeEmail || !ticketType) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const initials = attendeeName
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase();
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const qrCode = `EVT-${initials}-${randomCode}`;

    const newRegistration: Registration = {
      id: `reg-${Date.now()}`,
      eventId: db.event.id,
      userId: `usr-${Date.now()}`,
      attendeeName,
      attendeeEmail,
      ticketType,
      qrCode,
      status: 'paid',
      checkedIn: false,
      createdAt: new Date().toISOString(),
    };

    db.registrations.unshift(newRegistration);
    res.status(201).json({ success: true, registration: newRegistration });
  });

  // Direct QR Code Addition Endpoint
  app.post('/api/qr-codes/add', (req, res) => {
    const { qrCode, attendeeName, attendeeEmail, ticketType } = req.body;
    if (!qrCode || !qrCode.trim()) {
      return res.status(400).json({ success: false, message: 'QR Code value is required.' });
    }

    const cleanQr = qrCode.trim().toUpperCase();
    const existing = db.registrations.find((r) => r.qrCode.toUpperCase() === cleanQr);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'QR Code already exists in database.',
        registration: existing,
      });
    }

    const newRegistration: Registration = {
      id: `reg-${Date.now()}`,
      eventId: db.event.id,
      userId: `usr-${Date.now()}`,
      attendeeName: attendeeName?.trim() || `Badge Holder (${cleanQr})`,
      attendeeEmail: attendeeEmail?.trim() || `badge-${cleanQr.toLowerCase()}@eventos.org`,
      ticketType: ticketType || 'VIP',
      qrCode: cleanQr,
      status: 'paid',
      checkedIn: false,
      createdAt: new Date().toISOString(),
    };

    db.registrations.unshift(newRegistration);
    res.status(201).json({
      success: true,
      message: `QR Code ${cleanQr} added to database successfully.`,
      registration: newRegistration,
    });
  });

  app.put('/api/registrations/:id', (req, res) => {
    const { id } = req.params;
    const index = db.registrations.findIndex((r) => r.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Registration not found' });

    db.registrations[index] = {
      ...db.registrations[index],
      ...req.body,
    };
    res.json({ success: true, registration: db.registrations[index] });
  });

  app.delete('/api/registrations/:id', (req, res) => {
    const { id } = req.params;
    const index = db.registrations.findIndex((r) => r.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Registration not found' });

    db.registrations.splice(index, 1);
    res.json({ success: true, message: 'Registration deleted' });
  });

  // 6. Speaker Schedule & Track Management
  app.get('/api/schedule', (req, res) => {
    res.json({ success: true, sessions: db.sessions });
  });

  app.post('/api/schedule', (req, res) => {
    const { title, speakerName, track, locationRoom, startTime, endTime, description } = req.body;
    if (!title || !speakerName || !track || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'Missing session fields' });
    }

    const newSession: Session = {
      id: `ses-${Date.now()}`,
      eventId: db.event.id,
      title,
      description: description || 'Session overview',
      speakerName,
      track,
      locationRoom: locationRoom || 'Main Stage',
      startTime,
      endTime,
      maxCapacity: 200,
    };

    db.sessions.push(newSession);
    res.status(201).json({ success: true, session: newSession });
  });

  app.put('/api/schedule/:id', (req, res) => {
    const { id } = req.params;
    const index = db.sessions.findIndex((s) => s.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Session not found' });

    db.sessions[index] = {
      ...db.sessions[index],
      ...req.body,
    };
    res.json({ success: true, session: db.sessions[index] });
  });

  app.delete('/api/schedule/:id', (req, res) => {
    const { id } = req.params;
    const index = db.sessions.findIndex((s) => s.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Session not found' });

    db.sessions.splice(index, 1);
    res.json({ success: true, message: 'Session deleted' });
  });

  // 7. Volunteer Assignments & Shifts
  app.get('/api/volunteers', (req, res) => {
    res.json({ success: true, volunteers: db.volunteers });
  });

  app.post('/api/volunteers', (req, res) => {
    const { volunteerName, volunteerEmail, roleTitle, venueLocation, shiftStart, shiftEnd } = req.body;
    const newVol: VolunteerAssignment = {
      id: `vol-${Date.now()}`,
      userId: `usr-${Date.now()}`,
      volunteerName: volunteerName || 'New Volunteer',
      volunteerEmail: volunteerEmail || 'volunteer@eventos.org',
      roleTitle: roleTitle || 'General Staff',
      venueLocation: venueLocation || 'Main Hall',
      shiftStart: shiftStart || '09:00 AM',
      shiftEnd: shiftEnd || '05:00 PM',
      status: 'assigned',
    };
    db.volunteers.push(newVol);
    res.status(201).json({ success: true, volunteer: newVol });
  });

  app.put('/api/volunteers/:id', (req, res) => {
    const { id } = req.params;
    const index = db.volunteers.findIndex((v) => v.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Volunteer not found' });

    db.volunteers[index] = {
      ...db.volunteers[index],
      ...req.body,
    };
    res.json({ success: true, volunteer: db.volunteers[index] });
  });

  app.delete('/api/volunteers/:id', (req, res) => {
    const { id } = req.params;
    const index = db.volunteers.findIndex((v) => v.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Volunteer not found' });

    db.volunteers.splice(index, 1);
    res.json({ success: true, message: 'Volunteer deleted' });
  });

  app.patch('/api/volunteers/:id', (req, res) => {
    const { id } = req.params;
    const { status, venueLocation } = req.body;
    const vol = db.volunteers.find((v) => v.id === id);
    if (!vol) return res.status(404).json({ success: false, message: 'Volunteer not found' });

    if (status) vol.status = status;
    if (venueLocation) vol.venueLocation = venueLocation;

    res.json({ success: true, volunteer: vol });
  });

  // Clear all example data
  app.post('/api/clear-all-data', (req, res) => {
    db.registrations = [];
    db.sessions = [];
    db.volunteers = [];
    db.announcements = [];
    db.feedback = [];
    db.certificates = [];
    res.json({ success: true, message: 'All example data erased successfully.' });
  });

  // 5. ATTENDEE CHECK-IN & QR CODE VERIFICATION KIOSK ROUTE
  app.get('/api/checkin/:qr_code', (req, res) => {
    const { qr_code } = req.params;
    const registration = db.registrations.find(
      (r) => r.qrCode.toUpperCase() === qr_code.toUpperCase()
    );

    if (!registration) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: 'Invalid QR Code. No registration record found.',
      });
    }

    res.json({
      success: true,
      valid: true,
      alreadyCheckedIn: registration.checkedIn,
      registration,
    });
  });

  app.post('/api/checkin/:qr_code', (req, res) => {
    const { qr_code } = req.params;
    const registration = db.registrations.find(
      (r) => r.qrCode.toUpperCase() === qr_code.toUpperCase()
    );

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'QR Code not found in database registry',
        badge: null,
      });
    }

    if (registration.checkedIn) {
      return res.status(200).json({
        success: true,
        alreadyCheckedIn: true,
        message: `Attendee ${registration.attendeeName} was ALREADY checked in at ${registration.checkedInAt}`,
        registration,
      });
    }

    // Mark checked in
    registration.checkedIn = true;
    registration.checkedInAt = new Date().toISOString();

    // Auto generate certificate on check-in
    const existingCert = db.certificates.find((c) => c.registrationId === registration.id);
    if (!existingCert) {
      const newCert: Certificate = {
        id: `cert-${Date.now()}`,
        registrationId: registration.id,
        userId: registration.userId,
        userName: registration.attendeeName,
        eventName: db.event.title,
        certificateNumber: `EOS-2026-${registration.qrCode.split('-').pop()}-${registration.ticketType.substring(0, 3).toUpperCase()}`,
        issuedAt: registration.checkedInAt,
      };
      db.certificates.push(newCert);
    }

    res.status(200).json({
      success: true,
      alreadyCheckedIn: false,
      message: `Check-in Verified! Welcome ${registration.attendeeName}`,
      registration,
    });
  });

  // 6. Speaker Schedule & Track Management
  app.get('/api/schedule', (req, res) => {
    res.json({ success: true, sessions: db.sessions });
  });

  app.post('/api/schedule', (req, res) => {
    const { title, speakerName, track, locationRoom, startTime, endTime, description } = req.body;
    if (!title || !speakerName || !track || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'Missing session fields' });
    }

    const newSession: Session = {
      id: `ses-${Date.now()}`,
      eventId: db.event.id,
      title,
      description: description || 'Session overview',
      speakerName,
      track,
      locationRoom: locationRoom || 'Main Stage',
      startTime,
      endTime,
      maxCapacity: 200,
    };

    db.sessions.push(newSession);
    res.status(201).json({ success: true, session: newSession });
  });

  // 7. Volunteer Assignments & Shifts
  app.get('/api/volunteers', (req, res) => {
    res.json({ success: true, volunteers: db.volunteers });
  });

  app.post('/api/volunteers', (req, res) => {
    const { volunteerName, volunteerEmail, roleTitle, venueLocation, shiftStart, shiftEnd } = req.body;
    const newVol: VolunteerAssignment = {
      id: `vol-${Date.now()}`,
      userId: `usr-${Date.now()}`,
      volunteerName: volunteerName || 'New Volunteer',
      volunteerEmail: volunteerEmail || 'volunteer@eventos.org',
      roleTitle: roleTitle || 'General Staff',
      venueLocation: venueLocation || 'Main Hall',
      shiftStart: shiftStart || '09:00 AM',
      shiftEnd: shiftEnd || '05:00 PM',
      status: 'assigned',
    };
    db.volunteers.push(newVol);
    res.status(201).json({ success: true, volunteer: newVol });
  });

  app.patch('/api/volunteers/:id', (req, res) => {
    const { id } = req.params;
    const { status, venueLocation } = req.body;
    const vol = db.volunteers.find((v) => v.id === id);
    if (!vol) return res.status(404).json({ success: false, message: 'Volunteer not found' });

    if (status) vol.status = status;
    if (venueLocation) vol.venueLocation = venueLocation;

    res.json({ success: true, volunteer: vol });
  });

  // 8. Global Announcements & Broadcasting
  app.get('/api/announcements', (req, res) => {
    res.json({ success: true, announcements: db.announcements });
  });

  app.post('/api/announcements', (req, res) => {
    const { title, message, priority, authorName } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }

    const newAnnouncement: Announcement = {
      id: `anc-${Date.now()}`,
      eventId: db.event.id,
      title,
      message,
      priority: priority || 'normal',
      createdAt: new Date().toISOString(),
      authorName: authorName || 'Organizer Broadcast',
    };

    db.announcements.unshift(newAnnouncement);
    res.status(201).json({ success: true, announcement: newAnnouncement });
  });

  // 9. Post-Event Feedback Collection
  app.get('/api/feedback', (req, res) => {
    res.json({ success: true, feedback: db.feedback });
  });

  app.post('/api/feedback', (req, res) => {
    const { userName, rating, comments, category } = req.body;
    if (!rating) return res.status(400).json({ success: false, message: 'Rating is required' });

    const newFeedback: Feedback = {
      id: `fb-${Date.now()}`,
      eventId: db.event.id,
      userId: `usr-${Date.now()}`,
      userName: userName || 'Anonymous Attendee',
      rating: Number(rating),
      comments: comments || '',
      category: category || 'Overall',
      createdAt: new Date().toISOString(),
    };

    db.feedback.unshift(newFeedback);
    res.status(201).json({ success: true, feedback: newFeedback });
  });

  // 10. Automated Certificates
  app.get('/api/certificates', (req, res) => {
    res.json({ success: true, certificates: db.certificates });
  });

  app.post('/api/certificates/generate', (req, res) => {
    const { registrationId, userName } = req.body;
    const registration = db.registrations.find((r) => r.id === registrationId);

    const nameToUse = userName || registration?.attendeeName || 'Event Attendee';
    const certNum = `EOS-2026-${Math.floor(1000 + Math.random() * 9000)}-CERT`;

    const newCert: Certificate = {
      id: `cert-${Date.now()}`,
      registrationId: registrationId || `reg-${Date.now()}`,
      userId: registration?.userId || `usr-${Date.now()}`,
      userName: nameToUse,
      eventName: db.event.title,
      certificateNumber: certNum,
      issuedAt: new Date().toISOString(),
    };

    db.certificates.push(newCert);
    res.status(201).json({ success: true, certificate: newCert });
  });

  // 11. Post-Event Analytics Dashboard
  app.get('/api/analytics', (req, res) => {
    const totalRegs = db.registrations.length;
    const checkedInRegs = db.registrations.filter((r) => r.checkedIn).length;
    const activeVols = db.volunteers.filter((v) => v.status === 'on_duty').length;
    
    const feedbackRatings = db.feedback.map((f) => f.rating);
    const avgRating =
      feedbackRatings.length > 0
        ? Number((feedbackRatings.reduce((a, b) => a + b, 0) / feedbackRatings.length).toFixed(1))
        : 4.8;

    res.json({
      success: true,
      analytics: {
        totalRegistrations: totalRegs,
        checkedInCount: checkedInRegs,
        checkedInPercentage: totalRegs > 0 ? Math.round((checkedInRegs / totalRegs) * 100) : 0,
        activeVolunteers: activeVols,
        avgFeedbackRating: avgRating,
        npsScore: 78,
        checkInsByHour: [
          { hour: '8 AM', count: 320 },
          { hour: '9 AM', count: 850 },
          { hour: '10 AM', count: 1240 },
          { hour: '11 AM', count: 510 },
          { hour: '12 PM', count: 210 },
          { hour: '1 PM', count: 148 },
        ],
        salesByTier: [
          { tier: 'General', percentage: 45, count: 2169 },
          { tier: 'VIP', percentage: 30, count: 1446 },
          { tier: 'Student', percentage: 25, count: 1206 },
        ],
      },
    });
  });

  // 12. Schema File Inspector Endpoint
  app.get('/api/architecture/schema', (req, res) => {
    try {
      const sqlPath = path.join(process.cwd(), 'src', 'schema.sql');
      const schemaSql = fs.readFileSync(sqlPath, 'utf-8');
      res.json({ success: true, schemaSql });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Could not read schema SQL file' });
    }
  });

  // ------------------------------------------------------------------
  // VITE & STATIC FILES MIDDLEWARE
  // ------------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Community Event OS server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
