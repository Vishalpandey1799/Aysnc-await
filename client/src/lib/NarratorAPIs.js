import axios from "axios";

export const narratorAPI = axios.create({
    baseURL: "http://localhost:0808/",
})