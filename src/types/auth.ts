export interface UserProfile {
  id: number;
  name: string;
  avatar?: {
    medium?: string;
  };
}

export interface AnimeListEntry {
  id: number | null;
  mediaId: number | null;
  progress: number | null;
  media: {
    id: number;
    title: {
      english?: string;
      romaji?: string;
    };
    coverImage?: {
      large?: string;
    };
    episodes?: number;
    status?: string;
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  lists: AnimeListEntry[];
  isLoading: boolean;
  error: string | null;
}

export interface AuthResponse {
  success: boolean;
  user?: UserProfile;
  lists?: AnimeListEntry[];
  error?: string;
}