"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAccessToken, getViewerId, getViewerInfo, getViewerLists } from "@/modules/anilist/anilistsAPI";
import type { MediaListStatus } from "@/types/anilistGraphQLTypes";

export default function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuth = async () => {
      const code = searchParams?.get("code");
      if (!code) {
        router.push("/");
        return;
      }

      try {
        // Get and store access token
        const accessToken = await getAccessToken(code);
        sessionStorage.setItem("access_token", accessToken);

        // Get and store user ID
        const viewerId = await getViewerId();
        sessionStorage.setItem("viewer_id", viewerId.toString());

        // Store user data in background
        getViewerInfo(viewerId).then(userData => {
          const userProfile = {
            id: userData.id,
            name: userData.name,
            avatar: {
              medium: userData.avatar?.medium
            }
          };
          sessionStorage.setItem("user_data", JSON.stringify(userProfile));
        });

        // Get lists in background
        getViewerLists(
          viewerId,
          "CURRENT" as MediaListStatus,
          "REPEATING" as MediaListStatus,
          "PAUSED" as MediaListStatus
        ).then(lists => {
          if (lists) {
            sessionStorage.setItem("anime_lists", JSON.stringify(lists));
          }
        });

        // Redirect immediately after essential data is stored
        router.push("/");
        
      } catch (error) {
        console.error("Auth error:", error);
        router.push("/");
      }
    };

    handleAuth();
  }, [router, searchParams]);

  return null;
}
