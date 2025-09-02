'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useErrorHandler } from './useErrorHandler';

export interface Activity {
    id: string;
    type: 'call' | 'email' | 'whatsapp' | 'meeting' | 'note';
    title: string;
    description: string | null;
    date: Date;
    user: {
        id: string;
        name: string;
        avatarUrl?: string | null;
    } | null;
}

interface UseActivitiesOptions {
    customerId: string;
    page?: number;
    limit?: number;
    type?: Activity['type'];
}

interface ActivitiesResponse {
    activities: Activity[];
    total: number;
    page: number;
    totalPages: number;
}

export function useActivities(options: UseActivitiesOptions) {
    const { customerId, page = 1, limit = 10, type } = options;
    const { handleError } = useErrorHandler();

    return useQuery<ActivitiesResponse>({
        queryKey: ['activities', customerId, page, limit, type],
        queryFn: async () => {
            try {
                const params = new URLSearchParams({
                    page: page.toString(),
                    limit: limit.toString(),
                });

                if (type) {
                    params.append('type', type);
                }

                return await apiClient.get<ActivitiesResponse>(
                    `/api/clientes/${customerId}/activities?${params}`
                );
            } catch (error) {
                handleError(error as Error);
                throw error;
            }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: (failureCount, error) => {
            // Don't retry on 404 or 403 errors
            if (error instanceof Error && (error.message.includes('404') || error.message.includes('403'))) {
                return false;
            }
            return failureCount < 3;
        },
    });
}

export function useCreateActivity() {
    const queryClient = useQueryClient();
    const { handleError } = useErrorHandler();

    return useMutation({
        mutationFn: async (data: {
            customerId: string;
            type: Activity['type'];
            title: string;
            description?: string;
            date: Date;
        }) => {
            try {
                return await apiClient.post<Activity>(
                    `/api/clientes/${data.customerId}/activities`,
                    data
                );
            } catch (error) {
                handleError(error as Error);
                throw error;
            }
        },
        onSuccess: (_, variables) => {
            // Invalidate and refetch activities
            queryClient.invalidateQueries({
                queryKey: ['activities', variables.customerId],
            });
        },
    });
}

export function useUpdateActivity() {
    const queryClient = useQueryClient();
    const { handleError } = useErrorHandler();

    return useMutation({
        mutationFn: async (data: {
            activityId: string;
            customerId: string;
            type?: Activity['type'];
            title?: string;
            description?: string;
            date?: Date;
        }) => {
            try {
                const { activityId, customerId, ...updateData } = data;
                return await apiClient.put<Activity>(
                    `/api/clientes/${customerId}/activities/${activityId}`,
                    updateData
                );
            } catch (error) {
                handleError(error as Error);
                throw error;
            }
        },
        onSuccess: (_, variables) => {
            // Invalidate and refetch activities
            queryClient.invalidateQueries({
                queryKey: ['activities', variables.customerId],
            });
        },
    });
}

export function useDeleteActivity() {
    const queryClient = useQueryClient();
    const { handleError } = useErrorHandler();

    return useMutation({
        mutationFn: async (data: { activityId: string; customerId: string }) => {
            try {
                return await apiClient.delete(
                    `/api/clientes/${data.customerId}/activities/${data.activityId}`
                );
            } catch (error) {
                handleError(error as Error);
                throw error;
            }
        },
        onSuccess: (_, variables) => {
            // Invalidate and refetch activities
            queryClient.invalidateQueries({
                queryKey: ['activities', variables.customerId],
            });
        },
    });
}