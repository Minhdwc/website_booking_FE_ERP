'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { CreateUserBody, UpdateUserBody, userService } from '@/stores/service/user.service';

import { userKeys } from './keys';

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateUserBody) => userService.createUser(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateUserBody }) =>
      userService.updateUser(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};
