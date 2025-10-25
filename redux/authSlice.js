import { createSlice } from '@reduxjs/toolkit';
import { clearCart } from './cartSlice'; // Import clearCart action
import { clearWishList } from './wishListSlice'; // Import clearWishList action

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        token: null,
        email: null,
        name: null,
        mobile: null,
        gender: null,
        userId: null,
    },
    reducers: {
        setAuth: (state, action) => {
            state.token = action.payload.token;
            state.email = action.payload.email;
            // Store additional user information
            state.name = action.payload.name || null;
            state.mobile = action.payload.mobile || null;
            state.gender = action.payload.gender || null;
            state.userId = action.payload.userId || null;
        },
        clearAuth: (state, action) => {
            state.token = null;
            state.email = null;
            state.name = null;
            state.mobile = null;
            state.gender = null;
            state.userId = null;
        },
    },
});

// Thunk action to handle logout and clear the cart
export const logoutAndClearCart = () => (dispatch) => {
    dispatch(authSlice.actions.clearAuth()); // Clear auth state
    dispatch(clearCart()); // Clear cart state
    dispatch(clearWishList()); // Clear wish list state
};

export const { setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;