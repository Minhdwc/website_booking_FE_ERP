'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { driver, type DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';

import type { IVenue } from '@/stores/api/types';
import { venueService } from '@/stores/service/venue.service';

export const venueKeys = {
  all: ['venues'] as const,
};

export type CreateVenueInput = {
  name: string;
  location: string;
  longitude: number;
  latitude: number;
  openTime: string;
  closeTime: string;
  restStartTime?: string;
  restEndTime?: string;
  description?: string;
};

async function fetchVenues(): Promise<IVenue[]> {
  const response = await venueService.getVenues();
  return response.data;
}

export const useVenues = () => {
  const queryClient = useQueryClient();

  const listQuery = useQuery<IVenue[]>({
    queryKey: venueKeys.all,
    queryFn: fetchVenues,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateVenueInput) => venueService.createVenue(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: venueKeys.all });
    },
  });

  return {
    venues: listQuery.isSuccess ? listQuery.data : ([] as IVenue[]),
    isLoading: listQuery.isLoading,
    isSaving: createMutation.isPending,
    error: listQuery.isError
      ? listQuery.error instanceof Error
        ? listQuery.error.message
        : 'Không tải được danh sách cơ sở'
      : null,
    refetch: () => {
      void listQuery.refetch();
    },
    createVenue: (input: CreateVenueInput) => createMutation.mutateAsync(input),
  };
};

const ONBOARDING_STORAGE_KEY = 'erp:venues-onboarding-done';

export const isVenuesOnboardingDone = () => {
  if (typeof window === 'undefined') return true;
  return window.localStorage.getItem(ONBOARDING_STORAGE_KEY) === '1';
};

export const markVenuesOnboardingDone = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ONBOARDING_STORAGE_KEY, '1');
};

const buildOnboardingSteps = (): DriveStep[] => [
  {
    popover: {
      title: 'Bắt đầu từ cơ sở',
      description:
        'Cơ sở (venue) là bước đầu tiên. Sau khi có cơ sở, bạn mới tạo sân và nhận booking.',
    },
  },
  {
    element: '#venues-setup-empty',
    popover: {
      title: 'Chưa có cơ sở',
      description: 'Khi danh sách trống, khu vực này hướng dẫn tạo cơ sở đầu tiên.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#venues-create-btn',
    popover: {
      title: 'Tạo cơ sở đầu tiên',
      description: 'Bấm nút này để nhập tên và địa chỉ cơ sở.',
      side: 'left',
      align: 'start',
    },
  },
  {
    element: '#venues-setup-next',
    popover: {
      title: 'Bước tiếp theo',
      description: 'Sau khi có cơ sở, sang trang Sân để tạo sân gắn với cơ sở đó.',
      side: 'top',
      align: 'start',
    },
  },
];

type UseVenuesOnboardingOptions = {
  enabled: boolean;
};

export const useVenuesOnboarding = ({ enabled }: UseVenuesOnboardingOptions) => {
  const startedRef = useRef(false);
  const driverRef = useRef<ReturnType<typeof driver> | null>(null);
  const markOnDestroyRef = useRef(true);

  const startTour = useCallback(() => {
    markOnDestroyRef.current = true;
    driverRef.current?.destroy();

    const driverObj = driver({
      showProgress: true,
      animate: true,
      overlayOpacity: 0.55,
      stagePadding: 8,
      stageRadius: 12,
      nextBtnText: 'Tiếp',
      prevBtnText: 'Lùi',
      doneBtnText: 'Xong',
      progressText: '{{current}} / {{total}}',
      steps: buildOnboardingSteps(),
      onDestroyed: () => {
        if (markOnDestroyRef.current) markVenuesOnboardingDone();
        driverRef.current = null;
      },
    });

    driverRef.current = driverObj;
    driverObj.drive();
  }, []);

  useEffect(() => {
    if (!enabled || startedRef.current || isVenuesOnboardingDone()) return;

    startedRef.current = true;
    const timer = window.setTimeout(() => {
      startTour();
    }, 450);

    return () => {
      window.clearTimeout(timer);
    };
  }, [enabled, startTour]);

  useEffect(() => {
    return () => {
      markOnDestroyRef.current = false;
      driverRef.current?.destroy();
    };
  }, []);

  return { startTour };
};
