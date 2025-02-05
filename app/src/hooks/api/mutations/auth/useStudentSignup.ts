import { AxiosError, AxiosResponse } from "axios";
import { useMutation } from "react-query";

import request from "../../../../utils/api";

type ResponseType = {
  status: string;
  message: string;
  data: {
    regNumber: string;
    email: string;
  };
};

type InputType = {
  indexNumber: string| undefined;
  firstName: string | undefined;
  lastName: string | undefined;
  email: string | undefined;
  cadre: string | undefined;
  otp?: string | undefined;
  password: string | undefined;
};

type ErrorType = { error: string; success: boolean };

const StudentSignup = (input: InputType): Promise<ResponseType> => {
  return request(
    "POST",
    `/auth/students_signup`,
    {
      indexNumber: input.indexNumber,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      cadre: input.cadre,
      otp: input.otp,
      password: input.password
    },
    false
  );
};

const useStudentSignup = () => {
  return useMutation<ResponseType, AxiosError<ErrorType>, InputType>(
    (input: InputType) => StudentSignup(input)
  );
};

export { useStudentSignup };
