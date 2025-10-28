export interface PlayerData {
  id: string;
  name: string;
  totalPoints: number;
  previousTotalPoints: number;
  presence: number;
  wins: number;
  pointsToday: number;
  accumulatedValue: number;
}

// RankingPlayer agora é apenas PlayerData com a adição de 'rank'
export type RankingPlayer = PlayerData & {
  rank: number;
};


export interface WeeklyResult {
  playerId: string;
  rank: number;
}

export interface Week {
  id: string;
  date: string; // ISO string date
  results: WeeklyResult[];
  isDoubled?: boolean;
}