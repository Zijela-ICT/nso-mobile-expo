import request from "@/utils/api";
import { QUERYKEYS } from "@/utils/query-keys";
import { useQuery } from "react-query";

export type FacilitiesDataResponse = {
  id: number;
  name: string;
  type: string;
  location: string;
  status: string | null;
  careLevel: "primary" | "secondary" | "tertiary";
  longitude: string;
  latitude: string;
  createdAt: string;
  updatedAt: string;
  contact: string;
};

type FacilitesResp = {
  success: boolean;
  message: string;
  data: {
    data: FacilitiesDataResponse[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export const FetchFacilities = async (
  page: number = 1,
  perPage: number = 10
): Promise<FacilitesResp> => {
  return request("GET", `/facilities?page=${page}&limit=${perPage}`);
};

export const useFetchFacilities = (page: number = 1, perPage: number = 10) => {
  const queryKey = [QUERYKEYS.FETCHFACILITIES, page, perPage];
  return useQuery(queryKey, () => FetchFacilities(page, perPage), {
    retry: 1,
    keepPreviousData: true
  });
};
