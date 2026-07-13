'use client';

import Link from 'next/link';

import { VenuesCreateDialog } from '@/components/features/venues/create-dialog';
import { VenuesSetupPage } from '@/components/features/venues/setup-page';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useVenues, useVenuesOnboarding } from '@/hooks/use-venues';
import { IVenue } from '@/stores/api/types';

const formatRestTime = (restStartTime?: string | null, restEndTime?: string | null) => {
  if (!restStartTime || !restEndTime) return '—';
  return `${restStartTime} – ${restEndTime}`;
};

export const VenuesPage = () => {
  const { venues, isLoading, error } = useVenues();
  const isNotEmpty = venues.length > 0;
  const { startTour } = useVenuesOnboarding({ enabled: !isLoading && !isNotEmpty });

  if (error) {
    return (
      <div className="rounded-lg border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
        {error}
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-heading">Cơ sở</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý cơ sở trước, rồi gắn sân vào.
          </p>
        </div>

        {isNotEmpty ? <VenuesCreateDialog /> : null}
      </header>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : isNotEmpty ? (
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">Tên</TableHead>
                <TableHead className="px-4">Địa chỉ</TableHead>
                <TableHead className="px-4">Tọa độ</TableHead>
                <TableHead className="px-4">Giờ hoạt động</TableHead>
                <TableHead className="px-4">Giờ nghỉ</TableHead>
                <TableHead className="px-4 text-right">Sân</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {venues.map((venue: IVenue) => (
                <TableRow key={venue.id}>
                  <TableCell className="max-w-[180px] px-4 whitespace-normal">
                    <p className="truncate font-semibold text-heading">{venue.name}</p>
                    {venue.description ? (
                      <p className="truncate text-xs text-muted-foreground">{venue.description}</p>
                    ) : null}
                  </TableCell>
                  <TableCell className="max-w-[220px] px-4 text-muted-foreground whitespace-normal">
                    <span className="line-clamp-2">{venue.location}</span>
                  </TableCell>
                  <TableCell className="px-4 text-xs text-muted-foreground whitespace-nowrap">
                    <div>{venue.latitude.toFixed(5)}</div>
                    <div>{venue.longitude.toFixed(5)}</div>
                  </TableCell>
                  <TableCell className="px-4 text-sm whitespace-nowrap">
                    {venue.openTime} – {venue.closeTime}
                  </TableCell>
                  <TableCell className="px-4 text-sm text-muted-foreground whitespace-nowrap">
                    {formatRestTime(venue.restStartTime, venue.restEndTime)}
                  </TableCell>
                  <TableCell className="px-4 text-right">
                    <Link
                      href="/fields"
                      className="text-xs text-brand-secondary-600 underline-offset-4 hover:underline"
                    >
                      Xem sân
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <VenuesSetupPage onReplayTour={startTour} />
      )}
    </div>
  );
};
