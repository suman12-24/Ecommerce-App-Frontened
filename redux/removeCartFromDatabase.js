import { store } from './store';
import axiosInstance from '../Axios_BaseUrl_Token_SetUp/axiosInstance';

const API_URL = '/Suhani-Electronics-Backend/f_product_cart_del.php';

export const removeCartFromDatabase = async (id) => {
    const state = store.getState();
    const userId = state.auth.userId; // ✅ Get user ID from Redux state

    try {
        const response = await axiosInstance.delete(API_URL, {
            data: {
                u_id: userId,  // Ensure this user ID is dynamic if needed
                p_id: id
            }
        });

        console.log('Cart deleted from database successfully:', response.data);
    } catch (error) {
        console.error('Error deleting cart from database:', error.response?.data || error.message);
    }
};
