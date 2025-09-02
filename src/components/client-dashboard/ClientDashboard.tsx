'use client'

import React, { useState, useEffect } from 'react';
import { ActionButtons } from "./ActionButtons";
import { ClientTabs } from "./ClientTabs";
import { ProfileSection } from "./ProfileSection";
import { EngagementDashboard } from "./EngagementDashboard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";
import { ErrorBoundary } from "@/components/error-boundary/ErrorBoundary";
import { OfflineBanner } from "@/components/ui/offline-banner";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import {
    ProfileSkeleton,
    ActionButtonsSkeleton,
    EngagementDashboardSkeleton
} from "@/components/ui/skeleton-loading";

interface Customer {
    id: string;
    name: string;
    personType: string | null;
    cnpjCpf: string | null;
    email: string | null;
    socialName: string | null;
    birthDate: string | null;
    gender: string | null;
    maritalStatus: string | null;
    business: string | null;
    revenue: string | null;
    website: string | null;
    income: string | null;
    source: string | null;
    avatarUrl: string | null;
    status: string | null;
    createdAt: Date;
    updatedAt: Date;
}

interface Phone {
    id: string;
    type: string;
    number: string;
    contact: string | null;
}

interface Address {
    id: string;
    type: string | null;
    street: string | null;
    number: string | null;
    complement: string | null;
    district: string | null;
    city: string | null;
    state: string | null;
    zipCode: string | null;
}

interface Contact {
    id: string;
    type: string | null;
    name: string;
    birthDate: string | null;
    gender: string | null;
    email: string | null;
    phone: string | null;
    cellPhone: string | null;
    position: string | null;
}

interface Activity {
    id: string;
    type: string;
    title: string;
    description: string | null;
    date: Date;
    user: {
        id: string;
        name: string;
    } | null;
}

interface Policy {
    id: string;
    document: string;
    proposalNumber: string;
    proposalDate: string;
    situationDocument: string;
    policyNumber: string | null;
    issueDate: string | null;
    renewal: string;
    tipoRenewal: string;
    previousPolicy: string | null;
    previousInsuranceCompany: string | null;
    source: string | null;
    paymentMethod: string | null;
    liquidPrize: number | null;
    totalPrize: number | null;
    iof: number | null;
    commissionValue: number | null;
    product: {
        id: string;
        name: string;
        code: string;
    };
    insuranceCompany: {
        id: string;
        name: string;
        susep: string | null;
    };
}

interface Opportunity {
    id: string;
    name: string;
    stage: string;
    value: number;
    product: {
        id: string;
        name: string;
        code: string;
    } | null;
    user: {
        id: string;
        name: string;
    } | null;
}

interface Claim {
    id: string;
    claimNumber: string;
    title: string;
    description: string;
    incidentDate: Date;
    reportedDate: Date;
    status: string;
    priority: string;
    claimType: string;
    estimatedValue: number | null;
    approvedValue: number | null;
    deductible: number | null;
    location: string | null;
    witnesses: string | null;
    policeReport: string | null;
    closedAt: Date | null;
    closedReason: string | null;
    policy: {
        id: string;
        policyNumber: string | null;
        product: {
            id: string;
            name: string;
            code: string;
        };
        insuranceCompany: {
            id: string;
            name: string;
            susep: string | null;
        };
    } | null;
    assignedUser: {
        id: string;
        name: string;
        email: string | null;
        avatarUrl: string | null;
    } | null;
}

interface ClientDashboardProps {
    initialCustomer: Customer;
    policies: Policy[];
    opportunities: Opportunity[];
    phones: Phone[];
    addresses: Address[];
    contacts: Contact[];
    activities: Activity[];
    claims: Claim[];
    isNewlyCreated?: boolean;
}

export function ClientDashboard({
    initialCustomer,
    policies,
    opportunities,
    phones,
    addresses,
    contacts,
    activities,
    claims,
    isNewlyCreated = false
}: ClientDashboardProps) {
    const [customer, setCustomer] = useState<Customer>(initialCustomer);
    const [showSuccessMessage, setShowSuccessMessage] = useState(isNewlyCreated);
    const [isLoading, setIsLoading] = useState(false);

    const { error, isError, handleError, clearError, retry } = useErrorHandler({
        maxRetries: 3,
        showToast: true,
    });

    const handleCustomerUpdate = async (updatedCustomer: Customer) => {
        try {
            setIsLoading(true);
            setCustomer(updatedCustomer);
            clearError();
        } catch (error) {
            handleError(error as Error);
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-hide success message after 5 seconds
    useEffect(() => {
        if (showSuccessMessage) {
            const timer = setTimeout(() => {
                setShowSuccessMessage(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [showSuccessMessage]);

    const handleRetryDashboard = () => {
        retry(() => {
            window.location.reload();
        });
    };

    return (
        <div className="space-y-6">
            {/* Offline Status Banner */}
            <OfflineBanner />

            {/* Success Message for Newly Created Clients */}
            {showSuccessMessage && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="font-medium">
                        Cliente cadastrado com sucesso! Bem-vindo ao dashboard do cliente {customer.name}.
                    </AlertDescription>
                </Alert>
            )}

            {/* Profile Section */}
            <ErrorBoundary
                fallback={<ProfileSkeleton />}
                onError={handleError}
            >
                {isLoading ? (
                    <ProfileSkeleton />
                ) : (
                    <ProfileSection
                        customer={customer}
                        phones={phones}
                        onCustomerUpdate={handleCustomerUpdate}
                    />
                )}
            </ErrorBoundary>

            {/* Action Buttons */}
            <ErrorBoundary
                fallback={<ActionButtonsSkeleton />}
                onError={handleError}
            >
                <div className="bg-card rounded-lg border p-6">
                    <ActionButtons
                        customerId={customer.id}
                        customerName={customer.name}
                        customerPhone={phones.length > 0 ? phones[0].number : undefined}
                    />
                </div>
            </ErrorBoundary>

            {/* Engagement Metrics Dashboard */}
            <ErrorBoundary
                fallback={<EngagementDashboardSkeleton />}
                onError={handleError}
            >
                <EngagementDashboard
                    policies={policies}
                    opportunities={opportunities}
                    activities={activities}
                />
            </ErrorBoundary>

            {/* Enhanced Tabs Section */}
            <ErrorBoundary onError={handleError}>
                <ClientTabs
                    customerId={customer.id}
                    customerName={customer.name}
                    policies={policies}
                    opportunities={opportunities}
                    phones={phones}
                    addresses={addresses}
                    contacts={contacts}
                    activities={activities}
                    claims={claims}
                />
            </ErrorBoundary>
        </div>
    );
}