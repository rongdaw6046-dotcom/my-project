import React, { useState } from 'react';
import { useApp } from '../../src/context/AppContext';
import { User, UserRole, Meeting } from '../../types';
import { Plus, Search, UserCheck, Check, X, Edit, Trash, AlertTriangle } from 'lucide-react';

export const ManageUsers: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, meetings, updateUserPermissions, user: currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [permissionModalUser, setPermissionModalUser] = useState<User | null>(null);

  // User Form State
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState({
    username: '',
    name: '',
    surname: '',
    position: '',
    role: UserRole.USER,
    password: '', // Optional for edit
    lineUserId: '' // Add field
  });

  const filteredUsers = (users || []).filter(u =>
    (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.surname || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setUserForm({ username: '', name: '', surname: '', position: '', role: UserRole.USER, password: '', lineUserId: '' });
    setEditingUserId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUserId(user.id);
    setUserForm({
      username: user.username,
      name: user.name,
      surname: user.surname,
      position: user.position,
      role: user.role,
      password: '', // Keep empty unless changing
      lineUserId: user.lineUserId || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = (userToDelete: User) => {
    if (currentUser && currentUser.id === userToDelete.id) {
      alert("ไม่สามารถลบบัญชีที่กำลังใช้งานอยู่ได้");
      return;
    }

    if (window.confirm(`คุณแน่ใจหรือไม่ที่จะลบผู้ใช้ "${userToDelete.name}" ? \nการกระทำนี้ไม่สามารถเรียกคืนได้`)) {
      deleteUser(userToDelete.id);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingUserId) {
      // Update Mode
      const updates: Partial<User> = {
        username: userForm.username,
        name: userForm.name,
        surname: userForm.surname,
        position: userForm.position,
        role: userForm.role,
        lineUserId: userForm.lineUserId
      };
      // Only update password if provided
      if (userForm.password) {
        updates.password = userForm.password;
      }
      updateUser(editingUserId, updates);
    } else {
      // Create Mode
      if (!userForm.username || !userForm.name) {
        alert('กรุณากรอกข้อมูลที่จำเป็น');
        return;
      }
      addUser({
        username: userForm.username,
        name: userForm.name,
        surname: userForm.surname,
        position: userForm.position,
        role: userForm.role,
        password: userForm.password || '123456', // Default password
        lineUserId: userForm.lineUserId
      });
    }

    setIsModalOpen(false);
    resetForm();
  };

  // Permission Logic
  const openPermissionModal = (user: User) => {
    setPermissionModalUser(user);
  };

  // --- Permission Management ---

  const handleOpenPermissions = (user: User) => {
    setPermissionModalUser(user);
  };

  const toggleMeetingPermission = async (meetingId: string) => {
    if (!permissionModalUser) return;

    const currentPermissions = permissionModalUser.allowedMeetingIds || [];
    let newPermissions: string[];

    // คำนวณค่า (Toggle)
    if (currentPermissions.includes(meetingId)) {
      newPermissions = currentPermissions.filter(id => id !== meetingId);
    } else {
      newPermissions = [...currentPermissions, meetingId];
    }

    try {
      // --- จุดสำคัญ: ส่ง key เป็น 'allowed_meeting_ids' (snake_case) ให้ตรงกับ DB ---
      await updateUser(permissionModalUser.id, {
        allowed_meeting_ids: newPermissions
      } as any);

      // อัปเดตหน้าจอ (ใช้ชื่อเดิม allowedMeetingIds)
      setPermissionModalUser({
        ...permissionModalUser,
        allowedMeetingIds: newPermissions
      });

    } catch (error: any) {
      console.error("Update failed:", error);
      alert(`บันทึกไม่สำเร็จ: ${error.message}`);
    }
  };

  const addAllPermissions = async () => {
    if (!permissionModalUser) return;
    const allMeetingIds = meetings.map(m => m.id);

    try {
      // --- จุดสำคัญ ---
      await updateUser(permissionModalUser.id, {
        allowed_meeting_ids: allMeetingIds
      } as any);

      setPermissionModalUser({
        ...permissionModalUser,
        allowedMeetingIds: allMeetingIds
      });
      alert("เพิ่มสิทธิ์ทั้งหมดเรียบร้อยแล้ว");
    } catch (error: any) {
      console.error(error);
      alert("บันทึกสิทธิ์ไม่สำเร็จ: " + error.message);
    }
  };

  const removeAllPermissions = async () => {
    if (!permissionModalUser) return;
    try {
      // --- จุดสำคัญ ---
      await updateUser(permissionModalUser.id, {
        allowed_meeting_ids: []
      } as any);

      setPermissionModalUser({
        ...permissionModalUser,
        allowedMeetingIds: []
      });
      alert("ลบสิทธิ์ทั้งหมดเรียบร้อยแล้ว");
    } catch (error: any) {
      console.error(error);
      alert("บันทึกสิทธิ์ไม่สำเร็จ: " + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">จัดการผู้ใช้งาน</h2>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700"
        >
          <Plus size={18} className="mr-2" />
          เพิ่มผู้ใช้งาน
        </button>
      </div>

      {/* User List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="ค้นหาชื่อ หรือ username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อ - นามสกุล</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ตำแหน่ง</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สิทธิ์</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.name} {u.surname}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.position}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === UserRole.ADMIN ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openPermissionModal(u)}
                        className="text-orange-600 hover:text-orange-900 bg-orange-50 p-1.5 rounded-md"
                        title="จัดการสิทธิ์เข้าประชุม"
                      >
                        <UserCheck size={16} />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 p-1.5 rounded-md"
                        title="แก้ไขข้อมูล"
                      >
                        <Edit size={16} />
                      </button>
                      {currentUser?.id !== u.id && (
                        <button
                          onClick={() => handleDelete(u)}
                          className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded-md"
                          title="ลบผู้ใช้งาน"
                        >
                          <Trash size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-orange-600 rounded-t-lg">
              <h3 className="text-lg font-medium text-white">{editingUserId ? 'แก้ไขผู้ใช้งาน' : 'เพิ่มผู้ใช้งาน'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white hover:text-gray-200">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input required type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  value={userForm.username} onChange={e => setUserForm({ ...userForm, username: e.target.value })}
                  disabled={!!editingUserId} // Don't allow changing username on edit
                />
              </div>

              {!editingUserId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input type="password" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} placeholder="กำหนดรหัสผ่าน..." />
                </div>
              )}

              {editingUserId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reset Password <span className="text-gray-400 font-normal">(เว้นว่างหากไม่ต้องการเปลี่ยน)</span></label>
                  <input type="password" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} placeholder="ตั้งรหัสผ่านใหม่..." />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">ชื่อ</label>
                  <input required type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">นามสกุล</label>
                  <input required type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    value={userForm.surname} onChange={e => setUserForm({ ...userForm, surname: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ตำแหน่ง</label>
                <input required type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  value={userForm.position} onChange={e => setUserForm({ ...userForm, position: e.target.value })} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">สิทธิ์การใช้งาน</label>
                <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
                  value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value as UserRole })}>
                  <option value={UserRole.USER}>ผู้ใช้งานทั่วไป (User)</option>
                  <option value={UserRole.ADMIN}>ผู้ดูแลระบบ (Admin)</option>
                </select>
              </div>
              <div className="mt-5 sm:mt-6">
                <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-orange-600 text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:text-sm">
                  {editingUserId ? 'บันทึกการแก้ไข' : 'สร้างผู้ใช้งาน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permission Manager Modal (Transfer List Style) */}
      {permissionModalUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-800 rounded-t-lg">
              <h3 className="text-lg font-medium text-white">
                จัดการสิทธิ์เข้าประชุม: {permissionModalUser.name} {permissionModalUser.surname}
              </h3>
              <button onClick={() => setPermissionModalUser(null)} className="text-white hover:text-gray-300">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-stretch h-[400px]">
                {/* Allowed Meetings */}
                <div className="flex-1 flex flex-col border border-gray-200 rounded-md">
                  <div className="p-3 bg-green-50 border-b border-green-100 font-semibold text-green-800 flex justify-between items-center">
                    <span>รายการที่ประชุมที่มีสิทธิ์ ({permissionModalUser.allowedMeetingIds.length})</span>
                    <button onClick={removeAllPermissions} className="text-xs underline text-red-600 hover:text-red-800">ลบทั้งหมด</button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {meetings
                      .filter(m => permissionModalUser.allowedMeetingIds.includes(m.id))
                      .map(m => (
                        <div key={m.id} className="flex justify-between items-center p-2 hover:bg-gray-50 border border-gray-100 rounded">
                          <div className="text-sm">
                            <div className="font-medium text-gray-800">{m.title}</div>
                            <div className="text-xs text-gray-500">{m.edition}</div>
                          </div>
                          <button onClick={() => toggleMeetingPermission(m.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    {permissionModalUser.allowedMeetingIds.length === 0 && <p className="text-center text-gray-400 mt-4 text-sm">ไม่มีสิทธิ์เข้าถึงการประชุมใดๆ</p>}
                  </div>
                </div>

                {/* Arrows (Visual only for mobile, functional logic is in buttons) */}
                <div className="flex md:flex-col justify-center items-center gap-2 text-gray-400">
                  <span className="hidden md:block">⇆</span>
                </div>

                {/* Not Allowed Meetings */}
                <div className="flex-1 flex flex-col border border-gray-200 rounded-md">
                  <div className="p-3 bg-red-50 border-b border-red-100 font-semibold text-red-800 flex justify-between items-center">
                    <span>รายการที่ประชุมที่ไม่มีสิทธิ์</span>
                    <button onClick={addAllPermissions} className="text-xs underline text-green-600 hover:text-green-800">เพิ่มทั้งหมด</button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {meetings
                      .filter(m => !permissionModalUser.allowedMeetingIds.includes(m.id))
                      .map(m => (
                        <div key={m.id} className="flex justify-between items-center p-2 hover:bg-gray-50 border border-gray-100 rounded">
                          <div className="text-sm">
                            <div className="font-medium text-gray-800">{m.title}</div>
                            <div className="text-xs text-gray-500">{m.edition}</div>
                          </div>
                          <button onClick={() => toggleMeetingPermission(m.id)} className="text-green-500 hover:bg-green-50 p-1 rounded">
                            <Plus size={16} />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};