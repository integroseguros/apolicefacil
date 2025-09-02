import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const phoneSchema = z.object({
    type: z.string().min(1, 'Tipo é obrigatório'),
    number: z.string().min(10, 'Número deve ter pelo menos 10 dígitos').max(15, 'Número muito longo'),
    contact: z.string().max(50).optional().or(z.literal('')),
});

// GET /api/customers/[id]/phones - Listar telefones do cliente
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const customerId = params.id;

        // Verificar se o cliente existe
        const customer = await prisma.customer.findUnique({
            where: { id: customerId },
        });

        if (!customer) {
            return NextResponse.json(
                { error: 'Cliente não encontrado' },
                { status: 404 }
            );
        }

        // Buscar telefones do cliente
        const phones = await prisma.phone.findMany({
            where: { customerId },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(phones);
    } catch (error) {
        console.error('Erro ao buscar telefones:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

// POST /api/customers/[id]/phones - Criar novo telefone
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const customerId = params.id;
        const body = await request.json();

        // Validar dados
        const validatedData = phoneSchema.parse(body);

        // Verificar se o cliente existe
        const customer = await prisma.customer.findUnique({
            where: { id: customerId },
        });

        if (!customer) {
            return NextResponse.json(
                { error: 'Cliente não encontrado' },
                { status: 404 }
            );
        }

        // Limpar número (remover formatação)
        const cleanNumber = validatedData.number.replace(/\D/g, '');

        // Verificar se já existe um telefone com o mesmo número para este cliente
        const existingPhone = await prisma.phone.findFirst({
            where: {
                customerId,
                number: cleanNumber,
            },
        });

        if (existingPhone) {
            return NextResponse.json(
                { error: 'Este número já está cadastrado para este cliente' },
                { status: 400 }
            );
        }

        // Criar telefone
        const phone = await prisma.phone.create({
            data: {
                id: crypto.randomUUID(),
                customerId,
                type: validatedData.type,
                number: cleanNumber,
                contact: validatedData.contact || null,
            },
        });

        return NextResponse.json(phone, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Dados inválidos', details: error.issues },
                { status: 400 }
            );
        }

        console.error('Erro ao criar telefone:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}