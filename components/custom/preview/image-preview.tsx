'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

export type ImagePreviewProps = {
  url: string;
};

export function ImagePreview({ url }: ImagePreviewProps) {
  const [open, setOpen] = useState(false);

  if (!url) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Xem ảnh"
        className="block size-full cursor-zoom-in"
        onClick={() => setOpen(true)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="" className="size-full object-cover" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[min(96vw,56rem)] border-0 bg-transparent p-2 shadow-none ring-0 sm:max-w-[min(96vw,56rem)]">
          <DialogTitle className="sr-only">Xem ảnh</DialogTitle>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="max-h-[85vh] w-full rounded-lg object-contain" />
        </DialogContent>
      </Dialog>
    </>
  );
}
