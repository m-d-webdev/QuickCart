import { createSlice, createAsyncThunk, current } from '@reduxjs/toolkit'
import { auth, db } from '../config/fireBase'
import { setDoc, updateDoc, getDoc, doc, addDoc } from 'firebase/firestore'
import { useEffect, useReducer, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ReactDom from "react-dom"
import { v4 } from 'uuid'
import { showTenDone } from './tenDoeneslice'
import { Navigate, useNavigate } from 'react-router-dom'

export const getDefaultCard = createAsyncThunk(
    "",
    async (_, { rejectWithValue }) => {
        try {
            let repsonce = await getDoc(doc(db, "cards", localStorage.getItem('userId')));
            let allCards = repsonce.data().cards;
            return allCards;
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const SubmitCard = createAsyncThunk(
    "peymenthMethodSlice/SubmitCard",
    async (creditCardObj, { getState, rejectWithValue, dispatch }) => {
        const { havePaymenthMethod } = getState().paymentMethod;
        try {
            if (havePaymenthMethod) {
                let repsonce = await getDoc(doc(db, "cards", localStorage.getItem('userId')));
                let AllCards = repsonce.data().cards;
                let newCardId = v4();
                creditCardObj.isDefault == true ? AllCards.map(elm => elm.isDefault == true ? elm.isDefault = false : elm) : null
                AllCards.push({ ...creditCardObj, id: newCardId });
                await updateDoc(doc(db, "cards", localStorage.getItem('userId')), { cards: AllCards })
                dispatch(showTenDone([, "Card saved successfully"]))
                creditCardObj.isDefault == true ? dispatch(SeteDefaultCard({ ...creditCardObj, id: newCardId })) : null
                return AllCards;
            }
            else {
                let newCardId = v4();
                await setDoc(doc(db, "cards", localStorage.getItem("userId")), { cards: [{ ...creditCardObj, id: newCardId }] }, { merge: true })
                dispatch(SeteDefaultCard({ ...creditCardObj, id: newCardId }))
                dispatch(showTenDone([, "Card saved successfully"]))
                return [{ ...creditCardObj, id: newCardId }];
            }
        } catch (error) {
            dispatch(showTenDone([false, "Failed to save your card "]))
            return rejectWithValue(error.message);
        }

    }
)
export const UpdateCard = createAsyncThunk(
    "peymenthMethodSlice/UpdateCard",
    async (newObject, { getState, rejectWithValue, dispatch }) => {
        try {
            let repsonce = await getDoc(doc(db, "cards", localStorage.getItem('userId')));
            let AllCards = repsonce.data().cards;
            let newObjectUpdate = AllCards.map(elm => elm.id == newObject.id ? elm = newObject : elm)
            await updateDoc(doc(db, "cards", localStorage.getItem('userId')), { cards: newObjectUpdate })
            dispatch(showTenDone([, "Card Upadted successfully"]))
            return newObjectUpdate;

        } catch (error) {
            dispatch(showTenDone([false, "Failed to Updated your card "]))
            return rejectWithValue(error.message);
        }

    }
)

export const DeleteCard = createAsyncThunk(
    "peymenthMethod/DeleteCard",
    async (id, { rejectWithValue, dispatch, getState }) => {
        try {

            const { AllPaymenthMethod } = getState().paymentMethod;
            let NewCardList = AllPaymenthMethod.filter(c => c.id != id)
            await updateDoc(doc(db, 'cards', localStorage.getItem("userId")), { cards: NewCardList });
            dispatch(showTenDone([, "Payment method deleted successfully !"]))
            return NewCardList

        } catch (error) {
            console.log(error.message);
            dispatch(showTenDone([false, " Failed to remove the payment Method !"]))
            return rejectWithValue(error.message)
        }
    }
)
export const SetCardAsDef = createAsyncThunk(
    "peymenthMethod/SetCardAsDef",
    async (id, { rejectWithValue, dispatch, getState }) => {
        try {
            const resp = await getDoc(doc(db, 'cards', localStorage.getItem("userId")));
            let AllPaymenthMethod = resp.data().cards;
            AllPaymenthMethod.map(c => c.id == id ? c.isDefault = true : c.isDefault = false)
            await updateDoc(doc(db, 'cards', localStorage.getItem("userId")), { cards: AllPaymenthMethod });
            dispatch(showTenDone([, "Default Payment method Changed !"]))
            return AllPaymenthMethod
        } catch (error) {
            dispatch(showTenDone([false, " Failed to Change default  payment Method !"]))
            return rejectWithValue(error.message)
        }
    }
)



const peymenthMethodSlice = createSlice({
    name: "peymenthMethod",
    initialState: {
        isVisible: false,
        havePaymenthMethod: false,
        defaultPaymenthMethod: null,
        AllPaymenthMethod: [],
        isLodingPay: true,
        isDeletting: false,
        errors: null,
        address_updated_success: false,
        address_added_success: false,
        // -----
        ObjectToUpdate: null,
        updattingVSCL: false,
    },
    reducers: {
        ShowAddPaymenthMethod: (state) => {
            state.isVisible = true;
        },
        HideAddPaymenthMethod: (state) => {
            state.isVisible = false;
        },
        SeteDefaultCard: (action, state) => {
            state.defaultPaymenthMethod = action.payload
        },
        showUpatePaymentMethod: (state, action) => {
            state.ObjectToUpdate = action.payload;
            state.updattingVSCL = true
        },
        hideUpatePaymentMethod: (state) => {
            state.updattingVSCL = false
        },
        resedAddUptatingPaymentMethStatus: (state, action) => {
            if (action.payload == 1) {
                state.address_added_success = false;
            } else if (action.payload == 2) {
                state.address_updated_success = false;
            }
        }

    },
    extraReducers: (builder) => {
        builder
            .addCase(SubmitCard.pending, state => {
                state.isLodingPay = true
            })
            .addCase(SubmitCard.fulfilled, (state, action) => {
                state.isVisible = false
                state.havePaymenthMethod = true
                state.AllPaymenthMethod = action.payload;
                state.defaultPaymenthMethod = action.payload.filter(c => c.isDefault == true)[0]
                state.isLodingPay = false
                state.address_added_success = true
            })
            .addCase(SubmitCard.rejected, (state, action) => {
                state.isLodingPay = false
            })
            // ----
            .addCase(getDefaultCard.pending, state => {
                state.isLodingPay = true
            })
            .addCase(getDefaultCard.fulfilled, (state, action) => {
                state.AllPaymenthMethod = action.payload;
                state.defaultPaymenthMethod = action.payload.filter(c => c.isDefault == true)[0]
                state.havePaymenthMethod = true
                state.isLodingPay = false
            })
            .addCase(getDefaultCard.rejected, (state, action) => {
                state.isLodingPay = false
                state.havePaymenthMethod = false
            })
            // -----------------------------
            .addCase(DeleteCard.pending, state => {
                state.isLodingPay = true
            })
            .addCase(DeleteCard.fulfilled, (state, action) => {
                state.AllPaymenthMethod = action.payload;
                state.defaultPaymenthMethod = action.payload.filter(c => c.isDefault == true)[0]
                state.isLodingPay = false
            })
            .addCase(DeleteCard.rejected, (state) => {
                state.isLodingPay = false
            })
            // -------------------
            .addCase(SetCardAsDef.pending, state => {
                state.isLodingPay = true
            })
            .addCase(SetCardAsDef.fulfilled, (state, action) => {
                state.AllPaymenthMethod = action.payload;
                state.defaultPaymenthMethod = action.payload.filter(c => c.isDefault == true)[0]
                state.isLodingPay = false
            })
            .addCase(SetCardAsDef.rejected, (state) => {
                state.isLodingPay = false
            })
            // ----
            .addCase(UpdateCard.pending, state => {
                state.isLodingPay = true
            })
            .addCase(UpdateCard.fulfilled, (state, action) => {
                state.AllPaymenthMethod = action.payload;
                state.defaultPaymenthMethod = action.payload.filter(c => c.isDefault == true)[0]
                state.isLodingPay = false
                state.updattingVSCL = false
                state.address_updated_success = true
            })
            .addCase(UpdateCard.rejected, (state) => {
                state.isLodingPay = false
            })

    }
});

export const { HideAddPaymenthMethod, ShowAddPaymenthMethod, SeteDefaultCard, showUpatePaymentMethod, hideUpatePaymentMethod, resedAddUptatingPaymentMethStatus } = peymenthMethodSlice.actions
export default peymenthMethodSlice.reducer;



export const AddPaymenthMethod = () => {
    const { user } = useSelector(s => s.authe);
    const OnPc = window.innerWidth > 800;
    const MainPaymeRef = useRef();
    const navigate = useNavigate()
    const { isLodingPay, havePaymenthMethod, address_added_success } = useSelector(s => s.paymentMethod)
    const [cardObje, setCardObje] = useState({
        CardholderName: user?.name, CardNumber: "", ExpiryDate: "", SecurityCode: "", isDefault: !havePaymenthMethod, cardType: ""
    });
    const [ALlFeildAdded, setALlFeildAdded] = useState(false)
    const updateCardObject = (e) => setCardObje(curren => ({ ...curren, [e.target.id]: e.target.value }))
    const dispatch = useDispatch();
    const SendToSubmitCard = () => {
        dispatch(SubmitCard(cardObje));
    }
    useEffect(() => {
        setALlFeildAdded(Object.keys(cardObje).some(k => cardObje[k] == "" && k != 'isDefault'))
    }, [cardObje])
    useEffect(() => {
        if (address_added_success) {
            dispatch(resedAddUptatingPaymentMethStatus(1))
            navigate(-1)
        }
    }, [address_added_success])
    if (OnPc) {

        return ReactDom.createPortal(
            <div className="backendMer">
                <div className="AddCardCmp activeCmp c-p-s psr p20  bg-l w600 h700 br20">
                    {
                        isLodingPay ? <div className="loader"></div>
                            :
                            <>
                                <button className='btnClose' onClick={() => dispatch(HideAddPaymenthMethod())}><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" /></svg></button>
                                <h1 className='r-s-c wmia pb20 mb20' style={{ borderBottom: "solid 1px var(--border-color)" }}>
                                    <svg version="1.1" viewBox="0 0 2048 2048" className='mr10' xmlns="http://www.w3.org/2000/svg">
                                        <path transform="translate(259,107)" d="m0 0h1529l32 3 26 5 20 6 20 8 26 13 19 12 16 12 14 12 15 15 7 8 12 15 14 22 12 23 9 19 9 25 6 18 1 6h2v1038l-4 2-12 14-10 8-16 8-13 4-7-2-12-4-12-8-18-18-4-15-1-9-1-27v-566h-1751l-79-1v559l1 37 3 29 4 17 6 16 8 16 7 11 10 13 18 18 14 10 21 12 16 7 15 4 25 4 33 2 151 1h657l42 1 10 2 14 7 7 6 8 11 5 13 1 5v17l-3 11-7 11-9 10-7 7-11 4-9 1-42 1h-820l-39-2-28-4-23-6-19-7-24-11-14-8-12-8-11-8-13-11-12-11-13-13-9-11-13-17-12-19-10-19-10-25-7-19-5-16-2-2v-1071l3-7 10-29 13-33 12-22 9-14 8-12 12-14 7-8 14-14 10-8 11-9 15-10 21-12 26-12 21-7 29-6 22-3zm158 107-133 1-37 2-25 4-15 5-21 11-14 10-14 12-11 12-12 16-9 16-7 15-5 14-3 11-3 27-1 36v240l398 1h1431l1-1 1-21v-256l-3-25-4-17-6-15-8-16-7-12-10-13-14-15-13-10-13-8-14-8-21-8-11-3-26-3-22-1-99-1z" />
                                        <path transform="translate(1658,1186)" d="m0 0h21l10 3 12 6 11 10 8 11 4 13v280h258l22 1 10 3 10 6 8 7 7 8 5 5v2h2l2 3v38l-4 2-9 10-14 14-9 5-13 2-26 1h-248l-1 248-1 29-2 10-6 11-8 10-10 8-11 4-11 2-15-1-16-5-8-6-11-11-6-11-2-9-1-15-1-45-1-140 1-79-21 1-252-1-16-3-7-4-11-11-9-12-5-10-1-5v-15l3-12 7-12 8-10 8-7 12-6h282l1-5 1-266 2-14 6-12 9-11 10-8 12-6z" />
                                        <path transform="translate(515,1077)" d="m0 0h145l40 1 16 2 10 4 10 7 9 10 5 10 3 11v15l-2 10-4 9-7 10-12 12-10 4-20 2-23 1-102 1h-33l-56-1-16-2-10-4-10-9-8-10-7-12-2-7v-19l4-12 6-10 8-10 7-6 10-5 4-1z" />
                                        <path transform="translate(0,317)" d="m0 0h1v7h-1z" />
                                        <path transform="translate(2047,307)" d="m0 0 1 4-2-1z" />
                                        <path transform="translate(2047,325)" d="m0 0" />
                                        <path transform="translate(2047,1541)" d="m0 0" />
                                        <path transform="translate(2044,1374)" d="m0 0" />
                                        <path transform="translate(2046,1373)" d="m0 0" />
                                        <path transform="translate(2047,1372)" d="m0 0" />
                                    </svg>
                                    Add credit or debit card
                                </h1>
                                <p className="mt10 mb20 r-c-c">
                                    We apologize ! Currently, we only accept credit cards as a payment method. However, we’re working on adding more options to make your experience smoother in the future. Stay tuned!
                                </p>
                                <div className="LabelInpInfo mt15">
                                    <input onChange={updateCardObject} className='' id='CardholderName' type="text" placeholder='' />
                                    <label htmlFor="CardholderName">Cardholder Name</label>
                                    <svg xmlns="http://www.w3.org/2000/svg" className='iconeLabelInpinfo w30 h30' viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q53 0 100-15.5t86-44.5q-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160Zm0-360q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm0-60Zm0 360Z" /></svg>
                                </div>
                                <div className="LabelInpInfo">
                                    <input onChange={updateCardObject} className='' id='CardNumber' type="text" placeholder='' />
                                    <label htmlFor="CardNumber">Card Number</label>
                                    <svg xmlns="http://www.w3.org/2000/svg" className='iconeLabelInpinfo w30 h30' viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm100-200h46v-240h-36l-70 50 24 36 36-26v180Zm124 0h156v-40h-94l-2-2q21-20 34.5-34t21.5-22q18-18 27-36t9-38q0-29-22-48.5T458-600q-26 0-47 15t-29 39l40 16q5-13 14.5-20.5T458-558q15 0 24.5 8t9.5 20q0 11-4 20.5T470-486l-32 32-54 54v40Zm296 0q36 0 58-20t22-52q0-18-10-32t-28-22v-2q14-8 22-20.5t8-29.5q0-27-21-44.5T678-600q-25 0-46.5 14.5T604-550l40 16q4-12 13-19t21-7q13 0 21.5 7.5T708-534q0 14-10 22t-26 8h-18v40h20q20 0 31 8t11 22q0 13-11 22.5t-25 9.5q-17 0-26-7.5T638-436l-40 16q7 29 28.5 44.5T680-360ZM160-240h640v-480H160v480Zm0 0v-480 480Z" /></svg>  </div>
                                <div className="r-b-c containerInpCodeSec wmia mb15 pr10">
                                    <div className="LabelInpInfo pr10">
                                        <input onChange={updateCardObject} className='' id='ExpiryDate' type="month" placeholder='' />
                                        <label htmlFor="ExpiryDate">Expiry Date (MM/YY)</label>
                                        <svg xmlns="http://www.w3.org/2000/svg" className='iconeLabelInpinfo w30 h30' viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Z" /></svg>
                                    </div>
                                    <div className="LabelInpInfo">
                                        <input onChange={updateCardObject} className='' id='SecurityCode' type="text" placeholder='' />
                                        <label htmlFor="SecurityCode">Security code</label>
                                        <svg xmlns="http://www.w3.org/2000/svg" className='iconeLabelInpinfo w30 h30' viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M280-240q-100 0-170-70T40-480q0-100 70-170t170-70q66 0 121 33t87 87h432v240h-80v120H600v-120H488q-32 54-87 87t-121 33Zm0-80q66 0 106-40.5t48-79.5h246v120h80v-120h80v-80H434q-8-39-48-79.5T280-640q-66 0-113 47t-47 113q0 66 47 113t113 47Zm0-80q33 0 56.5-23.5T360-480q0-33-23.5-56.5T280-560q-33 0-56.5 23.5T200-480q0 33 23.5 56.5T280-400Zm0-80Z" /></svg>
                                    </div>
                                </div>
                                <div className=" r-p-c wmia cntCardsTypes mb15">
                                    <span onClick={() => { setCardObje(c => ({ ...c, cardType: "visa" })) }} id={cardObje.cardType == "visa" ? "active" : null} className="p10 psr br10"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" /></svg> <img src="imgs/V-removebg-preview.png" alt="" /></span>
                                    <span onClick={() => { setCardObje(c => ({ ...c, cardType: "mastercard" })) }} id={cardObje.cardType == "mastercard" ? "active" : null} className="p10 br10 psr"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" /></svg> <img src="imgs/Mastercard_logo_svg_free_download-removebg-preview.png" alt="" /></span>
                                    <span onClick={() => { setCardObje(c => ({ ...c, cardType: "americanexpress" })) }} id={cardObje.cardType == "americanexpress" ? "active" : null} className="p10 psr br10"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" /></svg> <img src="imgs/E-Ticket-removebg-preview.png" alt="" /></span>
                                    <span onClick={() => { setCardObje(c => ({ ...c, cardType: "discover" })) }} id={cardObje.cardType == "discover" ? "active" : null} className="p10 br10 psr"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" /></svg> <img src="imgs/Discover-removebg-preview.png" alt="" /></span>
                                </div>
                                {havePaymenthMethod &&
                                    <div className="LabelinpCheck mt20">
                                        <input onChange={() => setCardObje(cu => ({ ...cu, isDefault: !cardObje.isDefault }))} type="checkbox" id='seAsDef' />
                                        <span></span>
                                        <label htmlFor="seAsDef" className='mb15'>Set as your default payment method</label>
                                    </div>
                                }
                                <button onClick={SendToSubmitCard} disabled={ALlFeildAdded} className='bl w200 br20 p10' style={{ alignSelf: "end" }}>Save Card <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M200-120v-640q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v640L480-240 200-120Zm80-122 200-86 200 86v-518H280v518Zm0-518h400-400Z" /></svg></button>

                            </>
                    }
                </div>
            </div>
            , document.getElementById('portlas')
        )
    } else {
        useEffect(() => {
            MainPaymeRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            })

        }, [])

        return (
            <>
                <div className="c-p-s psr  wmia" style={{
                    paddingTop: "300px"
                }} ref={MainPaymeRef}>
                    {
                        isLodingPay ? <div className="loader"></div>
                            :
                            <>
                                <img src="imgs/rb_2148319390-removebg-preview.png" alt="" className="wmia FielsDesSds" />
                                <div className='wmia  bg-l p20 br20 c-p-s' style={{
                                    filter: " drop-shadow(0 0 10px var(--filter-color))"
                                }}>
                                    <h1 className='r-s-c wmia pb20 mb20' style={{ borderBottom: "solid 1px var(--border-color)" }}>
                                        <svg version="1.1" viewBox="0 0 2048 2048" className='mr10' xmlns="http://www.w3.org/2000/svg">
                                            <path transform="translate(259,107)" d="m0 0h1529l32 3 26 5 20 6 20 8 26 13 19 12 16 12 14 12 15 15 7 8 12 15 14 22 12 23 9 19 9 25 6 18 1 6h2v1038l-4 2-12 14-10 8-16 8-13 4-7-2-12-4-12-8-18-18-4-15-1-9-1-27v-566h-1751l-79-1v559l1 37 3 29 4 17 6 16 8 16 7 11 10 13 18 18 14 10 21 12 16 7 15 4 25 4 33 2 151 1h657l42 1 10 2 14 7 7 6 8 11 5 13 1 5v17l-3 11-7 11-9 10-7 7-11 4-9 1-42 1h-820l-39-2-28-4-23-6-19-7-24-11-14-8-12-8-11-8-13-11-12-11-13-13-9-11-13-17-12-19-10-19-10-25-7-19-5-16-2-2v-1071l3-7 10-29 13-33 12-22 9-14 8-12 12-14 7-8 14-14 10-8 11-9 15-10 21-12 26-12 21-7 29-6 22-3zm158 107-133 1-37 2-25 4-15 5-21 11-14 10-14 12-11 12-12 16-9 16-7 15-5 14-3 11-3 27-1 36v240l398 1h1431l1-1 1-21v-256l-3-25-4-17-6-15-8-16-7-12-10-13-14-15-13-10-13-8-14-8-21-8-11-3-26-3-22-1-99-1z" />
                                            <path transform="translate(1658,1186)" d="m0 0h21l10 3 12 6 11 10 8 11 4 13v280h258l22 1 10 3 10 6 8 7 7 8 5 5v2h2l2 3v38l-4 2-9 10-14 14-9 5-13 2-26 1h-248l-1 248-1 29-2 10-6 11-8 10-10 8-11 4-11 2-15-1-16-5-8-6-11-11-6-11-2-9-1-15-1-45-1-140 1-79-21 1-252-1-16-3-7-4-11-11-9-12-5-10-1-5v-15l3-12 7-12 8-10 8-7 12-6h282l1-5 1-266 2-14 6-12 9-11 10-8 12-6z" />
                                            <path transform="translate(515,1077)" d="m0 0h145l40 1 16 2 10 4 10 7 9 10 5 10 3 11v15l-2 10-4 9-7 10-12 12-10 4-20 2-23 1-102 1h-33l-56-1-16-2-10-4-10-9-8-10-7-12-2-7v-19l4-12 6-10 8-10 7-6 10-5 4-1z" />
                                            <path transform="translate(0,317)" d="m0 0h1v7h-1z" />
                                            <path transform="translate(2047,307)" d="m0 0 1 4-2-1z" />
                                            <path transform="translate(2047,325)" d="m0 0" />
                                            <path transform="translate(2047,1541)" d="m0 0" />
                                            <path transform="translate(2044,1374)" d="m0 0" />
                                            <path transform="translate(2046,1373)" d="m0 0" />
                                            <path transform="translate(2047,1372)" d="m0 0" />
                                        </svg>
                                        Add credit or debit card
                                    </h1>
                                    <p className="mt10 mb20 r-c-c">
                                        We apologize ! Currently, we only accept credit cards as a payment method. However, we’re working on adding more options to make your experience smoother in the future. Stay tuned!
                                    </p>
                                    <div className="LabelInpInfo mt50">
                                        <input onChange={updateCardObject} className='' id='CardholderName' type="text" placeholder='' />
                                        <label htmlFor="CardholderName">Cardholder Name</label>
                                        <svg xmlns="http://www.w3.org/2000/svg" className='iconeLabelInpinfo w30 h30' viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q53 0 100-15.5t86-44.5q-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160Zm0-360q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm0-60Zm0 360Z" /></svg>
                                    </div>
                                    <div className="LabelInpInfo mt20">
                                        <input onChange={updateCardObject} className='' id='CardNumber' type="text" placeholder='' />
                                        <label htmlFor="CardNumber">Card Number</label>
                                        <svg xmlns="http://www.w3.org/2000/svg" className='iconeLabelInpinfo w30 h30' viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm100-200h46v-240h-36l-70 50 24 36 36-26v180Zm124 0h156v-40h-94l-2-2q21-20 34.5-34t21.5-22q18-18 27-36t9-38q0-29-22-48.5T458-600q-26 0-47 15t-29 39l40 16q5-13 14.5-20.5T458-558q15 0 24.5 8t9.5 20q0 11-4 20.5T470-486l-32 32-54 54v40Zm296 0q36 0 58-20t22-52q0-18-10-32t-28-22v-2q14-8 22-20.5t8-29.5q0-27-21-44.5T678-600q-25 0-46.5 14.5T604-550l40 16q4-12 13-19t21-7q13 0 21.5 7.5T708-534q0 14-10 22t-26 8h-18v40h20q20 0 31 8t11 22q0 13-11 22.5t-25 9.5q-17 0-26-7.5T638-436l-40 16q7 29 28.5 44.5T680-360ZM160-240h640v-480H160v480Zm0 0v-480 480Z" /></svg>  </div>
                                    <div className="r-b-c containerInpCodeSec mt20 wmia mb15 pr10">
                                        <div className="LabelInpInfo pr10">
                                            <input onChange={updateCardObject} className='' id='ExpiryDate' type="month" placeholder='' />
                                            <label htmlFor="ExpiryDate">Expiry Date (MM/YY)</label>
                                            <svg xmlns="http://www.w3.org/2000/svg" className='iconeLabelInpinfo w30 h30' viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Z" /></svg>
                                        </div>
                                        <div className="LabelInpInfo">
                                            <input onChange={updateCardObject} className='' id='SecurityCode' type="text" placeholder='' />
                                            <label htmlFor="SecurityCode">Security code</label>
                                            <svg xmlns="http://www.w3.org/2000/svg" className='iconeLabelInpinfo w30 h30' viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M280-240q-100 0-170-70T40-480q0-100 70-170t170-70q66 0 121 33t87 87h432v240h-80v120H600v-120H488q-32 54-87 87t-121 33Zm0-80q66 0 106-40.5t48-79.5h246v120h80v-120h80v-80H434q-8-39-48-79.5T280-640q-66 0-113 47t-47 113q0 66 47 113t113 47Zm0-80q33 0 56.5-23.5T360-480q0-33-23.5-56.5T280-560q-33 0-56.5 23.5T200-480q0 33 23.5 56.5T280-400Zm0-80Z" /></svg>
                                        </div>
                                    </div>
                                    <div className=" r-p-c wmia cntCardsTypes mb15">
                                        <span onClick={() => { setCardObje(c => ({ ...c, cardType: "visa" })) }} id={cardObje.cardType == "visa" ? "active" : null} className="p10 psr br10"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" /></svg> <img src="imgs/V-removebg-preview.png" alt="" /></span>
                                        <span onClick={() => { setCardObje(c => ({ ...c, cardType: "mastercard" })) }} id={cardObje.cardType == "mastercard" ? "active" : null} className="p10 br10 psr"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" /></svg> <img src="imgs/Mastercard_logo_svg_free_download-removebg-preview.png" alt="" /></span>
                                        <span onClick={() => { setCardObje(c => ({ ...c, cardType: "americanexpress" })) }} id={cardObje.cardType == "americanexpress" ? "active" : null} className="p10 psr br10"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" /></svg> <img src="imgs/E-Ticket-removebg-preview.png" alt="" /></span>
                                        <span onClick={() => { setCardObje(c => ({ ...c, cardType: "discover" })) }} id={cardObje.cardType == "discover" ? "active" : null} className="p10 br10 psr"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" /></svg> <img src="imgs/Discover-removebg-preview.png" alt="" /></span>
                                    </div>
                                    {havePaymenthMethod &&
                                        <div className="LabelinpCheck mt20">
                                            <input onChange={() => setCardObje(cu => ({ ...cu, isDefault: !cardObje.isDefault }))} type="checkbox" id='seAsDef' />
                                            <span></span>
                                            <label htmlFor="seAsDef" className='mb15'>Set as your default payment method</label>
                                        </div>
                                    }
                                    <button onClick={SendToSubmitCard} disabled={ALlFeildAdded} className='bl wmia br20 p5 mt50230' style={{ alignSelf: "end" }}>Save Card <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M200-120v-640q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v640L480-240 200-120Zm80-122 200-86 200 86v-518H280v518Zm0-518h400-400Z" /></svg></button>
                                </div>
                            </>
                    }
                </div>
            </>
        )
    }
}
export const UpdatePaymenthMethod = () => {
    const { isLodingPay, havePaymenthMethod, address_updated_success, ObjectToUpdate } = useSelector(s => s.paymentMethod)
    const [cardObje, setCardObje] = useState({
        id: ObjectToUpdate?.id,
        CardholderName: ObjectToUpdate?.CardholderName,
        CardNumber: ObjectToUpdate?.CardNumber,
        ExpiryDate: ObjectToUpdate?.ExpiryDate,
        SecurityCode: ObjectToUpdate?.SecurityCode,
        isDefault: ObjectToUpdate?.isDefault,
        cardType: ObjectToUpdate?.cardType
    });
    const navigate = useNavigate();

    const MainPaymeRef = useRef();
    const OnPc = window.innerWidth > 800;

    const [ALlFeildAdded, setALlFeildAdded] = useState(false)
    const updateCardObject = (e) => setCardObje(curren => ({ ...curren, [e.target.id]: e.target.value }))
    const dispatch = useDispatch();

    const SendToUpdatetCard = () => {
        dispatch(UpdateCard(cardObje));
    }


    useEffect(() => {

        if (ObjectToUpdate == null) {
            navigate(-1);
        }
    }, [ObjectToUpdate])

    useEffect(() => {
        if (address_updated_success) {
            dispatch(resedAddUptatingPaymentMethStatus(2))
            navigate(-1)
        }
    }, [address_updated_success])

    useEffect(() => {
        ObjectToUpdate != null && setALlFeildAdded(Object.keys(cardObje).some(k => cardObje[k] != ObjectToUpdate[k]))
    }, [cardObje])
    if (OnPc) {
        return ReactDom.createPortal(
            <div className="backendMer">
                <div className="AddCardCmp activeCmp c-p-s psr p20  bg-l w600 h700 br20">
                    {
                        isLodingPay ? <div className="loader"></div>
                            :
                            <>
                                <button className='btnClose' onClick={() => dispatch(hideUpatePaymentMethod())}><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" /></svg></button>
                                <h1 className='r-s-c wmia pb20 mb20' style={{ borderBottom: "solid 1px var(--border-color)" }}>
                                    <svg version="1.1" viewBox="0 0 2048 2048" className='mr10' xmlns="http://www.w3.org/2000/svg">
                                        <path transform="translate(1180,189)" d="m0 0h22l22 4 34 8 29 9 31 11 38 15 35 16 36 18 21 12 22 13 42 28 18 13 18 14 14 11 15 13 10 8 17 16 12 11 32 32 7 8 12 13 11 13 9 11 10 12 12 16 12 17 13 19 13 20 11 18 12 21 12 23 10 19 15 33 12 29 13 36 10 32 10 36 9 42 7 41 5 45 3 41 1 22v46l-2 33-7 62-6 35-12 51-14 49-9 26-13 34-11 26-11 24-10 19-14 27-11 18-13 21-10 15-11 17-14 19-11 14-9 11-11 14-11 13-7 8-11 12-7 7-6 7-13 13-10 8-3 3h-2l-1 4 3 6 11 12 73 73v2h2l7 8 13 13 10 13 5 10 1 11-2 11-6 12-9 10-13 8-10 1h-374l-11-2-8-4-5-4-8-11-4-8-2-10-1-16-1-31v-273l1-55 3-12 7-11 8-7 15-7 6-2h9l11 4 11 7 13 11 100 100 2 1v2l4 2 2 4h2l7 8 5 1 8-6 21-21 7-8 7-7 7-8 13-16 8-9 8-10 9-12 11-15 9-14 10-15 13-22 13-24 16-32 15-37 9-25 8-25 10-38 6-27 6-36 3-25 3-46v-46l-3-44-4-30-7-38-7-31-9-32-14-41-15-36-14-29-14-27-17-28-11-18-8-11-14-19-12-16-8-10-9-11-12-13-7-8-30-30-8-7-14-12-13-11-32-24-25-17-19-12-26-15-35-18-33-15-37-14-32-10-42-12-15-6-11-6-10-9-7-6-11-15-7-16-4-15v-21l6-21 8-14 7-9 9-10 14-10 17-8z" />
                                        <path transform="translate(471,212)" d="m0 0h77l161 1 24 1 9 3 10 6 8 7 5 9 1 5 1 17v363l-1 12-4 8-7 7-12 7-9 7-6 3-4-1-10-3-15-9-10-9-8-7-112-112-7-2-8 7-9 10-20 20-9 11-12 14-26 32-4 6-10 14-9 14-9 13-13 22-8 14-20 40-14 32-11 29-11 34-14 56-5 27-5 44-3 49v32l2 32 5 45 5 30 8 34 10 37 11 33 11 28 15 33 8 17 12 22 10 17 11 18 8 12 12 17 13 18 11 14 11 13 13 15 7 7 7 8 21 21 8 7 12 11 11 9 13 11 14 11 16 12 26 17 16 10 14 8 18 10 23 12 20 9 15 7 27 11 23 8 40 12 30 10 11 5 12 7 9 7 9 9 10 16 7 17 2 8v21l-3 13-8 18-8 12-11 12-9 7-16 8-14 4-17 2-14-1-13-2-36-9-29-9-26-9-36-14-30-13-32-15-22-12-18-10-25-15-39-26-14-10-12-9-14-11-13-11-10-8-15-13-13-12-7-7-8-7-12-12v-2h-2l-7-8-14-14-9-11-10-11-9-11-12-15-13-17-14-19-11-16-10-15-11-18-16-27-12-23-10-19-15-32-16-40-13-37-10-34-10-38-9-46-6-40-4-35-2-31-1-26v-38l2-35 5-49 7-45 10-45 8-30 11-36 7-20 10-26 10-24 11-24 8-17 10-19 12-23 9-15 11-18 7-10 7-11 16-24 8-10 20-26 14-18 9-11 13-15 31-31 8-7 6-7-1-5-9-11-56-56-7-8-27-27-7-8-10-12-6-11-1-3v-10l4-13 7-12 8-8 9-5 4-1z" />
                                        <path transform="translate(1376,726)" d="m0 0h13l17 3 17 6 14 9 10 9 11 14 9 17 4 16v27l-3 12-11 19-9 12-11 13-466 466-11 9-11 8-10 6-23 7-15 2-16-2-15-5-11-6-9-7-14-12-20-20-8-7v-2l-4-2v-2l-3-1-5-5v-2l-4-2-4-4v-2l-3-1-5-5v-2l-4-2v-2l-3-1-5-6-6-5-7-8-7-7-6-5-7-8-5-4-7-8-71-71-7-6-5-6-4-3v-2l-4-2-8-8v-2l-4-2v-2l-3-1-7-8-8-8-8-10-8-13-7-14-3-10-1-7v-9l2-16 4-13 10-19 11-13 13-10 16-8 19-5 11-1 15 2 16 5 14 7 11 8 10 9 115 115 8 7 47 47 5 4 4-1 6-7h2l2-4 12-12h2v-2h2v-2h2l2-4 14-14 6-7 8-7 290-290 7-8 53-53 8-7 12-10 13-8 11-5 11-3z" />
                                    </svg>

                                    Update  credit or debit card </h1>
                                <p className="mt10 mb20 r-c-c">
                                    We apologize ! Currently, we only accept credit cards as a payment method. However, we’re working on adding more options to make your experience smoother in the future. Stay tuned!
                                </p>
                                <div className="LabelInpInfo mt15">
                                    <input value={cardObje.CardholderName} onChange={updateCardObject} className='' id='CardholderName' type="text" placeholder='' />
                                    <label htmlFor="CardholderName">Cardholder Name</label>
                                    <svg xmlns="http://www.w3.org/2000/svg" className='iconeLabelInpinfo w30 h30' viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q53 0 100-15.5t86-44.5q-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160Zm0-360q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm0-60Zm0 360Z" /></svg>
                                </div>
                                <div className="LabelInpInfo">
                                    <input value={cardObje.CardNumber} onChange={updateCardObject} className='' id='CardNumber' type="text" placeholder='' />
                                    <label htmlFor="CardNumber">Card Number</label>
                                    <svg xmlns="http://www.w3.org/2000/svg" className='iconeLabelInpinfo w30 h30' viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm100-200h46v-240h-36l-70 50 24 36 36-26v180Zm124 0h156v-40h-94l-2-2q21-20 34.5-34t21.5-22q18-18 27-36t9-38q0-29-22-48.5T458-600q-26 0-47 15t-29 39l40 16q5-13 14.5-20.5T458-558q15 0 24.5 8t9.5 20q0 11-4 20.5T470-486l-32 32-54 54v40Zm296 0q36 0 58-20t22-52q0-18-10-32t-28-22v-2q14-8 22-20.5t8-29.5q0-27-21-44.5T678-600q-25 0-46.5 14.5T604-550l40 16q4-12 13-19t21-7q13 0 21.5 7.5T708-534q0 14-10 22t-26 8h-18v40h20q20 0 31 8t11 22q0 13-11 22.5t-25 9.5q-17 0-26-7.5T638-436l-40 16q7 29 28.5 44.5T680-360ZM160-240h640v-480H160v480Zm0 0v-480 480Z" /></svg>  </div>
                                <div className="r-b-c containerInpCodeSec wmia mb15 pr10">
                                    <div className="LabelInpInfo pr10">
                                        <input value={cardObje.ExpiryDate} onChange={updateCardObject} className='' id='ExpiryDate' type="month" placeholder='' />
                                        <label htmlFor="ExpiryDate">Expiry Date (MM/YY)</label>
                                        <svg xmlns="http://www.w3.org/2000/svg" className='iconeLabelInpinfo w30 h30' viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Z" /></svg>
                                    </div>
                                    <div className="LabelInpInfo">
                                        <input value={cardObje.SecurityCode} onChange={updateCardObject} className='' id='SecurityCode' type="text" placeholder='' />
                                        <label htmlFor="SecurityCode">Security code</label>
                                        <svg xmlns="http://www.w3.org/2000/svg" className='iconeLabelInpinfo w30 h30' viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M280-240q-100 0-170-70T40-480q0-100 70-170t170-70q66 0 121 33t87 87h432v240h-80v120H600v-120H488q-32 54-87 87t-121 33Zm0-80q66 0 106-40.5t48-79.5h246v120h80v-120h80v-80H434q-8-39-48-79.5T280-640q-66 0-113 47t-47 113q0 66 47 113t113 47Zm0-80q33 0 56.5-23.5T360-480q0-33-23.5-56.5T280-560q-33 0-56.5 23.5T200-480q0 33 23.5 56.5T280-400Zm0-80Z" /></svg>
                                    </div>
                                </div>
                                <div className=" r-p-c wmia cntCardsTypes mb15">
                                    <span onClick={() => { setCardObje(c => ({ ...c, cardType: "visa" })) }} id={cardObje.cardType == "visa" ? "active" : null} className="p10 psr br10"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" /></svg> <img src="imgs/V-removebg-preview.png" alt="" /></span>
                                    <span onClick={() => { setCardObje(c => ({ ...c, cardType: "mastercard" })) }} id={cardObje.cardType == "mastercard" ? "active" : null} className="p10 br10 psr"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" /></svg> <img src="imgs/Mastercard_logo_svg_free_download-removebg-preview.png" alt="" /></span>
                                    <span onClick={() => { setCardObje(c => ({ ...c, cardType: "americanexpress" })) }} id={cardObje.cardType == "americanexpress" ? "active" : null} className="p10 psr br10"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" /></svg> <img src="imgs/E-Ticket-removebg-preview.png" alt="" /></span>
                                    <span onClick={() => { setCardObje(c => ({ ...c, cardType: "discover" })) }} id={cardObje.cardType == "discover" ? "active" : null} className="p10 br10 psr"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" /></svg> <img src="imgs/Discover-removebg-preview.png" alt="" /></span>
                                </div>

                                <button onClick={SendToUpdatetCard} disabled={!ALlFeildAdded} className='bl w200 br20 p10' style={{ alignSelf: "end" }}>Save changes <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M200-120v-640q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v640L480-240 200-120Zm80-122 200-86 200 86v-518H280v518Zm0-518h400-400Z" /></svg></button>

                            </>
                    }
                </div>
            </div>
            , document.getElementById('portlas')
        )
    } else {
        useEffect(() => {
            MainPaymeRef.current?.scrollIntoView({
                behavior: "smooth", block: "start"
            })
        }, [])

        return (
            <div ref={MainPaymeRef} className=" c-p-s psr wmia " style={{
                paddingTop: "300px"
            }}>
                {
                    isLodingPay ? <div className="loader"></div>
                        :
                        <>
                            <img src="imgs/rb_2148319390-removebg-preview.png" alt="" className="wmia FielsDesSds" />
                            <div className='wmia  bg-l p20 br20 c-p-s' style={{
                                filter: " drop-shadow(0 0 10px var(--filter-color))"
                            }}>
                                <h1 className='r-s-c wmia pb20 mb20' style={{ borderBottom: "solid 1px var(--border-color)" }}>
                                    <svg version="1.1" viewBox="0 0 2048 2048" className='mr10' xmlns="http://www.w3.org/2000/svg">
                                        <path transform="translate(1180,189)" d="m0 0h22l22 4 34 8 29 9 31 11 38 15 35 16 36 18 21 12 22 13 42 28 18 13 18 14 14 11 15 13 10 8 17 16 12 11 32 32 7 8 12 13 11 13 9 11 10 12 12 16 12 17 13 19 13 20 11 18 12 21 12 23 10 19 15 33 12 29 13 36 10 32 10 36 9 42 7 41 5 45 3 41 1 22v46l-2 33-7 62-6 35-12 51-14 49-9 26-13 34-11 26-11 24-10 19-14 27-11 18-13 21-10 15-11 17-14 19-11 14-9 11-11 14-11 13-7 8-11 12-7 7-6 7-13 13-10 8-3 3h-2l-1 4 3 6 11 12 73 73v2h2l7 8 13 13 10 13 5 10 1 11-2 11-6 12-9 10-13 8-10 1h-374l-11-2-8-4-5-4-8-11-4-8-2-10-1-16-1-31v-273l1-55 3-12 7-11 8-7 15-7 6-2h9l11 4 11 7 13 11 100 100 2 1v2l4 2 2 4h2l7 8 5 1 8-6 21-21 7-8 7-7 7-8 13-16 8-9 8-10 9-12 11-15 9-14 10-15 13-22 13-24 16-32 15-37 9-25 8-25 10-38 6-27 6-36 3-25 3-46v-46l-3-44-4-30-7-38-7-31-9-32-14-41-15-36-14-29-14-27-17-28-11-18-8-11-14-19-12-16-8-10-9-11-12-13-7-8-30-30-8-7-14-12-13-11-32-24-25-17-19-12-26-15-35-18-33-15-37-14-32-10-42-12-15-6-11-6-10-9-7-6-11-15-7-16-4-15v-21l6-21 8-14 7-9 9-10 14-10 17-8z" />
                                        <path transform="translate(471,212)" d="m0 0h77l161 1 24 1 9 3 10 6 8 7 5 9 1 5 1 17v363l-1 12-4 8-7 7-12 7-9 7-6 3-4-1-10-3-15-9-10-9-8-7-112-112-7-2-8 7-9 10-20 20-9 11-12 14-26 32-4 6-10 14-9 14-9 13-13 22-8 14-20 40-14 32-11 29-11 34-14 56-5 27-5 44-3 49v32l2 32 5 45 5 30 8 34 10 37 11 33 11 28 15 33 8 17 12 22 10 17 11 18 8 12 12 17 13 18 11 14 11 13 13 15 7 7 7 8 21 21 8 7 12 11 11 9 13 11 14 11 16 12 26 17 16 10 14 8 18 10 23 12 20 9 15 7 27 11 23 8 40 12 30 10 11 5 12 7 9 7 9 9 10 16 7 17 2 8v21l-3 13-8 18-8 12-11 12-9 7-16 8-14 4-17 2-14-1-13-2-36-9-29-9-26-9-36-14-30-13-32-15-22-12-18-10-25-15-39-26-14-10-12-9-14-11-13-11-10-8-15-13-13-12-7-7-8-7-12-12v-2h-2l-7-8-14-14-9-11-10-11-9-11-12-15-13-17-14-19-11-16-10-15-11-18-16-27-12-23-10-19-15-32-16-40-13-37-10-34-10-38-9-46-6-40-4-35-2-31-1-26v-38l2-35 5-49 7-45 10-45 8-30 11-36 7-20 10-26 10-24 11-24 8-17 10-19 12-23 9-15 11-18 7-10 7-11 16-24 8-10 20-26 14-18 9-11 13-15 31-31 8-7 6-7-1-5-9-11-56-56-7-8-27-27-7-8-10-12-6-11-1-3v-10l4-13 7-12 8-8 9-5 4-1z" />
                                        <path transform="translate(1376,726)" d="m0 0h13l17 3 17 6 14 9 10 9 11 14 9 17 4 16v27l-3 12-11 19-9 12-11 13-466 466-11 9-11 8-10 6-23 7-15 2-16-2-15-5-11-6-9-7-14-12-20-20-8-7v-2l-4-2v-2l-3-1-5-5v-2l-4-2-4-4v-2l-3-1-5-5v-2l-4-2v-2l-3-1-5-6-6-5-7-8-7-7-6-5-7-8-5-4-7-8-71-71-7-6-5-6-4-3v-2l-4-2-8-8v-2l-4-2v-2l-3-1-7-8-8-8-8-10-8-13-7-14-3-10-1-7v-9l2-16 4-13 10-19 11-13 13-10 16-8 19-5 11-1 15 2 16 5 14 7 11 8 10 9 115 115 8 7 47 47 5 4 4-1 6-7h2l2-4 12-12h2v-2h2v-2h2l2-4 14-14 6-7 8-7 290-290 7-8 53-53 8-7 12-10 13-8 11-5 11-3z" />
                                    </svg>

                                    Update  credit or debit card </h1>
                                <p className="mt10 mb20 r-c-c">
                                    We apologize ! Currently, we only accept credit cards as a payment method. However, we’re working on adding more options to make your experience smoother in the future. Stay tuned!
                                </p>
                                <div className="LabelInpInfo mt50">
                                    <input value={cardObje.CardholderName} onChange={updateCardObject} className='' id='CardholderName' type="text" placeholder='' />
                                    <label htmlFor="CardholderName">Cardholder Name</label>
                                    <svg xmlns="http://www.w3.org/2000/svg" className='iconeLabelInpinfo w30 h30' viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q53 0 100-15.5t86-44.5q-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160Zm0-360q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm0-60Zm0 360Z" /></svg>
                                </div>
                                <div className="LabelInpInfo mt20">
                                    <input value={cardObje.CardNumber} onChange={updateCardObject} className='' id='CardNumber' type="text" placeholder='' />
                                    <label htmlFor="CardNumber">Card Number</label>
                                    <svg xmlns="http://www.w3.org/2000/svg" className='iconeLabelInpinfo w30 h30' viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm100-200h46v-240h-36l-70 50 24 36 36-26v180Zm124 0h156v-40h-94l-2-2q21-20 34.5-34t21.5-22q18-18 27-36t9-38q0-29-22-48.5T458-600q-26 0-47 15t-29 39l40 16q5-13 14.5-20.5T458-558q15 0 24.5 8t9.5 20q0 11-4 20.5T470-486l-32 32-54 54v40Zm296 0q36 0 58-20t22-52q0-18-10-32t-28-22v-2q14-8 22-20.5t8-29.5q0-27-21-44.5T678-600q-25 0-46.5 14.5T604-550l40 16q4-12 13-19t21-7q13 0 21.5 7.5T708-534q0 14-10 22t-26 8h-18v40h20q20 0 31 8t11 22q0 13-11 22.5t-25 9.5q-17 0-26-7.5T638-436l-40 16q7 29 28.5 44.5T680-360ZM160-240h640v-480H160v480Zm0 0v-480 480Z" /></svg>  </div>
                                <div className="r-b-c containerInpCodeSec mt20 wmia mb15 pr10">
                                    <div className="LabelInpInfo pr10">
                                        <input value={cardObje.ExpiryDate} onChange={updateCardObject} className='' id='ExpiryDate' type="month" placeholder='' />
                                        <label htmlFor="ExpiryDate">Expiry Date (MM/YY)</label>
                                        <svg xmlns="http://www.w3.org/2000/svg" className='iconeLabelInpinfo w30 h30' viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Z" /></svg>
                                    </div>
                                    <div className="LabelInpInfo">
                                        <input value={cardObje.SecurityCode} onChange={updateCardObject} className='' id='SecurityCode' type="text" placeholder='' />
                                        <label htmlFor="SecurityCode">Security code</label>
                                        <svg xmlns="http://www.w3.org/2000/svg" className='iconeLabelInpinfo w30 h30' viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M280-240q-100 0-170-70T40-480q0-100 70-170t170-70q66 0 121 33t87 87h432v240h-80v120H600v-120H488q-32 54-87 87t-121 33Zm0-80q66 0 106-40.5t48-79.5h246v120h80v-120h80v-80H434q-8-39-48-79.5T280-640q-66 0-113 47t-47 113q0 66 47 113t113 47Zm0-80q33 0 56.5-23.5T360-480q0-33-23.5-56.5T280-560q-33 0-56.5 23.5T200-480q0 33 23.5 56.5T280-400Zm0-80Z" /></svg>
                                    </div>
                                </div>
                                <div className=" r-p-c wmia cntCardsTypes mb15">
                                    <span onClick={() => { setCardObje(c => ({ ...c, cardType: "visa" })) }} id={cardObje.cardType == "visa" ? "active" : null} className="p10 psr br10"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" /></svg> <img src="imgs/V-removebg-preview.png" alt="" /></span>
                                    <span onClick={() => { setCardObje(c => ({ ...c, cardType: "mastercard" })) }} id={cardObje.cardType == "mastercard" ? "active" : null} className="p10 br10 psr"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" /></svg> <img src="imgs/Mastercard_logo_svg_free_download-removebg-preview.png" alt="" /></span>
                                    <span onClick={() => { setCardObje(c => ({ ...c, cardType: "americanexpress" })) }} id={cardObje.cardType == "americanexpress" ? "active" : null} className="p10 psr br10"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" /></svg> <img src="imgs/E-Ticket-removebg-preview.png" alt="" /></span>
                                    <span onClick={() => { setCardObje(c => ({ ...c, cardType: "discover" })) }} id={cardObje.cardType == "discover" ? "active" : null} className="p10 br10 psr"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" /></svg> <img src="imgs/Discover-removebg-preview.png" alt="" /></span>
                                </div>

                                <button onClick={SendToUpdatetCard} disabled={!ALlFeildAdded} className='bl wmia mt50 br20 p5' style={{ alignSelf: "end" }}>Save changes <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M200-120v-640q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v640L480-240 200-120Zm80-122 200-86 200 86v-518H280v518Zm0-518h400-400Z" /></svg></button>
                            </div>
                        </>
                }
            </div>
        )
    }

}

export const Khazl = (n) => {
    n = n.toString();
    return `**** **** ****  ${n.substring(n.length - 4,)}`
}