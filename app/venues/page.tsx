export default function VenuesPage() {
  const venues = [
    {
      name: "District 1 Arena",
      location: "Ho Chi Minh City",
      fields: "12",
      description: "Central indoor venue",
    },
    {
      name: "Riverside Courts",
      location: "Thu Duc",
      fields: "8",
      description: "Outdoor multi-sport complex",
    },
    {
      name: "North Hub",
      location: "Go Vap",
      fields: "6",
      description: "Evening peak location",
    },
  ];

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-muted">Locations</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">
          Venues
        </h1>
        <p className="mt-2 text-sm text-muted">
          Manage venue names, locations, descriptions, and linked fields.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-muted-surface text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Venue</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Fields</th>
              <th className="px-4 py-3">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {venues.map((venue) => (
              <tr key={venue.name}>
                <td className="px-4 py-3">{venue.name}</td>
                <td className="px-4 py-3">{venue.location}</td>
                <td className="px-4 py-3">{venue.fields}</td>
                <td className="px-4 py-3">{venue.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
