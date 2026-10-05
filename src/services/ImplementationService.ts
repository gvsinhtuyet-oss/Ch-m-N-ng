import { ImplementationRecord } from '../types';
import { INITIAL_IMPLEMENTATION_RECORDS } from '../data/mockUsers';

const STORAGE_KEY = 'cham_danang_implementations_v2';

class ImplementationService {
  private records: ImplementationRecord[] = [];

  constructor() {
    this.load();
  }

  private load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.records = JSON.parse(raw);
      } else {
        this.records = [...INITIAL_IMPLEMENTATION_RECORDS];
        this.save();
      }
    } catch {
      this.records = [...INITIAL_IMPLEMENTATION_RECORDS];
    }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.records));
    } catch {
      // ignore
    }
  }

  public getAll(): ImplementationRecord[] {
    return [...this.records].sort((a, b) => new Date(b.implementationDate).getTime() - new Date(a.implementationDate).getTime());
  }

  public getByStation(stationId: string): ImplementationRecord[] {
    return this.records.filter(r => r.stationId === stationId);
  }

  public getByTeacher(teacherId: string): ImplementationRecord[] {
    return this.records.filter(r => r.teacherId === teacherId);
  }

  public getByClass(classId: string): ImplementationRecord[] {
    return this.records.filter(r => r.classId === classId);
  }

  public addRecord(data: Omit<ImplementationRecord, 'id' | 'createdAt'>): ImplementationRecord {
    const record: ImplementationRecord = {
      ...data,
      id: `imp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
    };
    this.records.unshift(record);
    this.save();
    return record;
  }
}

export const implementationService = new ImplementationService();
