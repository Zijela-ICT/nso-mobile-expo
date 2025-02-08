import request from "@/utils/api";
import { QUERYKEYS } from "@/utils/query-keys";
import { useQuery } from "react-query";
import { Book } from "../../../../../../types/book.types";

export type FetchEbookUrlDataResponse = {
  status: string;
  message: string;
  book: Book;
};

export const FetchEbookUrl = async (): Promise<FetchEbookUrlDataResponse> => {
  return request("GET", `/ebooks`);
};
export const useFetchEbookUrl = () => {
  const queryKey = [QUERYKEYS.FETCHEBOOKURL];
  return useQuery(queryKey, () => FetchEbookUrl());
};
