import request from "@/utils/api";
import { QUERYKEYS } from "@/utils/query-keys";
import { useQuery } from "react-query";

export type PermissionsDataResponse = {
  id: number;
  permissionString: string;
};

export type PermissionResp = {
  success: boolean;
  message: string;
  data: {
    data: PermissionsDataResponse[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export const FetchPermissions = async (
  page: number = 1,
  perPage: number = 100
): Promise<PermissionResp> => {
  return request(
    "GET",
    `/admin/roles/permissions?page=${page}&limit=${perPage}`
  );
};

export const useFetchPermissions = (page: number = 1, perPage: number = 60) => {
  const queryKey = [QUERYKEYS.FETCHPERMISSIONS, , page, perPage];
  return useQuery(queryKey, () => FetchPermissions(page, perPage), {
    retry: 1
  });
};
