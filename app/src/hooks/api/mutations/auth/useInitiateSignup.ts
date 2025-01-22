import {AxiosError, AxiosResponse} from 'axios';
import {useMutation} from 'react-query';

import request from '../../../../utils/api';

type ResponseType = {
  status: string;
  message: string;
  data: {
    regNumber: string;
    email: string;
  };
};

type InputType = {
  regNumber: string | number | null;
};

type ErrorType = {error: string; success: boolean};

const InitiateSignup = (input: InputType): Promise<ResponseType> => {
  return request(
    'POST',
    `/auth/initiate-signup`,
    {
      regNumber: input.regNumber,
    },
    false,
  );
};

const useInitiateSignup = () => {
  return useMutation<ResponseType, AxiosError<ErrorType>, InputType>(
    (input: InputType) => InitiateSignup(input),
  );
};

export {useInitiateSignup};
