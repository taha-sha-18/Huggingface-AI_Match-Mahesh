export interface User {
  user_id: string;
  email: string;
  name: string;
  picture?: string;
  created_at: string;
  value_profile?: ValueProfile;
  environment_preferences?: EnvironmentPreferences;
  game_completed: boolean;
}

export interface ValueProfile {
  community_oriented: number;
  structured: number;
  competitive: number;
  intellectual: number;
  tradition: number;
}

export interface EnvironmentPreferences {
  group_size: string;
  interaction_style: string;
  pace: string;
  frequency: string;
  social_energy: string;
}

export interface Community {
  community_id: string;
  name: string;
  description: string;
  image?: string;
  creator_id: string;
  created_at: string;
  members: string[];
  value_profile: ValueProfile;
  environment_settings: {
    group_size: string;
    interaction_style: string;
    pace: string;
  };
  member_count: number;
}

export interface CommunityMatch extends Community {
  compatibility_score: number;
  why_it_matches: string;
  possible_friction?: string;
}

export interface GameRound {
  round: number;
  word: string;
}
