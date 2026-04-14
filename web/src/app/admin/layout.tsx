import AdminSubNav from './AdminSubNav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col">
            <AdminSubNav />
            <div className="flex-1">{children}</div>
        </div>
    );
}
