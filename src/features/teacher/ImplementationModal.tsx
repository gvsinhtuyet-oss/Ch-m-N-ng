import React, { useState } from 'react';
import { Station, ImplementationMethod } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { DEMO_CLASSROOMS } from '../../data/mockUsers';
import { implementationService } from '../../services/ImplementationService';
import { audioService } from '../../services/AudioService';
import { CheckCircle2, Calendar, BookOpen, Clock, FileText, X } from 'lucide-react';

interface Props {
  station: Station;
  onClose: () => void;
  onSuccess: () => void;
}

export const ImplementationModal: React.FC<Props> = ({ station, onClose, onSuccess }) => {
  const { currentUser, currentGrade } = useApp();
  const teacher = currentUser as any;

  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [classId, setClassId] = useState<string>('class-2-24');
  const [session, setSession] = useState<string>('Tiết 1-2, Buổi sáng');
  const [method, setMethod] = useState<ImplementationMethod>('Dạy trực tiếp trên lớp');
  const [note, setNote] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const availableClasses = DEMO_CLASSROOMS.filter(c => c.grade === currentGrade);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    audioService.playSfx('correct');

    const selectedClass = availableClasses.find(c => c.id === classId) || availableClasses[0];

    implementationService.addRecord({
      teacherId: teacher?.id || 'teacher-tuyet',
      teacherName: teacher?.name || 'Cô Trương Sinh Tuyết',
      stationId: station.id,
      stationName: station.titleVi,
      classId: selectedClass.id,
      className: selectedClass.name,
      grade: currentGrade,
      implementationDate: date,
      session,
      method,
      note,
    });

    setIsSaved(true);
    setTimeout(() => {
      onSuccess();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold transition"
        >
          <X className="w-4 h-4" />
        </button>

        {!isSaved ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                Xác nhận triển khai dạy học
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2">{station.titleVi}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ghi nhận nhật ký triển khai bài học trong phiên bản demo của giáo viên.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              {/* Implementation Date */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Ngày triển khai:</label>
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 font-medium"
                  />
                </div>
              </div>

              {/* Class Selection */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Lớp học thực hiện:</label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 font-medium bg-white"
                >
                  {availableClasses.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.totalStudents} học sinh)
                    </option>
                  ))}
                </select>
              </div>

              {/* Session / Period */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Buổi / Tiết:</label>
                <input
                  type="text"
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                  placeholder="Ví dụ: Tiết 1-2, Buổi sáng"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 font-medium"
                />
              </div>

              {/* Method */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Hình thức tổ chức:</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as ImplementationMethod)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 font-medium bg-white"
                >
                  <option value="Dạy trực tiếp trên lớp">Dạy trực tiếp trên lớp</option>
                  <option value="Tích hợp vào môn học">Tích hợp vào môn học (Tiếng Việt/TN&XH/Lịch sử)</option>
                  <option value="Hoạt động trải nghiệm">Hoạt động trải nghiệm</option>
                  <option value="Giao học sinh tự học">Giao học sinh tự học có hướng dẫn</option>
                </select>
              </div>

              {/* Note */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Ghi chú & nhận xét tiết dạy:</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  placeholder="Ghi nhận sự hào hứng, sản phẩm học tập hoặc tình huống thực tế của học sinh..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 font-medium"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 transition active:scale-95"
              >
                XÁC NHẬN ĐÃ TRIỂN KHAI
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Đã lưu nhật ký triển khai!</h3>
            <p className="text-xs text-slate-600">
              Dữ liệu đã được lưu vào nhật ký triển khai trong phiên bản demo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
