import { Activity, Institution, Neighborhood } from "../types";

const headers = { "Content-Type": "application/json" };

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

export const api = {
  getInstitutions: () => request<Institution[]>("/api/institutions"),
  createInstitution: (payload: Partial<Institution>) =>
    request<Institution>("/api/institutions", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    }),
  updateInstitution: (id: string, payload: Partial<Institution>) =>
    request<Institution>(`/api/institutions/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    }),
  updateInstitutionStatus: (id: string, status: Institution["status"]) =>
    request<Institution>(`/api/institutions/${id}/status`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status }),
    }),
  getActivities: () => request<Activity[]>("/api/activities"),
  createActivity: (payload: Partial<Activity>) =>
    request<Activity>("/api/activities", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    }),
  updateActivity: (id: string, payload: Partial<Activity>) =>
    request<Activity>(`/api/activities/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    }),
  updateActivityStatus: (id: string, status: Activity["status"]) =>
    request<Activity>(`/api/activities/${id}/status`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status }),
    }),
  getNeighborhoods: () => request<Neighborhood[]>("/api/neighborhoods"),
};
