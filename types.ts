export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  surname: string;
  position: string;
  role: UserRole;
  allowedMeetingIds: string[];
  lineUserId?: string; // LINE User ID (U...)
  profileImage?: string; // Base64 string
}

export interface AgendaItem {
  id: string;
  meetingId: string;
  title: string;
  description: string;
  order: number;
  files: { name: string; url: string }[];
  isImportant?: boolean;
}

export interface Meeting {
  id: string;
  title: string;
  edition: string;
  date: string;
  time: string;
  location: string;
  status: 'UPCOMING' | 'COMPLETED';
  budget?: number; // 7. สถิติค่าใช้จ่าย
  minutesFiles?: { name: string; url: string }[]; // 6. รายงานการประชุม
  minutesSummary?: string; // New: สรุปรายงานการประชุม
}

// 3. & 4. & 5. จัดการผู้เข้าร่วมและสถานะ
export type AttendeeStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

export interface Attendee {
  id: string;
  meetingId: string;
  userId?: string; // ถ้าเป็นคนในระบบ
  name: string; // ชื่อที่แสดง (หรือชื่อคนภายนอก)
  position?: string;
  status: AttendeeStatus;
}

// 5. เอกสารการประชุม
export interface MeetingDocument {
  id: string;
  meetingId: string;
  name: string;
  url: string;
  mimeType?: string; // Optional: for uploaded files
  createdAt: string;
}

// 7. แจ้งเตือน
export interface Notification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  link?: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

// ─── Voting / Resolution System ───────────────────────────────────────────────
export type VoteChoice = 'APPROVE' | 'REJECT' | 'ABSTAIN';
export type VoteSessionStatus = 'PENDING' | 'OPEN' | 'CLOSED';

export interface VoteSession {
  id: string;
  meetingId: string;
  agendaId: string;
  title: string;
  status: VoteSessionStatus;
  opensAt?: string;
  closesAt?: string;
  createdBy?: string;
  createdAt: string;
}

export interface Vote {
  id: string;
  sessionId: string;
  userId: string;
  choice: VoteChoice;
  votedAt: string;
}

export interface VoteResult {
  approve: number;
  reject: number;
  abstain: number;
  total: number;
}

export interface MeetingContextType {
  user: User | null;
  users: User[];
  meetings: Meeting[];
  agendas: AgendaItem[];
  attendees: Attendee[];
  documents: MeetingDocument[]; // New
  notifications: Notification[]; // New
  isLoading: boolean;
  // Preferences
  lang: 'th' | 'en';
  darkMode: boolean;
  setLang: (lang: 'th' | 'en') => void;
  setDarkMode: (dark: boolean) => void;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (user: Omit<User, 'id' | 'allowedMeetingIds'>) => Promise<boolean>;
  // Admin Actions
  addUser: (user: Omit<User, 'id' | 'allowedMeetingIds'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  updateUserPermissions: (userId: string, meetingIds: string[]) => void;
  addMeeting: (meeting: Omit<Meeting, 'id'>) => void;
  updateMeeting: (id: string, meeting: Partial<Meeting>) => void;
  deleteMeeting: (id: string) => void;
  addAgenda: (agenda: Omit<AgendaItem, 'id'>) => void;
  updateAgenda: (id: string, agenda: Partial<AgendaItem>) => void;
  deleteAgenda: (id: string) => void;
  // Attendee Actions
  addAttendee: (attendee: Omit<Attendee, 'id'>) => void;
  removeAttendee: (id: string) => void;
  updateAttendeeStatus: (id: string, status: AttendeeStatus) => void;
  fetchAttendees: (meetingId: string) => void;
  // Document Actions
  fetchDocuments: (meetingId: string) => void;
  addDocument: (doc: Omit<MeetingDocument, 'id' | 'createdAt'>) => void;
  deleteDocument: (id: string) => void;
  // Notification Actions
  fetchNotifications: () => void;
  sendNotification: (notif: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  // Voting Actions
  voteSessions: VoteSession[];
  fetchVoteSessions: (meetingId: string) => Promise<void>;
  addVoteSession: (session: Omit<VoteSession, 'id' | 'createdAt'>) => Promise<VoteSession>;
  updateVoteSession: (id: string, data: Partial<VoteSession>) => Promise<void>;
  deleteVoteSession: (id: string) => Promise<void>;
  setVoteSessionStatus: (id: string, status: VoteSessionStatus) => Promise<void>;
  fetchVoteResults: (sessionId: string) => Promise<VoteResult>;
  castVote: (sessionId: string, userId: string, choice: VoteChoice) => Promise<void>;
  fetchMyVote: (sessionId: string, userId: string) => Promise<Vote | null>;
}
