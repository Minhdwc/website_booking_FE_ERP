'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2Icon, PlusIcon } from 'lucide-react';
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
  FormDescription,
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
import { Textarea } from '@/components/ui/textarea';
import type { FieldStatus } from '@/stores/api/types';
import { useCreateField } from '@/stores/queries/field.query';

const formatDurationMinutes = (minutes: number) => {
  if (!minutes || minutes < 0) return '—';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} phút`;
  if (mins === 0) return hours === 1 ? '1 giờ' : `${hours} giờ`;
  return `${hours} giờ ${mins} phút`;
};

const buildValidDurations = (
  minDurationMinutes: number,
  durationStepMinutes: number,
  maxMinutes = 480,
) => {
  if (minDurationMinutes < 1 || durationStepMinutes < 1) return [];
  const values: number[] = [];
  for (let value = minDurationMinutes; value <= maxMinutes; value += durationStepMinutes) {
    values.push(value);
  }
  return values;
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
  status: z.enum(['active', 'inactive', 'maintenance']),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const statusOptions: { value: FieldStatus; label: string }[] = [
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Ngưng' },
];

const statusItems = Object.fromEntries(statusOptions.map((option) => [option.value, option.label]));

export const DialogCreateField = () => {
  const [open, setOpen] = useState(false);
  const createFieldMutation = useCreateField();
  const isSaving = createFieldMutation.isPending;

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
  });

  const venueId = useWatch({ control: form.control, name: 'venueId' });
  const minDurationMinutes = useWatch({ control: form.control, name: 'minDurationMinutes' });
  const durationStepMinutes = useWatch({ control: form.control, name: 'durationStepMinutes' });

  const exampleDurations =
    minDurationMinutes && durationStepMinutes
      ? buildValidDurations(minDurationMinutes, durationStepMinutes).slice(0, 5)
      : [];

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) form.reset();
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      await createFieldMutation.mutateAsync({
        name: values.name.trim(),
        venueId: values.venueId,
        sportId: values.sportId,
        minDurationMinutes: values.minDurationMinutes,
        durationStepMinutes: values.durationStepMinutes,
        price: values.price,
        description: values.description?.trim() ? values.description.trim() : null,
      });
      toast.success('Tạo sân thành công');
      handleOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tạo được sân. Thử lại.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button size="sm" />}>
        <PlusIcon className="size-3.5" />
        Thêm sân
      </DialogTrigger>

      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tạo sân mới</DialogTitle>
          <DialogDescription>Gắn sân vào cơ sở, cấu hình thời gian thuê và giá.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tên sân <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Sân 5 người A" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="venueId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Cơ sở <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <ComboboxVenue
                        value={field.value}
                        onChange={(id) => {
                          field.onChange(id);
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Bộ môn <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <ComboboxSport key={venueId} value={field.value} onChange={field.onChange} />
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
                render={({ field }) => (
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
                          value={field.value || ''}
                          onChange={(event) => field.onChange(event.target.valueAsNumber || 0)}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
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
                render={({ field }) => (
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
                          value={field.value || ''}
                          onChange={(event) => field.onChange(event.target.valueAsNumber || 0)}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                        <InputGroupAddon align="inline-end">phút</InputGroupAddon>
                      </InputGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
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
                        value={formatCurrencyInput(field.value)}
                        onChange={(event) => field.onChange(parseCurrencyInput(event.target.value))}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ghi chú về sân (tuỳ chọn)"
                      className="min-h-14"
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
                {isSaving ? 'Đang lưu…' : 'Lưu sân'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
