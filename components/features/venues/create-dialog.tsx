'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2Icon, MapPinIcon, PlusIcon } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { VenueLocationMap } from '@/components/features/venues/location-map';
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
import { useVenues } from '@/hooks/use-venues';
import { geocodeAddress } from '@/lib/osm/geocode';

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const formSchema = z
  .object({
    name: z.string().min(2, { message: 'Tên cơ sở không được ít hơn 2 ký tự' }),
    location: z.string().min(2, { message: 'Địa chỉ không được ít hơn 2 ký tự' }),
    longitude: z
      .number({ message: 'Kinh độ không hợp lệ' })
      .min(-180, { message: 'Kinh độ từ -180 đến 180' })
      .max(180, { message: 'Kinh độ từ -180 đến 180' }),
    latitude: z
      .number({ message: 'Vĩ độ không hợp lệ' })
      .min(-90, { message: 'Vĩ độ từ -90 đến 90' })
      .max(90, { message: 'Vĩ độ từ -90 đến 90' }),
    openTime: z.string().regex(timeRegex, { message: 'Giờ mở cửa không hợp lệ' }),
    closeTime: z.string().regex(timeRegex, { message: 'Giờ đóng cửa không hợp lệ' }),
    restStartTime: z.string(),
    restEndTime: z.string(),
    description: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    const open = toMinutes(values.openTime);
    const close = toMinutes(values.closeTime);

    if (close <= open) {
      ctx.addIssue({
        code: 'custom',
        path: ['closeTime'],
        message: 'Giờ đóng cửa phải sau giờ mở cửa',
      });
    }

    if (!values.restStartTime || !values.restEndTime) {
      toast.error('Giờ bắt đầu nghỉ và giờ kết thúc nghỉ không được bỏ trống');
    }
    if (
      toMinutes(values.restStartTime) < toMinutes(values.openTime) ||
      toMinutes(values.restEndTime) > toMinutes(values.closeTime)
    ) {
      toast.error('Thời gian nghỉ phải nằm trong giờ hoạt động');
    }
  });

type FormValues = z.infer<typeof formSchema>;

export const VenuesCreateDialog = () => {
  const [open, setOpen] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const { createVenue, isSaving } = useVenues();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      location: '',
      longitude: undefined,
      latitude: undefined,
      openTime: '06:00',
      closeTime: '22:00',
      restStartTime: '',
      restEndTime: '',
      description: '',
    },
  });

  const longitude = useWatch({ control: form.control, name: 'longitude' });
  const latitude = useWatch({ control: form.control, name: 'latitude' });

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      form.reset();
      setIsGeocoding(false);
    }
  };

  const resolveCoordinates = async (address: string) => {
    const trimmed = address.trim();
    if (trimmed.length < 2) return;

    setIsGeocoding(true);
    try {
      const result = await geocodeAddress(trimmed);
      form.setValue('location', result.placeName, { shouldValidate: true });
      form.setValue('longitude', result.longitude, { shouldValidate: true });
      form.setValue('latitude', result.latitude, { shouldValidate: true });
    } catch (error) {
      form.resetField('longitude');
      form.resetField('latitude');
      toast.error(error instanceof Error ? error.message : 'Không lấy được tọa độ từ OSM');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      const payload = {
        name: values.name.trim(),
        location: values.location.trim(),
        longitude: values.longitude,
        latitude: values.latitude,
        openTime: values.openTime,
        closeTime: values.closeTime,
        description: values.description?.trim(),
        ...(values.restStartTime && values.restEndTime
          ? {
              restStartTime: values.restStartTime,
              restEndTime: values.restEndTime,
            }
          : {}),
      };

      await createVenue(payload);
      toast.success('Tạo cơ sở thành công');
      handleOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tạo được cơ sở. Thử lại.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button id="venues-create-btn" size="sm" className="rounded-lg" />}>
        <PlusIcon className="size-3.5" />
        Thêm cơ sở
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg" id="venues-create-form">
        <DialogHeader>
          <DialogTitle>Tạo cơ sở mới</DialogTitle>
          <DialogDescription>
            Nhập địa chỉ rồi OSM sẽ tự gán kinh độ / vĩ độ và đánh dấu trên bản đồ MapLibre.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên cơ sở*</FormLabel>
                  <FormControl>
                    <Input placeholder="Minh Đức Sport Complex" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Địa chỉ*</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Quận 7, TP.HCM"
                        {...field}
                        onBlur={(event) => {
                          field.onBlur();
                          void resolveCoordinates(event.target.value);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            void resolveCoordinates(field.value);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="shrink-0 rounded-lg"
                        disabled={isGeocoding}
                        onClick={() => void resolveCoordinates(field.value)}
                      >
                        {isGeocoding ? (
                          <Loader2Icon className="size-3.5 animate-spin" />
                        ) : (
                          <MapPinIcon className="size-3.5" />
                        )}
                        Lấy tọa độ
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kinh độ (long)*</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        readOnly
                        value={typeof field.value === 'number' ? field.value : ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vĩ độ (lat)*</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        readOnly
                        value={typeof field.value === 'number' ? field.value : ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {longitude && latitude ? (
              <div className="h-[220px] overflow-hidden rounded-xl border border-border">
                <VenueLocationMap longitude={longitude} latitude={latitude} />
              </div>
            ) : (
              <div className="flex h-[120px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-4 text-center text-xs text-muted-foreground">
                {isGeocoding
                  ? 'Đang lấy tọa độ từ OpenStreetMap…'
                  : 'Nhập địa chỉ rồi bấm “Lấy tọa độ” để đánh dấu trên bản đồ'}
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm font-medium text-heading">Thời gian hoạt động*</p>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="openTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mở cửa</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="closeTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Đóng cửa</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-heading">Thời gian nghỉ ngơi</p>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="restStartTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bắt đầu nghỉ</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="restEndTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kết thúc nghỉ</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Input placeholder="Tuỳ chọn" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-lg"
                onClick={() => handleOpenChange(false)}
              >
                Huỷ
              </Button>
              <Button
                id="venues-create-submit"
                type="submit"
                className="rounded-lg"
                disabled={isSaving || isGeocoding}
              >
                {isSaving ? 'Đang lưu…' : 'Lưu cơ sở'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
