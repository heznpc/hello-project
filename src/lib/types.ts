export interface Member {
  id: string;
  nameJa: string;
  nameEn: string;
  nameKo?: string;
  color: string;
  birthDate: string;
  mbid?: string;
}

export interface Group {
  id: string;
  nameJa: string;
  nameEn: string;
  formed: string;
  dissolved?: string;
  color: string;
  mbid?: string;
}

export interface Membership {
  memberId: string;
  groupId: string;
  joinDate: string;
  leaveDate?: string;
  role?: "leader" | "sub-leader" | "member";
  leaveReason?: "graduation" | "withdrawal" | "dissolution" | "transfer";
  generation?: string;
}

export interface Song {
  id: string;
  titleJa: string;
  titleEn: string;
  groupId: string;
  releaseDate: string;
  type: "single" | "album-track" | "coupling";
  youtubeId?: string;
}

export interface LineDistribution {
  songId: string;
  lines: {
    memberId: string;
    seconds: number;
    percentage: number;
  }[];
  totalSeconds: number;
}
