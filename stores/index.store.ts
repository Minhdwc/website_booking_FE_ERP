'use client';

import { create } from 'zustand';
import type { BookingStatus } from '@/stores/api/types';

export type BookingStatusFilter = BookingStatus | 'all';

type ErpUiState = {
  fieldVenueFilter?: string;
  bookingSearch: string;
  bookingStatusFilter: BookingStatusFilter;
  paymentSearch: string;
  setFieldVenueFilter: (venueId?: string) => void;
  setBookingSearch: (value: string) => void;
  setBookingStatusFilter: (value: BookingStatusFilter) => void;
  setPaymentSearch: (value: string) => void;
  resetListFilters: () => void;
};

const initialFilters = {
  fieldVenueFilter: undefined as string | undefined,
  bookingSearch: '',
  bookingStatusFilter: 'all' as BookingStatusFilter,
  paymentSearch: '',
};

export const useErpUiStore = create<ErpUiState>((set) => ({
  ...initialFilters,
  setFieldVenueFilter: (fieldVenueFilter) => set({ fieldVenueFilter }),
  setBookingSearch: (bookingSearch) => set({ bookingSearch }),
  setBookingStatusFilter: (bookingStatusFilter) => set({ bookingStatusFilter }),
  setPaymentSearch: (paymentSearch) => set({ paymentSearch }),
  resetListFilters: () => set(initialFilters),
}));
