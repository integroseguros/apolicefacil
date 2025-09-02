import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createClaimSchema = z.object({
    title: z.string().min(3, 'Título deve ter no mínimo 3 caracteres').max(200),
    description: z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres'),
    incidentDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Data inválida'),
    claimType: z.string().min(1, 'Tipo de sinistro é obrigatório'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
    policyId: z.string().optional(),
    estimatedValue: z.number().optional(),
    location: z.string().optional(),
    witnesses: z.string().optional(),
    policeReport: z.string().optional(),
});

// GET /api/customers/[id]/claims - List customer claims
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const claims = await prisma.claim.findMany({
            where: {
                customerId: id,
            },
            include: {
                policy: {
                    include: {
                        product: true,
                        insurancecompany: true,
                    },
                },
                user_claim_assignedToTouser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatarUrl: true,
                    },
                },
                user_claim_createdByTouser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatarUrl: true,
                    },
                },
                claimdocument: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
                claimtimeline: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                    orderBy: {
                        timestamp: 'desc',
                    },
                },
                claimcommunication: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                    orderBy: {
                        timestamp: 'desc',
                    },
                },
            },
            orderBy: {
                reportedDate: 'desc',
            },
        });

        return NextResponse.json(claims);
    } catch (error) {
        console.error('Error fetching claims:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

// POST /api/customers/[id]/claims - Create new claim
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Validate request body
        const validatedData = createClaimSchema.parse(body);

        // Generate claim number
        const claimCount = await prisma.claim.count();
        const claimNumber = `SIN${String(claimCount + 1).padStart(6, '0')}`;

        // Create claim
        const claim = await prisma.claim.create({
            data: {
                id: crypto.randomUUID(),
                claimNumber,
                customerId: id,
                title: validatedData.title,
                description: validatedData.description,
                incidentDate: new Date(validatedData.incidentDate),
                claimType: validatedData.claimType,
                priority: validatedData.priority,
                policyId: validatedData.policyId,
                estimatedValue: validatedData.estimatedValue,
                location: validatedData.location,
                witnesses: validatedData.witnesses,
                policeReport: validatedData.policeReport,
                status: 'REPORTED',
                updatedAt: new Date(),
            },
            include: {
                policy: {
                    include: {
                        product: true,
                        insurancecompany: true,
                    },
                },
                user_claim_assignedToTouser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatarUrl: true,
                    },
                },
                user_claim_createdByTouser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatarUrl: true,
                    },
                },
            },
        });

        // Create initial timeline entry
        await prisma.claimtimeline.create({
            data: {
                id: crypto.randomUUID(),
                claimId: claim.id,
                action: 'CLAIM_CREATED',
                description: 'Sinistro reportado',
            },
        });

        return NextResponse.json(claim, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Dados inválidos', details: error.issues },
                { status: 400 }
            );
        }

        console.error('Error creating claim:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}