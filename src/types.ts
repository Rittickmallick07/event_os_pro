export type UserRole = 'organizer' | 'volunteer' | 'attendee';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number;
  organizerId: string;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export type TicketType = 'VIP' | 'General' | 'Student' | 'Speaker' | 'Press';
export type RegistrationStatus = 'paid' | 'pending' | 'cancelled';

export interface Registration {
  id: string;
  eventId: string;
  userId: string;
  attendeeName: string;
  attendeeEmail: string;
  ticketType: TicketType;
  qrCode: string;
  status: RegistrationStatus;
  checkedIn: boolean;
  checkedInAt?: string;
  createdAt: string;
}

export interface Session {
  id: string;
  eventId: string;
  title: string;
  description: string;
  speakerName: string;
  speakerBio?: string;
  speakerAvatar?: string;
  track: string;
  locationRoom: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  isLive?: boolean;
}

export interface VolunteerAssignment {
  id: string;
  userId: string;
  volunteerName: string;
  volunteerEmail: string;
  avatarUrl?: string;
  roleTitle: string;
  venueLocation: string;
  shiftStart: string;
  shiftEnd: string;
  status: 'on_duty' | 'off_duty' | 'assigned';
}

export interface Announcement {
  id: string;
  eventId: string;
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'urgent';
  createdAt: string;
  authorName: string;
}

export interface Feedback {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  rating: number; // 1 - 5
  comments: string;
  category: 'Keynote' | 'Venue' | 'Organization' | 'Food' | 'Overall';
  createdAt: string;
}

export interface Certificate {
  id: string;
  registrationId: string;
  userId: string;
  userName: string;
  eventName: string;
  certificateNumber: string;
  issuedAt: string;
  downloadUrl?: string;
}

export interface AnalyticsSummary {
  totalRegistrations: number;
  checkedInCount: number;
  checkedInPercentage: number;
  activeVolunteers: number;
  avgFeedbackRating: number;
  npsScore: number;
  checkInsByHour: { hour: string; count: number }[];
  salesByTier: { tier: TicketType; percentage: number; count: number }[];
}
