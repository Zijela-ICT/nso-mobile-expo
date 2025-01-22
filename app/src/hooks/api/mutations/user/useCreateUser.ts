import { AxiosError, AxiosResponse } from "axios";
import { useMutation, useQueryClient } from "react-query";
import { QUERYKEYS } from "@/utils/query-keys";

import request from "@/utils/api";

type ResponseType = {
  success: boolean;
  data: string;
};

type InputType = {
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  role: string[] | any;
};

type ErrorType = { error: string; success: boolean };

const CreateUser = (input: InputType): Promise<AxiosResponse<ResponseType>> => {
  return request(
    "POST",
    `/admin/users`,
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

const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation<
    AxiosResponse<ResponseType>,
    AxiosError<ErrorType>,
    InputType
  >((input: InputType) => CreateUser(input), {
    onSuccess: async () => {
      await queryClient.invalidateQueries(QUERYKEYS.FETCHAPPUSERS);
      await queryClient.invalidateQueries(QUERYKEYS.FETCHSYSTEMUSERS);
    }
  });
};

export { useCreateUser };
