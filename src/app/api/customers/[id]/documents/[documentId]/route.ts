import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readFile, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// GET - Download do documento
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; documentId: string }> }
) {
    try {
        const { id: customerId, documentId } = await params;

        const document = await prisma.document.findFirst({
            where: {
                id: documentId,
                customerId,
                isActive: true
            }
        });

        if (!document) {
            return NextResponse.json(
                { error: 'Documento não encontrado' },
                { status: 404 }
            );
        }

        const filePath = join(process.cwd(), document.filePath);

        if (!existsSync(filePath)) {
            return NextResponse.json(
                { error: 'Arquivo não encontrado no sistema' },
                { status: 404 }
            );
        }

        const fileBuffer = await readFile(filePath);

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': document.mimeType,
                'Content-Disposition': `attachment; filename="${document.originalName}"`,
                'Content-Length': document.size.toString()
            }
        });

    } catch (error) {
        console.error('Error downloading document:', error);
        return NextResponse.json(
            { error: 'Erro ao baixar documento' },
            { status: 500 }
        );
    }
}

// PUT - Atualizar informações do documento
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; documentId: string }> }
) {
    try {
        const { id: customerId, documentId } = await params;
        const { name, description, category } = await request.json();

        const document = await prisma.document.findFirst({
            where: {
                id: documentId,
                customerId,
                isActive: true
            }
        });

        if (!document) {
            return NextResponse.json(
                { error: 'Documento não encontrado' },
                { status: 404 }
            );
        }

        const updatedDocument = await prisma.document.update({
            where: { id: documentId },
            data: {
                name: name || document.name,
                description: description !== undefined ? description : document.description,
                category: category || document.category
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            document: updatedDocument
        });

    } catch (error) {
        console.error('Error updating document:', error);
        return NextResponse.json(
            { error: 'Erro ao atualizar documento' },
            { status: 500 }
        );
    }
}

// DELETE - Excluir documento (soft delete)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; documentId: string }> }
) {
    try {
        const { id: customerId, documentId } = await params;

        const document = await prisma.document.findFirst({
            where: {
                id: documentId,
                customerId,
                isActive: true
            }
        });

        if (!document) {
            return NextResponse.json(
                { error: 'Documento não encontrado' },
                { status: 404 }
            );
        }

        // Soft delete - marcar como inativo
        await prisma.document.update({
            where: { id: documentId },
            data: { isActive: false }
        });

        // Opcionalmente, remover o arquivo físico
        // const filePath = join(process.cwd(), document.filePath);
        // if (existsSync(filePath)) {
        //     await unlink(filePath);
        // }

        return NextResponse.json({
            success: true,
            message: 'Documento excluído com sucesso'
        });

    } catch (error) {
        console.error('Error deleting document:', error);
        return NextResponse.json(
            { error: 'Erro ao excluir documento' },
            { status: 500 }
        );
    }
}