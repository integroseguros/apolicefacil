import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { type NextRequest } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: customerId } = await params;

    const contatos = await prisma.contact.findMany({
      where: { customerId },
      orderBy: { id: 'desc' }
    });

    return NextResponse.json({ success: true, contatos });
  } catch (error) {
    console.error('Erro ao buscar contatos:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar contatos' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: customerId } = await params;
    const data = await req.json();

    const cleanedData = {
      ...data,
      customerId,
      // Clean phone numbers if they exist
      phone: data.phone ? data.phone.replace(/\D/g, '') : null,
      cellPhone: data.cellPhone ? data.cellPhone.replace(/\D/g, '') : null,
      // Clean birth date if it exists
      birthDate: data.birthDate || null
    };

    const contato = await prisma.contact.create({
      data: cleanedData
    });

    return NextResponse.json(
      { success: true, contato },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar contato:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao criar contato' },
      { status: 500 }
    );
  }
}