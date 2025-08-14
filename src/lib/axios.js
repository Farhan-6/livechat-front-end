import axios from 'axios'

const axiosInstance = axios.create({
    baseURL : "https://livechat-back-end.vercel.app",
    withCredentials: true,
})



// const API_BASE_URL =
//   import.meta.env.MODE === "development"
//     ? "http://localhost:5000"
//     : "https://9eb5b15dae12.ngrok-free.app"; // backend ngrok URL

// const axiosInstance = axios.create({
//   baseURL: API_BASE_URL,
//   withCredentials: true,
// });

export default axiosInstance
