import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { type NextRequest } from 'next/server';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; telefoneId: string } }
) {
  try {
    const telefoneId = (params.telefoneId);
    const data = await req.json();

    const telefone = await prisma.phone.update({
      where: { id: telefoneId },
      data
    });

    return NextResponse.json({
      success: true,
      telefone
    });
  } catch (error) {
    console.error('Erro ao atualizar telefone:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao atualizar telefone'
    }, {
      status: 500
    });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; telefoneId: string } }
) {
  try {
    const telefoneId = (params.telefoneId);

    await prisma.phone.delete({
      where: { id: telefoneId }
    });

    return NextResponse.json({
      success: true,
      message: 'Telefone excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir telefone:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao excluir telefone'
    }, {
      status: 500
    });
  }
}