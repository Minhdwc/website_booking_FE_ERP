'use client';

import { useRef } from 'react';
import { ImageIcon, Loader2Icon, Trash2Icon, UploadIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IFieldImage } from '@/stores/api/types';
import { useDeleteFieldImage, useUploadFieldImage } from '@/stores/queries/field.query';

type FieldImagesSectionProps = {
  fieldId: string;
  images: IFieldImage[];
};

export const FieldImagesSection = ({ fieldId, images }: FieldImagesSectionProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadFieldImage();
  const deleteMutation = useDeleteFieldImage();
  const isUploading = uploadMutation.isPending;

  const handleUpload = async (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Chỉ chấp nhận file ảnh');
      return;
    }

    try {
      await uploadMutation.mutateAsync({ fieldId, file });
      toast.success('Đã thêm ảnh');
    } catch (error: any) {
      toast.error(error?.message || 'Không tải được ảnh lên');
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDelete = async (image: IFieldImage) => {
    if (!window.confirm('Xóa ảnh này khỏi sân?')) return;
    try {
      await deleteMutation.mutateAsync({ fieldId, imageId: image.id });
      toast.success('Đã xóa ảnh');
    } catch (error: any) {
      toast.error(error?.message || 'Không xóa được ảnh');
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 className="text-base font-semibold text-heading">Hình ảnh</h2>
          {images.length > 0 && (
            <Badge variant="secondary" className="font-semibold tabular-nums">
              {images.length}
            </Badge>
          )}
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => handleUpload(event.target.files)}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
          >
            {isUploading ? (
              <Loader2Icon className="size-3.5 animate-spin" />
            ) : (
              <UploadIcon className="size-3.5" />
            )}
            {isUploading ? 'Đang tải…' : 'Thêm ảnh'}
          </Button>
        </div>
      </div>

      {images.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
          <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <ImageIcon className="size-5" />
          </div>
          <p className="mt-3 text-sm font-medium text-heading">Chưa có ảnh sân</p>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            Thêm ảnh mặt sân hoặc không gian để khách dễ nhận diện khi đặt lịch.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((image) => (
            <li
              key={image.id}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border/60 bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt="" className="size-full object-cover" />
              {image.isThumbnail && (
                <Badge className="absolute left-2 top-2 text-[10px]" variant="secondary">
                  Thumbnail
                </Badge>
              )}
              <Button
                type="button"
                variant="destructive"
                size="icon-sm"
                className="absolute right-2 top-2 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                aria-label="Xóa ảnh"
                disabled={deleteMutation.isPending}
                onClick={() => handleDelete(image)}
              >
                <Trash2Icon className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
