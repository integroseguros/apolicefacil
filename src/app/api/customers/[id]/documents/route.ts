import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// GET - Listar documentos do cliente
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const documents = await prisma.document.findMany({
            where: {
                customerId: id,
                isActive: true
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: [
                { category: 'asc' },
                { createdAt: 'desc' }
            ]
        });

        return NextResponse.json(documents);
    } catch (error) {
        console.error('Error fetching documents:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar documentos' },
            { status: 500 }
        );
    }
}

// POST - Upload de novo documento
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: customerId } = await params;
        const formData = await request.formData();

        const file = formData.get('file') as File;
        const category = formData.get('category') as string;
        const description = formData.get('description') as string;
        const uploadedBy = formData.get('uploadedBy') as string;

        if (!file) {
            return NextResponse.json(
                { error: 'Nenhum arquivo foi enviado' },
                { status: 400 }
            );
        }

        if (!category) {
            return NextResponse.json(
                { error: 'Categoria é obrigatória' },
                { status: 400 }
            );
        }

        // Validar tamanho do arquivo (máximo 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'Arquivo muito grande. Máximo permitido: 10MB' },
                { status: 400 }
            );
        }

        // Validar tipos de arquivo permitidos
        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];

        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Tipo de arquivo não permitido' },
                { status: 400 }
            );
        }

        // Criar diretório se não existir
        const uploadDir = join(process.cwd(), 'uploads', 'documents', customerId);
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        // Gerar nome único para o arquivo
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop();
        const fileName = `${timestamp}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
        const filePath = join(uploadDir, fileName);
        const relativeFilePath = `uploads/documents/${customerId}/${fileName}`;

        // Salvar arquivo
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Salvar no banco de dados
        const document = await prisma.document.create({
            data: {
                id: crypto.randomUUID(),
                customerId,
                name: file.name.split('.')[0], // Nome sem extensão
                originalName: file.name,
                category: category as any,
                mimeType: file.type,
                size: file.size,
                filePath: relativeFilePath,
                description: description || null,
                uploadedBy: uploadedBy || null,
                updatedAt: new Date()
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
            document
        });

    } catch (error) {
        console.error('Error uploading document:', error);
        return NextResponse.json(
            { error: 'Erro ao fazer upload do documento' },
            { status: 500 }
        );
    }
}