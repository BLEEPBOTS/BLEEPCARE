import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Device {
  _id: string;
  deviceCode: string;
  serialNumber: string;
  hospital: string | { _id: string; name: string; location: string };
  patient: string | { _id: string; name: string } | null;
  careGiver: string | { _id: string; name: string; email: string } | null;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export function useAllDevices() {
  return useQuery({
    queryKey: ["devices"],
    queryFn: () => api.get<{ data: Device[] }>("/device/all"),
  });
}

export function useDevice(id: string) {
  return useQuery({
    queryKey: ["devices", id],
    queryFn: () => api.get<{ data: Device }>(`/device?deviceId=${id}`),
    enabled: !!id,
  });
}

export function useHospitalDevices(hospitalId: string) {
  return useQuery({
    queryKey: ["devices", "hospital", hospitalId],
    queryFn: () =>
      api.get<{ data: Device[] }>(`/device/hospital/${hospitalId}`),
    enabled: !!hospitalId,
  });
}

export function useCreateDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      serialNumber: string;
      hospital: string;
      patient?: string;
      careGiver?: string;
    }) => api.post<{ data: Device }>("/device", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
  });
}
