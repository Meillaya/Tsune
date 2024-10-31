"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAccessToken, getViewerId, getViewerLists } from "@/modules/anilist/anilistsAPI";
import type { MediaListStatus } from "@/types/anilistGraphQLTypes";
import { Suspense } from "react";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    async function handleAuth() {
      if (typeof window === 'undefined') return;

      const code = searchParams.get("code");
      if (!code) {
        router.push("/");
        return;
      }

      try {
        const accessToken = await getAccessToken(code);
        sessionStorage.setItem("access_token", accessToken);
        sessionStorage.setItem("logged", "true");

        const viewerId = await getViewerId();
        sessionStorage.setItem("viewer_id", viewerId.toString());
        
        const lists = await getViewerLists(
          viewerId, 
          "CURRENT" as MediaListStatus,
          "REPEATING" as MediaListStatus, 
          "PAUSED" as MediaListStatus
        );
        
        if (lists) {
          sessionStorage.setItem("anime_lists", JSON.stringify(lists));
        }

        router.push(process.env.NEXT_PUBLIC_BASE_URL || "/");
      } catch (error) {
        console.error("Auth error details:", error instanceof Error ? error.message : String(error));
        router.push(process.env.NEXT_PUBLIC_BASE_URL || "/");
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

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}