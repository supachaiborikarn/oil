import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET all users in the same office
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !(session.user as any).officeId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Only Admin or Manager can view user list
        const userRole = (session.user as any).role;
        if (userRole !== "ADMIN" && userRole !== "SUPERADMIN" && userRole !== "MANAGER") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const users = await prisma.user.findMany({
            where: {
                officeId: (session.user as any).officeId,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                active: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        );
    }
}

// POST create a new user
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !(session.user as any).officeId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Only Admin can create new users
        const userRolePost = (session.user as any).role;
        if (userRolePost !== "ADMIN" && userRolePost !== "SUPERADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const data = await request.json();
        const { name, email, password, role, active } = data;

        if (!name || !email || !password || !role) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "อีเมลนี้มีผู้ใช้งานแล้ว (Email already exists)" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                active: active !== undefined ? active : true,
                officeId: (session.user as any).officeId,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                active: true,
            },
        });

        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json(
            { error: "Failed to create user" },
            { status: 500 }
        );
    }
}
