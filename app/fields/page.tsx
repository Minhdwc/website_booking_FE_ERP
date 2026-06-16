import { StatusBadge } from '@/components/ui/status-badge';

export default function FieldsPage() {
  const fields = [
    {
      name: 'A1 Turf',
      sport: 'Football',
      venue: 'District 1 Arena',
      price: '320,000 VND',
      status: <StatusBadge tone="success">Active</StatusBadge>,
    },
    {
      name: 'Court 3',
      sport: 'Tennis',
      venue: 'Riverside Courts',
      price: '260,000 VND',
      status: <StatusBadge tone="warning">Maintenance</StatusBadge>,
    },
    {
      name: 'B2 Indoor',
      sport: 'Badminton',
      venue: 'North Hub',
      price: '180,000 VND',
      status: <StatusBadge>Inactive</StatusBadge>,
    },
  ];

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-muted">Inventory</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Fields</h1>
        <p className="mt-2 text-sm text-muted">
          Track field pricing, sport mapping, venue assignment, and status.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
          <p className="text-sm text-muted">Fields</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">36</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
          <p className="text-sm text-muted">Active</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">31</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
          <p className="text-sm text-muted">Avg price</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">280K</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-muted-surface text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Field</th>
              <th className="px-4 py-3">Sport</th>
              <th className="px-4 py-3">Venue</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {fields.map((field) => (
              <tr key={field.name}>
                <td className="px-4 py-3">{field.name}</td>
                <td className="px-4 py-3">{field.sport}</td>
                <td className="px-4 py-3">{field.venue}</td>
                <td className="px-4 py-3">{field.price}</td>
                <td className="px-4 py-3">{field.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
