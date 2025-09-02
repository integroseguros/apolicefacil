import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { type NextRequest } from 'next/server';

export async function PUT(req: NextRequest) {
  try {
    const parts = req.url.split('/');
    const addressId = parts.pop() || '';

    if (!addressId) {
      return new NextResponse(
        JSON.stringify({ error: "ID do endereço inválido" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await req.json();

    // Validar dados obrigatórios
    if (!data.street || !data.city || !data.state || !data.zipCode) {
      return new NextResponse(
        JSON.stringify({ error: "Campos obrigatórios: rua, cidade, estado e CEP" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const cleanedData = {
      type: data.type || 'residencial',
      street: data.street,
      number: data.number || null,
      complement: data.complement || null,
      district: data.district || null,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode.replace(/\D/g, ''),
    };

    const address = await prisma.address.update({
      where: { id: addressId },
      data: cleanedData
    });

    return new NextResponse(
      JSON.stringify({ success: true, address }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro ao atualizar endereço:', error);
    return new NextResponse(
      JSON.stringify({ success: false, error: 'Erro ao atualizar endereço' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const parts = req.url.split('/');
    const addressId = parts.pop() || '';

    if (!addressId) {
      return new NextResponse(
        JSON.stringify({ error: "ID do endereço inválido" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await prisma.address.delete({
      where: { id: addressId }
    });

    return new NextResponse(
      JSON.stringify({ success: true, message: 'Endereço excluído com sucesso' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro ao excluir endereço:', error);
    return new NextResponse(
      JSON.stringify({ success: false, error: 'Erro ao excluir endereço' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}