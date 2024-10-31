import { getAccessToken, getViewerId, getViewerInfo, getViewerLists } from "@/modules/anilist/anilistsAPI";
import type { AuthResponse, AnimeListEntry } from "@/types/auth";
import type { MediaListStatus } from "@/types/anilistGraphQLTypes";

export async function authenticateUser(token: string): Promise<AuthResponse> {
  try {
    const accessToken = await getAccessToken(token);
    if (!accessToken) {
      return { success: false, error: "Failed to obtain access token" };
    }

    sessionStorage.setItem("access_token", accessToken);

    const viewerId = await getViewerId();
    if (!viewerId) {
      return { success: false, error: "Failed to obtain user ID" };
    }

    sessionStorage.setItem("viewer_id", viewerId.toString());

    const userData = await getViewerInfo(viewerId);
    if (!userData) {
      return { success: false, error: "Failed to fetch user data" };
    }

    const lists = await getViewerLists(
      viewerId,
      "CURRENT" as MediaListStatus,
      "REPEATING" as MediaListStatus,
      "PAUSED" as MediaListStatus
    );

    const serializedLists: AnimeListEntry[] = lists.map(item => ({
      id: item.id,
      mediaId: item.mediaId,
      progress: item.progress,
      media: {
        id: item.media.id,
        title: {
          english: item.media.title?.english,
          romaji: item.media.title?.romaji
        },
        coverImage: {
          large: item.media.coverImage?.large
        },
        episodes: item.media.episodes,
        status: item.media.status
      }
    }));

    sessionStorage.setItem("anime_lists", JSON.stringify(serializedLists));

    return {
      success: true,
      user: {
        id: userData.id,
        name: userData.name,
        avatar: {
          medium: userData.avatar?.medium
        }
      },
      lists: serializedLists
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Authentication failed"
    };
  }
}

export function clearAuthSession(): void {
  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("viewer_id");
  sessionStorage.removeItem("anime_lists");
}

export function loadPersistedAuth(): AuthResponse {
  try {
    const accessToken = sessionStorage.getItem("access_token");
    const viewerId = sessionStorage.getItem("viewer_id");
    const listsData = sessionStorage.getItem("anime_lists");

    if (!accessToken || !viewerId) {
      return { success: false };
    }

    const lists = listsData ? JSON.parse(listsData) : [];

    return {
      success: true,
      lists
    };
  } catch (error) {
    console.error("Error loading persisted auth:", error);
    return { success: false, error: "Failed to load saved session" };
  }
}