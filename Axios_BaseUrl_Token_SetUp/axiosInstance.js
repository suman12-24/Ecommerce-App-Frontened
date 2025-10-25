import axios from 'axios';
import { store } from '../redux/store';

export const baseURL = 'https://fascinatetextiles.com';


const axiosInstance = axios.create({
    baseURL: baseURL,
});

// Define routes that don't require authentication
const noAuthRoutes = ['/customer_login.php'];

axiosInstance.interceptors.request.use(
    (config) => {
        try {
            const state = store.getState();
            const token = state.auth?.token; // ✅ Get token from Redux


            // Ensure headers exist
            config.headers = config.headers || {};

            // ✅ Extract only the path part (without baseURL)
            const relativePath = config.url.replace(baseURL, '');

            if (noAuthRoutes.includes(relativePath)) {
                delete config.headers.Authorization; // ✅ Remove Authorization for specific routes
            } else if (token) {
                config.headers.Authorization = `Bearer ${token}`; // ✅ Standard Bearer token format
            }
        } catch (error) {
            console.error('Error retrieving token from Redux store:', error);
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default axiosInstance;
