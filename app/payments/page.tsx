import { StatusBadge } from '@/components/ui/status-badge';

export default function PaymentsPage() {
  const payments = [
    {
      booking: 'BK-1024',
      amount: '320,000 VND',
      method: 'bank_transfer',
      createdAt: '2026-05-26',
      status: <StatusBadge tone="success">Completed</StatusBadge>,
    },
    {
      booking: 'BK-1025',
      amount: '260,000 VND',
      method: 'cash',
      createdAt: '2026-05-26',
      status: <StatusBadge tone="warning">Pending</StatusBadge>,
    },
    {
      booking: 'BK-1026',
      amount: '180,000 VND',
      method: 'credit_card',
      createdAt: '2026-05-26',
      status: <StatusBadge tone="danger">Failed</StatusBadge>,
    },
  ];

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-muted">Finance</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Payments</h1>
        <p className="mt-2 text-sm text-muted">
          Monitor booking payments, methods, amounts, and reconciliation state.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
          <p className="text-sm text-muted">Revenue</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">12.8M</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
          <p className="text-sm text-muted">Pending</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">6</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
          <p className="text-sm text-muted">Failed</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">2</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-muted-surface text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Booking</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {payments.map((payment) => (
              <tr key={payment.booking}>
                <td className="px-4 py-3">{payment.booking}</td>
                <td className="px-4 py-3">{payment.amount}</td>
                <td className="px-4 py-3">{payment.method}</td>
                <td className="px-4 py-3">{payment.createdAt}</td>
                <td className="px-4 py-3">{payment.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
