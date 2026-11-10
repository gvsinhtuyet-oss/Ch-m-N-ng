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
const reportTime = new Intl.DateTimeFormat('vi-VN', {timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit'});
const refreshIntervalMs = 120_000;
// The period starting 01/10/2026 is selectable only while it fits the backend's
// genuine 90-day reporting window. Never invent earlier historical counts.
const octoberStart = Date.UTC(2026, 9, 1);
const vietnamTodayParts = new Intl.DateTimeFormat('en-US', {
  timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit',
}).formatToParts(new Date());
const vietnamDateField=(field:'year'|'month'|'day') =>
  Number(vietnamTodayParts.find(part=>part.type===field)?.value ?? 0);
const daysFromOctober = Math.round((Date.UTC(vietnamDateField('year'),vietnamDateField('month')-1,vietnamDateField('day'))-octoberStart)/86400000)+1;
const showOctoberPeriod=daysFromOctober>=1&&daysFromOctober<=90;

const date = (day: string) => day.split('-').reverse().join('/');
const stages = ['stage1', 'stage2', 'stage3', 'stage4'] as const;
const fieldClass = 'block w-full min-w-0 rounded-xl border bg-white px-3 py-2';
const countLabel = (value: number) => number.format(value);
const percent = (completed: number, started: number) => started
  ? `${Math.round(completed / started * 100)}%` : '—';

/**
 * Draw aggregated visit data returned by /api/effectiveness, never sample data.
 * SVG stays responsive and contains a text equivalent for screen readers.
 */
function VisitTrendChart({entries}: {entries: [string, number][]}) {
  const width = 720;
  const left = 48;
  const right = 22;
  const top = 20;
  const plotHeight = 152;
  const bottom = top + plotHeight;
  const highest = Math.max(1, ...entries.map(([, count]) => count));
  const x = (index: number) => left + index / Math.max(1, entries.length - 1) * (width - left - right);
  const y = (count: number) => bottom - count / highest * plotHeight;
  const points = entries.map(([, count], index) => `${x(index)},${y(count)}`).join(' ');
  const area = entries.length
    ? `M ${x(0)} ${bottom} L ${entries.map(([, count], index) => `${x(index)} ${y(count)}`).join(' L ')} L ${x(entries.length - 1)} ${bottom} Z`
    : '';
  const labelStep = Math.max(1, Math.ceil(entries.length / 6));
  const labelIndices = entries.map((_, index) => index)
    .filter(index => index === 0 || index === entries.length - 1 || index % labelStep === 0);

  return <figure className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-3 sm:p-5">
    <figcaption className="mb-1 flex flex-wrap items-center justify-between gap-2">
      <span className="font-extrabold text-slate-900">Biểu đồ lượt truy cập theo ngày</span>
      <span className="text-xs text-slate-600">Dữ liệu thực · giờ Việt Nam</span>
    </figcaption>
    <svg className="h-auto w-full" viewBox="0 0 720 226" role="img"
      aria-label={`Biểu đồ ${entries.length} ngày, cao nhất ${highest} lượt; tổng lượt theo ngày được ghi trong bảng chi tiết phía dưới.`}>
      <defs>
        <linearGradient id="cham-admin-traffic-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0284c7" stopOpacity=".25"/>
          <stop offset="100%" stopColor="#0284c7" stopOpacity=".02"/>
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map(fraction => {
        const lineY = bottom - plotHeight * fraction;
        return <g key={fraction}>
          <line x1={left} y1={lineY} x2={width - right} y2={lineY} stroke="#cbd5e1" strokeDasharray="4 5" />
          <text x={left - 10} y={lineY + 4} fill="#475569" fontSize="12" textAnchor="end">{Math.round(highest * fraction)}</text>
        </g>;
      })}
      <path d={area} fill="url(#cham-admin-traffic-fill)"/>
      <polyline points={points} fill="none" stroke="#0284c7" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
      {entries.map(([, count], index) => count > 0
        ? <circle key={index} cx={x(index)} cy={y(count)} r="3.5" fill="#0759b7" stroke="white" strokeWidth="1.4"/>
        : null)}
      {labelIndices.map(index => <text key={index} x={x(index)} y="203" fontSize="12" fill="#475569"
        textAnchor={index === 0 ? 'start' : index === entries.length - 1 ? 'end' : 'middle'}>{date(entries[index][0]).slice(0,5)}</text>)}
    </svg>
  </figure>;
}

function StageProgressChart({values}: {values: {label: string; value: number}[]}) {
  const baseline = Math.max(1, values[0]?.value ?? 0);
  return <section className="rounded-2xl border border-indigo-100 bg-white p-4 sm:p-5" aria-label="Biểu đồ tiến độ bốn chặng">
    <h3 className="font-extrabold text-slate-900">Biểu đồ tiến độ qua 4 chặng</h3>
    <p className="mb-4 mt-1 text-xs text-slate-600">Gồm khám phá tự do và học sinh đăng nhập theo bộ lọc. Đây là mức sử dụng, không tự suy ra tiến bộ học tập.</p>
    <div className="space-y-3">
      {values.map(({label, value}, index) => <div key={label} className="grid grid-cols-[6rem_minmax(0,1fr)_3.5rem] items-center gap-3 text-sm sm:grid-cols-[9rem_minmax(0,1fr)_4.5rem]">
        <span className="font-semibold text-slate-700">{label}</span>
        <div className="h-4 overflow-hidden rounded-full bg-slate-100" role="meter" aria-label={label}
          aria-valuemin={0} aria-valuemax={baseline} aria-valuenow={Math.min(value, baseline)}>
          <div className="h-full rounded-full transition-[width]" style={{
            width: `${Math.min(100, value / baseline * 100)}%`,
            backgroundColor: ['#0b7bce','#16a0a6','#8b5cf6','#f59e0b','#16a34a'][index],
          }}/>
        </div>
        <strong className="text-right tabular-nums text-slate-900">{countLabel(value)}</strong>
      </div>)}
    </div>
  </section>;
}

export function EffectivenessReport({openProgress, openFeedback}: {
  openProgress: () => void; openFeedback: (stationId: string) => void;
}) {
  const [days, setDays] = useState(showOctoberPeriod?daysFromOctober:30);
  const [grade, setGrade] = useState(0);
  const [stationId, setStationId] = useState('');
  const [audience, setAudience] = useState(-1);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snapshot, setSnapshot] = useState<{days: number; report: Report; checkedAt: number} | null>(null);
  const currentSnapshot = snapshot?.days === days ? snapshot : null;
  const report = currentSnapshot?.report;
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  useEffect(() => {
    let active = true;
    let inFlight = false;
    let lastAttempt = 0;
    setError('');

    const load = async () => {
      if (!active || inFlight) return;
      inFlight = true;
      lastAttempt = Date.now();
      setLoading(true);
      try {
        const response = await fetchWithTimeout('/api/effectiveness?days=' + days, {
          credentials: 'same-origin', cache: 'no-store',
        });
        if (!active) return;
        if (response.status === 401 || response.status === 403) setSnapshot(null);
        if (!response.headers.get('content-type')?.includes('application/json')) throw Error('Chưa tải được báo cáo.');
        const data = await response.json();
        if (!response.ok) throw Error(data.error || 'Chưa tải được báo cáo.');
        if (active) {
          setSnapshot({days, report: data, checkedAt: Date.now()});
          setError('');
        }
      } catch (failure) {
        if (active) setError((failure as Error).message);
      } finally {
        inFlight = false;
        if (active) setLoading(false);
      }
    };

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible' && navigator.onLine &&
          Date.now() - lastAttempt >= refreshIntervalMs) void load();
    };

    void load();
    const timer = window.setInterval(refreshWhenVisible, refreshIntervalMs);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => {
      active = false;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
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
  const monthlyVisits = new Map<string,number>();
  for(const [day,count] of visitsByDay){
    const month=day.slice(0,7);
    monthlyVisits.set(month,(monthlyVisits.get(month)??0)+count);
  }
  const peakMonth = Math.max(1,...monthlyVisits.values());
  const visits = [...visitsByDay.values()];
  const totalVisits = visits.reduce((sum, count) => sum + count, 0);
  const maxVisits = Math.max(1, ...visits);
  const started = rows.reduce((sum, row) => sum + row.started, 0);
  const completed = rows.reduce((sum, row) => sum + row.stage4, 0);
  const sorted = [...rows].sort((a, b) => b.started - a.started);
  const stageTotals = [
    {label:'Bắt đầu',value:started},
    ...stages.map((stage, index) => ({label:`Chặng ${index + 1}`,value:rows.reduce((sum, row) => sum + row[stage], 0)})),
  ];

  function exportStationStats() {
    if (!report) return;
    const csvRows = [
      ['Từ ngày', 'Đến ngày', 'Nhóm', 'Khối', 'Trạm', 'Bắt đầu', 'Chặng 1', 'Chặng 2', 'Chặng 3', 'Đóng dấu'],
      ...sorted.map(row => [report.start, report.end, audience === -1 ? 'Tất cả người khám phá' : audience === 0 ? 'Khám phá tự do' : 'Học sinh đăng nhập',
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

  return <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
    <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-950 via-blue-900 to-indigo-900 px-5 py-6 text-white sm:px-7">
      <div className="pointer-events-none absolute -right-10 -top-12 h-44 w-44 rounded-full border-[24px] border-white/10" aria-hidden="true"/>
      <p className="relative text-xs font-extrabold uppercase tracking-[.18em] text-sky-200">CHẠM ĐÀ NẴNG · BÁO CÁO QUẢN TRỊ</p>
      <h2 className="relative mt-2 text-2xl font-black sm:text-3xl">Hiệu quả sử dụng và hành trình khám phá</h2>
      <p className="relative mt-2 max-w-2xl text-sm leading-6 text-sky-100">Theo dõi lượt truy cập, mức hoàn thành bốn chặng và hoạt động tại 25 trạm. Dữ liệu được tổng hợp từ hoạt động đã ghi nhận trên máy chủ.</p>
    </header>
    <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
      <label>Thời gian
        <select className={fieldClass} value={days} onChange={event => setDays(Number(event.target.value))}>
          {showOctoberPeriod&&<option value={daysFromOctober}>Từ 01/10/2026 đến nay</option>}
          {[7, 30, 60, 90].filter(value=>!showOctoberPeriod||value!==daysFromOctober).map(value => <option key={value} value={value}>{value} ngày gần nhất</option>)}
        </select>
      </label>
      <label>Nhóm người dùng
        <select className={fieldClass} value={audience} onChange={event => setAudience(Number(event.target.value))}>
          <option value={-1}>Tất cả người khám phá</option><option value={0}>Khám phá tự do</option><option value={1}>Học sinh đăng nhập</option>
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
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" disabled={loading} onClick={() => setRefresh(value => value + 1)} className="rounded-xl border px-4 py-2 text-sm font-semibold">
        {loading ? 'Đang tải số liệu…' : 'Làm mới số liệu'}
      </button>
      {currentSnapshot && <p className="text-xs text-slate-600">Cập nhật thành công lúc {reportTime.format(currentSnapshot.checkedAt)} · Giờ Việt Nam</p>}
    </div>
    {error&&<div role="status" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
      <p className="font-semibold">{report?'Số liệu được giữ từ lần cập nhật gần nhất.':'Chưa kết nối được báo cáo hiệu quả.'}</p>
      <p className="mt-1 text-xs text-slate-600">Có thể tải lại khi đường truyền và máy chủ sẵn sàng.</p>
      <details className="mt-2 text-xs text-slate-500"><summary className="cursor-pointer">Chi tiết kết nối dành cho quản trị</summary><p className="mt-1 break-words">{error}</p></details>
    </div>}
    {!report && <div role="status" className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white px-5 py-6 text-center">
      <p className="font-bold text-slate-800">{loading?'Đang tổng hợp kết quả từ máy chủ…':'Báo cáo chưa có dữ liệu được xác minh'}</p>
      <p className="max-w-lg text-sm text-slate-600">{loading?'Dữ liệu sẽ hiển thị sau khi kết nối hoàn tất.':'Bạn có thể thử làm mới để xem thống kê đã ghi nhận. Các chỉ số chưa xác minh không được tính là 0.'}</p>
    </div>}
    {report && <>
      <p className="text-xs font-medium text-slate-500">Thống kê từ {date(report.start)} đến {date(report.end)} · Giờ Việt Nam</p>
      {(grade!==0||stationId!=='')&&<p className="rounded-xl bg-sky-50 px-3 py-2 text-xs text-sky-900">Bộ lọc khối và trạm áp dụng cho tiến độ; lượt truy cập website vẫn tính cho toàn bộ người khám phá thuộc nhóm đã chọn.</p>}
      <div className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-2xl bg-sky-50 p-4"><h3 className="font-bold">Lượt truy cập website</h3><p className="text-2xl font-black">{countLabel(totalVisits)}</p><p className="text-xs">Gồm khám phá tự do và học sinh theo bộ lọc · Một lượt mỗi phiên, không phải số người duy nhất</p></article>
        <article className="rounded-2xl bg-indigo-50 p-4"><h3 className="font-bold">Lượt bắt đầu trạm</h3><p className="text-2xl font-black">{countLabel(started)}</p><p className="text-xs">Một lượt cho mỗi trạm trong một phiên</p></article>
        <article className="flex items-center justify-between gap-3 rounded-2xl bg-emerald-50 p-4">
          <div className="min-w-0">
            <h3 className="font-bold">Tỷ lệ đóng dấu</h3>
            <p className="mt-1 text-2xl font-black">{percent(completed, started)}</p>
            <p className="text-xs">{countLabel(completed)}/{countLabel(started)} lượt{started > 0 && started < 10 ? ' · Dữ liệu còn ít' : ''}</p>
          </div>
          <svg viewBox="0 0 100 100" className="h-20 w-20 shrink-0" role="img"
            aria-label={`Biểu đồ tròn tỷ lệ đóng dấu ${percent(completed, started)}`}>
            <circle cx="50" cy="50" r="38" fill="none" stroke="#a7f3d0" strokeWidth="11"/>
            <circle cx="50" cy="50" r="38" fill="none" stroke="#059669" strokeWidth="11"
              pathLength="100" strokeDasharray={`${started ? Math.min(100,completed/started*100) : 0} 100`}
              strokeLinecap="round" transform="rotate(-90 50 50)"/>
            <text x="50" y="56" textAnchor="middle" fill="#065f46" fontSize="19" fontWeight="800">{percent(completed,started)}</text>
          </svg>
        </article>
      </div>
      {totalVisits > 0 ? <>
        <section aria-label="So sánh lượt truy cập theo tháng" className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-extrabold text-slate-900">Lượt truy cập theo tháng</h3>
            <span className="text-xs text-slate-600">Tổng hợp từ các ngày thuộc khoảng thời gian đã chọn</span>
          </div>
          <div className="space-y-3">
            {[...monthlyVisits.entries()].map(([month,count])=><div key={month} className="grid grid-cols-[5.5rem_minmax(0,1fr)_4.5rem] items-center gap-3 text-sm sm:grid-cols-[8rem_minmax(0,1fr)_5.5rem]">
              <span className="font-semibold text-slate-700">Tháng {month.slice(5)}/{month.slice(0,4)}</span>
              <div className="h-5 overflow-hidden rounded-full bg-sky-100" role="meter"
                aria-label={`Lượt truy cập tháng ${month.slice(5)}/${month.slice(0,4)}`}
                aria-valuemin={0} aria-valuemax={peakMonth} aria-valuenow={count}>
                <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-[width]" style={{width:`${count/peakMonth*100}%`}}/>
              </div>
              <strong className="text-right tabular-nums text-sky-950">{countLabel(count)}</strong>
            </div>)}
          </div>
        </section>
        <VisitTrendChart entries={[...visitsByDay.entries()]} />
        <details className="rounded-xl border p-4">
        <summary className="cursor-pointer font-bold">Lượt truy cập theo ngày</summary>
        <div className="mt-3 grid max-h-56 gap-1.5 overflow-y-auto">
          {[...visitsByDay.entries()].reverse().map(([day, count]) => <div key={day} className="grid grid-cols-[5.5rem_minmax(0,1fr)_3rem] items-center gap-2 text-xs">
            <time dateTime={day}>{date(day)}</time><span className="h-2 rounded bg-slate-100"><span className="block h-full rounded bg-sky-600" style={{width: `${count / maxVisits * 100}%`}} /></span>
            <span className="text-right">{countLabel(count)}</span>
          </div>)}
        </div>
        </details>
      </> : <p className="text-sm text-slate-600">Chưa có lượt truy cập được ghi nhận trong khoảng thời gian và nhóm đã chọn.</p>}
      <StageProgressChart values={stageTotals} />
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
    <section className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
      <h3 className="font-bold">Hiệu quả học sinh và giáo viên</h3>
      <p className="text-sm text-slate-600">Mẫu thí điểm tính điểm trước–sau trên cùng nhóm học sinh và số phút chuẩn bị của giáo viên. Tệp do nhà trường giữ, phần mềm không tải dữ liệu trong tệp lên máy chủ.</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={openProgress} className="rounded-lg border px-3 py-2 text-sm font-semibold">Tiến độ đã đồng bộ theo lớp</button>
        <button type="button" disabled={downloading} onClick={() => void downloadPilot()} className="rounded-lg border px-3 py-2 text-sm font-semibold">{downloading ? 'Đang tạo tệp…' : 'Tải mẫu đo hiệu quả (.xlsx)'}</button>
      </div>
      {downloadError && <p role="status" className="rounded-lg bg-white px-3 py-2 text-sm text-slate-700">{downloadError}</p>}
    </section>
  </section>;
}
