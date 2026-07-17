export type UserRole = 'admin' | 'staff' | 'user';
export type FieldStatus = 'active' | 'inactive';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentMethod = 'bank_transfer' | 'momo' | 'zalopay' | 'vnpay';
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'cancelled';
export type UserPaymentType = 'card' | 'bank_account' | 'e_wallet';
export type UploadFolder = 'avatars' | 'venues' | 'fields' | 'payments';

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

export interface IFieldImage extends IEntityImage {
  fieldId: string;
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
  venue?: Pick<IVenue, 'id' | 'name' | 'location'>;
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

export interface IVenue {
  id: string;
  name: string;
  location: string;
  longitude: number;
  latitude: number;
  openTime: string;
  closeTime: string;
  restStartTime?: string;
  restEndTime?: string;
  description?: string;
  venueImages?: IVenueImage[];
  paymentAccounts?: IVenuePaymentAccount[];
  fields?: IField[];
  createdAt: string;
  updatedAt: string;
}

export interface IField {
  id: string;
  name: string;
  description: string;
  price: number;
  minDurationMinutes: number;
  durationStepMinutes: number;
  status: FieldStatus;
  fieldImages?: IFieldImage[];
  sportId: string;
  venueId: string;
  createdAt: string;
  updatedAt: string;
  sport?: ISport;
  venue?: IVenue;
}

export interface ITimeslot {
  id: string;
  startTime: string;
  endTime: string;
  createdAt: string;
}

export interface IBooking {
  id: string;
  userId: string;
  fieldId: string;
  timeslotId: string;
  date: string;
  status: BookingStatus;
  amount: number;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: Pick<IUser, 'id' | 'name' | 'email' | 'phone'>;
  field?: IField;
  timeslot?: ITimeslot;
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
  fieldId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface INotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
