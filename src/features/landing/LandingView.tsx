import {GoogleTeacherLogin} from '../../components/auth/GoogleTeacherLogin';
import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { DEMO_STUDENTS, DEMO_CLASSROOMS } from '../../data/mockUsers';
import { authService } from '../../services/AuthService';
import { audioService } from '../../services/AudioService';
import { backgroundMusic } from '../../services/BackgroundMusic';
import { progressService } from '../../services/ProgressService';
import { studentSyncService } from '../../services/StudentSyncService';
import { readTheme } from '../../services/ThemeService';
import { DEFAULT_APP_BACKGROUND_DATA_URL } from '../../assets/defaultAppBackground';
import {
  Compass,
  Settings,
  GraduationCap,
  Presentation,
  Globe,
  ArrowRight,
  Volume2,
  VolumeX,
  Layers,
  Award,
  BookOpen,
  Play,
  X,
} from 'lucide-react';

export const LandingView: React.FC = () => {
  const {
    loginAsStudent,
    loginAsTeacher,
    enterTeacherDemo,
    loginAsAdmin,
    soundEnabled,
    toggleSound,
    t,
  } = useApp();

  const [showRolePicker, setShowRolePicker] = useState<boolean>(false);
  const [chosenGrade, setChosenGrade] = useState<number | null>(null);
  const [guestMode, setGuestMode] = useState(false);
  const [showStudentLogin, setShowStudentLogin] = useState<boolean>(false);
  const [adminLogin, setAdminLogin] = useState(false);
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffBusy, setStaffBusy] = useState(false);
  const [showTeacherLogin, setShowTeacherLogin] = useState<boolean>(false);
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
  const [mobileBackground, setMobileBackground] = useState(() => window.matchMedia('(max-width: 767px)').matches);
  const introFrameRef = useRef<HTMLIFrameElement | null>(null);

  const STUDENT_PROFILE_KEY = 'cham_danang_student_profile_v1';

  useEffect(() => {
    const refresh = () => setTheme(readTheme());
    const refreshStorage = () => setTheme(readTheme(true));
    const query = window.matchMedia('(max-width: 767px)');
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
  ) || DEFAULT_APP_BACKGROUND_DATA_URL;

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
    setShowTeacherLogin(false);
    setAdminLogin(false);
    setShowRolePicker(true);
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

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    audioService.playSfx('click');
    setLoginError('');

    const normalizedName = guestMode ? 'Nhà phiêu lưu tự do' : studentName.trim().replace(/\s+/g,' ').normalize('NFC');
    if (!normalizedName || !chosenGrade) {
      setLoginError('Vui lòng chọn khối và nhập họ tên.');
      return;
    }
    if (!guestMode && !new RegExp(`^${chosenGrade}/[1-9][0-9]{0,2}$`).test(selectedClass)) {
      setLoginError(`Vui lòng chọn lớp thuộc Khối ${chosenGrade}.`);
      return;
    }
    let guestId = '';
    if (guestMode) { try { guestId = localStorage.getItem('cham_danang_guest_id_v1') || ''; } catch {} }

    const isSameSavedStudent =
      !guestMode &&
      !!savedStudentId &&
      savedStudentName.trim().replace(/\s+/g,' ').normalize('NFC').toLocaleLowerCase('vi-VN') === normalizedName.toLocaleLowerCase('vi-VN') &&
      savedStudentClass === selectedClass &&
      (savedStudentGrade === null || savedStudentGrade === chosenGrade);

    const id = (guestMode ? guestId : (isSameSavedStudent ? savedStudentId : '')) ||
      `${guestMode ? 'guest' : 'local-student'}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

    const student = {
      ...DEMO_STUDENTS[0],
      id,
      studentCode: id,
      isGuest: guestMode,
      classId: guestMode ? 'guest' : `class-${selectedClass.replace('/', '-')}`,
      className: guestMode ? 'Khách trải nghiệm' : selectedClass,
      grade: chosenGrade,
      displayName: normalizedName,
      name: normalizedName,
      pinHash: undefined,
    };

    try {
      if (guestMode) {
        localStorage.setItem('cham_danang_guest_id_v1', id);
        localStorage.setItem('cham_danang_guest_grade_v1', String(chosenGrade));
      } else {
        let syncCode = isSameSavedStudent ? savedSyncCode : '';
        if (!syncCode) {
          try {
            const registered = await studentSyncService.register({
              id,
              name: normalizedName,
              className: selectedClass,
              grade: chosenGrade,
            });
            syncCode = registered.syncCode;
          } catch {
            // Máy chủ đồng bộ có thể chưa sẵn sàng; vẫn cho phép học và lưu cục bộ.
          }
        }
        localStorage.setItem(
          STUDENT_PROFILE_KEY,
          JSON.stringify({ id, name: normalizedName, className: selectedClass, grade: chosenGrade, syncCode })
        );
        setSavedStudentId(id);
        setSavedStudentName(normalizedName);
        setSavedStudentClass(selectedClass);
        setSavedStudentGrade(chosenGrade);
        setSavedSyncCode(syncCode);
      }
    } catch {
      // Nếu không lưu được cục bộ, vẫn cho phép vào học.
    }

    try {
      if (authService.current()) await authService.logout();
      loginAsStudent(student);
    } catch (error) { setLoginError((error as Error).message); }
  };

  return (
    <div className="relative h-[100dvh] w-full flex flex-col justify-between overflow-hidden bg-sky-800 text-white select-none">
      {/* Nền trang bìa do Quản trị cài riêng. */}
      <img
        src={coverBackground}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ filter: 'blur(' + theme.blur + 'px)', transform: 'scale(1.025)' }}
      />
      <div className="absolute inset-0 bg-white pointer-events-none" style={{ opacity: theme.lightness }} />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/65 via-slate-950/28 to-slate-950/72 pointer-events-none" />
      <div className="absolute inset-0 bg-radial from-transparent via-slate-950/10 to-slate-950/45 pointer-events-none" />

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
              stopIntroVideo();
              audioService.playSfx('click');
              openRolePicker();
            }}
            className="px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white text-xs font-bold border border-white/20 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Presentation className="w-3.5 h-3.5 text-amber-300" />
            <span>Đổi vai trò</span>
          </button>
        </div>
      </header>

      {/* Compact cinematic cover: app identity → intro video → explore */}
      <main className="relative z-20 w-full max-w-[1500px] min-h-0 flex-1 mx-auto px-3 sm:px-6 py-1 flex flex-col lg:flex-row-reverse items-center justify-center gap-2 lg:gap-6 text-center overflow-hidden">
        <div className="flex flex-col items-center justify-center gap-0.5 lg:w-[48%] shrink-0">
          <h1 className="text-[clamp(1.45rem,4vw,3.6rem)] font-black tracking-tight text-amber-300 leading-tight [text-shadow:3px_4px_0_#07549c,5px_7px_8px_rgba(0,0,0,.65)]">
            CHẠM ĐÀ NẴNG
          </h1>
          <p className="text-xs sm:text-lg xl:text-2xl font-extrabold text-white tracking-tight drop-shadow-md">
            Hành trình số khám phá quê hương
          </p>
        </div>

        {/* Video giới thiệu giữ nguyên nguồn gốc và tự phát khi trình duyệt cho phép. */}
        {introActive && (
          <div className="relative w-full max-w-[620px] lg:w-[52%] min-w-0 shrink min-h-0">
            <div className="absolute -inset-1 rounded-[22px] sm:rounded-[26px] bg-gradient-to-r from-sky-500/35 via-white/10 to-amber-400/35 blur-lg pointer-events-none" />
            <div className="relative aspect-video max-h-[33dvh] lg:max-h-[49dvh] overflow-hidden rounded-2xl sm:rounded-3xl border-[3px] border-white/80 bg-black shadow-2xl shadow-slate-950/60">
              <iframe
                ref={introFrameRef}
                className="absolute inset-0 h-full w-full"
                src="https://www.youtube-nocookie.com/embed/Ud2uUxz9Lw4?autoplay=1&mute=0&playsinline=1&rel=0&modestbranding=1&controls=1&enablejsapi=1"
                title="Video giới thiệu CHẠM ĐÀ NẴNG"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                onLoad={() => {
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
                }}
              />
              <button
                type="button"
                onClick={handleStartJourney}
                className="absolute right-2.5 top-2.5 sm:right-3 sm:top-3 rounded-xl border border-white/20 bg-slate-950/75 px-3 py-1.5 text-[10px] sm:text-xs font-bold text-white backdrop-blur-md hover:bg-slate-900 transition"
              >
                Bỏ qua
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-row lg:flex-col items-center justify-center gap-2 lg:absolute lg:top-[66%] lg:right-[4%] lg:w-[42%] lg:-translate-y-1/4 shrink-0">
          <button onClick={handleStartJourney} className="group flex items-center gap-2 rounded-[22px] border-b-[6px] border-amber-700 bg-gradient-to-b from-yellow-200 via-amber-400 to-orange-500 px-5 py-2 sm:px-8 sm:py-3 text-sm sm:text-lg font-black text-slate-950 shadow-[0_8px_25px_rgba(0,0,0,.35)] transition hover:scale-105 active:translate-y-1 active:border-b-2">
            <Compass className="h-6 w-6 text-blue-900 group-hover:rotate-45 transition-transform"/> CHẠM ĐỂ KHÁM PHÁ <ArrowRight className="h-5 w-5"/>
          </button>
          <a href="https://vr360.com.vn/projects/danang-virtual-tourists/" target="_blank" rel="noopener noreferrer" title="Khám phá Đà Nẵng 360°" aria-label="Khám phá Đà Nẵng 360 độ" className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 border-violet-200 bg-gradient-to-br from-indigo-500 via-violet-600 to-purple-900 shadow-[0_5px_20px_rgba(110,50,255,.55)] transition hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
            <Globe className="h-6 w-6 text-white"/><span className="sr-only">VR360°</span>
          </a>
        </div>
        <div className="hidden xl:flex absolute bottom-0 left-1/2 -translate-x-1/2 flex-wrap items-center justify-center gap-4 rounded-2xl bg-slate-950/60 px-5 py-2 text-xs font-bold text-white backdrop-blur-sm">
          <span>5 khối lớp</span><span>25 trạm khám phá</span><span>VR360°</span><span>Hộ chiếu số</span><span>Audio & Quiz</span>
        </div>
      </main>

      {/* Dignified Unit and Authors Credits Footer */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-3 sm:px-6 py-1 flex items-center justify-between gap-2 border-t border-white/10 text-[9px] sm:text-xs text-white font-medium">
        <div className="hidden sm:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="font-semibold text-white">Trường Tiểu học Trần Đại Nghĩa</span>
        </div>
        <div className="hidden lg:block text-[11px] sm:text-xs text-slate-100">
          Chương trình Giáo dục địa phương TP Đà Nẵng
        </div>
        <div className="text-[11px] sm:text-xs">
          <span>Người thực hiện: </span>
          <span className="font-black text-amber-300 [text-shadow:1px_1px_2px_#613d00]">TRƯƠNG SINH TUYẾT</span><span className="hidden sm:inline"> · Trường Tiểu học Trần Đại Nghĩa</span>
        </div>
        <button type="button" onClick={()=>{setAdminLogin(true);setShowTeacherLogin(true);setShowStudentLogin(false);setShowRolePicker(true);setLoginError('');setStaffPassword('');}} className="inline-flex items-center gap-1 text-[10px] text-slate-300/75 hover:text-white transition" aria-label="Đăng nhập quản trị"><Settings className="w-3 h-3" /> Quản trị</button>
      </footer>

      {/* Role Picker Modal */}
      {showRolePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
          <img
            src={roleBackground}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: 'blur(' + theme.blur + 'px)', transform: 'scale(1.025)' }}
          />
          <div className="absolute inset-0 bg-white pointer-events-none" style={{ opacity: theme.lightness }} />
          <div className="absolute inset-0 bg-slate-950/38 backdrop-blur-[2px] pointer-events-none" />
          <div role="dialog" aria-modal="true" aria-label="Chọn vai trò và đăng nhập" className={`relative z-10 w-full max-h-[90dvh] overflow-y-auto rounded-[30px] border border-white/30 p-5 text-slate-800 shadow-[0_28px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-7 space-y-5 ${showTeacherLogin || showStudentLogin ? 'max-w-[460px] bg-[#fffdf9]/95' : 'max-w-[920px] bg-gradient-to-br from-[#102b45]/95 via-[#123a53]/95 to-[#064e52]/95'}`}>
            <div className="flex items-center justify-between">
              <div>
                <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-widest ${!showStudentLogin && !showTeacherLogin ? 'bg-amber-300/15 text-amber-200 ring-1 ring-amber-200/25' : 'bg-sky-100 text-sky-800'}`}>
                  CHẠM ĐÀ NẴNG
                </span>
                <h3 className={`mt-3 font-black tracking-tight ${!showStudentLogin && !showTeacherLogin ? 'text-2xl sm:text-3xl text-white' : 'text-xl text-slate-900'}`}>{showTeacherLogin ? (adminLogin ? 'Không gian quản trị' : 'Không gian giáo viên') : showStudentLogin ? 'Chào Nhà phiêu lưu!' : 'Bạn muốn bắt đầu hành trình nào?'}</h3>
                {!showStudentLogin && !showTeacherLogin && <p className="mt-2 text-sm text-sky-100/85">Mỗi hành trình là một cách chạm vào di sản quê hương</p>}
              </div>
              <button
                onClick={() => {
                  setShowRolePicker(false);
                  setShowStudentLogin(false);
                  setShowTeacherLogin(false);
                  setLoginError('');
                }}
                aria-label="Đóng khung đăng nhập" className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center transition ${!showStudentLogin && !showTeacherLogin ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!showStudentLogin && !showTeacherLogin ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {[
                  {id:'student',name:'HỌC SINH',demo:'Khám phá tự do dành cho học sinh',Icon:Compass,color:'bg-orange-600',description:'Nhà thám hiểm nhí · Khám phá di sản, tích lũy dấu ấn.'},
                  {id:'teacher',name:'GIÁO VIÊN',demo:'Khám phá tự do dành cho giáo viên',Icon:Presentation,color:'bg-emerald-700',description:'Người dẫn đường tri thức · Dạy học, trình chiếu và sáng tạo.'},
                ].map(({id,name,demo,Icon,color,description})=><section key={id} className={`group relative flex flex-col overflow-hidden rounded-[26px] border bg-white shadow-[0_12px_35px_rgba(0,0,0,0.16)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_rgba(0,0,0,0.28)] motion-reduce:transform-none ${id==='student' ? 'border-orange-200 hover:border-orange-400' : 'border-emerald-200 hover:border-emerald-400'}`}>
                  <div className={`relative flex h-36 sm:h-44 items-end overflow-hidden p-5 ${id==='student' ? 'bg-gradient-to-br from-orange-500 via-amber-400 to-sky-500' : 'bg-gradient-to-br from-emerald-800 via-teal-500 to-sky-400'}`}>
                    <div className="absolute inset-0 opacity-30" style={{backgroundImage:'radial-gradient(circle at 80% 15%, white 0%, transparent 42%), repeating-linear-gradient(125deg, transparent 0px, transparent 24px, rgba(255,255,255,.22) 25px, transparent 26px)'}} />
                    <div className="absolute right-5 top-4 rounded-full border border-white/40 bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-md">{id==='student' ? 'Hành trình khám phá' : 'Không gian sáng tạo'}</div>
                    <div className="relative flex items-center gap-3">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/60 bg-white/20 text-white shadow-xl backdrop-blur-md transition-transform duration-300 group-hover:rotate-[-5deg] group-hover:scale-110"><Icon className="h-9 w-9" /></div>
                      <div className="text-white"><div className="text-xl font-black tracking-wide drop-shadow-md">{name}</div><div className="text-xs font-medium opacity-90">CHẠM ĐÀ NẴNG</div></div>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-3 bg-gradient-to-b from-white to-slate-50 p-5">
                    <p className="min-h-[40px] text-sm leading-relaxed text-slate-600">{description}</p>
                    <button type="button" onClick={()=>{
                      audioService.playSfx('click');setLoginError('');setStaffPassword('');
                      if(id==='student'){setGuestMode(false);setChosenGrade(null);setShowStudentLogin(true);}
                      else{setAdminLogin(false);setShowTeacherLogin(true);}
                    }} className={`h-11 rounded-xl ${color} px-4 text-sm font-black text-white shadow-md transition hover:brightness-110 active:scale-[.99]`}>Đăng nhập <span aria-hidden="true">→</span></button>
                    <button type="button" disabled={staffBusy} onClick={async()=>{
                      setLoginError('');
                      if(id==='student'){setGuestMode(true);setChosenGrade(null);setShowStudentLogin(true);return;}
                      setStaffBusy(true);
                      try{await enterTeacherDemo();setShowRolePicker(false);}
                      catch(error){setLoginError((error as Error).message);}finally{setStaffBusy(false);}
                    }} aria-label={demo} className={`h-11 rounded-xl border px-4 text-sm font-bold transition hover:bg-slate-100 disabled:opacity-50 ${id==='student' ? 'border-orange-200 text-orange-700' : 'border-emerald-200 text-emerald-700'}`}>Khám phá tự do</button>
                  </div>
                </section>)}
                {loginError && <p role="alert" className="md:col-span-2 rounded-xl bg-rose-50 p-3 text-rose-700">{loginError}</p>}
              </div>
            ) : showStudentLogin ? (
              /* Student Login Form: chọn khối và nhập thông tin ngay trên cùng một màn hình */
              <form onSubmit={handleStudentSubmit} className="space-y-4 text-xs">
                <div>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900">
                      {guestMode ? 'Khám phá tự do · Chọn khối lớp' : 'Chọn khối lớp của em'}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowStudentLogin(false)}
                      className="text-xs font-bold text-slate-500 hover:text-sky-700"
                    >
                      ← Chọn vai trò khác
                    </button>
                  </div>

                  <div className="grid grid-cols-5 gap-2 sm:gap-3">
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
                          className={`min-w-0 rounded-2xl bg-gradient-to-br ${color} px-1 py-3 sm:px-2 sm:py-3 text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl focus-visible:ring-4 focus-visible:ring-sky-300 ${
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
                  </div>
                </div>

                {!guestMode && <details className="rounded-xl border border-sky-100 bg-sky-50 p-3 text-slate-800">
                  <summary className="cursor-pointer font-bold">Em đã có mã đồng bộ? Tiếp tục trên thiết bị khác</summary>
                  <label className="block mt-3">Mã đồng bộ của em<input type="password" autoComplete="off" value={restoreCode} onChange={e=>setRestoreCode(e.target.value)} maxLength={20} className="block w-full mt-1 border rounded-xl p-3 bg-white" /></label>
                  <p className="text-xs my-2">Giữ mã riêng, nhờ cô giáo hoặc phụ huynh hỗ trợ khi cần.</p>
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
                  }} className="rounded-xl bg-sky-700 text-white px-4 py-2 font-bold disabled:opacity-50">{restoreBusy?'Đang khôi phục…':'Khôi phục hành trình'}</button>
                  {loginError && <p role="alert" className="mt-2 text-rose-700">{loginError}</p>}
                </details>}

                {chosenGrade && !guestMode && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-200 space-y-4 rounded-2xl border border-sky-100 bg-sky-50/60 p-4 sm:p-5">
                    <>
                        <div>
                          <label className="font-bold text-slate-700 block mb-2">
                            Lớp cụ thể của em
                          </label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {DEMO_CLASSROOMS.filter(item => item.grade === chosenGrade).map(item => {
                              const name = item.name.replace('Lớp ', '');
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedClass(name);
                                    setLoginError('');
                                  }}
                                  className={`px-4 py-2.5 rounded-xl border-2 font-bold transition ${
                                    selectedClass === name
                                      ? 'bg-sky-600 border-sky-600 text-white shadow-sm'
                                      : 'bg-white border-sky-200 text-sky-800 hover:bg-sky-50'
                                  }`}
                                >
                                  {item.name}
                                </button>
                              );
                            })}
                          </div>
                          <input
                            value={selectedClass}
                            onChange={event => {
                              setSelectedClass(event.target.value);
                              setLoginError('');
                            }}
                            required
                            maxLength={5}
                            placeholder={`Ví dụ: ${chosenGrade}/24`}
                            className="w-full p-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            aria-label="Lớp cụ thể"
                          />
                        </div>

                        <div>
                          <label htmlFor="student-name" className="font-bold text-slate-700 block mb-1">
                            Họ và tên học sinh
                          </label>
                          <input
                            id="student-name"
                            type="text"
                            maxLength={100}
                            value={studentName}
                            onChange={event => {
                              setStudentName(event.target.value);
                              setLoginError('');
                            }}
                            placeholder="Ví dụ: Nguyễn Minh Khang"
                            required
                            className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                          />
                        </div>
                      </>

                    <div className="rounded-xl bg-white/90 border border-sky-100 px-3 py-2.5 text-[10px] text-sky-800 leading-relaxed">
                      App sẽ ghi nhớ tên, lớp và tiến độ của em trên thiết bị này. Dữ liệu đồng bộ được xử lý tự động, em không cần nhập mã.
                    </div>

                    {loginError && (
                      <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
                        {loginError}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-black shadow-md shadow-sky-600/30 transition active:scale-[0.99]"
                    >
                      KHÁM PHÁ NGAY
                    </button>
                  </div>
                )}
                {!guestMode && <button type="button" onClick={()=>{setGuestMode(true);setChosenGrade(null);setLoginError('');}} className="h-9 w-full rounded-xl border border-orange-200 text-xs font-bold text-orange-700 hover:bg-orange-50">Khám phá tự do</button>}
              </form>
            ) : (
              <form className="space-y-4 text-sm" onSubmit={async e => {
                e.preventDefault(); if(staffBusy) return; setStaffBusy(true); setLoginError('');
                try {
                  const user = await authService.login(staffEmail,staffPassword);
                  setStaffPassword('');
                  if(adminLogin && user.role !== 'admin') throw new Error('Tài khoản này không có quyền quản trị.');
                  if(!adminLogin && user.role !== 'teacher') throw new Error('Vui lòng dùng tài khoản giáo viên tại đây.');
                  if(user.role === 'admin') loginAsAdmin(user); else loginAsTeacher(user);
                  setShowRolePicker(false);
                } catch(error) { setLoginError((error as Error).message); }
                finally { setStaffBusy(false); }
              }}>
                {!adminLogin && <GoogleTeacherLogin onLogin={user=>{if(user.role!=='teacher')return;loginAsTeacher(user);setShowRolePicker(false);}} />}
                <p className="text-slate-500">Tài khoản được cấp: đăng nhập bằng email và mật khẩu.</p>
                <label className="block font-bold">Email
                  <input type="email" autoComplete="username" required maxLength={254} value={staffEmail} onChange={e=>setStaffEmail(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100" />
                </label>
                <label className="block font-bold">Mật khẩu
                  <input type="password" autoComplete="current-password" required maxLength={128} value={staffPassword} onChange={e=>setStaffPassword(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100" />
                </label>
                {loginError && <p role="alert" className="p-3 rounded-xl bg-rose-50 text-rose-700">{loginError}</p>}
                <p className="text-xs text-slate-500">Quên mật khẩu? Liên hệ quản trị nhà trường để được đặt lại.</p>
                <button disabled={staffBusy} className={`h-11 w-full rounded-xl text-sm font-bold text-white shadow-sm disabled:opacity-50 ${adminLogin ? 'bg-sky-700 hover:bg-sky-800' : 'bg-emerald-700 hover:bg-emerald-800'}`}>{staffBusy ? 'Đang đăng nhập…' : 'Đăng nhập'}</button>
                {!adminLogin && <button type="button" disabled={staffBusy} onClick={async()=>{setStaffBusy(true);setLoginError('');try{await enterTeacherDemo();setStaffPassword('');setShowRolePicker(false);}catch(error){setLoginError((error as Error).message);}finally{setStaffBusy(false);}}} className="h-9 w-full rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Khám phá tự do</button>}
                <p className="text-center text-[10px] text-slate-400">Chế độ tự do không lưu dữ liệu lớp học trên máy chủ.</p>
                <button type="button" disabled={staffBusy} onClick={()=>{setShowTeacherLogin(false);setStaffPassword('');setLoginError('');}} className="block w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800">← Chọn vai trò khác</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default LandingView;

