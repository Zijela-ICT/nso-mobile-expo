import request from '@/utils/api';
import {QUERYKEYS} from '@/utils/query-keys';
import {useQuery} from 'react-query';
import {PermissionsDataResponse} from './useFetchPermissions';

export type RoleDataResponse = {
  description?: string;
  id: number;
  name: string;
};

type RoleResp = {
  success: boolean;
  message: string;
  data: {
    id: number;
    name: string;
    permissions: PermissionsDataResponse[];
    users: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    }[];
  };
};

export const FetchEbooks = async (): Promise<RoleResp> => {
  return request('GET', `/admin/ebooks`);
};
export const useFetchEbooks = () => {
  const queryKey = [QUERYKEYS.FETCHEBOOKS];
  return useQuery(queryKey, () => FetchEbooks());
};
