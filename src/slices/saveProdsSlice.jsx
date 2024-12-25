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
export const GetSavedProds = createAsyncThunk(
    "SavedMagementSlice/GetSavedProds",
    async (_, { rejectWithValue }) => {
        try {
            const ALlSavedProds = JSON.parse(localStorage.getItem("saved")) || [];
            return ALlSavedProds;
        } catch (error) {
            console.log(error.message);
            return rejectWithValue()
        }
    }
)

export const SaveProds = createAsyncThunk(
    "SavedMagementSlice/saveProds",
    async (prodId, { rejectWithValue, dispatch, getState }) => {
        try {
            const ALlSavedProds = JSON.parse(localStorage.getItem("saved")) || [];
            ALlSavedProds.push({
                id: prodId,
                savedAt: new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate() + "-" + new Date().toLocaleTimeString()
            })
            localStorage.setItem('saved', JSON.stringify(ALlSavedProds));
            dispatch(showTenDone([, "Product saved successffully !"]));
            return ALlSavedProds;
        } catch (error) {
            console.log(error.message);
            dispatch(showTenDone([false, "Failed to save product"]));
            return rejectWithValue(error.message)
        }
    }
)
export const UnsavesaveProds = createAsyncThunk(
    "SavedMagementSlice/UnsavesaveProds",
    async (prodId, { rejectWithValue, dispatch, getState }) => {
        try {
            const ALlSavedProds = JSON.parse(localStorage.getItem("saved")) || [];
            const newListSaved = ALlSavedProds.filter(p => p.id != prodId)
            localStorage.setItem('saved', JSON.stringify(newListSaved));
            dispatch(showTenDone([, "Product Deleted successffully !"]));
            return newListSaved;
        } catch (error) {
            console.log(error.message);
            dispatch(showTenDone([false, "Failed to delete product"]));
            return rejectWithValue(error.message)
        }
    }
)


const SavedMagementSlice = createSlice({
    name: "saved",
    initialState: {
        isLoadingSaved: false,
        AllSaved: null,
    },
    reducers: {
    }, extraReducers: (builder) => {
        builder.addCase(GetSavedProds.fulfilled, (state, action) => {
            state.isLoadingSaved = false
            state.AllSaved = action.payload;
        })
        builder.addCase(UnsavesaveProds.fulfilled, (state, action) => {
            state.isLoadingSaved = false
            state.AllSaved = action.payload;
        })
        builder.addCase(SaveProds.fulfilled, (state, action) => {
            state.isLoadingSaved = false
            state.AllSaved = action.payload;
        })
        builder.addCase(GetSavedProds.pending, (state, action) => {
            state.isLoadingSaved = true
        })
        builder.addCase(UnsavesaveProds.pending, (state, action) => {
            state.isLoadingSaved = true
        })
        builder.addCase(SaveProds.pending, (state, action) => {
            state.isLoadingSaved = true
        })
    }
})

export const { } = SavedMagementSlice.actions;
export default SavedMagementSlice.reducer




export const SavedProdsPage = () => {
    document.title = "Saved products";
    const dispatch = useDispatch();
    const viewProdVsbl = useSelector(st => st.viewProduct.isVisible)
    const MainPageProdRef = useRef(null);
    const LoadinNewElemRef = useRef(null);
    const { AllSaved, isLoadingSaved } = useSelector(s => s.saveMan);
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
        AllSaved.length == 0 ? setisLoadingDat(false) : null;
        if (isAlreadyGetProds) {
            let newProds = AllSaved.filter(n => !prodsRealData.some(old => old.id == n.id));
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

            let removedProds = prodsRealData.filter(n => !AllSaved.some(old => old.id == n.id))
            if (removedProds.length > 0) {
                setprodsRealData(prodsRealData.filter(n => AllSaved.some(old => old.id == n.id)))
            }
        } else {
            setprodsRealData([])
            for (let i = 0; i < AllSaved.length; i++) {
                const element = AllSaved[i];
                const prodData = await api.get("/products/" + element.id);
                setprodsRealData(sure => ([...sure, prodData.data]));
                if (i == AllSaved.length - 1) {
                    setisAlreadyGetProds(true)
                    setisLoadingDat(false);
                }

            }
        }
    }

    useEffect(() => {
        AllSaved && GetFullPrdosData();

    }, [AllSaved])
    useEffect(() => {
        MainPageProdRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center"
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
                    <h1 className='ml20 mt50 '>Saved Products</h1>
                    <img src="imgs/freepik__adjust__73564.png" alt="" />
                </div>
                {
                    isLoadingDat ? <div className="loader"></div> :
                        <div className="listOfAllSavedProds  wmia r-w-p-s">
                            {prodsRealData.length == 0 ?
                                <div className='c-c-c '>
                                    <img  src="imgs/emptyCoasd.png" className='w400' alt="" />
                                    <h1 className="logo mt20">No product has been saved yet.</h1>
                                    <button onClick={() => nav("/Shop")} className='w300 bl p10 br20 mt50'>go shopping <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m700-300-57-56 84-84H120v-80h607l-83-84 57-56 179 180-180 180Z" /></svg> </button>
                                </div> :
                                <>
                                    {prodsRealData.map(p => <div className='c-s-s' key={p.id}> <ProductCard product={p} /><BTN_MAN_SAVE_PRODS prodId={p.id} className={'mt20 bg-l w300 p10 br20 hoverEff2 '} /></div>)}
                                    {isLoadingNEWPRD && <AddNewPrdLoding />}
                                </>
                            } </div>
                }
            </div>
        </>

    )

}

export function BTN_MAN_SAVE_PRODS({ prodId, className }) {
    const { AllSaved, isLoadingSaved } = useSelector(s => s.saveMan);
    const [isInSaved, setInSaved] = useState(AllSaved.some(p => p.id == prodId));
    const dispatch = useDispatch()
    const HandelSaveProd = () => {
        dispatch(SaveProds(prodId));
        setInSaved(true);
    }
    const HandelUnsaveProd = () => {
        dispatch(UnsavesaveProds(prodId));
        setInSaved(false)
    }
    useEffect(() => {
        if (!isLoadingSaved) {
            AllSaved && setInSaved(AllSaved.some(p => p.id == prodId));
        }
    }, [isLoadingSaved])

    return (
        <>
            {
                isInSaved ?
                    <button onClick={HandelUnsaveProd} className={className}>delete from saved
                        <svg version="1.1" className='ml10' viewBox="0 0 2048 2048" xmlns="http://www.w3.org/2000/svg">
                            <path transform="translate(89)" d="m0 0 4 1 1-1h72v4l26 13 12 8 11 9 10 9 12 11 129 129 2 1v2l4 2 4 1 7-6 7-8 12-9 13-11 17-11 24-14 17-9 28-12 27-9 28-7 31-5 22-2 26-1h770l29 1 24 2 29 4 25 6 33 11 28 12 23 12 19 12 22 15 16 13 8 7 10 9 7 7 6 5 7 8 11 12 10 13 14 19 13 21 13 24 9 19 10 25 6 19 7 29 4 28 2 23 1 20 1 50v1083l1 15 4 6 29 29 2 1v2h2l7 8 13 13 6 5 7 8 5 4 6 7 6 5 5 5 1 3 4 2 96 96v2h2l7 8 11 11 7 8 12 15 7 11 12 23 2 6 2-1v71l-3 2v2l-3 1-10 20-9 13-12 14-9 9-14 10-19 10-16 7-1 3h-58l-29-13-13-7-16-12-10-9-12-11-310-310v-2l-4-2v-2l-4-2v-2l-4-2v-2l-4-2v-2l-3-1-5-5v-2l-4-2v-2l-4-2v-2l-4-2v-2l-4-2v-2l-4-2v-2l-4-2v-2l-4-2v-2l-4-2v-2l-4-2-984-984v-2l-4-2-8-8v-2l-4-2v-2l-4-2v-2l-4-2-4-4v-2l-4-2v-2l-4-2v-2l-4-2v-2l-4-2v-2l-4-2v-2l-4-2v-2l-4-2v-2l-4-2v-2l-4-2v-2l-4-2v-2l-4-2v-2l-4-2v-2l-4-2v-2l-4-2v-2l-4-2v-2l-4-2v-2l-4-2v-2l-4-2v-2l-4-2v-2l-4-2v-2l-3-1-5-5v-2l-4-2v-2l-4-2v-2l-4-2v-2l-4-2v-2l-4-2v-2l-4-2v-2l-4-2v-2l-4-2v-2l-4-2-168-168v-2l-4-2-8-8v-2l-4-2v-2l-4-2v-2l-4-2v-2l-4-2v-2l-4-2v-2l-4-2-12-12v-2l-4-2v-2l-4-2v-2l-4-2-39-39-7-8-11-14-11-18-9-17-3-4v-71l5-5 8-17 11-18 9-11 10-10 13-10 23-12 10-6zm699 340-135 1-28 1-18 3-17 6-16 8-16 9-3 3 4 7 16 15 406 406 5 6 7 6 5 6 7 6 5 6 8 8h2l2 4h2l2 4 70 70h2v2l6 5 2 3h2l2 4 4 4h2v2h2v2h2l2 4h2l2 4 4 2v2l7 6 5 6 8 7 364 364 7 8 12 11h2l-1-121v-764l-2-22-5-19-10-22-8-12-11-13-11-10-15-10-19-9-12-4-10-2-11-1-28-1-182-1z" />
                            <path transform="translate(376,852)" d="m0 0h14l19 2 18 5 21 10 14 10 14 12 8 9 10 15 8 16 5 15 3 14 1 11 1 77v432l1 219 2 10 5-1 8-4 10-9 10-10 7-8 7-7 9-11 7-8h2l2-4 11-12 7-8 9-10 11-12 5-6h2l2-4 11-12 7-8 18-20 1-2h2l2-4 7-7 7-8 7-7 7-8 8-8 9-11 7-7 7-8 10-11 9-11 12-13 11-12 7-8 11-13 5-6h2l2-4h2l2-4 8-7 10-8 18-11 15-6 13-4 9-2 11-1h16l19 2 18 5 21 10 14 10 11 10 6 5 13 18 8 15 8 21 3 15 1 12v13l-2 19-6 18-8 18-8 12-13 16-11 13-11 12-6 8h-2l-2 4-16 17-18 20-7 8-12 14-7 7-7 8-11 12-7 8-14 15-12 14-7 7-8 10-12 12-7 8-12 13-7 8-9 10-2 3h-2l-2 4-14 15-7 8-9 10-2 3h-2v2h-2l-2 4-7 8h-2l-2 4-16 16-7 6h-2v2l-11 9-16 12-15 9-18 10-21 9-24 8-28 7-19 3-14 1h-28l-24-2-24-5-29-9-24-10-19-10-19-12-11-9-13-11-24-24-9-11-11-15-13-21-8-16-8-17-6-19-6-26-3-23-2-29-1-34-1-57v-540l1-72 2-29 3-15 5-15 10-20 14-19 11-11 17-12 14-8 19-7 15-3z" />
                            <path transform="translate(167)" d="m0 0h13l-2 3h-10z" />
                            <path transform="translate(2047,1964)" d="m0 0 1 4h-3z" />
                            <path transform="translate(1887,2047)" d="m0 0h5v1h-5z" />
                            <path transform="translate(1956,2047)" d="m0 0 4 1z" />
                            <path transform="translate(1886,2045)" d="m0 0" />
                            <path transform="translate(2047,1959)" d="m0 0" />
                            <path transform="translate(0,89)" d="m0 0" />
                            <path transform="translate(91)" d="m0 0" />
                            <path transform="translate(86)" d="m0 0" />
                        </svg>
                    </button>
                    :
                    <button onClick={HandelSaveProd} className={className}>Save <svg className='ml10' xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M200-120v-640q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v640L480-240 200-120Zm80-122 200-86 200 86v-518H280v518Zm0-518h400-400Z" /></svg></button>
            }
        </>
    )
}