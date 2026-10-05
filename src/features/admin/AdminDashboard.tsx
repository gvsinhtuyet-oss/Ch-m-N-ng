import { StaffAccounts } from './StaffAccounts';
import { ThemeEditor } from './ThemeEditor';
import { ContentEditor } from './ContentEditor';
import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { DEMO_CLASSROOMS, DEMO_STUDENTS } from '../../data/mockUsers';
import { OFFICIAL_25_CATALOG } from '../../data/curriculumCatalog';
import { implementationService } from '../../services/ImplementationService';
import {
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle2,
  FileText,
  Filter,
  Layers,
  School,
  Shield,
  Users,
  Search,
  Plus,
  RefreshCw,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { allStationsInCurrentGrade, currentGrade } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'tracking' | 'stations' | 'users' | 'reports' | 'theme'>('overview');
  const [gradeFilter, setGradeFilter] = useState<number>(0); // 0 = all
  const [selectedStationTab, setSelectedStationTab] = useState<string>('g2-station-4');

  const implementations = implementationService.getAll();

  const filteredImplementations = gradeFilter === 0
    ? implementations
    : implementations.filter(i => i.grade === gradeFilter);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-300 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <School className="w-3.5 h-3.5" />
              Cổng Quản Trị Nhà Trường
            </span>
            <span className="text-xs text-indigo-200">Trường TH Trần Đại Nghĩa</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Bảng Điều Hành Giáo Dục Địa Phương
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 mt-1 max-w-xl">
            Theo dõi kế hoạch giảng dạy, số hóa 25 trạm học tập 5 khối lớp và thẩm định bản mẫu học liệu.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap gap-1.5 bg-black/20 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
          {[
            { id: 'overview', label: 'TỔNG QUAN', icon: BarChart3 },
            { id: 'tracking', label: 'THEO DÕI TRIỂN KHAI', icon: Calendar },
            { id: 'stations', label: 'NỘI DUNG TRẠM', icon: BookOpen },
            { id: 'theme', label: 'GIAO DIỆN', icon: Layers },
            { id: 'users', label: 'NGƯỜI DÙNG', icon: Users },
            { id: 'reports', label: 'BÁO CÁO', icon: FileText },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  isActive ? 'bg-white text-slate-950 shadow-md' : 'text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'theme' && <ThemeEditor />}

      {/* TAB 1: TỔNG QUAN */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900">Tổng Quan Toàn Trường (Năm học 2026–2027)</h2>
            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
              Dữ liệu minh họa
            </span>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Giáo viên</span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">42</div>
              <span className="text-[10px] text-emerald-600 font-semibold">100% tài khoản active</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Lớp học</span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">30</div>
              <span className="text-[10px] text-slate-500">Khối 1 đến Khối 5</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Học sinh</span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">1,050</div>
              <span className="text-[10px] text-sky-600 font-semibold">Đăng nhập PIN an toàn</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Trạm GDĐP</span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">25</div>
              <span className="text-[10px] text-emerald-600 font-semibold">5 trạm / khối</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Lượt triển khai</span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{implementations.length * 6}</div>
              <span className="text-[10px] text-slate-500">Theo kế hoạch năm</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Tỷ lệ hoàn thành</span>
              <div className="text-2xl sm:text-3xl font-black text-sky-600 mt-1">88.5%</div>
              <span className="text-[10px] text-emerald-600 font-semibold">+6.2% so với tháng trước</span>
            </div>
          </div>

          {/* Quick Summary Highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center justify-between">
                <span>Triển khai theo khối lớp</span>
                <span className="text-xs text-slate-400 font-medium">Học kỳ 1</span>
              </h3>
              <div className="space-y-3">
                {[
                  { grade: 1, percent: 90, label: 'Khối 1: 4/5 bài đã tổ chức' },
                  { grade: 2, percent: 95, label: 'Khối 2: 5/5 bài đã tổ chức (Hội An đạt 100%)' },
                  { grade: 3, percent: 80, label: 'Khối 3: 4/5 bài đã tổ chức' },
                  { grade: 4, percent: 85, label: 'Khối 4: 4/5 bài đã tổ chức' },
                  { grade: 5, percent: 82, label: 'Khối 5: 4/5 bài đã tổ chức' },
                ].map((item) => (
                  <div key={item.grade} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700">{item.label}</span>
                      <span className="text-sky-700 font-bold">{item.percent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-sky-600 h-full rounded-full" style={{ width: `${item.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center justify-between">
                <span>Hoạt động triển khai gần đây</span>
                <span className="text-xs text-emerald-700 font-bold">Cập nhật tức thời</span>
              </h3>
              <div className="space-y-3">
                {implementations.slice(0, 4).map(imp => (
                  <div key={imp.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{imp.teacherName}</span>
                      <span className="text-slate-400 mx-1">•</span>
                      <span className="text-emerald-700 font-bold">{imp.className}</span>
                      <p className="text-slate-500 mt-0.5">{imp.stationName}</p>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">{imp.implementationDate}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: THEO DÕI TRIỂN KHAI */}
      {activeTab === 'tracking' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">Sổ Theo Dõi Triển Khai GDĐP Toàn Trường</h2>
              <p className="text-xs text-slate-500">
                Minh chứng chuyên môn phục vụ công tác thanh kiểm tra của Phòng và Sở GDĐT
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(Number(e.target.value))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value={0}>Tất cả khối lớp</option>
                <option value={1}>Khối 1</option>
                <option value={2}>Khối 2</option>
                <option value={3}>Khối 3</option>
                <option value={4}>Khối 4</option>
                <option value={5}>Khối 5</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase border-y border-slate-100 font-bold">
                <tr>
                  <th className="py-3 px-4">Giáo viên</th>
                  <th className="py-3 px-4">Lớp</th>
                  <th className="py-3 px-4">Bài / Trạm</th>
                  <th className="py-3 px-4">Ngày</th>
                  <th className="py-3 px-4">Buổi / Tiết</th>
                  <th className="py-3 px-4">Hình thức</th>
                  <th className="py-3 px-4">Ghi chú</th>
                  <th className="py-3 px-4">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredImplementations.map(imp => (
                  <tr key={imp.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-bold text-slate-900">{imp.teacherName}</td>
                    <td className="py-3 px-4 font-semibold text-emerald-800">{imp.className}</td>
                    <td className="py-3 px-4 font-semibold text-sky-900">{imp.stationName}</td>
                    <td className="py-3 px-4 font-mono">{imp.implementationDate}</td>
                    <td className="py-3 px-4">{imp.session}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                        {imp.method}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{imp.note || '—'}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Đã xác nhận
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'stations' && <ContentEditor />}

      {/* TAB 3: NỘI DUNG TRẠM (25 Stations & Versioning) */}
      {activeTab === 'stations' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">Khung 25 Trạm Cấp Tiểu Học (Theo Đề Cương SGDĐT)</h2>
              <p className="text-xs text-slate-500">
                Quản lý phiên bản biên soạn (Bản thảo → Gửi duyệt → Bản mẫu xuất bản)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                Quy trình Thông tư 41/2026/TT-BGDĐT
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {OFFICIAL_25_CATALOG.map((cat) => (
              <div
                key={cat.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-indigo-300 transition space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                      Khối {cat.grade} • Bài {cat.lessonNumber}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">{cat.periods} tiết</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 mt-1">{cat.titleVi}</h4>
                  <p className="text-[11px] text-indigo-900 font-semibold">{cat.themeNameVi}</p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{cat.knowGoalVi}</p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                    <CheckCircle2 className="w-3 h-3" /> Xuất bản chuẩn
                  </span>
                  <span className="text-slate-400 font-mono text-[10px]">v1.2</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'users' && <StaffAccounts />}

      {/* TAB 5: BÁO CÁO */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div>
            <h2 className="text-xl font-black text-slate-900">Báo Cáo Thống Kê & Đánh Giá Chất Lượng</h2>
            <p className="text-xs text-slate-500">
              Tổng hợp phục vụ hội nghị giao ban chuyên môn giáo dục tiểu học thành phố Đà Nẵng
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-3">
            <h3 className="font-bold text-sm text-indigo-950">Đánh giá chung sau triển khai thử nghiệm:</h3>
            <ul className="text-xs text-indigo-900 space-y-1.5 list-disc pl-5 leading-relaxed">
              <li>100% học sinh hào hứng khi được tương tác điểm chạm trực quan và ngắm nhìn hình ảnh thực tế quê hương.</li>
              <li>Chế độ trình chiếu lớp học trên TV màn hình rộng giúp tiết dạy sôi động, không phụ thuộc vào thiết bị cá nhân của học sinh.</li>
              <li>Hộ chiếu số và con dấu hoàn thành tạo động lực học tập tích cực, rèn luyện tình yêu quê hương, đất nước.</li>
              <li>Mô hình tích hợp số và trải nghiệm đáp ứng đầy đủ yêu cầu cần đạt của Thông tư 32/2018/TT-BGDĐT.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

