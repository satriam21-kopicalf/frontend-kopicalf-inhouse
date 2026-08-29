'use client';

import PagePlaceholder from '@/components/PagePlaceholder';

export default function StaffPage() {
  return (
    <PagePlaceholder
      title="Staff"
      subtitle="Manage baristas, PICs, and outlet personnel"
      breadcrumbs={['Data', 'Master', 'Staff']}
      description="Staff management for all outlets — roles, assigned branches, contact information, and shift assignments."
    />
  );
}
