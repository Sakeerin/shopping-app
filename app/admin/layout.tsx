import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

// ============================================================================
// T158: ADMIN LAYOUT WITH MIDDLEWARE (Phase 7 - User Story 6)
// ============================================================================

export const metadata = {
  title: 'Admin Dashboard | Shopping App',
  description: 'Admin dashboard for managing products, orders, and customers',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication and authorization
  const session = await getServerSession();

  if (!session || !session.user) {
    redirect('/auth/login?callbackUrl=/admin');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="container mx-auto p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
