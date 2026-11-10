import React, { useRef, useState } from 'react';
import { Eye, EyeOff, X, MoreHorizontal, ChevronLeft } from 'lucide-react';
import { GoogleTeacherLogin } from '../../components/auth/GoogleTeacherLogin';
import type { AccessPortalProps } from './AccessPortal';

const art = {
  role: '/images/landing/cham-access-approved-role.png',
  student: '/images/landing/cham-access-approved-student.png',
  teacher: '/images/landing/cham-access-approved-teacher.png',
};
const grades = [1, 2, 3, 4, 5];

/**
 * Approved illustration is rendered whole, never cropped.
 * Transparent real controls sit on the matching coordinates, so image text
 * never becomes a fake button. The background cannot scroll on phone/iPad.
 */
export const IllustratedAccessPortal: React.FC<AccessPortalProps> = ({
  view, guestMode, chosenGrade, restoreCode, onRestoreCodeChange, restoreBusy,
  staffBusy, staffEmail, staffPassword, onStaffEmailChange, onStaffPasswordChange,
  loginError, onClose, onBack, onStudent, onTeacher, onStudentGuest,
  onStudentGrade, onStudentSubmit, onTeacherDemo, onStaffLogin,
  onRestoreStaff, onGoogleLogin,
}) => {
  const [qrHelp, setQrHelp] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [showStaffPassword, setShowStaffPassword] = useState(false);
  const [more, setMore] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const image = art[view];
  const modalLabel = view === 'role' ? 'Chọn vai trò' : view === 'student' ? 'Đăng nhập học sinh' : 'Đăng nhập giáo viên';

  return (
    <div className="cham-ill-shell" data-screen={view} data-illustrated="true">
      <div className="cham-ill-ambient" aria-hidden="true" style={{ backgroundImage: `url("${image}")` }} />
      <section className={`cham-access-sheet cham-ill-frame cham-ill-${view}`} role="dialog" aria-modal="true" aria-label={modalLabel}>
        <img className="cham-ill-image" src={image} alt="" aria-hidden="true" draggable={false} />
        <button type="button" className="cham-ill-close" aria-label="Đóng cửa sổ" onClick={onClose}><X size={20} /></button>
        {view === 'role' && <>
          <button type="button" className="cham-access-role-card student cham-ill-hit cham-ill-role-student" onClick={onStudent} aria-label="Học sinh"><span className="sr-only">Học sinh</span></button>
          <button type="button" className="cham-access-role-card teacher cham-ill-hit cham-ill-role-teacher" onClick={onTeacher} aria-label="Giáo viên"><span className="sr-only">Giáo viên</span></button>
        </>}
        {view === 'student' && <>
          <div className="cham-ill-student-field">
            <label className="sr-only" htmlFor="cham-access-student-code">Mã học sinh</label>
            <input
              id="cham-access-student-code"
              type={showCode ? 'text' : 'password'}
              inputMode="text"
              autoComplete="off"
              spellCheck={false}
              maxLength={20}
              value={restoreCode}
              disabled={restoreBusy}
              placeholder="Nhập mã do thầy cô cấp…"
              onChange={event => onRestoreCodeChange(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter' && restoreCode.trim() && !restoreBusy) {
                  event.preventDefault(); onStudentSubmit();
                }
              }}
            />
          </div>
          <button type="button" className="cham-ill-show-code" onClick={() => setShowCode(x => !x)} aria-label={showCode ? 'Ẩn mã học sinh' : 'Hiện mã học sinh'}>{showCode ? <EyeOff size={17}/> : <Eye size={17}/>}</button>
          <button type="button" className="cham-ill-hit cham-ill-qr" aria-label="Vào học bằng mã QR" onClick={() => setQrHelp(true)} />
          <button type="button" className="cham-ill-hit cham-ill-student-start" disabled={restoreBusy || !restoreCode.trim()} onClick={onStudentSubmit} aria-label={restoreBusy ? 'Đang mở hồ sơ' : 'Bắt đầu khám phá'} />
          <div className="cham-access-student-secondary">
            <button type="button" className="cham-ill-hit cham-ill-student-guest" onClick={onStudentGuest} aria-label="Khám phá tự do"/>
          </div>
          <button type="button" className="cham-access-back cham-ill-hit cham-ill-student-back" onClick={guestMode ? onStudent : onBack} aria-label={guestMode ? 'Nhập mã học sinh' : 'Chọn vai trò khác'} />
          {guestMode && (
            <div className="cham-ill-dialog-backdrop">
              <div className="cham-ill-dialog" role="group" aria-label="Chọn khối lớp để khám phá tự do">
                <h2>Em muốn khám phá khối nào?</h2>
                <p>Chọn một khối lớp để bắt đầu nhé!</p>
                <div className="cham-access-grade-grid">
                  {grades.map(grade => (
                    <button type="button" key={grade} disabled={restoreBusy} aria-pressed={chosenGrade === grade} onClick={() => onStudentGrade(grade)}>Khối {grade}</button>
                  ))}
                </div>
                <button type="button" className="cham-ill-dialog-dismiss" onClick={onStudent}>Quay lại nhập mã</button>
              </div>
            </div>
          )}
          {qrHelp && (
            <div className="cham-ill-dialog-backdrop">
              <div className="cham-ill-dialog" role="group" aria-label="Hướng dẫn dùng thẻ QR">
                <h2>Vào học bằng mã QR</h2>
                <p>Mở Camera trên điện thoại hoặc iPad, hướng vào thẻ QR cô thầy cấp, rồi nhấn liên kết CHẠM ĐÀ NẴNG. Hệ thống sẽ điền mã để em xác nhận vào học.</p>
                <button type="button" className="cham-ill-dialog-dismiss" onClick={() => setQrHelp(false)}>Đã hiểu</button>
              </div>
            </div>
          )}
        </>}
        {view === 'teacher' && <>
          <div className="cham-access-google cham-ill-google">
            <GoogleTeacherLogin onLogin={onGoogleLogin} />
          </div>
          <button type="button" className="cham-access-account-trigger cham-ill-hit cham-ill-account-trigger" onClick={() => emailRef.current?.focus()} aria-label="Đăng nhập bằng tài khoản" />
          <form className="cham-ill-teacher-form" onSubmit={onStaffLogin}>
            <label className="sr-only" htmlFor="cham-ill-email">Email</label>
            <input
              ref={emailRef}
              id="cham-ill-email"
              className="cham-ill-email"
              type="email"
              required
              autoComplete="username"
              maxLength={254}
              value={staffEmail}
              placeholder="Email"
              onChange={event => onStaffEmailChange(event.target.value)}
            />
            <label className="sr-only" htmlFor="cham-ill-password">Mật khẩu</label>
            <input
              id="cham-ill-password"
              className="cham-ill-password"
              type={showStaffPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              maxLength={128}
              value={staffPassword}
              placeholder="Mật khẩu"
              onChange={event => onStaffPasswordChange(event.target.value)}
            />
            <button type="submit" className="cham-ill-hit cham-ill-account-submit" aria-label="Đăng nhập tài khoản giáo viên" disabled={staffBusy} />
          </form>
          <button type="button" className="cham-ill-show-password" onClick={() => setShowStaffPassword(x => !x)} aria-label={showStaffPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>{showStaffPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button>
          <button type="button" className="cham-access-teacher-guest cham-ill-hit cham-ill-teacher-guest" disabled={staffBusy} onClick={onTeacherDemo} aria-label="Giáo viên tự do" />
          <button type="button" className="cham-access-back cham-ill-hit cham-ill-teacher-back" onClick={onBack} aria-label="Chọn vai trò khác"/>
          <button type="button" className="cham-ill-more" onClick={() => setMore(x => !x)} aria-label="Tùy chọn tài khoản" aria-expanded={more}><MoreHorizontal size={19}/></button>
          {more && <div className="cham-ill-more-panel">
            <button type="button" onClick={() => { setMore(false); onRestoreStaff(); }}>Tiếp tục phiên đã đăng nhập</button>
            <button type="button" onClick={() => {setMore(false);emailRef.current?.focus();}}>Nhập email và mật khẩu</button>
          </div>}
        </>}
        {loginError && view !== 'role' && (
          <div role="alert" className="cham-ill-error">
            <p>{loginError}</p>
            <button type="button" onClick={onBack} aria-label="Quay lại chọn vai trò"><ChevronLeft size={18} /> Quay lại</button>
          </div>
        )}
      </section>
    </div>
  );
};
