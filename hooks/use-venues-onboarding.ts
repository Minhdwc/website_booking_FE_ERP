'use client';

import { useCallback, useEffect, useRef } from 'react';
import { driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';

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
