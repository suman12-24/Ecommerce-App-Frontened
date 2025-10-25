import { store } from './store';
import axiosInstance from '../Axios_BaseUrl_Token_SetUp/axiosInstance';

const API_URL = '/Suhani-Electronics-Backend/f_wishlist.php';

export const addWishListToDatabase = async (id) => {
    try {
        const state = store.getState();
        const wishList = state.wishList; // ✅ Now wishlist is an array of IDs
        const userId = state.auth.userId; // ✅ Get user ID from Redux state

        if (!userId) {
            console.error('User ID not found in Redux state.');
            return;
        }

        if (!wishList.includes(id)) {
            console.log('Item not found in WishList.');
            return;
        }

        const payload = {
            u_id: userId,
            p_id: id, // ✅ Sending only product ID
        };

        const response = await axiosInstance.post(API_URL, payload);
        console.log('Wish List saved successfully:', response.data);
    } catch (error) {
        console.error('Error saving wish list to database:', error);
    }
};
