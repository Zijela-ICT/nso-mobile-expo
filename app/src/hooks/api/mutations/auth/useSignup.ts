import {AxiosError, AxiosResponse} from 'axios';
import {useMutation} from 'react-query';

import request from '../../../../utils/api';

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
  regNumber: string;
  password: string;
  email: string;
  otp: string;
};

type ErrorType = {error: string; success: boolean};

const Signup = (input: InputType): Promise<ResponseType> => {
  return request(
    'POST',
    `/auth/signup`,
    {
      regNumber: input.regNumber,
      email: input.email,
      otp: input.otp,
      password: input.password,
    },
    true,
    true,
    'Sign up successful',
  );
};

const useSignup = () => {
  return useMutation<ResponseType, AxiosError<ErrorType>, InputType>(
    (input: InputType) => Signup(input),
  );
};

export {useSignup};
