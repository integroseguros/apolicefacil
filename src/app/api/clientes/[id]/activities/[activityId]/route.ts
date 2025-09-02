import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withErrorHandling, validateRequest, createApiError } from '@/lib/api-error-handler';
import { z } from 'zod';

// Schema for updating activities
const updateActivitySchema = z.object({
    type: z.enum(['call', 'email', 'whatsapp', 'meeting', 'note']).optional(),
    title: z.string().min(1).max(200).optional(),
    description: z.string().optional(),
    date: z.iso.datetime().transform(date => new Date(date)).optional(),
});

// GET /api/clientes/[id]/activities/[activityId] - Get single activity
export const GET = withErrorHandling(async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string; activityId: string }> }
) => {
    const { id: customerId, activityId } = await params;

    const activity = await prisma.activity.findFirst({
        where: {
            id: activityId,
            customerId,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    avatarUrl: true,
                },
            },
        },
    });

    if (!activity) {
        throw createApiError('Atividade não encontrada', 404);
    }

    return NextResponse.json(activity);
});

// PUT /api/clientes/[id]/activities/[activityId] - Update activity
export const PUT = withErrorHandling(async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string; activityId: string }> }
) => {
    const { id: customerId, activityId } = await params;
    const body = await request.json();

    const data = validateRequest<z.infer<typeof updateActivitySchema>>(updateActivitySchema, body);

    // Verify activity exists and belongs to customer
    const existingActivity = await prisma.activity.findFirst({
        where: {
            id: activityId,
            customerId,
        },
    });

    if (!existingActivity) {
        throw createApiError('Atividade não encontrada', 404);
    }

    // Update activity
    const activity = await prisma.activity.update({
        where: { id: activityId },
        data: {
            ...data,
            updatedAt: new Date(),
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    avatarUrl: true,
                },
            },
        },
    });

    return NextResponse.json(activity);
});

// DELETE /api/clientes/[id]/activities/[activityId] - Delete activity
export const DELETE = withErrorHandling(async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string; activityId: string }> }
) => {
    const { id: customerId, activityId } = await params;

    // Verify activity exists and belongs to customer
    const existingActivity = await prisma.activity.findFirst({
        where: {
            id: activityId,
            customerId,
        },
    });

    if (!existingActivity) {
        throw createApiError('Atividade não encontrada', 404);
    }

    // Delete activity
    await prisma.activity.delete({
        where: { id: activityId },
    });

    return NextResponse.json({ success: true });
});