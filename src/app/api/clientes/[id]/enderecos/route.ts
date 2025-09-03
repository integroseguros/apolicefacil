import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { type NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const id = req.url.split('/').slice(-2)[0];
    if (!id) {
      return new NextResponse(
        JSON.stringify({ error: "ID inválido" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const customerId = id;
    const addresses = await prisma.address.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' }
    });

    return new NextResponse(
      JSON.stringify({ success: true, addresses }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro ao buscar endereços:', error);
    return new NextResponse(
      JSON.stringify({ success: false, error: 'Erro ao buscar endereços' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const id = req.url.split('/').slice(-2)[0];
    if (!id) {
      return new NextResponse(
        JSON.stringify({ error: "ID inválido" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const customerId = id;
    const data = await req.json();

    // Validar dados obrigatórios
    if (!data.street || !data.city || !data.state || !data.zipCode) {
      return new NextResponse(
        JSON.stringify({ error: "Campos obrigatórios: rua, cidade, estado e CEP" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const cleanedData = {
      id: crypto.randomUUID(),
      customerId,
      type: data.type || 'residencial',
      street: data.street,
      number: data.number || null,
      complement: data.complement || null,
      district: data.district || null,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode.replace(/\D/g, ''),
    };

    const address = await prisma.address.create({
      data: cleanedData
    });

    return new NextResponse(
      JSON.stringify({ success: true, address }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro ao criar endereço:', error);
    return new NextResponse(
      JSON.stringify({ success: false, error: 'Erro ao criar endereço' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}