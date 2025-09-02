import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withErrorHandling, validateRequest, createApiError } from '@/lib/api-error-handler';
import { z } from 'zod';

// Schema for query parameters
const activitiesQuerySchema = z.object({
    page: z.string().optional().default('1').transform(Number),
    limit: z.string().optional().default('10').transform(Number),
    type: z.string().nullable().optional().transform((val) => {
        if (!val || val === 'null') return undefined;
        if (['call', 'email', 'whatsapp', 'meeting', 'note'].includes(val)) {
            return val as 'call' | 'email' | 'whatsapp' | 'meeting' | 'note';
        }
        return undefined;
    }),
});

// Schema for creating activities
const createActivitySchema = z.object({
    type: z.enum(['call', 'email', 'whatsapp', 'meeting', 'note']),
    title: z.string().min(1).max(200),
    description: z.string().optional(),
    date: z.string().datetime().transform(date => new Date(date)),
});

// GET /api/clientes/[id]/activities - List activities
export const GET = withErrorHandling(async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    const { id: customerId } = await params;
    const { searchParams } = new URL(request.url);

    const query = validateRequest<z.infer<typeof activitiesQuerySchema>>(activitiesQuerySchema, {
        page: searchParams.get('page'),
        limit: searchParams.get('limit'),
        type: searchParams.get('type'),
    });

    // Verify customer exists
    const customer = await prisma.customer.findUnique({
        where: { id: customerId },
    });

    if (!customer) {
        throw createApiError('Cliente não encontrado', 404);
    }

    // Build where clause
    const where: any = {
        customerId,
    };

    if (query.type) {
        where.type = query.type;
    }

    // Get activities with pagination
    const [activities, total] = await Promise.all([
        prisma.activity.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                    },
                },
            },
            orderBy: {
                date: 'desc',
            },
            skip: (query.page - 1) * query.limit,
            take: query.limit,
        }),
        prisma.activity.count({ where }),
    ]);

    const totalPages = Math.ceil(total / query.limit);

    return NextResponse.json({
        activities,
        total,
        page: query.page,
        totalPages,
    });
});

// POST /api/clientes/[id]/activities - Create activity
export const POST = withErrorHandling(async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    const { id: customerId } = await params;
    const body = await request.json();

    const data = validateRequest<z.infer<typeof createActivitySchema>>(createActivitySchema, body);

    // Verify customer exists
    const customer = await prisma.customer.findUnique({
        where: { id: customerId },
    });

    if (!customer) {
        throw createApiError('Cliente não encontrado', 404);
    }

    // Create activity
    const activity = await prisma.activity.create({
        data: {
            id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            customerId,
            type: data.type,
            title: data.title,
            description: data.description,
            date: data.date,
            updatedAt: new Date(),
            // TODO: Get user ID from authentication
            userId: null,
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

    return NextResponse.json(activity, { status: 201 });
});