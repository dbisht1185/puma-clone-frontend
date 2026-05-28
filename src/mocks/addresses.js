import apiClient from "./apiClient";

class AddressesApi {
  async getAddresses() {
    return apiClient.get("/addresses");
  }

  async createAddress(data) {
    return apiClient.post("/addresses", data);
  }

  async updateAddress(id, data) {
    return apiClient.put(`/addresses/${id}`, data);
  }

  async deleteAddress(id) {
    return apiClient.delete(`/addresses/${id}`);
  }
}

export const addressesApi = new AddressesApi();
