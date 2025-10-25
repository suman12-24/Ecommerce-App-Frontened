import { store } from './store';
import axiosInstance from '../Axios_BaseUrl_Token_SetUp/axiosInstance';

const API_URL = '/Suhani-Electronics-Backend/f_product_cart.php';

export const addCartToDatabase = async (id) => {
    try {
        const state = store.getState();
        const cartData = state.cart.items;
        const userId = state.auth.userId; // ✅ Get user ID from Redux state

        if (!userId) {
            console.error('User ID not found in Redux state.');
            return;
        }

        const itemToBeUpdated = cartData.find(item => item.id == id);
        if (!itemToBeUpdated) {
            console.log('Item not found in cart.');
            return;
        }

        const payload = {
            u_id: userId, // ✅ Use the retrieved user ID
            p_id: itemToBeUpdated.id,
            p_name: itemToBeUpdated.name,
            quentity: itemToBeUpdated.quantity,
        };

        if (cartData.length === 0) {
            console.log('Cart is empty. Nothing to store.');
            return;
        }

        const response = await axiosInstance.post(API_URL, payload);
        console.log('Cart saved successfully:', response.data);
    } catch (error) {
        console.error('Error saving cart to database:', error);
    }
};
