import { createSlice } from "@reduxjs/toolkit";

const registerSlice = createSlice({
    name: "register",
    initialState: {
        visibel: false,
    },
     reducers: {
        showRegister: (state) => {
            state.visibel = true
        },
        hideRegister: (state) => {
            state.visibel = false
        }
    }
})


export const { showRegister, hideRegister } = registerSlice.actions;
export default registerSlice.reducer;
