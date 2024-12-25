import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { auth } from "../config/fireBase"



const loginState = {
    visibility: false
};

const loginSlice = createSlice({
    name: "login",
    initialState: loginState,
    reducers: {
        showLogin: (state) => {
            state.visibility = true
        },
        hideLogin: (state) => {
            state.visibility = false
        },
    }

});




export const { showLogin, hideLogin } = loginSlice.actions;
export default loginSlice.reducer;