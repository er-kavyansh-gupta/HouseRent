import axios from 'axios';

// Create an Axios instance with base URL
const API = axios.create({
    baseURL: 'http://localhost:5000/api', // adjust if your backend runs on a different port
});

// Interceptor to add JWT token to requests if available
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const registerUser = (userData) => API.post('/auth/register', userData);
export const loginUser = (userData) => API.post('/auth/login', userData);
export const getProfile = () => API.get('/auth/profile');

export const getProperties = () => API.get('/properties');
export const getPropertyById = (id) => API.get(`/properties/${id}`);
export const addProperty = (propertyData) => API.post('/properties', propertyData);
export const updateProperty = (id, propertyData) => API.put(`/properties/${id}`, propertyData);
export const deleteProperty = (id) => API.delete(`/properties/${id}`);

export const createBooking = (bookingData) => API.post('/bookings', bookingData);
export const getMyBookings = () => API.get('/bookings/mybookings');
export const getOwnerBookings = () => API.get('/bookings/ownerbookings');
export const getBookings = () => API.get('/bookings');
export const updateBookingStatus = (id, statusData) => API.put(`/bookings/${id}/status`, statusData);

export default API;
