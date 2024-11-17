import { useSession } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();
  
  return {
    isAuthenticated: status === "authenticated",
    user: session?.user,
    lists: session?.lists,
    status
  };
}
