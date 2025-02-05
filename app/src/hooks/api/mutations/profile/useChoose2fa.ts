import { AxiosError } from "axios";
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
    otpauth_url?: string;
  };
};

type InputType = {
  twoFaMethod: "email" | "app";
  userId?: number;
};

type ErrorType = { error: string; success: boolean };

const Update2faMethod = (input: InputType): Promise<ResponseType> => {
  return request(
    "PATCH",
    `/users/${input.userId}/2fa-auth`,
    {
      twoFaMethod: input.twoFaMethod
    },
    true,
    true
  );
};

const useUpdate2faMethod = () => {
  const queryClient = useQueryClient();
  return useMutation<ResponseType, AxiosError<ErrorType>, InputType>(
    (input: InputType) => Update2faMethod(input),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERYKEYS.FETCHPROFILE]
        });
      }
    }
  );
};

export { useUpdate2faMethod };
