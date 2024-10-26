"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Moon,
  Sun,
  Search,
  Menu,
  X,
  PlayCircle,
  BookmarkPlus,
  BarChart2,
} from "lucide-react";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navLinks = [
    { href: "/", label: "Home", icon: PlayCircle },
    { href: "/watchlist", label: "Watchlist", icon: BookmarkPlus },
    { href: "/stats", label: "Stats", icon: BarChart2 },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <PlayCircle className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">AniStream</span>
          </Link>
          <div className="flex gap-6">
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

        <div className="flex flex-1 items-center justify-end space-x-2">
          <div className="w-full max-w-[300px]">
            <form className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search anime..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
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