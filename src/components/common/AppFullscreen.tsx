import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

const FullscreenContext = createContext<{ active: boolean; toggle: () => void } | null>(null);

export function AppFullscreenProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(false);
  const [notice, setNotice] = useState('');
  const pending = useRef(false);

  useEffect(() => {
    const sync = () => setActive(document.fullscreenElement === document.documentElement);
    sync();
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  async function toggle() {
    if (pending.current) return;
    pending.current = true;
    setNotice('');
    const root = document.documentElement;
    try {
      if (document.fullscreenElement === root) await document.exitFullscreen();
      else if (document.fullscreenEnabled && root.requestFullscreen) await root.requestFullscreen();
      else throw new Error('Fullscreen unavailable');
    } catch {
      setNotice(/iPhone/.test(navigator.userAgent)
        ? 'Để mở rộng ứng dụng trên iPhone, dùng Safari: Thêm vào màn hình chính rồi chọn Mở dưới dạng ứng dụng web nếu có.'
        : 'Trình duyệt hiện không cho bật hoặc thoát toàn màn hình. Em vẫn có thể tiếp tục sử dụng ứng dụng.');
    } finally {
      pending.current = false;
      setActive(document.fullscreenElement === root);
    }
  }

  return (
    <FullscreenContext.Provider value={{ active, toggle }}>
      {children}
      {notice && (
        <div className="fixed inset-x-3 bottom-4 z-[11000] mx-auto flex max-w-md items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 shadow-lg">
          <p role="status" className="flex-1">{notice}</p>
          <button type="button" className="min-h-10 rounded-lg px-2 font-bold hover:bg-amber-100" onClick={() => setNotice('')}>Đóng</button>
        </div>
      )}
    </FullscreenContext.Provider>
  );
}

export function AppFullscreenButton({ className, iconOnly = false }: { className?: string; iconOnly?: boolean }) {
  const mode = useContext(FullscreenContext);
  if (!mode) return null;
  const label = mode.active ? 'Thoát toàn màn hình' : 'Toàn màn hình';
  const Icon = mode.active ? Minimize2 : Maximize2;
  return (
    <button type="button" className={className} onClick={mode.toggle} aria-label={label} title={label}>
      <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
      {!iconOnly && <span>{label}</span>}
    </button>
  );
}
