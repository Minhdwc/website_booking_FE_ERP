import { StatusBadge } from "@/components/ui/status-badge";

export default function ReviewsPage() {
  const reviews = [
    {
      user: "Le Thu Ha",
      field: "A1 Turf",
      rating: "5/5",
      comment: "Clean field and quick check-in",
      status: <StatusBadge tone="success">Positive</StatusBadge>,
    },
    {
      user: "Dang Khoa",
      field: "Court 3",
      rating: "3/5",
      comment: "Lighting was uneven",
      status: <StatusBadge tone="warning">Follow up</StatusBadge>,
    },
    {
      user: "Vo My Linh",
      field: "B2 Indoor",
      rating: "2/5",
      comment: "Late start time",
      status: <StatusBadge tone="danger">Priority</StatusBadge>,
    },
  ];

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-muted">Quality</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">
          Reviews
        </h1>
        <p className="mt-2 text-sm text-muted">
          Inspect field ratings and customer comments for service follow-up.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-muted-surface text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Field</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Comment</th>
              <th className="px-4 py-3">Signal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {reviews.map((review) => (
              <tr key={`${review.user}-${review.field}`}>
                <td className="px-4 py-3">{review.user}</td>
                <td className="px-4 py-3">{review.field}</td>
                <td className="px-4 py-3">{review.rating}</td>
                <td className="px-4 py-3">{review.comment}</td>
                <td className="px-4 py-3">{review.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
