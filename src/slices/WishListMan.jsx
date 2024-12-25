import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { auth, db } from '../config/fireBase'
import { setDoc, updateDoc, getDoc, doc } from 'firebase/firestore'
import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ReactDom from "react-dom"
import { v4 } from 'uuid'
import { showTenDone } from './tenDoeneslice'
import { api } from './fetchProdSlice'
import ProductCard from '../c/singles/ProdCard'
import { ViewProd } from '../c/shopping/viewProd'
import { useNavigate } from 'react-router-dom'
export const GetWishList = createAsyncThunk(
    "WishListMan/GetWishList",
    async (_, { rejectWithValue }) => {
        try {
            const WishListItems = JSON.parse(localStorage.getItem("wishlist")) || [];
            return WishListItems;
        } catch (error) {
            console.log(error.message);
            return rejectWithValue()
        }
    }
)

export const AddToWithList = createAsyncThunk(
    "WishListMan/AddToWithList",
    async (prodId, { rejectWithValue, dispatch, getState }) => {
        try {
            const WishListItems = JSON.parse(localStorage.getItem("wishlist")) || [];
            WishListItems.push({
                id: prodId,
                savedAt: new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate() + "-" + new Date().toLocaleTimeString()
            })
            localStorage.setItem('wishlist', JSON.stringify(WishListItems));
            dispatch(showTenDone([, "Product added to the Wish list  successffully !"]));
            return WishListItems;
        } catch (error) {
            console.log(error.message);
            dispatch(showTenDone([false, "Failed to add product to the Wish list "]));
            return rejectWithValue(error.message)
        }
    }
)
export const DeleteFromWishList = createAsyncThunk(
    "WishListMan/DeleteFromWishList",
    async (prodId, { rejectWithValue, dispatch, getState }) => {
        try {
            const OldWishList = JSON.parse(localStorage.getItem("wishlist")) || [];
            const newWishList = OldWishList.filter(p => p.id != prodId)
            localStorage.setItem('wishlist', JSON.stringify(newWishList));
            dispatch(showTenDone([, "Product Deleted successffully !"]));
            return newWishList;
        } catch (error) {
            console.log(error.message);
            dispatch(showTenDone([false, "Failed to delete product"]));
            return rejectWithValue(error.message)
        }
    }
)


const WishListMan = createSlice({
    name: "WishListMan",
    initialState: {
        isLoadingWishList: false,
        AllWishList: [],
    },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(GetWishList.fulfilled, (state, action) => {
            state.isLoadingWishList = false
            state.AllWishList = action.payload;
        })
        builder.addCase(DeleteFromWishList.fulfilled, (state, action) => {
            state.isLoadingWishList = false
            state.AllWishList = action.payload;
        })
        builder.addCase(AddToWithList.fulfilled, (state, action) => {
            state.isLoadingWishList = false
            state.AllWishList = action.payload;
        })
        builder.addCase(GetWishList.pending, (state, action) => {
            state.isLoadingWishList = true
        })
        builder.addCase(DeleteFromWishList.pending, (state, action) => {
            state.isLoadingWishList = true
        })
        builder.addCase(AddToWithList.pending, (state, action) => {
            state.isLoadingWishList = true
        })
    }
})

export const { } = WishListMan.actions;
export default WishListMan.reducer




export const WishListPage = () => {
    document.title = "Saved products";
    const dispatch = useDispatch();
    const viewProdVsbl = useSelector(st => st.viewProduct.isVisible)
    const MainPageProdRef = useRef(null);
    const LoadinNewElemRef = useRef(null);
    const { AllWishList, isLoadingWishList } = useSelector(s => s.WishList);
    const [isAlreadyGetProds, setisAlreadyGetProds] = useState(false)
    const [isLoadingDat, setisLoadingDat] = useState(true);
    const [isLoadingNEWPRD, setisLoadingNEWPRD] = useState(false);
    const [prodsRealData, setprodsRealData] = useState([]);
    const nav = useNavigate()
    const AddNewPrdLoding = () => {
        return (
            <div ref={LoadinNewElemRef} className="NewProdLoading w500 c-c-c h500 bg-l br20 ">
                <div className="spinner" style={{ margin: "0px" }}></div>
                <p className='mt20'>Loading new products</p>
            </div>
        )

    }

    const GetFullPrdosData = async () => {
        AllWishList.length == 0 ? setisLoadingDat(false) : null;
        if (isAlreadyGetProds) {
            let newProds = AllWishList.filter(n => !prodsRealData.some(old => old.id == n.id));
            if (newProds.length > 0) {
                setisLoadingNEWPRD(true)
                for (let i = 0; i < newProds.length; i++) {
                    const element = newProds[i];
                    const prodData = await api.get("/products/" + element.id);
                    setprodsRealData([...prodsRealData, prodData.data]);
                    if (i == newProds.length - 1)
                        setisLoadingNEWPRD(false)
                }
            }

            let removedProds = prodsRealData.filter(n => !AllWishList.some(old => old.id == n.id))
            if (removedProds.length > 0) {
                setprodsRealData(prodsRealData.filter(n => AllWishList.some(old => old.id == n.id)))
            }
        } else {
            setprodsRealData([])
            for (let i = 0; i < AllWishList.length; i++) {
                const element = AllWishList[i];
                const prodData = await api.get("/products/" + element.id);
                setprodsRealData(sure => ([...sure, prodData.data]));
                if (i == AllWishList.length - 1) {
                    setisAlreadyGetProds(true)
                    setisLoadingDat(false);
                }

            }
        }
    }

    useEffect(() => {
        AllWishList && GetFullPrdosData();

    }, [AllWishList])


    useEffect(() => {
        MainPageProdRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start"
        })

    }, [])

    useEffect(() => {
        isLoadingNEWPRD && LoadinNewElemRef.current.scrollIntoView({
            behavior: "smooth",
            block: "end"
        });
    }, [isLoadingNEWPRD])


    return (
        <>
            {viewProdVsbl && <ViewProd />}
            <div ref={MainPageProdRef} style={{ minHeight: "800px" }} className="wima c-s-s p10 mt20">

                <div className="c-s-s wmia h400 introPageStyle psr">
                    <h1 className='ml20 mt50 '>Wishlist </h1>
                    <img src="imgs/freepik__adjust__58622.png" alt="" />
                </div>
                {
                    isLoadingDat ? <div className="loader"></div> :
                        <div className="listOfWishListItems  wmia r-w-p-s">
                            {prodsRealData.length == 0 ?
                                <div className='c-c-c'>
                                    <img src="imgs/emptyCoasd.png" className='w400' alt="" />
                                    <h1 className="logo mt20">No product has been Added to your Wishlist yet.</h1>
                                    <button onClick={() => nav("/Shop")} className='w300 bl p10 br20 mt50'>go shopping <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m700-300-57-56 84-84H120v-80h607l-83-84 57-56 179 180-180 180Z" /></svg> </button>
                                </div> :
                                <>
                                    {prodsRealData.map(p => <div className='c-s-s' key={p.id}> <ProductCard product={p} /><BTN_MAN_ADD_TO_WISH_LIST prodId={p.id} className={'mt20 bg-l w300 p10 br20 hoverEff2 '} /></div>)}
                                    {isLoadingNEWPRD && <AddNewPrdLoding />}
                                </>
                            }   </div>
                }
            </div>
        </>

    )

}

export function BTN_MAN_ADD_TO_WISH_LIST({ prodId, className }) {
    const { AllWishList, isLoadingWishList } = useSelector(s => s.WishList);
    const [isInWishList, setInWishList] = useState(AllWishList.some(p => p.id == prodId));
    const dispatch = useDispatch();
    const HandelSaveProd = () => {
        dispatch(AddToWithList(prodId));
        setInWishList(true);
    }
    const HandelUnsaveProd = () => {
        dispatch(DeleteFromWishList(prodId));
        setInWishList(false)
    }
    useEffect(() => {
        if (!isLoadingWishList) {
            AllWishList && setInWishList(AllWishList.some(p => p.id == prodId));
        }
    }, [isLoadingWishList])

    return (
        <>
            {
                isInWishList ?
                    <button onClick={HandelUnsaveProd} className={className}>Delete from wish list
                        <svg version="1.1" viewBox="0 0 2048 2048" className='ml10' xmlns="http://www.w3.org/2000/svg">
                            <path transform="translate(1393)" d="m0 0h149l2 2 45 9 40 10 49 16 32 13 27 13 23 13 24 15 16 11 17 12 16 13 10 8 10 9 8 7 13 12 19 19 7 8 12 13 11 14 10 13 10 14 18 27 15 26 12 23 14 31 10 26 12 35 8 30 7 30 7 34 2 1v170l-2-1-1-9-1 1h-2v2h-2l-2 12-10 43-9 29-9 27-11 26-7 16-20 38-14 23-10 15-14 20-20 25-13 15-14 15-30 30-11 9-14 12-12 9-13 10-13 9-19 12-17 10-16 9-23 12-28 12-24 9-34 11-32 8-34 7-29 4-33 3-23 1h-34l-31-2-34-4-24-4-34-8-28-8-25-9-25-10-26-12-28-14-28-17-16-10-18-13-16-12-13-11-8-7-10-9-15-14-17-17v-2h-2l-7-8-11-12-9-11-12-15-10-14-18-27-12-20-12-22-8-16-10-21-13-33-13-41-7-28-7-38-4-32-2-26v-56l2-29 7-49 9-40 7-25 12-33 11-26 13-28 10-19 9-16 9-15 15-23 7-9 8-11 13-16 9-11 24-26 18-18h2v-2l8-7 10-9 14-11 16-13 17-12 20-13 19-12 24-13 35-17 20-8 17-6 24-8 26-7 29-7 32-6h2zm71 127-33 2-27 3-36 7-27 7-23 8-25 10-25 12-24 13-14 9-16 11-13 10-14 11-20 18-8 7-10 10-7 8-8 8-9 11-6 7-10 14-12 18-11 17-13 24-8 17-7 15-14 38-7 25-6 32-4 27-3 28v48l4 34 5 29 7 30 6 19 10 28 8 18 13 27 14 24 14 21 14 19 9 10 9 11 16 17 17 17 8 7 12 10 16 12 20 14 21 13 28 15 19 9 22 9 30 10 28 7 35 6 28 3 13 1h48l30-3 36-6 25-6 23-7 32-12 29-14 21-11 21-13 13-9 19-14 22-18 15-14 24-24 11-14 13-16 9-13 14-22 9-15 13-26 10-23 9-26 7-23 8-37 5-35 2-24v-41l-3-34-5-33-7-30-7-24-11-30-11-24-8-16-12-22-12-19-12-17-11-14-12-14-12-13-19-19-8-7-14-12-20-15-14-10-28-17-28-15-28-12-25-9-26-8-21-5-24-4-22-3-22-2z" />
                            <path transform="translate(107,254)" d="m0 0h82l38 2 28 3 21 5 20 8 23 12 11 8 14 11 20 20 13 18 9 16 6 12 9 25 7 25 8 38 8 36 4 15v3h274l18 2 11 4 11 7 11 11 9 14 4 10 1 4v24l-4 13-7 11-11 13-9 7-8 4-10 2-11 1-35 1h-216l7 29 7 31 11 50 15 67 7 31 14 64 9 39 12 54 13 58 42 189 13 57 8 34 7 23 8 17 9 10 15 9 16 4 7 1h945l24-2 12-4 12-7 6-6h2l2-4 8-13 7-18 7-27 10-36 7-24 8-19 10-14 10-9 10-6 15-4h17l16 3 14 7 9 7 9 11 6 12 5 16v12l-6 27-9 35-12 42-7 20-11 25-11 18-14 19-12 13-8 8-12 9-14 10-14 8-22 9-18 5-15 3-19 2-19 1h-955l-21-2-20-4-17-5-20-9-16-9-16-12-10-9-16-16-13-17-11-19-9-19-6-17-7-25-11-47-15-68-60-270-17-76-14-63-34-152-13-58-13-59-11-49-14-64-7-27-7-20-7-13-7-8-11-7-11-4-14-2-57-1-105-1-15-2-16-8-11-10-9-12-8-10v-44l8-9 8-10 10-10 14-9 6-2 24-2z" />
                            <path transform="translate(812,1664)" d="m0 0h31l28 3 21 5 20 8 20 11 18 13 14 12 12 12 13 17 9 15 8 16 10 25 5 21 2 13v42l-3 19-6 20-8 20-9 17-10 14-10 13-11 12-8 8-15 11-17 11-16 8-14 6-22 7-10 3v2h-65l-1-2-4 2h-6l1-4-8-3-19-7-20-9-17-10-12-9-10-9-6-5-7-8-9-10-12-17-9-16-9-19-6-19-4-17-2-19v-18l2-21 5-24 7-20 8-18 11-18 10-13 9-11 13-13 17-13 17-11 17-9 18-7 22-5zm11 128-10 2-11 5-12 8-8 8-10 18-4 15v10l3 15 6 12 10 14 9 8 9 6 12 4 13 2 12-1 13-4 15-9 8-7 9-13 5-11 2-9v-17l-4-16-5-10-8-10-9-8-14-8-11-3-10-1z" />
                            <path transform="translate(1452,1664)" d="m0 0h31l28 3 21 5 20 8 20 11 15 11 10 8 12 11 10 11 10 13 9 15 8 16 8 19 6 21 3 19v42l-3 19-6 20-8 20-9 17-13 18-9 11-11 12-10 9-19 13-13 8-16 8-25 9-15 4-2 3h-65l-1-2-4 2h-6l1-4-8-3-19-7-20-9-14-8-14-10-11-10-6-5-7-8-9-10-10-14-9-15-8-16-7-19-6-24-2-19v-18l2-21 4-20 5-16 8-20 9-16 10-15 12-14 1-2h2l2-4 9-9 14-11 18-12 16-9 19-8 19-5 12-2zm12 128-14 3-13 7-9 7-8 9-8 15-4 14v12l4 17 9 15 7 9 8 7 9 6 12 4 19 2 13-3 10-4 12-8 6-5 9-12 6-13 2-9v-17l-4-16-5-10-9-11-8-7-14-8-11-3z" />
                            <path transform="translate(1225,511)" d="m0 0h493l25 2 12 4 13 9 7 7 9 12 5 11 2 7v23l-4 13-6 11-11 13-8 7-9 5-10 2-10 1-25 1h-500l-12-2-12-5-9-7-9-9-9-14-5-13-1-4v-18l3-11 7-14 11-13 11-9 12-7 8-1z" />
                            <path transform="translate(1564)" d="m0 0h16l1 2-1 2-8-1-8-2z" />
                            <path transform="translate(1378)" d="m0 0h7l-1 4h-6z" />
                            <path transform="translate(2047,467)" d="m0 0h1v10h-1l-1-9z" />
                            <path transform="translate(1418,2046)" d="m0 0 3 2h-5z" />
                            <path transform="translate(778,2046)" d="m0 0 3 2h-5z" />
                            <path transform="translate(2047,480)" d="m0 0 1 4z" />
                            <path transform="translate(1370)" d="m0 0 3 1z" />
                            <path transform="translate(1581)" d="m0 0 2 1z" />
                            <path transform="translate(1513,2047)" d="m0 0" />
                            <path transform="translate(2047,678)" d="m0 0" />
                            <path transform="translate(2047,505)" d="m0 0" />
                            <path transform="translate(2047,486)" d="m0 0" />
                        </svg>

                    </button>
                    :
                    <button onClick={HandelSaveProd} className={className}>Add to wish list
                        <svg version="1.1" viewBox="0 0 2048 2048" className=' ml10' xmlns="http://www.w3.org/2000/svg">
                            <path transform="translate(50,170)" d="m0 0h130l24 2 18 3 25 7 22 9 21 12 19 14 14 12 13 13 13 17 8 13 11 21 8 20 9 31 8 35 9 49 11 58 6 23v2h372l22 1 13 2 6 3 10 9 6 10 4 9 1 5v8l-3 10-6 10-9 10-8 5-7 2-14 1-104 1h-263l5 25 6 34 9 42 14 71 8 41 23 114 22 111 50 250 9 43 8 34 1 2h926l105-1 3-1 2-6 3-21 8-39 7-35 11-56 27-136 11-49 4-13 7-13 8-7 10-5 4-1h13l13 4 11 6 9 8 5 10 2 9v10l-8 43-9 45-9 43-7 36-7 34-9 47-6 29-8 43-12 56-5 17-7 14-5 6-8 5-10 3-44 1-1049 1-13 2h-18l-19-1-11-1h-137l-15 2-8 4-8 9-8 14-1 6v8l2 10 7 14 9 10 9 4 14 2h1024l397 1 27 1 14 1 11 4 10 9 6 10 4 11v14l-7 16-10 11-12 6-4 1-15 1-63 1h-1378l-31-3-21-6-16-8-13-9-12-11-10-11-9-13-8-14-7-19-4-17v-33l4-20 6-17 9-17 11-15 4-5h2v-2h2v-2l10-8 15-10 19-9 16-5 26-3h118l-3-16-7-35-9-42-9-46-8-40-7-36-38-190-9-46-11-55-12-59-20-100-15-76-12-62-10-58-18-93-11-53-7-21-7-15-8-14-11-13-8-8-14-10-15-8-18-6-18-4-19-2-31-1h-103l-16-2-8-7-7-8-9-8v-35h2l2-4 8-8h2v-2l11-7 11-3z" />
                            <path transform="translate(1185)" d="m0 0h116l4 3 36 10 19 7 25 11 19 10 18 11 16 12 13 10 13 12 14 14 7 8 7 9 7-6 11-14 12-11 11-11 11-9 9-7 14-10 26-15 25-12 21-8 23-7 16-4h3v-3h112l2 3 35 10 24 9 20 9 19 10 16 10 17 12 10 8 10 9 8 7 12 12 9 11 8 10 13 18 13 22 14 28 7 18 9 28 7 25 2-1v100h-3l-1 7 3 1 1 6-4 4-1-4-3 8-12 42-8 20-13 30-8 16-8 17-10 18-6 11-9 16-7 11-8 12-10 16-14 20-9 12-13 18-11 15-13 16-1 2h-2l-2 4-12 14-14 17-9 10-9 11-11 12-7 8-8 8-7 8-68 68-8 7-21 21-8 7-9 9-8 7-11 10-11 9-12 11-11 9-15 14-11 9-14 12-13 11-10 8-13 11-15 11-9 7-18 12-12 6-4 1h-9l-15-5-13-8-12-9-16-13-14-11-13-11-17-14-14-12-11-9-11-10-8-7-15-13-10-9-8-7-9-9-8-7-9-9-8-7-25-25-4-3v-2l-4-2v-2l-4-2-43-43-7-8-13-13v-2h-2l-7-8-16-17-11-12-9-11-12-14-9-11-11-13-11-14-14-18-26-36-10-15-16-25-15-25-14-26-9-17-14-31-14-37-9-30-7-28-4-25-1-10v-39l4-29 5-25 7-25 8-20 9-20 10-19 16-24 10-13 13-16 10-10 1-2h2l1-3 8-7 13-11 17-12 10-7 15-9 25-13 20-8 24-8 21-6zm10 1m592 0m4 1m-559 84-24 3-25 5-20 7-23 11-20 13-12 9-10 9-8 7-6 6v2h-2l-9 11-9 12-13 22-11 23-8 26-5 22-3 21v31l5 31 7 27 8 24 12 29 12 25 8 15 14 24 9 15 14 21 14 20 13 18 16 21 13 16 9 11 11 13 12 14 12 13 7 8 12 13 7 7 7 8 16 17 4 5h2l2 4 50 50 8 7 14 14 8 7 8 8 8 7 15 14 8 7 9 8h2v2l8 7 13 12 14 11 13 11 10 8 9 8 9 7 10 9 6 4 5-1 7-6v-2h2v-2l4-2 16-13 13-12 11-9 10-9 11-9 11-10 11-9 14-13 11-9 7-7 8-7 9-9 8-7 14-14 2-1v-2h2l4-5 2-1v-2l4-2 42-42 7-8 8-8 7-8 8-8v-2h2l7-8 13-14 9-11 12-13 9-11 11-13 7-9 12-15 13-17 12-16 13-19 7-10 11-17 9-15 8-13 12-23 8-16 11-24 11-30 5-17 5-24 2-14 1-13v-26l-2-24-4-21-7-23-9-20-10-19-13-19-8-10-9-10-9-9-10-8-16-12-22-13-21-10-24-8-25-5-22-2h-29l-26 3-26 6-21 8-21 11-11 7-15 11-14 12-13 13-9 11-12 16-11 17-11 19-9 12-8 7-14 7-16-3-11-5-8-6-7-10-17-29-12-18-12-14-4-5h-2l-2-4-13-12-14-11-18-12-18-10-24-10-19-6-25-4-13-1zm811 279 1 3z" />
                            <path transform="translate(1429,1707)" d="m0 0h40l24 4 19 6 16 7 16 10 11 8 12 11 13 13 10 13 8 13 8 16 7 18 5 19 2 12 1 26-2 20-5 24-6 15-8 16-10 15-13 17-10 11-10 8-12 9-19 11-15 7-29 10-1 2h-69v-5l-12-3-27-11-18-10-17-14-13-13-9-10-10-15-12-22-8-21-5-20-2-21v-11l2-22 4-19 5-15 7-16 10-17 11-15 9-10 10-10 12-9 15-10 19-10 17-6 15-4zm9 85-12 2-15 6-14 9-9 8-8 11-6 10-6 16-3 19 1 17 4 16 6 14 10 13 11 11 13 8 8 4 17 5 6 1h14l13-2 14-5 16-8 11-9 11-12 8-15 4-12 2-11v-22l-3-16-8-16-9-13-9-9-11-8-16-8-12-3-9-1zm-22 253m4 1 4 1z" />
                            <path transform="translate(661,1707)" d="m0 0h40l24 4 19 6 15 7 9 5 18 12 12 11 14 14 10 13 8 13 8 16 7 18 5 19 2 12 1 14v13l-2 19-5 24-8 20-8 14-8 12-10 13-11 13-13 11-14 10-18 10-16 7-27 9v2h-69v-5l-12-3-22-9-21-11-13-10-10-9-14-14-10-14-9-15-8-16-7-18-5-20-1-6-1-25 2-23 4-19 5-15 7-16 10-17 10-14 11-12 11-11 17-12 19-11 16-7 20-6zm8 85-14 3-14 6-12 8-9 8-8 11-6 10-6 16-2 9-1 9v11l3 17 8 20 10 13 11 11 13 8 14 6 17 4h14l13-2 14-5 16-8 14-12 9-11 8-16 3-9 2-11v-23l-3-15-8-16-7-10-9-10-13-10-16-8-12-3-8-1zm-21 253m3 0m1 1 4 1z" />
                            <path transform="translate(1316)" d="m0 0h11l-3 3-8-1z" />
                            <path transform="translate(1811)" d="m0 0h8l-1 3-4-1z" />
                            <path transform="translate(1483,2046)" d="m0 0 3 1-4 1z" />
                            <path transform="translate(1806)" d="m0 0 4 1h-4z" />
                            <path transform="translate(2047,232)" d="m0 0 1 4z" />
                            <path transform="translate(715,2047)" d="m0 0 3 1z" />
                            <path transform="translate(1397,2047)" d="m0 0 2 1z" />
                            <path transform="translate(629,2047)" d="m0 0 2 1z" />
                            <path transform="translate(2047,377)" d="m0 0" />
                            <path transform="translate(2047,383)" d="m0 0" />
                            <path transform="translate(2047,364)" d="m0 0" />
                            <path transform="translate(2047,243)" d="m0 0" />
                            <path transform="translate(1311,3)" d="m0 0" />
                            <path transform="translate(1310,2)" d="m0 0" />
                            <path transform="translate(1311)" d="m0 0" />
                            <path transform="translate(1308)" d="m0 0" />
                        </svg>
                    </button>
            }
        </>
    )
}