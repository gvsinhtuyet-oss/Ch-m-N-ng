import { optimizeImage, describeOptimization } from '../../services/ImageOptimizationService';
import React, { useState } from 'react';
import { ThemeSettings, DEFAULT_THEME, readTheme, saveTheme } from '../../services/ThemeService';
import { contentService } from '../../services/ContentService';

type ThemeImageKey =
  | 'coverDesktop' | 'coverMobile'
  | 'roleDesktop' | 'roleMobile'
  | 'journeyDesktop' | 'journeyMobile';

const groups: Array<{
  id: 'cover' | 'role' | 'journey';
  title: string;
  description: string;
  desktop: ThemeImageKey;
  mobile: ThemeImageKey;
}> = [
  {
    id: 'cover',
    title: 'Nền trang bìa',
    description: 'Màn hình giới thiệu CHẠM ĐÀ NẴNG trước khi chọn vai trò.',
    desktop: 'coverDesktop',
    mobile: 'coverMobile',
  },
  {
    id: 'role',
    title: 'Nền chọn vai trò / nhập thông tin',
    description: 'Màn chọn Học sinh, Giáo viên, Quản trị, Khách và phần nhập thông tin. Cùng một nền cho mọi vai trò.',
    desktop: 'roleDesktop',
    mobile: 'roleMobile',
  },
  {
    id: 'journey',
    title: 'Nền phần hành trình',
    description: 'Các màn bên trong app như Hành trình, Hộ chiếu, Bản đồ, học tập, Giáo viên và Quản trị.',
    desktop: 'journeyDesktop',
    mobile: 'journeyMobile',
  },
];

export const ThemeEditor: React.FC<{localOnly?: boolean}> = ({localOnly = false}) => {
  const [draft, setDraft] = useState<ThemeSettings>(readTheme);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (patch: Partial<ThemeSettings>) => setDraft(prev => ({ ...prev, ...patch }));

  const upload = async (file: File | undefined, target: ThemeImageKey) => {
    if (!file) return;
    if (!['image/png','image/jpeg','image/webp','image/gif'].includes(file.type)) {
      setMessage('Chọn ảnh PNG, JPG, WebP hoặc GIF.');
      return;
    }
    setBusy(true);
    try {
      const image = await optimizeImage(file, target.endsWith('Mobile') ? 1080 : 1920, target.endsWith('Mobile') ? 1920 : 1080);
      set({ [target]: image.dataUrl });
      setMessage(describeOptimization(image) + ' Bấm Xem trước để thử nền.');
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const preview = () => {
    try {
      saveTheme(draft, localOnly);
      setMessage(localOnly ? 'Đã lưu giao diện trải nghiệm trên thiết bị này.' : 'Đã áp dụng trên máy này. Xuất bản để mọi thiết bị nhận đủ 3 nhóm nền.');
    } catch {
      setMessage('Bộ nhớ máy đầy. Hãy giảm dung lượng ảnh hoặc xuất bản trực tuyến.');
    }
  };

  const publish = async () => {
    if (localOnly) return;
    setBusy(true);
    setMessage('');
    try {
      await contentService.login();
      await contentService.publishTheme(draft);
      setMessage('Đã xuất bản 3 nhóm nền. Tải lại app trên thiết bị khác để nhận giao diện mới.');
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const imageField = (target: ThemeImageKey, label: string, aspectClass: string) => {
    const value = draft[target];
    return (
      <div className="rounded-2xl bg-white p-4 space-y-3 border border-slate-200">
        <h4 className="font-bold text-sm text-slate-900">{label}</h4>
        <label className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-black text-white shadow-sm transition hover:bg-orange-600 ${busy ? 'pointer-events-none opacity-60' : ''}`}>
          📁 TẢI ẢNH LÊN
          <input
            aria-label={'Tải ' + label}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            disabled={busy}
            className="sr-only"
            onChange={e => {
              void upload(e.target.files?.[0], target);
              e.target.value = '';
            }}
          />
        </label>

        <input
          aria-label={'Đường dẫn ' + label}
          className="w-full border rounded-xl p-3 text-sm"
          placeholder="Hoặc dán đường dẫn HTTPS"
          value={value.startsWith('data:') ? '' : value}
          onChange={e => {
            const next = e.target.value;
            if (!next || /^https:\/\//i.test(next)) set({ [target]: next });
            else setMessage('Đường dẫn ảnh cần bắt đầu bằng HTTPS.');
          }}
        />

        <div className={aspectClass + ' rounded-xl overflow-hidden adventure-preview'}>
          {value && (
            <img
              src={value}
              alt={'Xem trước ' + label}
              className="w-full h-full object-cover"
              style={{ filter: 'blur(' + draft.blur + 'px)', opacity: 1 - draft.lightness }}
            />
          )}
        </div>

        <button
          type="button"
          className="text-red-700 underline text-xs"
          onClick={() => set({ [target]: '' })}
        >
          Dùng nền cơ bản
        </button>
      </div>
    );
  };

  return (
    <section className="max-w-6xl mx-auto rounded-3xl border-2 border-amber-300 bg-amber-50 p-5 sm:p-7 space-y-6">
      <div>
        <h2 className="text-xl font-black text-sky-950">Quản lý hình nền theo từng khu vực</h2>
        <p className="text-sm text-slate-700 mt-1">
          Có 3 nhóm nền riêng: trang bìa, chọn vai trò/nhập thông tin và phần hành trình.
          Trong mỗi nhóm, mọi vai trò dùng chung một nền; chỉ tách máy tính 16:9 và điện thoại 9:16.
        </p>
      </div>

      {groups.map(group => (
        <div key={group.id} className="rounded-3xl border border-amber-200 bg-amber-100/40 p-4 sm:p-5 space-y-4">
          <div>
            <h3 className="font-black text-base text-slate-900">{group.title}</h3>
            <p className="text-xs text-slate-600 mt-0.5">{group.description}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {imageField(group.desktop, 'Máy tính · 16:9', 'aspect-video')}
            {imageField(group.mobile, 'Điện thoại · 9:16', 'aspect-[9/16] max-h-64')}
          </div>
        </div>
      ))}

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block text-sm font-bold rounded-2xl bg-white p-4 border border-slate-200">
          Làm sáng nền: {Math.round(draft.lightness * 100)}%
          <input
            aria-label="Độ sáng nền"
            type="range"
            min="0"
            max=".65"
            step=".05"
            value={draft.lightness}
            onChange={e => set({ lightness: Number(e.target.value) })}
            className="block w-full mt-2"
          />
        </label>

        <label className="block text-sm font-bold rounded-2xl bg-white p-4 border border-slate-200">
          Làm mờ nền: {draft.blur}px
          <input
            aria-label="Độ mờ nền"
            type="range"
            min="0"
            max="6"
            step=".5"
            value={draft.blur}
            onChange={e => set({ blur: Number(e.target.value) })}
            className="block w-full mt-2"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={preview}
          className="rounded-xl bg-sky-700 text-white font-bold px-5 py-3"
        >
          Xem trước và lưu trên máy
        </button>

        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setDraft({ ...DEFAULT_THEME });
            try {
              saveTheme(DEFAULT_THEME, localOnly);
              setMessage('Đã trở về toàn bộ nền cơ bản trên máy này.');
            } catch {}
          }}
          className="rounded-xl bg-slate-200 font-bold px-5 py-3"
        >
          Khôi phục nền cơ bản
        </button>

        {!localOnly && <button
          type="button"
          disabled={busy}
          onClick={() => void publish()}
          className="rounded-xl bg-indigo-700 text-white font-bold px-5 py-3 disabled:opacity-50"
        >
          Xuất bản giao diện
        </button>}
      </div>

      <p className="text-xs text-slate-600">
        Nếu chỉ cài ảnh máy tính hoặc chỉ cài ảnh điện thoại trong một nhóm, app sẽ tự dùng ảnh còn lại làm dự phòng.
        Nếu chưa cài ảnh, app dùng nền mặc định tích hợp sẵn.
      </p>

      {message && (
        <p role="status" className="text-sm font-semibold rounded-xl bg-white p-3">
          {message}
        </p>
      )}
    </section>
  );
};
