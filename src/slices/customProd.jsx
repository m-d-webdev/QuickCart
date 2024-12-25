import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from "./fetchProdSlice"
export const GetCustomProds = createAsyncThunk(
    "CustomProds/GetCustomProds",
    async (arrayProds, { rejectWithValue, getState, dispatch }) => {
        try {
            const result = [];
            for (let i = 0; i < arrayProds.length; i++) {
                const element = arrayProds[i];
                const elmenetId = element.prodId || element.id
                const response = await api.get("/products/" + elmenetId)
                result.push({
                    ...response.data, ...element
                });
            }
            return result;
        } catch (error) {
            console.log(error);
            return rejectWithValue()
        }
    }
)



const CustomProdsSlice = createSlice({
    name: "CustomProds",
    initialState: {
        isLoaddingCustomProds: true,
        CustomProds: []
    },
    reducers: {
        increaseCquantity: (state, action) => {
            state.CustomProds = state.CustomProds.map(p => {
                const elmenetId = p.prodId || p.id;
                return elmenetId == action.payload.id ? { ...p, quantity: p.quantity + 1 } : p
            })
        },
        decreaseCquantity: (state, action) => {
            state.CustomProds = state.CustomProds.map(p => {
                const elmenetId = p.prodId || p.id;
                return elmenetId == action.payload.id ? { ...p, quantity: p.quantity - 1 } : p
            })
        }
    }
    , extraReducers: (builder) => {
        builder
            .addCase(GetCustomProds.pending, (state) => {
                state.CustomProds = []
                state.isLoaddingCustomProds = true
            })
            .addCase(GetCustomProds.fulfilled, (state, action) => {
                state.CustomProds = action.payload
                state.isLoaddingCustomProds = false
            })
            .addCase(GetCustomProds.rejected, (state) => {

                state.isLoaddingCustomProds = false
            })
    }
})



export const { increaseCquantity, decreaseCquantity } = CustomProdsSlice.actions
export default CustomProdsSlice.reducer

