export const appName = import.meta.env.VITE_APP_NAME || "Frame";
export const backendUrl =
  import.meta.env.VITE_BACKEND_URL || "https://frame.3.7.237.251.sslip.io/api/";
export const backendStaticUrl =
  import.meta.env.VITE_BACKEND_STATIC_URL ||
  "https://frame.3.7.237.251.sslip.io";
export const allowRegistration =
  import.meta.env.VITE_ALLOW_REGISTRATION === "true" || false;
export const frontendUrl =
  import.meta.env.VITE_FRONTEND_URL || "https://frame.3.7.237.251.sslip.io";
