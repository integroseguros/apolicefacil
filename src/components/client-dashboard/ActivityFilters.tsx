'use client';

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';
import type { Activity } from '@/hooks/useActivities';

interface ActivityFiltersProps {
    onFiltersChange: (filters: {
        search?: string;
        type?: Activity['type'];
    }) => void;
    totalCount: number;
    filteredCount: number;
}

const activityTypes = [
    { value: 'call', label: 'Ligação' },
    { value: 'meeting', label: 'Reunião' },
    { value: 'email', label: 'E-mail' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'note', label: 'Nota' },
];

export function ActivityFilters({
    onFiltersChange,
    totalCount,
    filteredCount,
}: ActivityFiltersProps) {
    const [search, setSearch] = useState('');
    const [selectedType, setSelectedType] = useState<Activity['type'] | undefined>();
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        onFiltersChange({
            search: value || undefined,
            type: selectedType,
        });
    };

    const handleTypeChange = (type: Activity['type'] | 'all') => {
        const newType = type === 'all' ? undefined : type;
        setSelectedType(newType);
        onFiltersChange({
            search: search || undefined,
            type: newType,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setSelectedType(undefined);
        onFiltersChange({});
    };

    const hasActiveFilters = search || selectedType;
    const isFiltered = filteredCount !== totalCount;

    return (
        <div className="space-y-4">
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-2">
                {/* Search Input */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar atividades..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Filter Popover */}
                <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="gap-2">
                            <Filter className="h-4 w-4" />
                            Filtros
                            {hasActiveFilters && (
                                <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                                    {[search, selectedType].filter(Boolean).length}
                                </Badge>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="end">
                        <Card>
                            <CardContent className="p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold">Filtros</h4>
                                    {hasActiveFilters && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearFilters}
                                            className="h-auto p-1 text-xs"
                                        >
                                            Limpar
                                        </Button>
                                    )}
                                </div>

                                {/* Type Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Tipo de Atividade</label>
                                    <Select
                                        value={selectedType || 'all'}
                                        onValueChange={handleTypeChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos os tipos</SelectItem>
                                            {activityTypes.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    </PopoverContent>
                </Popover>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="gap-2"
                    >
                        <X className="h-4 w-4" />
                        Limpar
                    </Button>
                )}
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
                <div className="flex flex-wrap gap-2">
                    {search && (
                        <Badge variant="secondary" className="gap-1">
                            Busca: "{search}"
                            <Button
                                onClick={() => handleSearchChange('')}
                                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </Badge>
                    )}
                    {selectedType && (
                        <Badge variant="secondary" className="gap-1">
                            Tipo: {activityTypes.find(t => t.value === selectedType)?.label}
                            <Button
                                onClick={() => handleTypeChange('all')}
                                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </Badge>
                    )}
                </div>
            )}

            {/* Results Count */}
            {isFiltered && (
                <div className="text-sm text-muted-foreground">
                    Mostrando {filteredCount} de {totalCount} atividades
                </div>
            )}
        </div>
    );
}