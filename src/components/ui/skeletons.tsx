export function ChatSkeleton() {
    return (
        <div className="flex flex-col h-[600px] bg-white border border-slate-200 rounded-3xl overflow-hidden animate-pulse">
            <div className="bg-white border-b border-slate-100 p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-200 rounded-2xl" />
                <div className="space-y-2">
                    <div className="w-32 h-4 bg-slate-200 rounded" />
                    <div className="w-20 h-2 bg-slate-100 rounded" />
                </div>
            </div>
            <div className="flex-1 p-6 space-y-4 bg-slate-50">
                <div className="flex justify-start">
                    <div className="w-2/3 h-16 bg-white rounded-2xl rounded-tl-none border border-slate-100" />
                </div>
                <div className="flex justify-end">
                    <div className="w-1/2 h-12 bg-slate-200 rounded-2xl rounded-tr-none" />
                </div>
                <div className="flex justify-start">
                    <div className="w-3/4 h-20 bg-white rounded-2xl rounded-tl-none border border-slate-100" />
                </div>
            </div>
            <div className="p-4 bg-white border-t border-slate-100 flex gap-3">
                <div className="flex-1 h-12 bg-slate-50 rounded-2xl" />
                <div className="w-12 h-12 bg-slate-200 rounded-2xl" />
            </div>
        </div>
    );
}

export function NotificationSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4 p-5 bg-white rounded-[2rem] border border-slate-100">
                    <div className="w-14 h-14 bg-slate-100 rounded-[1.25rem] shrink-0" />
                    <div className="flex-1 space-y-3">
                        <div className="flex justify-between">
                            <div className="w-40 h-5 bg-slate-200 rounded" />
                            <div className="w-12 h-4 bg-slate-100 rounded" />
                        </div>
                        <div className="w-full h-4 bg-slate-50 rounded" />
                        <div className="w-2/3 h-4 bg-slate-50 rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function SpecialistSkeleton() {
    return (
        <div className="bg-white rounded-[2rem] p-4 sm:p-6 border border-slate-100 shadow-sm animate-pulse">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="flex flex-row sm:flex-col items-center gap-4 sm:gap-3">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 bg-slate-100 rounded-2xl sm:rounded-3xl" />
                    <div className="w-16 h-3 bg-slate-50 rounded hidden sm:block" />
                </div>
                <div className="flex-1 space-y-3 sm:space-y-4">
                    <div className="space-y-2">
                        <div className="w-2/3 h-5 sm:h-6 bg-slate-200 rounded" />
                        <div className="w-24 h-3 sm:h-4 bg-slate-100 rounded" />
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                        <div className="w-full h-3 bg-slate-50 rounded" />
                        <div className="w-5/6 h-3 bg-slate-50 rounded" />
                    </div>
                    <div className="flex gap-2 sm:gap-3 pt-2">
                        <div className="flex-1 h-10 bg-slate-100 rounded-xl" />
                        <div className="flex-1 h-10 bg-slate-100 rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    )
}
