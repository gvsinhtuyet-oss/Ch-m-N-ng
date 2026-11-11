import React, { useEffect, useState } from 'react';
import { AccessPortal } from './AccessPortal';
import { GoogleTeacherLogin } from '../../components/auth/GoogleTeacherLogin';
import './approved-mobile-access.css';

type Props = React.ComponentProps<typeof AccessPortal>;
const assets = {
  role: '/images/landing/approved-mobile/role.webp',
  student: '/images/landing/approved-mobile/student.webp',
  teacher: '/images/landing/approved-mobile/teacher.webp',
};

export const ResponsiveAccessPortal: React.FC<Props> = (props) => {
  const [portrait, setPortrait] = useState(() =>
    window.matchMedia('(max-width: 1023px) and (orientation: portrait)').matches
  );
  useEffect(() => {
    const media = window.matchMedia('(max-width: 1023px) and (orientation: portrait)');
    const update = () => setPortrait(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  if (!portrait) return <AccessPortal {...props} />;
  return <ApprovedMobileAccessPortal {...props} />;
};

const ApprovedMobileAccessPortal: React.FC<Props> = (p) => {
  const [showPassword, setShowPassword] = useState(false);
  const [qrHelp, setQrHelp] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const back = p.guestMode ? p.onStudent : p.onBack;
  return (
    <div className="approved-mobile-portal" role="dialog" aria-modal="true" aria-label={p.view === 'role' ? 'Chọn vai trò' : p.view === 'student' ? 'Đăng nhập học sinh' : 'Đăng nhập giáo viên'}>
      <div className="approved-mobile-stage" data-screen={p.view}>
        <img className="approved-mobile-art" src={assets[p.view]} alt="" aria-hidden="true" draggable={false} />
        <button type="button" className="approved-mobile-dismiss" aria-label="Đóng và trở về trang bìa" onClick={p.onClose}>×</button>
        {p.view === 'role' && <>
          <button className="approved-hotspot role-student" onClick={p.onStudent} aria-label="Chọn vai trò học sinh" />
          <button className="approved-hotspot role-teacher" onClick={p.onTeacher} aria-label="Chọn vai trò giáo viên" />
        </>}
        {p.view === 'student' && <>
          {!p.guestMode ? <>
            <label htmlFor="approved-student-code" className="sr-only">Mã học sinh</label>
            <input id="approved-student-code" className="approved-mobile-input student-code" autoComplete="off" spellCheck={false} maxLength={20} value={p.restoreCode} placeholder="Nhập mã do thầy cô cấp…" onChange={e=>p.onRestoreCodeChange(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')p.onStudentSubmit();}} />
            <button className="approved-hotspot student-qr" type="button" aria-label="Hướng dẫn quét mã QR" onClick={()=>setQrHelp(v=>!v)} />
            <button className="approved-hotspot student-start" type="button" aria-label="Bắt đầu khám phá bằng mã học sinh" disabled={p.restoreBusy || !p.restoreCode.trim()} onClick={p.onStudentSubmit} />
            <button className="approved-hotspot student-guest" type="button" aria-label="Khám phá tự do" onClick={p.onStudentGuest} />
            {qrHelp && <div className="approved-mobile-notice student-notice" role="status"><button type="button" onClick={()=>setQrHelp(false)} aria-label="Đóng">×</button>Dùng camera điện thoại quét mã QR do giáo viên cấp, sau đó mở liên kết. Không cần cài ứng dụng.</div>}
          </> : <div className="approved-mobile-selector"><strong>Em muốn khám phá khối nào?</strong><div>{[1,2,3,4,5].map(g=><button key={g} type="button" disabled={p.restoreBusy} onClick={()=>p.onStudentGrade(g)}>Khối {g}</button>)}</div></div>}
          {p.restoreBusy && <div className="approved-mobile-status" role="status">Đang mở hồ sơ học sinh…</div>}
          {p.loginError && <div className="approved-mobile-error" role="alert">{p.loginError}</div>}
          <button className="approved-hotspot student-back" type="button" aria-label={p.guestMode?'Quay lại nhập mã học sinh':'Chọn vai trò khác'} onClick={back} />
        </>}
        {p.view === 'teacher' && <>
          <div className="approved-mobile-google"><GoogleTeacherLogin onLogin={p.onGoogleLogin}/></div>
          <button type="button" className="approved-hotspot teacher-expand" onClick={()=>setAccountOpen(v=>!v)} aria-label="Đăng nhập bằng tài khoản" aria-expanded={accountOpen} />
          <form className="approved-mobile-credentials" onSubmit={p.onStaffLogin}>
            <label className="sr-only" htmlFor="approved-staff-email">Email</label>
            <input id="approved-staff-email" type="email" placeholder="Email" autoComplete="username" required maxLength={254} value={p.staffEmail} onChange={e=>p.onStaffEmailChange(e.target.value)} />
            <label className="sr-only" htmlFor="approved-staff-password">Mật khẩu</label>
            <input id="approved-staff-password" type={showPassword?'text':'password'} placeholder="Mật khẩu" autoComplete="current-password" required maxLength={128} value={p.staffPassword} onChange={e=>p.onStaffPasswordChange(e.target.value)} />
            <button className="approved-mobile-eye" type="button" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?'Ẩn mật khẩu':'Hiện mật khẩu'} />
            <button className="approved-mobile-account-submit" type="submit" disabled={p.staffBusy} aria-label="Đăng nhập bằng email và mật khẩu" title="Đăng nhập" />
          </form>
          {accountOpen && <div className="approved-mobile-notice teacher-notice" role="status"><button type="button" aria-label="Đóng" onClick={()=>setAccountOpen(false)}>×</button>Nhập email và mật khẩu, sau đó chạm mũi tên tròn ở góc phải của khung tài khoản để đăng nhập. Quên mật khẩu? Hãy liên hệ quản trị.</div>}
          <button type="button" className="approved-hotspot teacher-free" disabled={p.staffBusy} aria-label="Giáo viên tự do" onClick={p.onTeacherDemo} />
          <button type="button" className="approved-hotspot teacher-back" aria-label="Chọn vai trò khác" onClick={p.onBack} />
          {p.staffBusy && <div className="approved-mobile-status" role="status">Đang xử lý đăng nhập…</div>}
          {p.loginError && <div className="approved-mobile-error" role="alert">{p.loginError}</div>}
        </>}
      </div>
    </div>
  );
};