import { store } from './store';
import axiosInstance from '../Axios_BaseUrl_Token_SetUp/axiosInstance';
import { removeFromWishList } from './wishListSlice'; // Import Redux action

const API_URL = '/Suhani-Electronics-Backend/f_wishlist_delete.php';

export const deleteWishListItemFromDatabase = async (productId) => {
    try {
        const state = store.getState();
        const userId = state.auth.userId;
        const dispatch = store.dispatch;

        if (!userId) {
            console.error('User ID not found. Please log in.');
            return;
        }

        const payload = { u_id: userId, p_id: productId };

        const response = await axiosInstance.post(API_URL, payload);

        if (response.data && response.data.success) {
            // ✅ Remove item from Redux wishlist
            dispatch(removeFromWishList(productId));

            console.log(`Product ID ${productId} removed from wishlist successfully.`);
        } else {
            console.error('Failed to remove item from wishlist:', response.data.message || 'Unknown error');
        }
    } catch (error) {
        console.error('Error deleting wishlist item from database:', error.response?.data || error.message);
    }
};
