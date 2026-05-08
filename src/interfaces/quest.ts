
export interface QuestReward {
  type: 'POINTS' | 'BADGE';
  value: string | number;
  label: string;
}

export interface QuestOrganizer {
  id: string;
  name: string;
  avatar?: string;
  role: string;
}

export interface QuestLeaderboardEntry {
  user: {
    username: string,
    profile_picture: string,
    id: number
  }
  observation_count: number;
  id: number
}

export interface QuestSubmission {
  id: string;
  images: {
    thumbnail: string
  }[]
  user: {
    username: string
  };
  timestamp: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  rules?: string;
  rewardPts: number;
  progressPercent: number;
  isJoined?: boolean;
  category: 'PLANT' | 'INSECT' | 'GENERAL';
  image?: string;
  startDate?: string;
  endDate?: string;
  rewards?: QuestReward[];
  organizers?: QuestOrganizer[];
  leaderboard?: QuestLeaderboardEntry[];
  totalParticipants?: number;
  recent_submissions?: QuestSubmission[];
  userTotalPoints?: number;
}
