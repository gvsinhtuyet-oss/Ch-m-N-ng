import {freeExplorerIdentity} from '../../services/FreeExplorerIdentity';
import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Compass, Eye, EyeOff, GraduationCap, KeyRound, LockKeyhole, QrCode, X } from 'lucide-react';
import { GoogleTeacherLogin } from '../../components/auth/GoogleTeacherLogin';
import type { StaffUser } from '../../services/AuthService';
import { StudentQrScanner } from './StudentQrScanner';
import './access-portal.css';

export interface Props {
  view: 'role' | 'student' | 'teacher';
  guestMode: boolean;
  chosenGrade: number | null;
  roleBackground: string;
  themeBlur: number;
  restoreCode: string;
  onRestoreCodeChange: (code: string) => void;
  savedSyncCode: string;
  restoreBusy: boolean;
  staffBusy: boolean;
  staffEmail: string;
  staffPassword: string;
  onStaffEmailChange: (value: string) => void;
  onStaffPasswordChange: (value: string) => void;
  loginError: string;
  onClose: () => void;
  onBack: () => void;
  onStudent: () => void;
  onTeacher: () => void;
  onStudentGuest: (name:string) => void;
  onStudentGrade: (grade: number) => void;
  onStudentSubmit: () => void;
  onSavedCode: () => void;
  onTeacherDemo: (name:string) => void;
  onStaffLogin: (event: React.FormEvent<HTMLFormElement>) => void;
  onRestoreStaff: () => void;
  onGoogleLogin: (user: StaffUser) => void;
  onScanCode: (code: string) => Promise<void>;
}

/* Approved clean artwork: dedicated cards and wide headers, with no printed UI. */
const artwork = {
  student: { card: '/images/landing/approved-clean/student-card.webp', banner: '/images/landing/approved-clean/student-banner.webp' },
  teacher: { card: '/images/landing/approved-clean/teacher-card.webp', banner: '/images/landing/approved-clean/teacher-banner.webp' },
};
const grades = [1, 2, 3, 4, 5];

function Wordmark() {
  return <div className="cham-access-masthead">
    <div className="cham-access-logo cham-access-wordmark" role="img" aria-label="CHẠM ĐÀ NẴNG">
      <span>CHẠM</span><span>ĐÀ NẴNG</span>
    </div>
    <p className="cham-access-tagline">Hành trình số khám phá quê hương</p>
  </div>;
}

function Art({ kind, variant = 'card', className = '' }: { kind: 'student'|'teacher'; variant?: 'card'|'banner'; className?: string }) {
  return <div className={'cham-access-illustration '+className} aria-hidden="true">
    <picture><source media="(max-width: 767px)" srcSet={artwork[kind][variant]} /><img src={artwork[kind].card} loading="eager" decoding="sync" alt="" draggable={false} /></picture>
  </div>;
}

export const AccessPortal: React.FC<Props> = ({
  view, guestMode, chosenGrade, roleBackground,
  restoreCode, onRestoreCodeChange, savedSyncCode, restoreBusy,
  staffBusy, staffEmail, staffPassword, onStaffEmailChange,
  onStaffPasswordChange, loginError, onClose, onBack, onStudent,
  onTeacher, onStudentGuest, onStudentGrade, onStudentSubmit,
  onSavedCode, onTeacherDemo, onStaffLogin, onRestoreStaff,
  onGoogleLogin, onScanCode,
}) => {
  const [nameRole,setNameRole]=useState<'student'|'teacher'|null>(null);
  const [freeName,setFreeName]=useState('');
  const requestName=(role:'student'|'teacher')=>{setFreeName(freeExplorerIdentity.savedName(role));setNameRole(role)};
  const [accountExpanded, setAccountExpanded] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [showCode, setShowCode] = useState(true);
  const sheetRef = useRef<HTMLElement | null>(null);
  useEffect(() => { sheetRef.current?.focus({ preventScroll: true }); }, [view]);
  const handleDialogKey = (event: React.KeyboardEvent<HTMLElement>) => {
    if (qrOpen) return;
    if (event.key === 'Escape') { event.preventDefault(); if(nameRole)setNameRole(null);else onClose(); return; }
    if (event.key !== 'Tab') return;
    const controls = [...event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled)')].filter(el => el.getClientRects().length > 0);
    const first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === sheetRef.current)) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  };
  return (
    <div className="cham-access-overlay" data-screen={view}>
      <img className="cham-access-backdrop" src={roleBackground} alt="" aria-hidden="true"  />
      <div className="cham-access-colorveil" aria-hidden="true" />
      <section ref={sheetRef} tabIndex={-1} onKeyDown={handleDialogKey} className="cham-access-sheet" data-screen={view} role="dialog" aria-modal="true"
        aria-label={view === 'role' ? 'Chọn vai trò' : view === 'student' ? 'Đăng nhập học sinh' : 'Đăng nhập giáo viên'}>
        <button type="button" className="cham-access-close" onClick={onClose} aria-label="Đóng cửa sổ">
          <X size={22} />
        </button>
        <div className="cham-access-content">
          <Wordmark />

          {nameRole ? <main className="cham-access-step-layout"><div className="cham-access-form-card" style={{gridColumn:'1 / -1',width:'100%',maxWidth:540,margin:'0 auto'}}><form onSubmit={event=>{event.preventDefault();const name=freeName.trim().replace(/\s+/g,' ');if(!name)return;freeExplorerIdentity.save(name,nameRole);if(nameRole==='student')onStudentGuest(name);else onTeacherDemo(name);setNameRole(null);}}><h1>{nameRole==='student'?'Em tên là gì?':'Thầy cô cho biết tên nhé!'}</h1><label className="cham-access-label" htmlFor="free-explorer-name">{nameRole==='student'?'Tên của em':'Tên thầy cô'}</label><input id="free-explorer-name" autoFocus required maxLength={60} autoComplete="off" value={freeName} onChange={e=>setFreeName(e.target.value)} placeholder={nameRole==='student'?'Nhập tên hoặc tên gọi của em':'Ví dụ: Cô Tuyết'} style={{width:'100%',padding:14,border:'1px solid #94a3b8',borderRadius:12,fontSize:16}}/><p className="cham-access-hint">Tên sẽ hiện trong lời chào và báo cáo truy cập, đánh giá của quản trị. Có thể dùng tên gọi; không cần nhập số điện thoại hay thông tin riêng tư khác.</p><button type="submit" className="cham-access-primary" disabled={!freeName.trim()||staffBusy||restoreBusy}>Tiếp tục <ArrowRight size={20}/></button><button type="button" className="cham-access-back" onClick={()=>setNameRole(null)}>Quay lại</button></form></div></main> : view === 'role' ? <main className="cham-access-role-content">
            <h1>Hãy chọn vai trò <span>để bắt đầu khám phá nhé!</span></h1>
            <div className="cham-access-roles">
              <button type="button" className="cham-access-role-card student" onClick={onStudent} aria-label="Chọn vai trò học sinh">
                <Art kind="student" className="cham-access-role-picture" />
                <span className="cham-access-role-footer"><GraduationCap aria-hidden="true" /><span>Học sinh</span><ArrowRight className="cham-access-arrow" aria-hidden="true" /></span>
              </button>
              <button type="button" className="cham-access-role-card teacher" onClick={onTeacher} aria-label="Chọn vai trò giáo viên">
                <Art kind="teacher" className="cham-access-role-picture" />
                <span className="cham-access-role-footer"><BookOpen aria-hidden="true" /><span>Giáo viên</span><ArrowRight className="cham-access-arrow" aria-hidden="true" /></span>
              </button>
            </div>
            <p className="cham-access-role-footnote">Cùng khám phá quê hương Đà Nẵng qua những điểm chạm thú vị.</p>
          </main> :
          <main className="cham-access-step-layout" data-screen={view}>
            <aside className={'cham-access-hero '+view} aria-hidden="true">
              <div className="cham-access-hero-sky"><span>{view === 'student' ? 'Khám phá quê hương' : 'Dạy học sáng tạo'}</span><small>Đà Nẵng thân yêu</small></div>
              <Art kind={view === 'student' ? 'student' : 'teacher'} variant="banner" className="cham-access-hero-picture" />
            </aside>
            <div className="cham-access-form-card">
              {view === 'student' ? <>
                <span className="cham-access-role-chip student"><GraduationCap size={17}/> HỌC SINH</span>
                <div className="cham-access-card-title"><h1>{guestMode ? 'Chọn khối lớp của em!' : 'Chào Nhà phiêu lưu!'}</h1></div>
                <p className="cham-access-description">{guestMode ? 'Em muốn khám phá khối nào hôm nay?' : 'Vào học bằng mã của em'}</p>

                {guestMode ? <div className="cham-access-grade-grid" role="group" aria-label="Chọn khối lớp">
                  {grades.map(grade => <button type="button" key={grade} disabled={restoreBusy || chosenGrade !== null}
                    onClick={() => onStudentGrade(grade)} aria-pressed={chosenGrade === grade}>Khối {grade}</button>)}
                </div> : <>
                  <label htmlFor="cham-access-student-code" className="cham-access-label"><KeyRound size={16}/> Mã học sinh của em</label>
                  <div className="cham-access-code-row">
                    <input id="cham-access-student-code" type={showCode ? 'text' : 'password'} inputMode="text"
                      autoComplete="off" spellCheck={false} maxLength={20} value={restoreCode}
                      onChange={event => onRestoreCodeChange(event.target.value)}
                      placeholder="Nhập mã do thầy cô cấp…"
                      onKeyDown={event => { if (event.key === 'Enter' && restoreCode.trim()) { event.preventDefault(); onStudentSubmit(); } }} />
                    <button type="button" className="cham-access-code-eye" onClick={() => setShowCode(value => !value)}
                      aria-label={showCode ? 'Ẩn mã học sinh' : 'Hiện mã học sinh'} title={showCode ? 'Ẩn mã' : 'Hiện mã'}>
                      {showCode ? <EyeOff size={19}/> : <Eye size={19}/>}
                    </button>
                    <button type="button" className="cham-access-qr-button" onClick={() => setQrOpen(true)}
                      aria-label="Quét mã QR bằng camera hoặc tải ảnh QR" title="Quét QR hoặc tải ảnh">
                      <QrCode size={25} />
                    </button>
                  </div>
                  <button type="button" className="cham-access-primary" disabled={restoreBusy || !restoreCode.trim()} onClick={onStudentSubmit}>
                    {restoreBusy ? 'Đang xác minh mã…' : 'Bắt đầu khám phá'}<ArrowRight size={20} aria-hidden="true"/>
                  </button>
                  <div className="cham-access-student-secondary">
                    {savedSyncCode && <button type="button" onClick={onSavedCode} disabled={restoreBusy}>Dùng mã đã lưu</button>}
                    <button type="button" onClick={()=>requestName('student')} disabled={restoreBusy}><Compass size={19}/> Khám phá tự do</button>
                  </div>
                  <p className="cham-access-hint">Em có thẻ QR? Chạm biểu tượng QR bên cạnh mã học sinh.</p>
                </>}
                {restoreBusy && <p role="status" className="cham-access-status">Đang kiểm tra hồ sơ với hệ thống…</p>}
                {loginError && <p role="alert" className="cham-access-error">{loginError}</p>}
                <button type="button" className="cham-access-back" onClick={guestMode ? onStudent : onBack}>
                  <ArrowLeft size={19}/>{guestMode ? 'Nhập mã học sinh' : 'Chọn vai trò khác'}
                </button>
              </> : <>
                <span className="cham-access-role-chip teacher"><BookOpen size={17}/> GIÁO VIÊN</span>
                <div className="cham-access-card-title"><h1>Chào thầy cô!</h1></div>
                <p className="cham-access-description">Đồng hành cùng học sinh khám phá Đà Nẵng</p>
                <div className="cham-access-google"><GoogleTeacherLogin onLogin={onGoogleLogin}/></div>
                <button type="button" className="cham-access-account-trigger" onClick={() => setAccountExpanded(value => !value)}
                  aria-expanded={accountExpanded} aria-controls="cham-access-account-form">
                  <LockKeyhole size={19}/> Đăng nhập bằng tài khoản <ArrowRight size={17}/>
                </button>
                {accountExpanded && <form id="cham-access-account-form" className="cham-access-account-form" onSubmit={onStaffLogin}>
                  <label>Email hoặc tên đăng nhập
                    <input type="text" autoComplete="username" required maxLength={254}
                      value={staffEmail} onChange={event => onStaffEmailChange(event.target.value)} placeholder="Email hoặc tên đăng nhập" />
                  </label>
                  <label>Mật khẩu
                    <span className="cham-access-password-row">
                      <input type={showPassword ? 'text' : 'password'} autoComplete="current-password" required maxLength={128}
                        value={staffPassword} onChange={event => onStaffPasswordChange(event.target.value)} placeholder="Mật khẩu" />
                      <button type="button" className="cham-access-toggle-password"
                        aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        onClick={() => setShowPassword(value => !value)}>{showPassword ? <EyeOff size={19}/> : <Eye size={19}/>}</button>
                    </span>
                  </label>
                  <button className="cham-access-account-submit" type="submit" disabled={staffBusy}>{staffBusy ? 'Đang đăng nhập…' : 'Đăng nhập'}</button>
                  <button className="cham-access-resume" type="button" onClick={onRestoreStaff} disabled={staffBusy}>Tiếp tục phiên đã đăng nhập</button>
                  <p>Quên mật khẩu? Liên hệ quản trị để được hỗ trợ.</p>
                </form>}
                <div className="cham-access-or"><span>HOẶC</span></div>
                <button type="button" className="cham-access-teacher-guest" disabled={staffBusy} onClick={()=>requestName('teacher')}>
                  <BookOpen size={27} aria-hidden="true"/><span><strong>Giáo viên / Quản trị trải nghiệm</strong><small>Tạo lớp, quản lý học liệu và xem báo cáo thử</small></span><ArrowRight size={20} aria-hidden="true"/>
                </button>
                <p className="cham-access-guest-note">Đăng nhập để cấp mã QR và lưu kết quả thật. Chế độ trải nghiệm chỉ lưu trên thiết bị này.</p>
                {staffBusy && <p role="status" className="cham-access-status">Đang xử lý đăng nhập…</p>}
                {loginError && <p role="alert" className="cham-access-error">{loginError}</p>}
                <button type="button" className="cham-access-back" onClick={onBack}><ArrowLeft size={19}/> Chọn vai trò khác</button>
              </>}
            </div>
          </main>}
        </div>
        {view === 'student' && !guestMode && qrOpen && <StudentQrScanner onClose={() => setQrOpen(false)} onVerifiedCode={onScanCode}/>}
      </section>
    </div>
  );
};
