import {AxiosError} from 'axios';
import {useMutation} from 'react-query';
import request from '@/utils/api';

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
  twoFAToken?: string; // Made optional
};

type ErrorType = {error: string; success: boolean};

const ChangePassword = (input: InputType): Promise<ResponseType> => {
  return request(
    'PATCH',
    '/users/password-change',
    {
      oldPassword: input.oldPassword,
      newPassword: input.newPassword,
      ...(input.twoFAToken ? {twoFAToken: input.twoFAToken} : {}), // Add twoFAToken only if it exists
    },
    false,
  );
};

const useChangePassword = () => {
  return useMutation<ResponseType, AxiosError<ErrorType>, InputType>(
    (input: InputType) => ChangePassword(input),
  );
};

export {useChangePassword};
