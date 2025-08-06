import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Register User
export async function registerUserAPI(email, password) {
  const { data } = await api.post("/auth/register", { email, password });
  return data;
}

// Login User
export async function loginUserAPI(email, password) {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
}

// Google Login Redirect
export function googleLoginRedirect() {
  window.location.href = `${API_URL}/login/google`;
}

// Fetch Todos
export async function fetchTodosAPI(token, page = 1, limit = 3) {
  const res = await fetch(`${API_URL}/todos/?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

// Add Todo
export async function addTodoAPI(token, title, description) {
  const { data } = await api.post(
    "/todos/",
    { title, description },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
}

// Update Todo
export async function updateTodoAPI(token, id, title, description) {
  const { data } = await api.put(
    `/todos/${id}`,
    { title, description },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
}

// Delete Todo
export async function deleteTodoAPI(token, id) {
  const { data } = await api.delete(`/todos/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}
