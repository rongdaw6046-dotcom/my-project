import React, { useState } from 'react';
import { useApp } from '../src/context/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, Briefcase, ArrowRight, UserCircle } from 'lucide-react';
import { UserRole } from '../types';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    surname: '',
    position: ''
  });
  const [error, setError] = useState('');
  const { register } = useApp();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }

    if (!formData.username || !formData.password || !formData.name || !formData.surname) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    const success = await register({
      username: formData.username,
      password: formData.password,
      name: formData.name,
      surname: formData.surname,
      position: formData.position || 'บุคลากรทั่วไป',
      role: UserRole.USER // Default role for self-registration
    });

    if (success) {
      navigate('/user/dashboard');
    } else {
      setError('ชื่อผู้ใช้งานนี้มีอยู่ในระบบแล้ว');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl flex overflow-hidden min-h-[600px]">
        
        {/* Left Side - Image/Brand (Same as Login) */}
        <div className="hidden md:flex w-5/12 bg-orange-600 p-12 flex-col justify-between relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black opacity-20"></div>
           <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white font-bold text-xl mb-6">M</div>
              <h2 className="text-3xl font-bold text-white mb-2">KKU Meeting</h2>
              <p className="text-orange-100">ระบบบริหารจัดการการประชุม<br/>มหาวิทยาลัยขอนแก่น</p>
           </div>
           
           <div className="relative z-10">
                <p className="text-white font-medium mb-4">เข้าร่วมกับเราวันนี้</p>
                <ul className="text-orange-100 text-sm space-y-2">
                    <li className="flex items-center gap-2">✓ จัดการวาระการประชุมได้ง่าย</li>
                    <li className="flex items-center gap-2">✓ ติดตามสถานะผู้เข้าร่วม</li>
                    <li className="flex items-center gap-2">✓ เข้าถึงเอกสารการประชุมออนไลน์</li>
                </ul>
           </div>

           <div className="relative z-10 text-orange-100 text-sm mt-8">
              © Computer Center, KKU
           </div>
           <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-orange-500 rounded-full opacity-50"></div>
           <div className="absolute -top-24 -left-24 w-64 h-64 bg-orange-500 rounded-full opacity-50"></div>
        </div>

        {/* Right Side - Register Form */}
        <div className="w-full md:w-7/12 p-8 md:p-12 overflow-y-auto">
          <div className="text-center md:text-left mb-8">
            <h1 className="text-2xl font-bold text-gray-800">สมัครสมาชิกใหม่</h1>
            <p className="text-gray-500 mt-2">กรอกข้อมูลเพื่อสร้างบัญชีผู้ใช้งาน</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อจริง</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                        <UserCircle size={20} />
                        </div>
                        <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
                        placeholder="ชื่อจริง"
                        required
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">นามสกุล</label>
                    <div className="relative group">
                        <input
                        type="text"
                        name="surname"
                        value={formData.surname}
                        onChange={handleChange}
                        className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
                        placeholder="นามสกุล"
                        required
                        />
                    </div>
                </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ตำแหน่ง / สังกัด</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Briefcase size={20} />
                </div>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
                  placeholder="เช่น อาจารย์, นักวิชาการศึกษา"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100"></div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อผู้ใช้งาน (Username)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
                  placeholder="ภาษาอังกฤษเท่านั้น"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">รหัสผ่าน</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                        <Lock size={20} />
                        </div>
                        <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
                        placeholder="••••••••"
                        required
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ยืนยันรหัสผ่าน</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                        <Lock size={20} />
                        </div>
                        <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
                        placeholder="••••••••"
                        required
                        />
                    </div>
                </div>
            </div>

            {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg flex items-center gap-2 animate-pulse">⚠️ {error}</div>}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl shadow-lg shadow-orange-200 transition-all transform hover:-translate-y-0.5 mt-2"
            >
              สมัครสมาชิก <ArrowRight size={20} />
            </button>
          </form>

          <div className="mt-8 text-center">
             <p className="text-sm text-gray-500">
                มีบัญชีผู้ใช้งานแล้ว? <Link to="/" className="text-orange-600 font-bold hover:underline">เข้าสู่ระบบ</Link>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};