import {isBundledAssetUrl} from '../../services/contentAssetUrls';
import { optimizeImage, describeOptimization } from '../../services/ImageOptimizationService';

import React, { useState } from 'react';
import { BookOpen, CloudUpload, Image as ImageIcon, Map as MapIcon, ShieldCheck } from 'lucide-react';
import { ALL_25_STATIONS } from '../../data/allStations';
import { contentService, StationContent, LearningResource } from '../../services/ContentService';

async function readFile(file: File): Promise<string> {
  const allowed = /^(image\/(png|jpeg|webp|gif)|application\/pdf|audio\/(mpeg|mp3|wav|ogg|mp4|x-wav)|video\/(mp4|webm|ogg))$/;
  if (!allowed.test(file.type)) throw new Error('Chọn ảnh PNG/JPG/WebP/GIF, PDF, âm thanh hoặc video MP4/WebM.');
  if (file.size > 4 * 1024 * 1024) throw new Error('Tệp tối đa 4 MB. Với video lớn, hãy dùng đường dẫn HTTPS.');
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Không đọc được tệp.'));
    reader.readAsDataURL(file);
  });
}

export const ContentEditor: React.FC<{localOnly?: boolean}> = ({localOnly = false}) => {
  const [stationId, setStationId] = useState(ALL_25_STATIONS[0].id);
  const station = ALL_25_STATIONS.find(s => s.id === stationId)!;
  const [draft, setDraft] = useState<StationContent>(() => structuredClone(contentService.get(station)));
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [resourceKind, setResourceKind] = useState<LearningResource['kind']>('document');
  const fieldClass = 'staff-field w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900';
  const hasUnsavedChanges = JSON.stringify(draft) !== JSON.stringify(contentService.get(station));
  const validLink = (value: string) => !value || isBundledAssetUrl(value) || /^https:\/\//i.test(value) || /^data:(image\/|application\/pdf|audio\/|video\/)/i.test(value);

  const upload = async (file: File | undefined, target: 'cover' | 'map' | number) => {
    if (!file) return;
    setBusy(true); setMessage('');
    try {
      if (!file.type.startsWith('image/')) throw new Error('Mục này chỉ nhận tệp ảnh.');
      const image = await optimizeImage(file, target === 'cover' ? 1920 : 1280, target === 'cover' ? 1080 : 1280);
      const url = image.dataUrl;
      setMessage(describeOptimization(image));
      setDraft(prev => {
        const next = structuredClone(prev);
        if (target === 'cover') next.coverImage = url;
        else if (target === 'map') next.mapImage = url;
        else next.hotspots[target].image = url;
        return next;
      });
    } catch (e) { setMessage((e as Error).message); } finally { setBusy(false); }
  };
  const validate = () => {
    if (![draft.coverImage, draft.mapImage, ...draft.hotspots.map(h => h.image), ...draft.resources.map(r => r.url)].every(validLink))
      throw new Error('Dùng đường dẫn HTTPS, tệp tải lên hoặc học liệu đóng gói trong app.');
    if (draft.resources.some(r => !r.title.trim() || !r.url)) throw new Error('Học liệu cần có tên và đường dẫn.');
  };
  const save = async (publish: boolean) => {
    if (localOnly && publish) return;
    if (publish && !window.confirm('Xuất bản học liệu sẽ thay đổi nội dung học sinh nhìn thấy. Bạn đã kiểm tra ảnh, điểm chạm và nguồn học liệu, đồng ý xuất bản?')) return;
    setBusy(true); setMessage('');
    try {
      validate();
      if (publish) {
        await contentService.login();
        await contentService.publish(station, draft);
        setMessage('Đã xuất bản. Học sinh tải lại app sẽ thấy nội dung mới.');
      } else {
        contentService.saveLocal(station, draft);
        setMessage('Đã lưu bản xem thử trên máy này. Bấm Xuất bản để chia sẻ cho học sinh.');
      }
    } catch (e) {
      setMessage((e as Error).name === 'QuotaExceededError'
        ? 'Bộ nhớ máy đã đầy. Dùng đường dẫn ảnh hoặc xuất bản vào kho học liệu trực tuyến.'
        : (e as Error).message);
    } finally { setBusy(false); }
  };
  const addResource = (url: string, title: string, kind: LearningResource['kind']) => {
    if (!title.trim() || !url || !validLink(url)) { setMessage('Nhập tên học liệu và đường dẫn HTTPS hợp lệ.'); return; }
    setDraft(prev => ({ ...prev, resources: [...prev.resources, { id: crypto.randomUUID(), title: title.trim(), url, kind }] }));
    setResourceTitle(''); setResourceUrl('');
  };

  return (
    <section className="admin-media-editor space-y-5 rounded-3xl border border-blue-200 bg-blue-50/90 p-4 shadow-sm sm:p-6">
      <div className="admin-media-title flex flex-wrap items-center gap-3 rounded-2xl p-4">
        <span className="admin-media-title-icon"><CloudUpload className="h-6 w-6" aria-hidden="true" /></span>
        <div className="min-w-0 flex-1"><h2 className="text-xl font-black text-blue-950 sm:text-2xl">Thêm ảnh và học liệu</h2>
          <p className="mt-1 text-xs text-slate-700">Quản lý ảnh bìa, bản đồ nhận quà và tài nguyên theo từng trạm.</p></div>
        {hasUnsavedChanges && <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">Chưa lưu</span>}
      </div>
      <label className="block font-bold text-sm text-blue-950">Chọn trạm
        <select className={fieldClass} value={stationId} onChange={e => {
          const selected = ALL_25_STATIONS.find(s => s.id === e.target.value)!;
          if (hasUnsavedChanges && !window.confirm('Thay đổi ở trạm hiện tại chưa được lưu. Chuyển trạm và bỏ thay đổi?')) return;
          setStationId(selected.id); setDraft(structuredClone(contentService.get(selected))); setMessage('');
        }} disabled={busy}>
          {ALL_25_STATIONS.map(s => <option key={s.id} value={s.id}>Khối {s.grade} – {s.titleVi}</option>)}
        </select>
      </label>
      <div className="grid gap-4 lg:grid-cols-2">
        {(['cover', 'map'] as const).map(target => {
          const value = target === 'cover' ? draft.coverImage : draft.mapImage;
          return (
            <div key={target} className="admin-image-card min-w-0 space-y-3 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm sm:p-5">
              <h3 className="flex items-center gap-2 text-base font-bold text-blue-950">
                {target === 'cover' ? <ImageIcon className="h-5 w-5 text-blue-600" /> : <MapIcon className="h-5 w-5 text-blue-600" />}
                {target === 'cover' ? 'Ảnh bìa trạm' : 'Ảnh bản đồ nhận quà'}
              </h3>
              <input className="admin-upload-field block w-full text-sm" aria-label={'Tải ' + target} type="file" accept="image/png,image/jpeg,image/webp,image/gif" disabled={busy} onChange={e => { void upload(e.target.files?.[0], target); e.target.value = ''; }} />
              <input aria-label={'Đường dẫn ' + target} className={fieldClass} placeholder="Hoặc dán đường dẫn HTTPS" value={value.startsWith('data:') ? '' : value} onChange={e => setDraft(prev => ({ ...prev, [target === 'cover' ? 'coverImage' : 'mapImage']: e.target.value }))} />
              {value ? <div className="admin-image-preview flex min-h-36 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50"><img src={value} alt={target === 'cover' ? 'Xem trước ảnh bìa trạm' : 'Xem trước bản đồ nhận quà'} className="max-h-56 w-full object-contain" /></div> : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Chưa có ảnh xem trước.</p>}
              {value && <button type="button" className="text-red-700 text-xs underline" onClick={() => setDraft(prev => ({ ...prev, [target === 'cover' ? 'coverImage' : 'mapImage']: '' }))}>Gỡ ảnh</button>}
            </div>
          );
        })}
      </div>
      {draft.hotspots.map((hotspot, index) => (
        <details key={hotspot.id} className="rounded-2xl bg-white p-4">
          <summary className="font-bold cursor-pointer">Điểm chạm {index + 1}: {hotspot.titleVi}</summary>
          <div className="space-y-3 mt-3">
            <input aria-label="Tên điểm chạm" className={fieldClass} value={hotspot.titleVi} onChange={e => setDraft(prev => ({ ...prev, hotspots: prev.hotspots.map((h,i) => i === index ? { ...h, titleVi: e.target.value } : h) }))} />
            <input aria-label="Tải ảnh điểm chạm" type="file" accept="image/png,image/jpeg,image/webp,image/gif" disabled={busy} onChange={e => { void upload(e.target.files?.[0], index); e.target.value = ''; }} />
            {hotspot.image && <img src={hotspot.image} alt={hotspot.titleVi} className="max-h-40 rounded-xl" />}
            <label className="block text-sm">Đường dẫn ảnh
              <input className={fieldClass} value={hotspot.image.startsWith('data:') ? '' : hotspot.image} placeholder="HTTPS" onChange={e => setDraft(prev => ({ ...prev, hotspots: prev.hotspots.map((h,i) => i === index ? { ...h, image: e.target.value } : h) }))} />
            </label>
            <label className="block text-sm">Nội dung thuyết minh
              <textarea className={fieldClass} rows={5} value={hotspot.narrationVi} onChange={e => setDraft(prev => ({ ...prev, hotspots: prev.hotspots.map((h,i) => i === index ? { ...h, narrationVi: e.target.value } : h) }))} />
            </label>
            <label className="block text-sm">Điều cần nhớ
              <textarea className={fieldClass} value={hotspot.keyFactVi} onChange={e => setDraft(prev => ({ ...prev, hotspots: prev.hotspots.map((h,i) => i === index ? { ...h, keyFactVi: e.target.value } : h) }))} />
            </label>
          </div>
        </details>
      ))}
      <div className="admin-image-card space-y-3 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm sm:p-5">
        <h3 className="flex items-center gap-2 font-bold text-blue-950"><BookOpen className="h-5 w-5 text-blue-600" />Học liệu bổ sung tại Chặng 1</h3>
        <input aria-label="Tên học liệu" className={fieldClass} placeholder="Tên học liệu" value={resourceTitle} onChange={e => setResourceTitle(e.target.value)} />
        <select aria-label="Loại học liệu" className={fieldClass} value={resourceKind} onChange={e => setResourceKind(e.target.value as LearningResource['kind'])}>
          <option value="document">Tài liệu / PDF</option><option value="video">Video</option><option value="audio">Âm thanh</option><option value="image">Ảnh</option>
        </select>
        <input aria-label="Đường dẫn học liệu" className={fieldClass} placeholder="Đường dẫn HTTPS" value={resourceUrl} onChange={e => setResourceUrl(e.target.value)} />
        <button type="button" className="rounded-xl bg-indigo-100 px-4 py-2 font-bold" onClick={() => addResource(resourceUrl, resourceTitle, resourceKind)}>Thêm đường dẫn</button>
        <label className="block text-sm">Hoặc tải tệp (tối đa 4 MB)
          <input disabled={busy} type="file" accept="image/png,image/jpeg,image/webp,image/gif,application/pdf,audio/*,video/mp4,video/webm" onChange={async e => {
            const file = e.target.files?.[0]; e.target.value = ''; if (!file) return;
            setBusy(true);
            try {
              const url = await readFile(file);
              const kind = file.type.startsWith('image/') ? 'image' : file.type.startsWith('audio/') ? 'audio' : file.type.startsWith('video/') ? 'video' : 'document';
              addResource(url, resourceTitle || file.name, kind);
            } catch (error) { setMessage((error as Error).message); } finally { setBusy(false); }
          }} />
        </label>
        {draft.resources.map(resource => <div key={resource.id} className="flex items-center justify-between gap-3 border-t py-2 text-sm">
          <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-sky-800 underline">{resource.title}</a>
          <button type="button" className="text-red-700" onClick={() => setDraft(prev => ({ ...prev, resources: prev.resources.filter(r => r.id !== resource.id) }))}>Gỡ</button>
        </div>)}
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-blue-200 pt-4">
        <button disabled={busy} type="button" className="rounded-xl bg-slate-700 text-white px-4 py-3 font-bold disabled:opacity-50" onClick={() => void save(false)}>Lưu xem thử trên máy này</button>
        {!localOnly && <button disabled={busy} type="button" className="rounded-xl bg-blue-700 text-white px-4 py-3 font-bold disabled:opacity-50" onClick={() => void save(true)}>{busy ? 'Đang xử lý...' : 'Xuất bản cho học sinh'}</button>}
      </div>
      <p className="flex items-start gap-2 text-xs text-slate-600"><ShieldCheck className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />{localOnly ? 'Quản trị trải nghiệm: ảnh và học liệu chỉ lưu trên thiết bị này.' : 'Xuất bản cần kho học liệu trực tuyến đã được cấu hình. Lưu xem thử chỉ áp dụng trên thiết bị này.'}</p>
      {message && <div role="status" aria-live="polite" className="fixed bottom-4 left-4 right-4 z-[100] mx-auto flex max-w-2xl items-start gap-3 rounded-2xl border-2 border-indigo-300 bg-white p-4 text-sm font-bold text-slate-900 shadow-2xl">
        <span className="flex-1">{message}</span>
        <button type="button" aria-label="Đóng thông báo" className="rounded-lg border px-3 py-1 text-slate-700" onClick={() => setMessage('')}>Đóng</button>
      </div>}
    </section>
  );
};

