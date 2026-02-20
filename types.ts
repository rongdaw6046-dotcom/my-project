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
  createdAt: string;
}

// 7. แจ้งเตือน
export interface Notification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
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
}