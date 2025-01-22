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
  oldPassword: string;
  newPassword: string;
};

type ErrorType = { error: string; success: boolean };

const PasswordChange = (input: InputType): Promise<ResponseType> => {
  return request(
    "PATCH",
    `/users/password-change`,
    {
      oldPassword: input.oldPassword,
      newPassword: input.newPassword
    },
    false
  );
};

const usePasswordChange = () => {
  return useMutation<ResponseType, AxiosError<ErrorType>, InputType>(
    (input: InputType) => PasswordChange(input)
  );
};

export { usePasswordChange };
