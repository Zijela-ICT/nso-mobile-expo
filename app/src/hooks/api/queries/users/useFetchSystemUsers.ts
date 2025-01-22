import request from "@/utils/api";
import { QUERYKEYS } from "@/utils/query-keys";
import { useQuery } from "react-query";

type RoleResp = {
  id: number;
  name: string;
  users: number;
};

export type SystemUsersDataResponse = {
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
  roles: RoleResp[] | any;
};

type SystemUserResp = {
  success: boolean;
  message: string;
  data: {
    data: SystemUsersDataResponse[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export const FetchSystemUsers = async (
  page: number = 1,
  perPage: number = 10
): Promise<SystemUserResp> => {
  return request("GET", `/admin/users/system?page=${page}&limit=${perPage}`);
};

export const useFetchSystemUsers = (page: number = 1, perPage: number = 10) => {
  const queryKey = [QUERYKEYS.FETCHSYSTEMUSERS, page, perPage];
  return useQuery(queryKey, () => FetchSystemUsers(page, perPage), {
    retry: 1,
    keepPreviousData: true
  });
};
