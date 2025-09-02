import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '../../../../prisma/generated/prisma';
import { PrismaClientKnownRequestError } from '../../../../prisma/generated/prisma/runtime/library';
import { validateDocument, cleanDocument, getDocumentType } from '@/utils/document-validators';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');

    const clientes = await prisma.customer.findMany({
      include: {
        phone: true,
      },
      orderBy: {
        name: 'asc'
      },
    });

    return NextResponse.json({ clientes });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ clientes: [] });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    console.log("🔥 Dados recebidos no backend:", data);

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

    // Check for duplicate document
    const existingCustomerByDocument = await prisma.customer.findFirst({
      where: {
        cnpjCpf: cleanedDocument
      }
    });

    if (existingCustomerByDocument) {
      const docTypeName = documentType === 'CPF' ? 'CPF' : 'CNPJ';
      return NextResponse.json(
        { message: `Já existe um cliente cadastrado com este ${docTypeName}.` },
        { status: 409 }
      );
    }

    // Check for duplicate email if provided
    if (data.email && data.email.trim() !== '') {
      const existingCustomerByEmail = await prisma.customer.findFirst({
        where: {
          email: data.email.trim().toLowerCase()
        }
      });

      if (existingCustomerByEmail) {
        return NextResponse.json(
          { message: 'Já existe um cliente cadastrado com este email.' },
          { status: 409 }
        );
      }
    }

    // Prepare sanitized data for database
    const sanitizedData: Prisma.customerCreateInput = {
      id: crypto.randomUUID(),
      name: data.name.trim(),
      personType: data.personType,
      cnpjCpf: cleanedDocument,
      email: data.email && data.email.trim() !== '' ? data.email.trim().toLowerCase() : null,
      socialName: data.socialName && data.socialName.trim() !== '' ? data.socialName.trim() : null,
      // Pessoa Física fields
      birthDate: data.birthDate && data.birthDate.trim() !== '' ? data.birthDate.trim() : null,
      gender: data.gender && data.gender.trim() !== '' ? data.gender.trim() : null,
      maritalStatus: data.maritalStatus && data.maritalStatus.trim() !== '' ? data.maritalStatus.trim() : null,
      // Pessoa Jurídica fields
      business: data.business && data.business.trim() !== '' ? data.business.trim() : null,
      revenue: data.revenue && data.revenue.trim() !== '' ? data.revenue.trim() : null,
      website: data.website && data.website.trim() !== '' ? data.website.trim() : null,
      updatedAt: new Date(),
      // Phone relationship
      phone: data.phone && data.phone.trim() !== '' ? {
        create: [{
          id: crypto.randomUUID(),
          type: 'celular',
          number: data.phone.trim()
        }]
      } : undefined,
    };

    console.log("🛠 Dados sanitizados antes do Prisma:", sanitizedData);

    // Create new customer
    const newCustomer = await prisma.customer.create({
      data: sanitizedData,
      include: {
        phone: true
      }
    });

    // Fetch updated customer list
    const clientes = await prisma.customer.findMany({
      take: 10,
      orderBy: { name: "asc" },
      include: {
        phone: true
      }
    });

    return NextResponse.json({
      clientes,
      customer: newCustomer,
      message: "Cliente criado com sucesso!"
    }, { status: 201 });

  } catch (error) {
    console.error("❌ Erro na API ao criar cliente:", error);

    let errorMessage = 'Erro interno do servidor ao criar cliente.';
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
        errorMessage = 'Registro não encontrado.';
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