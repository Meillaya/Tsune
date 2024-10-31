import { useState, useEffect } from "react";
import { authenticateUser, clearAuthSession, loadPersistedAuth } from "@/lib/auth";
import type { AuthState, UserProfile, AnimeListEntry } from "@/types/auth";

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  lists: [],
  isLoading: true,
  error: null
};

export function useAuth() {
  const [state, setState] = useState<AuthState>(initialState);

  useEffect(() => {
    const loadAuth = async () => {
      const persisted = loadPersistedAuth();
      if (persisted.success && persisted.lists) {
        setState({
          isAuthenticated: true,
          user: persisted.user || null,
          lists: persisted.lists,
          isLoading: false,
          error: null
        });
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadAuth();
  }, []);

  const login = async (token: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await authenticateUser(token);
      
      if (response.success && response.user && response.lists) {
        setState({
          isAuthenticated: true,
          user: response.user,
          lists: response.lists,
          isLoading: false,
          error: null
        });
        return true;
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.error || "Authentication failed"
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: "An unexpected error occurred"
      }));
      return false;
    }
  };

  const logout = () => {
    clearAuthSession();
    setState({
      isAuthenticated: false,
      user: null,
      lists: [],
      isLoading: false,
      error: null
    });
  };

  const updateLists = (newLists: AnimeListEntry[]) => {
    setState(prev => ({
      ...prev,
      lists: newLists
    }));
    sessionStorage.setItem("anime_lists", JSON.stringify(newLists));
  };

  return {
    ...state,
    login,
    logout,
    updateLists
  };
}