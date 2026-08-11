import type { DataTableColumn } from '@/lib/data-table/types';
import { formatDate } from '@/lib/format';
import type { ICustomer } from '@/stores/api/types';

export const customerColumns: DataTableColumn<ICustomer>[] = [
  {
    id: 'email',
    header: 'Email',
    sortable: true,
    sortValue: (row) => row.email ?? '',
    cell: (row) => <span className="font-medium">{row.email ?? '—'}</span>,
  },
  {
    id: 'bookingCount',
    header: 'Lượt đặt',
    sortable: true,
    sortValue: (row) => row.bookingCount,
    className: 'text-right',
    cell: (row) => <span className="tabular-nums">{row.bookingCount}</span>,
  },
  {
    id: 'lastBooking',
    header: 'Đặt gần nhất',
    sortable: true,
    sortValue: (row) => row.lastBookingAt,
    className: 'hidden md:table-cell',
    cell: (row) => (
      <span className="tabular-nums text-muted-foreground">{formatDate(row.lastBookingAt)}</span>
    ),
  },
];
