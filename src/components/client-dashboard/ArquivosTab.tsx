'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
    Upload,
    FileText,
    Download,
    Edit,
    Trash2,
    MoreVertical,
    File,
    FileSpreadsheet,
    FileImage,
    Plus,
    Search,
    Filter
} from 'lucide-react';
import { Document, DocumentCategory } from '@/types';
import { toast } from 'sonner';

interface ArquivosTabProps {
    customerId: string;
}

const categoryLabels: Record<DocumentCategory, string> = {
    IDENTIFICATION: 'Identificação',
    CONTRACT: 'Contratos',
    POLICY: 'Apólices',
    PROPOSAL: 'Propostas',
    PHOTO: 'Fotos',
    FINANCIAL: 'Financeiro',
    LEGAL: 'Jurídico',
    OTHER: 'Outros'
};

const categoryColors: Record<DocumentCategory, string> = {
    IDENTIFICATION: 'bg-blue-100 text-blue-800',
    CONTRACT: 'bg-green-100 text-green-800',
    POLICY: 'bg-purple-100 text-purple-800',
    PROPOSAL: 'bg-orange-100 text-orange-800',
    PHOTO: 'bg-pink-100 text-pink-800',
    FINANCIAL: 'bg-yellow-100 text-yellow-800',
    LEGAL: 'bg-red-100 text-red-800',
    OTHER: 'bg-gray-100 text-gray-800'
};

function getFileIcon(mimeType: string) {
    if (mimeType.startsWith('image/')) return <FileImage className="h-4 w-4" />;
    if (mimeType.includes('pdf')) return <FileText className="h-4 w-4" />;
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return <FileSpreadsheet className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
}

function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function ArquivosTab({ customerId }: ArquivosTabProps) {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'ALL'>('ALL');
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [editingDocument, setEditingDocument] = useState<Document | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form states
    const [uploadForm, setUploadForm] = useState({
        category: '' as DocumentCategory,
        description: ''
    });

    const [editForm, setEditForm] = useState({
        name: '',
        description: '',
        category: '' as DocumentCategory
    });

    useEffect(() => {
        fetchDocuments();
    }, [customerId]);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/customers/${customerId}/documents`);
            if (response.ok) {
                const data = await response.json();
                setDocuments(data);
            } else {
                toast.error('Erro ao carregar documentos');
            }
        } catch (error) {
            console.error('Error fetching documents:', error);
            toast.error('Erro ao carregar documentos');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!uploadForm.category) {
            toast.error('Selecione uma categoria para o documento');
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('category', uploadForm.category);
            formData.append('description', uploadForm.description);

            const response = await fetch(`/api/customers/${customerId}/documents`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                toast.success('Documento enviado com sucesso');
                setDocuments(prev => [result.document, ...prev]);
                setIsUploadDialogOpen(false);
                setUploadForm({ category: '' as DocumentCategory, description: '' });
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            } else {
                toast.error(result.error || 'Erro ao enviar documento');
            }
        } catch (error) {
            console.error('Error uploading document:', error);
            toast.error('Erro ao enviar documento');
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (doc: Document) => {
        try {
            const response = await fetch(`/api/customers/${customerId}/documents/${doc.id}`);
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = doc.originalName;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                toast.success('Download iniciado');
            } else {
                toast.error('Erro ao baixar documento');
            }
        } catch (error) {
            console.error('Error downloading document:', error);
            toast.error('Erro ao baixar documento');
        }
    };

    const handleEdit = (doc: Document) => {
        setEditingDocument(doc);
        setEditForm({
            name: doc.name,
            description: doc.description || '',
            category: doc.category
        });
    };

    const handleSaveEdit = async () => {
        if (!editingDocument) return;

        try {
            const response = await fetch(`/api/customers/${customerId}/documents/${editingDocument.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editForm)
            });

            const result = await response.json();

            if (result.success) {
                toast.success('Documento atualizado com sucesso');
                setDocuments(prev =>
                    prev.map(doc =>
                        doc.id === editingDocument.id ? result.document : doc
                    )
                );
                setEditingDocument(null);
            } else {
                toast.error(result.error || 'Erro ao atualizar documento');
            }
        } catch (error) {
            console.error('Error updating document:', error);
            toast.error('Erro ao atualizar documento');
        }
    };

    const handleDelete = async (doc: Document) => {
        if (!confirm('Tem certeza que deseja excluir este documento?')) return;

        try {
            const response = await fetch(`/api/customers/${customerId}/documents/${doc.id}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.success) {
                toast.success('Documento excluído com sucesso');
                setDocuments(prev => prev.filter(d => d.id !== doc.id));
            } else {
                toast.error(result.error || 'Erro ao excluir documento');
            }
        } catch (error) {
            console.error('Error deleting document:', error);
            toast.error('Erro ao excluir documento');
        }
    };

    // Filter documents based on search and category
    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesCategory = selectedCategory === 'ALL' || doc.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    // Group documents by category
    const groupedDocuments = filteredDocuments.reduce((acc, doc) => {
        if (!acc[doc.category]) {
            acc[doc.category] = [];
        }
        acc[doc.category].push(doc);
        return acc;
    }, {} as Record<DocumentCategory, Document[]>);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Arquivos</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-48">
                        <p className="text-muted-foreground">Carregando documentos...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Arquivos</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Gerencie documentos e arquivos do cliente
                        </p>
                    </div>
                    <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Enviar Arquivo
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Enviar Novo Documento</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="category">Categoria *</Label>
                                    <Select
                                        value={uploadForm.category}
                                        onValueChange={(value) =>
                                            setUploadForm(prev => ({ ...prev, category: value as DocumentCategory }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione uma categoria" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(categoryLabels).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="description">Descrição</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Descrição opcional do documento"
                                        value={uploadForm.description}
                                        onChange={(e) =>
                                            setUploadForm(prev => ({ ...prev, description: e.target.value }))
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="file">Arquivo *</Label>
                                    <Input
                                        id="file"
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                                        disabled={uploading}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Formatos aceitos: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF (máx. 10MB)
                                    </p>
                                </div>
                                {uploading && (
                                    <div className="flex items-center justify-center py-4">
                                        <p className="text-sm text-muted-foreground">Enviando arquivo...</p>
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar documentos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <div className="sm:w-48">
                        <Select
                            value={selectedCategory}
                            onValueChange={(value) => setSelectedCategory(value as DocumentCategory | 'ALL')}
                        >
                            <SelectTrigger>
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Todas as categorias</SelectItem>
                                {Object.entries(categoryLabels).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Documents List */}
                {filteredDocuments.length === 0 ? (
                    <div className="text-center py-12">
                        <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">
                            {documents.length === 0 ? 'Nenhum documento encontrado' : 'Nenhum documento corresponde aos filtros'}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            {documents.length === 0
                                ? 'Comece enviando o primeiro documento do cliente'
                                : 'Tente ajustar os filtros de busca'
                            }
                        </p>
                        {documents.length === 0 && (
                            <Button onClick={() => setIsUploadDialogOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Enviar Primeiro Documento
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(groupedDocuments).map(([category, docs]) => (
                            <div key={category}>
                                <div className="flex items-center gap-2 mb-3">
                                    <Badge className={categoryColors[category as DocumentCategory]}>
                                        {categoryLabels[category as DocumentCategory]}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        {docs.length} {docs.length === 1 ? 'documento' : 'documentos'}
                                    </span>
                                </div>
                                <div className="grid gap-3">
                                    {docs.map((document) => (
                                        <div
                                            key={document.id}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                {getFileIcon(document.mimeType)}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium truncate">
                                                        {document.name}
                                                    </h4>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <span>{formatFileSize(document.size)}</span>
                                                        <span>•</span>
                                                        <span>
                                                            {new Date(document.createdAt).toLocaleDateString('pt-BR')}
                                                        </span>
                                                        {document.user && (
                                                            <>
                                                                <span>•</span>
                                                                <span>por {document.user.name}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    {document.description && (
                                                        <p className="text-sm text-muted-foreground mt-1 truncate">
                                                            {document.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDownload(document)}
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="outline" size="sm">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEdit(document)}>
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Editar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(document)}
                                                            className="text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Excluir
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Edit Document Dialog */}
                <Dialog open={!!editingDocument} onOpenChange={() => setEditingDocument(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Editar Documento</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="edit-name">Nome</Label>
                                <Input
                                    id="edit-name"
                                    value={editForm.name}
                                    onChange={(e) =>
                                        setEditForm(prev => ({ ...prev, name: e.target.value }))
                                    }
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-category">Categoria</Label>
                                <Select
                                    value={editForm.category}
                                    onValueChange={(value) =>
                                        setEditForm(prev => ({ ...prev, category: value as DocumentCategory }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(categoryLabels).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="edit-description">Descrição</Label>
                                <Textarea
                                    id="edit-description"
                                    value={editForm.description}
                                    onChange={(e) =>
                                        setEditForm(prev => ({ ...prev, description: e.target.value }))
                                    }
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setEditingDocument(null)}>
                                    Cancelar
                                </Button>
                                <Button onClick={handleSaveEdit}>
                                    Salvar
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}