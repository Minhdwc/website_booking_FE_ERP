export type UserRole = 'admin' | 'staff' | 'user';
export type FieldStatus = 'active' | 'inactive' | 'maintenance';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';
export type PaymentMethod = 'credit_card' | 'cash' | 'bank_transfer';
export type PaymentStatus = 'pending' | 'completed' | 'failed';

export type Timestamped = {
  createdAt: string;
  updatedAt?: string;
};

export type User = Timestamped & {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
};

export type Sport = Timestamped & {
  id: string;
  name: string;
};

export type Venue = Timestamped & {
  id: string;
  name: string;
  location: string;
  description: string | null;
};

export type Field = Timestamped & {
  id: string;
  name: string;
  description: string | null;
  price: number;
  status: FieldStatus;
  sportId: string;
  venueId: string;
};

export type Timeslot = {
  id: string;
  startTime: string;
  endTime: string;
  createdAt: string;
};

export type Booking = {
  id: string;
  userId: string;
  fieldId: string;
  timeslotId: string;
  date: string;
  status: BookingStatus;
  createdAt: string;
};

export type Payment = {
  id: string;
  bookingId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
};

export type Review = {
  id: string;
  userId: string;
  fieldId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
};

export type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};
