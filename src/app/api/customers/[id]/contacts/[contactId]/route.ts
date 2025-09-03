import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema de validação para contatos
const contactSchema = z.object({
    type: z.string().optional(),
    name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
    birthDate: z.string().optional(),
    gender: z.enum(['MASCULINO', 'FEMININO', 'OUTRO']).optional(),
    email: z.email('Email inválido').optional().or(z.literal('')),
    phone: z.string().optional(),
    cellPhone: z.string().optional(),
    position: z.string().max(100, 'Cargo deve ter no máximo 100 caracteres').optional(),
});

// GET - Buscar contato específico
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; contactId: string }> }
) {
    try {
        const { id, contactId } = await params;

        const contact = await prisma.contact.findFirst({
            where: {
                id: contactId,
                customerId: id,
            },
        });

        if (!contact) {
            return NextResponse.json(
                { message: 'Contato não encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json(contact);
    } catch (error) {
        console.error('Erro ao buscar contato:', error);
        return NextResponse.json(
            { message: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

// PUT - Atualizar contato
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; contactId: string }> }
) {
    try {
        const { id, contactId } = await params;
        const body = await request.json();

        // Validar dados
        const validatedData = contactSchema.parse(body);

        // Verificar se o contato existe e pertence ao cliente
        const existingContact = await prisma.contact.findFirst({
            where: {
                id: contactId,
                customerId: id,
            },
        });

        if (!existingContact) {
            return NextResponse.json(
                { message: 'Contato não encontrado' },
                { status: 404 }
            );
        }

        // Verificar se já existe outro contato com o mesmo email (se fornecido)
        if (validatedData.email) {
            const duplicateContact = await prisma.contact.findFirst({
                where: {
                    email: validatedData.email,
                    customerId: id,
                    id: { not: contactId },
                },
            });

            if (duplicateContact) {
                return NextResponse.json(
                    { message: 'Já existe outro contato com este email para este cliente' },
                    { status: 400 }
                );
            }
        }

        // Atualizar o contato
        const updatedContact = await prisma.contact.update({
            where: {
                id: contactId,
            },
            data: validatedData,
        });

        return NextResponse.json(updatedContact);
    } catch (error) {
        console.error('Erro ao atualizar contato:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: 'Dados inválidos', errors: error.issues },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

// DELETE - Excluir contato
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; contactId: string }> }
) {
    try {
        const { id, contactId } = await params;

        // Verificar se o contato existe e pertence ao cliente
        const existingContact = await prisma.contact.findFirst({
            where: {
                id: contactId,
                customerId: id,
            },
        });

        if (!existingContact) {
            return NextResponse.json(
                { message: 'Contato não encontrado' },
                { status: 404 }
            );
        }

        // Excluir o contato
        await prisma.contact.delete({
            where: {
                id: contactId,
            },
        });

        return NextResponse.json(
            { message: 'Contato excluído com sucesso' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Erro ao excluir contato:', error);
        return NextResponse.json(
            { message: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}