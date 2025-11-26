import Sidebar from "@/components/Sidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
            <Sidebar />
            <div className="flex-1 h-full overflow-y-auto p-8">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}
