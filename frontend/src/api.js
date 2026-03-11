const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000";

export const API_BASE = BASE_URL;
export const WS_BASE = WS_URL;

/**
 * Solve a math problem via the REST API.
 * @param {string} problem
 * @returns {Promise<{result?: string, error?: string}>}
 */
export async function solveMath(problem) {
  const res = await fetch(`${BASE_URL}/api/math`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ problem }),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

/**
 * Create a WebSocket connection for the chat.
 * @param {string} username
 * @returns {WebSocket}
 */
export function createChatSocket(username) {
  return new WebSocket(`${WS_BASE}/ws/${encodeURIComponent(username)}`);
}
