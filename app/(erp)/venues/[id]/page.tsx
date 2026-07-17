import { VenueDetailPage } from '@/components/features/venues/detail-venue';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <VenueDetailPage venueId={id} />;
}
