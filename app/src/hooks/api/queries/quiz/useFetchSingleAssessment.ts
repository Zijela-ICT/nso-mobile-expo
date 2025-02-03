import request from "@/utils/api";
import { QUERYKEYS } from "@/utils/query-keys";
import { useQuery } from "react-query";

type Question = {
  id: number;
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correctOption: string;
  createdAt: string;
  updatedAt: string;
};

type AssessmentDataResponse = {
  id: number;
  startDate: string;
  endDate: string;
  duration: number;
  isOpen: boolean;
  createdAt: string;
  updatedAt: string;
  quizzes: {
    id: number;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    questions: Question[];
  };
};

type AssessmentResp = {
  success: boolean;
  message: string;
  data: {
    data: AssessmentDataResponse;
    totalCount: number;
    currentPage: number;
    totalPages: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export const FetchSingleAssessment = async (
  id: number
): Promise<AssessmentResp> => {
  return request("GET", `/quizzes/my_assessments/${id}`);
};

export const useFetchSingleAssessment = (id: number) => {
  const queryKey = [QUERYKEYS.FETCHASSESSMENT, id];

  return useQuery(queryKey, () => FetchSingleAssessment(id), {
    enabled: !!id,
    retry: 1,
    keepPreviousData: true
  });
};
