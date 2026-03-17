import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../src/context/AppContext';
import { ArrowLeft, Users, Calendar, FileText, CheckCircle, Clock, XCircle, BarChart2, PieChart, Printer, Download, Eye, X } from 'lucide-react';

export const Reports: React.FC = () => {
    const navigate = useNavigate();
    const { users, meetings, attendees, lang } = useApp();
    const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);

    // -- Statistics Calculation --
    const totalUsers = users.length;
    const totalMeetings = meetings.length;
    const totalAttendees = attendees.length;
    const acceptedAttendees = attendees.filter(a => a.status === 'ACCEPTED').length;
    const pendingAttendees = attendees.filter(a => a.status === 'PENDING').length;
    const declinedAttendees = attendees.filter(a => a.status === 'DECLINED').length;
    const acceptedRate = totalAttendees ? Math.round((acceptedAttendees / totalAttendees) * 100) : 0;
    const completedMeetings = meetings.filter(m => m.status === 'COMPLETED').length;
    const upcomingMeetings = meetings.filter(m => m.status === 'UPCOMING').length;
    const totalBudget = meetings.reduce((sum, m) => sum + (m.budget || 0), 0);

    const handlePrint = () => {
        setIsPreviewOpen(false);
        setTimeout(() => {
            window.print();
        }, 300);
    };

    return (
        <div className="pb-10">
            {/* Print Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    nav, aside, button, .no-print { display: none !important; }
                    body { background: white !important; }
                    .print-only { display: block !important; }
                    main { margin: 0 !important; padding: 0 !important; }
                    .card { border: none !important; box-shadow: none !important; }
                }
                .print-only { display: none; }
            `}} />

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 no-print">
                <div>
                    <button onClick={() => navigate('/admin/dashboard')} className="mb-2 inline-flex items-center text-gray-500 hover:text-orange-600 transition-colors">
                        <ArrowLeft size={20} className="mr-1" /> กลับหน้าหลัก
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800">รายงานสรุปผลการดำเนินงาน</h2>
                    <p className="text-gray-500 text-sm">ภาพรวมข้อมูลการใช้งานระบบและการประชุม</p>
                </div>
                <button
                    onClick={() => setIsPreviewOpen(true)}
                    className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-lg shadow-sm transition-all font-medium"
                >
                    <Eye size={18} /> ดูตัวอย่างและพิมพ์ (Preview)
                </button>
            </div>

            {/* Dashboard Content (Original) */}
            <div className="no-print">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {/* (Metrics Cards - same as before) */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">การประชุมทั้งหมด</p>
                                <h3 className="text-3xl font-bold text-gray-800 mt-2">{totalMeetings}</h3>
                            </div>
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Calendar size={24} /></div>
                        </div>
                        <div className="mt-4 flex gap-3 text-sm">
                            <span className="text-green-600 font-medium">{completedMeetings} เสร็จสิ้น</span>
                            <span className="text-orange-600 font-medium">{upcomingMeetings} รอจัด</span>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">ผู้ใช้งานระบบ</p>
                                <h3 className="text-3xl font-bold text-gray-800 mt-2">{totalUsers}</h3>
                            </div>
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><Users size={24} /></div>
                        </div>
                        <div className="mt-4 text-sm text-gray-500">บุคลากรภายในและผู้ดูแลระบบ</div>
                    </div>
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">การตอบรับเข้าร่วม</p>
                                <h3 className="text-3xl font-bold text-gray-800 mt-2">{acceptedRate}%</h3>
                            </div>
                            <div className="p-3 bg-green-50 text-green-600 rounded-lg"><PieChart size={24} /></div>
                        </div>
                        <div className="mt-4 text-sm text-gray-500">จากผู้ได้รับเชิญทั้งหมด {totalAttendees} คน</div>
                    </div>
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">งบประมาณรวม</p>
                                <h3 className="text-3xl font-bold text-gray-800 mt-2">฿{totalBudget.toLocaleString()}</h3>
                            </div>
                            <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><BarChart2 size={24} /></div>
                        </div>
                        <div className="mt-4 text-sm text-gray-500">งบประมาณการจัดประชุมทั้งหมด</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-5 border-b border-gray-200 bg-gray-50">
                            <h3 className="font-bold text-gray-800">รายการประชุมล่าสุด</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-white">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">หัวข้อประชุม</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันเวลา</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {meetings.slice(0, 10).map(m => (
                                        <tr key={m.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-[200px]">{m.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{m.date} {m.time}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                                <span className={`px-2 py-1 rounded-full text-xs ${m.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                                    {m.status === 'COMPLETED' ? 'เสร็จสิ้น' : 'รอจัด'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-5 border-b border-gray-200 bg-gray-50">
                            <h3 className="font-bold text-gray-800">สถิติการตอบรับ</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm font-medium mb-1">
                                        <span className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500" /> เข้าร่วม</span>
                                        <span>{acceptedAttendees} คน</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${totalAttendees ? (acceptedAttendees / totalAttendees) * 100 : 0}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm font-medium mb-1">
                                        <span className="flex items-center gap-2"><Clock size={16} className="text-orange-500" /> รอตอบรับ</span>
                                        <span>{pendingAttendees} คน</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: `${totalAttendees ? (pendingAttendees / totalAttendees) * 100 : 0}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm font-medium mb-1">
                                        <span className="flex items-center gap-2"><XCircle size={16} className="text-red-500" /> ปฏิเสธ</span>
                                        <span>{declinedAttendees} คน</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${totalAttendees ? (declinedAttendees / totalAttendees) * 100 : 0}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Layout (Only visible during print) */}
            <div className="print-only w-full bg-white p-8">
                <div className="text-center mb-8 border-b-2 border-gray-800 pb-6">
                    <img src="/logo.png" alt="Logo" className="w-16 h-16 mx-auto mb-2 no-print" />
                    <h1 className="text-2xl font-bold text-gray-900">รายงานสรุปผลการดำเนินงานระบบจัดการการประชุม (Operation Summary Report)</h1>
                    <p className="text-gray-600 mt-1">โรงพยาบาลศรีเทพ (Srithep Hospital)</p>
                    <p className="text-sm text-gray-500 mt-2">ข้อมูล ณ วันที่ {new Date().toLocaleDateString('th-TH', { dateStyle: 'full' })}</p>
                </div>

                <div className="mb-8 overflow-hidden border border-gray-300 rounded-lg">
                    <p className="bg-gray-100 p-3 font-bold border-b border-gray-300">1. ข้อมูลสรุปเชิงตัวเลข (Quantitative Summary)</p>
                    <table className="w-full text-left border-collapse">
                        <tbody>
                            <tr className="border-b border-gray-200">
                                <td className="p-3 font-medium bg-gray-50 w-1/2">จำนวนการประชุมทั้งหมด</td>
                                <td className="p-3">{totalMeetings} ครั้ง</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="p-3 font-medium bg-gray-50">จำนวนผู้ใช้งานในระบบ</td>
                                <td className="p-3">{totalUsers} คน</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="p-3 font-medium bg-gray-50">อัตราการตอบรับเข้าร่วมเฉลี่ย</td>
                                <td className="p-3">{acceptedRate}%</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-medium bg-gray-50">งบประมาณการประชุมรวม</td>
                                <td className="p-3">฿{totalBudget.toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="mb-8 overflow-hidden border border-gray-300 rounded-lg">
                    <p className="bg-gray-100 p-3 font-bold border-b border-gray-300">2. รายละเอียดการประชุม (Meetings Detail)</p>
                    <table className="w-full text-left border-collapse text-sm">
                        <thead className="bg-gray-50 uppercase tracking-tight">
                            <tr>
                                <th className="p-3 border-b border-gray-300">หัวข้อ</th>
                                <th className="p-3 border-b border-gray-300">วันเวลา</th>
                                <th className="p-3 border-b border-gray-300">สถานที่</th>
                                <th className="p-3 border-b border-gray-300 text-center">สถานะ</th>
                                <th className="p-3 border-b border-gray-300 text-right">งบประมาณ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {meetings.map(m => (
                                <tr key={m.id} className="border-b border-gray-200">
                                    <td className="p-3">{m.title}</td>
                                    <td className="p-3 whitespace-nowrap">{m.date} {m.time}</td>
                                    <td className="p-3">{m.location}</td>
                                    <td className="p-3 text-center">{m.status === 'COMPLETED' ? 'เสร็จสิ้น' : 'รอจัด'}</td>
                                    <td className="p-3 text-right">฿{(m.budget || 0).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-20 flex justify-end">
                    <div className="text-center w-64 border-t border-gray-400 pt-4">
                        <p>(..........................................................)</p>
                        <p className="mt-2 text-sm">ผู้จัดทำรายงาน</p>
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            {isPreviewOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsPreviewOpen(false)} />
                    <div className="relative bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Eye size={20} /></div>
                                <div>
                                    <h3 className="font-bold text-gray-800">ตัวอย่างรายงาน (Report Preview)</h3>
                                    <p className="text-xs text-gray-500">ตรวจสอบความถูกต้องก่อนสั่งพิมพ์หรือบันทึกเป็น PDF</p>
                                </div>
                            </div>
                            <button onClick={() => setIsPreviewOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-all"><X size={20} /></button>
                        </div>

                        {/* Modal Content (The actual table) */}
                        <div className="flex-1 overflow-y-auto p-8 bg-gray-100">
                            <div className="bg-white shadow-lg mx-auto p-12 w-full max-w-[210mm] min-h-[297mm] text-gray-800 rounded-sm ring-1 ring-gray-200">
                                {/* Report Rendered as in HTML */}
                                <div className="text-center mb-10 border-b-2 border-gray-800 pb-8">
                                    <h1 className="text-3xl font-bold mb-2">รายงานสรุปผลการดำเนินงาน</h1>
                                    <h2 className="text-xl font-medium text-gray-600">สถิติระบบจัดการการประชุม โรงพยาบาลศรีเทพ</h2>
                                    <p className="text-gray-400 mt-4 text-sm font-medium">ออกรายงานเมื่อ: {new Date().toLocaleString('th-TH')}</p>
                                </div>

                                <div className="space-y-10">
                                    <section>
                                        <h4 className="font-bold text-lg mb-4 border-l-4 border-orange-500 pl-3">1. สรุปภาพรวม (System Summary)</h4>
                                        <div className="grid grid-cols-2 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                                            <div className="bg-gray-50 p-4 font-bold text-gray-600">การประชุมทั้งหมด</div>
                                            <div className="bg-white p-4">{totalMeetings} ครั้ง</div>
                                            <div className="bg-gray-50 p-4 font-bold text-gray-600">ผู้ใช้งานในระบบ</div>
                                            <div className="bg-white p-4">{totalUsers} คน</div>
                                            <div className="bg-gray-50 p-4 font-bold text-gray-600">งบประมาณรวม</div>
                                            <div className="bg-white p-4">฿{totalBudget.toLocaleString()}</div>
                                            <div className="bg-gray-50 p-4 font-bold text-gray-600">อัตราการตอบรับ</div>
                                            <div className="bg-white p-4">{acceptedRate}%</div>
                                        </div>
                                    </section>

                                    <section>
                                        <h4 className="font-bold text-lg mb-4 border-l-4 border-orange-500 pl-3">2. ตารางข้อมูลการประชุม (Meeting Inventory)</h4>
                                        <table className="w-full text-sm border-collapse border border-gray-300">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="border border-gray-300 p-2 text-left">หัวข้อ</th>
                                                    <th className="border border-gray-300 p-2 text-center w-32">วันที่</th>
                                                    <th className="border border-gray-300 p-2 text-center w-24">สถานะ</th>
                                                    <th className="border border-gray-300 p-2 text-right w-24">งบประมาณ</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {meetings.map(m => (
                                                    <tr key={m.id} className="hover:bg-gray-50">
                                                        <td className="border border-gray-300 p-2">{m.title}</td>
                                                        <td className="border border-gray-300 p-2 text-center">{m.date}</td>
                                                        <td className="border border-gray-300 p-2 text-center">
                                                            {m.status === 'COMPLETED' ? 'เสร็จสิ้น' : 'รอจัด'}
                                                        </td>
                                                        <td className="border border-gray-300 p-2 text-right">฿{(m.budget || 0).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </section>
                                </div>

                                <div className="mt-32 text-center text-gray-400 text-xs">
                                    <p>— เอกสารนี้พิมพ์จากระบบ Meeting Manager —</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-gray-100 flex gap-3 justify-end bg-white">
                            <button
                                onClick={() => setIsPreviewOpen(false)}
                                className="px-6 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-all font-medium border border-gray-200"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handlePrint}
                                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all font-medium flex items-center gap-2 shadow-lg"
                            >
                                <Printer size={18} /> สั่งพิมพ์ / บันทึกเป็น PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
