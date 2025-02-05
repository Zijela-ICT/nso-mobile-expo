import request from "@/utils/api";
import { QUERYKEYS } from "@/utils/query-keys";
import { useQuery } from "react-query";

type PermissionResponse = {
  id: number;
  permissionString: string;
};
type RoleResp = {
  id: number;
  name: string;
  permissions: PermissionResponse[];
};

type ProfileDataResponse = {
  id: number;
  regNumber: number;
  username: string | null;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  mobile: string;
  cadre: string;
  regExpiration: number | Date;
  isChprbnBlocked: boolean;
  isDeactivated: boolean;
  avatar: string | null;
  isEmailConfirmed: boolean;
  userType: string | null;
  twoFASecret: string | null;
  isSelfEnrolled: boolean;
  indexNumber?: string | number;
  isFirstLogin: boolean;
  twoFaMethod: "email" | "app" | null;
  isTwoFAEnabled: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  roles: RoleResp[];
};

type ProfileResp = {
  success: boolean;
  message: string;
  data: ProfileDataResponse;
};

export const FetchProfile = async (): Promise<ProfileResp> => {
  return request("GET", "/users/me", null, false, false);
};

export const useFetchProfile = () => {
  const queryKey = [QUERYKEYS.FETCHPROFILE];
  return useQuery(queryKey, () => FetchProfile(), {
    retry: 1
  });
};
