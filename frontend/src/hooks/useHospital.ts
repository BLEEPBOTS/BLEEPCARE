import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Hospital {
  _id: string;
  hospitalCode: string;
  name: string;
  location: string;
  managerId: string | { _id: string; name: string; email: string };
  devices: string[];
  patients: string[];
  careGivers: string[];
  createdAt: string;
  updatedAt: string;
}

export type AdminHospital = Hospital;

export function useAllHospitals() {
  return useQuery({
    queryKey: ["hospitals"],
    queryFn: () => api.get<{ data: Hospital[] }>("/hospital/all"),
  });
}

export function useHospital(id: string) {
  return useQuery({
    queryKey: ["hospitals", id],
    queryFn: () =>
      api.get<{ data: Hospital }>(`/hospital?hospitalId=${id}`),
    enabled: !!id,
  });
}

export function useCreateHospital() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; location: string; managerId: string }) =>
      api.post<{ data: Hospital }>("/hospital", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospitals"] });
    },
  });
}
