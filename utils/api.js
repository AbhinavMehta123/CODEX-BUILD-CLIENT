import axios from "axios";
// api link

const API = axios.create({
  baseURL: "https://codex-build-backend.onrender.com", 
});

export default API;
