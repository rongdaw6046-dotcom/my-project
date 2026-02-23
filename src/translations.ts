
export const translations = {
    th: {
        // Navigation
        home: 'หน้าหลัก',
        myMeetings: 'การประชุมของฉัน',
        calendar: 'ปฏิทินการประชุม',
        history: 'ประวัติการประชุม',
        reports: 'รายงาน / เอกสาร',
        assignedTasks: 'งานที่ได้รับมอบหมาย',
        accountSettings: 'ตั้งค่าบัญชี',
        adminDashboard: 'ภาพรวมระบบ',
        manageMeetings: 'รายการการประชุม',
        createMeeting: 'สร้างการประชุม',
        manageUsers: 'จัดการผู้ใช้งาน',
        notifications: 'จัดการการแจ้งเตือน',
        adminReports: 'รายงานสรุปผล',
        logout: 'ออกจากระบบ',

        // Settings Page
        settingsTitle: 'ตั้งค่าบัญชีผู้ใช้',
        settingsSub: 'จัดการข้อมูลส่วนตัว ความปลอดภัย และการแสดงผล',
        profileTab: 'ข้อมูลส่วนตัว',
        securityTab: 'ความปลอดภัย',
        preferencesTab: 'การแสดงผล',
        saveBtn: 'บันทึกข้อมูล',
        saveSettings: 'บันทึกการตั้งค่า',
        changePassword: 'เปลี่ยนรหัสผ่าน',
        currentPassword: 'รหัสผ่านปัจจุบัน',
        newPassword: 'รหัสผ่านใหม่ (อย่างน้อย 6 ตัว)',
        confirmPassword: 'ยืนยันรหัสผ่านใหม่',
        systemLanguage: 'ภาษาของระบบ',
        displayMode: 'โหมดหน้าจอ',
        saveSuccess: 'บันทึกเรียบร้อยแล้ว',
        langNote: '⚙️ ภาษาที่เลือกจะถูกบันทึกและแสดงในลำดับถัดไป',
        darkModeNote: '🌙 Dark Mode เปิดใช้งานแล้ว',

        // Sections
        overview: 'ภาพรวม',
        meetings: 'การประชุม',
        tasks: 'งาน',
        account: 'บัญชี',
        adminMenu: 'เมนูหลัก',

        // Role
        admin: 'ผู้ดูแลระบบ',
        user: 'ผู้ใช้งานทั่วไป',
    },
    en: {
        // Navigation
        home: 'Home',
        myMeetings: 'My Meetings',
        calendar: 'Meeting Calendar',
        history: 'Meeting History',
        reports: 'Reports / Documents',
        assignedTasks: 'Assigned Tasks',
        accountSettings: 'Account Settings',
        adminDashboard: 'Admin Dashboard',
        manageMeetings: 'Meetings List',
        createMeeting: 'Create Meeting',
        manageUsers: 'User Management',
        notifications: 'Push Notifications',
        adminReports: 'System Reports',
        logout: 'Logout',

        // Settings Page
        settingsTitle: 'User Settings',
        settingsSub: 'Manage your profile, security, and display preferences',
        profileTab: 'Profile',
        securityTab: 'Security',
        preferencesTab: 'Preferences',
        saveBtn: 'Save Changes',
        saveSettings: 'Save Settings',
        changePassword: 'Change Password',
        currentPassword: 'Current Password',
        newPassword: 'New Password (min 6 chars)',
        confirmPassword: 'Confirm New Password',
        systemLanguage: 'System Language',
        displayMode: 'Display Mode',
        saveSuccess: 'Successfully Saved',
        langNote: '⚙️ Selected language is saved and will apply on next update.',
        darkModeNote: '🌙 Dark Mode is active',

        // Sections
        overview: 'Overview',
        meetings: 'Meetings',
        tasks: 'Tasks',
        account: 'Account',
        adminMenu: 'Main Menu',

        // Role
        admin: 'Administrator',
        user: 'General User',
    }
};

export type TranslationKeys = keyof typeof translations.th;
