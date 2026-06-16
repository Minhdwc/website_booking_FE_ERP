import { erpModules } from "@/lib/erp/navigation";

export default function DashboardPage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-muted">FieldOps ERP</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">
          Operations workspace
        </h1>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {erpModules.map((module) => (
          <div
            key={module.href}
            className="rounded-lg border border-border bg-surface p-4 shadow-card transition-all duration-200 hover:border-accent/30 hover:shadow-card-hover"
          >
            <p className="text-sm font-semibold text-foreground">
              {module.label}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              {module.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
