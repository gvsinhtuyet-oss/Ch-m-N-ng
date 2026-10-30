import React from 'react';

type FailureState = { failed: boolean; code: string; detail: string };

export class FeatureLoadBoundary extends React.Component<React.PropsWithChildren<{fallback?:React.ReactNode}>, FailureState> {
  state: FailureState = { failed: false, code: '', detail: '' };

  static getDerivedStateFromError(error: Error): Partial<FailureState> {
    const message = String(error?.message || '');
    const chunkError = /dynamically imported module|failed to fetch|loading chunk|importing a module script/i.test(message);
    const moduleMismatch = /does not provide an export|no matching export|requested module/i.test(message);
    return {
      failed: true,
      code: moduleMismatch ? 'CHAM-MODULE' : chunkError ? 'CHAM-CHUNK' : 'CHAM-RENDER',
      detail: moduleMismatch ? 'Các thành phần ứng dụng đang khác phiên bản. '
        : chunkError ? 'Không tải được thành phần của phiên bản ứng dụng. '
        : 'Một thành phần của màn hình gặp lỗi khi hiển thị. ',
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[CHAM] Feature render failed:', error, info.componentStack);
  }

  private recover = async () => {
    // Clear only generated application assets, never learner profiles or progress.
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.filter(reg => new URL(reg.scope).origin === location.origin).map(reg => reg.unregister()));
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.filter(key => /^(workbox-|cham-|precache)/i.test(key)).map(key => caches.delete(key)));
      }
    } catch (error) { console.warn('[CHAM] Asset cache recovery:', error); }
    // Preserve Preview authentication and deep links while refreshing assets.
    const next = new URL(window.location.href);
    next.searchParams.set('recovery', String(Date.now()));
    window.location.replace(next.href);
  };

  render() {
    if (!this.state.failed) return this.props.children;
    if (this.props.fallback !== undefined) return this.props.fallback;
    return (
      <div role="alert" className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-amber-50 p-6 text-center text-sky-950">
        <h1 className="text-xl font-black">Chưa mở được màn hình này</h1>
        <p className="max-w-prose break-words text-sm">{this.state.detail} Vui lòng thử tải lại. Nếu vẫn lỗi, gửi mã lỗi cho giáo viên để hỗ trợ.</p>
        <p className="rounded-lg bg-white px-3 py-2 text-sm font-bold">Mã lỗi: {this.state.code}</p>
        <button type="button" onClick={() => void this.recover()} className="min-h-11 rounded-xl bg-sky-700 px-6 py-3 font-bold text-white">Khắc phục và tải bản mới</button>
      </div>
    );
  }
}
