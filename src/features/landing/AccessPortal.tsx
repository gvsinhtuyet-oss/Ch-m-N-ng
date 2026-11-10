import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, Compass, Eye, EyeOff, GraduationCap, KeyRound, LockKeyhole, QrCode, X } from 'lucide-react';
import { GoogleTeacherLogin } from '../../components/auth/GoogleTeacherLogin';
import type { StaffUser } from '../../services/AuthService';
import './access-portal.css';

interface Props {
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
  onStudentGuest: () => void;
  onStudentGrade: (grade: number) => void;
  onStudentSubmit: () => void;
  onSavedCode: () => void;
  onTeacherDemo: () => void;
  onStaffLogin: (event: React.FormEvent<HTMLFormElement>) => void;
  onRestoreStaff: () => void;
  onGoogleLogin: (user: StaffUser) => void;
}
const logo = '/images/landing/cham-approved-logo.webp';
const students = '/images/landing/cham-access-students.webp';
const teacher = '/images/landing/cham-access-teacher.webp';
const grades = [1, 2, 3, 4, 5];

export const AccessPortal: React.FC<Props> = ({
  view, guestMode, chosenGrade, roleBackground, themeBlur,
  restoreCode, onRestoreCodeChange, savedSyncCode, restoreBusy,
  staffBusy, staffEmail, staffPassword, onStaffEmailChange,
  onStaffPasswordChange, loginError, onClose, onBack, onStudent,
  onTeacher, onStudentGuest, onStudentGrade, onStudentSubmit,
  onSavedCode, onTeacherDemo, onStaffLogin, onRestoreStaff,
  onGoogleLogin,
}) => {
  const [accountExpanded, setAccountExpanded] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [qrHelp, setQrHelp] = useState(false);

  const [mobileReveal, setMobileReveal] = useState(false);
  const art = view === 'role' ? '/images/landing/approved-access-role.png' : view === 'student' ? '/images/landing/approved-access-student.png' : '/images/landing/approved-access-teacher.png';
  const qrInstructions = 'Dùng camera điện thoại quét thẻ QR do cô thầy cấp, sau đó bấm đường dẫn CHẠM ĐÀ NẴNG để vào học. Không cần cài ứng dụng.';
  const hotspot = (kind: string, title: string, callback: () => void, disabled = false) =>
    <button type="button" className={`cham-art-hit cham-art-${kind}`} aria-label={title} title={title} onClick={callback} disabled={disabled}><span className="sr-only">{title}</span></button>;

  return (
    <div className="cham-access-overlay" data-screen={view}>
      <div className="cham-art-mobile">
        <div className={`cham-art-canvas cham-art-screen-${view}`} style={{aspectRatio: view==='student'?'941 / 1670':'1086 / 1448'}}>
          <img src={art} className="cham-art-picture" alt={view==='role'?'CHẠM ĐÀ NẴNG – Chọn vai trò Học sinh hoặc Giáo viên':view==='student'?'Học sinh – Chào Nhà phiêu lưu!':'Giáo viên – Chào thầy cô!'} draggable={false}/>
          {view === 'role' && <>
            {hotspot('choose-student','Chọn vai trò Học sinh',onStudent)}
            {hotspot('choose-teacher','Chọn vai trò Giáo viên',onTeacher)}
          </>}
          {view === 'student' && <>
            {!guestMode ? <>
              <label htmlFor="cham-art-student-code" className="sr-only">Mã học sinh</label>
              <input id="cham-art-student-code" className="cham-art-text cham-art-student-code" type={mobileReveal?'text':'password'} value={restoreCode} onChange={event=>onRestoreCodeChange(event.target.value)} spellCheck={false} autoComplete="off" maxLength={20} placeholder="Nhập mã do thầy cô cấp..." onKeyDown={event=>{if(event.key==='Enter'&&restoreCode.trim())onStudentSubmit();}}/>
              {hotspot('eye','Hiện hoặc ẩn mã học sinh',()=>setMobileReveal(!mobileReveal))}
              {hotspot('qr','Hướng dẫn vào học bằng mã QR',()=>setQrHelp(!qrHelp))}
              {hotspot('begin','Bắt đầu khám phá bằng mã học sinh',onStudentSubmit,restoreBusy||!restoreCode.trim())}
              {hotspot('free','Khám phá tự do',onStudentGuest)}
              {hotspot('back-student','Chọn vai trò khác',onBack)}
              {qrHelp&&<div className="cham-art-popover" role="note"><button aria-label="Đóng hướng dẫn QR" type="button" onClick={()=>setQrHelp(false)}><X size={18}/></button><strong>Vào học bằng mã QR</strong><p>{qrInstructions}</p></div>}
            </> : <div className="cham-art-grade-modal" role="group" aria-label="Chọn khối lớp khám phá tự do"><strong>Em chọn khối lớp để khám phá nhé!</strong><div>{grades.map(grade=><button key={grade} type="button" onClick={()=>onStudentGrade(grade)} disabled={restoreBusy}>Khối {grade}</button>)}</div><button type="button" onClick={onStudent}>Trở lại nhập mã</button></div>}
          </>}
          {view === 'teacher' && <>
            <div className="cham-art-google"><GoogleTeacherLogin onLogin={onGoogleLogin}/></div>
            <label htmlFor="cham-art-teacher-email" className="sr-only">Email giáo viên</label>
            <input id="cham-art-teacher-email" className="cham-art-text cham-art-teacher-email" type="email" autoComplete="username" value={staffEmail} onChange={e=>onStaffEmailChange(e.target.value)} placeholder="Email"/>
            <label htmlFor="cham-art-teacher-password" className="sr-only">Mật khẩu giáo viên</label>
            <input id="cham-art-teacher-password" className="cham-art-text cham-art-teacher-password" type={showCode?'text':'password'} autoComplete="current-password" value={staffPassword} onChange={e=>onStaffPasswordChange(e.target.value)} placeholder="Mật khẩu" onKeyDown={e=>{if(e.key==='Enter'&&staffEmail&&staffPassword){e.preventDefault();document.getElementById('cham-art-teacher-submit')?.click();}}}/>
            {hotspot('password-eye','Hiện hoặc ẩn mật khẩu',()=>setShowCode(!showCode))}
            <button id="cham-art-teacher-submit" type="button" className="cham-art-hit cham-art-login" aria-label="Đăng nhập bằng email và mật khẩu" disabled={staffBusy} onClick={()=>{const form=document.getElementById('cham-art-teacher-form') as HTMLFormElement|null;form?.requestSubmit();}}/>
            <form id="cham-art-teacher-form" className="sr-only" onSubmit={onStaffLogin}><button type="submit">Đăng nhập</button></form>
            {hotspot('teacher-free','Giáo viên tự do',onTeacherDemo,staffBusy)}
            {hotspot('back-teacher','Chọn vai trò khác',onBack)}
          </>}
          {loginError&&view!=='role'&&<div className="cham-art-error" role="alert">{loginError}</div>}
        </div>
        <button type="button" className="cham-art-close" onClick={onClose} aria-label="Đóng cửa sổ"><X size={18}/></button>
      </div>
      <div className="cham-access-desktop">

      <img className="cham-access-backdrop" src={roleBackground} alt="" aria-hidden="true" style={{filter:`blur(${Math.min(3,themeBlur)}px)`}} />
      <div className="cham-access-colorveil" aria-hidden="true" />
      <section className="cham-access-sheet" role="dialog" aria-modal="true" aria-label={view === 'role' ? 'Chọn vai trò' : view === 'student' ? 'Đăng nhập học sinh' : 'Đăng nhập giáo viên'}>
        <button type="button" className="cham-access-close" onClick={onClose} aria-label="Đóng cửa sổ"><X size={23} /></button>
        <div className="cham-access-content">
          <header className="cham-access-masthead">
            <img className="cham-access-logo" src={logo} alt="CHẠM ĐÀ NẴNG" width={245} height={95} />
            <p className="cham-access-tagline">Hành trình số khám phá quê hương</p>
          </header>

          {view === 'role' ? (
            <div className="cham-access-role-content">
              <h1>Chào mừng bạn đến với<br /><strong>CHẠM ĐÀ NẴNG!</strong></h1>
              <p className="cham-access-subheading">Hãy chọn vai trò để bắt đầu hành trình khám phá nhé!</p>
              <div className="cham-access-roles">
                <button type="button" className="cham-access-role-card student" onClick={onStudent}>
                  <img src={students} alt="" loading="eager" />
                  <span className="cham-access-role-footer"><GraduationCap aria-hidden="true" /><span>Học sinh</span><ArrowRight className="cham-access-arrow" aria-hidden="true" /></span>
                </button>
                <button type="button" className="cham-access-role-card teacher" onClick={onTeacher}>
                  <img src={teacher} alt="" loading="eager" />
                  <span className="cham-access-role-footer"><BookOpen aria-hidden="true" /><span>Giáo viên</span><ArrowRight className="cham-access-arrow" aria-hidden="true" /></span>
                </button>
              </div>
            </div>
          ) : (
            <div className="cham-access-step-layout">
              <aside className="cham-access-hero" aria-hidden="true">
                <img className="cham-access-hero-picture" src={view === 'student' ? students : teacher} alt="" />
                <div className="cham-access-hero-caption">{view === 'student' ? 'Khám phá quê hương qua từng điểm chạm!' : 'Dạy học sáng tạo – kết nối yêu thương!'}</div>
              </aside>

              <div className="cham-access-form-card">
                {view === 'student' ? (
                  <>
                    <div className="cham-access-card-title">
                      <span className="cham-access-title-icon"><GraduationCap size={25} /></span>
                      <h1>{guestMode ? 'Chọn khối lớp của em!' : 'Chào nhà khám phá nhỏ!'}</h1>
                    </div>
                    <p className="cham-access-description">{guestMode ? 'Em muốn bắt đầu hành trình ở khối nào?' : 'Nhập mã cô thầy cấp để bắt đầu chuyến phiêu lưu nhé!'}</p>
                    {guestMode ? (
                      <div className="cham-access-grade-grid" role="group" aria-label="Chọn khối lớp">
                        {grades.map(grade => <button type="button" key={grade} disabled={restoreBusy} onClick={()=>onStudentGrade(grade)} aria-pressed={chosenGrade===grade}>Khối {grade}</button>)}
                      </div>
                    ) : (
                      <>
                        <label htmlFor="cham-access-student-code" className="cham-access-label"><KeyRound size={17}/> Mã học sinh của em</label>
                        <div className="cham-access-code-row">
                          <input id="cham-access-student-code" type={showCode ? 'text' : 'password'} inputMode="text" autoComplete="off" spellCheck={false} value={restoreCode} onChange={e=>onRestoreCodeChange(e.target.value)} maxLength={20} placeholder="Nhập mã do thầy cô cấp…" onKeyDown={event=>{if(event.key==='Enter' && restoreCode.trim()){event.preventDefault();onStudentSubmit();}}} />
                          <button type="button" onClick={()=>setShowCode(show=>!show)} aria-label={showCode?'Ẩn mã học sinh':'Hiện mã học sinh'} title={showCode?'Ẩn mã':'Hiện mã'}>{showCode?<EyeOff size={20}/>:<Eye size={20}/>}</button>
                        </div>
                        <button className="cham-access-primary" type="button" disabled={restoreBusy || !restoreCode.trim()} onClick={onStudentSubmit}>
                          {restoreBusy?'Đang mở hồ sơ…':'BẮT ĐẦU KHÁM PHÁ'}<ArrowRight aria-hidden="true" size={20}/>
                        </button>
                        <div className="cham-access-student-secondary">
                          {savedSyncCode && <button type="button" onClick={onSavedCode}><Check size={18} aria-hidden="true"/> Dùng mã đã lưu</button>}
                          <button type="button" onClick={onStudentGuest}><Compass size={18} aria-hidden="true"/> Khám phá tự do</button>
                        </div>
                        <button type="button" className="cham-access-qr-help" onClick={()=>setQrHelp(value=>!value)} aria-expanded={qrHelp}><QrCode size={17} aria-hidden="true"/> {qrHelp?'Ẩn hướng dẫn mã QR':'Em có thẻ QR? Xem cách vào học'}</button>
                        {qrHelp && <p className="cham-access-qr-tip">Dùng camera điện thoại quét thẻ QR do cô thầy cấp, rồi mở đường dẫn CHẠM ĐÀ NẴNG. Không cần cài ứng dụng.</p>}
                        <p className="cham-access-hint">Chưa có mã? Nhờ cô thầy cấp mã trong “Lớp của tôi”.</p>
                      </>
                    )}
                    {loginError && <p className="cham-access-error" role="alert">{loginError}</p>}
                    <button type="button" className="cham-access-back" onClick={guestMode?onStudent:onBack}><ArrowLeft size={18}/>{guestMode?'Nhập mã học sinh':'Chọn vai trò khác'}</button>
                  </>
                ) : (
                  <>
                    <div className="cham-access-card-title">
                      <span className="cham-access-title-icon"><GraduationCap size={25} /></span>
                      <h1>Chào mừng thầy cô!</h1>
                    </div>
                    <p className="cham-access-description">Không gian dạy học và khám phá Giáo dục địa phương</p>
                    <div className="cham-access-google"><GoogleTeacherLogin onLogin={onGoogleLogin}/></div>
                    <button type="button" className="cham-access-account-trigger" onClick={()=>setAccountExpanded(open=>!open)} aria-expanded={accountExpanded}><LockKeyhole size={19}/> Đăng nhập bằng tài khoản<ArrowRight size={18}/></button>
                    {accountExpanded && <form className="cham-access-account-form" onSubmit={onStaffLogin}>
                      <label>Email<input type="email" autoComplete="username" required maxLength={254} value={staffEmail} onChange={event=>onStaffEmailChange(event.target.value)} /></label>
                      <label>Mật khẩu<input type="password" autoComplete="current-password" required maxLength={128} value={staffPassword} onChange={event=>onStaffPasswordChange(event.target.value)} /></label>
                      <button type="submit" disabled={staffBusy}>{staffBusy?'Đang đăng nhập…':'Đăng nhập'}</button>
                      <button type="button" onClick={onRestoreStaff} disabled={staffBusy}>Tiếp tục phiên đã đăng nhập</button>
                      <p>Quên mật khẩu? Liên hệ quản trị để được hỗ trợ.</p>
                    </form>}
                    <div className="cham-access-or"><span>HOẶC</span></div>
                    <button type="button" className="cham-access-teacher-guest" disabled={staffBusy} onClick={onTeacherDemo}><BookOpen size={25}/><span><strong>Giáo viên tự do</strong><small>Trải nghiệm học liệu không cần tài khoản</small></span><ArrowRight size={20}/></button>
                    <p className="cham-access-guest-note">Để tạo lớp, cấp mã và xem kết quả thực tế, thầy cô cần đăng nhập.</p>
                    {loginError && <p className="cham-access-error" role="alert">{loginError}</p>}
                    <button type="button" className="cham-access-back" onClick={onBack}><ArrowLeft size={18}/> Chọn vai trò khác</button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
      </div>
    </div>
  );
};
