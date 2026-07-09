export type UserRole = 'admin' | 'staff' | 'user';
export type FieldStatus = 'active' | 'inactive' | 'maintenance';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';
export type PaymentMethod = 'credit_card' | 'cash' | 'bank_transfer';
export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface IUser {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string | null;
  role: UserRole;
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
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IField {
  id: string;
  name: string;
  description: string | null;
  price: number;
  status: FieldStatus;
  sportId: string;
  venueId: string;
  createdAt: string;
  updatedAt: string;
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
