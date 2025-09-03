import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const phoneSchema = z.object({
    type: z.string().min(1, 'Tipo é obrigatório'),
    number: z.string().min(10, 'Número deve ter pelo menos 10 dígitos').max(15, 'Número muito longo'),
    contact: z.string().max(50).optional().or(z.literal('')),
});

// PUT /api/customers/[id]/phones/[phoneId] - Atualizar telefone
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; phoneId: string }> }
) {
    try {
        const { id: customerId, phoneId } = await params;
        const body = await request.json();

        // Validar dados
        const validatedData = phoneSchema.parse(body);

        // Verificar se o telefone existe e pertence ao cliente
        const existingPhone = await prisma.phone.findFirst({
            where: {
                id: phoneId,
                customerId,
            },
        });

        if (!existingPhone) {
            return NextResponse.json(
                { error: 'Telefone não encontrado' },
                { status: 404 }
            );
        }

        // Limpar número (remover formatação)
        const cleanNumber = validatedData.number.replace(/\D/g, '');

        // Verificar se já existe outro telefone com o mesmo número para este cliente
        const duplicatePhone = await prisma.phone.findFirst({
            where: {
                customerId,
                number: cleanNumber,
                id: { not: phoneId }, // Excluir o telefone atual da verificação
            },
        });

        if (duplicatePhone) {
            return NextResponse.json(
                { error: 'Este número já está cadastrado para este cliente' },
                { status: 400 }
            );
        }

        // Atualizar telefone
        const updatedPhone = await prisma.phone.update({
            where: { id: phoneId },
            data: {
                type: validatedData.type,
                number: cleanNumber,
                contact: validatedData.contact || null,
                updatedAt: new Date(),
            },
        });

        return NextResponse.json(updatedPhone);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Dados inválidos', details: error.issues },
                { status: 400 }
            );
        }

        console.error('Erro ao atualizar telefone:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

// DELETE /api/customers/[id]/phones/[phoneId] - Excluir telefone
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; phoneId: string }> }
) {
    try {
        const { id: customerId, phoneId } = await params;

        // Verificar se o telefone existe e pertence ao cliente
        const existingPhone = await prisma.phone.findFirst({
            where: {
                id: phoneId,
                customerId,
            },
        });

        if (!existingPhone) {
            return NextResponse.json(
                { error: 'Telefone não encontrado' },
                { status: 404 }
            );
        }

        // Excluir telefone
        await prisma.phone.delete({
            where: { id: phoneId },
        });

        return NextResponse.json(
            { message: 'Telefone excluído com sucesso' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Erro ao excluir telefone:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}