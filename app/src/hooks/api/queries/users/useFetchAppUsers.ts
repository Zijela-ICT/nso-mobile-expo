import request from "@/utils/api";
import { QUERYKEYS } from "@/utils/query-keys";
import { useQuery } from "react-query";

type RoleResp = {
  id: number;
  name: string;
  users: number;
};

type AppUsersDataResponse = {
  id: number;
  regNumber: number;
  username: string | null;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  mobile: string;
  cadre: string;
  regExpiration: string | null;
  isChprbnBlocked: boolean;
  isDeactivated: boolean;
  avatar: string | null;
  isEmailConfirmed: boolean;
  userType: string | null;
  twoFASecret: string | null;
  isFirstLogin: boolean;
  twoFaMethod: string | null;
  isTwoFAEnabled: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  roles: RoleResp[];
};

type AppUserResp = {
  success: boolean;
  message: string;
  data: {
    data: AppUsersDataResponse[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export const FetchAppUsers = async (
  page: number = 1,
  perPage: number = 10
): Promise<AppUserResp> => {
  return request("GET", `/admin/users/app?page=${page}&limit=${perPage}`);
};

export const useFetchAppUsers = (page: number = 1, perPage: number = 10) => {
  const queryKey = [QUERYKEYS.FETCHAPPUSERS, page, perPage];
  return useQuery(queryKey, () => FetchAppUsers(page, perPage), {
    retry: 1,
    keepPreviousData: true
  });
};
