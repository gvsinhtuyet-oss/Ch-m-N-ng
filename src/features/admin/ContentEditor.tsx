import { optimizeImage, describeOptimization } from '../../services/ImageOptimizationService';

import React, { useState } from 'react';
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

export const ContentEditor: React.FC = () => {
  const [stationId, setStationId] = useState(ALL_25_STATIONS[0].id);
  const station = ALL_25_STATIONS.find(s => s.id === stationId)!;
  const [draft, setDraft] = useState<StationContent>(() => structuredClone(contentService.get(station)));
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [resourceKind, setResourceKind] = useState<LearningResource['kind']>('document');
  const fieldClass = 'w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900';
  const validLink = (value: string) => !value || /^https:\/\//i.test(value) || /^data:(image\/|application\/pdf|audio\/|video\/)/i.test(value);

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
      throw new Error('Đường dẫn phải bắt đầu bằng HTTPS.');
    if (draft.resources.some(r => !r.title.trim() || !r.url)) throw new Error('Học liệu cần có tên và đường dẫn.');
  };
  const save = async (publish: boolean) => {
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
    <section className="rounded-3xl border-2 border-indigo-200 bg-indigo-50 p-4 sm:p-6 space-y-5">
      <h3 className="font-black text-xl text-indigo-950">Thêm ảnh và học liệu</h3>
      <label className="block font-bold text-sm">Chọn trạm
        <select className={fieldClass} value={stationId} onChange={e => {
          const selected = ALL_25_STATIONS.find(s => s.id === e.target.value)!;
          setStationId(selected.id); setDraft(structuredClone(contentService.get(selected))); setMessage('');
        }} disabled={busy}>
          {ALL_25_STATIONS.map(s => <option key={s.id} value={s.id}>Khối {s.grade} – {s.titleVi}</option>)}
        </select>
      </label>
      <div className="grid sm:grid-cols-2 gap-4">
        {(['cover', 'map'] as const).map(target => {
          const value = target === 'cover' ? draft.coverImage : draft.mapImage;
          return (
            <div key={target} className="rounded-2xl bg-white p-4 space-y-3">
              <h4 className="font-bold">{target === 'cover' ? 'Ảnh bìa trạm' : 'Ảnh bản đồ nhận quà'}</h4>
              <input aria-label={'Tải ' + target} type="file" accept="image/png,image/jpeg,image/webp,image/gif" disabled={busy} onChange={e => { void upload(e.target.files?.[0], target); e.target.value = ''; }} />
              <input aria-label={'Đường dẫn ' + target} className={fieldClass} placeholder="Hoặc dán đường dẫn HTTPS" value={value.startsWith('data:') ? '' : value} onChange={e => setDraft(prev => ({ ...prev, [target === 'cover' ? 'coverImage' : 'mapImage']: e.target.value }))} />
              {value && <img src={value} alt="Xem trước ảnh" className="max-h-48 w-full rounded-xl object-contain" />}
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
      <div className="rounded-2xl bg-white p-4 space-y-3">
        <h4 className="font-bold">Học liệu bổ sung tại Chặng 1</h4>
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
      <div className="flex flex-wrap items-center gap-3">
        <button disabled={busy} type="button" className="rounded-xl bg-slate-700 text-white px-4 py-3 font-bold disabled:opacity-50" onClick={() => void save(false)}>Lưu xem thử trên máy này</button>
        <button disabled={busy} type="button" className="rounded-xl bg-indigo-700 text-white px-4 py-3 font-bold disabled:opacity-50" onClick={() => void save(true)}>{busy ? 'Đang xử lý...' : 'Xuất bản cho học sinh'}</button>
      </div>
      <p className="text-xs text-slate-600">Xuất bản cần kho học liệu trực tuyến đã được cấu hình. Lưu xem thử chỉ áp dụng trên thiết bị này.</p>
      {message && <p role="status" className="rounded-xl bg-white border p-3 text-sm font-semibold">{message}</p>}
    </section>
  );
};

