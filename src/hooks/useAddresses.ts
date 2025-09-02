
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Address {
    id: string;
    type?: string | null;
    street?: string | null;
    number?: string | null;
    complement?: string | null;
    district?: string | null;
    city?: string | null;
    state?: string | null;
    zipCode?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateAddressData {
    type: string;
    street: string;
    number?: string;
    complement?: string;
    district?: string;
    city: string;
    state: string;
    zipCode: string;
}

export interface UpdateAddressData extends CreateAddressData {
    id: string;
}

export function useAddresses(customerId: string) {
    const queryClient = useQueryClient();

    // Buscar endereços
    const {
        data: addresses = [],
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['addresses', customerId],
        queryFn: async () => {
            const response = await fetch(`/api/clientes/${customerId}/enderecos`);
            if (!response.ok) {
                throw new Error('Erro ao buscar endereços');
            }
            const data = await response.json();
            return data.addresses || [];
        },
        enabled: !!customerId,
    });

    // Criar endereço
    const createMutation = useMutation({
        mutationFn: async (addressData: CreateAddressData) => {
            const response = await fetch(`/api/clientes/${customerId}/enderecos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(addressData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao criar endereço');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['addresses', customerId] });
        },
    });

    // Atualizar endereço
    const updateMutation = useMutation({
        mutationFn: async (addressData: UpdateAddressData) => {
            const { id, ...data } = addressData;
            const response = await fetch(`/api/clientes/${customerId}/enderecos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao atualizar endereço');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['addresses', customerId] });
        },
    });

    // Excluir endereço
    const deleteMutation = useMutation({
        mutationFn: async (addressId: string) => {
            const response = await fetch(`/api/clientes/${customerId}/enderecos/${addressId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao excluir endereço');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['addresses', customerId] });
        },
    });

    return {
        addresses,
        isLoading,
        error,
        refetch,
        createAddress: createMutation.mutateAsync,
        updateAddress: updateMutation.mutateAsync,
        deleteAddress: deleteMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}