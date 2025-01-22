import request from '@/utils/api';
import {QUERYKEYS} from '@/utils/query-keys';
import {useQuery} from 'react-query';
import {PermissionsDataResponse} from './useFetchPermissions';

export type FetchEbooKDataResponse = {
  status: string;
  message: string;
  data: {
    id: number;
    version: number;
    status: string;
    fileUrl: string;
    approvedAt: string;
    createdAt: string;
  };
};

export const FetchEbooksUrl = async (
  url: string,
): Promise<FetchEbooKDataResponse> => {
  return request('GET', `/uploads/${url}`);
};
export const useFetchEbooks = (url: string) => {
  const queryKey = [QUERYKEYS.FETCHEBOOKS];
  return useQuery(queryKey, () => FetchEbooksUrl(url));
};
