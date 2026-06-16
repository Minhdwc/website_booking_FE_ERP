import { StatusBadge } from "@/components/ui/status-badge";

export default function UsersPage() {
  const users = [
    {
      name: "Nguyen Minh Anh",
      email: "anh@example.com",
      phone: "0901 234 567",
      role: "admin",
      status: <StatusBadge tone="success">Active</StatusBadge>,
    },
    {
      name: "Tran Bao Long",
      email: "long@example.com",
      phone: "0912 345 678",
      role: "staff",
      status: <StatusBadge tone="success">Active</StatusBadge>,
    },
    {
      name: "Le Thu Ha",
      email: "ha@example.com",
      phone: "0933 456 789",
      role: "user",
      status: <StatusBadge>Inactive</StatusBadge>,
    },
  ];

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-muted">People</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Users</h1>
        <p className="mt-2 text-sm text-muted">
          Manage admin, staff, and customer accounts.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
          <p className="text-sm text-muted">Total users</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">248</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
          <p className="text-sm text-muted">Staff</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">18</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
          <p className="text-sm text-muted">Inactive</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">7</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-muted-surface text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.email}>
                <td className="px-4 py-3">{user.name}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">{user.phone}</td>
                <td className="px-4 py-3">{user.role}</td>
                <td className="px-4 py-3">{user.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
