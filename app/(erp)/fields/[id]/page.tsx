import { FieldDetailPage } from '@/components/features/fields/detail-field';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <FieldDetailPage fieldId={id} />;
}
