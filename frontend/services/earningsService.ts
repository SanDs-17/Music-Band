import { api } from "./api";
import { EarningsSummary } from "@/types/earnings";

export const earningsService = {
  getEarningsSummary: async (): Promise<EarningsSummary> => {
    const response = await api.get<any>("/earnings/artist");
    return response.data.data;
  }
};
