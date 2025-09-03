'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    PlusCircle,
    MapPin,
    Home,
    Building,
    Edit,
    Trash2,
    Navigation,
    Loader2,
    AlertTriangle
} from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAddresses, type Address, type CreateAddressData } from '@/hooks/useAddresses';
import AddressForm from './AddressForm';
import { toast } from 'sonner';

interface EnderecosTabProps {
    customerId: string;
}

function getAddressTypeIcon(type: string | null | undefined) {
    switch (type?.toLowerCase()) {
        case 'residencial':
        case 'casa':
            return <Home className="h-4 w-4" />;
        case 'comercial':
        case 'trabalho':
            return <Building className="h-4 w-4" />;
        default:
            return <MapPin className="h-4 w-4" />;
    }
}

function getAddressTypeLabel(type: string | null | undefined): string {
    if (!type) return 'Endereço';

    const typeMap: Record<string, string> = {
        'residencial': 'Residencial',
        'comercial': 'Comercial',
        'casa': 'Casa',
        'trabalho': 'Trabalho',
        'outro': 'Outro',
    };

    return typeMap[type.toLowerCase()] || type;
}

function formatAddress(address: Address): string {
    const parts = [];

    if (address.street) {
        let streetPart = address.street;
        if (address.number) {
            streetPart += `, ${address.number}`;
        }
        if (address.complement) {
            streetPart += ` - ${address.complement}`;
        }
        parts.push(streetPart);
    }

    if (address.district) {
        parts.push(address.district);
    }

    if (address.city && address.state) {
        parts.push(`${address.city} - ${address.state}`);
    } else if (address.city) {
        parts.push(address.city);
    }

    if (address.zipCode) {
        const formattedZip = address.zipCode.replace(/(\d{5})(\d{3})/, '$1-$2');
        parts.push(`CEP: ${formattedZip}`);
    }

    return parts.join(', ') || 'Endereço incompleto';
}

function getGoogleMapsUrl(address: Address): string {
    const addressString = formatAddress(address);
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressString)}`;
}

export default function EnderecosTab({ customerId }: EnderecosTabProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [deletingAddress, setDeletingAddress] = useState<Address | null>(null);

    const {
        addresses,
        isLoading,
        error,
        createAddress,
        updateAddress,
        deleteAddress,
        isCreating,
        isUpdating,
        isDeleting,
    } = useAddresses(customerId);

    const handleCreateAddress = async (data: CreateAddressData) => {
        await createAddress(data);
        setIsFormOpen(false);
    };

    const handleUpdateAddress = async (data: CreateAddressData) => {
        if (!editingAddress) return;
        await updateAddress({ ...data, id: editingAddress.id });
        setEditingAddress(null);
    };

    const handleDeleteAddress = async () => {
        if (!deletingAddress) return;
        try {
            await deleteAddress(deletingAddress.id);
            setDeletingAddress(null);
            toast.success('Endereço excluído com sucesso');
        } catch (error) {
            toast.error('Erro ao excluir endereço');
        }
    };

    const openEditForm = (address: Address) => {
        setEditingAddress(address);
    };

    const openDeleteDialog = (address: Address) => {
        setDeletingAddress(address);
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center h-48 text-center">
                    <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Erro ao carregar endereços</h3>
                    <p className="text-muted-foreground mb-4">
                        Ocorreu um erro ao carregar os endereços do cliente.
                    </p>
                    <Button onClick={() => window.location.reload()}>
                        Tentar Novamente
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Endereços
                        </CardTitle>
                        <CardDescription>
                            Endereços cadastrados para este cliente.
                        </CardDescription>
                    </div>
                    <Button
                        size="sm"
                        className="gap-2"
                        onClick={() => setIsFormOpen(true)}
                    >
                        <PlusCircle className="h-4 w-4" />
                        Novo Endereço
                    </Button>
                </CardHeader>
                <CardContent>
                    {addresses.length > 0 ? (
                        <div className="space-y-4">
                            {/* Address Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">Total de Endereços</p>
                                                <p className="text-2xl font-bold">{addresses.length}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Home className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">Residenciais</p>
                                                <p className="text-2xl font-bold">
                                                    {addresses.filter((a: Address) =>
                                                        a.type?.toLowerCase() === 'residencial' ||
                                                        a.type?.toLowerCase() === 'casa'
                                                    ).length}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Building className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">Comerciais</p>
                                                <p className="text-2xl font-bold">
                                                    {addresses.filter((a: Address) =>
                                                        a.type?.toLowerCase() === 'comercial' ||
                                                        a.type?.toLowerCase() === 'trabalho'
                                                    ).length}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Address List */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Lista de Endereços</h3>
                                <div className="grid gap-4">
                                    {addresses.map((address: Address) => (
                                        <Card key={address.id}>
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Badge variant="outline" className="gap-1">
                                                                {getAddressTypeIcon(address.type)}
                                                                {getAddressTypeLabel(address.type)}
                                                            </Badge>
                                                        </div>

                                                        <div className="space-y-1">
                                                            <p className="font-medium">
                                                                {formatAddress(address)}
                                                            </p>

                                                            {address.zipCode && (
                                                                <p className="text-sm text-muted-foreground">
                                                                    CEP: {address.zipCode.replace(/(\d{5})(\d{3})/, '$1-$2')}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Action buttons */}
                                                    <div className="flex items-center gap-2 ml-4">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="gap-1"
                                                            asChild
                                                        >
                                                            <a
                                                                href={getGoogleMapsUrl(address)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                <Navigation className="h-3 w-3" />
                                                                Ver no Mapa
                                                            </a>
                                                        </Button>

                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="gap-1"
                                                            onClick={() => openEditForm(address)}
                                                            disabled={isUpdating}
                                                        >
                                                            {isUpdating ? (
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                            ) : (
                                                                <Edit className="h-3 w-3" />
                                                            )}
                                                            Editar
                                                        </Button>

                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="gap-1 text-destructive hover:text-destructive"
                                                            onClick={() => openDeleteDialog(address)}
                                                            disabled={isDeleting}
                                                        >
                                                            {isDeleting ? (
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="h-3 w-3" />
                                                            )}
                                                            Excluir
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-center">
                            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Nenhum endereço encontrado</h3>
                            <p className="text-muted-foreground mb-4">
                                Este cliente ainda não possui endereços cadastrados.
                            </p>
                            <Button onClick={() => setIsFormOpen(true)}>
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Cadastrar Primeiro Endereço
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Address Form Modal */}
            <AddressForm
                isOpen={isFormOpen || !!editingAddress}
                onClose={() => {
                    setIsFormOpen(false);
                    setEditingAddress(null);
                }}
                onSubmit={editingAddress ? handleUpdateAddress : handleCreateAddress}
                address={editingAddress}
                isLoading={isCreating || isUpdating}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deletingAddress} onOpenChange={() => setDeletingAddress(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir este endereço? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                        {deletingAddress && (
                            <div className="mt-2 p-2 bg-muted rounded text-sm">
                                <strong>{getAddressTypeLabel(deletingAddress.type)}</strong>
                                <br />
                                {formatAddress(deletingAddress)}
                            </div>
                        )}
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteAddress}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Excluir Endereço
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}