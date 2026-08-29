import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5010/api/v1";

function getJwtExpiry(token: string): number {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(Buffer.from(payload, "base64").toString());
    return decoded.exp * 1000;
  } catch (e) {
    return Date.now() + 15 * 60 * 1000;
  }
}

async function refreshAccessToken(token: any) {
  try {
    const res = await axios.post(`${BACKEND_URL}/auth/refresh-access-token`, {
      refreshToken: token.refreshToken,
    });
    if (res.data && res.data.data) {
      const { accessToken, refreshToken } = res.data.data;
      return {
        ...token,
        accessToken,
        refreshToken: refreshToken ?? token.refreshToken,
        accessTokenExpires: getJwtExpiry(accessToken),
      };
    }
  } catch (error) {
    console.error("Error refreshing NextAuth access token:", error);
  }
  return {
    ...token,
    error: "RefreshAccessTokenError",
  };
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const res = await axios.post(`${BACKEND_URL}/auth/login`, {
            email: credentials.email,
            password: credentials.password,
          });
          const responseData = res.data;
          if (responseData && responseData.data) {
            const { user, accessToken } = responseData.data;
            if (user.role !== "ADMIN") {
              throw new Error("AccessDenied");
            }

            return {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              accessToken,
              refreshToken: user.refreshToken,
            } as any;
          }
        } catch (error: any) {
          if (error instanceof Error && error.message === "AccessDenied") {
            throw error;
          }
          console.error("NextAuth authorize error:", error?.response?.data || error.message);
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (trigger === "update") {
        return refreshAccessToken(token);
      }

      if (user) {
        const u = user as any;
        token.accessToken = u.accessToken;
        token.refreshToken = u.refreshToken;
        token.role = u.role;
        token.id = u.id;
        token.accessTokenExpires = getJwtExpiry(u.accessToken);
        return token;
      }

      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken;
        if (session.user) {
          session.user.role = token.role;
          session.user.id = token.id;
        }
        if (token.error) {
          session.error = token.error;
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.includes("/login") || url === baseUrl) {
        return `${baseUrl}/dashboard`;
      }
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
};
