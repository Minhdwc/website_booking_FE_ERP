'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2Icon, PencilIcon } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { ComboboxSport } from '@/components/custom/combobox/combobox-sport';
import { ComboboxVenue } from '@/components/custom/combobox/combobox-venue';
import { formatCurrencyInput, parseCurrencyInput } from '@/lib/format';
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
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import type { FieldStatus, IField } from '@/stores/api/types';
import { useField, useUpdateField } from '@/stores/queries/field.query';

const formatDurationMinutes = (minutes: number) => {
  if (!minutes || minutes < 0) return '—';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} phút`;
  if (mins === 0) return hours === 1 ? '1 giờ' : `${hours} giờ`;
  return `${hours} giờ ${mins} phút`;
};

const formSchema = z.object({
  name: z.string().min(2, { message: 'Tên sân không được ít hơn 2 ký tự' }),
  venueId: z.string().min(1, { message: 'Chọn cơ sở' }),
  sportId: z.string().min(1, { message: 'Chọn bộ môn' }),
  minDurationMinutes: z
    .number({ message: 'Nhập thời gian thuê tối thiểu' })
    .min(15, { message: 'Tối thiểu 15 phút' }),
  durationStepMinutes: z
    .number({ message: 'Nhập bước tăng thời gian' })
    .min(15, { message: 'Bước tăng tối thiểu 15 phút' }),
  price: z.number({ message: 'Nhập giá thuê' }).min(1, { message: 'Giá phải lớn hơn 0' }),
  status: z.enum(['active', 'inactive']),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const statusOptions: { value: FieldStatus; label: string }[] = [
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Ngưng' },
];

const statusItems = Object.fromEntries(statusOptions.map((option) => [option.value, option.label]));

export const DialogEditField = ({ fieldId }: { fieldId: string }) => {
  const [open, setOpen] = useState(false);
  const { data: field, isLoading, isError, error } = useField(fieldId);
  const updateFieldMutation = useUpdateField();
  const isSaving = updateFieldMutation.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      venueId: '',
      sportId: '',
      minDurationMinutes: 90,
      durationStepMinutes: 30,
      price: 0,
      status: 'active',
      description: '',
    },
    values: field
      ? {
          name: field.name,
          venueId: field.venueId,
          sportId: field.sportId,
          minDurationMinutes: field.minDurationMinutes,
          durationStepMinutes: field.durationStepMinutes,
          price: field.price,
          status: field.status,
          description: field.description || '',
        }
      : undefined,
  });

  const venueId = useWatch({ control: form.control, name: 'venueId' });
  const minDurationMinutes = useWatch({ control: form.control, name: 'minDurationMinutes' });
  const durationStepMinutes = useWatch({ control: form.control, name: 'durationStepMinutes' });

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
        minDurationMinutes: values.minDurationMinutes,
        durationStepMinutes: values.durationStepMinutes,
        price: values.price,
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
            Cập nhật thông tin sân, thời gian thuê, giá và trạng thái.
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
                      <FormControl>
                        <ComboboxVenue
                          value={venueField.value}
                          onChange={(id) => {
                            venueField.onChange(id);
                            form.setValue('sportId', '');
                          }}
                        />
                      </FormControl>
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
                      <FormControl>
                        <ComboboxSport
                          key={venueId}
                          value={sportField.value}
                          onChange={sportField.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="minDurationMinutes"
                  render={({ field: durationField }) => (
                    <FormItem>
                      <FormLabel>
                        Thời gian thuê tối thiểu <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <InputGroup>
                          <InputGroupInput
                            type="number"
                            min={15}
                            step={15}
                            value={durationField.value || ''}
                            onChange={(event) =>
                              durationField.onChange(event.target.valueAsNumber || 0)
                            }
                            onBlur={durationField.onBlur}
                            name={durationField.name}
                            ref={durationField.ref}
                          />
                          <InputGroupAddon align="inline-end">phút</InputGroupAddon>
                        </InputGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="durationStepMinutes"
                  render={({ field: stepField }) => (
                    <FormItem>
                      <FormLabel>
                        Bước tăng thêm <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <InputGroup>
                          <InputGroupInput
                            type="number"
                            min={15}
                            step={15}
                            value={stepField.value || ''}
                            onChange={(event) =>
                              stepField.onChange(event.target.valueAsNumber || 0)
                            }
                            onBlur={stepField.onBlur}
                            name={stepField.name}
                            ref={stepField.ref}
                          />
                          <InputGroupAddon align="inline-end">phút</InputGroupAddon>
                        </InputGroup>
                      </FormControl>
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
                        Giá / {formatDurationMinutes(minDurationMinutes || 60)}{' '}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <InputGroup>
                          <InputGroupInput
                            inputMode="numeric"
                            placeholder="VD: 200.000"
                            value={formatCurrencyInput(priceField.value)}
                            onChange={(event) =>
                              priceField.onChange(parseCurrencyInput(event.target.value))
                            }
                            onBlur={priceField.onBlur}
                            name={priceField.name}
                            ref={priceField.ref}
                          />
                          <InputGroupAddon align="inline-end">đ</InputGroupAddon>
                        </InputGroup>
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
                      <Select
                        value={statusField.value}
                        onValueChange={statusField.onChange}
                        items={statusItems}
                      >
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
