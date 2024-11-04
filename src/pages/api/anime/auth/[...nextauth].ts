import NextAuth, { NextAuthOptions } from "next-auth";
import { clientData } from "@/modules/clientData";  // Your clientData
import { getViewerInfo, getViewerLists } from "@/modules/anilist/anilistsAPI"; // Import your functions
import type { MediaListStatus } from "@/types/anilistGraphQLTypes";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET, // Make sure you set this in .env
  providers: [
    {
      id: "anilist", // Provider ID (lowercase is recommended)
      name: "AniList",
      type: "oauth",
      wellKnown: "https://anilist.co/.well-known/openid-configuration", // Use wellKnown for dynamic config
      authorization: { params: { scope: "read" } }, // Request 'read' scope
      idToken: true, // Important for fetching user info later
      profile(profile) {
        return {
          id: profile.sub, // Use 'sub' as ID
          name: profile.name,
          avatar: profile.picture,
        };
      },
      clientId: process.env.ANILIST_CLIENT_ID, // Rename environment variable
      clientSecret: process.env.ANILIST_CLIENT_SECRET,
    },
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.id_token) {
        token.idToken = account.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.idToken) { // Fetch user info & lists in session callback
        try {
          const viewerInfo = await getViewerInfo(token.id as number);
          const viewerLists = await getViewerLists(
            token.id as number,
            "CURRENT" as MediaListStatus,
            "REPEATING" as MediaListStatus,
            "PAUSED" as MediaListStatus,
            "PLANNING" as MediaListStatus,
            "COMPLETED" as MediaListStatus,
            "DROPPED" as MediaListStatus
          );
          session.user = {
            ...session.user,
            name: viewerInfo.name,
            image: viewerInfo.avatar,
          };
          (session.user as any).id = viewerInfo.id;
          (session as any).lists = viewerLists;
        } catch (error) {
          console.error("Error fetching AniList data:", error);
          // Handle error, e.g., redirect to login
        }
      }
      return session;
    },
  },};

export default NextAuth(authOptions);