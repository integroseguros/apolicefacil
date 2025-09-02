
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ClientDashboard } from "@/components/client-dashboard/ClientDashboard";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/error-boundary/ErrorBoundary";
import { ProfileSkeleton, ActionButtonsSkeleton, EngagementDashboardSkeleton } from "@/components/ui/skeleton-loading";

async function getCustomer(id: string) {
    try {
        const customer = await prisma.customer.findUnique({
            where: { id },
            include: {
                policy: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                code: true
                            }
                        },
                        branch: {
                            select: {
                                id: true,
                                name: true,
                                code: true
                            }
                        },
                        insurancecompany: {
                            select: {
                                id: true,
                                name: true,
                                susep: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                opportunity: {
                    include: {
                        user: true,
                        product: true
                    }
                },
                phone: true,
                address: true,
                contact: true,
                activity: {
                    include: {
                        user: true
                    },
                    orderBy: {
                        date: 'desc'
                    }
                },
                claim: {
                    include: {
                        policy: {
                            include: {
                                product: true,
                                insurancecompany: true
                            }
                        },
                        user_claim_assignedToTouser: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                avatarUrl: true
                            }
                        }
                    },
                    orderBy: {
                        reportedDate: 'desc'
                    }
                }
            }
        });
        return customer;
    } catch (error) {
        console.error('Error fetching customer:', error);
        return null;
    }
}

export default async function CustomerDetailPage({
    params,
    searchParams
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const { id } = await params;
    const search = await searchParams;
    const isNewlyCreated = search.created === 'true';
    const customer = await getCustomer(id);

    if (!customer) {
        notFound();
    }

    // Transform data for dashboard
    const transformedPhones = customer.phone?.map(phone => ({
        id: phone.id,
        type: phone.type,
        number: phone.number,
        contact: phone.contact
    })) || [];

    const transformedAddresses = customer.address || [];
    const transformedContacts = customer.contact || [];
    const transformedActivities = customer.activity?.map(activity => ({
        id: activity.id,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        date: activity.date,
        user: activity.user ? {
            id: activity.user.id,
            name: activity.user.name,
        } : null,
    })) || [];

    const transformedPolicies = customer.policy?.map(policy => {
        return {
            id: policy.id,
            document: policy.document,
            proposalNumber: policy.proposalNumber,
            proposalDate: policy.startDate ? policy.startDate.toISOString().split('T')[0] : '',
            situationDocument: policy.situationDocument,
            policyNumber: policy.policyNumber,
            issueDate: policy.issueDate ? policy.issueDate.toISOString().split('T')[0] : null,
            renewal: policy.renewal,
            tipoRenewal: policy.tipoRenewal,
            previousPolicy: policy.previousPolicy,
            previousInsuranceCompany: policy.previousInsuranceCompany,
            source: policy.source,
            paymentMethod: policy.formaPagamento, // Corrigir nome do campo
            liquidPrize: policy.liquidPrize ? Number(policy.liquidPrize) : null,
            totalPrize: policy.totalPrize ? Number(policy.totalPrize) : null,
            iof: policy.iof ? Number(policy.iof) : null,
            commissionValue: policy.commissionValue ? Number(policy.commissionValue) : null,
            product: policy.product ? {
                id: policy.product.id,
                name: policy.product.name || 'N/A',
                code: policy.product.code || 'N/A',
            } : {
                id: '',
                name: 'N/A',
                code: 'N/A',
            },
            branch: policy.branch ? {
                id: policy.branch.id,
                name: policy.branch.name,
                code: policy.branch.code,
            } : null,
            insuranceCompany: policy.insurancecompany ? {
                id: policy.insurancecompany.id,
                name: policy.insurancecompany.name,
                susep: policy.insurancecompany.susep,
            } : {
                id: '',
                name: 'N/A',
                susep: null,
            },
        };
    }) || [];

    console.log('Transformed policies:', transformedPolicies);

    const transformedOpportunities = customer.opportunity?.map(opportunity => ({
        id: opportunity.id,
        name: opportunity.name,
        stage: opportunity.stage,
        value: opportunity.value,
        product: opportunity.product ? {
            id: opportunity.product.id,
            name: opportunity.product.name || 'N/A',
            code: opportunity.product.code || 'N/A',
        } : null,
        user: opportunity.user ? {
            id: opportunity.user.id,
            name: opportunity.user.name,
        } : null,
    })) || [];
    const transformedClaims = customer.claim?.map(claim => ({
        id: claim.id,
        claimNumber: claim.claimNumber,
        title: claim.title,
        description: claim.description,
        incidentDate: claim.incidentDate,
        reportedDate: claim.reportedDate,
        status: claim.status,
        priority: claim.priority,
        claimType: claim.claimType,
        estimatedValue: claim.estimatedValue ? Number(claim.estimatedValue) : null,
        approvedValue: claim.approvedValue ? Number(claim.approvedValue) : null,
        deductible: claim.deductible ? Number(claim.deductible) : null,
        location: claim.location,
        witnesses: claim.witnesses,
        policeReport: claim.policeReport,
        closedAt: claim.closedAt,
        closedReason: claim.closedReason,
        policy: claim.policy ? {
            id: claim.policy.id,
            policyNumber: claim.policy.policyNumber,
            product: {
                id: claim.policy.product.id,
                name: claim.policy.product.name || 'N/A',
                code: claim.policy.product.code || 'N/A',
            },
            insuranceCompany: {
                id: claim.policy.insurancecompany.id,
                name: claim.policy.insurancecompany.name,
                susep: claim.policy.insurancecompany.susep,
            },
        } : null,
        assignedUser: claim.user_claim_assignedToTouser ? {
            id: claim.user_claim_assignedToTouser.id,
            name: claim.user_claim_assignedToTouser.name,
            email: claim.user_claim_assignedToTouser.email,
            avatarUrl: claim.user_claim_assignedToTouser.avatarUrl,
        } : null,
    })) || [];

    // Transform customer data to match interface
    const transformedCustomer = {
        id: customer.id,
        name: customer.name,
        personType: customer.personType,
        cnpjCpf: customer.cnpjCpf,
        email: customer.email,
        socialName: customer.socialName,
        birthDate: customer.birthDate,
        gender: customer.gender,
        maritalStatus: customer.maritalStatus,
        business: customer.business,
        revenue: customer.revenue,
        website: customer.website,
        income: customer.income,
        source: customer.source,
        avatarUrl: customer.avatarUrl,
        status: customer.status,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
    };

    const DashboardSkeleton = () => (
        <div className="space-y-6">
            <ProfileSkeleton />
            <ActionButtonsSkeleton />
            <EngagementDashboardSkeleton />
            <div className="bg-card rounded-lg border p-6">
                <div className="h-96 flex items-center justify-center">
                    <div className="text-center space-y-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="text-sm text-muted-foreground">Carregando dashboard do cliente...</p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <ErrorBoundary>
            <Suspense fallback={<DashboardSkeleton />}>
                <ClientDashboard
                    initialCustomer={transformedCustomer}
                    policies={transformedPolicies}
                    opportunities={transformedOpportunities}
                    phones={transformedPhones}
                    addresses={transformedAddresses}
                    contacts={transformedContacts}
                    activities={transformedActivities}
                    claims={transformedClaims}
                    isNewlyCreated={isNewlyCreated}
                />
            </Suspense>
        </ErrorBoundary>
    );
}
