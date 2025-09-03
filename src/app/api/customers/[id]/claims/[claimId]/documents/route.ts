import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { z } from 'zod';

// GET /api/customers/[id]/claims/[claimId]/documents - List claim documents
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; claimId: string }> }
) {
    try {
        const { claimId } = await params;

        const documents = await prisma.claimdocument.findMany({
            where: {
                claimId,
            },
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
        });

        return NextResponse.json(documents);
    } catch (error) {
        console.error('Error fetching claim documents:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

// POST /api/customers/[id]/claims/[claimId]/documents - Upload claim document
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; claimId: string }> }
) {
    try {
        const { claimId } = await params;
        const formData = await request.formData();

        const file = formData.get('file') as File;
        const description = formData.get('description') as string;

        if (!file) {
            return NextResponse.json(
                { error: 'Arquivo é obrigatório' },
                { status: 400 }
            );
        }

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'Arquivo muito grande. Limite de 10MB' },
                { status: 400 }
            );
        }

        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), 'uploads', 'claims', claimId);
        await mkdir(uploadsDir, { recursive: true });

        // Generate unique filename
        const timestamp = Date.now();
        const filename = `${timestamp}-${file.name}`;
        const filepath = join(uploadsDir, filename);

        // Save file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        // Save document record
        const document = await prisma.claimdocument.create({
            data: {
                id: crypto.randomUUID(),
                claimId,
                name: filename,
                originalName: file.name,
                mimeType: file.type,
                size: file.size,
                filePath: `uploads/claims/${claimId}/${filename}`,
                description: description || undefined,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        // Create timeline entry
        await prisma.claimtimeline.create({
            data: {
                id: crypto.randomUUID(),
                claimId,
                action: 'DOCUMENT_UPLOADED',
                description: `Documento "${file.name}" foi anexado`,
            },
        });

        return NextResponse.json(document, { status: 201 });
    } catch (error) {
        console.error('Error uploading claim document:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}