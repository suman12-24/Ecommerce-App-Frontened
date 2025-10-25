// redux/firstLaunchSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isFirstLaunch: true
};

const firstLaunchSlice = createSlice({
    name: 'firstLaunch',
    initialState,
    reducers: {
        setFirstLaunchComplete: (state) => {
            state.isFirstLaunch = false;
        }
    }
});

export const { setFirstLaunchComplete } = firstLaunchSlice.actions;
export default firstLaunchSlice.reducer;