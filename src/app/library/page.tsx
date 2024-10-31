"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContinueWatchingSection } from "@/components/ContinueWatchingSection";
import { MyListSection } from "@/components/library/my-list-section";
import { Button } from "@/components/ui/button";
import { LoginDialog } from "@/components/auth/login-dialog";
import { useAuth } from "@/hooks/useAuth";

export const dynamic = 'force-dynamic';

export default function LibraryPage() {
  const { isAuthenticated } = useAuth();
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

  return (
    <div className="container py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">My Library</h1>
        {!isAuthenticated && (
          <Button onClick={() => setIsLoginDialogOpen(true)}>
            Connect with AniList
          </Button>
        )}
      </div>

      <Tabs defaultValue="continue" className="space-y-6">
        <TabsList>
          <TabsTrigger value="continue">Continue Watching</TabsTrigger>
          <TabsTrigger value="list">My List</TabsTrigger>
        </TabsList>

        <TabsContent value="continue" className="space-y-6">
          <ContinueWatchingSection />
        </TabsContent>

        <TabsContent value="list" className="space-y-6">
          <MyListSection />
        </TabsContent>
      </Tabs>

      <LoginDialog 
        isOpen={isLoginDialogOpen}
        onOpenChange={setIsLoginDialogOpen}
        onLogin={async () => false}
        isLoading={false}
        error={null}
      />
    </div>
  );
}