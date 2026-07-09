import { IUser } from '@/stores/api/types';
import { userService } from '@/stores/service/user.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

type UseUsersProps = {
  id?: string;
};

export function useUsers({ id }: UseUsersProps = {}) {
  const queryClient = useQueryClient();

  const list = useQuery({
    queryKey: ['users'],
    queryFn: userService.getUsers,
    enabled: !id,
  });

  const detail = useQuery({
    queryKey: ['users', id],
    queryFn: () => userService.getUserById(id!),
    enabled: !!id,
  });

  const create = useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: { value: IUser } }) =>
      userService.updateUser(id, { value: body.value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const remove = useMutation({
    mutationFn: userService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return {
    list,
    detail,
    create,
    update,
    remove,
  };
}
