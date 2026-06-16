import { StatusBadge } from "@/components/ui/status-badge";

export default function NotificationsPage() {
  const notifications = [
    {
      title: "Booking confirmed",
      user: "Le Thu Ha",
      message: "A1 Turf at 18:00 is confirmed.",
      createdAt: "2026-05-26",
      status: <StatusBadge tone="success">Read</StatusBadge>,
    },
    {
      title: "Payment pending",
      user: "Pham Quang",
      message: "Please complete payment for BK-1025.",
      createdAt: "2026-05-26",
      status: <StatusBadge tone="warning">Unread</StatusBadge>,
    },
    {
      title: "Schedule changed",
      user: "Vo My Linh",
      message: "Your timeslot was updated.",
      createdAt: "2026-05-25",
      status: <StatusBadge tone="warning">Unread</StatusBadge>,
    },
  ];

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-muted">Messaging</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">
          Notifications
        </h1>
        <p className="mt-2 text-sm text-muted">
          Audit user messages, booking alerts, and read state.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-muted-surface text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">State</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {notifications.map((notification) => (
              <tr key={`${notification.title}-${notification.user}`}>
                <td className="px-4 py-3">{notification.title}</td>
                <td className="px-4 py-3">{notification.user}</td>
                <td className="px-4 py-3">{notification.message}</td>
                <td className="px-4 py-3">{notification.createdAt}</td>
                <td className="px-4 py-3">{notification.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
