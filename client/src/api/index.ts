import axios from "axios";

// export const api = axios.create({
//   baseURL: "http://localhost:8000/api",
//   headers: { "Content-Type": "application/json" },
// });

export const api = axios.create({
  baseURL: "https://chat-app-team-pumpkin-server.vercel.app/",
  headers: { "Content-Type": "application/json" },
});
