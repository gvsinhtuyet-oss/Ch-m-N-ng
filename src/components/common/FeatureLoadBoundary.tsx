import React from 'react';

type FailureState = { failed: boolean; code: string; detail: string };

export class FeatureLoadBoundary extends React.Component<React.PropsWithChildren, FailureState> {
  state: FailureState = { failed: false, code: '', detail: '' };

  static getDerivedStateFromError(error: Error): Partial<FailureState> {
    const message = String(error?.message || '');
    const chunkError = /dynamically imported module|failed to fetch|loading chunk|importing a module script/i.test(message);
    return {
      failed: true,
      code: chunkError ? 'CHAM-CHUNK' : 'CHAM-RENDER',
      detail: chunkError ? 'Không tải được thành phần của phiên bản ứng dụng.' : 'Một thành phần của màn hình gặp lỗi khi hiển thị.',
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[CHAM] Feature render failed:', error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-amber-50 p-6 text-center text-sky-950">
        <h1 className="text-xl font-black">Chưa mở được màn hình này</h1>
        <p>{this.state.detail} Vui lòng thử tải lại. Nếu vẫn lỗi, gửi mã lỗi cho giáo viên để hỗ trợ.</p>
        <p className="rounded-lg bg-white px-3 py-2 text-sm font-bold">Mã lỗi: {this.state.code}</p>
        <button type="button" onClick={() => window.location.reload()} className="min-h-11 rounded-xl bg-sky-700 px-6 py-3 font-bold text-white">Tải lại ứng dụng</button>
      </div>
    );
  }
}
