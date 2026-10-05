import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { DEMO_STUDENTS, DEMO_TEACHER, DEMO_ADMIN } from '../../data/mockUsers';
import { Compass, GraduationCap, Presentation, School, Globe, ArrowRight, Shield, Award, Sparkles, CheckCircle2 } from 'lucide-react';

export const LandingView: React.FC = () => {
  const {
    loginAsStudent,
    loginAsTeacher,
    loginAsAdmin,
    loginAsGuest,
    t,
  } = useApp();

  const [showRolePicker, setShowRolePicker] = useState<boolean>(false);
  const [showStudentLogin, setShowStudentLogin] = useState<boolean>(false);
  const [selectedClass, setSelectedClass] = useState<string>('2/24');
  const [studentCode, setStudentCode] = useState<string>('HS_2_24_001');
  const [pin, setPin] = useState<string>('1234');
  const [loginError, setLoginError] = useState<string>('');

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = DEMO_STUDENTS.find(s => s.studentCode.trim().toUpperCase() === studentCode.trim().toUpperCase());
    if (found) {
      if (pin === '1234' || pin === found.pinHash) {
        loginAsStudent(found);
      } else {
        setLoginError('Mã PIN chưa chính xác (Mặc định demo: 1234)');
      }
    } else {
      // Demo fallback allow login
      loginAsStudent({
        ...DEMO_STUDENTS[0],
        studentCode,
        className: selectedClass,
        displayName: 'Học sinh ' + selectedClass,
      });
    }
  };

  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 sm:px-6 py-12 overflow-hidden">
      {/* Background Ambience Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-sky-400/20 via-amber-300/20 to-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
        {/* Brand Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-sky-200 shadow-xs text-xs font-black text-sky-800">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>NỀN TẢNG GIÁO DỤC ĐỊA PHƯƠNG SỐ – THÀNH PHỐ ĐÀ NẴNG</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-tight">
            CHẠM ĐÀ NẴNG
          </h1>
          <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-sky-600 via-sky-700 to-amber-600 bg-clip-text text-transparent">
            Hành trình số khám phá quê hương
          </p>
          <p className="text-xs sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Học sinh được "chạm" vào văn hóa, di sản, lịch sử và cảnh sắc Đà Nẵng qua không gian 360°, điểm chạm tương tác đa phương tiện và thu thập con dấu Hộ chiếu số.
          </p>
        </div>

        {/* Hero Visual Card */}
        <div className="relative max-w-2xl mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-white/80 group">
          <img
            src="https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80"
            alt="Đà Nẵng & Hội An Heritage"
            className="w-full h-64 sm:h-80 object-cover group-hover:scale-103 transition duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />
          <div className="absolute bottom-4 left-4 right-4 text-white text-left flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">Trạm tiêu biểu</span>
              <h3 className="text-lg font-black">Di sản văn hóa thế giới Hội An & Biển đảo Đà Nẵng</h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              ★
            </div>
          </div>
        </div>

        {/* Start Journey Primary CTA */}
        {!showRolePicker && (
          <div className="pt-2">
            <button
              onClick={() => setShowRolePicker(true)}
              className="px-10 py-4 rounded-2xl bg-gradient-to-r from-sky-600 to-amber-500 hover:from-sky-700 hover:to-amber-600 text-white font-black text-base sm:text-lg shadow-xl shadow-sky-600/30 transition transform hover:scale-105 active:scale-95 inline-flex items-center gap-3 cursor-pointer"
            >
              <span>{t.startJourney}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Role Selection Grid after clicking Start */}
        {showRolePicker && !showStudentLogin && (
          <div className="pt-4 space-y-4 max-w-xl mx-auto text-left">
            <h3 className="text-center font-black text-base text-slate-900">
              Vui lòng chọn vai trò để bắt đầu hành trình:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setShowStudentLogin(true)}
                className="p-4 rounded-2xl bg-white border-2 border-sky-400 hover:border-sky-600 shadow-md hover:shadow-lg transition text-left space-y-1.5 group"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold group-hover:scale-110 transition">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h4 className="font-black text-sm text-slate-900">HỌC SINH</h4>
                <p className="text-[11px] text-slate-500">Đăng nhập bằng Lớp, Mã HS & PIN 4 số</p>
              </button>

              <button
                onClick={() => loginAsTeacher(DEMO_TEACHER)}
                className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 shadow-sm hover:shadow-md transition text-left space-y-1.5 group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold group-hover:scale-110 transition">
                  <Presentation className="w-5 h-5" />
                </div>
                <h4 className="font-black text-sm text-slate-900">GIÁO VIÊN</h4>
                <p className="text-[11px] text-slate-500">Trình chiếu TV lớp học & xác nhận bài dạy</p>
              </button>

              <button
                onClick={() => loginAsAdmin(DEMO_ADMIN)}
                className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-500 shadow-sm hover:shadow-md transition text-left space-y-1.5 group"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold group-hover:scale-110 transition">
                  <School className="w-5 h-5" />
                </div>
                <h4 className="font-black text-sm text-slate-900">NHÀ TRƯỜNG</h4>
                <p className="text-[11px] text-slate-500">Dashboard điều hành & theo dõi 25 trạm</p>
              </button>

              <button
                onClick={loginAsGuest}
                className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-500 shadow-sm hover:shadow-md transition text-left space-y-1.5 group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold group-hover:scale-110 transition">
                  <Globe className="w-5 h-5" />
                </div>
                <h4 className="font-black text-sm text-slate-900">KHÁCH THAM QUAN</h4>
                <p className="text-[11px] text-slate-500">Khám phá tự do không cần tài khoản</p>
              </button>
            </div>
          </div>
        )}

        {/* Student Minimal Login Form */}
        {showStudentLogin && (
          <div className="max-w-md mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-sky-100 text-left space-y-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full">
                Cổng Học Sinh Tiểu Học
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-2">Đăng Nhập Thám Hiểm</h3>
              <p className="text-xs text-slate-500">Không cần email – Đăng nhập an toàn với Lớp và mã PIN</p>
            </div>

            <form onSubmit={handleStudentSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Lớp của em:</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
                >
                  <option value="2/24">Lớp 2/24 (Khối 2)</option>
                  <option value="2/25">Lớp 2/25 (Khối 2)</option>
                  <option value="1/12">Lớp 1/12 (Khối 1)</option>
                  <option value="3/18">Lớp 3/18 (Khối 3)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mã học sinh:</label>
                <input
                  type="text"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  placeholder="Ví dụ: HS_2_24_001"
                  required
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mã PIN 4 số:</label>
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="****"
                  required
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold text-center tracking-widest text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Mã PIN demo: 1234</span>
              </div>

              {loginError && (
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
                  {loginError}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStudentLogin(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  className="flex-2 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold shadow-md shadow-sky-600/30"
                >
                  Vào Học Ngay
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
