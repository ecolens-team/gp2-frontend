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
  userId: string;
  username: string;
  avatar?: string;
  score: number;
  rank: number;
}

export interface QuestSubmission {
  id: string;
  imageUrl: string;
  username: string;
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
  submissions?: QuestSubmission[];
  userTotalPoints?: number;
}
