"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAccessToken, getViewerId, getViewerLists } from "@/modules/anilist/anilistsAPI";
import type { MediaListStatus } from "@/types/anilistGraphQLTypes";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    async function handleAuth() {
      const code = searchParams.get("code");
      if (!code) {
        router.push("/");
        return;
      }

      try {
        const accessToken = await getAccessToken(code);
        localStorage.setItem("access_token", accessToken);
        localStorage.set("logged", true);

        const viewerId = await getViewerId();
        localStorage.setItem("viewer_id", viewerId.toString());
        
        const lists = await getViewerLists(
          viewerId, 
          "CURRENT" as MediaListStatus,
          "REPEATING" as MediaListStatus, 
          "PAUSED" as MediaListStatus
        );
        
        if (lists) {
          localStorage.setItem("anime_lists", JSON.stringify(lists));
        }

        router.push("/");
      } catch (error) {
        console.error("Auth error details:", error instanceof Error ? error.message : String(error));
        router.push("/");
      }
    }    handleAuth();
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Logging in...</h2>
        <p>Connecting to AniList</p>
      </div>
    </div>
  );
}
