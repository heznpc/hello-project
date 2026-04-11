export type Locale = "ko" | "ja" | "en";

export const LOCALES: { code: Locale; label: string }[] = [
  { code: "ko", label: "한국어" },
  { code: "ja", label: "日本語" },
  { code: "en", label: "English" },
];

const t = {
  // Nav
  "nav.title": {
    ko: "H!P 뷰어",
    ja: "H!P ビューアー",
    en: "H!P Viewer",
  },
  "nav.timeline": {
    ko: "타임라인",
    ja: "タイムライン",
    en: "Timeline",
  },
  "nav.distribution": {
    ko: "파트 분배",
    ja: "パート分析",
    en: "Distribution",
  },

  // Home
  "home.title": {
    ko: "Hello! Project 뷰어",
    ja: "Hello! Project ビューアー",
    en: "Hello! Project Viewer",
  },
  "home.stats": {
    ko: (m: number, g: number, ms: number) =>
      `${m}명 멤버 \u2661 ${g}개 그룹 \u2661 ${ms}건 소속`,
    ja: (m: number, g: number, ms: number) =>
      `${m}人メンバー \u2661 ${g}グループ \u2661 ${ms}件所属`,
    en: (m: number, g: number, ms: number) =>
      `${m} members \u2661 ${g} groups \u2661 ${ms} memberships`,
  },
  "home.timeline.title": {
    ko: "멤버 타임라인",
    ja: "メンバータイムライン",
    en: "Member Timeline",
  },
  "home.timeline.desc": {
    ko: (g: number, y: number) => `\u2729 ${g}개 그룹, ${y}년 이상의 역사 \u2729`,
    ja: (g: number, y: number) => `\u2729 ${g}グループ、${y}年以上の歴史 \u2729`,
    en: (g: number, y: number) => `\u2729 ${g} groups across ${y}+ years of history \u2729`,
  },
  "home.distribution.title": {
    ko: "파트 분배 분석",
    ja: "パート分析",
    en: "Line Distribution",
  },
  "home.distribution.desc": {
    ko: "\u2729 곡별 파트 분석 (준비 중) \u2729",
    ja: "\u2729 楽曲ごとのパート分析（準備中）\u2729",
    en: "\u2729 Per-song part analysis (coming soon) \u2729",
  },
  "home.activeGroups": {
    ko: "활동 중인 그룹",
    ja: "活動中のグループ",
    en: "Active Groups",
  },

  // Timeline
  "timeline.groups": {
    ko: "그룹",
    ja: "グループ",
    en: "Groups",
  },
  "timeline.all": {
    ko: "전체",
    ja: "すべて",
    en: "All",
  },
  "timeline.none": {
    ko: "해제",
    ja: "解除",
    en: "None",
  },
  "timeline.current": {
    ko: "활동 중",
    ja: "活動中",
    en: "current",
  },
  "timeline.graduation": {
    ko: "\u2661 졸업",
    ja: "\u2661 卒業",
    en: "\u2661 graduation",
  },
  "timeline.withdrawal": {
    ko: "탈퇴",
    ja: "脱退",
    en: "withdrawal",
  },
  "timeline.dissolution": {
    ko: "해산",
    ja: "解散",
    en: "dissolution",
  },
  "timeline.transfer": {
    ko: "이적",
    ja: "移籍",
    en: "transfer",
  },

  // Distribution
  "distribution.title": {
    ko: "파트 분배 분석",
    ja: "パート分析",
    en: "Line Distribution",
  },
  "distribution.empty": {
    ko: "곡 데이터가 아직 수집되지 않았습니다 \u2661",
    ja: "楽曲データはまだ収集されていません \u2661",
    en: "Song data not yet collected \u2661",
  },
  "distribution.howto": {
    ko: "아래 명령어를 실행하여 데이터를 채워주세요",
    ja: "以下のコマンドを実行してデータを追加してください",
    en: "Run the following command to populate",
  },
} as const;

export type TranslationKey = keyof typeof t;

export function getTranslation(key: TranslationKey, locale: Locale) {
  return t[key]?.[locale] ?? t[key]?.["en"];
}

export function detectLocale(): Locale {
  if (typeof window === "undefined") return "ko";

  const saved = localStorage.getItem("hp-locale");
  if (saved && ["ko", "ja", "en"].includes(saved)) return saved as Locale;

  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith("ja")) return "ja";
  if (browserLang.startsWith("ko")) return "ko";
  if (browserLang.startsWith("en")) return "en";
  return "ko"; // fallback
}
