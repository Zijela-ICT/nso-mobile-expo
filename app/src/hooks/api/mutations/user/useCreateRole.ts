import { AxiosError, AxiosResponse } from "axios";
import { useMutation, useQueryClient } from "react-query";
import { QUERYKEYS } from "@/utils/query-keys";

import request from "@/utils/api";

type ResponseType = {
  success: boolean;
  data: string;
};

type InputType = {
  name: string;
  permissions: number[];
};

type ErrorType = { error: string; success: boolean };

const CreateRole = (input: InputType): Promise<AxiosResponse<ResponseType>> => {
  return request(
    "POST",
    `/admin/roles`,
    {
      name: input.name,
      permissions: input.permissions
    },
    true
  );
};

const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation<
    AxiosResponse<ResponseType>,
    AxiosError<ErrorType>,
    InputType
  >((input: InputType) => CreateRole(input), {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERYKEYS.FETCHROLES]
      });
    }
  });
};

export { useCreateRole };
