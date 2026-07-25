import { FieldDetailPage } from '@/components/features/fields/detail-field';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CourtDetailRoute({ params }: Props) {
  const { id } = await params;
  return <FieldDetailPage courtId={id} />;
}
