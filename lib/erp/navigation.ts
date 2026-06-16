export type ErpModule = {
  label: string;
  href: string;
  description: string;
};

export const erpModules: ErpModule[] = [
  {
    label: "Dashboard",
    href: "/",
    description: "Booking, revenue, field status, and review signals.",
  },
  {
    label: "Bookings",
    href: "/bookings",
    description: "Daily field schedule, confirmations, and cancellations.",
  },
  {
    label: "Fields",
    href: "/fields",
    description: "Sports fields, prices, venues, sports, and availability.",
  },
  {
    label: "Payments",
    href: "/payments",
    description: "Payment status, methods, revenue, and reconciliation.",
  },
  {
    label: "Customers",
    href: "/customers",
    description: "User profiles, booking history, payments, and reviews.",
  },
  {
    label: "Feedback",
    href: "/feedback",
    description: "Field reviews, service quality, and low rating follow-up.",
  },
  {
    label: "Notifications",
    href: "/notifications",
    description: "User messages, read state, and booking alerts.",
  },
  {
    label: "Catalog",
    href: "/catalog",
    description: "Sports, venues, and timeslot master data.",
  },
  {
    label: "Team",
    href: "/team",
    description: "Admin and staff accounts, roles, and active status.",
  },
];
