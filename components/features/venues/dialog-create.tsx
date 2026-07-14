'use client';

import { useState, type ReactNode } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ClockIcon, InfoIcon, Loader2Icon, MapPinIcon, PlusIcon } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { VenueLocationMap } from '@/components/features/venues/location-map';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
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
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { geocodeAddress } from '@/lib/osm/geocode';
import { useCreateVenue } from '@/stores/queries/venue.query';

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const formSchema = z.object({
  name: z.string().min(2, { message: 'Tên cơ sở không được ít hơn 2 ký tự' }),
  location: z.string().min(2, { message: 'Địa chỉ không được ít hơn 2 ký tự' }),
  longitude: z.number({ message: 'Kinh độ không hợp lệ' }),
  latitude: z.number({ message: 'Vĩ độ không hợp lệ' }),
  openTime: z.string().regex(timeRegex, { message: 'Giờ mở cửa không hợp lệ' }),
  closeTime: z.string().regex(timeRegex, { message: 'Giờ đóng cửa không hợp lệ' }),
  restStartTime: z.string(),
  restEndTime: z.string(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const SectionHeading = ({
  icon,
  title,
  hint,
}: {
  icon: ReactNode;
  title: string;
  hint?: string;
}) => (
  <div className="flex items-center gap-2">
    <span className="flex size-6 items-center justify-center rounded-md bg-muted text-muted-foreground [&_svg]:size-3.5">
      {icon}
    </span>
    <div className="flex items-baseline gap-2">
      <h3 className="text-sm font-semibold text-heading">{title}</h3>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  </div>
);

export const VenuesCreateDialog = () => {
  const [open, setOpen] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isHasRestTime, setIsHasRestTime] = useState(false);
  const createVenueMutation = useCreateVenue();
  const isSaving = createVenueMutation.isPending;

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
      setIsHasRestTime(false);
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
      toast.error(error instanceof Error ? error.message : 'Không lấy được tọa độ');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSubmit = async (values: FormValues) => {
    const open = toMinutes(values.openTime);
    const close = toMinutes(values.closeTime);

    if (close <= open) {
      form.setError('closeTime', { message: 'Giờ đóng cửa phải sau giờ mở cửa' });
      return;
    }

    if (isHasRestTime) {
      if (!values.restStartTime) {
        form.setError('restStartTime', { message: 'Nhập giờ bắt đầu nghỉ' });
        return;
      }
      if (!values.restEndTime) {
        form.setError('restEndTime', { message: 'Nhập giờ kết thúc nghỉ' });
        return;
      }

      const restStart = toMinutes(values.restStartTime);
      const restEnd = toMinutes(values.restEndTime);

      if (restEnd <= restStart) {
        form.setError('restEndTime', {
          message: 'Giờ kết thúc nghỉ phải sau giờ bắt đầu nghỉ',
        });
        return;
      }

      if (restStart < open || restEnd > close) {
        form.setError('restStartTime', {
          message: 'Thời gian nghỉ phải nằm trong giờ hoạt động',
        });
        return;
      }
    }

    try {
      const payload = {
        name: values.name.trim(),
        location: values.location.trim(),
        longitude: values.longitude,
        latitude: values.latitude,
        openTime: values.openTime,
        closeTime: values.closeTime,
        description: values.description?.trim(),
        ...(isHasRestTime
          ? {
              restStartTime: values.restStartTime,
              restEndTime: values.restEndTime,
            }
          : {}),
      };

      await createVenueMutation.mutateAsync(payload);
      toast.success('Tạo cơ sở thành công');
      handleOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tạo được cơ sở. Thử lại.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button id="venues-create-btn" size="sm" />}>
        <PlusIcon className="size-3.5" />
        Thêm cơ sở
      </DialogTrigger>

      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl" id="venues-create-form">
        <DialogHeader>
          <DialogTitle>Tạo cơ sở mới</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            <section className="space-y-3">
              <SectionHeading icon={<InfoIcon />} title="Thông tin chung" />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tên cơ sở <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Minh Đức Sport Complex" autoFocus {...field} />
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
                        placeholder="Giới thiệu ngắn về cơ sở (tuỳ chọn)"
                        className="min-h-14"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            <Separator />

            <section className="space-y-3">
              <SectionHeading icon={<MapPinIcon />} title="Vị trí" />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Địa chỉ <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          placeholder="VD: 123 Nguyễn Văn Linh, Quận 7, TP.HCM"
                          {...field}
                          onBlur={(event) => {
                            field.onBlur();
                            resolveCoordinates(event.target.value);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault();
                              resolveCoordinates(field.value);
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="shrink-0"
                          disabled={isGeocoding}
                          onClick={() => resolveCoordinates(field.value)}
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
                      <FormLabel className="text-muted-foreground">Kinh độ</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          readOnly
                          tabIndex={-1}
                          className="bg-muted/50 font-mono text-xs text-muted-foreground"
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
                      <FormLabel className="text-muted-foreground">Vĩ độ</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          readOnly
                          tabIndex={-1}
                          className="bg-muted/50 font-mono text-xs text-muted-foreground"
                          value={typeof field.value === 'number' ? field.value : ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {longitude && latitude ? (
                <div className="h-[220px] overflow-hidden rounded-lg border border-border shadow-sm">
                  <VenueLocationMap longitude={longitude} latitude={latitude} />
                </div>
              ) : (
                <div className="flex h-[120px] flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border bg-muted/30 px-4 text-center">
                  {isGeocoding ? (
                    <>
                      <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        Đang lấy tọa độ từ OpenStreetMap…
                      </p>
                    </>
                  ) : (
                    <>
                      <MapPinIcon className="size-4 text-muted-foreground/70" />
                      <p className="text-xs text-muted-foreground">
                        Nhập địa chỉ rồi bấm “Lấy tọa độ” để đánh dấu trên bản đồ
                      </p>
                    </>
                  )}
                </div>
              )}
            </section>

            <Separator />

            <section className="space-y-3">
              <SectionHeading icon={<ClockIcon />} title="Giờ hoạt động" />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="openTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Mở cửa <span className="text-destructive">*</span>
                      </FormLabel>
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
                      <FormLabel>
                        Đóng cửa <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <Label
                      htmlFor="venues-create-has-rest"
                      className="text-sm font-medium text-heading"
                    >
                      Thời gian nghỉ trưa
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Khoảng nghỉ trong ngày, không nhận booking.
                    </p>
                  </div>
                  <Switch
                    id="venues-create-has-rest"
                    checked={isHasRestTime}
                    onCheckedChange={(checked) => {
                      const enabled = checked === true;
                      setIsHasRestTime(enabled);
                      if (!enabled) {
                        form.setValue('restStartTime', '');
                        form.setValue('restEndTime', '');
                        form.clearErrors(['restStartTime', 'restEndTime']);
                      }
                    }}
                  />
                </div>

                {isHasRestTime && (
                  <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border/60 pt-3">
                    <FormField
                      control={form.control}
                      name="restStartTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Bắt đầu nghỉ <span className="text-destructive">*</span>
                          </FormLabel>
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
                          <FormLabel>
                            Kết thúc nghỉ <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            </section>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Huỷ
              </Button>
              <Button id="venues-create-submit" type="submit" disabled={isSaving || isGeocoding}>
                {isSaving && <Loader2Icon className="size-3.5 animate-spin" />}
                {isSaving ? 'Đang lưu…' : 'Lưu cơ sở'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
