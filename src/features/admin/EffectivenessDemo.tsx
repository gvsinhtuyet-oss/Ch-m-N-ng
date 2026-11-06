const trial = {
  visits: 240,
  started: 180,
  completed: 144,
  pairedStudents: 60,
  before: 2.6,
  after: 3.8,
  teacherComparisons: 8,
  minutesBefore: 34,
  minutesAfter: 22,
} as const;

const formatNumber = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 });

export function EffectivenessDemo() {
  const rate = Math.round(trial.completed / trial.started * 100);
  const scoreGain = trial.after - trial.before;
  const minutesSaved = trial.minutesBefore - trial.minutesAfter;

  return (
    <section className="space-y-4" aria-label="Minh họa hiệu quả bằng dữ liệu mô phỏng">
      <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 text-amber-950">
        <h2 className="text-lg font-black">Dữ liệu mô phỏng</h2>
        <p className="mt-1 text-sm">Ví dụ giả định cho một đợt thí điểm 2 tuần. Các số liệu chỉ dùng để minh họa cách đọc báo cáo.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Lượt truy cập', value: formatNumber.format(trial.visits), note: 'Phiên truy cập website giả định' },
          { label: 'Hoàn thành trạm', value: `${rate}%`, note: `${trial.completed}/${trial.started} lượt bắt đầu đã đóng dấu` },
          { label: 'Điểm học sinh trước–sau', value: `+${formatNumber.format(scoreGain)}/5`, note: `${trial.pairedStudents} học sinh có đủ hai bài` },
          { label: 'Thời gian giáo viên tiết kiệm', value: `${minutesSaved} phút`, note: `Trung bình qua ${trial.teacherComparisons} lượt so sánh` },
        ].map(metric => (
          <article key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold text-amber-900">Mô phỏng</p>
            <h3 className="mt-1 font-semibold text-slate-800">{metric.label}</h3>
            <p className="mt-2 text-3xl font-black text-indigo-900">{metric.value}</p>
            <p className="mt-1 text-sm text-slate-600">{metric.note}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-bold text-slate-900">Học sinh · Điểm trước và sau (mô phỏng)</h3>
          <p className="text-sm text-slate-600">Điểm trung bình của cùng {trial.pairedStudents} học sinh, trên thang 5 điểm.</p>
          {[
            { label: 'Trước khi học', value: trial.before, color: 'bg-slate-500' },
            { label: 'Sau khi học', value: trial.after, color: 'bg-indigo-600' },
          ].map(row => (
            <div key={row.label}>
              <div className="mb-1 flex justify-between gap-2 text-sm"><span>{row.label}</span><strong>{formatNumber.format(row.value)}/5</strong></div>
              <div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full ${row.color}`} style={{ width: `${row.value / 5 * 100}%` }} /></div>
            </div>
          ))}
        </section>

        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-bold text-slate-900">Giáo viên · Thời gian chuẩn bị (mô phỏng)</h3>
          <p className="text-sm text-slate-600">So sánh các hoạt động tương đương, gồm thời gian kiểm tra và chỉnh sửa học liệu.</p>
          {[
            { label: 'Cách thường dùng', value: trial.minutesBefore, color: 'bg-slate-500' },
            { label: 'Có Trợ lý Khám phá', value: trial.minutesAfter, color: 'bg-emerald-700' },
          ].map(row => (
            <div key={row.label}>
              <div className="mb-1 flex justify-between gap-2 text-sm"><span>{row.label}</span><strong>{row.value} phút</strong></div>
              <div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full ${row.color}`} style={{ width: `${row.value / trial.minutesBefore * 100}%` }} /></div>
            </div>
          ))}
        </section>
      </div>
    </section>
  );
}
