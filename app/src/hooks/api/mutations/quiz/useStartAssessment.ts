import { AxiosError } from "axios";
import { useMutation, useQueryClient } from "react-query";

import request from "@/utils/api";
import { QUERYKEYS } from "@/utils/query-keys";

type ResponseType = {
  status: string;
  message: string;
  data: {
    token: string;
    requirePasswordReset: boolean;
    roles: string[];
  };
};

type InputType = {
  id?: number;
};

type ErrorType = { error: string; success: boolean };

const StartAssessment = (input: InputType): Promise<ResponseType> => {
  return request(
    "PATCH",
    `/quizzes/my_assessments/${input.id}`,
    null,
    true,
    true
  );
};

const useStartAssessment = () => {
  const queryClient = useQueryClient();
  return useMutation<ResponseType, AxiosError<ErrorType>, InputType>(
    (input: InputType) => StartAssessment(input),
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(QUERYKEYS.FETCHMYASSESSMENTS);
        await queryClient.invalidateQueries(QUERYKEYS.FETCHASSESSMENT);
      }
    }
  );
};

export { useStartAssessment };
