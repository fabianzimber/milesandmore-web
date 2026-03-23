import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Twitch from "next-auth/providers/twitch";

const adminTwitchIds = (process.env.ADMIN_TWITCH_IDS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET || undefined,
  trustHost: true,
  providers: [
    Twitch({
      clientId: process.env.TWITCH_APP_CLIENT_ID,
      clientSecret: process.env.TWITCH_APP_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      const twitchId =
        account?.provider === "twitch"
          ? account.providerAccountId || (typeof profile?.sub === "string" ? profile.sub : "")
          : "";

      return adminTwitchIds.includes(twitchId);
    },
    async session({ session, token }) {
      const twitchId = typeof token.twitchId === "string" ? token.twitchId : undefined;
      if (session.user && twitchId) {
        session.user.id = twitchId;
      }
      return session;
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === "twitch") {
        token.twitchId =
          account.providerAccountId || (typeof profile?.sub === "string" ? profile.sub : undefined);
      }
      return token;
    },
  },
  pages: {
    signIn: "/admin/signin",
    error: "/admin/signin",
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
