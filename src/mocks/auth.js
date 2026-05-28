import apiClient from "./apiClient";

class AuthApi {
  async register(data) {
    try {
      const res = await apiClient.post("/auth/register", data);
      console.log("Register Api Response", res);
      return res;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async login(data) {
    try {
      const res = await apiClient.post("/auth/login", data);
      console.log("Login Api Response", res);
      
      if (res?.data?.status === "SUCCESS") {
        if (typeof window !== "undefined") {
          localStorage.setItem("access Token", res?.data?.data?.token);
          localStorage.setItem("userId", res?.data?.data?.id);
        }
      }
      return res;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async forgetPassword(data) {
    try {
      const res = await apiClient.post("/auth/reset-password-otp", data);
      return res;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async resetPassword(data) {
    try {
      const res = await apiClient.put("/auth/reset-password", data);
      return res;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async logout(data) {
    try {
      const res = await apiClient.post("/auth/logout", data);
      return res;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async getMe() {
    try {
      const res = await apiClient.get("/auth/me");
      return res;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async updateProfile(data) {
    try {
      const res = await apiClient.put("/auth/profile", data);
      return res;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async changePassword(data) {
    try {
      const res = await apiClient.put("/auth/change-password", data);
      return res;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  // Admin only - Get all users
  async getAllUsers(params = {}) {
    try {
      return await apiClient.get("/auth/users", { params });
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  // Admin only - Update user status ('active', 'on-hold', 'blocked')
  async updateUserStatus(id, status) {
    try {
      return await apiClient.put(`/auth/users/${id}/status`, { status });
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  // Admin only - Update user role ('user', 'admin')
  async updateUserRole(id, role) {
    try {
      return await apiClient.put(`/auth/users/${id}/role`, { role });
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  // Admin only - Delete / terminate user account
  async deleteUser(id) {
    try {
      return await apiClient.delete(`/auth/users/${id}`);
    } catch (error) {
      console.error(error);
      return error;
    }
  }
}

export const authApi = new AuthApi();
