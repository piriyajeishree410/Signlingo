import { api } from "./client";

export const AuthAPI = {
  login: (payload) => api("/auth/login", { method: "POST", body: payload }),
  signup: (payload) => api("/auth/signup", { method: "POST", body: payload }),
};
