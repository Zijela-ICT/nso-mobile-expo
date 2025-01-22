import { AxiosError, AxiosResponse } from "axios";
import { useMutation, useQueryClient } from "react-query";
import { QUERYKEYS } from "@/utils/query-keys";

import request from "@/utils/api";

type ResponseType = {
  success: boolean;
  data: string;
};

export type InputType = {
  first_name?: string;
  last_name?: string;
  email?: string;
  mobile?: string;
  role?: string[] | any;
  id: number;
};

type ErrorType = { error: string; success: boolean };

const UpdateUser = (
  input: InputType | any
): Promise<AxiosResponse<ResponseType>> => {
  return request(
    "PATCH",
    `/admin/users/${input.id}`,
    {
      firstName: input.first_name,
      lastName: input.last_name,
      email: input.email,
      mobile: input.mobile,
      roles: input.role
    },
    true
  );
};

const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation<
    AxiosResponse<ResponseType>,
    AxiosError<ErrorType>,
    InputType
  >((input: InputType) => UpdateUser(input), {
    onSuccess: async () => {
      await queryClient.invalidateQueries(QUERYKEYS.FETCHAPPUSERS);
      await queryClient.invalidateQueries(QUERYKEYS.FETCHSYSTEMUSERS);
    }
  });
};

export { useUpdateUser };
