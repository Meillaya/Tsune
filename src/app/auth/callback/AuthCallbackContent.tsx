"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAccessToken, getViewerId, getViewerLists } from "@/modules/anilist/anilistsAPI";
import type { MediaListStatus } from "@/types/anilistGraphQLTypes";
import { LoadingSpinner } from "@/components/loading-spinner";

export default function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function handleAuth() {
      try {
        const code = searchParams.get("code");
        if (!code) {
          setError("No authorization code provided");
          setTimeout(() => router.push("/"), 2000);
          return;
        }

        const accessToken = await getAccessToken(code);
        if (!accessToken || !mounted) return;

        if (typeof window !== 'undefined') {
          sessionStorage.setItem("access_token", accessToken);
          sessionStorage.setItem("logged", "true");
        }

        const viewerId = await getViewerId();
        if (!viewerId || !mounted) return;

        if (typeof window !== 'undefined') {
          sessionStorage.setItem("viewer_id", viewerId.toString());
        }

        const lists = await getViewerLists(
          viewerId,
          "CURRENT" as MediaListStatus,
          "REPEATING" as MediaListStatus,
          "PAUSED" as MediaListStatus
        );

        if (lists && mounted && typeof window !== 'undefined') {
          sessionStorage.setItem("anime_lists", JSON.stringify(lists));
        }

        if (mounted) {
          router.push("/");
        }
      } catch (error) {
        console.error("Auth error:", error);
        if (mounted) {
          setError("Authentication failed. Please try again.");
          setTimeout(() => router.push("/"), 2000);
        }
      } finally {
        if (mounted) {
          setIsProcessing(false);
        }
      }
    }

    handleAuth();

    return () => {
      mounted = false;
    };
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">{error}</h2>
          <p className="text-muted-foreground">Redirecting to home page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <LoadingSpinner />
        <h2 className="mt-4 text-xl font-semibold">
          {isProcessing ? "Logging in..." : "Redirecting..."}
        </h2>
        <p className="text-muted-foreground">
          {isProcessing ? "Connecting to AniList" : "Almost there..."}
        </p>
      </div>
    </div>
  );
}