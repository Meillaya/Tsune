"use client"; // Indicate this is a client component

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/loading-spinner";
import AuthCallbackContent from "./AuthCallbackContent";

export const dynamic = "force-dynamic";

export default function AuthCallback() {
    const router = useRouter();

    useEffect(() => {
        // After authentication, redirect back to the original page or to the homepage
        router.refresh(); // Use router.refresh() to trigger a re-render with updated auth state
    }, [router]);


  return (
    <Suspense 
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <LoadingSpinner />
            <h2 className="mt-4 text-xl font-semibold">
              Initializing...
            </h2>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}