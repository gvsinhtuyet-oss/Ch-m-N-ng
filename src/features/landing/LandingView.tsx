import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { DEMO_STUDENTS, DEMO_TEACHER } from '../../data/mockUsers';
import { audioService } from '../../services/AudioService';
import {
  Compass,
  GraduationCap,
  Presentation,
  Globe,
  ArrowRight,
  Sparkles,
  Volume2,
  VolumeX,
  Layers,
  Award,
  CheckCircle2,
  BookOpen,
  Info,
  X,
} from 'lucide-react';

export const LandingView: React.FC = () => {
  const {
    loginAsStudent,
    loginAsTeacher,
    setCurrentView,
    soundEnabled,
    toggleSound,
    t,
  } = useApp();

  const [showRolePicker, setShowRolePicker] = useState<boolean>(false);
  const [showStudentLogin, setShowStudentLogin] = useState<boolean>(false);
  const [selectedClass, setSelectedClass] = useState<string>('2/24');
  const [studentCode, setStudentCode] = useState<string>('HS_2_24_001');
  const [pin, setPin] = useState<string>('1234');
  const [loginError, setLoginError] = useState<string>('');

  const handleStartJourney = () => {
    audioService.playSfx('click');
    // Default student entry directly into journey
    setCurrentView('student-journey');
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    audioService.playSfx('click');
    const found = DEMO_STUDENTS.find(
      s => s.studentCode.trim().toUpperCase() === studentCode.trim().toUpperCase()
    );
    if (found) {
      if (pin === '1234' || pin === found.pinHash) {
        loginAsStudent(found);
      } else {
        setLoginError('Mã PIN chưa chính xác (Mặc định demo: 1234)');
      }
    } else {
      loginAsStudent({
        ...DEMO_STUDENTS[0],
        studentCode,
        className: selectedClass,
        displayName: 'Học sinh ' + selectedClass,
      });
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden bg-slate-950 text-white select-none">
      {/* Fullscreen Hero Background Image of Da Nang (Dragon Bridge & Han River skyline) */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 ease-out scale-102"
        style={{
          backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Dragon_Bridge%2C_Da_Nang_during_day_-_20230819_%28cropped%29.jpg/1920px-Dragon_Bridge%2C_Da_Nang_during_day_-_20230819_%28cropped%29.jpg')`,
        }}
      />

      {/* Balanced elegant overlay: preserves photo vibrance while making text clear */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/50 to-slate-950/90 pointer-events-none" />
      <div className="absolute inset-0 bg-radial from-transparent via-slate-950/20 to-slate-950/70 pointer-events-none" />

      {/* Top Bar on Cover Page */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-3 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-amber-400 p-0.5 shadow-lg shadow-sky-500/20">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
              <Compass className="w-6 h-6 text-amber-400 animate-spin-slow" />
            </div>
          </div>
          <div>
            <div className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
              <span>CHẠM ĐÀ NẴNG</span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 border border-amber-400/40 text-amber-300">
                GDĐP Tiểu học
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium hidden sm:block">
              Trường Tiểu học Trần Đại Nghĩa • TP Đà Nẵng
            </p>
          </div>
        </div>

        {/* Top actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleSound}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-semibold border border-white/15 transition flex items-center gap-1.5"
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-300" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Âm thanh' : 'Tắt tiếng'}</span>
          </button>

          <button
            onClick={() => {
              audioService.playSfx('click');
              setShowRolePicker(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white text-xs font-bold border border-white/20 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Presentation className="w-3.5 h-3.5 text-amber-300" />
            <span>Đổi vai trò</span>
          </button>
        </div>
      </header>

      {/* Main Center Hero Cover Content */}
      <main className="relative z-20 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col items-center text-center my-auto space-y-6 sm:space-y-8">
        {/* Subtle pill badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-amber-400/30 shadow-lg text-xs font-extrabold text-amber-300 tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>HÀNH TRÌNH HỌC TẬP SỐ THÀNH PHỐ ĐÀ NẴNG</span>
        </div>

        {/* Prominent App Title & Subtitle */}
        <div className="space-y-2 sm:space-y-3">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white drop-shadow-xl leading-none">
            CHẠM ĐÀ NẴNG
          </h1>
          <p className="text-xl sm:text-3xl font-extrabold text-amber-300 tracking-tight drop-shadow-md">
            Hành trình số khám phá quê hương
          </p>
        </div>

        {/* Brief Introduction */}
        <p className="text-sm sm:text-base md:text-lg text-slate-100 max-w-2xl mx-auto leading-relaxed drop-shadow font-medium">
          “Ứng dụng giúp học sinh tiểu học khám phá quê hương Đà Nẵng qua các hành trình học tập số, kết hợp hình ảnh, thuyết minh, trải nghiệm tương tác và nhiệm vụ học tập phù hợp với từng khối lớp.”
        </p>

        {/* 4 Characteristic Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 w-full max-w-3xl pt-1">
          <div className="p-3 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/10 text-center space-y-1">
            <div className="w-7 h-7 mx-auto rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div className="text-xs font-black text-white">5 Khối Lớp</div>
            <div className="text-[10px] text-slate-300 font-medium">25 trạm học tập</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/10 text-center space-y-1">
            <div className="w-7 h-7 mx-auto rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
              <Globe className="w-4 h-4" />
            </div>
            <div className="text-xs font-black text-white">VR360° Di Sản</div>
            <div className="text-[10px] text-slate-300 font-medium">Không gian tương tác</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/10 text-center space-y-1">
            <div className="w-7 h-7 mx-auto rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
            <div className="text-xs font-black text-white">Hộ Chiếu Số</div>
            <div className="text-[10px] text-slate-300 font-medium">Bộ sưu tập 25 tem</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/10 text-center space-y-1">
            <div className="w-7 h-7 mx-auto rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="text-xs font-black text-white">Đa Phương Tiện</div>
            <div className="text-[10px] text-slate-300 font-medium">Audio thuyết minh & Quiz</div>
          </div>
        </div>

        {/* Primary Action Button (BẮT ĐẦU HÀNH TRÌNH) */}
        <div className="pt-2 flex flex-col items-center gap-3">
          <button
            onClick={handleStartJourney}
            className="group px-9 sm:px-12 py-4 sm:py-4.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-black text-base sm:text-lg shadow-2xl shadow-amber-400/40 transition-all duration-200 transform hover:scale-105 active:scale-95 inline-flex items-center gap-3 cursor-pointer"
          >
            <Compass className="w-5 h-5 text-slate-950 group-hover:rotate-45 transition duration-300" />
            <span>BẮT ĐẦU HÀNH TRÌNH</span>
            <ArrowRight className="w-5 h-5 text-slate-950 group-hover:translate-x-1 transition duration-200" />
          </button>

          {/* Secondary Quick Access Links */}
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-300">
            <button
              onClick={() => {
                audioService.playSfx('click');
                setShowRolePicker(true);
              }}
              className="hover:text-amber-300 transition underline underline-offset-4 decoration-white/30"
            >
              Dành cho Giáo viên
            </button>
          </div>
        </div>

        {/* Safe, dignified note regarding curriculum and draft materials */}
        <div className="max-w-2xl mx-auto p-3.5 sm:p-4 rounded-2xl bg-slate-950/60 backdrop-blur-md border border-white/10 text-left flex items-start gap-2.5 shadow-md">
          <Info className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
          <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed font-normal">
            “Nội dung học tập đang được xây dựng và cập nhật theo định hướng chương trình Giáo dục địa phương và nguồn tư liệu đã kiểm chứng. Một số học liệu hiện đang ở giai đoạn hoàn thiện theo tài liệu dự thảo.”
          </p>
        </div>
      </main>

      {/* Dignified Unit and Authors Credits Footer */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-white/10 text-xs text-slate-300/90 font-medium">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="font-semibold text-white">Trường Tiểu học Trần Đại Nghĩa</span>
        </div>
        <div className="text-[11px] sm:text-xs text-slate-400">
          Chương trình Giáo dục địa phương TP Đà Nẵng
        </div>
        <div className="text-[11px] sm:text-xs">
          <span>Thiết kế: </span>
          <span className="font-bold text-amber-300">Trương Sinh Tuyết – Nguyễn Thị Thanh</span>
        </div>
      </footer>

      {/* Role Picker Modal */}
      {showRolePicker && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-sky-100 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[11px] font-bold">
                  Phân quyền ứng dụng
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">Chọn Vai Trò Trải Nghiệm</h3>
              </div>
              <button
                onClick={() => setShowRolePicker(false)}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!showStudentLogin ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  onClick={() => {
                    audioService.playSfx('click');
                    setShowStudentLogin(true);
                  }}
                  className="p-4 rounded-2xl bg-white border-2 border-sky-400 hover:border-sky-600 shadow-sm hover:shadow-md transition text-left space-y-1.5 group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold group-hover:scale-110 transition">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h4 className="font-black text-sm text-slate-900">HỌC SINH</h4>
                  <p className="text-[11px] text-slate-500">Đăng nhập Lớp, Mã HS & PIN 4 số</p>
                </button>

                <button
                  onClick={() => {
                    audioService.playSfx('click');
                    setShowRolePicker(false);
                    loginAsTeacher(DEMO_TEACHER);
                  }}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 shadow-sm hover:shadow-md transition text-left space-y-1.5 group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold group-hover:scale-110 transition">
                    <Presentation className="w-5 h-5" />
                  </div>
                  <h4 className="font-black text-sm text-slate-900">GIÁO VIÊN</h4>
                  <p className="text-[11px] text-slate-500">Trình chiếu TV lớp học & xác nhận bài dạy</p>
                </button>

              </div>
            ) : (
              /* Student Login Form */
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
                    className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                  >
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    className="flex-2 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold shadow-md shadow-sky-600/30 transition"
                  >
                    Vào Học Ngay
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default LandingView;
