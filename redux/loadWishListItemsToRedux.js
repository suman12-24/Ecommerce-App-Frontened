import { store } from './store';
import axiosInstance from '../Axios_BaseUrl_Token_SetUp/axiosInstance';
import { setWishList } from './wishListSlice'; // Import Redux action

const API_URL = '/Suhani-Electronics-Backend/f_wishlist_fetch.php';

export const loadWishListFromDatabase = async () => {
    try {
        const state = store.getState();
        const userId = state.auth.userId;
        const dispatch = store.dispatch;

        if (!userId) {
            console.error('User ID not found. Please log in.');
            return;
        }

        const payload = { u_id: userId };

        const response = await axiosInstance.post(API_URL, payload);

        if (response.data && response.data.success) {
            let wishList = response.data.wish_list;

            // ✅ Parse the wish_list string into an array
            if (typeof wishList === 'string') {
                try {
                    wishList = JSON.parse(wishList);
                } catch (error) {
                    console.error('Error parsing wishlist:', error);
                    wishList = [];
                }
            }

            // ✅ Ensure it's always an array
            if (!Array.isArray(wishList)) {
                wishList = [];
            }

            // ✅ Dispatch updated wishlist to Redux

            dispatch(setWishList(wishList));

            console.log('Wishlist loaded successfully:', wishList);
        } else {
            console.error('Failed to load wishlist:', response.data.message || 'Unknown error');
        }
    } catch (error) {
        console.error('Error loading wishlist from database:', error.response?.data || error.message);
    }
};
