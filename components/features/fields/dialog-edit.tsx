'use client';

import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import type { FieldStatus, IField, ISport, IVenue } from '@/stores/api/types';
import { useField, useUpdateField } from '@/stores/queries/field.query';
import { useSports } from '@/stores/queries/sport.query';
import { useVenues } from '@/stores/queries/venue.query';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Tên sân không được ít hơn 2 ký tự' }),
  venueId: z.string().min(1, { message: 'Chọn cơ sở' }),
  sportId: z.string().min(1, { message: 'Chọn bộ môn' }),
  price: z
    .number({ message: 'Giá không hợp lệ' })
    .min(0, { message: 'Giá phải lớn hơn hoặc bằng 0' }),
  status: z.enum(['active', 'inactive', 'maintenance']),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const statusOptions: { value: FieldStatus; label: string }[] = [
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Ngưng' },
  { value: 'maintenance', label: 'Bảo trì' },
];

export const DialogEditField = ({ fieldId }: { fieldId: string }) => {
  const [open, setOpen] = useState(false);
  const { data: field, isLoading, isError, error } = useField(fieldId);
  const venuesQuery = useVenues();
  const sportsQuery = useSports();
  const venues = venuesQuery.isSuccess ? venuesQuery.data : [];
  const sports = sportsQuery.isSuccess ? sportsQuery.data : [];
  const updateFieldMutation = useUpdateField();
  const isSaving = updateFieldMutation.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      venueId: '',
      sportId: '',
      price: 0,
      status: 'active',
      description: '',
    },
    values: field
      ? {
          name: field.name,
          venueId: field.venueId,
          sportId: field.sportId,
          price: field.price,
          status: field.status,
          description: field.description || '',
        }
      : undefined,
  });

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) form.reset();
  };

  const handleSubmit = async (values: FormValues) => {
    if (!field) return;

    try {
      const body: Partial<IField> = {
        name: values.name.trim(),
        venueId: values.venueId,
        sportId: values.sportId,
        price: values.price,
        status: values.status,
        description: values.description?.trim() ? values.description.trim() : null,
      };

      await updateFieldMutation.mutateAsync({ id: field.id, body });
      toast.success('Cập nhật sân thành công');
      handleOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không cập nhật được sân. Thử lại.');
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

      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa sân</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin sân, giá và trạng thái hoạt động.
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="space-y-3 py-2">
            <Skeleton className="h-9 w-full rounded-lg" />
            <Skeleton className="h-9 w-full rounded-lg" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        )}

        {isError && (
          <p className="py-6 text-center text-sm text-destructive">
            {error instanceof Error ? error.message : 'Không tải được thông tin sân'}
          </p>
        )}

        {field && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field: nameField }) => (
                  <FormItem>
                    <FormLabel>
                      Tên sân <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Sân 5 người A" autoFocus {...nameField} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="venueId"
                  render={({ field: venueField }) => (
                    <FormItem>
                      <FormLabel>
                        Cơ sở <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select value={venueField.value} onValueChange={venueField.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Chọn cơ sở" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {venues.map((venue: IVenue) => (
                            <SelectItem key={venue.id} value={venue.id}>
                              {venue.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sportId"
                  render={({ field: sportField }) => (
                    <FormItem>
                      <FormLabel>
                        Bộ môn <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select value={sportField.value} onValueChange={sportField.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Chọn bộ môn" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sports.map((sport: ISport) => (
                            <SelectItem key={sport.id} value={sport.id}>
                              {sport.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field: priceField }) => (
                    <FormItem>
                      <FormLabel>
                        Giá / giờ (VND) <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={1000}
                          value={priceField.value}
                          onChange={(event) => priceField.onChange(event.target.valueAsNumber || 0)}
                          onBlur={priceField.onBlur}
                          name={priceField.name}
                          ref={priceField.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field: statusField }) => (
                    <FormItem>
                      <FormLabel>
                        Trạng thái <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select value={statusField.value} onValueChange={statusField.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field: descField }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ghi chú về sân (tuỳ chọn)"
                        className="min-h-14"
                        {...descField}
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
                  {isSaving ? 'Đang lưu…' : 'Lưu thay đổi'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};
