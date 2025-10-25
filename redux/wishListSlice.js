import { createSlice } from '@reduxjs/toolkit';

const wishListSlice = createSlice({
    name: 'wishList',
    initialState: [],
    reducers: {
        addToWishList: (state, action) => {
            if (Array.isArray(action.payload)) {
                action.payload.forEach(id => {
                    if (!state.includes(id)) {
                        state.push(id);
                    }
                });
            } else {
                if (!state.includes(action.payload)) {
                    state.push(action.payload);
                }
            }
        },
        removeFromWishList: (state, action) => {
            return state.filter(id => id !== action.payload);
        },
        clearWishList: () => [],
        setWishList: (_, action) => action.payload, // ✅ New reducer to set wishlist from database
    },
});

export const { addToWishList, removeFromWishList, clearWishList, setWishList } = wishListSlice.actions;
export default wishListSlice.reducer;
