import { AxiosError, AxiosResponse } from "axios";
import { useMutation, useQueryClient } from "react-query";

import request from "@/utils/api";
import { QUERYKEYS } from "@/utils/query-keys";

type ResponseType = {
  status: string;
  message: string;
  data: {
    token: string;
    requirePasswordReset: boolean;
    roles: string[];
  };
};

type InputType = {
  id: number;
};

type ErrorType = { error: string; success: boolean };

const ResetPassword = (input: InputType): Promise<ResponseType> => {
  return request(
    "PATCH",
    `/admin/users/${input.id}/reset-password`,
    null,
    true
  );
};

const useResetPassword = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, AxiosError<ErrorType>, InputType>(
    (input: InputType) => ResetPassword(input),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERYKEYS.FETCHSYSTEMUSERS]
        });
      }
    }
  );
};

export { useResetPassword };
