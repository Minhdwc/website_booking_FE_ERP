export type UserRole = 'admin' | 'owner' | 'user';
export type CourtStatus = 'active' | 'inactive' | 'maintenance';
export type SupportTicketStatus = 'open' | 'in_progress' | 'resolved';
export type BookingStatus =
  | 'waiting_payment'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'expired'
  | 'paid_at_venue';
export type BookingItemStatus = 'active' | 'cancelled';
export type PaymentMethod = 'bank_transfer' | 'momo' | 'zalopay' | 'vnpay';
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'cancelled';
export type UserPaymentType = 'card' | 'bank_account' | 'e_wallet';
export type UploadFolder = 'avatars' | 'venues' | 'courts' | 'payments';

export interface IUser {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICustomer {
  id: string;
  email: string | null;
  bookingCount: number;
  lastBookingAt: string;
}

export interface IVenue {
  id: string;
  userId?: string;
  name: string;
  address: string;
  district?: string;
  city?: string;
  phone?: string;
  longitude: number;
  latitude: number;
  description?: string;
  user?: Pick<IUser, 'id' | 'name' | 'email' | 'role'>;
  venueImages?: IVenueImage[];
  paymentAccounts?: IVenuePaymentAccount[];
  courts?: ICourt[];
  operatingHours?: IOperatingHour[];
  createdAt: string;
  updatedAt: string;
}

export interface ISport {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface IVenueSport {
  id: string;
  venueId: string;
  sportId: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  sport?: ISport;
  venue?: IVenue;
}

export interface IEntityImage {
  id: string;
  url: string;
  isThumbnail: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface IVenueImage extends IEntityImage {
  venueId: string;
}

export interface ICourtImage extends IEntityImage {
  courtId: string;
}

export interface IOperatingHour {
  id?: string;
  venueId?: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
}

export interface IPriceRule {
  id: string;
  courtId: string;
  dayOfWeek: number[];
  timeFrom: string;
  timeTo: string;
  isPeak: boolean;
  priceVnd: number;
  createdAt: string;
}

export interface ICourtBlock {
  id: string;
  courtId: string;
  startAt: string;
  endAt: string;
  reason?: string | null;
  createdAt: string;
}

export interface ISupportTicket {
  id: string;
  creatorId: string;
  bookingId?: string | null;
  type: string;
  description: string;
  status: SupportTicketStatus;
  adminNote?: string | null;
  createdAt: string;
  updatedAt: string;
  creator?: Pick<IUser, 'id' | 'name' | 'email' | 'phone' | 'role'>;
  booking?: Pick<IBooking, 'id' | 'bookingCode' | 'status'>;
}

export interface IPaymentMethod {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IVenuePaymentAccount {
  id: string;
  venueId: string;
  paymentMethodId: string;
  provider?: string;
  accountNumber?: string;
  accountName?: string;
  bankCode?: string;
  bankName?: string;
  qrCodeUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  venue?: Pick<IVenue, 'id' | 'name' | 'address'>;
  paymentMethod?: IPaymentMethod;
}

export interface IUserPaymentMethod {
  id: string;
  userId: string;
  type: UserPaymentType;
  provider: string;
  providerToken?: string;
  maskedNumber?: string;
  holderName?: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IAmenity {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICourt {
  id: string;
  name: string;
  description: string;
  basePriceVnd: number;
  minDurationMinutes: number;
  durationStepMinutes: number;
  status: CourtStatus;
  courtImages?: ICourtImage[];
  sportId: string;
  venueId: string;
  createdAt: string;
  updatedAt: string;
  sport?: ISport;
  venue?: IVenue;
}

export interface IAvailabilitySlot {
  startTime: string;
  endTime: string;
  durationMinutes: number;
  subtotal: number;
  status: 'available' | 'booked' | 'past';
}

export interface ICourtAvailability {
  courtId: string;
  date: string;
  slots: IAvailabilitySlot[];
}

export interface IBookingItem {
  id: string;
  bookingId: string;
  courtId: string;
  venueId: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  pricePerHour: number;
  subtotal: number;
  status: BookingItemStatus;
  createdAt: string;
  updatedAt: string;
  court?: ICourt;
  venue?: IVenue;
}

export interface IBooking {
  id: string;
  userId: string;
  bookingCode: string;
  status: BookingStatus;
  customerName?: string | null;
  customerPhone?: string | null;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  note?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: Pick<IUser, 'id' | 'name' | 'email' | 'phone'>;
  items?: IBookingItem[];
  payments?: IPayment[];
}

export interface IPayment {
  id: string;
  bookingId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionCode?: string;
  paidAt?: string;
  venuePaymentAccountId?: string;
  gatewayResponse?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  booking?: IBooking;
  venuePaymentAccount?: IVenuePaymentAccount;
}

export interface IReview {
  id: string;
  userId: string;
  venueId: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: Pick<IUser, 'id' | 'name' | 'email' | 'phone'>;
  venue?: IVenue;
}

export interface INotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}
