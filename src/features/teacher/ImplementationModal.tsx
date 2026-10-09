import React, { useEffect, useState } from 'react';
import { Station, ImplementationMethod, Classroom } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { DEMO_CLASSROOMS } from '../../data/mockUsers';
import { implementationService } from '../../services/ImplementationService';
import { authService } from '../../services/AuthService';
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

  const isDemo=currentUser?.id==='teacher-demo';
  const [availableClasses,setAvailableClasses]=useState<Classroom[]>([]);
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  useEffect(()=>{let active=true;
    const load=isDemo?Promise.resolve(DEMO_CLASSROOMS):authService.classes();
    void load.then(list=>{if(!active)return;const matching=list.filter(c=>c.grade===station.grade);setAvailableClasses(matching);setClassId(matching[0]?.id||'');}).catch(e=>{if(active)setError(e.message);});
    return()=>{active=false;};
  },[currentUser?.id,station.grade]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();if(busy)return;setError('');
    const selectedClass=availableClasses.find(c=>c.id===classId);
    if(!selectedClass){setError('Tạo lớp đúng khối tại mục Lớp học trước khi ghi nhận.');return;}
    setBusy(true);
    try{
      const data={stationId:station.id,stationName:station.titleVi,classId:selectedClass.id,className:selectedClass.name,grade:station.grade,implementationDate:date,session,method,note};
      if(isDemo)implementationService.addRecord({...data,teacherId:teacher.id,teacherName:teacher.name});
      else await authService.saveImplementation(data);
      audioService.playSfx('correct');setIsSaved(true);onSuccess();
    }catch(e){setError((e as Error).message);}finally{setBusy(false);}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
        <button
          disabled={busy} onClick={onClose}
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
                {isDemo?'Bản trải nghiệm: nhật ký chỉ lưu trên thiết bị.':'Nhật ký được lưu trên máy chủ và quản trị có thể xem.'}
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
                <select required disabled={busy || !availableClasses.length}
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 font-medium bg-white"
                >
                  {!availableClasses.length&&<option value="">Chưa có lớp đúng khối</option>}
                  {availableClasses.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} · {cls.academicYear} ({cls.totalStudents} học sinh)
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
                  rows={2} maxLength={3000}
                  placeholder="Ghi nhận sự hào hứng, sản phẩm học tập hoặc tình huống thực tế của học sinh..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 font-medium"
                />
              </div>
            </div>

            {error&&<p role="alert" className="text-sm text-rose-700">{error}</p>}
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                disabled={busy} onClick={onClose}
                className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                Hủy
              </button>
              <button
                type="submit" disabled={busy || !availableClasses.length}
                className="flex-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 transition active:scale-95"
              >
                {busy?'ĐANG LƯU…':'XÁC NHẬN ĐÃ TRIỂN KHAI'}
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
