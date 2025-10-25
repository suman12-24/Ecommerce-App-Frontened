// redux/slices/languageSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    currentLanguage: 'en',
};

const languageSlice = createSlice({
    name: 'language',
    initialState,
    reducers: {
        setCurrentLanguage: (state, action) => {
            state.currentLanguage = action.payload;
        },
    },
});

export const { setCurrentLanguage } = languageSlice.actions;
export default languageSlice.reducer;