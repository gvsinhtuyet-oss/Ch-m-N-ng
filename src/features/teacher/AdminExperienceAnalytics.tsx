import React, { useMemo, useState } from 'react';
import { BarChart3, CalendarDays, Compass, Star, TrendingUp, Users } from 'lucide-react';
import {
  EXPERIENCE_SHOWCASE_FEEDBACK, EXPERIENCE_SHOWCASE_PEOPLE, getExperienceShowcase,
  type ExperienceMonth, type ExperienceAudience,
} from './adminExperienceAnalyticsData';

type Mode = 'overview' | 'effectiveness' | 'ratings';
const nf = new Intl.NumberFormat('vi-VN');
const pct = (count: number, total: number) => total ? (100 * count / total).toFixed(1).replace('.', ',') + '%' : '0%';
const dateShort = (iso: string) => iso ? iso.slice(8, 10) + '/' + iso.slice(5, 7) : '—';

function VisitorTrend({ daily }: { daily: Array<{ day: string; visits: number; unique: number }> }) {
  const highest = Math.max(1, ...daily.map(entry => entry.visits));
  const left = 42, right = 748, top = 24, bottom = 195;
  const x = (index: number) => left + (daily.length === 1 ? 0 : index / (daily.length - 1) * (right - left));
  const y = (value: number) => bottom - value / highest * (bottom - top);
  const line = daily.map((entry, index) => x(index) + ',' + y(entry.visits)).join(' ');
  const area = daily.length
    ? 'M' + x(0) + ' ' + bottom + ' L' + daily.map((entry, index) => x(index) + ' ' + y(entry.visits)).join(' L') +
      ' L' + x(daily.length - 1) + ' ' + bottom + ' Z'
    : '';
  const step = Math.max(1, Math.ceil(daily.length / 5));
  const axisLabels = daily.map((entry, index) => ({ ...entry, index }))
    .filter(entry => entry.index === 0 || entry.index === daily.length - 1 || entry.index % step === 0);

  return <figure className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm sm:p-6">
    <figcaption className="mb-3 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 className="text-base font-black text-slate-900 sm:text-lg">Xu hướng lượt truy cập theo ngày</h3>
        <p className="mt-1 text-xs text-slate-500">Khoảng thời gian 01/10–13/11/2026 · Biểu đồ có thể lọc</p>
      </div>
      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-800">Lượt truy cập</span>
    </figcaption>
    <svg role="img" aria-label={'Biểu đồ mô phỏng ' + daily.length + ' ngày, có ' + daily.reduce((sum, d) => sum + d.visits, 0) + ' lượt truy cập.'}
      className="h-auto w-full" viewBox="0 0 790 245">
      <defs>
        <linearGradient id="experience-traffic-area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity=".44" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity=".03" />
        </linearGradient>
      </defs>
      {[0, .25, .5, .75, 1].map(fraction => {
        const height = bottom - fraction * (bottom - top);
        return <g key={fraction}>
          <line x1={left} y1={height} x2={right} y2={height} stroke="#e2e8f0" strokeDasharray="4 6" />
          <text x={left - 10} y={height + 4} fontSize="12" textAnchor="end" fill="#64748b">
            {Math.round(highest * fraction)}
          </text>
        </g>;
      })}
      <path d={area} fill="url(#experience-traffic-area)" />
      <polyline points={line} fill="none" stroke="#4f46e5" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      {daily.map((entry, index) => entry.visits > 0 &&
        (index % Math.max(1, Math.floor(daily.length / 12)) === 0 || index === daily.length - 1)
        ? <circle key={entry.day} cx={x(index)} cy={y(entry.visits)} r="3" fill="#6366f1" stroke="white" strokeWidth="1.4" />
        : null)}
      {axisLabels.map(entry =>
        <text key={entry.day} x={x(entry.index)} y="230" fontSize="11"
          textAnchor={entry.index === 0 ? 'start' : entry.index === daily.length - 1 ? 'end' : 'middle'}
          fill="#64748b">{dateShort(entry.day)}</text>)}
    </svg>
    <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
      <span>{daily.length} ngày</span>
      <span>Cao nhất: <strong className="text-indigo-900">{Math.max(0, ...daily.map(day => day.visits))} lượt/ngày</strong></span>
    </div>
  </figure>;
}

function Metric({ icon, title, value, detail, tone }: {
  icon: React.ReactNode; title: string; value: string; detail: string; tone: 'indigo' | 'sky' | 'emerald' | 'amber';
}) {
  const tones = {
    indigo: 'from-indigo-50 to-white text-indigo-800',
    sky: 'from-sky-50 to-white text-sky-800',
    emerald: 'from-emerald-50 to-white text-emerald-800',
    amber: 'from-amber-50 to-white text-amber-800',
  };
  return <div className={'rounded-2xl border border-slate-200 bg-gradient-to-br p-4 shadow-sm sm:p-5 ' + tones[tone]}>
    <div className="flex items-center justify-between gap-2">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-600">{title}</p>
      <span aria-hidden="true" className="opacity-80">{icon}</span>
    </div>
    <p className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{value}</p>
    <p className="mt-1 text-xs text-slate-600">{detail}</p>
  </div>;
}

export const AdminExperienceAnalytics: React.FC<{ mode: Mode }> = ({ mode }) => {
  const [month, setMonth] = useState<ExperienceMonth>('all');
  const [grade, setGrade] = useState(0);
  const [audience, setAudience] = useState<ExperienceAudience>('all');
  const report = useMemo(() => getExperienceShowcase({ month, grade, audience }), [month, grade, audience]);
  const title = mode === 'ratings' ? 'Đánh giá sao và góp ý'
    : mode === 'overview' ? 'Tổng quan hiệu quả sử dụng'
      : 'Hiệu quả sử dụng và hành trình khám phá';
  const selectClass = 'min-h-10 rounded-xl border border-white/25 bg-slate-900/60 px-3 py-2 text-sm text-white outline-offset-2';
  const ratingAverage = report.average === null ? '—' : report.average.toFixed(1).replace('.', ',');
  const totalRatings = report.ratings.length;

  const header = <header className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-900 to-sky-800 p-5 text-white shadow-lg sm:p-7">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-sky-200">
        <BarChart3 className="h-4 w-4" /> CHẠM ĐÀ NẴNG · QUẢN TRỊ TRẢI NGHIỆM
      </div>
      <span className="rounded-full border border-amber-300/60 bg-amber-300/20 px-3 py-1.5 text-xs font-extrabold tracking-wide text-amber-100">
        CHẾ ĐỘ TRẢI NGHIỆM · SỐ LIỆU GIẢ ĐỊNH
      </span>
    </div>
    <h2 className="mt-4 text-2xl font-black leading-tight sm:text-3xl">{title}</h2>
    <p className="mt-2 max-w-2xl text-sm leading-6 text-sky-100">
      Theo dõi người tham gia, lượt truy cập, hành trình qua bốn chặng và đánh giá sao
      từ tháng 10 đến ngày 13/11/2026.
    </p>
    <div className="mt-5 grid gap-3 sm:grid-cols-3">
      <label className="block text-xs font-bold text-sky-100">
        Khoảng thời gian
        <select className={selectClass + ' mt-1 block w-full'} value={month}
          onChange={e => setMonth(e.target.value as ExperienceMonth)}>
          <option value="all">01/10 – 13/11/2026</option>
          <option value="2026-10">Tháng 10/2026</option>
          <option value="2026-11">01–13/11/2026</option>
        </select>
      </label>
      <label className="block text-xs font-bold text-sky-100">
        Khối lớp
        <select className={selectClass + ' mt-1 block w-full'} value={grade}
          onChange={e => setGrade(Number(e.target.value))}>
          <option value={0}>Toàn bộ 5 khối</option>
          {[1, 2, 3, 4, 5].map(value => <option key={value} value={value}>Khối {value}</option>)}
        </select>
      </label>
      <label className="block text-xs font-bold text-sky-100">
        Đối tượng
        <select className={selectClass + ' mt-1 block w-full'} value={audience}
          onChange={e => setAudience(e.target.value as ExperienceAudience)}>
          <option value="all">Học sinh + Khám phá tự do</option>
          <option value="student">Học sinh có mã</option>
          <option value="guest">Khám phá tự do</option>
        </select>
      </label>
    </div>
  </header>;

  const metrics = <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
    <Metric icon={<Users className="h-5 w-5" />} title="Người tham gia" value={nf.format(report.people.length)}
      detail="Người riêng biệt trong kỳ lọc" tone="indigo" />
    <Metric icon={<TrendingUp className="h-5 w-5" />} title="Lượt truy cập" value={nf.format(report.visits)}
      detail="Bao gồm lượt quay lại" tone="sky" />
    <Metric icon={<Star className="h-5 w-5" />} title="Đánh giá sao" value={nf.format(totalRatings)}
      detail="Tổng số lượt đánh giá" tone="amber" />
    <Metric icon={<Compass className="h-5 w-5" />} title="Điểm trung bình" value={ratingAverage}
      detail="Thang điểm tối đa 5 sao" tone="emerald" />
  </div>;

  const audiencePanel = <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
    <h3 className="text-base font-black text-slate-900">Cơ cấu người tham gia</h3>
    <p className="mt-1 text-xs text-slate-500">Khách khám phá tự do được tính như một người học trong tổng quan.</p>
    <div className="mt-5 space-y-4">
      {[
        { label: 'Học sinh có mã', value: report.byAudience.student, color: 'bg-indigo-600' },
        { label: 'Khám phá tự do', value: report.byAudience.guest, color: 'bg-sky-500' },
      ].map(row => <div key={row.label}>
        <div className="mb-1.5 flex justify-between gap-2 text-sm"><span>{row.label}</span>
          <strong className="text-slate-900">{row.value} <span className="text-xs font-normal text-slate-500">({pct(row.value, report.people.length)})</span></strong>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
          <div className={'h-full rounded-full ' + row.color}
            style={{ width: pct(row.value, report.people.length).replace(',', '.') }} />
        </div>
      </div>)}
    </div>
  </section>;

  const funnelPanel = <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
    <h3 className="text-base font-black text-slate-900">Hành trình qua 4 chặng</h3>
    <p className="mt-1 text-xs text-slate-500">Mỗi cột đếm số người hoàn thành ít nhất chặng tương ứng.</p>
    <div className="mt-5 space-y-3">
      {['Khám phá', 'Thử thách', 'Check-in', 'Dấu ấn'].map((name, index) => {
        const stage = report.funnel[index];
        const colors = ['bg-sky-500', 'bg-indigo-500', 'bg-violet-500', 'bg-emerald-500'];
        return <div key={name}>
          <div className="mb-1 flex justify-between gap-2 text-sm">
            <span>{index + 1}. {name}</span>
            <strong>{stage.count} <span className="text-xs font-normal text-slate-500">({pct(stage.count, report.people.length)})</span></strong>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div className={'h-full rounded-full ' + colors[index]}
              style={{ width: pct(stage.count, report.people.length).replace(',', '.') }} />
          </div>
        </div>;
      })}
    </div>
  </section>;

  const gradePanel = <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
    <h3 className="text-base font-black text-slate-900">Phân bố theo 5 khối lớp</h3>
    <div className="mt-5 space-y-3">
      {report.byGrade.map(row => <div key={row.grade}>
        <div className="mb-1 flex justify-between text-sm">
          <span>Khối {row.grade}</span><strong>{row.count} người</strong>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-indigo-500"
            style={{ width: pct(row.count, report.people.length).replace(',', '.') }} />
        </div>
      </div>)}
    </div>
  </section>;

  const rankingPanel = <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
    <h3 className="text-base font-black text-slate-900">Top trạm được khám phá</h3>
    <p className="mt-1 text-xs text-slate-500">Thống kê theo lượt khám phá trong tổng số 25 trạm.</p>
    <ol className="mt-4 space-y-2">{report.stationRanking.map((station, index) =>
      <li key={station.id} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-sm font-black text-indigo-800">{index + 1}</span>
        <span className="min-w-0 flex-1 text-sm font-semibold text-slate-800">
          {station.title}<span className="ml-1 text-xs font-normal text-slate-500">· Khối {station.grade}</span>
        </span>
        <strong className="shrink-0 text-sm text-indigo-800">{station.count}</strong>
      </li>)}
    </ol>
  </section>;

  const ratingPanel = <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 className="text-base font-black text-slate-900 sm:text-lg">Mức độ hài lòng</h3>
        <p className="mt-1 text-xs text-slate-500">Phân bố mức đánh giá từ 1 đến 5 sao</p>
      </div>
      <div className="flex items-center gap-2">
        <Star className="h-6 w-6 fill-amber-400 text-amber-400"/>
        <strong className="text-3xl font-black text-slate-900">{ratingAverage}</strong>
        <span className="text-xs text-slate-500">/5 · {totalRatings} lượt</span>
      </div>
    </div>
    <div className="mt-5 space-y-3">
      {report.ratingCounts.map(row => <div key={row.stars} className="flex items-center gap-3 text-sm">
        <span className="w-11 shrink-0 font-bold text-slate-700">{row.stars} ★</span>
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-amber-400" style={{ width: pct(row.count, totalRatings).replace(',', '.') }}/>
        </div>
        <span className="w-9 text-right font-semibold text-slate-700">{row.count}</span>
      </div>)}
    </div>
  </section>;

  const commentsPanel = <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
    <h3 className="text-base font-black text-slate-900">Ý kiến và góp ý</h3>
    <p className="mt-1 text-xs text-slate-500">Một số nhận xét trong phiên trải nghiệm.</p>
    <div className="mt-4 space-y-2">
      {EXPERIENCE_SHOWCASE_FEEDBACK.slice(0, Math.min(6, Math.ceil(totalRatings / 22))).map((comment, index) =>
        <div key={comment} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-slate-800">{index % 3 === 0 ? 'Khách tham quan' : 'Học sinh'} #{String(index + 1).padStart(2,'0')}</span>
            <span className="text-xs font-bold text-amber-700">{index % 4 === 0 ? '4' : '5'} ★</span>
          </div>
          <p className="text-sm text-slate-700">{comment}</p>
        </div>)}
      {!totalRatings && <p className="text-sm text-slate-500">Không có đánh giá trong bộ lọc này.</p>}
    </div>
  </section>;

  return <div className="space-y-4">
    {header}
    {metrics}
    {mode !== 'ratings' && <VisitorTrend daily={report.daily}/>}
    {mode !== 'ratings' && <div className="grid gap-4 lg:grid-cols-2">{audiencePanel}{funnelPanel}</div>}
    {mode === 'effectiveness' && <div className="grid gap-4 lg:grid-cols-2">{gradePanel}{rankingPanel}</div>}
    {(mode === 'ratings' || mode === 'effectiveness') &&
      <div className="grid gap-4 lg:grid-cols-2">{ratingPanel}{commentsPanel}</div>}
    <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold leading-5 text-amber-950">
      SỐ LIỆU GIẢ ĐỊNH PHỤC VỤ TRẢI NGHIỆM · Không phải kết quả học tập, lượt truy cập hay đánh giá thực tế.
      Bộ lọc xử lý cục bộ, không gửi API và không ghi Firestore.
    </p>
    {mode === 'overview' && <p className="text-xs text-slate-600">
      Muốn xem chi tiết, chọn <strong>Báo cáo → Hiệu quả sử dụng</strong> hoặc <strong>Đánh giá sao và góp ý</strong> ở menu bên trái.
    </p>}
  </div>;
};
