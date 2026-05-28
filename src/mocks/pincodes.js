import apiClient from "./apiClient";

export const pincodesApi = {
  // Public check endpoint
  checkPincode: (code) => {
    return apiClient.get(`/api/pincodes/check/${code}`);
  },

  // Admin endpoints
  getAllPincodes: () => {
    return apiClient.get("/pincodes");
  },

  createPincode: (data) => {
    return apiClient.post("/pincodes", data);
  },

  updatePincode: (id, data) => {
    return apiClient.put(`/pincodes/${id}`, data);
  },

  deletePincode: (id) => {
    return apiClient.delete(`/pincodes/${id}`);
  },
};
