import React, { useState } from 'react';
import { useApp } from '../src/context/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, ArrowRight } from 'lucide-react';
import { UserRole } from '../types';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login, user } = useApp();
  const navigate = useNavigate();

  React.useEffect(() => {
    // 1. Handle LIFF redirection if parameters are present at root
    const urlParams = new URLSearchParams(window.location.search);
    const meetingId = urlParams.get('meetingId');
    const liffId = urlParams.get('liffId');

    if (meetingId && liffId) {
      navigate(`/liff/register?meetingId=${meetingId}&liffId=${liffId}`);
      return;
    }

    // 2. Normal auth redirect
    if (user) {
      if (user.role === UserRole.ADMIN) navigate('/admin/dashboard');
      else navigate('/user/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน');
      return;
    }

    setIsLoggingIn(true);
    setError('');

    try {
      const success = await login(username, password);
      if (!success) {
        setError('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl flex overflow-hidden min-h-[500px]">

        {/* Left Side - Image/Brand */}
        <div className="hidden md:flex w-1/2 bg-orange-600 p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black opacity-20"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white font-bold text-xl mb-6">M</div>
            <h2 className="text-3xl font-bold text-white mb-2">MeetingSrithep</h2>
            <p className="text-orange-100">ระบบบริหารจัดการการประชุม<br />โรงพยาบาลศรีเทพ</p>
          </div>
          <div className="relative z-10 text-orange-100 text-sm">
            © Computer Center
          </div>
          {/* Decorative circles */}
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-orange-500 rounded-full opacity-50"></div>
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-orange-500 rounded-full opacity-50"></div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="text-center md:text-left mb-8">
            <h1 className="text-2xl font-bold text-gray-800">ยินดีต้อนรับ</h1>
            <p className="text-gray-500 mt-2">กรุณาลงชื่อเข้าใช้งานเพื่อดำเนินการต่อ</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อผู้ใช้งาน</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-600 transition-colors">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
                  placeholder="Username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">รหัสผ่าน</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-600 transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg flex items-center gap-2">⚠️ {error}</div>}

            <button
              type="submit"
              disabled={isLoggingIn}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl shadow-lg shadow-orange-200 transition-all transform hover:-translate-y-0.5 ${isLoggingIn ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoggingIn ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'} {!isLoggingIn && <ArrowRight size={20} />}
            </button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <p className="text-sm text-gray-500">
              ยังไม่มีบัญชีผู้ใช้งาน? <Link to="/register" className="text-orange-600 font-bold hover:underline">สมัครสมาชิก</Link>
            </p>
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-400">ทดสอบระบบ (หลังจาก Seed DB): admin / password</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};