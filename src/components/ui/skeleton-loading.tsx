import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSkeleton() {
    return (
        <div className="bg-card rounded-lg border p-6">
            <div className="flex items-start gap-6">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-40" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
        </div>
    );
}

export function ActionButtonsSkeleton() {
    return (
        <div className="bg-card rounded-lg border p-6">
            <div className="flex gap-3">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-10 w-36" />
            </div>
        </div>
    );
}

export function EngagementDashboardSkeleton() {
    return (
        <div className="bg-card rounded-lg border p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                </div>
                <div className="space-y-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-8 w-16" />
                </div>
                <div className="space-y-3">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-8 w-20" />
                </div>
            </div>
        </div>
    );
}

export function TabContentSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-10 w-24" />
            </div>
            <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-5 w-48" />
                                <Skeleton className="h-4 w-64" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <Skeleton className="h-8 w-20" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-10 w-24" />
            </div>
            <div className="border rounded-lg">
                <div className="border-b p-4">
                    <div className="flex gap-4">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                </div>
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="border-b last:border-b-0 p-4">
                        <div className="flex gap-4">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function ActivityListSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-10 w-36" />
            </div>
            <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="border rounded-lg p-4">
                        <div className="flex gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between">
                                    <Skeleton className="h-5 w-48" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function FormSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <div className="space-y-3">
                <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div>
                    <Skeleton className="h-4 w-28 mb-2" />
                    <Skeleton className="h-24 w-full" />
                </div>
            </div>
            <div className="flex gap-2 pt-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-20" />
            </div>
        </div>
    );
}