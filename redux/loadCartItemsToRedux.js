import { store } from './store';
import axiosInstance from '../Axios_BaseUrl_Token_SetUp/axiosInstance';
import { setCartItems } from './cartSlice'; // Import Redux action

const API_URL = '/Suhani-Electronics-Backend/f_fetch_cart.php';

export const loadCartProductToDatabase = async () => {
    try {
        const state = store.getState();
        const userId = state.auth.userId; // ✅ Get user ID from Redux
        const dispatch = store.dispatch; // ✅ Get dispatch correctly from store

        if (!userId) {
            console.error('User ID not found. Please log in.');
            return;
        }

        const payload = { u_id: userId };

        const response = await axiosInstance.post(API_URL, payload);

        if (response.data && response.data.success) {
            const updatedCartItems = response.data.data || []; // ✅ Ensure cart data exists

            // ✅ Dispatch updated cart items to Redux
            dispatch(setCartItems(updatedCartItems));

            console.log('Cart items loaded successfully:', updatedCartItems);
        } else {
            console.error('Failed to load cart items:', response.data.message || 'Unknown error');
        }
    } catch (error) {
        console.error('Error loading cart items from database:', error.response?.data || error.message);
    }
};
