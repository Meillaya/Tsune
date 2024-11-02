"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAccessToken, getViewerId, getViewerLists } from "@/modules/anilist/anilistsAPI";
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
        // Run essential operations
        const accessToken = await getAccessToken(code);
        sessionStorage.setItem("access_token", accessToken);
        sessionStorage.setItem("logged", "true");

        const viewerId = await getViewerId();
        sessionStorage.setItem("viewer_id", viewerId.toString());

        // Get lists in background after redirect
        router.push("/");
        
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

      } catch (error) {
        console.error("Auth error:", error);
        router.push("/");
      }
    };

    handleAuth();
  }, [router, searchParams]);

  return null;
}
