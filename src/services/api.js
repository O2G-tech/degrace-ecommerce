import axios from "axios";

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://degrace-backend.onrender.com";
export const UPLOADS_URL = `${BACKEND_URL}/uploads`;

export const getImageUrl = (folder, image) => {
    if (!image) return "";
    if (image.startsWith("http://") || image.startsWith("https://")) return image;
    return `${UPLOADS_URL}/${folder}/${image}`;
};

const API = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true
});

API.interceptors.request.use((config) => {
    if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
        delete config.headers["content-type"];
        return config;
    }

    config.headers = {
        ...config.headers,
        "Content-Type": "application/json"
    };

    return config;
});

export default API;
