import { contentService } from '../services/ContentService';
import { Station, Reward, Stamp, PedagogyGoals, ExplorationHotspot, Challenge, CheckIn } from '../types';
import { GRADE_2_STATIONS } from './grade2Stations';
import { OFFICIAL_25_CATALOG, CatalogItem } from './curriculumCatalog';
import { CANONICAL_THANH_DIEN_HAI_STATION } from './canonicalThanhDienHai';
import { CANONICAL_HOI_AN_STATION } from './canonicalHoiAn';
import { CANONICAL_DANH_NHAN_LOP3_STATION } from './canonicalDanhNhanLop3';
import { CANONICAL_BAO_TANG_DA_NANG_STATION } from './canonicalBaoTangDaNang';
import { CANONICAL_NGU_HANH_SON_STATION } from './canonicalNguHanhSon';

function catalogItemToStation(cat: CatalogItem): Station {
  const hotspots: ExplorationHotspot[] = [
    {
      id: `${cat.id}-hs-1`,
      stationId: cat.id,
      titleVi: `1. Giới thiệu bài học: ${cat.titleVi}`,
      subtitleVi: 'Nội dung đang được hoàn thiện từ nguồn đã kiểm chứng',
      image: cat.coverImage,
      narrationVi: `Bài học "${cat.titleVi}" thuộc chủ đề ${cat.themeNameVi}, được bố trí thời lượng ${cat.periods} tiết. Yêu cầu cần đạt: ${cat.knowGoalVi}. Nội dung chi tiết các điểm chạm tương tác đang được Ban biên soạn cập nhật từ nguồn tư liệu chính thức đã kiểm chứng của Sở GDĐT TP Đà Nẵng.`,
      keyFactVi: `Mục tiêu cốt lõi: ${cat.knowGoalVi}`,
      vr360: undefined,
      interaction: {
        id: `${cat.id}-int-1`,
        type: 'single-choice',
        questionVi: `Bài học "${cat.titleVi}" được phân bổ thời lượng bao nhiêu tiết trong chương trình GDĐP Khối ${cat.grade}?`,
        options: [
          { id: 'opt-1', textVi: `${cat.periods} tiết theo kế hoạch giáo dục`, isCorrect: true },
          { id: 'opt-2', textVi: '100 tiết tự do', isCorrect: false },
          { id: 'opt-3', textVi: 'Không có tiết nào', isCorrect: false },
        ],
        explanationVi: `Chính xác! Theo khung chương trình của Sở GDĐT TP Đà Nẵng, bài học này được bố trí ${cat.periods} tiết.`,
      },
      sources: ['Sở Giáo dục và Đào tạo TP Đà Nẵng - Đề cương chi tiết GDĐP 2026'],
      mediaRights: 'LINK_ONLY',
      mediaCredit: 'Hình ảnh minh họa đang cập nhật tư liệu chuẩn',
    },
  ];

  const challenge: Challenge = {
    id: `ch-${cat.id}`,
    titleVi: `Thử thách: Khám phá ${cat.titleVi}`,
    platform: 'internal_interactive',
    instructionsVi: 'Em hãy chọn đáp án đúng để vượt qua thử thách bài học!',
    completionMode: 'AUTO',
    passingScore: 1,
    questions: [
      {
        id: `q-${cat.id}-1`,
        questionVi: `Bài học "${cat.titleVi}" thuộc chủ đề trọng tâm nào của địa phương?`,
        options: [
          { id: 'o1', textVi: cat.themeNameVi, isCorrect: true },
          { id: 'o2', textVi: 'Lập trình tin học nâng cao', isCorrect: false },
          { id: 'o3', textVi: 'Thí nghiệm vật lý lượng tử', isCorrect: false },
        ],
        hintVi: `Bài học thuộc một trong 4 chủ đề lớn của tài liệu GDĐP Đà Nẵng.`,
      },
    ],
  };

  const checkIn: CheckIn = {
    emotions: [
      { id: 'em-1', emoji: '😍', labelVi: 'Hào hứng', labelEn: 'Excited' },
      { id: 'em-2', emoji: '😊', labelVi: 'Tự hào', labelEn: 'Proud' },
      { id: 'em-3', emoji: '🌱', labelVi: 'Ham học hỏi', labelEn: 'Curious' },
    ],
    rememberPromptVi: `Điều em ghi nhớ nhất về bài học "${cat.titleVi}"?`,
    rememberOptions: [
      { id: 'rem-1', textVi: cat.knowGoalVi.slice(0, 70) + '...' },
      { id: 'rem-2', textVi: cat.understandGoalVi.slice(0, 70) + '...' },
    ],
    actionPromptVi: 'Việc làm ý nghĩa của em sau bài học?',
    actionOptions: [
      { id: 'act-1', textVi: cat.behaviorGoalVi.slice(0, 70) + '...' },
      { id: 'act-2', textVi: 'Chia sẻ kiến thức bổ ích này với bạn bè và gia đình' },
    ],
  };

  const rewards: Reward[] = [
    {
      id: `rw-${cat.id}-1`,
      stationId: cat.id,
      stage: 1,
      nameVi: `Huy Hiệu Khám Phá ${cat.titleVi}`,
      nameEn: `Explorer Badge`,
      template: 'discovery_compass',
      descriptionVi: `Ghi nhận em đã tìm hiểu mục tiêu bài học ${cat.titleVi}.`,
    },
    {
      id: `rw-${cat.id}-2`,
      stationId: cat.id,
      stage: 2,
      nameVi: `Bản Lĩnh Học Tập`,
      nameEn: `Knowledge Shield`,
      template: 'scholar_scroll',
      descriptionVi: `Phần thưởng vượt qua thử thách chủ đề ${cat.themeNameVi}.`,
    },
    {
      id: `rw-${cat.id}-3`,
      stationId: cat.id,
      stage: 3,
      nameVi: `Trái Tim Quê Hương`,
      nameEn: `Homeland Heart`,
      template: 'sea_pearl',
      descriptionVi: `Ghi nhận tình yêu và ý thức giữ gìn truyền thống Đà Nẵng.`,
    },
  ];

  const stamp: Stamp = {
    id: `stamp-${cat.id}`,
    stationId: cat.id,
    nameVi: `Dấu Ấn ${cat.titleVi}`,
    nameEn: `${cat.titleEn} Stamp`,
    iconName: 'award',
    colorTheme: '#0284c7',
    quoteVi: `${cat.titleVi} – Niềm tự hào xứ Quảng`,
  };

  const usesCurrentBook = cat.grade === 1 || cat.grade === 2;

  return {
    id: cat.id,
    number: cat.lessonNumber,
    grade: cat.grade,
    themeId: cat.themeId,
    themeNameVi: cat.themeNameVi,
    titleVi: cat.titleVi,
    titleEn: cat.titleEn,
    subtitleVi: cat.knowGoalVi,
    coverImage: cat.coverImage,
    openingMessageVi: `Chào mừng em đến với bài học "${cat.titleVi}" – Khối ${cat.grade}!`,
    totalPeriods: cat.periods,
    officialCurriculumReference: usesCurrentBook
      ? `Tài liệu Giáo dục địa phương thành phố Đà Nẵng lớp ${cat.grade} đang sử dụng – Chủ đề ${cat.lessonNumber}: ${cat.titleVi}`
      : `Đề cương chi tiết Tài liệu GDĐP TP Đà Nẵng 2026 – Khối ${cat.grade} – Bài ${cat.lessonNumber}`,
    isFullyVerified: usesCurrentBook,
    pedagogyGoals: {
      knowGoalVi: cat.knowGoalVi,
      understandGoalVi: cat.understandGoalVi,
      behaviorGoalVi: cat.behaviorGoalVi,
    },
    hotspots,
    challenge,
    checkIn,
    rewards,
    stamp,
    version: {
      stationId: cat.id,
      version: usesCurrentBook ? '1.1.0-current-book' : '1.0.0-draft',
      status: 'IN_REVIEW',
      createdBy: 'Nhóm biên soạn CHẠM ĐÀ NẴNG',
      createdAt: '2026-09-01',
      changelog: usesCurrentBook
        ? 'Chuẩn hóa theo Tài liệu Giáo dục địa phương thành phố Đà Nẵng lớp 1 đang sử dụng; nội dung số chỉ mở rộng cách học, không thay thế kiến thức cốt lõi của tài liệu.'
        : 'Đang hoàn thiện nội dung chi tiết theo đề cương dự thảo năm 2026',
    },
    sources: [
      {
        id: `src-${cat.id}-1`,
        title: usesCurrentBook
          ? `Tài liệu Giáo dục địa phương thành phố Đà Nẵng lớp ${cat.grade} đang sử dụng`
          : 'Đề cương chi tiết Tài liệu Giáo dục địa phương TP Đà Nẵng năm 2026',
        organization: 'Sở Giáo dục và Đào tạo TP Đà Nẵng',
        sourceType: 'department_document',
        verified: true,
      },
    ],
  };
}

// Build the full 25 stations map and replace the five appraisal demos
// with their canonical, fully authored station data.
const CANONICAL_DEMO_STATIONS: Record<string, Station> = {
  [CANONICAL_THANH_DIEN_HAI_STATION.id]: CANONICAL_THANH_DIEN_HAI_STATION,
  [CANONICAL_HOI_AN_STATION.id]: CANONICAL_HOI_AN_STATION,
  [CANONICAL_DANH_NHAN_LOP3_STATION.id]: CANONICAL_DANH_NHAN_LOP3_STATION,
  [CANONICAL_BAO_TANG_DA_NANG_STATION.id]: CANONICAL_BAO_TANG_DA_NANG_STATION,
  [CANONICAL_NGU_HANH_SON_STATION.id]: CANONICAL_NGU_HANH_SON_STATION,
};

function withCanonicalDemo(stations: Station[]): Station[] {
  return stations.map(station => CANONICAL_DEMO_STATIONS[station.id] ?? station);
}

const FEATURED_STATION_BY_GRADE: Record<number, string> = {
  1: 'g1-station-4',
  2: 'g2-station-4',
  3: 'g3-station-2',
  4: 'g4-station-2',
  5: 'g5-station-4',
};

function featuredFirst(grade: number, stations: Station[]): Station[] {
  const featuredId = FEATURED_STATION_BY_GRADE[grade];
  return [...stations]
    .sort((a, b) => {
      if (a.id === featuredId) return -1;
      if (b.id === featuredId) return 1;
      return a.number - b.number;
    })
    .map((station, index) => ({ ...station, number: index + 1 }));
}

const STATIONS_BY_GRADE: Record<number, Station[]> = {
  1: featuredFirst(1, withCanonicalDemo(OFFICIAL_25_CATALOG.filter(c => c.grade === 1).map(catalogItemToStation))),
  2: featuredFirst(2, withCanonicalDemo(GRADE_2_STATIONS)),
  3: featuredFirst(3, withCanonicalDemo(OFFICIAL_25_CATALOG.filter(c => c.grade === 3).map(catalogItemToStation))),
  4: featuredFirst(4, withCanonicalDemo(OFFICIAL_25_CATALOG.filter(c => c.grade === 4).map(catalogItemToStation))),
  5: featuredFirst(5, withCanonicalDemo(OFFICIAL_25_CATALOG.filter(c => c.grade === 5).map(catalogItemToStation))),
};

export function getStationsForGrade(grade: number): Station[] {
  return STATIONS_BY_GRADE[grade] || STATIONS_BY_GRADE[2];
}

export const ALL_25_STATIONS: Station[] = [
  ...STATIONS_BY_GRADE[1],
  ...STATIONS_BY_GRADE[2],
  ...STATIONS_BY_GRADE[3],
  ...STATIONS_BY_GRADE[4],
  ...STATIONS_BY_GRADE[5],
];

ALL_25_STATIONS.forEach(station => contentService.apply(station));
