import request from '@/utils/api';
import {QUERYKEYS} from '@/utils/query-keys';
import {useQuery} from 'react-query';
import {PermissionsDataResponse} from '../users/useFetchPermissions';

type FetchEbookUrlDataResponse = {
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

export const FetchEbook = async (
  fileUrl: string | undefined,
): Promise<FetchEbookUrlDataResponse> => {
  return request('GET', `/uploads/${fileUrl}`);
};
export const useFetchEbook = (fileUrl: string | undefined) => {
  const queryKey = [QUERYKEYS.FETCHEBOOKS];
  return useQuery(queryKey, () => FetchEbook(fileUrl), {
    enabled: !!fileUrl,
    retry: 1,
  });
};
