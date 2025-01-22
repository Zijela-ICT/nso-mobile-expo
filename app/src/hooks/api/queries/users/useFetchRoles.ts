import request from "@/utils/api";
import { QUERYKEYS } from "@/utils/query-keys";
import { useQuery } from "react-query";

type RoleDataResponse = {
  id: number;
  name: string;
  users: number;
};

type RoleResp = {
  success: boolean;
  message: string;
  data: RoleDataResponse[];
};

export const FetchRoles = async (
  page: number = 1,
  perPage: number = 10
): Promise<RoleResp> => {
  return request("GET", `/admin/roles/?page=${page}&limit=${perPage}`);
};

export const useFetchRoles = (page: number = 1, perPage: number = 10) => {
  const queryKey = [QUERYKEYS.FETCHROLES, page, perPage];
  return useQuery(queryKey, () => FetchRoles(page, perPage), {
    retry: 1
  });
};
