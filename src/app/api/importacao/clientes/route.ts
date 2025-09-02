import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ClienteImportacaoRequest } from '@/types';


export async function POST(request: Request) {
  try {
    const { clientes } = await request.json() as { clientes: ClienteImportacaoRequest[] };

    if (!Array.isArray(clientes) || clientes.length === 0) {
      return NextResponse.json(
        { error: "Dados inválidos: lista de clientes vazia ou em formato incorreto" },
        { status: 400 }
      );
    }

    const resultados = {
      total: clientes.length,
      sucessos: 0,
      erros: 0,
      detalhes: [] as string[],
      registrosCriados: {
        clientes: 0,
        enderecos: 0,
        telefones: 0
      }
    };

    for (const clienteData of clientes) {
      try {
        // Validação dos dados
        if (!clienteData.nome || !clienteData.tipoPessoa) {
          throw new Error('Nome e tipo de pessoa são obrigatórios');
        }

        // Verificar cliente existente
        if (clienteData.cnpjCpf) {
          const clienteExistente = await prisma.customer.findUnique({
            where: { cnpjCpf: clienteData.cnpjCpf }
          });

          if (clienteExistente) {
            throw new Error(`Cliente já existe com o documento ${clienteData.cnpjCpf}`);
          }
        }

        // Criar o cliente
        const novoCliente = await prisma.customer.create({
          data: {
            id: crypto.randomUUID(),
            name: clienteData.nome.trim(),
            personType: clienteData.tipoPessoa.trim(),
            cnpjCpf: clienteData.cnpjCpf?.replace(/\D/g, '') || null,
            status: '1',
            email: clienteData.email?.trim() || null,
            updatedAt: new Date(),
            address: {
              create: {
                id: crypto.randomUUID(),
                type: 'Residencial',
                zipCode: clienteData.cep?.replace(/\D/g, '') || '',
                street: clienteData.endereco?.trim() || '',
                number: clienteData.numero?.trim() || '',
                complement: clienteData.complemento?.trim() || null,
                district: clienteData.bairro?.trim() || '',
                city: clienteData.cidade?.trim() || '',
                state: clienteData.estado?.trim() || ''
              }
            }
          }
        });

        resultados.registrosCriados.clientes++;

        // Criar telefone se existir
        if (clienteData.telefoneCelular) {
          await prisma.phone.create({
            data: {
              id: crypto.randomUUID(),
              customerId: novoCliente.id,
              type: 'Celular',
              number: clienteData.telefoneCelular.replace(/\D/g, ''),
              contact: clienteData.nome.trim()
            }
          });
          resultados.registrosCriados.telefones++;
        }

        // Criar endereço se existir
        if (clienteData.cep || clienteData.endereco) {
          await prisma.address.create({
            data: {
              id: crypto.randomUUID(),
              customerId: novoCliente.id,
              type: 'Residencial',
              zipCode: clienteData.cep?.replace(/\D/g, '') || '',
              street: clienteData.endereco?.trim() || '',
              number: clienteData.numero?.trim() || '',
              complement: clienteData.complemento?.trim() || null,
              district: clienteData.bairro?.trim() || '',
              city: clienteData.cidade?.trim() || '',
              state: clienteData.estado?.trim() || ''
            }
          });
          resultados.registrosCriados.enderecos++;
        }

        resultados.sucessos++;
        resultados.detalhes.push(`Cliente ${clienteData.nome} importado com sucesso`);

      } catch (error) {
        resultados.erros++;
        const mensagemErro = error instanceof Error ? error.message : 'Erro desconhecido';
        console.error(`Erro ao importar cliente ${clienteData.nome}: ${mensagemErro}`);
        resultados.detalhes.push(`Erro ao importar cliente ${clienteData.nome}: ${mensagemErro}`);
      }
    }

    return NextResponse.json({
      mensagem: `Importação concluída: ${resultados.sucessos} clientes processados com sucesso.\n` +
        `Registros criados: ${resultados.registrosCriados.clientes} clientes, ` +
        `${resultados.registrosCriados.enderecos} endereços, ` +
        `${resultados.registrosCriados.telefones} telefones`,
      resultados
    });

  } catch (error) {
    const mensagemErro = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error("Erro geral na importação:", mensagemErro);

    return NextResponse.json(
      {
        error: "Erro ao processar importação",
        detalhes: mensagemErro
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}