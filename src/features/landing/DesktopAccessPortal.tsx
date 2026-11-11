import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, X } from 'lucide-react';
import { GoogleTeacherLogin } from '../../components/auth/GoogleTeacherLogin';
import type { AccessPortalProps } from './AccessPortal';
import './desktop-access.css';

const backgrounds = {
  role: '/images/landing/cham-da-nang-pc-chon-vai-tro-2026.png',
  student: '/images/landing/cham-da-nang-pc-hoc-sinh-2026.png',
  teacher: '/images/landing/cham-da-nang-pc-giao-vien-2026.png',
} as const;

/**
 * Full-screen desktop access experience. Approved artwork is purely visual:
 * every button and input below is a real HTML control wired to existing auth.
 * This does not replace the original mobile/iPad access flow.
 */
export const DesktopAccessPortal: React.FC<AccessPortalProps> = (p) => {
  const [showCode, setShowCode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const view = p.view;

  return <div className="desktop-art-overlay" data-screen={view}>
    <section className="desktop-art-board" role="dialog" aria-modal="true"
      aria-label={view === 'role' ? 'Chọn vai trò' : view === 'student' ? 'Đăng nhập học sinh' : 'Đăng nhập giáo viên'}>
      <img className="desktop-art-image" src={backgrounds[view]} alt="" aria-hidden="true" draggable={false} />
      <button type="button" className="desktop-art-close" onClick={p.onClose} aria-label="Đóng cửa sổ"><X size={22}/></button>

      {view === 'role' && <>
        <button type="button" className="desktop-art-hit desktop-art-role-student" onClick={p.onStudent} aria-label="Chọn vai trò Học sinh"><span className="desktop-art-sr">Học sinh</span></button>
        <button type="button" className="desktop-art-hit desktop-art-role-teacher" onClick={p.onTeacher} aria-label="Chọn vai trò Giáo viên"><span className="desktop-art-sr">Giáo viên</span></button>
      </>}

      {view === 'student' && (p.guestMode ? <>
        <div className="desktop-art-modal-backdrop" aria-hidden="true" />
        <div className="desktop-art-grade-modal" role="group" aria-label="Chọn khối lớp để khám phá tự do">
          <h2>Chọn khối lớp của em!</h2>
          <p>Em muốn bắt đầu hành trình ở khối nào?</p>
          <div className="desktop-art-grades">
            {[1, 2, 3, 4, 5].map(grade =>
              <button type="button" key={grade} onClick={() => p.onStudentGrade(grade)} disabled={p.restoreBusy}
                aria-pressed={p.chosenGrade === grade}>Khối {grade}</button>
            )}
          </div>
          <button className="desktop-art-modal-back" type="button" onClick={p.onStudent}><ArrowLeft size={18}/> Quay lại nhập mã</button>
          {p.loginError && <p role="alert" className="desktop-art-modal-error">{p.loginError}</p>}
        </div>
      </> : <>
        <div className="desktop-art-student-code">
          <label htmlFor="desktop-art-student-code" className="desktop-art-sr">Mã học sinh do thầy cô cấp</label>
          <input id="desktop-art-student-code" type={showCode ? 'text' : 'password'}
            autoComplete="off" spellCheck={false} maxLength={20} inputMode="text"
            value={p.restoreCode} onChange={event => p.onRestoreCodeChange(event.target.value)}
            placeholder="Nhập mã do thầy cô cấp…"
            onKeyDown={event => { if (event.key === 'Enter' && p.restoreCode.trim()) { event.preventDefault(); p.onStudentSubmit(); } }}/>
          <button type="button" onClick={() => setShowCode(value => !value)}
            aria-label={showCode ? 'Ẩn mã học sinh' : 'Hiện mã học sinh'}>
            {showCode ? <EyeOff size={21}/> : <Eye size={21}/>}
          </button>
        </div>
        <button type="button" className="desktop-art-hit desktop-art-student-start"
          aria-label={p.restoreBusy ? 'Đang mở hồ sơ' : 'Bắt đầu khám phá bằng mã học sinh'}
          disabled={p.restoreBusy || !p.restoreCode.trim()} onClick={p.onStudentSubmit}>
          <span className="desktop-art-sr">Bắt đầu khám phá</span>
        </button>
        <button type="button" className="desktop-art-hit desktop-art-student-guest" onClick={p.onStudentGuest} aria-label="Khám phá tự do">
          <span className="desktop-art-sr">Khám phá tự do</span>
        </button>
        <button type="button" className="desktop-art-hit desktop-art-student-back" onClick={p.onBack} aria-label="Chọn vai trò khác">
          <span className="desktop-art-sr">Chọn vai trò khác</span>
        </button>
        {p.loginError && <div role="alert" className="desktop-art-error desktop-art-student-error">{p.loginError}</div>}
      </>)}

      {view === 'teacher' && <>
        <div className="desktop-art-google">
          <GoogleTeacherLogin onLogin={p.onGoogleLogin}/>
        </div>
        <form className="desktop-art-teacher-form" onSubmit={p.onStaffLogin}>
          <label className="desktop-art-teacher-email">
            <span className="desktop-art-sr">Email giáo viên</span>
            <input type="email" value={p.staffEmail} onChange={e => p.onStaffEmailChange(e.target.value)}
              autoComplete="username" placeholder="Email" maxLength={254} required/>
          </label>
          <label className="desktop-art-teacher-password">
            <span className="desktop-art-sr">Mật khẩu</span>
            <input type={showPassword ? 'text' : 'password'} value={p.staffPassword}
              onChange={e => p.onStaffPasswordChange(e.target.value)} autoComplete="current-password"
              placeholder="Mật khẩu" maxLength={128} required/>
            <button type="button" aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              onClick={() => setShowPassword(value => !value)}>
              {showPassword ? <EyeOff size={21}/> : <Eye size={21}/>}
            </button>
          </label>
          <button type="submit" className="desktop-art-hit desktop-art-teacher-login" disabled={p.staffBusy}
            aria-label="Đăng nhập tài khoản giáo viên"><span className="desktop-art-sr">Đăng nhập</span></button>
        </form>
        <button type="button" className="desktop-art-hit desktop-art-teacher-guest"
          disabled={p.staffBusy} onClick={p.onTeacherDemo} aria-label="Giáo viên tự do">
          <span className="desktop-art-sr">Giáo viên tự do</span>
        </button>
        <button type="button" className="desktop-art-hit desktop-art-teacher-back"
          onClick={p.onBack} aria-label="Chọn vai trò khác"><span className="desktop-art-sr">Chọn vai trò khác</span></button>
        {p.loginError && <div role="alert" className="desktop-art-error desktop-art-teacher-error">{p.loginError}</div>}
      </>}
    </section>
  </div>;
};
