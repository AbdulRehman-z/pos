import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    searchQuery: "",
};

const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload;
        },
    },
});

export const { setSearchQuery } = appSlice.actions;
export default appSlice.reducer;
