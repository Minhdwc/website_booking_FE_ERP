'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2Icon, PencilIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

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
import { Input } from '@/components/ui/input';
import { ISport } from '@/stores/api/types';
import { useUpdateSport } from '@/stores/queries/sport.query';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Tên bộ môn không được ít hơn 2 ký tự' }),
});

type FormValues = z.infer<typeof formSchema>;

export const SportsEditDialog = ({ sport }: { sport: ISport }) => {
  const [open, setOpen] = useState(false);
  const updateSportMutation = useUpdateSport();
  const isSaving = updateSportMutation.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: sport.name },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({ name: sport.name });
  }, [open, sport.name, form]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      form.reset({ name: sport.name });
    }
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      await updateSportMutation.mutateAsync({
        id: sport.id,
        body: { name: values.name.trim() },
      });
      toast.success('Cập nhật bộ môn thành công');
      handleOpenChange(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message || 'Không cập nhật được bộ môn');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 font-normal" />
        }
      >
        <PencilIcon className="size-3.5 text-muted-foreground" />
        Chỉnh sửa
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa bộ môn</DialogTitle>
          <DialogDescription>Cập nhật tên bộ môn trong catalog.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên bộ môn</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2Icon className="size-4 animate-spin" />}
                Lưu
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
