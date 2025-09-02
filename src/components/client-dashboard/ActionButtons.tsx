'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Phone, MessageCircle } from 'lucide-react';
import { ActivityModal } from './ActivityModal';
import { CallModal } from './CallModal';
import { WhatsAppModal } from './WhatsAppModal';

interface ActionButtonsProps {
    customerId: string;
    customerName: string;
    customerPhone?: string;
    onActivityCreated?: () => void;
}

export function ActionButtons({
    customerId,
    customerName,
    customerPhone,
    onActivityCreated
}: ActionButtonsProps) {
    const [activityModalOpen, setActivityModalOpen] = useState(false);
    const [callModalOpen, setCallModalOpen] = useState(false);
    const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);

    const handleActivitySuccess = () => {
        onActivityCreated?.();
    };

    const handleCallSuccess = () => {
        onActivityCreated?.();
    };

    const handleWhatsAppSuccess = () => {
        onActivityCreated?.();
    };

    return (
        <>
            <div className="flex flex-wrap gap-3">
                <Button
                    size="sm"
                    className="gap-2"
                    onClick={() => setActivityModalOpen(true)}
                >
                    <PlusCircle className="h-4 w-4" />
                    Nova Atividade
                </Button>

                <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => setCallModalOpen(true)}
                >
                    <Phone className="h-4 w-4" />
                    Registrar uma Ligação
                </Button>

                <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => setWhatsappModalOpen(true)}
                >
                    <MessageCircle className="h-4 w-4" />
                    Enviar WhatsApp
                </Button>
            </div>

            <ActivityModal
                open={activityModalOpen}
                onOpenChange={setActivityModalOpen}
                customerId={customerId}
                onSuccess={handleActivitySuccess}
            />

            <CallModal
                open={callModalOpen}
                onOpenChange={setCallModalOpen}
                customerId={customerId}
                customerName={customerName}
                onSuccess={handleCallSuccess}
            />

            <WhatsAppModal
                open={whatsappModalOpen}
                onOpenChange={setWhatsappModalOpen}
                customerId={customerId}
                customerName={customerName}
                customerPhone={customerPhone}
                onSuccess={handleWhatsAppSuccess}
            />
        </>
    );
}