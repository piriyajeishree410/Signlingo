const HOST = import.meta.env.VITE_BACKEND_HOST ?? "localhost";
const PORT = import.meta.env.VITE_BACKEND_PORT ?? "5000"; // ← make sure this matches your backend
const PREFIX = import.meta.env.VITE_API_PREFIX ?? "/api";
const API_BASE =
  import.meta.env.VITE_API_URL ?? `http://${HOST}:${PORT}${PREFIX}`;

// const API_BASE = import.meta.env.VITE_BACKEND_URL ?? "https://signlingo-hzlg.onrender.com/api";

// ⚠️ Dev only: remove once session cookies are working everywhere
const DEV_USER_ID =
  import.meta.env.VITE_DEV_USER_ID || "672c9b8f11a1e1d9b2efabc3";

// export async function getProfileOverview() {
//   const url = new URL(`${API_BASE}/profile/overview`);
//   if (DEV_USER_ID) url.searchParams.set("userId", DEV_USER_ID);
//   const res = await fetch(url.toString(), { credentials: "include" });
//   const json = await res.json().catch(() => ({}));
//   if (!res.ok || !json?.success)
//     throw new Error(json?.message || "Failed to load overview");
//   return json;
// }
export async function getProfileOverview(opts = {}) {
  const url = new URL(`${API_BASE}/profile/overview`);
  if (opts.userId) url.searchParams.set("userId", opts.userId); // dev fallback
  const res = await fetch(url.toString(), { credentials: "include" });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json?.success)
    throw new Error(json?.message || "Failed to load overview");
  return json;
}

export async function updateProfile(payload) {
  const url = new URL(`${API_BASE}/profile`);
  if (DEV_USER_ID) url.searchParams.set("userId", DEV_USER_ID);
  const res = await fetch(url.toString(), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json?.success)
    throw new Error(json?.message || "Update failed");
  return json;
}

export async function deleteProfile() {
  const url = new URL(`${API_BASE}/profile`);
  if (DEV_USER_ID) url.searchParams.set("userId", DEV_USER_ID);
  const res = await fetch(url.toString(), {
    method: "DELETE",
    credentials: "include",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json?.success)
    throw new Error(json?.message || "Delete failed");
  return json;
}
