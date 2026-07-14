'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2Icon, PlusIcon } from 'lucide-react';
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
import { useCreateSport } from '@/stores/queries/sport.query';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Tên bộ môn không được ít hơn 2 ký tự' }),
});

type FormValues = z.infer<typeof formSchema>;

export const SportsCreateDialog = () => {
  const [open, setOpen] = useState(false);
  const createSportMutation = useCreateSport();
  const isSaving = createSportMutation.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '' },
  });

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      form.reset({ name: '' });
    }
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      await createSportMutation.mutateAsync({ name: values.name.trim() });
      toast.success('Thêm bộ môn thành công');
      handleOpenChange(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message || 'Không thêm được bộ môn');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button className="gap-2" />}>
        <PlusIcon className="size-4" />
        Thêm bộ môn
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm bộ môn</DialogTitle>
          <DialogDescription>Tạo bộ môn mới trong catalog hệ thống.</DialogDescription>
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
                    <Input placeholder="Ví dụ: Bóng đá, Cầu lông…" {...field} />
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
