export default function SportsPage() {
  const sports = [
    { name: 'Football', fields: '14', bookings: '126', createdAt: '2026-03-12' },
    { name: 'Tennis', fields: '9', bookings: '84', createdAt: '2026-03-14' },
    { name: 'Badminton', fields: '13', bookings: '98', createdAt: '2026-03-18' },
  ];

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-muted">Catalog</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Sports</h1>
        <p className="mt-2 text-sm text-muted">
          Maintain sport categories used by fields, filters, and reporting.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-muted-surface text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Sport</th>
              <th className="px-4 py-3">Fields</th>
              <th className="px-4 py-3">Bookings</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sports.map((sport) => (
              <tr key={sport.name}>
                <td className="px-4 py-3">{sport.name}</td>
                <td className="px-4 py-3">{sport.fields}</td>
                <td className="px-4 py-3">{sport.bookings}</td>
                <td className="px-4 py-3">{sport.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
