
import React, { useState } from 'react';
import { ThemeSettings, DEFAULT_THEME, readTheme, saveTheme } from '../../services/ThemeService';
import { contentService } from '../../services/ContentService';

export const ThemeEditor: React.FC = () => {
  const [draft, setDraft] = useState<ThemeSettings>(readTheme);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (patch: Partial<ThemeSettings>) => setDraft(prev => ({ ...prev, ...patch }));
  const upload = async (file: File | undefined, target: 'desktop' | 'mobile') => {
    if (!file) return;
    if (!['image/png','image/jpeg','image/webp','image/gif'].includes(file.type)) { setMessage('Chọn ảnh PNG, JPG, WebP hoặc GIF.'); return; }
    if (file.size > 4 * 1024 * 1024) { setMessage('Ảnh tối đa 4 MB. Hãy giảm dung lượng hoặc dùng đường dẫn HTTPS.'); return; }
    setBusy(true);
    try {
      const url = await new Promise<string>((resolve,reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Không đọc được ảnh.'));
        reader.readAsDataURL(file);
      });
      set({ [target]: url }); setMessage('Ảnh đã sẵn sàng. Bấm Xem trước để thử nền.');
    } catch (error) { setMessage((error as Error).message); } finally { setBusy(false); }
  };
  const preview = () => {
    try { saveTheme(draft); setMessage('Đã áp dụng trên máy này. Xuất bản để học sinh trên các máy khác thấy nền mới.'); }
    catch { setMessage('Bộ nhớ máy đầy. Hãy giảm dung lượng ảnh hoặc xuất bản trực tuyến.'); }
  };
  const publish = async () => {
    setBusy(true); setMessage('');
    try {
      await contentService.login();
      await contentService.publishTheme(draft);
      setMessage('Đã xuất bản giao diện. Học sinh tải lại app để nhận nền mới.');
    } catch (error) { setMessage((error as Error).message); } finally { setBusy(false); }
  };
  return (
    <section className="max-w-4xl mx-auto rounded-3xl border-2 border-amber-300 bg-amber-50 p-5 sm:p-7 space-y-5">
      <h2 className="text-xl font-black text-sky-950">Ảnh nền toàn màn hình</h2>
      <p className="text-sm text-slate-700">Khi chưa tải ảnh hoặc ảnh không mở được, app dùng nền phiêu lưu mặc định.</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {(['desktop','mobile'] as const).map(target => (
          <div key={target} className="rounded-2xl bg-white p-4 space-y-3">
            <h3 className="font-bold">{target === 'desktop' ? 'Máy tính · 16:9' : 'Điện thoại · 9:16'}</h3>
            <input aria-label={'Tải nền ' + target} type="file" accept="image/png,image/jpeg,image/webp,image/gif" disabled={busy} onChange={e => { void upload(e.target.files?.[0],target); e.target.value = ''; }} />
            <input aria-label={'Đường dẫn nền ' + target} className="w-full border rounded-xl p-3 text-sm" placeholder="Hoặc dán đường dẫn HTTPS" value={draft[target].startsWith('data:') ? '' : draft[target]} onChange={e => {
              const value = e.target.value;
              if (!value || /^https:\/\//i.test(value)) set({ [target]: value });
              else setMessage('Đường dẫn ảnh cần bắt đầu bằng HTTPS.');
            }} />
            <div className={target === 'desktop' ? 'aspect-video rounded-xl overflow-hidden adventure-preview' : 'aspect-[9/16] max-h-64 rounded-xl overflow-hidden adventure-preview'}>
              {draft[target] && <img src={draft[target]} alt="Xem trước nền" className="w-full h-full object-cover" style={{ filter: 'blur(' + draft.blur + 'px)', opacity: 1 - draft.lightness }} />}
            </div>
            <button type="button" className="text-red-700 underline text-xs" onClick={() => set({ [target]: '' })}>Dùng nền cơ bản</button>
          </div>
        ))}
      </div>
      <label className="block text-sm font-bold">Làm sáng nền: {Math.round(draft.lightness * 100)}%
        <input aria-label="Độ sáng nền" type="range" min="0" max=".65" step=".05" value={draft.lightness} onChange={e => set({ lightness: Number(e.target.value) })} className="block w-full" />
      </label>
      <label className="block text-sm font-bold">Làm mờ nền: {draft.blur}px
        <input aria-label="Độ mờ nền" type="range" min="0" max="6" step=".5" value={draft.blur} onChange={e => set({ blur: Number(e.target.value) })} className="block w-full" />
      </label>
      <div className="flex flex-wrap gap-3">
        <button type="button" disabled={busy} onClick={preview} className="rounded-xl bg-sky-700 text-white font-bold px-5 py-3">Xem trước và lưu trên máy</button>
        <button type="button" disabled={busy} onClick={() => { setDraft({ ...DEFAULT_THEME }); try { saveTheme(DEFAULT_THEME); setMessage('Đã trở về nền cơ bản trên máy này.'); } catch {} }} className="rounded-xl bg-slate-200 font-bold px-5 py-3">Khôi phục nền cơ bản</button>
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="button" disabled={busy} onClick={() => void publish()} className="rounded-xl bg-indigo-700 text-white font-bold px-5 py-3 disabled:opacity-50">Xuất bản giao diện</button>
      </div>
      <p className="text-xs text-slate-600">Xuất bản cho mọi thiết bị cần máy chủ kho học liệu được cấu hình. Nếu chỉ có một ảnh, app sẽ dùng ảnh đó trên cả máy tính và điện thoại.</p>
      {message && <p role="status" className="text-sm font-semibold rounded-xl bg-white p-3">{message}</p>}
    </section>
  );
};

