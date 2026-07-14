'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2Icon, PlusIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { ComboboxSport } from '@/components/custom/combobox/combobox-sport';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import type { IVenueSport } from '@/stores/api/types';
import { useCreateVenueSport } from '@/stores/queries/venue-sport.query';

const formSchema = z.object({
  sportId: z.string().min(1, { message: 'Chọn bộ môn' }),
  description: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const DialogRegisterVenueSport = ({
  venueId,
  venueName,
  registeredSports,
}: {
  venueId: string;
  venueName?: string;
  registeredSports: IVenueSport[];
}) => {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateVenueSport();
  const isSaving = createMutation.isPending;

  const registeredSportIds = registeredSports.map((item) => item.sportId);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { sportId: '', description: '' },
  });

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) form.reset({ sportId: '', description: '' });
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      await createMutation.mutateAsync({
        venueId,
        sportId: values.sportId,
        description: values.description?.trim() || undefined,
        isActive: true,
      });
      toast.success('Đăng ký bộ môn thành công');
      handleOpenChange(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || 'Không đăng ký được bộ môn');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={<Button size="sm" disabled={!venueId} />}
      >
        <PlusIcon className="size-3.5" />
        Đăng ký bộ môn
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Đăng ký bộ môn</DialogTitle>
          <DialogDescription>
            {venueName
              ? `Thêm bộ môn từ catalog vào cơ sở ${venueName}.`
              : 'Chọn bộ môn từ catalog hệ thống để cơ sở bắt đầu nhận đặt sân.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="sportId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Bộ môn <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <ComboboxSport
                      value={field.value}
                      onChange={field.onChange}
                      excludeIds={registeredSportIds}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="VD: 2 sân 5 người, sân 7 người có mái che…"
                      className="min-h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Huỷ
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2Icon className="size-3.5 animate-spin" />}
                Đăng ký
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
