import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    session: { strategy: "jwt" },
    pages: { signIn: "/login" },
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                    include: { office: true },
                });
                if (!user || !user.password || !user.active) return null;
                const valid = await bcrypt.compare(credentials.password, user.password);
                if (!valid) return null;
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    officeId: user.officeId,
                    officeName: user.office?.name,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                token.role = (user as any).role;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                token.officeId = (user as any).officeId;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                token.officeName = (user as any).officeName;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (session.user as any).id = token.sub;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (session.user as any).role = token.role;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (session.user as any).officeId = token.officeId;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (session.user as any).officeName = token.officeName;
            }
            return session;
        },
    },
};
