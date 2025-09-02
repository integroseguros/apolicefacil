import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { type NextRequest } from 'next/server';

export async function PUT(req: NextRequest) {
  try {
    const parts = req.url.split('/');
    const contatoId = (parts.pop() || '');
    
    if (!contatoId) {
      return new NextResponse(
        JSON.stringify({ error: "ID do contato inválido" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await req.json();
    const cleanedData = {
      ...data,
      cpf: data.cpf ? data.cpf.replace(/\D/g, '') : null,
      telefone: data.telefone ? data.telefone.replace(/\D/g, '') : null,
      celular: data.celular ? data.celular.replace(/\D/g, '') : null,
      dtNascimento: data.dtNascimento ? data.dtNascimento.replace(/\D/g, '') : null
    };

    const contato = await prisma.contact.update({
      where: { id: contatoId },
      data: cleanedData
    });

    return new NextResponse(
      JSON.stringify({ success: true, contato }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro ao atualizar contato:', error);
    return new NextResponse(
      JSON.stringify({ success: false, error: 'Erro ao atualizar contato' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const parts = req.url.split('/');
    const contatoId = (parts.pop() || '');
    
    if (!contatoId) {
      return new NextResponse(
        JSON.stringify({ error: "ID do contato inválido" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await prisma.contact.delete({
      where: { id: contatoId }
    });

    return new NextResponse(
      JSON.stringify({ success: true, message: 'Contato excluído com sucesso' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro ao excluir contato:', error);
    return new NextResponse(
      JSON.stringify({ success: false, error: 'Erro ao excluir contato' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}