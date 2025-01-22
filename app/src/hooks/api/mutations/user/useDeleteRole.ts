import {AxiosError} from "axios";
import {useMutation, useQueryClient} from "react-query";
import request from "@/utils/api";
import {QUERYKEYS} from "@/utils/query-keys";

type ResponseType = {
  success: boolean;
  data: string;
};

type ErrorType = {error: string; success: boolean};

const DeleteRole = (params: {id: number}): Promise<ResponseType> => {
  return request("DELETE", `/admin/roles/${params.id}`, null, true, true, "Role deleted successfully");
};

const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, AxiosError<ErrorType>, {id: number}>(
    (params) => DeleteRole(params),
    {
      onSuccess: () => {
        // Invalidate teams query to refetch the list
        queryClient.invalidateQueries(QUERYKEYS.FETCHROLES);
      },
    },
  );
};

export {useDeleteRole};
