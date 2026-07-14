'use client';

import { create } from 'zustand';

type ErpUiState = {
  venueSearch: string;
  fieldVenueFilter?: string;
  bookingSearch: string;
  paymentSearch: string;
  setVenueSearch: (value: string) => void;
  setFieldVenueFilter: (venueId?: string) => void;
  setBookingSearch: (value: string) => void;
  setPaymentSearch: (value: string) => void;
  resetListFilters: () => void;
};

const initialFilters = {
  venueSearch: '',
  fieldVenueFilter: undefined as string | undefined,
  bookingSearch: '',
  paymentSearch: '',
};

export const useErpUiStore = create<ErpUiState>((set) => ({
  ...initialFilters,
  setVenueSearch: (venueSearch) => set({ venueSearch }),
  setFieldVenueFilter: (fieldVenueFilter) => set({ fieldVenueFilter }),
  setBookingSearch: (bookingSearch) => set({ bookingSearch }),
  setPaymentSearch: (paymentSearch) => set({ paymentSearch }),
  resetListFilters: () => set(initialFilters),
}));
