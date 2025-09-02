'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, FileText, Image, File, FileArchive } from 'lucide-react';
import { ClaimDocument } from '@/types';

interface ClaimDocumentUploadProps {
    claimId: string;
    onSuccess: (document: ClaimDocument) => void;
}

export default function ClaimDocumentUpload({ claimId, onSuccess }: ClaimDocumentUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);

            // Preencher o nome automaticamente com o nome do arquivo
            if (!name) {
                // Remover extensão do arquivo
                const fileName = selectedFile.name.split('.').slice(0, -1).join('.');
                setName(fileName);
            }
        }
    };

    const getFileIcon = () => {
        if (!file) return <Upload className="h-8 w-8 text-muted-foreground" />;

        const type = file.type;
        if (type.startsWith('image/')) return <Image className="h-8 w-8 text-blue-500" />;
        if (type === 'application/pdf') return <FileText className="h-8 w-8 text-red-500" />;
        if (type.includes('word') || type.includes('document')) return <FileText className="h-8 w-8 text-blue-700" />;
        if (type.includes('excel') || type.includes('spreadsheet')) return <FileText className="h-8 w-8 text-green-700" />;
        if (type.includes('zip') || type.includes('compressed')) return <FileArchive className="h-8 w-8 text-yellow-600" />;

        return <File className="h-8 w-8 text-gray-500" />;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            toast({
                title: 'Erro',
                description: 'Selecione um arquivo para upload',
                variant: 'destructive',
            });
            return;
        }

        if (!name) {
            toast({
                title: 'Erro',
                description: 'Informe um nome para o documento',
                variant: 'destructive',
            });
            return;
        }

        try {
            setIsUploading(true);

            const formData = new FormData();
            formData.append('file', file);
            formData.append('name', name);
            formData.append('description', description);

            const response = await fetch(`/api/claims/${claimId}/documents`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao fazer upload do documento');
            }

            const document = await response.json();

            toast({
                title: 'Sucesso',
                description: 'Documento enviado com sucesso',
            });

            // Limpar formulário
            setFile(null);
            setName('');
            setDescription('');

            // Notificar componente pai
            onSuccess(document);
        } catch (error) {
            console.error('Erro ao fazer upload:', error);
            toast({
                title: 'Erro',
                description: error instanceof Error ? error.message : 'Erro ao fazer upload do documento',
                variant: 'destructive',
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center relative">
                {file ? (
                    <div className="flex flex-col items-center">
                        {getFileIcon()}
                        <p className="mt-2 text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => setFile(null)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium">Arraste um arquivo ou clique para selecionar</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Suporta arquivos de até 10MB
                        </p>
                    </div>
                )}
                <Input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                    disabled={isUploading}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="name">Nome do documento *</Label>
                <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nome do documento"
                    disabled={isUploading}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descrição opcional do documento"
                    disabled={isUploading}
                    rows={3}
                />
            </div>

            <Button type="submit" disabled={isUploading || !file || !name} className="w-full">
                {isUploading ? (
                    <>
                        <span className="animate-spin mr-2">◌</span>
                        Enviando...
                    </>
                ) : (
                    <>
                        <Upload className="h-4 w-4 mr-2" />
                        Enviar Documento
                    </>
                )}
            </Button>
        </form>
    );
}