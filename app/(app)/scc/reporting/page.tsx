'use client';

import PagePlaceholder from '@/components/PagePlaceholder';

export default function SccReportingPage() {
  return (
    <PagePlaceholder
      title="Reporting"
      subtitle="COGS Ratio, Usage Ratio, and Shopping Estimation reports per outlet"
      breadcrumbs={['Supply Chain & Cost Control', 'Reporting']}
      description="Periodic cost control reports: COGS vs target per outlet, usage ratio drill-down per product, and shopping estimation recommendations."
    />
  );
}
