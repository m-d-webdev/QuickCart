import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const api = axios.create({
    baseURL: "https://dummyjson.com"
})

export const fetchProds = createAsyncThunk(
    "productsSlice/fetchProds",
    async (prodId, { rejectWithValue, dispatch }) => {
        try {
            if (prodId) {
                const respose = await api.get("/products/" + prodId)
                return [respose.data];
            } else {
                let randItm = (Math.random() * 100).toString();
                randItm = randItm.indexOf('.') != -1 ? randItm.substring(0, randItm.indexOf('.')) : randItm
                dispatch(SetfirstprodGetten(randItm))
                const respose = await api.get("products?limit=20&skip=" + randItm);
             
                return respose.data.products;
            }
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)
export const GetMoreProds = createAsyncThunk(
    "productsSlice/GetMoreProds",
    async (_, { rejectWithValue, dispatch, getState }) => {
        try {
            let { currentCount, firstprodGetten, RestDatasGetten } = getState().productsManager
            let C1 = Number(currentCount);
            let limit = 20
            if (C1 >= 174) {
                if (firstprodGetten > 0) {
                    if (RestDatasGetten == 0) {
                        C1 = 0
                        if (firstprodGetten > 20) {
                            dispatch(SetRestDatasGetten(20))
                        }
                    } else if (RestDatasGetten > 0) {
                        let RestOfRest = firstprodGetten - RestDatasGetten ;
                        C1 = RestDatasGetten
                        if (RestOfRest > 20) {
                            dispatch(SetRestDatasGetten(RestDatasGetten + 20))
                        } else {
                            if (RestOfRest > 0) {
                                limit = RestOfRest
                                dispatch(SetRestDatasGetten(firstprodGetten))
                            }

                        }
                    }
                }


            } else {
                C1 += 20
                dispatch(SetcurrentCount(C1))

            }
            const respose = await api.get(`products?limit=${limit}&skip=` + C1);
            return respose.data.products;

        } catch (error) {
            console.log(error.message);

            return rejectWithValue(error.message);
        }
    }
)

export const fetchCategory = createAsyncThunk(
    "productsSlice/fetchCategory",
    async (category) => {
        try {
            const respose = await api.get("/products/category/" + category);
            return respose.data.products;
        } catch (error) {
            return error.message;
        }
    }
)

export const fetchSearch = createAsyncThunk(
    "productsSlice/fetchSearch",
    async (searchTerme, { RejectWithValues }) => {
        const response = await api.get('/products/search?q=' + searchTerme);
        return response.data.products;

    }
)

const productsSlice = createSlice({
    name: "productsSlice",
    initialState: {
        productsList: [],
        currentCount: 0,
        firstprodGetten: 0,
        RestDatasGetten: 0,
        isLoaddingMoreProds: false,
        CategoryproductsList: [],
        arraySearchTermes: [],
        isLoadingData: false,
        isLoadingCategory: false,
        errorData: null,
        resultSearch: [],
        searchTerme: "",
        isSearching: false
    },
    reducers: {
        SetfirstprodGetten: (state, action) => {
            state.firstprodGetten = action.payload
            state.currentCount = action.payload
        },
        SetcurrentCount: (state, action) => {
            state.currentCount = action.payload
        },
        SetRestDatasGetten: (state, action) => {
            state.RestDatasGetten = action.payload
        },
        getProds: (state) => {
            state.isLoadingData = true;
            state.productsList = data
        },
        setsearchTerme: (state, action) => {
            state.searchTerme = action.payload;
        },
        cancelSearching: (state) => {
            state.isSearching = false;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProds.pending, (state) => {
                state.isLoadingData = true;
            })
            .addCase(fetchProds.fulfilled, (state, action) => {
                state.isLoadingData = false;
                state.errorData = null;
                state.productsList = action.payload;
                state.arraySearchTermes = action.payload.map(elm => ({ id: elm.id, title: elm.title, description: elm.title + ' ' + elm.description }));
                state.isSearching = false
            })
            .addCase(fetchProds.rejected, (state, action) => {
                state.isLoadingData = false;
                state.errorData = action.payload;
                state.isSearching = false
            })
            // Category -------------
            .addCase(fetchCategory.pending, (state) => {
                state.isLoadingData = true;
            })
            .addCase(fetchCategory.fulfilled, (state, action) => {
                state.isLoadingData = false;
                state.errorData = null;
                state.isSearching = false
                state.productsList = action.payload;

            })
            .addCase(fetchCategory.rejected, (state, action) => {
                state.isLoadingData = false;
                state.isSearching = false
                state.errorData = action.payload;
            })
            // ----------
            .addCase(GetMoreProds.pending, (state) => {
                state.isLoaddingMoreProds = true;
            })
            .addCase(GetMoreProds.fulfilled, (state, action) => {
                state.isLoaddingMoreProds = false;
                state.productsList = [...state.productsList, ...action.payload]

            })
            .addCase(GetMoreProds.rejected, (state, action) => {
                state.isLoaddingMoreProds = false;

            })
            // ------Search ??? -----------

            .addCase(fetchSearch.pending, (state) => {
                state.isLoadingData = true;
            })

            .addCase(fetchSearch.fulfilled, (state, action) => {
                state.isLoadingData = false;
                state.errorData = null;
                state.isSearching = true;
                state.resultSearch = action.payload;
            })
            .addCase(fetchSearch.rejected, (state, action) => {
                state.isLoadingData = false;
                state.isSearching = true;
                localStorage.clear()
                state.errorData = action.payload;
            })

    }
})


export const { SetfirstprodGetten, SetRestDatasGetten, SetcurrentCount, getProds, setsearchTerme, cancelSearching } = productsSlice.actions;
export default productsSlice.reducer;