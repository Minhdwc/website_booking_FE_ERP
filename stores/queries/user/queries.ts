'use client';

import { useQuery } from '@tanstack/react-query';

import { unwrapList } from '@/stores/api/response';
import { IUser } from '@/stores/api/types';
import { userService } from '@/stores/service/user.service';

import { userKeys, type UserListParams } from './keys';

const fetchUsers = async (params?: UserListParams): Promise<IUser[]> => {
  const response = await userService.getUsers({
    limit: params?.limit ?? '100',
    ...(params?.search ? { search: params.search } : {}),
    ...(params?.page ? { page: params.page } : {}),
  });
  return unwrapList(response.data);
};

export const useUsers = (params?: UserListParams) =>
  useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => fetchUsers(params),
  });
