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
  isCompleted: boolean;
  quizId: number;
};

type ErrorType = { error: string; success: boolean };

const SubmitAssessment = (input: InputType): Promise<ResponseType> => {
  return request(
    "POST",
    `/quizzes/my_assessments/${input.id}?isComplete=${input.isCompleted}`,
    {
      submission: [
        {
          quizId: input.quizId,
          questions: [
            { questionId: 2, selectedOption: "option1" },
            { questionId: 1, selectedOption: "option4" }
          ]
        }
      ]
    },
    true,
    true
  );
};

const useSubmitAssessment = () => {
  const queryClient = useQueryClient();
  return useMutation<ResponseType, AxiosError<ErrorType>, InputType>(
    (input: InputType) => SubmitAssessment(input),
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(QUERYKEYS.FETCHMYASSESSMENTS);
        await queryClient.invalidateQueries(QUERYKEYS.FETCHASSESSMENT);
      }
    }
  );
};

export { useSubmitAssessment };
