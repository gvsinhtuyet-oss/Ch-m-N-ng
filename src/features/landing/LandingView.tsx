import { AppFullscreenButton } from '../../components/common/AppFullscreen';
import './landing-cover.css';
import {GoogleTeacherLogin} from '../../components/auth/GoogleTeacherLogin';
import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { DEMO_STUDENTS } from '../../data/mockUsers';
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
  KeyRound,
  BookOpen,
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
  const [showStaffPassword, setShowStaffPassword] = useState(false);
  const [savedSyncCode, setSavedSyncCode] = useState<string>('');
  const [restoreCode,setRestoreCode] = useState('');
  const [qrEntryCode,setQrEntryCode] = useState('');
  const qrEntryInFlight=useRef(false);
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
    setShowStaffPassword(false);
    setShowRolePicker(true);
  };

  const finishStaffLogin = (user: StaffUser) => {
    if (user.role === 'admin') loginAsAdmin(user);
    else loginAsTeacher(user);
    setShowRolePicker(false);
  };

  const restoreStudentByCode=async (code:string)=>{
    const restored=await studentSyncService.restore(code);
    if(authService.current())await authService.logout();
    const profile=restored.profile;
    const syncCode=code.toUpperCase().replace(/[^A-Z0-9]/g,'');
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


      {/* Responsive onboarding. Decorative images are never used as buttons; HTML controls remain interactive. */}
      {showRolePicker && (
        <div className="cham-onboard-overlay fixed inset-0 z-50 overflow-y-auto">
          <img src={roleBackground} alt="" aria-hidden="true" className="cham-onboard-background absolute inset-0 h-full w-full object-cover" />
          <div className="cham-onboard-screen absolute inset-0 pointer-events-none" />
          <div className="cham-onboard-center">
            <div role="dialog" aria-modal="true" aria-label={showStudentLogin ? 'Đăng nhập học sinh' : showStaffLogin ? 'Đăng nhập giáo viên' : 'Chọn vai trò'} className="cham-onboard-card relative">
              <button type="button" aria-label="Đóng cửa sổ đăng nhập" className="cham-onboard-close" onClick={()=>{
                setShowRolePicker(false);setIntroActive(true);setShowStudentLogin(false);setShowStaffLogin(false);
                setShowStaffPassword(false);setStaffPassword('');setLoginError('');
              }}><X className="h-5 w-5" /></button>

              <div className="cham-onboard-brand">
                <img src="/images/landing/cham-approved-logo.svg" width="237" height="87" alt="Logo CHẠM ĐÀ NẴNG" />
                <p>Hành trình số khám phá quê hương</p>
              </div>

              {!showStudentLogin && !showStaffLogin ? (
                <div className="cham-onboard-content">
                  <h2 className="cham-onboard-headline">Chào mừng đến với hành trình khám phá!</h2>
                  <p className="cham-onboard-intro">Hãy chọn vai trò của bạn để bắt đầu nhé!</p>
                  <div className="cham-onboard-choice-grid">
                    <button type="button" className="cham-onboard-choice cham-onboard-choice--student" onClick={()=>{
                      audioService.playSfx('click');setLoginError('');setGuestMode(false);setChosenGrade(null);setShowStudentLogin(true);
                    }}>
                      <img src="/images/landing/cham-students.svg" alt="" aria-hidden="true" />
                      <span className="cham-onboard-choice-copy"><strong>Học sinh</strong><small>Vào học bằng mã hoặc khám phá tự do</small></span>
                      <ArrowRight className="cham-onboard-choice-arrow h-5 w-5" aria-hidden="true" />
                    </button>
                    <button type="button" className="cham-onboard-choice cham-onboard-choice--teacher" onClick={openStaffLogin}>
                      <img src="/images/landing/cham-teacher.svg" alt="" aria-hidden="true" />
                      <span className="cham-onboard-choice-copy"><strong>Giáo viên</strong><small>Đăng nhập hoặc trải nghiệm học liệu</small></span>
                      <ArrowRight className="cham-onboard-choice-arrow h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ) : showStudentLogin ? (
                <div className="cham-onboard-content cham-onboard-content--student">
                  <img className="cham-onboard-hero-art" src="/images/landing/cham-students.svg" alt="" aria-hidden="true" />
                  <h2 className="cham-onboard-headline">Chào nhà khám phá nhỏ!</h2>
                  <p className="cham-onboard-intro">{guestMode ? 'Chọn khối lớp để bắt đầu hành trình của em.' : 'Nhập mã cô thầy cấp để bắt đầu chuyến phiêu lưu của em.'}</p>
                  {guestMode ? (
                    <div className="cham-onboard-grade-selector">
                      <h3>Em muốn khám phá khối lớp nào?</h3>
                      <div className="cham-onboard-grades" aria-label="Chọn khối lớp để khám phá tự do">
                        {[1,2,3,4,5].map(grade=>
                          <button type="button" key={grade} disabled={chosenGrade !== null} onClick={()=>enterGuestJourney(grade)}>
                            <GraduationCap className="h-5 w-5" aria-hidden="true" />Khối {grade}
                          </button>
                        )}
                      </div>
                      <button type="button" className="cham-onboard-text-button" onClick={()=>{setGuestMode(false);setChosenGrade(null);setLoginError('');}}>← Nhập mã học sinh</button>
                    </div>
                  ) : (
                    <div className="cham-onboard-student-form">
                      <label htmlFor="cham-student-access-code" className="cham-onboard-field-label"><KeyRound className="h-4 w-4" aria-hidden="true"/> Mã khám phá của em</label>
                      <input id="cham-student-access-code" type="password" inputMode="text" autoCapitalize="characters" autoComplete="off" maxLength={20}
                        placeholder="Nhập mã do thầy cô cấp..." value={restoreCode} onChange={e=>setRestoreCode(e.target.value)} />
                      <button type="button" className="cham-onboard-primary" disabled={restoreBusy || !restoreCode.trim()} onClick={async()=>{
                        if(restoreBusy)return;setRestoreBusy(true);setLoginError('');
                        try{await restoreStudentByCode(restoreCode);}
                        catch(error){setLoginError((error as Error).message);}
                        finally{setRestoreBusy(false);}
                      }}>{restoreBusy ? 'Đang mở hồ sơ…' : 'Bắt đầu khám phá'} <ArrowRight className="h-5 w-5" aria-hidden="true"/></button>
                      <div className="cham-onboard-secondary-row">
                        {savedSyncCode && <button type="button" disabled={restoreBusy} className="cham-onboard-secondary cham-onboard-secondary--saved" onClick={async()=>{
                          if(restoreBusy)return;setRestoreBusy(true);setLoginError('');
                          try{await restoreStudentByCode(savedSyncCode);}
                          catch(error){setLoginError((error as Error).message);}
                          finally{setRestoreBusy(false);}
                        }}>Dùng mã đã lưu</button>}
                        <button type="button" className="cham-onboard-secondary cham-onboard-secondary--guest" onClick={()=>{setGuestMode(true);setChosenGrade(null);setLoginError('');}}>
                          <Compass className="h-4 w-4" aria-hidden="true"/>Khám phá tự do
                        </button>
                      </div>
                      <p className="cham-onboard-hint">Chưa có mã? Nhờ thầy cô cấp mã hoặc thẻ QR. Em có thể quét thẻ QR bằng ứng dụng Camera trên điện thoại.</p>
                    </div>
                  )}
                  {loginError && <p role="alert" className="cham-onboard-error">{loginError}</p>}
                  <button type="button" className="cham-onboard-back" onClick={()=>{setShowStudentLogin(false);setGuestMode(false);setChosenGrade(null);setLoginError('');}}>← Chọn vai trò khác</button>
                </div>
              ) : (
                <div className="cham-onboard-content cham-onboard-content--teacher">
                  <img className="cham-onboard-hero-art" src="/images/landing/cham-teacher.svg" alt="" aria-hidden="true" />
                  <h2 className="cham-onboard-headline">Chào mừng thầy cô!</h2>
                  <p className="cham-onboard-intro">Không gian dạy học và khám phá Giáo dục địa phương</p>
                  <div className="cham-onboard-teacher-actions">
                    <div className="cham-onboard-google"><GoogleTeacherLogin onLogin={finishStaffLogin}/></div>
                    <button type="button" className="cham-onboard-account-button" aria-expanded={showStaffPassword} onClick={()=>{
                      setShowStaffPassword(v=>!v);setLoginError('');setStaffPassword('');
                    }}><KeyRound className="h-5 w-5" aria-hidden="true"/>Đăng nhập bằng tài khoản</button>
                    {showStaffPassword && <form className="cham-onboard-password-form" onSubmit={async e=>{
                      e.preventDefault();if(staffBusy)return;setStaffBusy(true);setLoginError('');
                      try{const user=await authService.login(staffEmail,staffPassword);setStaffPassword('');finishStaffLogin(user);}
                      catch(error){setLoginError((error as Error).message);}
                      finally{setStaffBusy(false);}
                    }}>
                      <label>Email<input type="email" autoComplete="username" required maxLength={254} value={staffEmail} onChange={e=>setStaffEmail(e.target.value)} /></label>
                      <label>Mật khẩu<input type="password" autoComplete="current-password" required maxLength={128} value={staffPassword} onChange={e=>setStaffPassword(e.target.value)} /></label>
                      <button className="cham-onboard-primary" disabled={staffBusy} type="submit">{staffBusy ? 'Đang đăng nhập…' : 'Đăng nhập'} <ArrowRight className="h-5 w-5" aria-hidden="true"/></button>
                      <button type="button" className="cham-onboard-text-button" disabled={staffBusy} onClick={async()=>{
                        setStaffBusy(true);setLoginError('');
                        try{const user=await authService.restore();if(user)finishStaffLogin(user);else setLoginError('Phiên đăng nhập đã hết hạn. Hãy thử Google hoặc mật khẩu.');}
                        catch(error){setLoginError((error as Error).message);}
                        finally{setStaffBusy(false);}
                      }}>Tiếp tục phiên đăng nhập trên thiết bị này</button>
                      <p>Quên mật khẩu? Liên hệ quản trị nhà trường để được hỗ trợ.</p>
                    </form>}
                    <div className="cham-onboard-divider"><span>HOẶC</span></div>
                    <button type="button" className="cham-onboard-secondary cham-onboard-secondary--guest-teacher" disabled={staffBusy} onClick={async()=>{
                      if(staffBusy)return;setStaffBusy(true);setLoginError('');
                      try{await enterTeacherDemo();setShowRolePicker(false);}
                      catch(error){setLoginError((error as Error).message);}
                      finally{setStaffBusy(false);}
                    }}><BookOpen className="h-5 w-5" aria-hidden="true"/><span><strong>Giáo viên tự do</strong><small>Khám phá học liệu không cần tài khoản</small></span><ArrowRight className="h-4 w-4" aria-hidden="true"/></button>
                    <p className="cham-onboard-hint">Để tạo lớp, cấp mã học sinh và xem kết quả, thầy cô cần đăng nhập.</p>
                  </div>
                  {loginError && <p role="alert" className="cham-onboard-error">{loginError}</p>}
                  <button type="button" className="cham-onboard-back" onClick={()=>{setShowStaffLogin(false);setShowStaffPassword(false);setStaffPassword('');setLoginError('');}}>← Chọn vai trò khác</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default LandingView;

