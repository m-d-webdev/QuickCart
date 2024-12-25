import { createSlice } from "@reduxjs/toolkit";

const themeSlice = createSlice({
    name: "theme",
    initialState: { mode: localStorage.getItem("theme") ?? "light" },
    reducers: {
        toogleMode: (state) => {
            state.mode = state.mode == "light" ? 'dark' : "light";
            localStorage.getItem("theme") == "light" ? localStorage.setItem("theme", "dark") : localStorage.setItem("theme", "light")
        }
        ,
        setMode: (state, action) => {
            console.log(action.payload);

        }
    }
})

export const { toogleMode, setMode } = themeSlice.actions;
export default themeSlice.reducer;