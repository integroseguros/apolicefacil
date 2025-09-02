'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Search } from 'lucide-react';
import { fetchCepData, formatCep, isValidCep } from '@/utils/cep';
import { toast } from 'sonner';

const addressSchema = z.object({
    type: z.string().min(1, 'Selecione o tipo de endereço'),
    street: z.string().min(1, 'Rua é obrigatória'),
    number: z.string().optional(),
    complement: z.string().optional(),
    district: z.string().min(1, 'Bairro é obrigatório'),
    city: z.string().min(1, 'Cidade é obrigatória'),
    state: z.string().min(2, 'Estado é obrigatório').max(2, 'Estado deve ter 2 caracteres'),
    zipCode: z.string().min(8, 'CEP deve ter 8 dígitos'),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface Address {
    id: string;
    type?: string | null;
    street?: string | null;
    number?: string | null;
    complement?: string | null;
    district?: string | null;
    city?: string | null;
    state?: string | null;
    zipCode?: string | null;
}

interface AddressFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: AddressFormData) => Promise<void>;
    address?: Address | null;
    isLoading?: boolean;
}

const addressTypes = [
    { value: 'residencial', label: 'Residencial' },
    { value: 'comercial', label: 'Comercial' },
    { value: 'trabalho', label: 'Trabalho' },
    { value: 'outro', label: 'Outro' },
];

const brazilianStates = [
    { value: 'AC', label: 'Acre' },
    { value: 'AL', label: 'Alagoas' },
    { value: 'AP', label: 'Amapá' },
    { value: 'AM', label: 'Amazonas' },
    { value: 'BA', label: 'Bahia' },
    { value: 'CE', label: 'Ceará' },
    { value: 'DF', label: 'Distrito Federal' },
    { value: 'ES', label: 'Espírito Santo' },
    { value: 'GO', label: 'Goiás' },
    { value: 'MA', label: 'Maranhão' },
    { value: 'MT', label: 'Mato Grosso' },
    { value: 'MS', label: 'Mato Grosso do Sul' },
    { value: 'MG', label: 'Minas Gerais' },
    { value: 'PA', label: 'Pará' },
    { value: 'PB', label: 'Paraíba' },
    { value: 'PR', label: 'Paraná' },
    { value: 'PE', label: 'Pernambuco' },
    { value: 'PI', label: 'Piauí' },
    { value: 'RJ', label: 'Rio de Janeiro' },
    { value: 'RN', label: 'Rio Grande do Norte' },
    { value: 'RS', label: 'Rio Grande do Sul' },
    { value: 'RO', label: 'Rondônia' },
    { value: 'RR', label: 'Roraima' },
    { value: 'SC', label: 'Santa Catarina' },
    { value: 'SP', label: 'São Paulo' },
    { value: 'SE', label: 'Sergipe' },
    { value: 'TO', label: 'Tocantins' },
];

export default function AddressForm({
    isOpen,
    onClose,
    onSubmit,
    address,
    isLoading = false,
}: AddressFormProps) {
    const [isSearchingCep, setIsSearchingCep] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<AddressFormData>({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            type: address?.type || 'residencial',
            street: address?.street || '',
            number: address?.number || '',
            complement: address?.complement || '',
            district: address?.district || '',
            city: address?.city || '',
            state: address?.state || '',
            zipCode: address?.zipCode || '',
        },
    });

    const zipCode = watch('zipCode');

    // Reset form when address changes
    useEffect(() => {
        if (address) {
            reset({
                type: address.type || 'residencial',
                street: address.street || '',
                number: address.number || '',
                complement: address.complement || '',
                district: address.district || '',
                city: address.city || '',
                state: address.state || '',
                zipCode: address.zipCode || '',
            });
        } else {
            reset({
                type: 'residencial',
                street: '',
                number: '',
                complement: '',
                district: '',
                city: '',
                state: '',
                zipCode: '',
            });
        }
    }, [address, reset]);

    const handleCepSearch = async () => {
        if (!zipCode || !isValidCep(zipCode)) {
            toast.error('CEP inválido');
            return;
        }

        setIsSearchingCep(true);
        try {
            const cepData = await fetchCepData(zipCode);

            if (cepData) {
                setValue('street', cepData.logradouro);
                setValue('district', cepData.bairro);
                setValue('city', cepData.localidade);
                setValue('state', cepData.uf);
                toast.success('Endereço preenchido automaticamente');
            } else {
                toast.error('CEP não encontrado');
            }
        } catch (error) {
            toast.error('Erro ao buscar CEP');
        } finally {
            setIsSearchingCep(false);
        }
    };

    const handleFormSubmit = async (data: AddressFormData) => {
        try {
            await onSubmit(data);
            onClose();
            toast.success(address ? 'Endereço atualizado com sucesso' : 'Endereço criado com sucesso');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Erro ao salvar endereço');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>
                        {address ? 'Editar Endereço' : 'Novo Endereço'}
                    </DialogTitle>
                    <DialogDescription>
                        {address
                            ? 'Edite as informações do endereço abaixo.'
                            : 'Preencha as informações do novo endereço.'
                        }
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Tipo de Endereço</Label>
                            <Select
                                value={watch('type')}
                                onValueChange={(value) => setValue('type', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {addressTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.type && (
                                <p className="text-sm text-destructive">{errors.type.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="zipCode">CEP</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="zipCode"
                                    {...register('zipCode')}
                                    placeholder="00000-000"
                                    maxLength={9}
                                    onChange={(e) => {
                                        const formatted = formatCep(e.target.value);
                                        setValue('zipCode', formatted);
                                    }}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={handleCepSearch}
                                    disabled={isSearchingCep || !isValidCep(zipCode)}
                                >
                                    {isSearchingCep ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Search className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            {errors.zipCode && (
                                <p className="text-sm text-destructive">{errors.zipCode.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="street">Rua</Label>
                            <Input
                                id="street"
                                {...register('street')}
                                placeholder="Nome da rua"
                            />
                            {errors.street && (
                                <p className="text-sm text-destructive">{errors.street.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="number">Número</Label>
                            <Input
                                id="number"
                                {...register('number')}
                                placeholder="123"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="complement">Complemento</Label>
                        <Input
                            id="complement"
                            {...register('complement')}
                            placeholder="Apartamento, bloco, etc."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="district">Bairro</Label>
                            <Input
                                id="district"
                                {...register('district')}
                                placeholder="Nome do bairro"
                            />
                            {errors.district && (
                                <p className="text-sm text-destructive">{errors.district.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="city">Cidade</Label>
                            <Input
                                id="city"
                                {...register('city')}
                                placeholder="Nome da cidade"
                            />
                            {errors.city && (
                                <p className="text-sm text-destructive">{errors.city.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="state">Estado</Label>
                        <Select
                            value={watch('state')}
                            onValueChange={(value) => setValue('state', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o estado" />
                            </SelectTrigger>
                            <SelectContent>
                                {brazilianStates.map((state) => (
                                    <SelectItem key={state.value} value={state.value}>
                                        {state.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.state && (
                            <p className="text-sm text-destructive">{errors.state.message}</p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {address ? 'Atualizar' : 'Criar'} Endereço
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}