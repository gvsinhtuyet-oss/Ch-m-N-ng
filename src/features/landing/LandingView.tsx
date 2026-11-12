import { AppFullscreenButton } from '../../components/common/AppFullscreen';
import './landing-cover.css';
import { ResponsiveAccessPortal } from './ResponsiveAccessPortal';
import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { DEMO_STUDENTS } from '../../data/mockUsers';
import { authService, type StaffUser } from '../../services/AuthService';
import { audioService } from '../../services/AudioService';
import { backgroundMusic } from '../../services/BackgroundMusic';
import { progressService } from '../../services/ProgressService';
import { studentSyncService } from '../../services/StudentSyncService';
import { normalizeStudentCode } from './studentQr';
import { readTheme } from '../../services/ThemeService';
import { DEFAULT_APP_BACKGROUND_DATA_URL } from '../../assets/defaultAppBackground';
import {
  Compass,
  LogIn,
  Globe,
  ArrowRight,
  Volume2,
  VolumeX,
  Layers,
  CircleHelp,
  Award,
  Play,
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
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffBusy, setStaffBusy] = useState(false);
  const [showStaffLogin, setShowStaffLogin] = useState<boolean>(false);
  const [savedSyncCode, setSavedSyncCode] = useState<string>('');
  const [restoreCode,setRestoreCode] = useState('');
  const [qrEntryCode,setQrEntryCode] = useState('');
  const qrEntryInFlight=useRef(false);
  const guestEntryInFlight=useRef(false);
  const [restoreBusy,setRestoreBusy] = useState(false);
  const [loginError, setLoginError] = useState<string>('');
  const [introActive, setIntroActive] = useState(true);
  const [theme, setTheme] = useState(readTheme);
  const [mobileBackground, setMobileBackground] = useState(() => window.matchMedia('(max-width: 1023px) and (orientation: portrait)').matches);
  const introFrameRef = useRef<HTMLIFrameElement | null>(null);

  const STUDENT_PROFILE_KEY = 'cham_danang_student_profile_v1';
  useEffect(()=>{
    const readStudentQr=()=>{
      const match=/^#student-code=([A-Z0-9-]{12,20})$/i.exec(window.location.hash);
      if(!match)return;
      setQrEntryCode(match[1].toUpperCase());
      setRestoreCode('');
      setLoginError('');
      setGuestMode(false);
      setShowRolePicker(false);
      setShowStudentLogin(false);
      setIntroActive(true);
      // The QR contains a student login credential: strip it from browser history.
      window.history.replaceState(null,'',window.location.pathname+window.location.search);
    };
    readStudentQr();
    window.addEventListener('hashchange',readStudentQr);
    return ()=>window.removeEventListener('hashchange',readStudentQr);
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
      const saved = raw ? JSON.parse(raw) : null;
      if (typeof saved?.syncCode === 'string' && /^[A-Z0-9-]{12,20}$/i.test(saved.syncCode)) {
        setSavedSyncCode(saved.syncCode);
      }
    } catch {
      // Invalid or legacy local data never creates an extra student identity.
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

  const restoreStudentByCode=async (code:string)=>{
    const normalized = normalizeStudentCode(code);
    if (!normalized) throw new Error('Mã học sinh không đúng định dạng. Hãy nhập hoặc quét mã do thầy cô cấp.');
    const restored=await studentSyncService.restore(normalized);
    if(authService.current())await authService.logout();
    const profile=restored.profile;
    const syncCode=normalized;
    localStorage.setItem(STUDENT_PROFILE_KEY,JSON.stringify({...profile,syncCode}));
    progressService.mergeStudentProgressRecords(profile.id,restored.progress);
    loginAsStudent({
      ...DEMO_STUDENTS[0],...profile,
      studentCode:profile.id,displayName:profile.name,
      classId:profile.classId || `class-${profile.className.replace('/','-')}`,
      isGuest:false,
    });
    setRestoreCode('');
    setQrEntryCode('');
    setShowRolePicker(false);
  };

  const handleStartJourney = async () => {
    if(qrEntryCode){
      if(qrEntryInFlight.current)return;
      qrEntryInFlight.current=true;
      setRestoreBusy(true);
      setLoginError('');
      try{
        // Scan -> original cover and intro video -> tap -> enter the student's own class.
        await restoreStudentByCode(qrEntryCode);
        stopIntroVideo();
        audioService.playSfx('click');
      }catch(error){
        // Rotated, expired or offline QR: allow retry with the already scanned code.
        setRestoreCode(qrEntryCode);
        setQrEntryCode('');
        stopIntroVideo();
        setShowRolePicker(true);
        setShowStudentLogin(true);
        setGuestMode(false);
        setLoginError((error as Error).message || 'Chưa mở được hồ sơ. Em có thể thử lại mã cô/thầy đã cấp.');
      }finally{
        qrEntryInFlight.current=false;
        setRestoreBusy(false);
      }
      return;
    }
    stopIntroVideo();
    audioService.playSfx('click');
    openRolePicker();
  };

  const enterGuestJourney = (grade: number) => {
    if (guestEntryInFlight.current || !Number.isInteger(grade) || grade < 1 || grade > 5) return;
    guestEntryInFlight.current = true;
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
      } finally { guestEntryInFlight.current = false; }
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
          <button onClick={()=>void handleStartJourney()} disabled={restoreBusy} aria-label={qrEntryCode&&restoreBusy?'Đang mở hồ sơ học sinh':'CHẠM ĐỂ KHÁM PHÁ'} className="group flex items-center gap-2 rounded-[22px] border-b-[6px] border-amber-700 bg-gradient-to-b from-yellow-200 via-amber-400 to-orange-500 px-5 py-2 sm:px-8 sm:py-3 text-sm sm:text-lg font-black text-slate-950 shadow-[0_8px_25px_rgba(0,0,0,.35)] transition hover:scale-105 active:translate-y-1 active:border-b-2 disabled:cursor-wait disabled:opacity-80">
            <Compass className="h-6 w-6 text-blue-900 group-hover:rotate-45 transition-transform"/> {qrEntryCode&&restoreBusy?'ĐANG MỞ LỚP CỦA EM…':'CHẠM ĐỂ KHÁM PHÁ'} <ArrowRight className="h-5 w-5"/>
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

      {/* Three approved role/student/teacher screens: images are decorative, controls remain live. */}
      {showRolePicker && <ResponsiveAccessPortal
        view={showStaffLogin ? 'teacher' : showStudentLogin ? 'student' : 'role'}
        guestMode={guestMode}
        chosenGrade={chosenGrade}
        roleBackground={mobileBackground ? coverBackground : roleBackground}
        themeBlur={theme.blur}
        restoreCode={restoreCode}
        onRestoreCodeChange={setRestoreCode}
        savedSyncCode={savedSyncCode}
        restoreBusy={restoreBusy}
        staffBusy={staffBusy}
        staffEmail={staffEmail}
        staffPassword={staffPassword}
        onStaffEmailChange={setStaffEmail}
        onStaffPasswordChange={setStaffPassword}
        loginError={loginError}
        onClose={() => {
          setShowRolePicker(false);
          setIntroActive(true);
          setShowStudentLogin(false);
          setShowStaffLogin(false);
          setStaffPassword('');
          setLoginError('');
        }}
        onBack={() => {setShowStudentLogin(false);setShowStaffLogin(false);setGuestMode(false);setLoginError('');}}
        onStudent={() => {audioService.playSfx('click');setLoginError('');setGuestMode(false);setChosenGrade(null);setShowStaffLogin(false);setShowStudentLogin(true);}}
        onTeacher={openStaffLogin}
        onStudentGuest={() => {setGuestMode(true);setChosenGrade(null);setLoginError('');}}
        onStudentGrade={enterGuestJourney}
        onScanCode={async code => {
          if (restoreBusy) throw new Error('Hệ thống đang kiểm tra mã. Vui lòng thử lại sau.');
          setRestoreBusy(true);
          setLoginError('');
          try {
            await restoreStudentByCode(code);
          } catch (caught) {
            const message = caught instanceof Error ? caught.message : 'Không xác minh được mã học sinh.';
            setLoginError(message);
            throw new Error(message);
          } finally {
            setRestoreBusy(false);
          }
        }}
        onStudentSubmit={() => {
          if (restoreBusy || !restoreCode.trim()) return;
          setRestoreBusy(true);setLoginError('');
          void restoreStudentByCode(restoreCode).catch(error=>setLoginError((error as Error).message)).finally(()=>setRestoreBusy(false));
        }}
        onSavedCode={() => {setRestoreCode(savedSyncCode);setLoginError('');}}
        onTeacherDemo={() => {
          if(staffBusy)return;
          setStaffBusy(true);setLoginError('');
          void enterTeacherDemo().then(()=>setShowRolePicker(false)).catch(error=>setLoginError((error as Error).message)).finally(()=>setStaffBusy(false));
        }}
        onStaffLogin={event => {
          event.preventDefault();
          if(staffBusy)return;
          setStaffBusy(true);setLoginError('');
          void authService.login(staffEmail,staffPassword).then(user=>{setStaffPassword('');finishStaffLogin(user);}).catch(error=>setLoginError((error as Error).message)).finally(()=>setStaffBusy(false));
        }}
        onRestoreStaff={() => {
          if(staffBusy)return;
          setStaffBusy(true);setLoginError('');
          void authService.restore().then(user=>{
            if(user)finishStaffLogin(user);
            else setLoginError('Phiên đăng nhập đã hết hạn. Hãy đăng nhập bằng Google hoặc mật khẩu.');
          }).catch(error=>setLoginError((error as Error).message)).finally(()=>setStaffBusy(false));
        }}
        onGoogleLogin={finishStaffLogin}
      />}
    </div>
  );
};
export default LandingView;

