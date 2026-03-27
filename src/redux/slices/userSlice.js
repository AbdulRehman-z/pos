import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    _id: "default-admin",
    name: "Admin User",
    email: "admin@pos.com",
    phone: "0000000000",
    role: "Admin",
    isAuth: true
}

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action) => {
            const { _id, name, phone, email, role } = action.payload;
            state._id = _id;
            state.name = name;
            state.phone = phone;
            state.email = email;
            state.role = role;
            state.isAuth = true;
        },

        removeUser: (state) => {
            state._id = "default-admin";
            state.email = "admin@pos.com";
            state.name = "Admin User";
            state.phone = "0000000000";
            state.role = "Admin";
            state.isAuth = true;
        }
    }
})

export const { setUser, removeUser } = userSlice.actions;
export default userSlice.reducer;