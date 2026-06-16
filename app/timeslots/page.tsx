export default function TimeslotsPage() {
  const timeslots = [
    { startTime: "06:00", endTime: "07:00", duration: "60 min" },
    { startTime: "18:00", endTime: "19:00", duration: "60 min" },
    { startTime: "21:00", endTime: "22:00", duration: "60 min" },
  ];

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-muted">Scheduling</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">
          Timeslots
        </h1>
        <p className="mt-2 text-sm text-muted">
          Define reusable time ranges for booking availability.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-muted-surface text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Start</th>
              <th className="px-4 py-3">End</th>
              <th className="px-4 py-3">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {timeslots.map((slot) => (
              <tr key={`${slot.startTime}-${slot.endTime}`}>
                <td className="px-4 py-3">{slot.startTime}</td>
                <td className="px-4 py-3">{slot.endTime}</td>
                <td className="px-4 py-3">{slot.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
