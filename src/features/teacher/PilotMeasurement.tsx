import {useState} from 'react';

type Measurement = Awaited<ReturnType<typeof import('../admin/effectivenessPilot').readEffectivenessPilot>>;
const decimal = new Intl.NumberFormat('vi-VN', {maximumFractionDigits: 2});

export function PilotMeasurement() {
  const [data, setData] = useState<Measurement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function download() {
    setBusy(true);
    setError('');
    try {
      const {downloadEffectivenessPilot} = await import('../admin/effectivenessPilot');
      await downloadEffectivenessPilot();
    } catch {
      setError('Chưa tạo được tệp mẫu. Vui lòng thử lại.');
    } finally {
      setBusy(false);
    }
  }

  async function read(file: File) {
    setBusy(true);
    setError('');
    setData(null);
    try {
      const {readEffectivenessPilot} = await import('../admin/effectivenessPilot');
      setData(await readEffectivenessPilot(file));
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Chưa đọc được tệp Excel.');
    } finally {
      setBusy(false);
    }
  }

  return <section className="staff-panel space-y-3 p-4">
    <div>
      <h2 className="font-bold">Đo hiệu quả trước và sau</h2>
      <p className="mt-1 text-sm text-slate-600">Dùng một tệp cho mỗi lớp, trạm và đợt đo. Biểu đồ chỉ tính các cặp có đủ hai lần đo. Tệp được xử lý trên thiết bị.</p>
    </div>
    <button type="button" className="staff-button" disabled={busy} onClick={() => void download()}>Tải mẫu đo hiệu quả (.xlsx)</button>
    <label className="block text-sm font-semibold">Mở tệp đã điền
      <input type="file" accept=".xlsx" className="staff-field text-sm" disabled={busy} onChange={event => {
        const file = event.currentTarget.files?.[0];
        event.currentTarget.value = '';
        if (file) void read(file);
      }} />
    </label>
    {busy && <p role="status" className="text-sm">Đang xử lý tệp…</p>}
    {error && <p role="alert" className="staff-empty">{error}</p>}
    {data && <div className="space-y-3" aria-live="polite">
      {data.before !== null && data.after !== null ? <>
        <p className="text-sm font-semibold">{data.studentCount} học sinh có đủ hai bài · Thang điểm 5</p>
        <ul className="space-y-2">
          {[{label:'Trước', score:data.before}, {label:'Sau', score:data.after}].map(row =>
            <li key={row.label} className="staff-bar-row">
              <span>{row.label}</span><progress aria-label={row.label + ' khi học'} value={row.score} max={5} />
              <strong>{decimal.format(row.score)}/5</strong>
            </li>)}
        </ul>
        <p className="text-sm">Chênh lệch trung bình {decimal.format(data.after - data.before)} điểm.</p>
      </> : <p className="staff-empty">Chưa có cặp điểm học sinh hợp lệ.</p>}
      {data.medianMinutes !== null && <p className="text-sm">Trung vị số phút tiết kiệm <strong>{decimal.format(data.medianMinutes)}</strong> · {data.teacherCount} cặp thời gian chuẩn bị</p>}
      {data.usage.some(row => row.count > 0) && <div>
        <p className="mb-2 text-sm font-semibold">Mức chỉnh sửa gợi ý trong các tiết có đủ hai lần đo</p>
        <ul className="flex flex-wrap gap-2 text-xs">{data.usage.map(row => <li key={row.label} className="rounded-lg bg-slate-50 px-2 py-1">{row.label} <strong>{row.count}</strong></li>)}</ul>
      </div>}
      {data.skipped > 0 && <p className="text-sm text-amber-900">{data.skipped} dòng thiếu mã, thiếu một lần đo hoặc có giá trị ngoài phạm vi đã được bỏ qua.</p>}
    </div>}
  </section>;
}
