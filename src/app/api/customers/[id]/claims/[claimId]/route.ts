import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';

// Schema para validação da atualização de sinistro
const updateClaimSchema = z.object({
    title: z.string().min(3, 'O título deve ter pelo menos 3 caracteres').optional(),
    description: z.string().min(10, 'A descrição deve ter pelo menos 10 caracteres').optional(),
    incidentDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Data do incidente inválida',
    }).optional(),
    status: z.enum(['REPORTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CLOSED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    claimType: z.string().optional(),
    estimatedValue: z.number().optional(),
    approvedValue: z.number().optional(),
    deductible: z.number().optional(),
    location: z.string().optional(),
    witnesses: z.string().optional(),
    policeReport: z.string().optional(),
    assignedTo: z.string().optional(),
    closedReason: z.string().optional(),
    closedAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Data de fechamento inválida',
    }).optional(),
});

// GET /api/customers/[id]/claims/[claimId] - Get claim details
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; claimId: string }> }
) {
    try {
        const { id, claimId } = await params;

        const claim = await prisma.claim.findFirst({
            where: {
                id: claimId,
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
                    orderBy: {
                        createdAt: 'desc',
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
        });

        if (!claim) {
            return NextResponse.json(
                { error: 'Sinistro não encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json(claim);
    } catch (error) {
        console.error('Error fetching claim details:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
// PATCH /api/customers/[id]/claims/[claimId] - Update claim
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; claimId: string }> }
) {
    try {
        const { id: customerId, claimId } = await params;
        // const session = await getServerSession(authOptions);

        // // Verificar se o usuário está autenticado
        // if (!session?.user) {
        //     return NextResponse.json(
        //         { error: 'Não autorizado' },
        //         { status: 401 }
        //     );
        // }

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

        // Verificar se o sinistro existe
        const existingClaim = await prisma.claim.findUnique({
            where: {
                id: claimId,
                customerId,
            },
        });

        if (!existingClaim) {
            return NextResponse.json(
                { error: 'Sinistro não encontrado' },
                { status: 404 }
            );
        }

        // Validar dados da atualização
        const data = await request.json();
        const validationResult = updateClaimSchema.safeParse(data);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Dados inválidos', details: validationResult.error.format() },
                { status: 400 }
            );
        }

        const validatedData = validationResult.data;

        // Preparar dados para atualização
        const updateData: any = {};

        if (validatedData.title) updateData.title = validatedData.title;
        if (validatedData.description) updateData.description = validatedData.description;
        if (validatedData.incidentDate) updateData.incidentDate = new Date(validatedData.incidentDate);
        if (validatedData.status) updateData.status = validatedData.status;
        if (validatedData.priority) updateData.priority = validatedData.priority;
        if (validatedData.claimType) updateData.claimType = validatedData.claimType;
        if (validatedData.estimatedValue !== undefined) updateData.estimatedValue = validatedData.estimatedValue;
        if (validatedData.approvedValue !== undefined) updateData.approvedValue = validatedData.approvedValue;
        if (validatedData.deductible !== undefined) updateData.deductible = validatedData.deductible;
        if (validatedData.location !== undefined) updateData.location = validatedData.location;
        if (validatedData.witnesses !== undefined) updateData.witnesses = validatedData.witnesses;
        if (validatedData.policeReport !== undefined) updateData.policeReport = validatedData.policeReport;
        if (validatedData.assignedTo !== undefined) updateData.assignedTo = validatedData.assignedTo;
        if (validatedData.closedReason !== undefined) updateData.closedReason = validatedData.closedReason;
        if (validatedData.closedAt) updateData.closedAt = new Date(validatedData.closedAt);

        // Verificar mudança de status para registrar na timeline
        let statusChanged = false;
        let oldStatus = existingClaim.status;
        let newStatus = validatedData.status;

        if (newStatus && oldStatus !== newStatus) {
            statusChanged = true;
        }

        // Atualizar sinistro
        const updatedClaim = await prisma.claim.update({
            where: {
                id: claimId,
            },
            data: updateData,
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
            },
        });

        // Registrar na timeline se o status foi alterado
        if (statusChanged) {
            await prisma.claimtimeline.create({
                data: {
                    id: crypto.randomUUID(),
                    claimId,
                    action: 'STATUS_CHANGED',
                    description: `Status alterado de ${oldStatus} para ${newStatus}`,
                    // userId: session.user.id, // Commented out until auth is implemented
                },
            });
        }

        // Registrar na timeline se foi atribuído a alguém
        if (validatedData.assignedTo && validatedData.assignedTo !== existingClaim.assignedTo) {
            const assignedUser = await prisma.user.findUnique({
                where: { id: validatedData.assignedTo },
                select: { name: true },
            });

            if (assignedUser) {
                await prisma.claimtimeline.create({
                    data: {
                        id: crypto.randomUUID(),
                        claimId,
                        action: 'ASSIGNED',
                        description: `Sinistro atribuído para ${assignedUser.name}`,
                        // userId: session.user.id, // Commented out until auth is implemented
                    },
                });
            }
        }

        return NextResponse.json(updatedClaim);
    } catch (error) {
        console.error('Erro ao atualizar sinistro:', error);
        return NextResponse.json(
            { error: 'Erro ao atualizar sinistro' },
            { status: 500 }
        );
    }
}

// DELETE /api/customers/[id]/claims/[claimId] - Delete claim
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; claimId: string }> }
) {
    try {
        const { id: customerId, claimId } = await params;
        // const session = await getServerSession(authOptions);

        // // Verificar se o usuário está autenticado
        // if (!session?.user) {
        //     return NextResponse.json(
        //         { error: 'Não autorizado' },
        //         { status: 401 }
        //     );
        // }

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

        // Verificar se o sinistro existe
        const existingClaim = await prisma.claim.findUnique({
            where: {
                id: claimId,
                customerId,
            },
        });

        if (!existingClaim) {
            return NextResponse.json(
                { error: 'Sinistro não encontrado' },
                { status: 404 }
            );
        }

        // Excluir sinistro (isso também excluirá registros relacionados devido às restrições de cascata)
        await prisma.claim.delete({
            where: {
                id: claimId,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Erro ao excluir sinistro:', error);
        return NextResponse.json(
            { error: 'Erro ao excluir sinistro' },
            { status: 500 }
        );
    }
}