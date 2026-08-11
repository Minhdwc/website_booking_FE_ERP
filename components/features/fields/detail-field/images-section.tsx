'use client';

import { useRef, useState } from 'react';
import { Loader2Icon, PlusIcon, StarIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';

import { showApiErrorToast } from '@/lib/api/handle-api-error';
import { ImagePreview } from '@/components/custom/preview/image-preview';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ICourtImage } from '@/stores/api/types';
import {
  useDeleteCourtImage,
  useSetCourtImageThumbnail,
  useUploadCourtImage,
} from '@/stores/queries/court';

type FieldImagesSectionProps = {
  courtId: string;
  images: ICourtImage[];
};

export const FieldImagesSection = ({ courtId, images }: FieldImagesSectionProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const uploadMutation = useUploadCourtImage();
  const deleteMutation = useDeleteCourtImage();
  const thumbnailMutation = useSetCourtImageThumbnail();

  const isUploading = uploadMutation.isPending;
  const isBusy = isUploading || deleteMutation.isPending || thumbnailMutation.isPending;

  const sortedImages = [...images].sort((a, b) => a.position - b.position);

  const uploadFiles = async (fileList: FileList | null) => {
    const files = Array.from(fileList ?? []).filter((file) => file.type.startsWith('image/'));
    if (files.length === 0) {
      toast.error('Chỉ chấp nhận file ảnh');
      return;
    }

    let uploaded = 0;
    for (const file of files) {
      try {
        await uploadMutation.mutateAsync({ courtId, file });
        uploaded += 1;
      } catch (error: unknown) {
        showApiErrorToast(error, 'Không tải được ảnh lên');
        break;
      }
    }

    if (uploaded > 0) {
      toast.success(uploaded === 1 ? 'Đã thêm ảnh' : `Đã thêm ${uploaded} ảnh`);
    }

    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDelete = async (image: ICourtImage) => {
    if (!window.confirm('Xóa ảnh này khỏi sân?')) return;
    try {
      await deleteMutation.mutateAsync({ courtId, imageId: image.id });
      toast.success('Đã xóa ảnh');
    } catch (error: unknown) {
      showApiErrorToast(error, 'Không xóa được ảnh');
    }
  };

  const handleSetThumbnail = async (image: ICourtImage) => {
    if (image.isThumbnail) return;
    try {
      await thumbnailMutation.mutateAsync({ courtId, imageId: image.id });
      toast.success('Đã đặt làm ảnh đại diện');
    } catch (error: unknown) {
      showApiErrorToast(error, 'Không cập nhật được ảnh đại diện');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-heading">Hình ảnh</h3>
          {images.length > 0 && (
            <Badge variant="secondary" className="font-semibold tabular-nums">
              {images.length}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">Bấm sao để chọn ảnh đại diện</p>
      </div>

      <ul
        className="grid grid-cols-3 gap-2 sm:grid-cols-4"
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          void uploadFiles(event.dataTransfer.files);
        }}
      >
        <li>
          <button
            type="button"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
            className={cn(
              'flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed bg-muted/20 text-muted-foreground transition-colors',
              isDragging
                ? 'border-emerald-400 bg-emerald-50/60 text-emerald-700'
                : 'border-border/70 hover:border-emerald-300 hover:bg-emerald-50/40 hover:text-emerald-700',
              isUploading && 'pointer-events-none opacity-60',
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(event) => void uploadFiles(event.target.files)}
            />
            {isUploading ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <PlusIcon className="size-4" />
            )}
            <span className="text-[10px] font-medium">
              {isUploading ? 'Đang tải…' : 'Thêm ảnh'}
            </span>
          </button>
        </li>

        {sortedImages.map((image) => {
          const isSelected = image.isThumbnail;

          return (
            <li
              key={image.id}
              className={cn(
                'group relative aspect-square overflow-hidden rounded-lg border bg-muted',
                isSelected ? 'border-emerald-400 ring-2 ring-emerald-200' : 'border-border/60',
              )}
            >
              <ImagePreview url={image.url} />

              {isSelected && (
                <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-0.5 rounded bg-background/90 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 shadow-sm">
                  <StarIcon className="size-2.5 fill-current" />
                  Đại diện
                </span>
              )}

              <div className="absolute inset-x-0 bottom-0 flex justify-end gap-0.5 bg-linear-to-t from-black/65 to-transparent p-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                {!isSelected && (
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="secondary"
                    className="size-7 bg-background/95 shadow-sm"
                    aria-label="Đặt làm ảnh đại diện"
                    disabled={isBusy}
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleSetThumbnail(image);
                    }}
                  >
                    <StarIcon className="size-3" />
                  </Button>
                )}
                <Button
                  type="button"
                  size="icon-sm"
                  variant="destructive"
                  className="size-7 shadow-sm"
                  aria-label="Xóa ảnh"
                  disabled={isBusy}
                  onClick={(event) => {
                    event.stopPropagation();
                    void handleDelete(image);
                  }}
                >
                  <Trash2Icon className="size-3" />
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
