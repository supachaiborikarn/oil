import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// PUT update a specific user
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !(session.user as any).officeId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Only Admin can update users
        const userRole = (session.user as any).role;
        if (userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const data = await request.json();
        const { name, email, password, role, active } = data;

        // Check if user exists and belongs to the same office
        const existingUser = await prisma.user.findUnique({
            where: { id },
        });

        if (!existingUser || existingUser.officeId !== (session.user as any).officeId) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // If email is changed, check if new email is already taken
        if (email && email !== existingUser.email) {
            const emailTaken = await prisma.user.findUnique({
                where: { email },
            });
            if (emailTaken) {
                return NextResponse.json(
                    { error: "อีเมลนี้มีผู้ใช้งานแล้ว (Email already exists)" },
                    { status: 400 }
                );
            }
        }

        const updateData: any = {
            name,
            email,
            role,
            active,
        };

        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                active: true,
            },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json(
            { error: "Failed to update user" },
            { status: 500 }
        );
    }
}

// DELETE a specific user
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !(session.user as any).officeId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Only Admin can delete users
        const userRoleDel = (session.user as any).role;
        if (userRoleDel !== "ADMIN" && userRoleDel !== "SUPERADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Prevent self-deletion
        if (id === (session.user as any).id) {
            return NextResponse.json(
                { error: "ไม่สามารถลบบัญชีของตนเองได้ (Cannot delete self)" },
                { status: 400 }
            );
        }

        // Verify user exists and belongs to the same office
        const existingUser = await prisma.user.findUnique({
            where: { id },
        });

        if (!existingUser || existingUser.officeId !== (session.user as any).officeId) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        await prisma.user.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json(
            { error: "Failed to delete user" },
            { status: 500 }
        );
    }
}
