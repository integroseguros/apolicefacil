'use client'

import { useState, useCallback } from 'react';
import { useForm, UseFormProps, UseFormReturn, FieldValues } from 'react-hook-form';
import { useErrorHandler } from './useErrorHandler';
import { toast } from 'sonner';

interface UseFormWithErrorHandlingOptions<T extends FieldValues> extends UseFormProps<T> {
    onSubmitSuccess?: (data: T) => void;
    onSubmitError?: (error: Error) => void;
    successMessage?: string;
    errorMessage?: string;
}

interface FormState {
    isSubmitting: boolean;
    submitError: Error | null;
    submitCount: number;
}

export function useFormWithErrorHandling<T extends FieldValues>(
    options: UseFormWithErrorHandlingOptions<T> = {}
) {
    const {
        onSubmitSuccess,
        onSubmitError,
        successMessage = 'Operação realizada com sucesso!',
        errorMessage,
        ...formOptions
    } = options;

    const form = useForm<T>(formOptions);
    const { handleError, clearError } = useErrorHandler();

    const [formState, setFormState] = useState<FormState>({
        isSubmitting: false,
        submitError: null,
        submitCount: 0,
    });

    const handleSubmit = useCallback(
        (submitFn: (data: T) => Promise<void> | void) => {
            return form.handleSubmit(async (data: T) => {
                setFormState(prev => ({
                    ...prev,
                    isSubmitting: true,
                    submitError: null,
                    submitCount: prev.submitCount + 1,
                }));

                clearError();

                try {
                    const result = submitFn(data);
                    if (result instanceof Promise) {
                        await result;
                    }

                    // Success
                    setFormState(prev => ({
                        ...prev,
                        isSubmitting: false,
                        submitError: null,
                    }));

                    toast.success(successMessage);
                    onSubmitSuccess?.(data);

                } catch (error) {
                    const submitError = error as Error;

                    setFormState(prev => ({
                        ...prev,
                        isSubmitting: false,
                        submitError,
                    }));

                    // Handle form validation errors
                    if (submitError.message.includes('validation')) {
                        // Try to parse validation errors and set field errors
                        try {
                            const validationData = JSON.parse(submitError.message);
                            if (validationData.fieldErrors) {
                                Object.entries(validationData.fieldErrors).forEach(([field, message]) => {
                                    form.setError(field as any, {
                                        type: 'server',
                                        message: message as string,
                                    });
                                });
                            }
                        } catch {
                            // If parsing fails, show general error
                            form.setError('root', {
                                type: 'server',
                                message: submitError.message,
                            });
                        }
                    } else {
                        // Set general form error
                        form.setError('root', {
                            type: 'server',
                            message: errorMessage || submitError.message,
                        });
                    }

                    handleError(submitError);
                    onSubmitError?.(submitError);
                }
            });
        },
        [form, handleError, clearError, successMessage, errorMessage, onSubmitSuccess, onSubmitError]
    );

    const resetForm = useCallback(() => {
        form.reset();
        setFormState({
            isSubmitting: false,
            submitError: null,
            submitCount: 0,
        });
        clearError();
    }, [form, clearError]);

    const clearSubmitError = useCallback(() => {
        setFormState(prev => ({
            ...prev,
            submitError: null,
        }));
        form.clearErrors('root');
    }, [form]);

    return {
        ...form,
        handleSubmit,
        resetForm,
        clearSubmitError,
        isSubmitting: formState.isSubmitting,
        submitError: formState.submitError,
        submitCount: formState.submitCount,
        hasSubmitted: formState.submitCount > 0,
    };
}

// Utility function to extract error message from form errors
export function getFormErrorMessage(form: UseFormReturn<any>): string | null {
    const rootError = form.formState.errors.root;
    if (rootError) {
        return rootError.message || 'Erro no formulário';
    }

    // Check for field errors
    const fieldErrors = Object.values(form.formState.errors);
    if (fieldErrors.length > 0) {
        const firstError = fieldErrors[0];
        return (firstError?.message as string) || 'Erro de validação';
    }

    return null;
}