import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "./fetchProdSlice";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect, useRef } from "react";
import ProductCard from "../c/singles/ProdCard";
export const GetMoreOfSame = createAsyncThunk(
    "MoreOfSameSlice/GetMoreOfSame",
    async (category, { rejectWithValue }) => {
        try {
            console.log('accepted');
            console.log(category);

            const response = await api.get("/products/category/" + category);
            console.log(response.data);
            return response.data.products;

        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)




const MoreOfSameSlice = createSlice({
    name: "MoreOfSameSlice",
    initialState: {
        orginaleProdTite: null,
        MoreOfSameVisible: false,
        isLoadingMoreOfSame: false,
        moreOfSameData: null
    },
    reducers: {
        setOrinOriginaleTtitle: (state, action) => {
            state.orginaleProdTite = action.payload
        },
        hideMoreOfSame: (state, action) => {
            state.MoreOfSameVisible = false
        }
    }
    , extraReducers: (builder) => {
        builder
            .addCase(GetMoreOfSame.pending, (state) => {
                state.isLoadingMoreOfSame = true;
                state.MoreOfSameVisible = true
            })
            .addCase(GetMoreOfSame.fulfilled, (state, action) => {
                state.isLoadingMoreOfSame = false;
                state.moreOfSameData = action.payload;
                state.MoreOfSameVisible = true
            })
            .addCase(GetMoreOfSame.rejected, (state) => {
                state.isLoadingMoreOfSame = false;
                state.MoreOfSameVisible = false
            })
    }
})
export const { setOrinOriginaleTtitle, hideMoreOfSame } = MoreOfSameSlice.actions

export default MoreOfSameSlice.reducer;


export const MoreOfSameCmp = () => {


    const { prodData } = useSelector(s => s.viewProduct)
    const { isLoadingMoreOfSame, moreOfSameData, orginaleProdTite } = useSelector(st => st.MoreOfSame)
    const MoreOfSameRef = useRef(null);
    const dispatch = useDispatch()
    useEffect(() => {
        MoreOfSameRef.current.scrollIntoView({
            behavior: "smooth",
            bloc: "top"
        })
    }, [])
    return (
        <>
            <div ref={MoreOfSameRef} className="sameCategory wmia c-s-s mt20 ">
                <div className="wmia r-b-s">
                    <p className='mb20 mt20'>Results for products in the same category for <strong className='ml10' style={{ fontSize: "17px" }}> {orginaleProdTite}</strong></p>
                    <button className="mb20" style={{ alignSelf: "end" }} onClick={() => dispatch(hideMoreOfSame())}><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" /></svg></button>
                </div>
                <div className="listOfSameOfProds  r-s-s">
                    {isLoadingMoreOfSame ? <div className='c-s-s mrauto'><div className="loader"></div><h1 className='mt20'>Loading Similar Items</h1></div> :
                        moreOfSameData.map(elm => <ProductCard product={elm} key={elm.id}  ref={null}/>)
                    }
                </div>

            </div>
        </>
    )
}