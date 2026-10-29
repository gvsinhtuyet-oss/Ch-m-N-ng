import React from 'react';

// A feature not previously opened may be unavailable offline. Keep a useful
// recovery screen instead of letting a failed dynamic import blank the app.
export class FeatureLoadBoundary extends React.Component<React.PropsWithChildren, {failed:boolean}> {
  state = {failed:false};
  static getDerivedStateFromError() { return {failed:true}; }
  componentDidCatch(error: Error, info: React.ErrorInfo) { console.error('[CHAM] Feature render failed:', error, info.componentStack); }
  render() {
    if (this.state.failed) return (
      <div role="alert" className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-4 bg-amber-50 p-6 text-center text-sky-950">
        <h1 className="text-xl font-black">Chưa mở được màn hình này</h1>
        <p>Hãy kiểm tra kết nối mạng rồi thử tải lại. Ứng dụng gặp lỗi tải dữ liệu hoặc hiển thị. Hãy mở bằng Safari/Chrome và kiểm tra kết nối. Nếu vẫn lỗi, hãy báo giáo viên để kiểm tra.</p>
        <button type="button" onClick={() => window.location.reload()} className="min-h-11 rounded-xl bg-sky-700 px-6 py-3 font-bold text-white">Tải lại ứng dụng</button>
      </div>
    );
    return this.props.children;
  }
}
