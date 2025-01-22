import { AxiosError, AxiosResponse } from "axios";
import { useMutation, useQueryClient } from "react-query";
import { QUERYKEYS } from "@/utils/query-keys";

import request from "@/utils/api";
import { permission } from "process";

type ResponseType = {
  success: boolean;
  data: string;
};

export type UpdateRoleInputType = {
  name?: string;
  permissions?: number[];
  id: number;
};

type ErrorType = { error: string; success: boolean };

const UpdateRole = (
  input: UpdateRoleInputType
): Promise<AxiosResponse<ResponseType>> => {
  return request(
    "PATCH",
    `/admin/roles/${input.id}`,
    {
      name: input.name,
      permissions: input.permissions
    },
    true
  );
};

const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation<
    AxiosResponse<ResponseType>,
    AxiosError<ErrorType>,
    UpdateRoleInputType
  >((input: UpdateRoleInputType) => UpdateRole(input), {
    onSuccess: async () => {
      await queryClient.invalidateQueries(QUERYKEYS.FETCHROLES);
      await queryClient.invalidateQueries(QUERYKEYS.FETCHPERMISSIONS);
    }
  });
};

export { useUpdateRole };
