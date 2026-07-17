'use client';

import { useEffect, useState } from 'react';
import { Loader2Icon, MapPinnedIcon } from 'lucide-react';
import { toast } from 'sonner';

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IUser, IVenue } from '@/stores/api/types';
import { useVenues } from '@/stores/queries/venue.query';
import { venueService } from '@/stores/service/venue.service';

type VenueOwnerRow = {
  id: string;
  venueId: string;
  userId: string;
  user?: Pick<IUser, 'id' | 'name' | 'email'>;
};

export function UsersAssignVenueDialog({ user }: { user: IUser }) {
  const [open, setOpen] = useState(false);
  const [owners, setOwners] = useState<VenueOwnerRow[]>([]);
  const [venueId, setVenueId] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const venuesQuery = useVenues();
  const venues = venuesQuery.isSuccess ? venuesQuery.data : [];

  const loadOwnersForSelected = async (selectedVenueId: string) => {
    if (!selectedVenueId) {
      setOwners([]);
      return;
    }
    setLoading(true);
    try {
      const response = await venueService.listVenueOwners(selectedVenueId);
      const data = (response as { data?: VenueOwnerRow[] }).data ?? [];
      setOwners(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tải được danh sách owner');
      setOwners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && venueId) {
      void loadOwnersForSelected(venueId);
    }
  }, [open, venueId]);

  const isAssigned = owners.some((owner) => owner.userId === user.id);

  const handleAssign = async () => {
    if (!venueId) {
      toast.error('Chọn cơ sở trước');
      return;
    }
    setSaving(true);
    try {
      await venueService.addVenueOwner(venueId, user.id);
      toast.success('Đã gán staff vào cơ sở');
      await loadOwnersForSelected(venueId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không gán được staff');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!venueId) return;
    setSaving(true);
    try {
      await venueService.removeVenueOwner(venueId, user.id);
      toast.success('Đã gỡ staff khỏi cơ sở');
      await loadOwnersForSelected(venueId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không gỡ được staff');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setVenueId('');
          setOwners([]);
        }
      }}
    >
      <DialogTrigger
        render={
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 font-normal" />
        }
      >
        <MapPinnedIcon className="size-3.5" />
        Gán cơ sở
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gán staff vào cơ sở</DialogTitle>
          <DialogDescription>
            Gán {user.name} vào VenueOwner để quản lý booking/báo cáo của cơ sở đó.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Select value={venueId} onValueChange={setVenueId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn cơ sở" />
            </SelectTrigger>
            <SelectContent>
              {venues.map((venue: IVenue) => (
                <SelectItem key={venue.id} value={venue.id}>
                  {venue.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {loading ? (
            <p className="text-sm text-muted-foreground">Đang kiểm tra…</p>
          ) : venueId ? (
            <p className="text-sm text-muted-foreground">
              {isAssigned
                ? 'Tài khoản này đã được gán vào cơ sở đã chọn.'
                : 'Tài khoản chưa được gán vào cơ sở này.'}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Đóng
          </Button>
          {isAssigned ? (
            <Button type="button" variant="destructive" disabled={saving || !venueId} onClick={handleRemove}>
              {saving && <Loader2Icon className="size-3.5 animate-spin" />}
              Gỡ khỏi cơ sở
            </Button>
          ) : (
            <Button type="button" disabled={saving || !venueId} onClick={handleAssign}>
              {saving && <Loader2Icon className="size-3.5 animate-spin" />}
              Gán vào cơ sở
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
