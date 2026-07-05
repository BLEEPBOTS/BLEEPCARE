import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface DeviceLog {
  _id: string;
  deviceId: { _id: string; serialNumber: string; deviceCode: string } | null;
  event: "vitals" | "alert";
  resolved?: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  data: {
    deviceSn?: string;
    eventType?: "FALL" | "COLLISION" | "SOS" | "THRESHOLD" | "VITALS";
    ts?: string;
    hr?: number;
    spo2?: number;
    temp?: number;
    lat?: number;
    lng?: number;
    gps_ok?: boolean;
    fallScore?: number;
    collScore?: number;
    motion?: "IDLE" | "GESTURE" | "FALL" | "COLLISION";
    bat?: number;
    sig?: number;
    sos?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export function useAlerts(hospitalId: string, page = 1) {
  return useQuery({
    queryKey: ["alerts", hospitalId, page],
    queryFn: () =>
      api.get<PaginatedResponse<DeviceLog>>(
        `/device-logs/alerts/${hospitalId}?page=${page}&limit=20`,
      ),
    enabled: !!hospitalId,
  });
}

export function useDeviceLogs(page = 1) {
  return useQuery({
    queryKey: ["device-logs", page],
    queryFn: () =>
      api.get<PaginatedResponse<DeviceLog>>(
        `/device-logs?page=${page}&limit=20`,
      ),
  });
}

export function useLatestVitals(deviceIds: string[]) {
  return useQuery({
    queryKey: ["vitals", "latest", deviceIds],
    queryFn: () =>
      api.post<{ data: DeviceLog[] }>("/device-logs/vitals/latest", {
        deviceIds,
      }),
    enabled: deviceIds.length > 0,
  });
}

export function useUnresolvedAlerts(deviceIds: string[]) {
  return useQuery({
    queryKey: ["alerts", "unresolved", deviceIds],
    queryFn: () =>
      api.post<{ data: DeviceLog[] }>("/device-logs/alerts/unresolved", {
        deviceIds,
      }),
    enabled: deviceIds.length > 0,
  });
}

export function useDeviceAlerts(deviceIds: string[], page = 1) {
  return useQuery({
    queryKey: ["alerts", "device-ids", deviceIds, page],
    queryFn: () =>
      api.post<PaginatedResponse<DeviceLog>>("/device-logs/alerts/query", {
        deviceIds,
        page,
        limit: 20,
      }),
    enabled: deviceIds.length > 0,
  });
}

export function useFilteredLogs(deviceIds: string[], page = 1) {
  return useQuery({
    queryKey: ["device-logs", "filtered", deviceIds, page],
    queryFn: () =>
      api.post<PaginatedResponse<DeviceLog>>("/device-logs/query", {
        deviceIds,
        page,
        limit: 20,
      }),
    enabled: deviceIds.length > 0,
  });
}

export function useLatestLogsForDevices(deviceIds: string[]) {
  return useQuery({
    queryKey: ["device-logs", "latest-for-devices", deviceIds],
    queryFn: () =>
      api.post<{ data: DeviceLog[] }>("/device-logs/latest", { deviceIds }),
    enabled: deviceIds.length > 0,
  });
}

export function useLatestLocations(deviceIds: string[]) {
  return useQuery({
    queryKey: ["device-logs", "latest-locations", deviceIds],
    queryFn: async () => {
      const res = await api.post<PaginatedResponse<DeviceLog>>("/device-logs/query", {
        deviceIds,
        page: 1,
        limit: 100,
      });

      const map = new Map<string, { lat: number; lng: number }>();

      for (const log of res.data) {
        const devId = log.deviceId?._id;
        if (!devId) continue;
        if (map.has(devId)) continue;
        const lat = log.data?.lat;
        const lng = log.data?.lng;
        if (lat != null && lng != null && lat !== 0 && lng !== 0) {
          map.set(devId, { lat, lng });
        }
      }

      return map;
    },
    enabled: deviceIds.length > 0,
    refetchInterval: 30_000,
  });
}

export function useResolveAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      logId,
      resolvedBy,
    }: {
      logId: string;
      resolvedBy: string;
    }) => api.patch<{ data: DeviceLog }>(`/device-logs/${logId}/resolve`, { resolvedBy }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}
