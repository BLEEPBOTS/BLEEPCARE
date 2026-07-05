import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Hospital } from "./useHospital";

export interface CareGiver {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: string;
}

export function useHospitalCaregivers(hospitalId: string) {
  return useQuery({
    queryKey: ["hospitals", hospitalId, "caregivers"],
    queryFn: async () => {
      const res = await api.get<{ data: Hospital }>(
        `/hospital?hospitalId=${hospitalId}`,
      );
      return res.data.careGivers as CareGiver[];
    },
    enabled: !!hospitalId,
  });
}

export function useAddCareGiver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { hospitalId: string; careGiverId: string }) =>
      api.post<{ data: Hospital }>("/hospital/addCareGiver", body),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["hospitals", vars.hospitalId, "caregivers"],
      });
      queryClient.invalidateQueries({
        queryKey: ["hospitals", vars.hospitalId],
      });
    },
  });
}
