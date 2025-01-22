import { AxiosError, AxiosResponse } from "axios";
import { useMutation } from "react-query";

import request from "@/utils/api";

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
  email: string;
};

type ErrorType = { error: string; success: boolean };

const InitiatePasswordReset = (input: InputType): Promise<ResponseType> => {
  return request(
    "POST",
    `/auth/password/reset`,
    {
      email: input.email
    },
    false
  );
};

const useInitiatePasswordReset = () => {
  return useMutation<ResponseType, AxiosError<ErrorType>, InputType>(
    (input: InputType) => InitiatePasswordReset(input)
  );
};

export { useInitiatePasswordReset };
