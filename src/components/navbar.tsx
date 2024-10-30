"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchCommand } from "@/components/search-command";
import { clientData } from "@/modules/clientData";
import { 
  getViewerInfo,
  getViewerId,
  getViewerLists,
  getAccessToken,
  getViewerList,
  getAnimeInfo
} from "@/modules/anilist/anilistsAPI";
import {
  getAnimeHistory,
  getHistoryEntries,
  getLastWatchedEpisode,
  setAnimeHistory,
} from '../modules/history';
import type { ListAnimeData, UserInfo } from '@/types/anilistAPITypes';
import {
  Moon,
  Sun,
  Menu,
  X,
  PlayCircle,
  BookmarkPlus,
  BarChart2,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AnimeHistoryEntry } from "@/types/historyTypes";
import { useLists } from '@/context/ListsContext';

interface UserData {
  id: number;
  name: string;
  avatar?: {
    medium?: string;
  };
}

export function Navbar() {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const authUrl = `https://anilist.co/api/v2/oauth/authorize?client_id=${clientData.clientId}&redirect_uri=${clientData.redirectUri}&response_type=code`;
  const { theme, setTheme } = useTheme();
  const [viewerId, setViewerId] = useState<number | null>(null);
  const [currentListAnime, setCurrentListAnime] = useState<ListAnimeData[]>([]);
  const [planningListAnime, setPlanningListAnime] = useState<ListAnimeData[]>([]);
  const [recommendedAnime, setRecommendedAnime] = useState<ListAnimeData[]>();
  const entries = getHistoryEntries();
  const historyAvailable = Object.values(entries).length > 0;
  let result: ListAnimeData[] = [];
  const { setCurrentLists, setIsListsLoading } = useLists();
  
  const sortNewest = (a: ListAnimeData, b: ListAnimeData) =>
    (getLastWatchedEpisode(
      (b.media.id ??
        (b.media.mediaListEntry && b.media.mediaListEntry.id)) as number,
    )?.timestamp ?? 0) -
    (getLastWatchedEpisode(
      (a.media.id ??
        (a.media.mediaListEntry && a.media.mediaListEntry.id)) as number,
    )?.timestamp ?? 0);

    const updateRecommended = async (history: ListAnimeData[]) => {
      const animeData = history[Math.floor(Math.random() * (history.length - 1))];
  
      if (animeData.media.recommendations === undefined) {
        animeData.media = await getAnimeInfo(animeData.media.id);
        const entry = getAnimeHistory(animeData.media.id as number);
        if (entry) {
          entry.data = animeData;
          setAnimeHistory(entry);
        }
      }
  
      const recommendedList = animeData.media.recommendations?.nodes.map(
        (value) => {
          return {
            id: null,
            mediaId: null,
            progress: null,
            media: value.mediaRecommendation,
          } as ListAnimeData;
        },
      );
  
      recommendedList?.push(animeData);
  
      setRecommendedAnime(recommendedList);
    };

const handleTokenSubmit = async () => {
  try {
    const accessToken = await getAccessToken(token);
    localStorage.setItem('access_token', accessToken);
    
    const id = await getViewerId();
    localStorage.setItem('viewer_id', id.toString());
    
    const userData = await getViewerInfo(id);
    setUser(userData);

    
    result = await getViewerLists(id, 'CURRENT', 'REPEATING', 'PAUSED');
    const planningListAnime = await getViewerList(id, "PLANNING");
   
    setCurrentListAnime(result);
    setPlanningListAnime(planningListAnime);

    result = Object.values(entries)
    .map((value) => value.data)
    .sort(sortNewest);
    
    
    localStorage.setItem("anime_lists", JSON.stringify(result));
    setCurrentLists(result);
    setIsListsLoading(false);
  } catch (error) {
    console.error('Login error:', error);
    localStorage.removeItem('access_token');
  }
};

useEffect(() => {


    async function loadPersistedUserData() {
      setIsListsLoading(true);
      const accessToken = localStorage.getItem('access_token');
      const viewerId = localStorage.getItem('viewer_id');
     
      if (accessToken && viewerId) {
        try {
          const userData = await getViewerInfo(parseInt(viewerId));
          setUser(userData);
         
          let currentList = await getViewerLists(parseInt(viewerId), 'CURRENT', 'REPEATING', 'PAUSED');
  //         const planningList = await getViewerList(parseInt(viewerId), "PLANNING");
          console.log(currentList);
          setCurrentListAnime(currentList);
  //         setPlanningListAnime(planningList);

  //         currentList = Object.values(entries)
  //         .map((value) => value.data)
  //         .sort(sortNewest);

      
          localStorage.setItem("anime_lists", JSON.stringify(currentList));
          setCurrentLists(currentList);
          console.log("Global Lists Data:", currentList);
        } catch (error) {
          console.error('Failed to load persisted user data:', error);
          handleLogout();
        }
      }
    setIsListsLoading(false);
    }  
    loadPersistedUserData();
  }, [entries, setCurrentLists, setIsListsLoading]);



  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("viewer_id");
    localStorage.removeItem("anime_lists");
    setUser(null);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navLinks = [
    { href: "/", label: "Home", icon: PlayCircle },
    { href: "/watchlist", label: "Watchlist", icon: BookmarkPlus },
    { href: "/stats", label: "Stats", icon: BarChart2 },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-14 sm:h-16 items-center">
        <div className="flex items-center gap-2 sm:gap-6 flex-1">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMenu}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>

          <Link href="/" className="flex items-center space-x-2">
            <PlayCircle className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">AniStream</span>
          </Link>

          <div className="hidden md:flex gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <SearchCommand />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="h-9 w-9 sm:h-10 sm:w-10"
          >
            <Sun className="h-4 w-4 sm:h-5 sm:w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 sm:h-5 sm:w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Image
                    src={user.avatar?.medium || ""}
                    alt={user.name}
                    fill
                    className="rounded-full object-cover"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  onClick={() => window.open(authUrl, '_blank')}
                  className="ml-2"
                >
                  Login with AniList
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Enter Your AniList Token</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Input
                    placeholder="Paste your token here..."
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                  />
                  <Button onClick={handleTokenSubmit}>Submit</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </nav>

      {isMenuOpen && (
        <div className="border-b bg-background p-4 md:hidden">
          <div className="grid gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
