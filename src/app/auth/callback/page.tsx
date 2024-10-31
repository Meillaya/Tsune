import { Suspense } from "react";
import { LoadingSpinner } from "@/components/loading-spinner";
import AuthCallbackContent from "./AuthCallbackContent";

export const dynamic = "force-dynamic";

export default function AuthCallback() {
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