import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User, Meeting, AgendaItem, Attendee,
  MeetingContextType, UserRole, AttendeeStatus
} from '../../types';

const AppContext = createContext<MeetingContextType | undefined>(undefined);

const API = '/api'; // Proxied to http://localhost:3000 by Vite

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- State ---
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('kku_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [users, setUsers] = useState<User[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [agendas, setAgendas] = useState<AgendaItem[]>([]);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. Fetch All Data ---
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [usersRes, meetingsRes, agendasRes, attendeesRes] = await Promise.all([
        fetch(`${API}/users`).then(r => r.json()),
        fetch(`${API}/meetings`).then(r => r.json()),
        fetch(`${API}/agendas`).then(r => r.json()),
        fetch(`${API}/attendees`).then(r => r.json()),
      ]);
      setUsers(Array.isArray(usersRes) ? usersRes : []);
      setMeetings(Array.isArray(meetingsRes) ? meetingsRes : []);
      setAgendas(Array.isArray(agendasRes) ? agendasRes : []);
      setAttendees(Array.isArray(attendeesRes) ? attendeesRes : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- 2. Auth ---
  const login = async (username: string, pass: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: pass })
      });
      if (!res.ok) return false;
      const data = await res.json();
      setUser(data);
      localStorage.setItem('kku_user', JSON.stringify(data));
      return true;
    } catch { return false; }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('kku_user');
  };

  const register = async (newUser: Omit<User, 'id' | 'allowedMeetingIds'>): Promise<boolean> => {
    try {
      const res = await fetch(`${API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      if (!res.ok) return false;
      await fetchData();
      return true;
    } catch { return false; }
  };

  // --- 3. Users ---
  const addUser = async (newUser: Omit<User, 'id' | 'allowedMeetingIds'>) => {
    await fetch(`${API}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });
    fetchData();
  };

  const updateUser = async (id: string, updatedUser: Partial<User>) => {
    try {
      const res = await fetch(`${API}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser)
      });
      if (!res.ok) {
        const err = await res.json();
        alert(`ไม่สามารถบันทึกข้อมูลได้: ${err.error}`);
        return;
      }
      await fetchData();
      alert('บันทึกข้อมูลเรียบร้อยแล้ว');
    } catch (err: any) {
      alert(`เกิดข้อผิดพลาด: ${err.message}`);
    }
  };

  const deleteUser = async (id: string) => {
    await fetch(`${API}/users/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const updateUserPermissions = async (userId: string, meetingIds: string[]) => {
    await fetch(`${API}/users/${userId}/permissions`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ allowedMeetingIds: meetingIds })
    });
    fetchData();
  };

  // --- 4. Meetings ---
  const addMeeting = async (meeting: Omit<Meeting, 'id'>) => {
    const res = await fetch(`${API}/meetings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(meeting)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add meeting');
    }
    await fetchData();
  };

  const updateMeeting = async (id: string, updatedMeeting: Partial<Meeting>) => {
    const res = await fetch(`${API}/meetings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedMeeting)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update meeting');
    }
    await fetchData();
  };

  const deleteMeeting = async (id: string) => {
    await fetch(`${API}/meetings/${id}`, { method: 'DELETE' });
    fetchData();
  };

  // --- 5. Agendas ---
  const addAgenda = async (agenda: Omit<AgendaItem, 'id'>) => {
    const res = await fetch(`${API}/agendas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agenda)
    });
    if (!res.ok) throw new Error('Failed to add agenda');
    await fetchData();
  };

  const updateAgenda = async (id: string, updatedAgenda: Partial<AgendaItem>) => {
    const res = await fetch(`${API}/agendas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedAgenda)
    });
    if (!res.ok) throw new Error('Failed to update agenda');
    await fetchData();
  };

  const deleteAgenda = async (id: string) => {
    const res = await fetch(`${API}/agendas/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete agenda');
    await fetchData();
  };

  // --- 6. Attendees ---
  const fetchAttendees = async (meetingId: string) => {
    try {
      const data = await fetch(`${API}/attendees?meetingId=${meetingId}`).then(r => r.json());
      if (Array.isArray(data)) setAttendees(data);
    } catch (e) { console.error('Error fetching attendees:', e); }
  };

  const addAttendee = async (attendee: any) => {
    const mId = attendee.meetingId || attendee.meeting_id;
    const uId = attendee.userId || attendee.user_id;

    if (uId) {
      const exists = attendees.find(a => a.userId === uId && a.meetingId === mId);
      if (exists) { alert('รายชื่อนี้มีอยู่ในระบบแล้ว'); return; }
    }

    const res = await fetch(`${API}/attendees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meetingId: mId, userId: uId, name: attendee.name, position: attendee.position })
    });

    if (!res.ok) {
      const err = await res.json();
      alert('บันทึกไม่สำเร็จ: ' + err.error);
    } else {
      if (mId) fetchAttendees(mId);
    }
  };

  const removeAttendee = async (id: string) => {
    const target = attendees.find(a => a.id === id);
    await fetch(`${API}/attendees/${id}`, { method: 'DELETE' });
    if (target) fetchAttendees(target.meetingId);
    else fetchData();
  };

  const updateAttendeeStatus = async (id: string, status: AttendeeStatus) => {
    await fetch(`${API}/attendees/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchData();
  };

  return (
    <AppContext.Provider value={{
      user, users, meetings, agendas, attendees, isLoading,
      login, logout, register,
      addUser, updateUser, deleteUser, updateUserPermissions,
      addMeeting, updateMeeting, deleteMeeting,
      addAgenda, updateAgenda, deleteAgenda,
      addAttendee, removeAttendee, updateAttendeeStatus,
      fetchAttendees
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useApp must be used within an AppProvider');
  return context;
};