import { AxiosError } from "axios";
import { useMutation, useQueryClient } from "react-query";

import request from "@/utils/api";
import { QUERYKEYS } from "@/utils/query-keys";

type ResponseType = {
  status: string;
  message: string;
  data: string;
};

type InputType = {
  email: string;
  password: string;
  backupCode: string;
};

type ErrorType = { error: string; success: boolean };

const TwoFaRollback = (input: InputType): Promise<ResponseType> => {
  return request(
    "PATCH",
    `/auth/2fa_rollback`,
    {
      email: input.email,
      password: input.password,
      backupCode: input.backupCode
    },
    true,
    true
  );
};

const useTwoFaRollback = () => {
  const queryClient = useQueryClient();
  return useMutation<ResponseType, AxiosError<ErrorType>, InputType>(
    (input: InputType) => TwoFaRollback(input),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERYKEYS.FETCHPROFILE]
        });
      }
    }
  );
};

export { useTwoFaRollback };
