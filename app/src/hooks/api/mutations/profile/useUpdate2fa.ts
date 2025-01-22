import {AxiosError} from 'axios';
import {useMutation, useQueryClient} from 'react-query';

import request from '../../../../utils/api';
import {QUERYKEYS} from '@/utils/query-keys';

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
  type: 'enabled' | 'disabled';
};

type ErrorType = {error: string; success: boolean};

const Update2fa = (input: InputType): Promise<ResponseType> => {
  return request(
    'POST',
    input.type === 'enabled' ? `/users/enable-2fa` : `/users/disable-2fa`,
    null,
    true,
  );
};

const useUpdate2Fa = () => {
  const queryClient = useQueryClient();
  return useMutation<ResponseType, AxiosError<ErrorType>, InputType>(
    (input: InputType) => Update2fa(input),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERYKEYS.FETCHPROFILE],
        });
      },
    },
  );
};

export {useUpdate2Fa};
