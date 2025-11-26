export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex-1 h-screen overflow-y-auto bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {children}
            </div>
        </div>
    );
}
