'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
    PlusCircle,
    Phone,
    Mail,
    MessageSquare,
    FileText,
    Users,
    Clock,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
    Edit,
    Trash2
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useActivities, useDeleteActivity, type Activity } from '@/hooks/useActivities';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { ActivityForm } from './ActivityForm';
import { ActivityFilters } from './ActivityFilters';

interface AtividadesTabProps {
    customerId: string;
    customerName: string;
    activities: Activity[];
}

function getActivityIcon(type: string) {
    const iconMap: Record<string, React.ReactNode> = {
        call: <Phone className="h-4 w-4" />,
        email: <Mail className="h-4 w-4" />,
        whatsapp: <MessageSquare className="h-4 w-4" />,
        meeting: <Users className="h-4 w-4" />,
        note: <FileText className="h-4 w-4" />,
    };

    return iconMap[type] || <FileText className="h-4 w-4" />;
}

function getActivityColor(type: string) {
    const colorMap: Record<string, string> = {
        call: 'bg-blue-100 text-blue-800 border-blue-200',
        email: 'bg-green-100 text-green-800 border-green-200',
        whatsapp: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        meeting: 'bg-purple-100 text-purple-800 border-purple-200',
        note: 'bg-gray-100 text-gray-800 border-gray-200',
    };

    return colorMap[type] || 'bg-gray-100 text-gray-800 border-gray-200';
}

function getActivityLabel(type: string) {
    const labelMap: Record<string, string> = {
        call: 'Ligação',
        email: 'E-mail',
        whatsapp: 'WhatsApp',
        meeting: 'Reunião',
        note: 'Nota',
    };

    return labelMap[type] || 'Atividade';
}

function formatActivityDate(date: Date | string): string {
    const activityDate = typeof date === 'string' ? new Date(date) : date;

    try {
        return formatDistanceToNow(activityDate, {
            addSuffix: true,
            locale: ptBR
        });
    } catch {
        return 'Data inválida';
    }
}

function getUserInitials(name: string): string {
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export default function AtividadesTab({
    customerId,
    customerName,
    activities: initialActivities
}: AtividadesTabProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState<{ search?: string; type?: Activity['type'] }>({});
    const [deleteActivityId, setDeleteActivityId] = useState<string | null>(null);

    const { handleError } = useErrorHandler();
    const itemsPerPage = 10;

    // Use React Query to fetch activities with real-time updates
    const { data: activitiesData, isLoading, error } = useActivities({
        customerId,
        page: currentPage,
        limit: itemsPerPage,
        type: filters.type,
    });

    const deleteActivity = useDeleteActivity();

    // Use server data if available, fallback to initial data
    const serverActivities = activitiesData?.activities || [];
    const allActivities = serverActivities.length > 0 ? serverActivities : initialActivities;

    // Filter activities based on search
    const filteredActivities = useMemo(() => {
        if (!filters.search) return allActivities;

        const searchLower = filters.search.toLowerCase();
        return allActivities.filter(activity =>
            activity.title.toLowerCase().includes(searchLower) ||
            activity.description?.toLowerCase().includes(searchLower) ||
            activity.user?.name.toLowerCase().includes(searchLower)
        );
    }, [allActivities, filters.search]);

    // Pagination for filtered results
    const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedActivities = filteredActivities.slice(startIndex, startIndex + itemsPerPage);

    // Activity statistics
    const activityStats = useMemo(() => {
        return {
            total: allActivities.length,
            call: allActivities.filter(a => a.type === 'call').length,
            email: allActivities.filter(a => a.type === 'email').length,
            whatsapp: allActivities.filter(a => a.type === 'whatsapp').length,
            meeting: allActivities.filter(a => a.type === 'meeting').length,
            note: allActivities.filter(a => a.type === 'note').length,
        };
    }, [allActivities]);

    const handleDeleteActivity = async (activityId: string) => {
        try {
            await deleteActivity.mutateAsync({ activityId, customerId });
            setDeleteActivityId(null);
        } catch (error) {
            handleError(error as Error);
        }
    };

    const handleFiltersChange = (newFilters: { search?: string; type?: Activity['type'] }) => {
        setFilters(newFilters);
        setCurrentPage(1); // Reset to first page when filtering
    };

    if (error) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center space-y-4">
                        <div className="text-red-600 font-medium">
                            Erro ao carregar atividades
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Não foi possível carregar as atividades do cliente. Verifique sua conexão e tente novamente.
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => window.location.reload()}
                            className="gap-2"
                        >
                            <Clock className="h-4 w-4" />
                            Tentar Novamente
                        </Button>
                    </div>
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
                            <Clock className="h-5 w-5" />
                            Atividades
                        </CardTitle>
                        <CardDescription>
                            Histórico de interações e atividades com {customerName}.
                        </CardDescription>
                    </div>
                    <Button size="sm" className="gap-2" onClick={() => setIsFormOpen(true)}>
                        <PlusCircle className="h-4 w-4" />
                        Nova Atividade
                    </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Activity Statistics */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {[
                            { type: 'total', label: 'Total', count: activityStats.total, color: 'bg-blue-100 text-blue-800 border-blue-200' },
                            { type: 'call', label: 'Ligações', count: activityStats.call, color: getActivityColor('call') },
                            { type: 'email', label: 'E-mails', count: activityStats.email, color: getActivityColor('email') },
                            { type: 'whatsapp', label: 'WhatsApp', count: activityStats.whatsapp, color: getActivityColor('whatsapp') },
                            { type: 'meeting', label: 'Reuniões', count: activityStats.meeting, color: getActivityColor('meeting') },
                        ].map(stat => (
                            <Card key={stat.type}>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-2 rounded-full ${stat.color}`}>
                                            {stat.type === 'total' ? <Clock className="h-4 w-4" /> : getActivityIcon(stat.type)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{stat.label}</p>
                                            <p className="text-2xl font-bold">{stat.count}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Filters */}
                    <ActivityFilters
                        onFiltersChange={handleFiltersChange}
                        totalCount={allActivities.length}
                        filteredCount={filteredActivities.length}
                    />

                    {/* Activities List */}
                    {isLoading ? (
                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex gap-4">
                                    <Skeleton className="h-12 w-12 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                        <Skeleton className="h-20 w-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : paginatedActivities.length > 0 ? (
                        <div className="space-y-4">
                            {paginatedActivities.map((activity, index) => (
                                <div key={activity.id} className="flex gap-4">
                                    {/* Timeline line */}
                                    <div className="flex flex-col items-center">
                                        <div className={`p-2 rounded-full border-2 ${getActivityColor(activity.type)}`}>
                                            {getActivityIcon(activity.type)}
                                        </div>
                                        {index < paginatedActivities.length - 1 && (
                                            <div className="w-px h-16 bg-border mt-2" />
                                        )}
                                    </div>

                                    {/* Activity content */}
                                    <div className="flex-1 pb-8">
                                        <Card>
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Badge
                                                                variant="outline"
                                                                className={getActivityColor(activity.type)}
                                                            >
                                                                {getActivityLabel(activity.type)}
                                                            </Badge>
                                                            <span className="text-sm text-muted-foreground">
                                                                {formatActivityDate(activity.date)}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {format(new Date(activity.date), 'HH:mm')}
                                                            </span>
                                                        </div>

                                                        <h4 className="font-semibold mb-1">{activity.title}</h4>

                                                        {activity.description && (
                                                            <p className="text-sm text-muted-foreground mb-3">
                                                                {activity.description}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2 ml-4">
                                                        {/* User avatar */}
                                                        {activity.user && (
                                                            <div className="flex items-center gap-2">
                                                                <Avatar className="h-8 w-8">
                                                                    <AvatarImage
                                                                        src={activity.user.avatarUrl || undefined}
                                                                        alt={activity.user.name}
                                                                    />
                                                                    <AvatarFallback className="text-xs">
                                                                        {getUserInitials(activity.user.name)}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <span className="text-sm text-muted-foreground">
                                                                    {activity.user.name}
                                                                </span>
                                                            </div>
                                                        )}

                                                        {/* Actions menu */}
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem>
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Editar
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="text-red-600"
                                                                    onClick={() => setDeleteActivityId(activity.id)}
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Excluir
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-center">
                            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">
                                {filters.search || filters.type ? 'Nenhuma atividade encontrada' : 'Nenhuma atividade registrada'}
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                {filters.search || filters.type
                                    ? 'Tente ajustar os filtros para encontrar atividades.'
                                    : 'Ainda não há atividades registradas para este cliente.'
                                }
                            </p>
                            <Button onClick={() => setIsFormOpen(true)}>
                                <PlusCircle className="h-4 w-4 mr-2" />
                                {filters.search || filters.type ? 'Nova Atividade' : 'Registrar Primeira Atividade'}
                            </Button>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                Página {currentPage} de {totalPages} ({filteredActivities.length} atividades)
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Anterior
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Próxima
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Activity Form Modal */}
            <ActivityForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                customerId={customerId}
                customerName={customerName}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteActivityId} onOpenChange={() => setDeleteActivityId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Atividade</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir esta atividade? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteActivityId && handleDeleteActivity(deleteActivityId)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}