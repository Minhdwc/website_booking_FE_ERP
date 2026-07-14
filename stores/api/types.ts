export type UserRole = 'admin' | 'staff' | 'super_staff' | 'user';
export type FieldStatus = 'active' | 'inactive' | 'maintenance';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentMethod = 'credit_card' | 'cash' | 'bank_transfer' | 'vnpay';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'completed';

export interface IUser {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string | null;
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
  images?: string[];
  fields?: IField[];
  createdAt: string;
  updatedAt: string;
}

export interface IField {
  id: string;
  name: string;
  description: string | null;
  price: number;
  status: FieldStatus;
  images: string[];
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
  updatedAt: string;
}

export interface IBooking {
  id: string;
  userId: string;
  fieldId: string;
  timeslotId: string;
  date: string;
  status: BookingStatus;
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
  createdAt: string;
  updatedAt: string;
}

export interface IReview {
  id: string;
  userId: string;
  fieldId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface INotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}
