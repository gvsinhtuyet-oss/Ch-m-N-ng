import { AppFullscreenButton } from '../../components/common/AppFullscreen';
import './landing-cover.css';
import {GoogleTeacherLogin} from '../../components/auth/GoogleTeacherLogin';
import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { DEMO_STUDENTS, DEMO_CLASSROOMS } from '../../data/mockUsers';
import { authService, type StaffUser } from '../../services/AuthService';
import { audioService } from '../../services/AudioService';
import { backgroundMusic } from '../../services/BackgroundMusic';
import { progressService } from '../../services/ProgressService';
import { studentSyncService } from '../../services/StudentSyncService';
import { readTheme } from '../../services/ThemeService';
import { DEFAULT_APP_BACKGROUND_DATA_URL } from '../../assets/defaultAppBackground';
import {
  Compass,
  LogIn,
  GraduationCap,
  Presentation,
  Globe,
  ArrowRight,
  Volume2,
  VolumeX,
  Layers,
  CircleHelp,
  Award,
  Play,
  X,
} from 'lucide-react';

export const LandingView: React.FC = () => {
  const {
    loginAsStudent,
    loginAsTeacher,
    enterTeacherDemo,
    enterAdminDemo,
    loginAsAdmin,
    soundEnabled,
    toggleSound,
    t,
  } = useApp();

  const [showRolePicker, setShowRolePicker] = useState<boolean>(false);
  const [chosenGrade, setChosenGrade] = useState<number | null>(null);
  const [guestMode, setGuestMode] = useState(false);
  const [showStudentLogin, setShowStudentLogin] = useState<boolean>(false);
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffBusy, setStaffBusy] = useState(false);
  const [showStaffLogin, setShowStaffLogin] = useState<boolean>(false);
  const [selectedClass, setSelectedClass] = useState<string>('2/24');
  const [studentName, setStudentName] = useState<string>('');
  const [savedStudentId, setSavedStudentId] = useState<string>('');
  const [savedStudentName, setSavedStudentName] = useState<string>('');
  const [savedStudentClass, setSavedStudentClass] = useState<string>('');
  const [savedStudentGrade, setSavedStudentGrade] = useState<number | null>(null);
  const [savedSyncCode, setSavedSyncCode] = useState<string>('');
  const [restoreCode,setRestoreCode] = useState('');
  const [restoreBusy,setRestoreBusy] = useState(false);
  const [loginError, setLoginError] = useState<string>('');
  const [introActive, setIntroActive] = useState(true);
  const [theme, setTheme] = useState(readTheme);
  const [mobileBackground, setMobileBackground] = useState(() => window.matchMedia('(max-width: 1023px) and (orientation: portrait)').matches);
  const introFrameRef = useRef<HTMLIFrameElement | null>(null);

  const STUDENT_PROFILE_KEY = 'cham_danang_student_profile_v1';
  useEffect(()=>{
    const match=/^#student-code=([A-Z0-9-]{12,20})$/i.exec(window.location.hash);
    if(!match)return;
    setRestoreCode(match[1]);setGuestMode(false);setShowRolePicker(true);setShowStudentLogin(true);setIntroActive(false);
    window.history.replaceState(null,'',window.location.pathname+window.location.search);
  },[]);


  useEffect(() => {
    const refresh = () => setTheme(readTheme());
    const refreshStorage = () => setTheme(readTheme(true));
    const query = window.matchMedia('(max-width: 1023px) and (orientation: portrait)');
    const resize = () => setMobileBackground(query.matches);
    window.addEventListener('cham-theme-changed', refresh);
    window.addEventListener('storage', refreshStorage);
    query.addEventListener('change', resize);
    return () => {
      window.removeEventListener('cham-theme-changed', refresh);
      window.removeEventListener('storage', refreshStorage);
      query.removeEventListener('change', resize);
    };
  }, []);

  const coverBackground = (
    mobileBackground
      ? theme.coverMobile || theme.coverDesktop
      : theme.coverDesktop || theme.coverMobile
  ) || (mobileBackground ? '/images/landing/river-mobile.webp' : '/images/landing/river-desktop.webp');

  const roleBackground = (
    mobileBackground
      ? theme.roleMobile || theme.roleDesktop
      : theme.roleDesktop || theme.roleMobile
  ) || coverBackground || DEFAULT_APP_BACKGROUND_DATA_URL;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STUDENT_PROFILE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (typeof saved?.name === 'string') {
        setStudentName(saved.name);
        setSavedStudentName(saved.name);
      }
      if (typeof saved?.className === 'string') {
        setSelectedClass(saved.className);
        setSavedStudentClass(saved.className);
      }
      if (typeof saved?.id === 'string') setSavedStudentId(saved.id);
      if (typeof saved?.syncCode === 'string') setSavedSyncCode(saved.syncCode);
      const storedGrade = Number(saved?.grade);
      const inferredGrade = typeof saved?.className === 'string'
        ? Number(saved.className.split('/')[0])
        : NaN;
      const validGrade = Number.isInteger(storedGrade) && storedGrade >= 1 && storedGrade <= 5
        ? storedGrade
        : inferredGrade;
      if (Number.isInteger(validGrade) && validGrade >= 1 && validGrade <= 5) {
        setSavedStudentGrade(validGrade);
      }
    } catch {
      // Dữ liệu cũ không hợp lệ thì cho học sinh nhập lại.
    }
  }, []);

  useEffect(() => {
    backgroundMusic.setForegroundSource('intro-video', introActive);
    return () => backgroundMusic.setForegroundSource('intro-video', false);
  }, [introActive]);

  useEffect(() => {
    if (!introActive) return;
    const startAudibleIntro = () => {
      try {
        introFrameRef.current?.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: 'unMute', args: [] }),
          '*'
        );
        introFrameRef.current?.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
          '*'
        );
      } catch {}
    };
    window.addEventListener('pointerdown', startAudibleIntro, { once: true });
    window.addEventListener('keydown', startAudibleIntro, { once: true });
    return () => {
      window.removeEventListener('pointerdown', startAudibleIntro);
      window.removeEventListener('keydown', startAudibleIntro);
    };
  }, [introActive]);

  const stopIntroVideo = () => {
    setIntroActive(false);
    try {
      introFrameRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: 'stopVideo', args: [] }),
        '*'
      );
    } catch {
      // Nếu iframe chưa sẵn sàng, việc ẩn iframe vẫn dừng phần phát khi component cập nhật.
    }
  };

  const openRolePicker = () => {
    setLoginError('');
    setShowStudentLogin(false);
    setChosenGrade(null);
    setGuestMode(false);
    setShowStaffLogin(false);
    setShowRolePicker(true);
  };

  const openStaffLogin = () => {
    stopIntroVideo();
    audioService.playSfx('click');
    setShowStudentLogin(false);
    setStaffPassword('');
    setLoginError('');
    setShowStaffLogin(true);
    setShowRolePicker(true);
  };

  const finishStaffLogin = (user: StaffUser) => {
    if (user.role === 'admin') loginAsAdmin(user);
    else loginAsTeacher(user);
    setShowRolePicker(false);
  };

  const handleStartJourney = () => {
    stopIntroVideo();
    audioService.playSfx('click');
    openRolePicker();
  };

  const enterGuestJourney = (grade: number) => {
    setChosenGrade(grade);
    setLoginError('');
    audioService.playSfx('click');

    window.setTimeout(() => {
      const normalizedName = 'Nhà phiêu lưu tự do';
      let guestId = '';
      try {
        guestId = localStorage.getItem('cham_danang_guest_id_v1') || '';
      } catch {}

      const id =
        guestId ||
        `guest-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

      const student = {
        ...DEMO_STUDENTS[0],
        id,
        studentCode: id,
        isGuest: true,
        classId: 'guest',
        className: 'Khách trải nghiệm',
        grade,
        displayName: normalizedName,
        name: normalizedName,
        pinHash: undefined,
      };

      try {
        localStorage.setItem('cham_danang_guest_id_v1', id);
        localStorage.setItem('cham_danang_guest_grade_v1', String(grade));
      } catch {}

      try {
        if (authService.current()) {
          authService.logout().catch(() => {});
        }
        loginAsStudent(student);
      } catch (error) {
        setLoginError((error as Error).message);
      }
    }, 320);
  };


  return (
    <div className="landing-art-shell text-white select-none">
      <div className="landing-art-scene">
      {/* Nền trang bìa do Quản trị cài riêng. */}
      <img
        src={coverBackground}
        alt=""
        aria-hidden="true"
        className="landing-cover-background absolute inset-0 h-full w-full object-cover"
        style={{ filter: 'blur(' + theme.blur + 'px)' }}
      />
      <div className="absolute inset-0 bg-white pointer-events-none" style={{ opacity: theme.lightness }} />
      <div className="landing-cover-shade absolute inset-0 pointer-events-none" />
      <div className="absolute inset-0 bg-radial from-transparent via-transparent to-slate-950/15 pointer-events-none" />

      {/* Top Bar on Cover Page */}
      <header className="relative z-20 w-full max-w-[1600px] mx-auto px-3 sm:px-6 pt-1 sm:pt-2 pb-1 flex items-center justify-between gap-2">
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
        <div className="landing-top-actions flex items-center gap-2.5">
          <a href="https://vr360.com.vn/projects/danang-virtual-tourists/" target="_blank" rel="noopener noreferrer" title="Khám phá Đà Nẵng 360°" aria-label="Khám phá Đà Nẵng 360 độ" className="landing-cover-vr">
            <Globe aria-hidden="true" className="h-5 w-5"/><span>360°</span>
          </a>
          <button
            onClick={toggleSound}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-semibold border border-white/15 transition flex items-center gap-1.5"
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-300" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Âm thanh' : 'Tắt tiếng'}</span>
          </button>

          <button type="button" onClick={openStaffLogin} className="landing-staff-login min-h-10 rounded-xl border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/25 flex items-center gap-1.5">
            <LogIn aria-hidden="true" className="h-4 w-4 text-amber-300" />
            <span>Đăng nhập</span>
          </button>
          <AppFullscreenButton iconOnly className="flex min-h-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/15 px-2.5 text-white hover:bg-white/25" />
        </div>
      </header>

      {/* Compact cinematic cover: app identity → intro video → explore */}
      <main data-intro-active={introActive} className="landing-cover-main relative z-20 w-full min-h-0 flex-1 mx-auto text-center">
        <div className="landing-cover-identity">
          <h1 className="landing-cover-title">
            <span>CHẠM</span><span>ĐÀ NẴNG</span>
          </h1>
          <p className="text-xs sm:text-lg xl:text-2xl font-extrabold text-white tracking-tight drop-shadow-md">
            Hành trình số khám phá quê hương
          </p>
        </div>

        {/* Video giới thiệu giữ nguyên nguồn gốc và tự phát khi trình duyệt cho phép. */}
        {introActive && (
          <div className="landing-cover-video relative min-w-0">
            <div className="absolute -inset-1 rounded-[22px] sm:rounded-[26px] bg-gradient-to-r from-sky-500/35 via-white/10 to-amber-400/35 blur-lg pointer-events-none" />
            <div className="landing-cover-player relative overflow-hidden rounded-2xl sm:rounded-3xl border-[3px] border-white/80 bg-black shadow-2xl shadow-slate-950/60">
              <iframe
                ref={introFrameRef}
                className="absolute inset-0 h-full w-full"
                src="https://www.youtube-nocookie.com/embed/Ud2uUxz9Lw4?autoplay=1&mute=1&playsinline=1&rel=0&controls=1&enablejsapi=1"
                title="Video giới thiệu CHẠM ĐÀ NẴNG"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />

            </div>
          </div>
        )}

        <div className="landing-cover-actions">
          <p className="landing-action-invitation">Mỗi điểm đến,<br /><strong>một điều kỳ diệu</strong></p>
          <button onClick={handleStartJourney} className="group flex items-center gap-2 rounded-[22px] border-b-[6px] border-amber-700 bg-gradient-to-b from-yellow-200 via-amber-400 to-orange-500 px-5 py-2 sm:px-8 sm:py-3 text-sm sm:text-lg font-black text-slate-950 shadow-[0_8px_25px_rgba(0,0,0,.35)] transition hover:scale-105 active:translate-y-1 active:border-b-2">
            <Compass className="h-6 w-6 text-blue-900 group-hover:rotate-45 transition-transform"/> CHẠM ĐỂ KHÁM PHÁ <ArrowRight className="h-5 w-5"/>
          </button>
          <div className="landing-feature-pills">
            <span><Layers aria-hidden="true" />5 khối tiểu học</span>
            <span><Globe aria-hidden="true" />VR360°</span>
            <span><CircleHelp aria-hidden="true" />Quiz</span>
            <span><Award aria-hidden="true" />Hộ chiếu số</span>
          </div>
        </div>

      </main>

      <footer className="landing-review-footer relative z-20">
        <span>Tài liệu giáo dục địa phương TP Đà Nẵng</span>

        <span>Người phát triển: <strong>TRƯƠNG SINH TUYẾT</strong></span>
      </footer>

      </div>

      {/* Role Picker Modal */}
      {showRolePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
          <img
            src={roleBackground}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: 'blur(' + theme.blur + 'px)', transform: 'scale(1.025)' }}
          />
          <div className="absolute inset-0 bg-white pointer-events-none" style={{ opacity: theme.lightness }} />
          <div className="absolute inset-0 bg-slate-950/38 backdrop-blur-[2px] pointer-events-none" />
          <div role="dialog" aria-modal="true" aria-label={showStaffLogin ? "Đăng nhập quản trị và giáo viên" : "Chọn vai trò và đăng nhập"} className={`relative z-10 w-full max-h-[94dvh] overflow-y-auto rounded-[22px] border border-white/30 p-3 text-slate-800 shadow-[0_28px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-5 space-y-3 ${showStaffLogin || showStudentLogin ? 'max-w-[460px] bg-[#fffdf9]/95' : 'max-w-[780px] bg-gradient-to-br from-[#102b45]/95 via-[#123a53]/95 to-[#064e52]/95'}`}>
            <div className="flex items-center justify-between">
              <div>
                <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-widest ${!showStudentLogin && !showStaffLogin ? 'bg-amber-300/15 text-amber-200 ring-1 ring-amber-200/25' : 'bg-sky-100 text-sky-800'}`}>
                  CHẠM ĐÀ NẴNG
                </span>
                <h3 className={`mt-1.5 font-black tracking-tight ${!showStudentLogin && !showStaffLogin ? 'text-lg sm:text-2xl text-white' : 'text-xl text-slate-900'}`}>{showStaffLogin ? 'Đăng nhập quản trị và giáo viên' : showStudentLogin ? 'Chào Nhà phiêu lưu!' : 'Bạn muốn bắt đầu hành trình nào?'}</h3>
                {!showStudentLogin && !showStaffLogin && <p className="mt-2 text-sm text-sky-100/85">Mỗi hành trình là một cách chạm vào di sản quê hương</p>}
              </div>
              <button
                onClick={() => {
                  setShowRolePicker(false);
                  setIntroActive(true);
                  setShowStudentLogin(false);
                  setShowStaffLogin(false);
                  setStaffPassword('');
                  setLoginError('');
                }}
                aria-label="Đóng khung đăng nhập" className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center transition ${!showStudentLogin && !showStaffLogin ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!showStudentLogin && !showStaffLogin ? (
              <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-0">
                {[
                  {id:'student',name:'HỌC SINH',demo:'Khám phá tự do dành cho học sinh',Icon:Compass,color:'bg-orange-600',description:'Nhà thám hiểm nhí · Khám phá di sản, tích lũy dấu ấn.'},
                  {id:'teacher',name:'GIÁO VIÊN / QUẢN TRỊ',demo:'Khám phá tự do dành cho giáo viên',Icon:Presentation,color:'bg-emerald-700',description:'Một cửa đăng nhập cho giáo viên và quản trị.'},
                ].map(({id,name,demo,Icon,color,description})=><section key={id} className={`group relative flex flex-col overflow-hidden rounded-[16px] border bg-white shadow-[0_12px_35px_rgba(0,0,0,0.16)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_rgba(0,0,0,0.28)] motion-reduce:transform-none ${id==='student' ? 'border-orange-200 hover:border-orange-400' : 'border-emerald-200 hover:border-emerald-400'}`}>
                  <div className={`relative flex h-[90px] sm:h-[112px] items-end overflow-hidden p-2 sm:p-3 ${id==='student' ? 'bg-gradient-to-br from-orange-500 via-amber-400 to-sky-500' : 'bg-gradient-to-br from-emerald-800 via-teal-500 to-sky-400'}`}>
                    <div className="absolute inset-0 opacity-30" style={{backgroundImage:'radial-gradient(circle at 80% 15%, white 0%, transparent 42%), repeating-linear-gradient(125deg, transparent 0px, transparent 24px, rgba(255,255,255,.22) 25px, transparent 26px)'}} />
                    <div className="hidden sm:block absolute right-3 top-2 rounded-full border border-white/40 bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-md">{id==='student' ? 'Hành trình khám phá' : 'Không gian sáng tạo'}</div>
                    <div className="relative flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                      <div className="flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border border-white/60 bg-white/20 text-white shadow-xl backdrop-blur-md transition-transform duration-300 group-hover:rotate-[-5deg] group-hover:scale-110"><Icon className="h-6 w-6 sm:h-7 sm:w-7" /></div>
                      <div className="text-white"><div className="text-[12px] sm:text-lg font-black tracking-wide drop-shadow-md">{name}</div><div className="text-xs font-medium opacity-90">CHẠM ĐÀ NẴNG</div></div>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5 bg-gradient-to-b from-white to-slate-50 p-2 sm:p-3">
                    <p className="hidden sm:block min-h-[30px] text-xs leading-snug text-slate-600">{description}</p>
                    <button type="button" onClick={()=>{
                      if (id !== 'student') { openStaffLogin(); return; }
                      audioService.playSfx('click');setLoginError('');
                      setGuestMode(false);setChosenGrade(null);setShowStudentLogin(true);
                    }} className={`min-h-10 rounded-lg ${color} px-1 sm:px-3 text-[11px] sm:text-sm font-black text-white shadow-md transition hover:brightness-110 active:scale-[.99]`}>Đăng nhập <span aria-hidden="true">→</span></button>
                    <button type="button" disabled={staffBusy} onClick={async()=>{
                      setLoginError('');
                      if(id==='student'){setGuestMode(true);setChosenGrade(null);setShowStudentLogin(true);return;}
                      setStaffBusy(true);
                      try{await enterTeacherDemo();setShowRolePicker(false);}
                      catch(error){setLoginError((error as Error).message);}finally{setStaffBusy(false);}
                    }} aria-label={demo} className={`min-h-10 rounded-lg border px-1 sm:px-3 text-[11px] sm:text-sm font-bold transition hover:bg-slate-100 disabled:opacity-50 ${id==='student' ? 'border-orange-200 text-orange-700' : 'border-emerald-200 text-emerald-700'}`}>Khám phá tự do</button>
                    {id==='teacher' && <button type="button" disabled={staffBusy} aria-label="Khám phá tự do dành cho quản trị" onClick={async()=>{
                      setLoginError('');
                      setStaffBusy(true);
                      try { await enterAdminDemo(); setShowRolePicker(false); }
                      catch(error) { setLoginError((error as Error).message); }
                      finally { setStaffBusy(false); }
                    }} className="min-h-10 rounded-lg border border-indigo-200 bg-indigo-50 px-2 py-2 text-xs font-bold text-indigo-900 transition hover:bg-indigo-100 disabled:opacity-50">
                      Xem thử Quản trị (Demo)
                    </button>}
                  </div>
                </section>)}
                {loginError && <p role="alert" className="md:col-span-2 rounded-xl bg-rose-50 p-3 text-rose-700">{loginError}</p>}
              </div>
            ) : showStudentLogin ? (
              /* Student Login Form: chọn khối và nhập thông tin ngay trên cùng một màn hình */
              <form onSubmit={event=>event.preventDefault()} className="space-y-4 text-xs">
                <div>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900">
                      {guestMode ? 'Khám phá tự do · Chọn khối lớp' : 'Vào học bằng mã của em'}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowStudentLogin(false)}
                      className="text-xs font-bold text-slate-500 hover:text-sky-700"
                    >
                      ← Chọn vai trò khác
                    </button>
                  </div>

                  {guestMode && <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-3 max-sm:[&>button:last-child]:col-span-2 max-sm:[&>button:last-child]:w-[calc((100%-0.75rem)/2)] max-sm:[&>button:last-child]:justify-self-center" aria-label="Chọn một trong năm khối lớp">
                    {[
                      'from-sky-500 to-blue-700', 'from-emerald-500 to-teal-700',
                      'from-amber-400 to-orange-600', 'from-rose-500 to-pink-700', 'from-violet-500 to-indigo-700',
                    ].map((color, index) => {
                      const grade = index + 1;
                      const active = chosenGrade === grade;
                      return (
                        <button
                          key={grade}
                          type="button"
                          onClick={() => {
                            if (guestMode) {
                              enterGuestJourney(grade);
                              return;
                            }
                            setChosenGrade(grade);
                            setLoginError('');
                            if (Number(selectedClass.split('/')[0]) !== grade) {
                              const classroom = DEMO_CLASSROOMS.find(item => item.grade === grade);
                              setSelectedClass(classroom?.name.replace('Lớp ', '') || `${grade}/1`);
                            }
                          }}
                          className={`min-w-0 min-h-[68px] last:col-span-2 sm:last:col-span-1 rounded-2xl bg-gradient-to-br ${color} px-2 py-3 sm:px-2 sm:py-3 text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl focus-visible:ring-4 focus-visible:ring-sky-300 ${
                            active
                              ? 'ring-2 ring-orange-300 ring-offset-2 shadow-md z-10'
                              : guestMode && chosenGrade
                                ? 'scale-[0.86] opacity-45'
                                : ''
                          }`}
                        >
                          <GraduationCap className="mx-auto mb-1 h-4 w-4" />
                          <span className="block whitespace-nowrap text-sm sm:text-lg font-black">Khối {grade}</span>
                          <span className="hidden text-[9px] text-white/90 sm:block">
                            {active
                              ? (guestMode ? 'Đang vào hành trình…' : 'Đã chọn ✓')
                              : (guestMode ? 'Chạm để vào học' : 'Chạm để chọn')}
                          </span>
                        </button>
                      );
                    })}
                  </div>}
                </div>

                {!guestMode && <details open className="rounded-xl border border-sky-100 bg-sky-50 p-3 text-slate-800">
                  <summary className="cursor-pointer font-bold">Mã học sinh do giáo viên cấp</summary>
                  <label className="block mt-3">Mã học sinh hoặc mã đồng bộ cũ<input type="password" autoComplete="off" value={restoreCode} onChange={e=>setRestoreCode(e.target.value)} maxLength={20} className="block w-full mt-1 border rounded-xl p-3 bg-white" /></label>
                  <p className="text-xs my-2">Nhập mã cô/thầy cấp hoặc mã hành trình cũ. Hệ thống tự xác định tên, khối và lớp; không cần mật khẩu. Mã đã được cấp lại không còn hiệu lực.</p>
                  <button type="button" disabled={restoreBusy || !restoreCode.trim()} onClick={async()=>{
                    if(restoreBusy)return;setRestoreBusy(true);setLoginError('');
                    try{
                      const restored=await studentSyncService.restore(restoreCode);
                      if(authService.current())await authService.logout();
                      const profile=restored.profile;
                      const syncCode=restoreCode.toUpperCase().replace(/[^A-Z0-9]/g,'');
                      localStorage.setItem(STUDENT_PROFILE_KEY,JSON.stringify({...profile,syncCode}));
                      progressService.mergeStudentProgressRecords(profile.id,restored.progress);
                      loginAsStudent({...DEMO_STUDENTS[0],...profile,studentCode:profile.id,displayName:profile.name,classId:`class-${profile.className.replace('/','-')}`,isGuest:false});
                      setRestoreCode('');setShowRolePicker(false);
                    }catch(error){setLoginError((error as Error).message);}finally{setRestoreBusy(false);}
                  }} className="rounded-xl bg-sky-700 text-white px-4 py-2 font-bold disabled:opacity-50">{restoreBusy?'Đang mở hồ sơ…':'Vào học bằng mã'}</button>
                  {loginError && <p role="alert" className="mt-2 text-rose-700">{loginError}</p>}
                </details>}

                {!guestMode && <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900 font-semibold">
                   Chưa có mã? Nhờ cô/thầy tạo hồ sơ ở mục “Lớp của tôi” và cấp thẻ mã hoặc QR. Em không cần tự nhập tên hay lớp, tránh hồ sơ trùng.
                 </div>}
                 {!guestMode && savedSyncCode && <button type="button"
                   onClick={()=>{setRestoreCode(savedSyncCode);setLoginError('');}}
                   className="w-full rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900 font-bold">
                   Dùng mã đã lưu trên thiết bị này
                 </button>}
                 {!guestMode && <button type="button" onClick={()=>{setGuestMode(true);setChosenGrade(null);setLoginError('');}} className="h-9 w-full rounded-xl border border-orange-200 text-xs font-bold text-orange-700 hover:bg-orange-50">Khám phá tự do</button>}
              </form>
            ) : (
              <form className="space-y-4 text-sm" onSubmit={async e => {
                e.preventDefault(); if(staffBusy) return; setStaffBusy(true); setLoginError('');
                try {
                  const user = await authService.login(staffEmail,staffPassword);
                  setStaffPassword('');
                  finishStaffLogin(user);
                } catch(error) { setLoginError((error as Error).message); }
                finally { setStaffBusy(false); }
              }}>
                <p className="text-slate-600">Dùng email và mật khẩu đã được cấp. Hệ thống sẽ mở trang theo quyền của tài khoản.</p>
                <button type="button" disabled={staffBusy} onClick={async()=>{if(staffBusy)return;setStaffBusy(true);setLoginError('');try{const user=await authService.restore();if(user)finishStaffLogin(user);else setLoginError('Phiên đăng nhập đã hết hạn. Hãy đăng nhập bằng Google hoặc mật khẩu.');}catch(e){setLoginError((e as Error).message);}finally{setStaffBusy(false);}}} className="w-full min-h-11 rounded-xl border border-sky-200 bg-sky-50 p-3 font-bold text-sky-800 disabled:opacity-50">Tiếp tục phiên đăng nhập trên máy này</button>
                <label className="block font-bold">Email
                  <input type="email" autoComplete="username" required maxLength={254} value={staffEmail} onChange={e=>setStaffEmail(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100" />
                </label>
                <label className="block font-bold">Mật khẩu
                  <input type="password" autoComplete="current-password" required maxLength={128} value={staffPassword} onChange={e=>setStaffPassword(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100" />
                </label>
                {loginError && <p role="alert" className="p-3 rounded-xl bg-rose-50 text-rose-700">{loginError}</p>}
                <p className="text-xs text-slate-500">Quên mật khẩu? Liên hệ quản trị nhà trường để được đặt lại.</p>
                <button type="submit" disabled={staffBusy} className="h-11 w-full rounded-xl bg-emerald-700 text-sm font-bold text-white shadow-sm hover:bg-emerald-800 disabled:opacity-50">{staffBusy ? 'Đang đăng nhập…' : 'Đăng nhập'}</button>
                <GoogleTeacherLogin onLogin={finishStaffLogin} />
                <button type="button" disabled={staffBusy} onClick={()=>{setShowStaffLogin(false);setStaffPassword('');setLoginError('');}} className="block w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800">← Chọn vai trò khác</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default LandingView;

