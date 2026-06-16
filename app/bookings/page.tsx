import { StatusBadge } from "@/components/ui/status-badge";

export default function BookingsPage() {
  const bookings = [
    {
      user: "Le Thu Ha",
      field: "A1 Turf",
      date: "2026-05-26",
      timeslot: "18:00-19:00",
      status: <StatusBadge tone="success">Confirmed</StatusBadge>,
    },
    {
      user: "Pham Quang",
      field: "Court 3",
      date: "2026-05-26",
      timeslot: "19:00-20:00",
      status: <StatusBadge tone="warning">Pending</StatusBadge>,
    },
    {
      user: "Vo My Linh",
      field: "B2 Indoor",
      date: "2026-05-27",
      timeslot: "07:00-08:00",
      status: <StatusBadge tone="danger">Cancelled</StatusBadge>,
    },
  ];

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-muted">Operations</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">
          Bookings
        </h1>
        <p className="mt-2 text-sm text-muted">
          Review reservations by customer, field, date, timeslot, and status.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
          <p className="text-sm text-muted">Today</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">42</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
          <p className="text-sm text-muted">Pending</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">9</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
          <p className="text-sm text-muted">Cancelled</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">3</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-muted-surface text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Field</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Timeslot</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {bookings.map((booking) => (
              <tr key={`${booking.user}-${booking.date}`}>
                <td className="px-4 py-3">{booking.user}</td>
                <td className="px-4 py-3">{booking.field}</td>
                <td className="px-4 py-3">{booking.date}</td>
                <td className="px-4 py-3">{booking.timeslot}</td>
                <td className="px-4 py-3">{booking.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
