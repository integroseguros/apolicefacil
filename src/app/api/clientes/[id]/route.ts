import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '../../../../../prisma/generated/prisma';
import { PrismaClientKnownRequestError } from '../../../../../prisma/generated/prisma/runtime/library';
import { validateDocument, cleanDocument, getDocumentType } from '@/utils/document-validators';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// GET single customer
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        phone: true,
        address: true,
        contact: true,
        policy: {
          include: {
            product: true,
            insurancecompany: true
          }
        },
        opportunity: {
          include: {
            user: true,
            product: true
          }
        },
        activity: {
          include: {
            user: true
          },
          orderBy: {
            date: 'desc'
          }
        },
        claim: {
          include: {
            policy: {
              include: {
                product: true,
                insurancecompany: true
              }
            },
            user_claim_assignedToTouser: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true
              }
            }
          },
          orderBy: {
            reportedDate: 'desc'
          }
        }
      }
    });

    if (!customer) {
      return NextResponse.json(
        { message: 'Cliente não encontrado.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ customer });
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}

// PUT update customer
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id }
    });

    if (!existingCustomer) {
      return NextResponse.json(
        { message: 'Cliente não encontrado.' },
        { status: 404 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const data: Record<string, any> = {};

    // Extract form fields
    for (const [key, value] of formData.entries()) {
      if (key !== 'avatar' && key !== 'removeAvatar') {
        data[key] = value.toString();
      }
    }

    console.log("🔥 Dados recebidos no backend para atualização:", data);

    // Validate payload structure
    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { message: 'Payload inválido.' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 3) {
      return NextResponse.json(
        { message: 'Nome é obrigatório e deve ter no mínimo 3 caracteres.' },
        { status: 400 }
      );
    }

    if (!data.personType || !['PF', 'PJ'].includes(data.personType)) {
      return NextResponse.json(
        { message: 'Tipo de pessoa é obrigatório e deve ser PF ou PJ.' },
        { status: 400 }
      );
    }

    if (!data.cnpjCpf || typeof data.cnpjCpf !== 'string') {
      return NextResponse.json(
        { message: 'Documento (CPF/CNPJ) é obrigatório.' },
        { status: 400 }
      );
    }

    // Clean and validate document
    const cleanedDocument = cleanDocument(data.cnpjCpf);
    const documentType = getDocumentType(cleanedDocument);

    // Check if document type could be determined
    if (!documentType) {
      return NextResponse.json(
        { message: 'Formato de documento inválido. Informe um CPF ou CNPJ válido.' },
        { status: 400 }
      );
    }

    // Validate document format based on person type
    if (data.personType === 'PF' && documentType !== 'CPF') {
      return NextResponse.json(
        { message: 'Para Pessoa Física, é necessário informar um CPF válido.' },
        { status: 400 }
      );
    }

    if (data.personType === 'PJ' && documentType !== 'CNPJ') {
      return NextResponse.json(
        { message: 'Para Pessoa Jurídica, é necessário informar um CNPJ válido.' },
        { status: 400 }
      );
    }

    // Validate document using algorithm
    if (!validateDocument(cleanedDocument, documentType)) {
      const docTypeName = documentType === 'CPF' ? 'CPF' : 'CNPJ';
      return NextResponse.json(
        { message: `${docTypeName} inválido. Verifique os dígitos informados.` },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (data.email && data.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        return NextResponse.json(
          { message: 'Email inválido.' },
          { status: 400 }
        );
      }
    }

    // Validate website URL if provided
    if (data.website && data.website.trim() !== '') {
      try {
        new URL(data.website);
      } catch {
        return NextResponse.json(
          { message: 'URL do website inválida.' },
          { status: 400 }
        );
      }
    }

    // Check for duplicate document (excluding current customer)
    if (cleanedDocument !== existingCustomer.cnpjCpf) {
      const existingCustomerByDocument = await prisma.customer.findFirst({
        where: {
          cnpjCpf: cleanedDocument,
          id: { not: id }
        }
      });

      if (existingCustomerByDocument) {
        const docTypeName = documentType === 'CPF' ? 'CPF' : 'CNPJ';
        return NextResponse.json(
          { message: `Já existe outro cliente cadastrado com este ${docTypeName}.` },
          { status: 409 }
        );
      }
    }

    // Check for duplicate email if provided (excluding current customer)
    if (data.email && data.email.trim() !== '' && data.email.trim().toLowerCase() !== existingCustomer.email) {
      const existingCustomerByEmail = await prisma.customer.findFirst({
        where: {
          email: data.email.trim().toLowerCase(),
          id: { not: id }
        }
      });

      if (existingCustomerByEmail) {
        return NextResponse.json(
          { message: 'Já existe outro cliente cadastrado com este email.' },
          { status: 409 }
        );
      }
    }

    // Handle avatar upload
    let avatarUrl = existingCustomer.avatarUrl;
    const avatarFile = formData.get('avatar') as File | null;
    const removeAvatar = formData.get('removeAvatar') === 'true';

    if (removeAvatar) {
      // Remove existing avatar file if it exists
      if (existingCustomer.avatarUrl) {
        try {
          const oldAvatarPath = join(process.cwd(), 'public', existingCustomer.avatarUrl);
          if (existsSync(oldAvatarPath)) {
            await unlink(oldAvatarPath);
          }
        } catch (error) {
          console.warn('Erro ao remover avatar antigo:', error);
        }
      }
      avatarUrl = null;
    } else if (avatarFile && avatarFile.size > 0) {
      // Validate file type
      if (!avatarFile.type.startsWith('image/')) {
        return NextResponse.json(
          { message: 'Por favor, envie apenas arquivos de imagem.' },
          { status: 400 }
        );
      }

      // Validate file size (max 5MB)
      if (avatarFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { message: 'A imagem deve ter no máximo 5MB.' },
          { status: 400 }
        );
      }

      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'avatars');
      if (!existsSync(uploadsDir)) {
        mkdirSync(uploadsDir, { recursive: true });
      }

      // Generate unique filename
      const fileExtension = avatarFile.name.split('.').pop();
      const fileName = `${id}-${Date.now()}.${fileExtension}`;
      const filePath = join(uploadsDir, fileName);

      // Remove old avatar file if it exists
      if (existingCustomer.avatarUrl) {
        try {
          const oldAvatarPath = join(process.cwd(), 'public', existingCustomer.avatarUrl);
          if (existsSync(oldAvatarPath)) {
            await unlink(oldAvatarPath);
          }
        } catch (error) {
          console.warn('Erro ao remover avatar antigo:', error);
        }
      }

      // Save new avatar file
      const bytes = await avatarFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      avatarUrl = `/uploads/avatars/${fileName}`;
    }

    // Prepare sanitized data for database
    const sanitizedData: Prisma.customerUpdateInput = {
      name: data.name.trim(),
      personType: data.personType,
      cnpjCpf: cleanedDocument,
      email: data.email && data.email.trim() !== '' ? data.email.trim().toLowerCase() : null,
      socialName: data.socialName && data.socialName.trim() !== '' ? data.socialName.trim() : null,
      // Pessoa Física fields
      birthDate: data.birthDate && data.birthDate.trim() !== '' ? data.birthDate.trim() : null,
      gender: data.gender && data.gender.trim() !== '' ? data.gender.trim() : null,
      maritalStatus: data.maritalStatus && data.maritalStatus.trim() !== '' ? data.maritalStatus.trim() : null,
      income: data.income && data.income.trim() !== '' ? data.income.trim() : null,
      // Pessoa Jurídica fields
      business: data.business && data.business.trim() !== '' ? data.business.trim() : null,
      revenue: data.revenue && data.revenue.trim() !== '' ? data.revenue.trim() : null,
      website: data.website && data.website.trim() !== '' ? data.website.trim() : null,
      // Additional fields
      source: data.source && data.source.trim() !== '' ? data.source.trim() : null,
      avatarUrl: avatarUrl,
      updatedAt: new Date(),
    };

    console.log("🛠 Dados sanitizados antes do Prisma:", sanitizedData);

    // Update customer
    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: sanitizedData,
      include: {
        phone: true,
        address: true,
        contact: true,
        policy: {
          include: {
            product: true,
            insurancecompany: true
          }
        },
        opportunity: {
          include: {
            user: true,
            product: true
          }
        },
        activity: {
          include: {
            user: true
          },
          orderBy: {
            date: 'desc'
          }
        },
        claim: {
          include: {
            policy: {
              include: {
                product: true,
                insurancecompany: true
              }
            },
            user_claim_assignedToTouser: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true
              }
            }
          },
          orderBy: {
            reportedDate: 'desc'
          }
        }
      }
    });

    // Create activity log for profile update
    try {
      await prisma.activity.create({
        data: {
          id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          customerId: id,
          type: 'profile_update',
          title: 'Perfil Atualizado',
          description: `Perfil do cliente foi atualizado com novas informações.`,
          date: new Date(),
          updatedAt: new Date(),
        }
      });
    } catch (error) {
      console.warn('Erro ao criar log de atividade:', error);
    }

    return NextResponse.json({
      customer: updatedCustomer,
      message: "Cliente atualizado com sucesso!"
    }, { status: 200 });

  } catch (error) {
    console.error("❌ Erro na API ao atualizar cliente:", error);

    let errorMessage = 'Erro interno do servidor ao atualizar cliente.';
    let statusCode = 500;

    // Handle Prisma errors
    if (error instanceof PrismaClientKnownRequestError) {
      console.log("🔍 Erro do Prisma. Código:", error.code);

      if (error.code === 'P2002') {
        // Unique constraint violation
        const target = error.meta?.target;
        if (Array.isArray(target)) {
          if (target.includes('cnpjCpf')) {
            errorMessage = 'Já existe um cliente com este documento.';
          } else if (target.includes('email')) {
            errorMessage = 'Já existe um cliente com este email.';
          } else {
            errorMessage = `Já existe um cliente com este ${target.join(', ')}.`;
          }
        } else if (typeof target === 'string') {
          if (target.includes('cnpjCpf')) {
            errorMessage = 'Já existe um cliente com este documento.';
          } else if (target.includes('email')) {
            errorMessage = 'Já existe um cliente com este email.';
          } else {
            errorMessage = `Já existe um cliente com este ${target}.`;
          }
        } else {
          errorMessage = 'Já existe um cliente com estes dados.';
        }
        statusCode = 409;
      } else if (error.code === 'P2003') {
        // Foreign key constraint violation
        errorMessage = 'Erro de referência nos dados fornecidos.';
        statusCode = 400;
      } else if (error.code === 'P2025') {
        // Record not found
        errorMessage = 'Cliente não encontrado.';
        statusCode = 404;
      } else {
        errorMessage = 'Erro no banco de dados.';
        statusCode = 500;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
      statusCode = 400;
    }

    console.log("📤 Resposta de erro:", { message: errorMessage, status: statusCode });

    return NextResponse.json(
      {
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: statusCode }
    );
  }
}

// DELETE customer
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id }
    });

    if (!existingCustomer) {
      return NextResponse.json(
        { message: 'Cliente não encontrado.' },
        { status: 404 }
      );
    }

    // Remove avatar file if it exists
    if (existingCustomer.avatarUrl) {
      try {
        const avatarPath = join(process.cwd(), 'public', existingCustomer.avatarUrl);
        if (existsSync(avatarPath)) {
          await unlink(avatarPath);
        }
      } catch (error) {
        console.warn('Erro ao remover avatar:', error);
      }
    }

    // Delete customer (cascade will handle related records)
    await prisma.customer.delete({
      where: { id }
    });

    return NextResponse.json({
      message: "Cliente excluído com sucesso!"
    }, { status: 200 });

  } catch (error) {
    console.error("❌ Erro na API ao excluir cliente:", error);

    let errorMessage = 'Erro interno do servidor ao excluir cliente.';
    let statusCode = 500;

    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        errorMessage = 'Cliente não encontrado.';
        statusCode = 404;
      } else if (error.code === 'P2003') {
        errorMessage = 'Não é possível excluir o cliente pois existem registros relacionados.';
        statusCode = 400;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
      statusCode = 400;
    }

    return NextResponse.json(
      {
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: statusCode }
    );
  }
}