export const appName = import.meta.env.VITE_APP_NAME || "Frame";
export const backendUrl =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api/";
export const backendStaticUrl =
  import.meta.env.VITE_BACKEND_STATIC_URL || "http://localhost:3000";
export const allowRegistration =
  import.meta.env.VITE_ALLOW_REGISTRATION === "true" || false;
