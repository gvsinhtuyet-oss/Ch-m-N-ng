import {useEffect, useState} from 'react';
import {OFFICIAL_25_CATALOG} from '../../data/curriculumCatalog';
import {fetchWithTimeout} from '../../services/NetworkService';

type StationStats = {
  stationId: string; audience: number; started: number;
  stage1: number; stage2: number; stage3: number; stage4: number;
};
type Report = {
  start: string; end: string;
  visits: {day: string; audience: number; visits: number}[];
  stations: StationStats[];
};
const number = new Intl.NumberFormat('vi-VN');
const date = (day: string) => day.split('-').reverse().join('/');
const stages = ['stage1', 'stage2', 'stage3', 'stage4'] as const;
const fieldClass = 'block w-full min-w-0 rounded-xl border bg-white px-3 py-2';
const countLabel = (value: number) => number.format(value);
const percent = (completed: number, started: number) => started
  ? `${Math.round(completed / started * 100)}%` : '—';

export function EffectivenessReport({openProgress, openFeedback}: {
  openProgress: () => void; openFeedback: (stationId: string) => void;
}) {
  const [days, setDays] = useState(30);
  const [grade, setGrade] = useState(0);
  const [stationId, setStationId] = useState('');
  const [audience, setAudience] = useState(-1);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [report, setReport] = useState<Report | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setReport(null);
    void (async () => {
      try {
        const response = await fetchWithTimeout('/api/effectiveness?days=' + days, {
          credentials: 'same-origin', cache: 'no-store',
        });
        if (!response.headers.get('content-type')?.includes('application/json')) throw Error('Chưa tải được báo cáo.');
        const data = await response.json();
        if (!response.ok) throw Error(data.error || 'Chưa tải được báo cáo.');
        if (active) setReport(data);
      } catch (failure) {
        if (active) setError((failure as Error).message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {active = false;};
  }, [days, refresh]);

  const catalog = OFFICIAL_25_CATALOG.filter(station => !grade || station.grade === grade);
  const rows = catalog.filter(station => !stationId || station.id === stationId).map(station => {
    const stats = {started: 0, stage1: 0, stage2: 0, stage3: 0, stage4: 0};
    for (const row of report?.stations ?? []) {
      if (row.stationId !== station.id || (audience !== -1 && audience !== row.audience)) continue;
      stats.started += row.started;
      for (const stage of stages) stats[stage] += row[stage];
    }
    return {...station, ...stats};
  });
  const visitsByDay = new Map<string, number>();
  if (report) {
    for (let i = 0; i < days; i++) {
      const day = new Date(Date.parse(report.start) + i * 86400000).toISOString().slice(0, 10);
      visitsByDay.set(day, 0);
    }
    for (const row of report.visits) {
      if (audience === -1 || audience === row.audience) {
        visitsByDay.set(row.day, (visitsByDay.get(row.day) ?? 0) + row.visits);
      }
    }
  }
  const visits = [...visitsByDay.values()];
  const totalVisits = visits.reduce((sum, count) => sum + count, 0);
  const maxVisits = Math.max(1, ...visits);
  const started = rows.reduce((sum, row) => sum + row.started, 0);
  const completed = rows.reduce((sum, row) => sum + row.stage4, 0);
  const sorted = [...rows].sort((a, b) => b.started - a.started);

  function exportStationStats() {
    if (!report) return;
    const csvRows = [
      ['Từ ngày', 'Đến ngày', 'Nhóm', 'Khối', 'Trạm', 'Bắt đầu', 'Chặng 1', 'Chặng 2', 'Chặng 3', 'Đóng dấu'],
      ...sorted.map(row => [report.start, report.end, audience === -1 ? 'Tất cả' : audience === 0 ? 'Khách' : 'Học sinh',
        row.grade, row.titleVi, row.started, row.stage1, row.stage2, row.stage3, row.stage4]),
    ];
    const csv = csvRows.map(row => row.map(value => '"' + String(value).replaceAll('"', '""') + '"').join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF', csv], {type: 'text/csv;charset=utf-8'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'CHAM_DA_NANG_Thong_ke_tram.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function downloadPilot() {
    setDownloading(true);
    setDownloadError('');
    try {
      const {downloadEffectivenessPilot} = await import('./effectivenessPilot');
      await downloadEffectivenessPilot();
    } catch { setDownloadError('Chưa tải được mẫu. Vui lòng thử lại.'); }
    finally {setDownloading(false);}
  }

  return <section className="space-y-5 rounded-3xl border bg-white p-4 sm:p-6">
    <header>
      <h2 className="text-2xl font-black">Báo cáo hiệu quả</h2>
      <p className="mt-1 text-sm text-slate-600">Theo dõi mức sử dụng và tiến độ của khách và học sinh. Báo cáo theo lớp và minh chứng học tập nằm ở cuối trang.</p>
    </header>
    <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
      <label>Thời gian
        <select className={fieldClass} value={days} onChange={event => setDays(Number(event.target.value))}>
          {[7, 30, 90].map(value => <option key={value} value={value}>{value} ngày gần nhất</option>)}
        </select>
      </label>
      <label>Nhóm người dùng
        <select className={fieldClass} value={audience} onChange={event => setAudience(Number(event.target.value))}>
          <option value={-1}>Tất cả</option><option value={0}>Khách</option><option value={1}>Học sinh</option>
        </select>
      </label>
      <label>Khối
        <select className={fieldClass} value={grade} onChange={event => {setGrade(Number(event.target.value));setStationId('');}}>
          <option value={0}>Tất cả khối</option>
          {[1, 2, 3, 4, 5].map(value => <option key={value} value={value}>Khối {value}</option>)}
        </select>
      </label>
      <label>Trạm
        <select className={fieldClass} value={stationId} onChange={event => setStationId(event.target.value)}>
          <option value="">Tất cả trạm</option>
          {catalog.map(station => <option key={station.id} value={station.id}>{station.titleVi}</option>)}
        </select>
      </label>
    </div>
    <button type="button" disabled={loading} onClick={() => setRefresh(value => value + 1)} className="rounded-xl border px-4 py-2 text-sm font-semibold">
      {loading ? 'Đang tải số liệu…' : 'Làm mới số liệu'}
    </button>
    {error && <p role="alert" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{error}</p>}
    {report && <>
      <p className="text-xs text-slate-500">Từ {date(report.start)} đến {date(report.end)} · Giờ Việt Nam</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-2xl bg-sky-50 p-4"><h3 className="font-bold">Lượt truy cập website</h3><p className="text-2xl font-black">{countLabel(totalVisits)}</p><p className="text-xs">Toàn website · Một lượt mỗi phiên được ghi nhận</p></article>
        <article className="rounded-2xl bg-indigo-50 p-4"><h3 className="font-bold">Lượt bắt đầu trạm</h3><p className="text-2xl font-black">{countLabel(started)}</p><p className="text-xs">Một lượt cho mỗi trạm trong một phiên</p></article>
        <article className="rounded-2xl bg-emerald-50 p-4"><h3 className="font-bold">Tỷ lệ đóng dấu</h3><p className="text-2xl font-black">{percent(completed, started)}</p><p className="text-xs">{countLabel(completed)}/{countLabel(started)} lượt{started > 0 && started < 10 ? ' · Dữ liệu còn ít' : ''}</p></article>
      </div>
      {totalVisits > 0 ? <details open className="rounded-xl border p-4">
        <summary className="cursor-pointer font-bold">Lượt truy cập theo ngày</summary>
        <div className="mt-3 grid max-h-56 gap-1.5 overflow-y-auto">
          {[...visitsByDay.entries()].reverse().map(([day, count]) => <div key={day} className="grid grid-cols-[5.5rem_minmax(0,1fr)_3rem] items-center gap-2 text-xs">
            <time dateTime={day}>{date(day)}</time><span className="h-2 rounded bg-slate-100"><span className="block h-full rounded bg-sky-600" style={{width: `${count / maxVisits * 100}%`}} /></span>
            <span className="text-right">{countLabel(count)}</span>
          </div>)}
        </div>
      </details> : <p className="text-sm text-slate-600">Chưa có lượt truy cập được ghi nhận trong khoảng thời gian và nhóm đã chọn.</p>}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-bold">Tiến độ theo trạm</h3>
          <button type="button" className="rounded-lg border px-3 py-2 text-sm font-semibold" onClick={exportStationStats}>Xuất số liệu trạm (.csv)</button>
        </div>
        <p className="text-xs text-slate-600">Các mốc tính trong cùng phiên. Lượt quay lại ở phiên khác được tính riêng. Các trạm được xếp theo số lượt bắt đầu.</p>
        {sorted.map(row => <details key={row.id} className="rounded-xl border p-3">
          <summary className="cursor-pointer">
            <span className="font-semibold">{row.titleVi}</span>
            <span className="block pl-4 text-xs text-slate-600 sm:inline sm:pl-3">Khối {row.grade} · {countLabel(row.stage4)}/{countLabel(row.started)} đóng dấu{row.started > 0 && row.started < 10 ? ' · Dữ liệu còn ít' : ''}</span>
          </summary>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
            {stages.map((stage, index) => <p key={stage} className="rounded-lg bg-slate-50 p-2">Chặng {index + 1} <strong className="block">{countLabel(row[stage])}</strong></p>)}
          </div>
          <button type="button" className="mt-3 text-sm font-semibold text-sky-800 underline" onClick={() => openFeedback(row.id)}>Xem sao và góp ý</button>
        </details>)}
      </div>
    </>}
    <section className="space-y-2 rounded-xl border p-4">
      <h3 className="font-bold">Hiệu quả học sinh và giáo viên</h3>
      <p className="text-sm text-slate-600">Mẫu thí điểm tính điểm trước–sau trên cùng nhóm học sinh và số phút chuẩn bị của giáo viên. Tệp do nhà trường giữ, phần mềm không tải dữ liệu trong tệp lên máy chủ.</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={openProgress} className="rounded-lg border px-3 py-2 text-sm font-semibold">Tiến độ đã đồng bộ theo lớp</button>
        <button type="button" disabled={downloading} onClick={() => void downloadPilot()} className="rounded-lg border px-3 py-2 text-sm font-semibold">{downloading ? 'Đang tạo tệp…' : 'Tải mẫu đo hiệu quả (.xlsx)'}</button>
      </div>
      {downloadError && <p role="alert" className="text-sm text-rose-700">{downloadError}</p>}
    </section>
  </section>;
}
