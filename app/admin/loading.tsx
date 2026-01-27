import { LoadingSpinner } from '@/components/shared/loading-spinner';

// ============================================================================
// T192: ADMIN LOADING STATE (Phase 9 - Performance Optimization)
// ============================================================================

export default function AdminLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingSpinner size="lg" label="Loading admin dashboard..." />
    </div>
  );
}
