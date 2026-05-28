import axios from "axios";

// Create a unified Axios instance
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_HOST || "http://localhost:5000",
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// REQUEST INTERCEPTOR: Automatically inject JWT access tokens
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access Token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      // Fire loading start event
      window.dispatchEvent(
        new CustomEvent("axios-request-start", { detail: { method: config.method } })
      );
    }
    return config;
  },
  (error) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("axios-request-stop"));
    }
    return Promise.reject(error);
  }
);

// RESPONSE INTERCEPTOR: Globally handle success and error logs
apiClient.interceptors.response.use(
  (response) => {
    // Normal successful responses
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("axios-request-stop", { detail: { method: response.config?.method } })
      );
    }
    return response;
  },
  (error) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("axios-request-stop", { detail: { method: error.config?.method } })
      );
    }
    const errorResponse = error.response;
    
    // Log errors globally for developer insight
    console.error("API Error Encountered Globally:", {
      status: errorResponse?.status,
      message: errorResponse?.data?.message || error.message,
      url: error.config?.url,
      method: error.config?.method,
    });

    // Handle session expirations globally
    if (errorResponse?.status === 401) {
      console.warn("Session Expired or Unauthorized. Cleaning credentials...");
      if (typeof window !== "undefined") {
        // Only clear if logged in as user/admin to prevent routing loops during initialization
        const hasToken = localStorage.getItem("access Token");
        if (hasToken) {
          localStorage.removeItem("access Token");
          localStorage.removeItem("userId");
          localStorage.removeItem("userRole");
          localStorage.removeItem("userName");
          
          // Optionally reload or redirect if on admin panel
          if (window.location.pathname.startsWith("/admin") && window.location.pathname !== "/admin/login") {
            window.location.href = "/admin/login";
          }
        }
      }
    }

    // Return a standardized error format so controllers can parse it cleanly
    const normalizedError = {
      data: {
        status: "ERROR",
        message: errorResponse?.data?.message || "Something went wrong. Please try again later.",
      },
      status: errorResponse?.status || 500,
      originalError: error,
    };

    // Return this as a resolved object matching axios response shape or reject
    return Promise.resolve(normalizedError);
  }
);

export default apiClient;
