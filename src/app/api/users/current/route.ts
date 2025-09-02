import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Para desenvolvimento, vamos buscar o primeiro usuário Admin do banco
        // Em produção, isso seria baseado na sessão/JWT do usuário autenticado
        const currentUser = await prisma.user.findFirst({
            where: {
                role: 'Admin',
                status: '1' // Ativo
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatarUrl: true
            }
        });

        if (!currentUser) {
            return NextResponse.json(
                { success: false, error: 'No admin user found in database' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            user: currentUser
        });

    } catch (error) {
        console.error('Error fetching current user:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}