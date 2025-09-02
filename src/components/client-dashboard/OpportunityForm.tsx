'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
    id: string;
    name: string;
}

interface User {
    id: string;
    name: string;
}

interface OpportunityFormProps {
    customerId: string;
    customerName: string;
    opportunity?: {
        id: string;
        name: string;
        stage: string;
        value: number;
        productId?: string;
        userId?: string;
    };
    onClose: () => void;
    onSuccess: () => void;
}

const opportunityStages = [
    { value: 'Nova', label: 'Nova' },
    { value: 'Contactada', label: 'Contactada' },
    { value: 'Proposta Enviada', label: 'Proposta Enviada' },
    { value: 'Ganha', label: 'Ganha' },
    { value: 'Perdida', label: 'Perdida' },
];

export function OpportunityForm({
    customerId,
    customerName,
    opportunity,
    onClose,
    onSuccess
}: OpportunityFormProps) {
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [formData, setFormData] = useState({
        name: opportunity?.name || '',
        stage: opportunity?.stage || 'Nova',
        value: opportunity?.value?.toString() || '',
        productId: opportunity?.productId || '',
        userId: opportunity?.userId || '',
    });

    const isEditing = !!opportunity;

    useEffect(() => {
        async function fetchData() {
            try {
                // Buscar produtos
                const productsResponse = await fetch('/api/insurance-products');
                if (productsResponse.ok) {
                    const productsData = await productsResponse.json();
                    setProducts(productsData.products || []);
                }

                // Buscar usuários
                const usersResponse = await fetch('/api/usuarios');
                if (usersResponse.ok) {
                    const usersData = await usersResponse.json();
                    setUsers(usersData.usuarios || []);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }

        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = isEditing
                ? `/api/opportunities/${opportunity.id}`
                : '/api/opportunities';

            const method = isEditing ? 'PUT' : 'POST';

            const payload = {
                name: formData.name,
                stage: formData.stage,
                value: parseFloat(formData.value),
                productId: formData.productId || null,
                userId: formData.userId || null,
                ...(isEditing ? {} : { customerId })
            };

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                toast.success(
                    isEditing
                        ? 'Oportunidade atualizada com sucesso!'
                        : 'Oportunidade criada com sucesso!'
                );
                onSuccess();
                onClose();
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || 'Erro ao salvar oportunidade');
            }
        } catch (error) {
            console.error('Error saving opportunity:', error);
            toast.error('Erro interno do servidor');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                    {isEditing ? 'Editar Oportunidade' : 'Nova Oportunidade'}
                </CardTitle>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-6 w-6 p-0"
                >
                    <X className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="customer">Cliente</Label>
                        <Input
                            id="customer"
                            value={customerName}
                            disabled
                            className="bg-muted"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Nome da Oportunidade *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Ex: Seguro Auto - Renovação"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="stage">Estágio *</Label>
                            <Select
                                value={formData.stage}
                                onValueChange={(value) => handleInputChange('stage', value)}
                            >
                                <SelectTrigger id="stage">
                                    <SelectValue placeholder="Selecione o estágio" />
                                </SelectTrigger>
                                <SelectContent>
                                    {opportunityStages.map(stage => (
                                        <SelectItem key={stage.value} value={stage.value}>
                                            {stage.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="value">Valor Estimado (R$) *</Label>
                            <Input
                                id="value"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.value}
                                onChange={(e) => handleInputChange('value', e.target.value)}
                                placeholder="0,00"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="product">Produto</Label>
                            <Select
                                value={formData.productId}
                                onValueChange={(value) => handleInputChange('productId', value)}
                            >
                                <SelectTrigger id="product">
                                    <SelectValue placeholder="Selecione um produto" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Nenhum produto</SelectItem>
                                    {products.map(product => (
                                        <SelectItem key={product.id} value={product.id}>
                                            {product.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="user">Responsável</Label>
                            <Select
                                value={formData.userId}
                                onValueChange={(value) => handleInputChange('userId', value)}
                            >
                                <SelectTrigger id="user">
                                    <SelectValue placeholder="Selecione um responsável" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Nenhum responsável</SelectItem>
                                    {users.map(user => (
                                        <SelectItem key={user.id} value={user.id}>
                                            {user.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? 'Atualizar' : 'Criar'} Oportunidade
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}