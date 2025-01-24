import { AxiosError, AxiosResponse } from "axios";
import { useMutation } from "react-query";

import request from "@/utils/api";

type ResponseType = {
  success: boolean;
  data: string;
};

type InputType = {
  caseDescription: string;
  examResponses: {
    question: string;
    response: "yes" | "no";
  }[];
  chapterTitle: string;
  subChapterTitle: string;
  subSubChapterTitle?: string;
  matchingDiagnoses: any[];
  reason: string;
  patientId?: string;
  patientAge?: string | number;
};

type ErrorType = { error: string; success: boolean };

const CreateDecision = (
  input: InputType
): Promise<AxiosResponse<ResponseType>> => {
  return request(
    "POST",
    "/decisions",
    {
      decisionDetails: {
        caseDescription: input.caseDescription,
        examResponses: input.examResponses,
        chapterTitle: input.chapterTitle,
        subChapterTitle: input.subChapterTitle,
        subSubChapterTitle: input.subSubChapterTitle,
        matchingDiagnoses: input.matchingDiagnoses,
        reason: input.reason,
        patientId: input.patientId,
        patientAge: input.patientAge
      }
    },
    true
  );
};

const useCreateDecision = () => {
  return useMutation<
    AxiosResponse<ResponseType>,
    AxiosError<ErrorType>,
    InputType
  >((input: InputType) => CreateDecision(input));
};

export { useCreateDecision };
