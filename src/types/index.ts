// Master TypeScript Data Models for CHẠM ĐÀ NẴNG

export type UserRole = 'guest' | 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  role: UserRole;
  name: string;
  avatar?: string;
  email?: string;
}

export interface Student extends User {
  role: 'student';
  studentCode: string;
  displayName: string;
  classId: string;
  className: string;
  grade: number; // 1 | 2 | 3 | 4 | 5
  pinHash?: string;
  status: 'active' | 'locked';
}

export interface Teacher extends User {
  role: 'teacher';
  assignedClasses: string[]; // classIds e.g. ['2/24', '2/25']
  schoolName: string;
  subject?: string;
}

export interface Admin extends User {
  role: 'admin';
  permissions: string[];
}

export interface Classroom {
  id: string;
  name: string;
  grade: number;
  totalStudents: number;
  teacherId?: string;
  teacherName?: string;
  academicYear: string;
}

export interface ContentSource {
  id: string;
  title: string;
  organization: string;
  url?: string;
  accessedAt?: string;
  sourceType: 'official_curriculum' | 'department_document' | 'heritage_board' | 'monograph' | 'museum';
  verified: boolean;
}

export type MediaUsageRights = 'ALLOWED' | 'LINK_ONLY' | 'UNKNOWN' | 'NOT_ALLOWED' | 'OWNED_BY_SCHOOL';

export interface MediaAsset {
  id: string;
  url: string;
  mediaType: 'image' | 'audio' | 'vr360' | 'video';
  sourceName: string;
  sourceUrl?: string;
  verified: boolean;
  usageRights: MediaUsageRights;
  credit?: string;
  status: 'active' | 'placeholder';
}

export interface Vr360Resource {
  url: string;
  provider: 'kuula' | 'google_streetview' | 'matterport' | 'danang_portal' | 'custom_web';
  embedMode: 'iframe' | 'direct_link';
  fallbackUrl?: string;
  verified: boolean;
  title?: string;
}

export interface HotspotInteraction {
  id: string;
  type: 'single-choice' | 'true-false';
  questionVi: string;
  questionEn?: string;
  options: {
    id: string;
    textVi: string;
    textEn?: string;
    isCorrect: boolean;
  }[];
  explanationVi: string;
  explanationEn?: string;
}

export interface ExplorationHotspot {
  id: string;
  stationId: string;
  titleVi: string;
  titleEn?: string;
  subtitleVi?: string;
  subtitleEn?: string;
  image: string;
  narrationVi: string;
  narrationEn?: string;
  keyFactVi: string;
  keyFactEn?: string;
  vr360?: Vr360Resource;
  interaction?: HotspotInteraction;
  sources?: string[];
  mediaRights?: MediaUsageRights;
  mediaCredit?: string;
}

export type CompletionMode = 'AUTO' | 'TEACHER_CONFIRM' | 'SELF_CONFIRM';

export interface ChallengeQuestion {
  id: string;
  questionVi: string;
  questionEn?: string;
  options: {
    id: string;
    textVi: string;
    textEn?: string;
    isCorrect: boolean;
  }[];
  hintVi?: string;
  hintEn?: string;
}

export interface Challenge {
  id: string;
  titleVi: string;
  titleEn?: string;
  platform: 'internal_interactive' | 'wayground' | 'wordwall' | 'quizizz' | 'external';
  url?: string;
  instructionsVi: string;
  instructionsEn?: string;
  completionMode: CompletionMode;
  passingScore?: number;
  questions?: ChallengeQuestion[];
  externalGame?: {
    platform: 'wordwall' | 'wayground' | 'external';
    titleVi: string;
    url: string;
    noteVi?: string;
  };
}

export interface CheckInOption {
  id: string;
  textVi: string;
  textEn?: string;
  icon?: string;
}

export interface CheckIn {
  emotions: {
    id: string;
    emoji: string;
    labelVi: string;
    labelEn: string;
  }[];
  rememberPromptVi: string;
  rememberPromptEn?: string;
  rememberOptions: CheckInOption[];
  actionPromptVi: string;
  actionPromptEn?: string;
  actionOptions: CheckInOption[];
}

export interface Reward {
  id: string;
  stationId: string;
  stage: 1 | 2 | 3;
  nameVi: string;
  nameEn: string;
  template: 'discovery_compass' | 'scholar_scroll' | 'heritage_lantern' | 'nature_leaf' | 'dragon_gem' | 'pottery_vase' | 'sea_pearl' | 'silk_ribbon';
  descriptionVi: string;
  unlockedAt?: string;
}

export interface Stamp {
  id: string;
  stationId: string;
  nameVi: string;
  nameEn: string;
  iconName: string;
  colorTheme: string; // Tailwind color or hex
  quoteVi: string;
  quoteEn?: string;
  symbolSvg?: string;
}

export interface JourneyMapNode {
  id: string;
  titleVi: string;
  textVi: string;
  icon?: string;
}

export interface JourneyMapDefinition {
  id: string;
  stationId: string;
  grade: number;
  titleVi: string;
  subtitleVi?: string;
  image?: string;
  summaryNodes: JourneyMapNode[];
  knowVi: string;
  understandVi: string;
  actVi: string;
  rewardNameVi?: string;
  stampNameVi?: string;
}

export interface PedagogyGoals {
  knowGoalVi: string;
  knowGoalEn?: string;
  understandGoalVi: string;
  understandGoalEn?: string;
  behaviorGoalVi: string;
  behaviorGoalEn?: string;
}

export type StationVersionStatus = 'DRAFT' | 'IN_REVIEW' | 'PUBLISHED' | 'ARCHIVED';

export interface StationVersion {
  stationId: string;
  version: string;
  status: StationVersionStatus;
  createdBy: string;
  reviewedBy?: string;
  createdAt: string;
  publishedAt?: string;
  changelog?: string;
}

export interface StationVr360Experience {
  url: string;
  provider:
    | 'custom_web'
    | 'kuula'
    | 'matterport'
    | 'google_streetview'
    | 'official_portal';
  titleVi: string;
  titleEn?: string;
  verified: boolean;
  embedMode: 'iframe' | 'direct_link';
  fallbackUrl?: string;
  sourceName?: string;
}

export interface Station {
  id: string;
  number: number; // 1..5 in grade
  grade: number; // 1..5
  themeId: 'I' | 'II' | 'III' | 'IV';
  themeNameVi: string;
  themeNameEn?: string;
  titleVi: string;
  titleEn?: string;
  subtitleVi: string;
  subtitleEn?: string;
  coverImage: string;
  openingMessageVi: string;
  openingMessageEn?: string;
  totalPeriods: number; // e.g. 6 or 7
  officialCurriculumReference: string;
  pedagogyGoals: PedagogyGoals;
  hotspots: ExplorationHotspot[];
  vr360Experience?: StationVr360Experience;
  vr360PreviewImage?: string;
  challenge: Challenge;
  checkIn: CheckIn;
  rewards: Reward[];
  stamp: Stamp;
  journeyMap?: JourneyMapDefinition;
  version: StationVersion;
  sources: ContentSource[];
  isFullyVerified: boolean;
}

export interface StudentCheckInResponse {
  emotionId: string;
  rememberOptionIds: string[];
  actionOptionIds: string[];
  submittedAt: string;
}

export interface StudentStationProgress {
  studentId: string;
  stationId: string;
  stage1Completed: boolean;
  stage2Completed: boolean;
  stage3Completed: boolean;
  stage4Completed: boolean;
  stationCompleted: boolean;
  exploredHotspotIds: string[];
  rewardsCollected: string[]; // reward ids
  stampReceived: boolean;
  journeyMapReceived: boolean;
  journeyMapReceivedAt?: string;
  keyFragmentReceived: boolean;
  keyFragmentReceivedAt?: string;
  startedAt?: string;
  completedAt?: string;
  lastVisitedAt: string;
  syncStatus: 'synced' | 'pending' | 'local_only';
  checkInResponse?: StudentCheckInResponse;
}

export type ImplementationMethod = 
  | 'Dạy trực tiếp trên lớp'
  | 'Tích hợp vào môn học'
  | 'Hoạt động trải nghiệm'
  | 'Giao học sinh tự học';

export interface ImplementationRecord {
  id: string;
  teacherId: string;
  teacherName: string;
  stationId: string;
  stationName: string;
  classId: string;
  className: string;
  grade: number;
  implementationDate: string;
  session: string; // e.g. "Tiết 1-2, Buổi sáng"
  method: ImplementationMethod;
  note?: string;
  createdAt: string;
}

export interface OfflinePackage {
  stationId: string;
  downloadedAt: string;
  sizeMb: number;
  hasUpdate: boolean;
}

export interface SyncEvent {
  id: string;
  type: 'PROGRESS_UPDATE' | 'IMPLEMENTATION_RECORD' | 'CHECKIN_SUBMIT';
  timestamp: string;
  payload: any;
  status: 'pending' | 'synced' | 'failed';
}
