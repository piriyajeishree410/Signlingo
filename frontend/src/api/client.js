const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

/** Minimal fetch wrapper, backend-ready */
export async function api(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include", // supports cookie sessions later
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error(data?.message || `Request failed: ${res.status}`);
  return data;
}
