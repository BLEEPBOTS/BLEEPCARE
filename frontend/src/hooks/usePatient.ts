import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Patient {
  _id: string;
  patientCode: string;
  name: string;
  diagnosis: string;
  dateOfBirth: string;
  device: { _id: string; serialNumber: string; deviceCode: string; status: string };
  hospital: string;
  careGiver: { _id: string; name: string; email: string; role: string };
  createdAt: string;
  updatedAt: string;
}

export function useHospitalPatients(hospitalId: string) {
  return useQuery({
    queryKey: ["hospitals", hospitalId, "patients"],
    queryFn: () =>
      api.post<{ data: Patient[] }>("/patient/query", { hospitalId }),
    enabled: !!hospitalId,
  });
}

export function usePatient(patientId: string) {
  return useQuery({
    queryKey: ["patients", patientId],
    queryFn: () =>
      api.get<{ data: Patient }>(`/patient?patientId=${patientId}`),
    enabled: !!patientId,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name: string;
      diagnosis: string;
      dateOfBirth: string;
      device: string;
      hospital: string;
      careGiver: string;
    }) => api.post<{ data: Patient }>("/patient", body),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["hospitals", vars.hospital, "patients"],
      });
      queryClient.invalidateQueries({
        queryKey: ["hospitals", vars.hospital],
      });
    },
  });
}
