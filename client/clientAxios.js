import axios from "axios";

export const baseURL = "http://localhost:3333";
// export const baseURL = "http://localhost:3333";

// ROOT URL
export const ssURL = "/smartschool";
export const webURL = "/web";
export const adminURL = "/admin";
export const bkkURL = "/bkk";
export const ppdbURL = "/ppdb";
export const btURL = "/buku-tamu";

export const axiosInstance = axios.create({
  baseURL,
  timeout: 0,
});
