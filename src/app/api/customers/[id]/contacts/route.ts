import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema de validação para contatos
const contactSchema = z.object({
    type: z.string().optional(),
    name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
    birthDate: z.string().optional(),
    gender: z.enum(['MASCULINO', 'FEMININO', 'OUTRO']).optional(),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    phone: z.string().optional(),
    cellPhone: z.string().optional(),
    position: z.string().max(100, 'Cargo deve ter no máximo 100 caracteres').optional(),
});

// GET - Listar contatos do cliente
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const contacts = await prisma.contact.findMany({
            where: {
                customerId: id,
            },
            orderBy: {
                name: 'asc',
            },
        });

        return NextResponse.json(contacts);
    } catch (error) {
        console.error('Erro ao buscar contatos:', error);
        return NextResponse.json(
            { message: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

// POST - Criar novo contato
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Validar dados
        const validatedData = contactSchema.parse(body);

        // Verificar se o cliente existe
        const customer = await prisma.customer.findUnique({
            where: { id },
        });

        if (!customer) {
            return NextResponse.json(
                { message: 'Cliente não encontrado' },
                { status: 404 }
            );
        }

        // Verificar se já existe um contato com o mesmo email (se fornecido)
        if (validatedData.email) {
            const existingContact = await prisma.contact.findFirst({
                where: {
                    email: validatedData.email,
                    customerId: id,
                },
            });

            if (existingContact) {
                return NextResponse.json(
                    { message: 'Já existe um contato com este email para este cliente' },
                    { status: 400 }
                );
            }
        }

        // Criar o contato
        const contact = await prisma.contact.create({
            data: {
                ...validatedData,
                customerId: id,
            },
        });

        return NextResponse.json(contact, { status: 201 });
    } catch (error) {
        console.error('Erro ao criar contato:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: 'Dados inválidos', errors: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}