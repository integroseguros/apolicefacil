// src/app/api/clientes/[id]/telefones/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { type NextRequest } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: customerId } = await params;

    // Adicione um log para depuração
    console.log("🛠 [Telefones GET] Buscando telefones para customerId:", customerId);

    const telefones = await prisma.phone.findMany({
      where: { customerId },
      orderBy: { id: 'desc' }
    });

    return NextResponse.json({ telefones });
  } catch (error) {
    console.error('Erro ao buscar telefones:', error);
    return NextResponse.json({ error: 'Erro ao buscar telefones' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: customerId } = await params;

    // Adicione logs para depuração
    console.log("🛠 [Telefones POST] Recebido customerId para novo telefone:", customerId);
    const data = await req.json();
    console.log("🛠 [Telefones POST] Dados do telefone recebidos:", data);


    const telefone = await prisma.phone.create({
      data: {
        ...data,
        customerId
      }
    });

    return NextResponse.json({
      success: true,
      telefone
    });
  } catch (error) {
    console.error('Erro ao criar telefone:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao criar telefone'
    }, {
      status: 500
    });
  } finally {
    await prisma.$disconnect();
  }
}