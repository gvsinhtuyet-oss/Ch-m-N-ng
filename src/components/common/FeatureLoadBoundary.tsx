import React from 'react';

// A feature not previously opened may be unavailable offline. Keep a useful
// recovery screen instead of letting a failed dynamic import blank the app.
export class FeatureLoadBoundary extends React.Component<React.PropsWithChildren, {failed:boolean}> {
  state = {failed:false};
  static getDerivedStateFromError() { return {failed:true}; }
  render() {
    if (this.state.failed) return (
      <div role="alert" className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-4 bg-amber-50 p-6 text-center text-sky-950">
        <h1 className="text-xl font-black">Chưa mở được màn hình này</h1>
        <p>Hãy kiểm tra kết nối mạng rồi thử tải lại. Màn hình chưa từng mở có thể chưa được lưu để dùng ngoại tuyến.</p>
        <button type="button" onClick={() => window.location.reload()} className="min-h-11 rounded-xl bg-sky-700 px-6 py-3 font-bold text-white">Tải lại ứng dụng</button>
      </div>
    );
    return this.props.children;
  }
}
