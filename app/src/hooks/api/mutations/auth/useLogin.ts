import { AxiosError, AxiosResponse } from "axios";
import { useMutation } from "react-query";

import request from "../../../../utils/api";

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
  password: string;
  twoFAToken?: string;
};

type ErrorType = { error: string; success: boolean };

const Login = (input: InputType): Promise<ResponseType> => {
  return request(
    "POST",
    `/auth/login`,
    {
      email: input.email,
      password: input.password,
      twoFAToken: input.twoFAToken
    },
    false
  );
};

const useLogin = () => {
  return useMutation<ResponseType, AxiosError<ErrorType>, InputType>(
    (input: InputType) => Login(input)
  );
};

export { useLogin };
