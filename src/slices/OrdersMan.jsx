import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getRealNumber } from '../c/singles/sou_cart'
import DatePicker from "react-datepicker";

import { auth, db } from '../config/fireBase'
import { setDoc, updateDoc, getDoc, doc, disableNetwork } from 'firebase/firestore'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ReactDom from "react-dom"
import { v4 } from 'uuid'
import { LottieDone, LottieError, showTenDone } from './tenDoeneslice'
import { BTN_OPEN_ADDRESS } from './addressManagement'
import { Khazl, ShowAddPaymenthMethod } from './PaymenthMethodManagement'
import { showPopupConfrm } from './popupConfirm'
import { api, fetchProds } from "./fetchProdSlice"
import { decreaseCquantity, GetCustomProds, increaseCquantity } from './customProd'
import ProductCard2 from '../c/singles/ProdCard2'
import SearchInput from '../c/singles/searchInput'
import { getrealImg } from './profileSlice'
import { getViewProd, showViewProd, ViewProd } from '../c/shopping/viewProd'
import { useNavigate } from 'react-router-dom'
import jsPDF from 'jspdf'
import GoodLoader from '../c/singles/goodLoader';
import { showLogin } from './loginSlice';
export const GetAllOrders = createAsyncThunk(
    "OrdersManSlice/GetAllOrders",
    async (_, { rejectWithValue }) => {
        try {
            const res = await getDoc(doc(db, "orders", localStorage.getItem("userId")));
            return res.exists() ? Object.values(res.data()) : []

        } catch (error) {
            console.log(error.message);
            return rejectWithValue();
        }
    }
)
const SendOrderFun = createAsyncThunk(
    "OrdersManSlice/SendOrderFun",
    async (_, { rejectWithValue, getState, dispatch }) => {
        try {

            const OrderData = getState().OrderMan.NewOrderData;
            const OrderGendId = v4()
            await setDoc(doc(db, 'orders', localStorage.getItem("userId")), { [OrderGendId]: { ...OrderData, id: OrderGendId } }, { merge: true })

            return ({ ...OrderData, id: OrderGendId });

        } catch (error) {
            console.log(error.message);
            return rejectWithValue()
        }
    }
)


export const ChangeOrderDelvryDate = createAsyncThunk(
    "OrdersManSlice/ChangeOrderDelvryDate",
    async ([orderDate, newDate], { rejectWithValue, dispatch }) => {

        try {
            const realDated = newDate.replace(/-/g, "/ ")
            await updateDoc(doc(db, 'orders', localStorage.getItem('userId')),
                {
                    [orderDate.id]: {
                        ...orderDate,
                        deliveryDate: realDated
                    }
                }
            )
            dispatch(showTenDone([, "The delivery date has been updated. You can change it again at any time."]))
            return (
                {
                    id: orderDate.id,
                    deliveryDate: realDated
                }
            )
        } catch (error) {
            console.log(error.message);
            return rejectWithValue('')
        }

    }
)

export const ChangeOrderShippingAddress = createAsyncThunk(
    "OrdersManSlice/ChangeOrderShippingAddress",
    async ([orderDate, Newaddress], { rejectWithValue, dispatch }) => {

        try {
            await updateDoc(doc(db, 'orders', localStorage.getItem('userId')),
                {
                    [orderDate.id]: {
                        ...orderDate,
                        addressUsed: Newaddress
                    }
                }
            )
            dispatch(showTenDone([, "The Shipping address has been changed. You can change it again at any time."]))
            return (
                {
                    id: orderDate.id,
                    addressUsed: Newaddress
                }
            )
        } catch (error) {
            console.log(error.message);
            return rejectWithValue('')
        }

    }
)
export const CancelOrder = createAsyncThunk(
    "OrdersManSlice/CancelOrder",
    async (orderDate, { rejectWithValue, dispatch }) => {

        try {
            await updateDoc(doc(db, 'orders', localStorage.getItem('userId')),
                {
                    [orderDate.id]: {
                        ...orderDate,
                        status: "canceled"
                    }
                }
            )
            dispatch(showTenDone([, "Your order has been canceled. You can reorder it whenever you're ready"]))
            return orderDate.id
        } catch (error) {
            console.log(error.message);
            return rejectWithValue('')
        }

    }
)
export const Reorder = createAsyncThunk(
    "OrdersManSlice/Reorder",
    async (orderDate, { rejectWithValue, dispatch }) => {

        try {
            await updateDoc(doc(db, 'orders', localStorage.getItem('userId')),
                {
                    [orderDate.id]: {
                        ...orderDate,
                        status: "Processing"
                    }
                }
            )
            dispatch(showTenDone([, "Your order has been Reorder successfully "]))
            return orderDate.id
        } catch (error) {
            console.log(error.message);
            return rejectWithValue('')
        }

    }
)

const OrdersManSlice = createSlice({
    name: "OrderMan",
    initialState: {

        IsGettingAllOrders: false,
        isUpdateingDelvrDate: false,
        isUpdateingShippingAddress: false,
        isCancelingOrder: false,
        OrdersList: [],
        CmpVSBL: false,

        // ------
        createOrderStep1: false,
        createOrderStep2: false,
        createOrderStep3: false,
        finaleSteps: false,
        NewOrderData: {
            userId: localStorage.getItem("userId"),
            paymentMethodUsed: null,
            addressUsed: null,
            products: [],
            subtotal: 0,
            total: 0,
            status: "Processing",
            orderDate: "",
            deliveryDate: ""
        },
        SendingOrderVSBL: false,
        isSendingOrder: false,
        orderCompleted: false,
        orderFailed: false,
    },
    reducers: {
        startOrder: (state, action) => {
            state.NewOrderData = { ...state.NewOrderData, products: action.payload }
            const isWorkingOnPC = window.innerWidth > 800
            isWorkingOnPC ? state.CmpVSBL = true : null
        },
        startCreation: (state) => {
            state.createOrderStep1 = true;
        },
        setUsedAddress: (state, action) => {
            state.NewOrderData = { ...state.NewOrderData, addressUsed: action.payload }
        },
        passTo2Step: (state) => {
            state.createOrderStep1 = false;
            state.createOrderStep2 = true;
        },
        // ----
        backToStep1: (state) => {
            state.createOrderStep2 = false;
            state.createOrderStep1 = true;
        },
        backToStep2: (state) => {
            state.createOrderStep3 = false;
            state.createOrderStep2 = true;
        },
        setUsedPaymentMethod: (state, action) => {
            state.NewOrderData = { ...state.NewOrderData, paymentMethodUsed: action.payload }
        },
        passTo3Step: (state) => {
            state.createOrderStep2 = false;
            state.createOrderStep3 = true;
        },
        handelSaveAddedProds: (state, action) => {
            state.NewOrderData.products = action.payload
        },
        endingQuantity: (state, action) => {
            state.NewOrderData.products = action.payload;
            const ListProds = state.NewOrderData.products;
            state.NewOrderData.subtotal = ListProds.reduce((t, elm) => t + (elm.quantity * elm.price), 0);
            state.NewOrderData.total = ListProds.reduce((t, elm) => t + (elm.quantity * elm.price), 0) * 1.1;
            state.NewOrderData.orderDate = new Date().getFullYear() + "/ " + (new Date().getMonth() + 1) + "/ " + new Date().getDate() + " -" + new Date().getHours() + ":" + new Date().getMinutes()
            const n = new Date()
            n.setDate(n.getDate() + 3)
            state.NewOrderData.deliveryDate = n.getFullYear() + "/ " + n.getMonth() + "/ " + n.getDate()
            state.createOrderStep3 = false;
            state.finaleSteps = true
        },
        backToStep3: (state, action) => {
            state.createOrderStep3 = true;
            state.finaleSteps = false
        },
        closeOrderCMpl: (state) => {
            state.SendingOrderVSBL = false
        },

        // --------------   `--
        hideCmpCreateOrder: (state, action) => {
            state.createOrderStep1 = false;
            state.createOrderStep2 = false;
            state.createOrderStep3 = false;
            state.finaleSteps = false;
            state.NewOrderData = {
                userId: localStorage.getItem("userId"),
                paymentMethodUsed: null,
                addressUsed: null,
                products: [],
                subtotal: 0,
                total: 0,
                status: "Processing",
                orderDate: "",
                deliveryDate: ""
            }
            state.SendingOrderVSBL = false;
            state.CmpVSBL = false;
            state.isSendingOrder = false;
            state.orderCompleted = false;
            state.orderFailed = false;
        }

    },
    extraReducers: (builder) => {
        builder.addCase(SendOrderFun.pending, (state) => {
            state.SendingOrderVSBL = true
            state.isSendingOrder = true
        })
            .addCase(SendOrderFun.fulfilled, (state, action) => {
                state.SendingOrderVSBL = true
                state.isSendingOrder = false
                state.orderCompleted = true
                state.OrdersList.push(action.payload)
                state.orderFailed = false
            })
            .addCase(SendOrderFun.rejected, (state) => {
                state.SendingOrderVSBL = true
                state.isSendingOrder = false
                state.orderCompleted = false
                state.orderFailed = true
            })
            // 
            .addCase(GetAllOrders.pending, (state) => {
                state.IsGettingAllOrders = true
            })
            .addCase(GetAllOrders.fulfilled, (state, action) => {
                state.IsGettingAllOrders = false
                let sortedArr = action.payload.sort((a, b) => {
                    return a.status == "Processing" && b.status != "Processing" ? -1 : 1
                });

                state.OrdersList = sortedArr
            })

            .addCase(GetAllOrders.rejected, (state) => {
                state.IsGettingAllOrders = false
            })
            // -------------
            .addCase(ChangeOrderDelvryDate.pending, (state) => {
                state.isUpdateingDelvrDate = true
            })
            .addCase(ChangeOrderDelvryDate.fulfilled, (state, action) => {
                state.isUpdateingDelvrDate = false
                state.OrdersList = state.OrdersList.map(o => o.id == action.payload.id ? { ...o, deliveryDate: action.payload.deliveryDate } : o);
            })

            .addCase(ChangeOrderDelvryDate.rejected, (state) => {
                state.isUpdateingDelvrDate = false
            })
            // -------------
            .addCase(ChangeOrderShippingAddress.pending, (state) => {
                state.isUpdateingShippingAddress = true
            })
            .addCase(ChangeOrderShippingAddress.fulfilled, (state, action) => {
                state.isUpdateingShippingAddress = false
                state.OrdersList = state.OrdersList.map(o => o.id == action.payload.id ? { ...o, addressUsed: action.payload.addressUsed } : o);
            })

            .addCase(ChangeOrderShippingAddress.rejected, (state) => {
                state.isUpdateingShippingAddress = false
            })
            // -------------
            .addCase(CancelOrder.pending, (state) => {
                state.isCancelingOrder = true
            })
            .addCase(CancelOrder.fulfilled, (state, action) => {
                state.isCancelingOrder = false
                state.OrdersList = state.OrdersList.map(o => o.id == action.payload ? { ...o, status: "canceled" } : o);
            })

            .addCase(CancelOrder.rejected, (state) => {
                state.isCancelingOrder = false
            })
            // -------------
            .addCase(Reorder.pending, (state) => {
                state.isCancelingOrder = true
            })
            .addCase(Reorder.fulfilled, (state, action) => {
                state.isCancelingOrder = false
                state.OrdersList = state.OrdersList.map(o => o.id == action.payload ? { ...o, status: "Processing" } : o);
            })

            .addCase(Reorder.rejected, (state) => {
                state.isCancelingOrder = false
            })

    }
})



export const { startOrder, startCreation, endingQuantity, setUsedAddress, passTo2Step, setUsedPaymentMethod, backToStep1, passTo3Step, handelSaveAddedProds, hideCmpCreateOrder, backToStep2, backToStep3, closeOrderCMpl } = OrdersManSlice.actions
export default OrdersManSlice.reducer



export const CreateAnOrderCmp = () => {
    const isWorkingOnPC = window.innerWidth > 800;
    const navigate = useNavigate()
    const { createOrderStep1, createOrderStep2, SendingOrderVSBL, NewOrderData, createOrderStep3, finaleSteps, orderCompleted } = useSelector(st => st.OrderMan)
    const dispatch = useDispatch();
    const { AllPaymenthMethod, isLodingPay } = useSelector(s => s.paymentMethod)
    const { user } = useSelector(s => s.authe)
    const MainOrderPagRef = useRef(null);
    const InitianleCreating = () => {
        if (isWorkingOnPC) {

            return (
                <div className=' h600 w800 c-c-c'>
                    <img className='h300' src="imgs/3333449-removebg-preview.png" alt="" />
                    <h1 className="logo  mt20">Start creating a new order</h1>
                    <ul className='mt20 '>
                        <p>There are 3 simple steps</p>
                        <li><p className='ml10 mt5'>Step 1 : <strong className='ml10'>  Select your shipping address for the order. </strong></p></li>
                        <li>
                            <p className='ml10 mt5'>Step 2 : <strong className='ml10'> Choose payment method </strong></p>
                        </li>
                        <li>
                            <p className='ml10 mt5'>Step 3 : <strong className='ml10'>Specify the quantity of products </strong></p>
                        </li>
                        <li>
                            <p className='ml10 mt5'>And last one is <strong> complete the order</strong></p>
                        </li>
                    </ul>
                    <button onClick={() => dispatch(startCreation())} className='btnStartOrder w400 p10 bg-g  mt20' style={{ color: "#fff" }}>Start
                        <svg version="1.1" viewBox="0 0 2048 2048" className='ml20' style={{ fill: "#fff" }} xmlns="http://www.w3.org/2000/svg">
                            <path transform="translate(1663)" d="m0 0h276l-2 1v2l-3 1-9-1 2 2-1 1 22 8 16 8 16 10 14 12 14 14 11 15 9 15 7 15 7 19 4 14 2-1v235l-2 6h2v45l-2-1-1-14-4 1-3 20-8 58-8 48-13 66-7 31-10 42-15 53-14 43-13 36-11 28-22 52-9 20-26 52-10 17-10 18-9 15-14 23-8 12-11 17-10 15-10 14-11 15-12 17-14 19-14 17-8 10-1 2h-2l-2 4-14 17-9 11-13 15-9 10-7 8-11 12-1 2h-2v2h-2v2h-2l-2 4-15 15-7 8-52 52-8 7-8 8-8 7-12 11h-2v2l-11 9-7 7-14 11-11 9-4 9-5 59-6 77-6 68-6 84-4 26-7 25-8 17-12 20-8 10-12 13-20 16-17 12-17 11-33 22-22 14-27 18-20 13-48 32-29 19-15 10-16 11-29 19-21 14-15 9-16 9-21 10-1 1h-61l-1-3h8l-10-6-16-8-11-6-13-11-11-15-11-21-7-24-5-27-9-56-16-104-7-49-3-15-1-2-19 5-5 1h-33l-23-5-25-9-11-6-12-8-13-10-13-12-8-7-108-108v-2l-4-2v-2l-4-2v-2l-3-1-5-6-6-5-6-7-6-5-6-7-6-5-6-7-8-7v-2l-3-1-5-6-4-3v-2l-4-2v-2l-4-2v-2l-4-2v-2l-4-2-8-8v-2l-4-2-60-60v-2l-4-2v-2l-4-2-8-8v-2l-4-2v-2l-4-2v-2l-4-2v-2l-4-2v-2l-4-2v-2l-4-2-20-20v-2h-2l-7-8-10-11-13-17-9-15-8-16-5-15-5-22-1-7v-22l2-18 2-11-7-3-21-4-42-7-46-7-85-13-38-6-24-5-15-5-15-8-11-8-10-9-9-11-7-11-11-20-3-5v-58l3-3 14-26 8-13 10-16 13-19 10-16 36-54 34-52 10-15 17-26 22-33 13-20 32-48 13-16 12-13 10-9 12-9 16-9 20-8 25-6 24-3 107-8 150-11 20-2 13-4 8-7 8-10 12-14 9-11 7-7 7-8 6-7 5-5 6-7 8-7 11-12 9-9 7-8 16-16 8-7 21-21 8-7 4-2v-2l8-7 10-9 15-13 10-9 11-9 8-7 9-7 11-9 9-7 15-12 17-13 19-14 13-9 14-10 24-16 17-11 19-12 22-13 18-10 29-16 44-22 24-11 28-12 24-10 34-13 46-16 44-13 42-11 48-12 50-10 44-8 61-9 61-8 11-1zm257 4m-160 116-51 2-64 5-50 6-55 8-38 7-51 11-50 13-32 9-41 13-28 10-26 10-32 13-30 13-30 14-19 10-27 14-17 10-19 11-17 11-16 10-14 9-10 7-18 13-19 13-12 9-17 13-8 7-14 11-13 11-11 9-10 9-11 9-10 9-8 7-7 7-8 7-9 9-8 7-44 44-7 8-11 11-7 8-7 7-9 11-7 7-9 11-11 12-9 11-14 17-8 11-13 16-10 13-13 18-20 28-9 13-10 15-11 18-7 10-21 35-12 22-16 29-11 20-4 7 1 5 63 63 4 5 7 6 5 6 7 6 5 6 7 6 6 7 6 5 6 7 6 5 6 7 6 5 6 7 6 5 6 7 6 5 5 6 7 6 5 6 7 6 6 7 6 5 6 7 6 5 5 6 7 6 5 6 7 6 5 6 8 7 19 19 5 6 7 6 6 7 6 5 5 6 7 6 5 6 7 6 6 7 6 5 6 7 6 5 5 6 7 6 5 6 7 6 6 7 6 5 6 7 6 5 5 6 7 6 5 6 7 6 5 6 8 7 91 91 5 6 7 6 6 7 6 5 7 8 27 27 8 7 8 9 8 7 7 2 14-7 23-13 25-14 20-12 21-13 26-16 15-10 23-16 19-13 19-14 32-24 12-10 14-11 13-11 17-14 12-11 11-9 17-16 16-15 22-22 8-7 12-13 23-23 7-8 11-11 7-8 8-9 7-8 12-14 14-17 11-14 13-16 10-13 11-15 12-16 11-16 10-14 11-17 13-21 5-8 13-22 6-11 15-29 7-12 9-20 11-23 13-30 15-38 17-48 12-39 10-37 14-56 10-48 8-46 8-56 4-34 4-54 2-36 1-26v-96l-1-22-4-18-5-13-5-6-13-5-25-2-27-1zm280 283 1 2zm-1508 269-151 11-31 3-13 3-8 7-9 12-9 13-7 10-13 21-7 10-10 15-14 22-7 10-18 27-9 14-6 9-9 13-14 22-20 30-7 11-12 17-11 17-9 14-7 11-2 5 7 2 36 5 44 7 72 11 58 9 21 4 4-1 4-6 10-27 12-36 9-25 15-36 9-20 9-21 19-39 10-19 8-16 12-22 8-14 12-20 10-16 8-13 13-22 5-8v-4zm-26 342-5 18-9 30-10 35-6 25-8 37-5 23-2 15 1 9 6 10 24 26 322 322h2l2 4h2v2l11 9 9 5 3 1h14l45-9 47-11 37-10 28-9 18-6-1-4-3-4h-2l-2-4-38-38-5-6-413-413-8-7-48-48h-2v-2zm867 487-16 10-17 11-22 13-20 12-28 16-22 12-16 8-17 9-23 11-26 12-17 7-11 5-32 13-30 11-43 14-19 7-4 3 1 9 5 33 9 59 10 65 8 55 3 20 8-1 9-5 10-7 14-9 27-18 19-12 13-9 15-10 43-29 11-7 42-28 20-13 15-10 26-17 15-10 11-8 10-9 4-6 2-12 5-67 9-104 1-24z" />
                            <path transform="translate(1379,345)" d="m0 0h46l23 2 25 5 25 7 21 8 25 12 20 12 13 9 16 12 13 12 8 7 11 11 18 22 16 24 9 16 8 16 10 25 8 25 6 31 3 25v38l-3 23-6 31-6 21-10 25-7 15-12 22-9 14-10 14-14 17-17 17-11 10-11 9-18 13-21 12-16 8-18 8-34 11-23 5-31 4-13 1h-35l-21-2-26-5-24-7-28-11-20-10-20-12-10-7-13-10-14-12-13-12-14-15-9-11-10-13-12-19-9-16-13-28-10-30-6-26-3-20-2-29 1-29 3-23 6-29 12-35 11-24 11-20 9-14 9-13 7-8 8-10 29-29 13-10 10-8 19-12 20-11 20-9 22-8 23-6 23-4zm3 121-20 3-18 5-21 9-19 11-14 11-12 11-10 10-8 10-11 16-11 21-7 18-4 16-3 19-1 20 1 18 4 22 5 17 7 17 9 17 8 12 11 13 9 10 7 7 13 10 14 9 21 11 16 6 25 6 20 2h23l18-2 22-6 16-6 16-8 14-8 11-8 13-11 12-12 8-10 8-11 10-17 6-15 6-21 4-20 1-25-1-20-4-22-9-27-8-17-10-16-9-12-12-13-12-11-16-11-14-8-19-9-24-7-16-3-10-1z" />
                            <path transform="translate(429,1551)" d="m0 0h12l15 3 16 8 8 7 9 12 5 12 2 10v16l-2 10-4 9-7 10-9 11-6 7h-2l-2 4-268 268h-2v2h-2v2h-2l-2 4-8 8h-2v2l-5 4-1 2h-2l-2 4h-2v2l-8 7-53 53-20 14-10 6h-33l-14-10-16-15-8-9v-2l-4-2v-46l7-6 9-12 8-8 2-3h2l2-4 6-5 2-3h2v-2h2v-2l8-7 11-12 234-234 3-4h2v-2l8-7 2-3h2l2-4h2v-2l8-7 6-7h2v-2l8-7 7-8 8-7 7-8 9-8 7-8 12-11 9-8 11-7 7-3z" />
                            <path transform="translate(607,1730)" d="m0 0 17 1 15 4 15 8 7 7 7 10 5 12 2 7v24l-5 13-12 16-11 12-7 8-30 30-5 6-8 7-9 10h-2l-1 3-6 5-7 8-6 5-7 8-12 11-75 75-11 9-11 8-13 9v2h-31l-4-3-10-6-13-10-6-5-6-8-4-11-4-17v-8l2-9 8-18 10-11 7-8 20-20h2l2-4h2l2-4h2l2-4 4-4h2l2-4 49-49 7-8 38-38h2l2-4 8-8h2v-2h2l2-4 22-22 8-7 10-9 13-8 9-4z" />
                            <path transform="translate(250,1371)" d="m0 0h10l18 4 12 6 10 8 7 9 7 14 3 11 1 13-2 11-8 14-9 12-9 10-4 5-5 4-1 2h-2l-2 4-111 111-6 7-8 7-43 43-13 10-16 8-8 3-16 1-12-3-16-8-12-11-7-9-4-8-4-3v-36l11-16 13-15 7-8h2l2-4 70-70 5-6h2l2-4 36-36h2l2-4h2l2-4h2l2-4h2l2-4h2l2-4h2v-2h2v-2l8-7 30-30 13-10 12-6z" />
                            <path transform="translate(394,2044)" d="m0 0 5 1 3 3h-8z" />
                            <path transform="translate(26,2045)" d="m0 0 6 1 1 2h-6z" />
                            <path transform="translate(1654)" d="m0 0h2l1 3h-7l4-1z" />
                            <path transform="translate(2047,113)" d="m0 0h1v6l-2-1-1-4z" />
                            <path transform="translate(11,2031)" d="m0 0 4 2-1 2z" />
                            <path transform="translate(1067,2046)" d="m0 0 2 2-4-1z" />
                            <path transform="translate(8,2028)" d="m0 0 3 1-1 2z" />
                            <path transform="translate(79,2046)" d="m0 0 1 2-3-1z" />
                            <path transform="translate(0,2046)" d="m0 0 2 2h-2z" />
                            <path transform="translate(1e3 2046)" d="m0 0" />
                            <path transform="translate(38,2047)" d="m0 0 2 1z" />
                            <path transform="translate(395,2042)" d="m0 0 2 1z" />
                            <path transform="translate(2047,422)" d="m0 0" />
                            <path transform="translate(1650)" d="m0 0 2 1z" />
                            <path transform="translate(439,2047)" d="m0 0" />
                            <path transform="translate(398,2043)" d="m0 0" />
                            <path transform="translate(16,2035)" d="m0 0" />
                            <path transform="translate(0,1961)" d="m0 0" />
                            <path transform="translate(1940)" d="m0 0" />
                            <path transform="translate(1620)" d="m0 0" />
                        </svg>
                    </button>
                </div>
            )
        } else {
            return (
                <div className=' h600 wmia c-c-c'>
                    <img className='wmia' src="imgs/3333449-removebg-preview.png" alt="" />
                    <h1 className="logo  mt20">Start creating a new order</h1>
                    <ul className='mt20 '>
                        <p>There are 3 simple steps</p>
                        <li><p className='ml10 mt5'>Step 1 : <strong className='ml10'>  Select your shipping address for the order. </strong></p></li>
                        <li>
                            <p className='ml10 mt5'>Step 2 : <strong className='ml10'> Choose payment method </strong></p>
                        </li>
                        <li>
                            <p className='ml10 mt5'>Step 3 : <strong className='ml10'>Specify the quantity of products </strong></p>
                        </li>
                        <li>
                            <p className='ml10 mt5'>And last one is <strong> complete the order</strong></p>
                        </li>
                    </ul>
                    <button onClick={() => dispatch(startCreation())} className='btnStartOrder w400 p10 bg-g  mt20' style={{ color: "#fff" }}>Start
                        <svg version="1.1" viewBox="0 0 2048 2048" className='ml20' style={{ fill: "#fff" }} xmlns="http://www.w3.org/2000/svg">
                            <path transform="translate(1663)" d="m0 0h276l-2 1v2l-3 1-9-1 2 2-1 1 22 8 16 8 16 10 14 12 14 14 11 15 9 15 7 15 7 19 4 14 2-1v235l-2 6h2v45l-2-1-1-14-4 1-3 20-8 58-8 48-13 66-7 31-10 42-15 53-14 43-13 36-11 28-22 52-9 20-26 52-10 17-10 18-9 15-14 23-8 12-11 17-10 15-10 14-11 15-12 17-14 19-14 17-8 10-1 2h-2l-2 4-14 17-9 11-13 15-9 10-7 8-11 12-1 2h-2v2h-2v2h-2l-2 4-15 15-7 8-52 52-8 7-8 8-8 7-12 11h-2v2l-11 9-7 7-14 11-11 9-4 9-5 59-6 77-6 68-6 84-4 26-7 25-8 17-12 20-8 10-12 13-20 16-17 12-17 11-33 22-22 14-27 18-20 13-48 32-29 19-15 10-16 11-29 19-21 14-15 9-16 9-21 10-1 1h-61l-1-3h8l-10-6-16-8-11-6-13-11-11-15-11-21-7-24-5-27-9-56-16-104-7-49-3-15-1-2-19 5-5 1h-33l-23-5-25-9-11-6-12-8-13-10-13-12-8-7-108-108v-2l-4-2v-2l-4-2v-2l-3-1-5-6-6-5-6-7-6-5-6-7-6-5-6-7-8-7v-2l-3-1-5-6-4-3v-2l-4-2v-2l-4-2v-2l-4-2v-2l-4-2-8-8v-2l-4-2-60-60v-2l-4-2v-2l-4-2-8-8v-2l-4-2v-2l-4-2v-2l-4-2v-2l-4-2v-2l-4-2v-2l-4-2-20-20v-2h-2l-7-8-10-11-13-17-9-15-8-16-5-15-5-22-1-7v-22l2-18 2-11-7-3-21-4-42-7-46-7-85-13-38-6-24-5-15-5-15-8-11-8-10-9-9-11-7-11-11-20-3-5v-58l3-3 14-26 8-13 10-16 13-19 10-16 36-54 34-52 10-15 17-26 22-33 13-20 32-48 13-16 12-13 10-9 12-9 16-9 20-8 25-6 24-3 107-8 150-11 20-2 13-4 8-7 8-10 12-14 9-11 7-7 7-8 6-7 5-5 6-7 8-7 11-12 9-9 7-8 16-16 8-7 21-21 8-7 4-2v-2l8-7 10-9 15-13 10-9 11-9 8-7 9-7 11-9 9-7 15-12 17-13 19-14 13-9 14-10 24-16 17-11 19-12 22-13 18-10 29-16 44-22 24-11 28-12 24-10 34-13 46-16 44-13 42-11 48-12 50-10 44-8 61-9 61-8 11-1zm257 4m-160 116-51 2-64 5-50 6-55 8-38 7-51 11-50 13-32 9-41 13-28 10-26 10-32 13-30 13-30 14-19 10-27 14-17 10-19 11-17 11-16 10-14 9-10 7-18 13-19 13-12 9-17 13-8 7-14 11-13 11-11 9-10 9-11 9-10 9-8 7-7 7-8 7-9 9-8 7-44 44-7 8-11 11-7 8-7 7-9 11-7 7-9 11-11 12-9 11-14 17-8 11-13 16-10 13-13 18-20 28-9 13-10 15-11 18-7 10-21 35-12 22-16 29-11 20-4 7 1 5 63 63 4 5 7 6 5 6 7 6 5 6 7 6 6 7 6 5 6 7 6 5 6 7 6 5 6 7 6 5 6 7 6 5 5 6 7 6 5 6 7 6 6 7 6 5 6 7 6 5 5 6 7 6 5 6 7 6 5 6 8 7 19 19 5 6 7 6 6 7 6 5 5 6 7 6 5 6 7 6 6 7 6 5 6 7 6 5 5 6 7 6 5 6 7 6 6 7 6 5 6 7 6 5 5 6 7 6 5 6 7 6 5 6 8 7 91 91 5 6 7 6 6 7 6 5 7 8 27 27 8 7 8 9 8 7 7 2 14-7 23-13 25-14 20-12 21-13 26-16 15-10 23-16 19-13 19-14 32-24 12-10 14-11 13-11 17-14 12-11 11-9 17-16 16-15 22-22 8-7 12-13 23-23 7-8 11-11 7-8 8-9 7-8 12-14 14-17 11-14 13-16 10-13 11-15 12-16 11-16 10-14 11-17 13-21 5-8 13-22 6-11 15-29 7-12 9-20 11-23 13-30 15-38 17-48 12-39 10-37 14-56 10-48 8-46 8-56 4-34 4-54 2-36 1-26v-96l-1-22-4-18-5-13-5-6-13-5-25-2-27-1zm280 283 1 2zm-1508 269-151 11-31 3-13 3-8 7-9 12-9 13-7 10-13 21-7 10-10 15-14 22-7 10-18 27-9 14-6 9-9 13-14 22-20 30-7 11-12 17-11 17-9 14-7 11-2 5 7 2 36 5 44 7 72 11 58 9 21 4 4-1 4-6 10-27 12-36 9-25 15-36 9-20 9-21 19-39 10-19 8-16 12-22 8-14 12-20 10-16 8-13 13-22 5-8v-4zm-26 342-5 18-9 30-10 35-6 25-8 37-5 23-2 15 1 9 6 10 24 26 322 322h2l2 4h2v2l11 9 9 5 3 1h14l45-9 47-11 37-10 28-9 18-6-1-4-3-4h-2l-2-4-38-38-5-6-413-413-8-7-48-48h-2v-2zm867 487-16 10-17 11-22 13-20 12-28 16-22 12-16 8-17 9-23 11-26 12-17 7-11 5-32 13-30 11-43 14-19 7-4 3 1 9 5 33 9 59 10 65 8 55 3 20 8-1 9-5 10-7 14-9 27-18 19-12 13-9 15-10 43-29 11-7 42-28 20-13 15-10 26-17 15-10 11-8 10-9 4-6 2-12 5-67 9-104 1-24z" />
                            <path transform="translate(1379,345)" d="m0 0h46l23 2 25 5 25 7 21 8 25 12 20 12 13 9 16 12 13 12 8 7 11 11 18 22 16 24 9 16 8 16 10 25 8 25 6 31 3 25v38l-3 23-6 31-6 21-10 25-7 15-12 22-9 14-10 14-14 17-17 17-11 10-11 9-18 13-21 12-16 8-18 8-34 11-23 5-31 4-13 1h-35l-21-2-26-5-24-7-28-11-20-10-20-12-10-7-13-10-14-12-13-12-14-15-9-11-10-13-12-19-9-16-13-28-10-30-6-26-3-20-2-29 1-29 3-23 6-29 12-35 11-24 11-20 9-14 9-13 7-8 8-10 29-29 13-10 10-8 19-12 20-11 20-9 22-8 23-6 23-4zm3 121-20 3-18 5-21 9-19 11-14 11-12 11-10 10-8 10-11 16-11 21-7 18-4 16-3 19-1 20 1 18 4 22 5 17 7 17 9 17 8 12 11 13 9 10 7 7 13 10 14 9 21 11 16 6 25 6 20 2h23l18-2 22-6 16-6 16-8 14-8 11-8 13-11 12-12 8-10 8-11 10-17 6-15 6-21 4-20 1-25-1-20-4-22-9-27-8-17-10-16-9-12-12-13-12-11-16-11-14-8-19-9-24-7-16-3-10-1z" />
                            <path transform="translate(429,1551)" d="m0 0h12l15 3 16 8 8 7 9 12 5 12 2 10v16l-2 10-4 9-7 10-9 11-6 7h-2l-2 4-268 268h-2v2h-2v2h-2l-2 4-8 8h-2v2l-5 4-1 2h-2l-2 4h-2v2l-8 7-53 53-20 14-10 6h-33l-14-10-16-15-8-9v-2l-4-2v-46l7-6 9-12 8-8 2-3h2l2-4 6-5 2-3h2v-2h2v-2l8-7 11-12 234-234 3-4h2v-2l8-7 2-3h2l2-4h2v-2l8-7 6-7h2v-2l8-7 7-8 8-7 7-8 9-8 7-8 12-11 9-8 11-7 7-3z" />
                            <path transform="translate(607,1730)" d="m0 0 17 1 15 4 15 8 7 7 7 10 5 12 2 7v24l-5 13-12 16-11 12-7 8-30 30-5 6-8 7-9 10h-2l-1 3-6 5-7 8-6 5-7 8-12 11-75 75-11 9-11 8-13 9v2h-31l-4-3-10-6-13-10-6-5-6-8-4-11-4-17v-8l2-9 8-18 10-11 7-8 20-20h2l2-4h2l2-4h2l2-4 4-4h2l2-4 49-49 7-8 38-38h2l2-4 8-8h2v-2h2l2-4 22-22 8-7 10-9 13-8 9-4z" />
                            <path transform="translate(250,1371)" d="m0 0h10l18 4 12 6 10 8 7 9 7 14 3 11 1 13-2 11-8 14-9 12-9 10-4 5-5 4-1 2h-2l-2 4-111 111-6 7-8 7-43 43-13 10-16 8-8 3-16 1-12-3-16-8-12-11-7-9-4-8-4-3v-36l11-16 13-15 7-8h2l2-4 70-70 5-6h2l2-4 36-36h2l2-4h2l2-4h2l2-4h2l2-4h2l2-4h2v-2h2v-2l8-7 30-30 13-10 12-6z" />
                            <path transform="translate(394,2044)" d="m0 0 5 1 3 3h-8z" />
                            <path transform="translate(26,2045)" d="m0 0 6 1 1 2h-6z" />
                            <path transform="translate(1654)" d="m0 0h2l1 3h-7l4-1z" />
                            <path transform="translate(2047,113)" d="m0 0h1v6l-2-1-1-4z" />
                            <path transform="translate(11,2031)" d="m0 0 4 2-1 2z" />
                            <path transform="translate(1067,2046)" d="m0 0 2 2-4-1z" />
                            <path transform="translate(8,2028)" d="m0 0 3 1-1 2z" />
                            <path transform="translate(79,2046)" d="m0 0 1 2-3-1z" />
                            <path transform="translate(0,2046)" d="m0 0 2 2h-2z" />
                            <path transform="translate(1e3 2046)" d="m0 0" />
                            <path transform="translate(38,2047)" d="m0 0 2 1z" />
                            <path transform="translate(395,2042)" d="m0 0 2 1z" />
                            <path transform="translate(2047,422)" d="m0 0" />
                            <path transform="translate(1650)" d="m0 0 2 1z" />
                            <path transform="translate(439,2047)" d="m0 0" />
                            <path transform="translate(398,2043)" d="m0 0" />
                            <path transform="translate(16,2035)" d="m0 0" />
                            <path transform="translate(0,1961)" d="m0 0" />
                            <path transform="translate(1940)" d="m0 0" />
                            <path transform="translate(1620)" d="m0 0" />
                        </svg>
                    </button>
                </div>
            )
        }
    }
    if (NewOrderData.products.length == 0) {
        useEffect(() => {
            navigate(-1);

        }, [])
        return;
    }

    const goToPaymentMethod = () => {
        if (isWorkingOnPC) {
            dispatch(ShowAddPaymenthMethod())
        } else {
            navigate("/add_payment_method")
        }
    }


    const CreateOrderSt1 = useMemo(() =>
        () => {
            const { allAddresses, userAddress, haveAnAddress, isLoadingAddress } = useSelector(st => st.addAddress);
            const [listOfAddress, setlistOfAddress] = useState([])
            useEffect(() => {
                if (NewOrderData.addressUsed == null) {
                    allAddresses && allAddresses.forEach(elm => {
                        if (elm.isDefault) {
                            setlistOfAddress(c => [...c, { ...elm, choosed: true }])
                            dispatch(setUsedAddress(elm))
                        } else {
                            setlistOfAddress(c => [...c, { ...elm, choosed: false }])
                        }
                    })
                } else {
                    allAddresses && allAddresses.forEach(elm => {
                        if (elm.id == NewOrderData.addressUsed.id) {
                            setlistOfAddress(c => [...c, { ...elm, choosed: true }])
                        } else {
                            setlistOfAddress(c => [...c, { ...elm, choosed: false }])
                        }
                    })
                }

            }, [allAddresses])

            async function handelChoosAddress(adr) {
                setlistOfAddress(listOfAddress.map(o => o.id == adr.id ? { ...o, choosed: true } : { ...o, choosed: false }))
                delete adr['choosed']
                dispatch(setUsedAddress(adr))
            }

            const handelDoneStepOne = () => {
                dispatch(passTo2Step());
            }
            if (isWorkingOnPC) {

                return (
                    <div className="c-s-s  p10 wmia">
                        <span className="wmia r-b-c">
                            <p className='ml10'>Step 1 : <strong className='ml10'>  Select your shipping address for this order. </strong></p>
                            <BTN_OPEN_ADDRESS className={"w200  bl p10 br20"} />
                        </span>
                        <div className="cntListAddress orderStepsCm  mt20 h400 c-s-s wmia p20" style={{ overflow: "auto" }} >
                            {
                                isLoadingAddress ? <GoodLoader /> :
                                    haveAnAddress ? <>
                                        {
                                            listOfAddress.map(adr =>
                                                <div onClick={() => handelChoosAddress(adr)} className={adr.choosed ? "wmia ChoseededAddressStyle p10 p20 r-b-c c-b bg-third mb20 br20 " : "wmia  mb20 p10 p20 r-b-c bg-third br20 "} key={adr.id}>
                                                    <span className='r-s-c'>
                                                        <svg xmlns="http://www.w3.org/2000/svg" className='mr10' viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Zm0 294q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0 106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Zm0-480Z" /></svg>
                                                        <p>{adr.phone} , {adr.houseApparNum} , {adr.street} {adr.city} , {adr.zip}</p>
                                                    </span>
                                                    {
                                                        adr.choosed ?
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" /></svg>
                                                            : null
                                                    }
                                                </div>
                                            )
                                        }
                                    </> :
                                        <>
                                            <div className='wmia c-c-c mt50'>
                                                <h1 className="logo" style={{ textAlign: "center" }}>You have not provided any address yet, please add an address to complete the process.</h1>
                                                <BTN_OPEN_ADDRESS className={"w200 mt20 bl p10 br20"} />

                                            </div>
                                        </>
                            }
                        </div>
                        {haveAnAddress && <>
                            <button className='bl mt20 p10 w200 br20' onClick={handelDoneStepOne} style={{ alignSelf: "end" }}>Use this address<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m700-300-57-56 84-84H120v-80h607l-83-84 57-56 179 180-180 180Z" /></svg></button>
                        </>}


                    </div>
                )
            } else {
                return (
                    <div className="c-s-s  p50 wmia">
                        <span className="wmia r-b-c">
                            <p className='ml10'>Step 1 : <strong className='ml10'>  Select your shipping address for this order. </strong></p>
                        </span>
                        <div className="cntListAddress h400 orderStepsCm  mt20  c-s-s wmia " style={{ overflow: "auto" }} >
                            {
                                isLoadingAddress ? <GoodLoader /> :
                                    haveAnAddress ? <>
                                        {
                                            listOfAddress.map(adr =>
                                                <div onClick={() => handelChoosAddress(adr)} className={adr.choosed ? "wmia ChoseededAddressStyle  p10 p20 r-b-c c-b bg-third mb20 br20 " : "wmia  mb20 p10 p20 r-b-c bg-third br20 "} key={adr.id}>
                                                    <span className='r-s-c'>
                                                        <svg xmlns="http://www.w3.org/2000/svg" className='mr10' viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Zm0 294q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0 106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Zm0-480Z" /></svg>
                                                        <p>{adr.phone} , {adr.houseApparNum} , {adr.street} {adr.city} , {adr.zip}</p>
                                                    </span>
                                                    {
                                                        adr.choosed ?
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" /></svg>
                                                            : null
                                                    }
                                                </div>
                                            )
                                        }

                                    </> :
                                        <>
                                            <div className='wmia c-c-c mt50'>
                                                <h1 className="logo" style={{ textAlign: "center" }}>You have not provided any address yet, please add an address to complete the process.</h1>
                                                <BTN_OPEN_ADDRESS className={"w200 mt20 bl p10 br20"} />

                                            </div>
                                        </>
                            }

                        </div>
                        {haveAnAddress && <>
                            <BTN_OPEN_ADDRESS className={"wmia mt50 cl  p10 br20"} />
                            <button className='bl mt20 p10 w200 br20' onClick={handelDoneStepOne} style={{ alignSelf: "end" }}>Use this address<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m700-300-57-56 84-84H120v-80h607l-83-84 57-56 179 180-180 180Z" /></svg></button>
                        </>}


                    </div>
                )
            }

        }
        , [])

    const CreateOrderSt2 = useMemo(() =>
        () => {
            const { havePaymenthMethod, AllPaymenthMethod, isLodingPay } = useSelector(s => s.paymentMethod)
            const [ListPaymentMethods, setListPaymentMethods] = useState([])

            useEffect(() => {
                if (NewOrderData.paymentMethodUsed == null) {
                    AllPaymenthMethod && AllPaymenthMethod.forEach(elm => {
                        if (elm.isDefault) {
                            setListPaymentMethods(c => [...c, { ...elm, choosed: true }])
                            dispatch(setUsedPaymentMethod(elm))
                        } else {
                            setListPaymentMethods(c => [...c, { ...elm, choosed: false }])
                        }
                    })
                } else {
                    AllPaymenthMethod && AllPaymenthMethod.forEach(elm => {
                        if (elm.id == NewOrderData.paymentMethodUsed.id) {
                            setListPaymentMethods(c => [...c, { ...elm, choosed: true }])
                        } else {
                            setListPaymentMethods(c => [...c, { ...elm, choosed: false }])
                        }
                    })
                }
            }, [])

            async function handelChoosAddress(adr) {
                setListPaymentMethods(ListPaymentMethods.map(o => o.id == adr.id ? { ...o, choosed: true } : { ...o, choosed: false }))
                delete adr['choosed']
                dispatch(setUsedPaymentMethod(adr))
            }
            const handelDoneStep2 = () => {
                dispatch(passTo3Step());
            }
            if (isWorkingOnPC) {

                return (
                    <div className="c-s-s w600  p10 wmia">
                        <span className="wmia r-b-c">
                            <p className='ml10'>Step 2 : <strong className='ml10'> Choose payment method </strong></p>
                            <button className={"w300  bl p10 br20"} onClick={() => dispatch(ShowAddPaymenthMethod())}>Add new payment method <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v240H160v240h400v80H160Zm0-480h640v-80H160v80ZM760-80v-120H640v-80h120v-120h80v120h120v80H840v120h-80ZM160-240v-480 480Z" /></svg> </button>
                        </span>
                        <div className="cntListAddress orderStepsCm mt20 h400 c-s-s wmia p20" style={{ overflow: "auto" }} >
                            {
                                isLodingPay ? <GoodLoader /> :
                                    havePaymenthMethod ? <>
                                        {
                                            ListPaymentMethods.map(p =>
                                                <div onClick={() => handelChoosAddress(p)} className={p.choosed ? "wmia ChoseededAddressStyle p10 p20 r-b-c c-b bg-third mb20 br20 " : "wmia  mb20 p10 p20 r-b-c bg-third br20 "} key={p.id}>
                                                    <span className='r-s-c'>
                                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M880-720v480q0 33-23.5 56.5T800-160H160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720Zm-720 80h640v-80H160v80Zm0 160v240h640v-240H160Zm0 240v-480 480Z" /></svg>
                                                        <img className="w40 ml20" src={getrealImg(p?.cardType)} alt="" />
                                                        <div className="c-s-s ml20">
                                                            <h1 className="cardNumbreele">
                                                                {p && Khazl(p.CardNumber)}
                                                            </h1>
                                                            < p >{p?.CardholderName}</p>
                                                        </div>
                                                        <h2 className='ml20'>{p?.ExpiryDate}</h2>
                                                    </span>
                                                    {
                                                        p.choosed ?
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" /></svg>
                                                            : null
                                                    }
                                                </div>
                                            )
                                        }
                                    </> : <div className='wmia c-c-c mt50'>
                                        <h1 className="logo" style={{ textAlign: "center" }}>You have not provided any payment method yet, please add a payment method to complete the process.</h1>
                                        <button className={"w300 mt20 bl p10 br20"} onClick={() => dispatch(ShowAddPaymenthMethod())}>Add a payment method <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v240H160v240h400v80H160Zm0-480h640v-80H160v80ZM760-80v-120H640v-80h120v-120h80v120h120v80H840v120h-80ZM160-240v-480 480Z" /></svg> </button>
                                    </div>
                            }
                        </div>
                        {
                            havePaymenthMethod && <>
                                <button className='bl p10 mt20  br20' style={{ alignSelf: "end" }} onClick={handelDoneStep2}>Use this payment method<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m700-300-57-56 84-84H120v-80h607l-83-84 57-56 179 180-180 180Z" /></svg></button>
                            </>}
                        <button className='cr   mt10' onClick={() => dispatch(backToStep1())}><svg xmlns="http://www.w3.org/2000/svg" style={{ transform: "rotate(180deg)" }} viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m700-300-57-56 84-84H120v-80h607l-83-84 57-56 179 180-180 180Z" /></svg>back</button>
                    </div >
                )
            } else {
                return (
                    <div className="c-s-s wmia  p5 wmia">
                        <span className="wmia r-b-c">
                            <p className='ml10'>Step 2 : <strong className='ml10'> Choose payment method </strong></p>
                        </span>
                        <div className="cntListAddress orderStepsCm mt20 h400 c-s-s wmia p0" style={{ overflow: "auto" }} >
                            {
                                isLodingPay ? <GoodLoader /> :
                                    havePaymenthMethod ? <>
                                        {
                                            ListPaymentMethods.map(p =>
                                                <div onClick={() => handelChoosAddress(p)} className={p.choosed ? "wmia ChoseededAddressStyle  p20 r-b-c c-b bg-third mb20 br20 " : "wmia  mb20 p10 p20 r-b-c bg-third br20 "} key={p.id}>
                                                    <span className='r-s-c'>
                                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M880-720v480q0 33-23.5 56.5T800-160H160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720Zm-720 80h640v-80H160v80Zm0 160v240h640v-240H160Zm0 240v-480 480Z" /></svg>
                                                        <img className="w40 ml20" src={getrealImg(p?.cardType)} alt="" />
                                                        <div className="c-s-s ml20">
                                                            <h1 className="cardNumbreele">
                                                                {p && Khazl(p.CardNumber)}
                                                            </h1>
                                                            < p >{p?.CardholderName}</p>
                                                        </div>
                                                        <h2 className='ml20'>{p?.ExpiryDate}</h2>
                                                    </span>
                                                    {
                                                        p.choosed ?
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" /></svg>
                                                            : null
                                                    }
                                                </div>
                                            )
                                        }
                                    </> : <div className='wmia c-c-c mt50'>
                                        <h1 className="logo" style={{ textAlign: "center" }}>You have not provided any payment method yet, please add a payment method to complete the process.</h1>
                                        <button className={"w300 mt20 bl p10 br20"} onClick={() => goToPaymentMethod()}>Add a payment method <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v240H160v240h400v80H160Zm0-480h640v-80H160v80ZM760-80v-120H640v-80h120v-120h80v120h120v80H840v120h-80ZM160-240v-480 480Z" /></svg> </button>
                                    </div>
                            }
                        </div>
                        {
                            havePaymenthMethod && <>
                                <button className={"wmia  cl p10 br20"} onClick={() => goToPaymentMethod()}>Add new payment method <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v240H160v240h400v80H160Zm0-480h640v-80H160v80ZM760-80v-120H640v-80h120v-120h80v120h120v80H840v120h-80ZM160-240v-480 480Z" /></svg> </button>
                                <button className='bl p10 mt20  br20' style={{ alignSelf: "end" }} onClick={handelDoneStep2}>Use this payment method<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m700-300-57-56 84-84H120v-80h607l-83-84 57-56 179 180-180 180Z" /></svg></button>
                            </>}
                        <button className='cr   mt10' onClick={() => dispatch(backToStep1())}><svg xmlns="http://www.w3.org/2000/svg" style={{ transform: "rotate(180deg)" }} viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m700-300-57-56 84-84H120v-80h607l-83-84 57-56 179 180-180 180Z" /></svg>back</button>
                    </div >
                )
            }


        }
        , [AllPaymenthMethod])

    const CreateOrderSt3 = useMemo(() =>
        () => {
            const { isLoaddingCustomProds, CustomProds } = useSelector(s => s.CustomProds)
            const [MoreProdsVSBL, setMoreProdsVSBL] = useState(false)

            useEffect(() => {
                dispatch(GetCustomProds(NewOrderData.products))
            }, [])
            function handelIncreaseQuant(prodId) {
                dispatch(increaseCquantity({ id: prodId }))
            }
            function handelDecreaseQuant(prodId) {
                dispatch(decreaseCquantity({ id: prodId }))
            }


            const handelDoneStep3 = () => {
                dispatch(endingQuantity(CustomProds.map(elm => ({ id: elm.id, price: elm.price, quantity: elm.quantity }))))
            }

            const GetMoreProds = () => {
                const { productsList, isLoadingData, resultSearch, searchTerme, isSearching } = useSelector(s => s.productsManager)
                if (productsList.length === 0) {
                    dispatch(fetchProds())
                }
                const [addProdsAdded, setaddProdsAdded] = useState(NewOrderData.products)
                const AddToListFun = (p) => {

                    setaddProdsAdded(cu => [...cu, { id: p.id, price: p.price, quantity: 1 }])
                }
                const handelSavedAddedProds = () => {
                    dispatch(handelSaveAddedProds(addProdsAdded))
                    dispatch(GetCustomProds(addProdsAdded))
                    setMoreProdsVSBL(false)
                }
                return ReactDom.createPortal(
                    <div className='backendMer'>
                        <div className="p20 psr w1000   c-s-s bg-l br20 activeCmp" style={{ maxHeight: "100%", overflow: "auto" }}>
                            <button className="btnClose" onClick={() => setMoreProdsVSBL(false)}><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" /></svg></button>
                            <SearchInput />
                            {
                                isLoadingData ? <div className="loader"></div> :
                                    <>
                                        {
                                            isSearching ?
                                                <>
                                                    <div className="listProdusctListFou mt20 r-w-p " style={{ maxHeight: "700px", minHeight: "300px" }}>
                                                        {resultSearch.length > 0 ?
                                                            resultSearch.map(p => <div className="c-s-s" key={p.id}><ProductCard2 product={p} />
                                                                {addProdsAdded.some(a => a.id == p.id) ?
                                                                    <button className='r-c-c bg-g  ml10 mt20 w200 p5 br5 '>Added <svg xmlns="http://www.w3.org/2000/svg" className='ml10' viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" /></svg></button>
                                                                    :
                                                                    <button className='bl ml10 mt20 w200 p5 br5' onClick={() => AddToListFun(p)}>Add <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" /></svg></button>
                                                                }
                                                            </div>)
                                                            :
                                                            <div className="mrauto c-c-c">

                                                                <h1>No result for  {searchTerme} !</h1>
                                                            </div>

                                                        }
                                                    </div>
                                                </>

                                                :
                                                <div className="listProdusctListFou mt20" style={{ maxHeight: "700px", minHeight: "300px" }}>
                                                    {
                                                        productsList.map(p => <div className="c-s-s" key={p.id}><ProductCard2 product={p} />
                                                            {addProdsAdded.some(a => a.id == p.id) ?
                                                                <button className='r-c-c bg-g  ml10 mt20 w200 p5 br5 '>Added <svg xmlns="http://www.w3.org/2000/svg" className='ml10' viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" /></svg></button>
                                                                :
                                                                <button className='bl ml10 mt20 w200 p5 br5' onClick={() => AddToListFun(p)}>Add <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" /></svg></button>
                                                            }
                                                        </div>)
                                                    }
                                                </div>
                                        }

                                        <button className='bl p10 ml20 mt20 w100  br20' onClick={handelSavedAddedProds} style={{ alignSelf: "end" }}>Done  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" /></svg></button>

                                    </>
                            }

                        </div>
                    </div>
                    , document.getElementById("portlas"))
            }
            if (isWorkingOnPC) {

                return (
                    <div className="c-s-s  p10 w1000">
                        {MoreProdsVSBL && <GetMoreProds />}

                        <span className="wmia r-b-c">
                            <p className='ml10'>Step 3 : <strong className='ml10'>Specify the quantity of products </strong></p>
                            <button className={"w300  bl p10 br20"} onClick={() => { setMoreProdsVSBL(true) }}>Add more products
                                <svg version="1.1" viewBox="0 0 1024 1024" width="256" height="256" xmlns="http://www.w3.org/2000/svg">
                                    <path transform="translate(431)" d="m0 0h7l9 6 18 10 24 14 52 30 24 14 28 16 52 30 24 14 28 16 24 14 28 16 24 14 28 16 24 14 21 12 22 13 2 3 1 336 21 8 23 12 18 12 11 9 10 9 6 5 7 8 12 14 9 13 9 15 8 16 7 17 8 28 2 10h2v67l-2 5-4 18-6 21-6 15-9 19-10 16-8 11-9 11-12 13-4 4h-2v2h-2v2l-14 11-16 11-17 10-20 9-21 7-26 6-8 2h-62v-2l-27-6-21-7-27-13-16-10-17-13-15-14-11-11-11-14-14-21-3-5-5 2-18 10-24 14-28 16-26 15-24 14-23 13-13 8-7 4-4-1-25-14-17-10-21-12-26-15-24-14-26-15-21-12-26-15-24-14-52-30-21-12-24-14-104-60-21-12v-504l10-6 24-14 130-75 17-10 28-16 26-15 24-14 14-8 24-14 28-16 24-14 28-16 24-14 23-13 5-3h2zm3 70-11 6-28 16-24 14-21 12-24 14-14 8-24 14-23 13-24 14-26 15-28 16-27 16-25 14-27 16-14 8-2 3 21 12 24 14 52 30 24 14 28 16 24 14 21 12 17 10 28 16 78 45 24 14h3l23-13 24-14 104-60 24-14 21-12 24-14 28-16 24-14 23-13 24-14 22-13v-2l-24-14-208-120-24-14-28-16-24-14-21-12-10-6zm-373 251-1 59v338l21 12 24 14 14 8 24 14 42 24 24 14 14 8 24 14 21 12 24 14 28 16 26 15 28 16 17 10 10 6h3v-395l-5-4-97-56-24-14-28-16-24-14-52-30-28-16-24-14-52-30zm747 0-28 16-104 60-24 14-28 16-17 10-49 28-24 14-52 30-15 9-2 2v395l5-1 24-14 43-25 28-16 16-9 1-5-3-18-1-10v-30l3-25 5-22 7-21 14-29 12-19 13-16 11-12 10-10 17-13 10-7 17-10 19-9 27-9 25-5 19-2 21-1 1-8v-248zm-19 317-22 3-21 6-17 7-14 8-17 12-16 15-11 13-7 10-9 16-9 21-6 24-2 18v19l3 24 6 21 9 21 11 18 11 14 17 17 18 13 16 9 11 5 18 6 20 4 9 1h28l20-3 18-5 19-8 18-10 12-9 14-12 10-11v-2h2l10-14 8-14 8-19 6-21 3-20v-29l-3-20-5-18-8-19-10-18-12-16-19-19-18-13-16-9-19-8-19-5-21-3z" />
                                    <path transform="translate(770,705)" d="m0 0h61v65h64l2 2v57l-1 2h-65v65l-36 1h-22l-3-1v-65h-65v-61h65z" />
                                    <path transform="translate(1023,832)" d="m0 0" />
                                </svg>
                            </button>
                        </span>
                        <div className="cntListProds2  mt20  c-s-s wmia" style={{ overflow: "auto" }} >
                            {
                                isLoaddingCustomProds ? <GoodLoader /> :
                                    CustomProds && CustomProds.map(p =>
                                        <div className='wmia p10 h300 r-p-c psr mb20 ' key={p.id}>
                                            <img src={p.images[0]} alt="" className="hmia" />
                                            <div className="cntSeconfInfo c-s-s ml20">
                                                <h1>{p.title}</h1>
                                                <h2 className='mt10'>$ {p.price}</h2>
                                                <span className="cntBtnIncreaseDecrease r-s-c mt20">
                                                    <p className='mr20 r-c-c'><svg version="1.1" viewBox="0 0 2048 2048" className='mr10' xmlns="http://www.w3.org/2000/svg">
                                                        <path transform="translate(887,50)" d="m0 0h637l24 1 17 3 14 5 14 8 11 9 8 8 10 14 8 14 5 15 3 18 1 30v105l-1 511-2 29-4 17-8 17-9 15h300l33 1 15 1 18 4 16 8 12 9 8 7 11 14 13 21 7 11v711l-3-1-14 21-9 11-12 13-14 15-12 12-4 5-13 13h-2l-2 4-156 156h-2l-2 4-16 16h-2l-2 4h-2l-2 4-4 4h-2l-2 4-12 12-8 7-13 12-18 12-16 7-12 3-23 2-45 1h-609l-76-1-13-1-8-3-11-8-9-6-8-6-5-1-8 6-9 7-12 6-11 4-7 1-19 1-118 1h-567l-34-1-17-1-17-4-16-8-9-7-10-9-11-13-7-11-9-14-3-3-1-2v-743l3-1 2-5 8-14 10-14 13-13 24-18 19-13 20-14 34-24 16-11 40-28 34-24 20-14 18-13 14-10 20-14 18-13 19-13 17-12 33-22 15-9 16-7 16-5 12-3v-257l1-163 1-53 2-22 4-17 4-9 7-11 6-8h2l2-4 12-11 14-10 24-16 34-24 43-30 14-10 18-13 12-8 18-13 19-13 18-13 34-24 14-10 17-12 40-28 18-13 15-10 15-8 12-4 12-2zm355 68-12 8-13 10-11 9-12 9-11 9-10 8-14 11-13 10-9 7-14 11-16 13-8 6-9 7-19 14-13 11-14 10-18 14-2 3 195 2 50 1 16 1 18 6 5 1 6-4 14-12 8-7 14-12 17-16 8-7 14-12 10-9 11-9 15-13 11-10 11-9 15-14 11-9 12-11 8-7 10-9 10-10v-1h-19l-14 1h-50zm-350 1m225-2-34 2h-180l-13 2 1-2-13 1-14 8-14 10-19 13-13 10-18 13-19 13-14 10-19 14-22 15-14 10-13 9-16 12-24 15-15 11-3 4 75 1 46 1 106 1 35-1 10-3 9-6 12-9 14-11 16-13 17-13 9-8 12-9 26-20 18-14 14-11 16-13 16-12 13-10 15-13 5-6v-1zm449 50-11 8-10 9-13 12-12 11-10 8-11 10-22 18-7 7-11 9-13 12-8 7-11 10-11 9-15 14-14 11-16 13-7 5-6 7 1 7 5 17 1 13v552l-1 84 4-2v-2l4-2 17-17v-2l3-1 5-5v-2l4-2v-2l3-1 7-8 13-13v-2l4-2 8-8 7-8 49-49 8-7v-2h2v-2l4-2 32-32 8-7 3-3v-2l3-1 7-8 6-7 3-8 1-21v-619zm2 1m-1019 190-18 2-10 5-4 5-4 17-1 7-1 151v249l1 278 3 14 6 12 7 6 6 2 23 2 33 1h226l446-1 15-3 6-3 6-5 4-9 2-12 1-63v-604l-1-26-3-10-3-5-10-7-5-2-62-1zm-109 579-17 9-19 14-11 7-11 8-15 10-20 14-14 10-17 12-10 7-15 11-17 12-16 11-16 12-17 12-18 12-11 9v1l44-1h17l172 3h16l-2-49-1-95v-29zm1481-1-25 2h-349l-10 6-84 84v2h-2v2h-2l-7 8-25 25-7 8-11 11-11 9-12 12-1 3h46l252 2 19 1 29 7 8-7 9-9 11-9 9-9 8-7 10-9 8-7 10-9 8-7 10-9 11-9 11-10 11-9 10-9 28-24 10-9 14-12 9-9v-2l4-2 3-5zm56 48-15 13-10 9-11 9-10 9-11 9-12 11-11 9-13 12-8 7-13 12-10 8-7 7-8 7-10 9-10 8-14 12-9 7-10 9-14 11-6 6 1 7 5 5 2 9 1 47v542l1 59 5-3 25-25v-2l3-1 7-8 5-5v-2l4-2 65-65 4-3v-2l4-2 4-4v-2l4-2 8-8v-2l4-2 52-52 6-10 3-6 1-31v-614zm-965 193-63 1-13 2-8 5-4 13-2 18v681l3 12 5 9 8 5 11 3 12 1 58 1h598l52-1 16-2 9-4 5-5 4-13 1-5 1-15v-678l-4-13-4-8-10-5-10-1-485-1zm-559 0-361 1-9 2-6 3-2 2-5 18-1 19-1 69v575l1 29 2 12 3 9 5 6 8 3 17 2 82 1h472l163-1 12-2 10-5 4-4 2-9 2-22 2-340v-266l-1-66-2-15-4-10-8-7-10-3z" />
                                                        <path transform="translate(206,1654)" d="m0 0h117l26 1 15 3 10 4 11 8 8 8 9 14 5 13 3 20 1 18v35l-3 26-5 15-7 12-7 9h-2l-2 4-10 8-11 4-11 2-15 1-53 1h-69l-22-1-12-2-12-5-10-8-9-9-9-14-4-11-3-13-1-10-1-22v-15l1-28 3-16 5-13 7-11 11-12 10-7 13-6 9-2zm0 69-1 3-1 17-1 40 1 7 1 1h131l3-1 1-7v-58l-4-1z" />
                                                        <path transform="translate(1061,1654)" d="m0 0h111l27 1 17 3 10 4 10 6 9 8 7 10 6 12 3 11 2 16 1 25v14l-1 24-3 20-5 14-6 9-8 10-10 9-10 5-14 3-13 1-31 1h-95l-21-1-14-3-14-7-11-10-10-14-5-10-4-14-2-18v-40l2-27 4-17 8-15 8-10 8-7 14-8 13-4zm-1 69-2 1-1 33v32l6 2h125l4-1 1-3 1-38 1-24-1-1z" />
                                                        <path transform="translate(659,835)" d="m0 0h113l27 2 12 3 11 6 10 9 7 7 6 10 5 12 3 14 1 9 1 20v28l-2 21-3 15-6 14-9 12-10 10-12 8-12 3-33 2h-126l-14-2-10-3-11-7-11-10-9-13-5-13-3-14-1-9-1-25v-14l1-25 2-16 5-14 6-11 11-12 14-9 13-5 13-2zm-10 69-1 27v40l2 1 17 1 112-1 4-1 1-7v-60z" />
                                                        <path transform="translate(646,1654)" d="m0 0h79l26 1 13 3 11 6 6 9 2 8v14l-3 12-7 9-14 7-74 1h-32l-15-1-8-3-9-10-8-16-1-4v-7l5-10 9-11 8-5z" />
                                                        <path transform="translate(1506,1654)" d="m0 0h67l30 1 14 3 9 4 5 4 4 8 1 3v21l-4 12-4 5-10 5-10 3h-116l-9-3-9-9-5-10-2-7v-12l5-13 5-6 16-8z" />
                                                        <path transform="translate(1104,835)" d="m0 0h69l23 1 11 2 9 5 7 8 4 11v15l-4 13-7 8-9 4-6 1-37 1h-75l-12-2-9-7-5-6-6-13-1-7 3-12 6-10h2l2-4 7-5 9-2z" />
                                                        <path transform="translate(1090,972)" d="m0 0h107l10 2 10 6 7 9 3 7 1 13-2 10-7 12-7 6-9 2-36 1h-80l-12-2-5-4-7-10-5-10-1-3v-8l4-13 9-11 6-5 2-1z" />
                                                        <path transform="translate(653,1791)" d="m0 0h80l23 1 9 2 9 6 6 7 2 5 1 6v14l-3 10-6 8-8 6-4 2-7 1h-115l-8-2-6-4-6-9-7-12-1-9 8-16 8-10 5-4 3-1z" />
                                                        <path transform="translate(1520,1791)" d="m0 0h75l16 1 10 3 9 8 5 9 2 10-1 14-4 10-4 6-8 4-10 3h-116l-9-2-8-6-7-12-2-7v-13l4-12 9-10 6-4 5-1z" />
                                                        <path transform="translate(2046,1660)" d="m0 0 2 1-2 1z" />
                                                        <path transform="translate(0,1925)" d="m0 0" />
                                                        <path transform="translate(2044,1662)" d="m0 0" />
                                                    </svg>Quantity</p>
                                                    <button className='btnIncreseQuantity mr15 tbnsRegl ' onClick={() => handelIncreaseQuant(p.id)} >

                                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" /></svg>
                                                    </button>
                                                    <h1 className='ml10 mr10 logo'> {p.quantity}
                                                    </h1>
                                                    {
                                                        p.quantity > 1 ?
                                                            <button className='btnDeccreseQuantity ml15 tbnsRegl ' onClick={() => handelDecreaseQuant(p.id)} >
                                                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M200-440v-80h560v80H200Z" /></svg>
                                                            </button>
                                                            : null
                                                    }
                                                </span>

                                            </div>
                                            <span className='r-c-c ml20' style={{ fontSize: "16px" }}>
                                                Total :
                                                <h1 className='ml10 ' style={{ fontSize: "20px" }}>
                                                    $ {getRealNumber(p.quantity * p.price)}
                                                </h1>
                                            </span>
                                        </div>
                                    )




                            }
                        </div>
                        {
                            isLoaddingCustomProds ? <GoodLoader /> :
                                <span style={{ alignSelf: "end", fontSize: "16px" }} className='mt20 r-c-c'>
                                    {CustomProds && <> Subtotal : <h2 className='ml10'>{CustomProds.reduce((c, el) => c + el.quantity, 0)} items </h2> <h1 style={{ fontSize: "20px" }} className='ml10 mr20'> $ {getRealNumber(CustomProds.reduce((c, el) => c + (el.quantity * el.price), 0))}</h1></>}
                                    <button className='bl p10 ml20 w100  br20' onClick={handelDoneStep3}>Done <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m700-300-57-56 84-84H120v-80h607l-83-84 57-56 179 180-180 180Z" /></svg></button>
                                </span>
                        }
                        <button className='cr   mt10' onClick={() => dispatch(backToStep2())}><svg xmlns="http://www.w3.org/2000/svg" style={{ transform: "rotate(180deg)" }} viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m700-300-57-56 84-84H120v-80h607l-83-84 57-56 179 180-180 180Z" /></svg>back</button>
                    </div>
                )
            } else {
                return (
                    <div className="c-s-s   wmia">
                        {MoreProdsVSBL && <GetMoreProds />}
                        <span className="wmia r-b-c">
                            <p className='ml10'>Step 3 : <strong className='ml10'>Specify the quantity of products </strong></p>

                        </span>
                        <div className="cntListProds2  mt20  c-s-s wmia" style={{ overflow: "auto" }} >
                            {
                                isLoaddingCustomProds ? <GoodLoader /> :
                                    CustomProds && CustomProds.map(p =>
                                        <div className='wmia p10 h200 r-p-c psr mb20 ' key={p.id}>
                                            <img src={p.images[0]} alt="" className="w100" />
                                            <div className="cntSeconfInfo c-s-s ml10">
                                                <h1>{p.title}</h1>
                                                <h2 className='mt10'>$ {p.price}</h2>
                                                <span className="cntBtnIncreaseDecrease r-s-c mt20">
                                                    <p className='mr20 r-c-c'><svg version="1.1" viewBox="0 0 2048 2048" className='mr10' xmlns="http://www.w3.org/2000/svg">
                                                        <path transform="translate(887,50)" d="m0 0h637l24 1 17 3 14 5 14 8 11 9 8 8 10 14 8 14 5 15 3 18 1 30v105l-1 511-2 29-4 17-8 17-9 15h300l33 1 15 1 18 4 16 8 12 9 8 7 11 14 13 21 7 11v711l-3-1-14 21-9 11-12 13-14 15-12 12-4 5-13 13h-2l-2 4-156 156h-2l-2 4-16 16h-2l-2 4h-2l-2 4-4 4h-2l-2 4-12 12-8 7-13 12-18 12-16 7-12 3-23 2-45 1h-609l-76-1-13-1-8-3-11-8-9-6-8-6-5-1-8 6-9 7-12 6-11 4-7 1-19 1-118 1h-567l-34-1-17-1-17-4-16-8-9-7-10-9-11-13-7-11-9-14-3-3-1-2v-743l3-1 2-5 8-14 10-14 13-13 24-18 19-13 20-14 34-24 16-11 40-28 34-24 20-14 18-13 14-10 20-14 18-13 19-13 17-12 33-22 15-9 16-7 16-5 12-3v-257l1-163 1-53 2-22 4-17 4-9 7-11 6-8h2l2-4 12-11 14-10 24-16 34-24 43-30 14-10 18-13 12-8 18-13 19-13 18-13 34-24 14-10 17-12 40-28 18-13 15-10 15-8 12-4 12-2zm355 68-12 8-13 10-11 9-12 9-11 9-10 8-14 11-13 10-9 7-14 11-16 13-8 6-9 7-19 14-13 11-14 10-18 14-2 3 195 2 50 1 16 1 18 6 5 1 6-4 14-12 8-7 14-12 17-16 8-7 14-12 10-9 11-9 15-13 11-10 11-9 15-14 11-9 12-11 8-7 10-9 10-10v-1h-19l-14 1h-50zm-350 1m225-2-34 2h-180l-13 2 1-2-13 1-14 8-14 10-19 13-13 10-18 13-19 13-14 10-19 14-22 15-14 10-13 9-16 12-24 15-15 11-3 4 75 1 46 1 106 1 35-1 10-3 9-6 12-9 14-11 16-13 17-13 9-8 12-9 26-20 18-14 14-11 16-13 16-12 13-10 15-13 5-6v-1zm449 50-11 8-10 9-13 12-12 11-10 8-11 10-22 18-7 7-11 9-13 12-8 7-11 10-11 9-15 14-14 11-16 13-7 5-6 7 1 7 5 17 1 13v552l-1 84 4-2v-2l4-2 17-17v-2l3-1 5-5v-2l4-2v-2l3-1 7-8 13-13v-2l4-2 8-8 7-8 49-49 8-7v-2h2v-2l4-2 32-32 8-7 3-3v-2l3-1 7-8 6-7 3-8 1-21v-619zm2 1m-1019 190-18 2-10 5-4 5-4 17-1 7-1 151v249l1 278 3 14 6 12 7 6 6 2 23 2 33 1h226l446-1 15-3 6-3 6-5 4-9 2-12 1-63v-604l-1-26-3-10-3-5-10-7-5-2-62-1zm-109 579-17 9-19 14-11 7-11 8-15 10-20 14-14 10-17 12-10 7-15 11-17 12-16 11-16 12-17 12-18 12-11 9v1l44-1h17l172 3h16l-2-49-1-95v-29zm1481-1-25 2h-349l-10 6-84 84v2h-2v2h-2l-7 8-25 25-7 8-11 11-11 9-12 12-1 3h46l252 2 19 1 29 7 8-7 9-9 11-9 9-9 8-7 10-9 8-7 10-9 8-7 10-9 11-9 11-10 11-9 10-9 28-24 10-9 14-12 9-9v-2l4-2 3-5zm56 48-15 13-10 9-11 9-10 9-11 9-12 11-11 9-13 12-8 7-13 12-10 8-7 7-8 7-10 9-10 8-14 12-9 7-10 9-14 11-6 6 1 7 5 5 2 9 1 47v542l1 59 5-3 25-25v-2l3-1 7-8 5-5v-2l4-2 65-65 4-3v-2l4-2 4-4v-2l4-2 8-8v-2l4-2 52-52 6-10 3-6 1-31v-614zm-965 193-63 1-13 2-8 5-4 13-2 18v681l3 12 5 9 8 5 11 3 12 1 58 1h598l52-1 16-2 9-4 5-5 4-13 1-5 1-15v-678l-4-13-4-8-10-5-10-1-485-1zm-559 0-361 1-9 2-6 3-2 2-5 18-1 19-1 69v575l1 29 2 12 3 9 5 6 8 3 17 2 82 1h472l163-1 12-2 10-5 4-4 2-9 2-22 2-340v-266l-1-66-2-15-4-10-8-7-10-3z" />
                                                        <path transform="translate(206,1654)" d="m0 0h117l26 1 15 3 10 4 11 8 8 8 9 14 5 13 3 20 1 18v35l-3 26-5 15-7 12-7 9h-2l-2 4-10 8-11 4-11 2-15 1-53 1h-69l-22-1-12-2-12-5-10-8-9-9-9-14-4-11-3-13-1-10-1-22v-15l1-28 3-16 5-13 7-11 11-12 10-7 13-6 9-2zm0 69-1 3-1 17-1 40 1 7 1 1h131l3-1 1-7v-58l-4-1z" />
                                                        <path transform="translate(1061,1654)" d="m0 0h111l27 1 17 3 10 4 10 6 9 8 7 10 6 12 3 11 2 16 1 25v14l-1 24-3 20-5 14-6 9-8 10-10 9-10 5-14 3-13 1-31 1h-95l-21-1-14-3-14-7-11-10-10-14-5-10-4-14-2-18v-40l2-27 4-17 8-15 8-10 8-7 14-8 13-4zm-1 69-2 1-1 33v32l6 2h125l4-1 1-3 1-38 1-24-1-1z" />
                                                        <path transform="translate(659,835)" d="m0 0h113l27 2 12 3 11 6 10 9 7 7 6 10 5 12 3 14 1 9 1 20v28l-2 21-3 15-6 14-9 12-10 10-12 8-12 3-33 2h-126l-14-2-10-3-11-7-11-10-9-13-5-13-3-14-1-9-1-25v-14l1-25 2-16 5-14 6-11 11-12 14-9 13-5 13-2zm-10 69-1 27v40l2 1 17 1 112-1 4-1 1-7v-60z" />
                                                        <path transform="translate(646,1654)" d="m0 0h79l26 1 13 3 11 6 6 9 2 8v14l-3 12-7 9-14 7-74 1h-32l-15-1-8-3-9-10-8-16-1-4v-7l5-10 9-11 8-5z" />
                                                        <path transform="translate(1506,1654)" d="m0 0h67l30 1 14 3 9 4 5 4 4 8 1 3v21l-4 12-4 5-10 5-10 3h-116l-9-3-9-9-5-10-2-7v-12l5-13 5-6 16-8z" />
                                                        <path transform="translate(1104,835)" d="m0 0h69l23 1 11 2 9 5 7 8 4 11v15l-4 13-7 8-9 4-6 1-37 1h-75l-12-2-9-7-5-6-6-13-1-7 3-12 6-10h2l2-4 7-5 9-2z" />
                                                        <path transform="translate(1090,972)" d="m0 0h107l10 2 10 6 7 9 3 7 1 13-2 10-7 12-7 6-9 2-36 1h-80l-12-2-5-4-7-10-5-10-1-3v-8l4-13 9-11 6-5 2-1z" />
                                                        <path transform="translate(653,1791)" d="m0 0h80l23 1 9 2 9 6 6 7 2 5 1 6v14l-3 10-6 8-8 6-4 2-7 1h-115l-8-2-6-4-6-9-7-12-1-9 8-16 8-10 5-4 3-1z" />
                                                        <path transform="translate(1520,1791)" d="m0 0h75l16 1 10 3 9 8 5 9 2 10-1 14-4 10-4 6-8 4-10 3h-116l-9-2-8-6-7-12-2-7v-13l4-12 9-10 6-4 5-1z" />
                                                        <path transform="translate(2046,1660)" d="m0 0 2 1-2 1z" />
                                                        <path transform="translate(0,1925)" d="m0 0" />
                                                        <path transform="translate(2044,1662)" d="m0 0" />
                                                    </svg>Quantity</p>
                                                    <button className='btnIncreseQuantity mr15 tbnsRegl ' onClick={() => handelIncreaseQuant(p.id)} >

                                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" /></svg>
                                                    </button>
                                                    <h1 className='ml10 mr10 logo'> {p.quantity}
                                                    </h1>
                                                    {
                                                        p.quantity > 1 ?
                                                            <button className='btnDeccreseQuantity ml15 tbnsRegl ' onClick={() => handelDecreaseQuant(p.id)} >
                                                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M200-440v-80h560v80H200Z" /></svg>
                                                            </button>
                                                            : null
                                                    }
                                                </span>
                                                <span className='r-c-c  mt20' style={{ fontSize: "16px" }}>
                                                Total :
                                                <h1 className='ml10 ' style={{ fontSize: "20px" }}>
                                                    $ {getRealNumber(p.quantity * p.price)}
                                                </h1>
                                            </span>
                                            </div>
                                            
                                        </div>
                                    )




                            }
                        </div>

                        {
                            isLoaddingCustomProds ? <GoodLoader /> :
                                <span style={{ alignSelf: "end", fontSize: "16px" }} className='mt50 wmia c-ss'>
                                    {
                                    CustomProds && <span className='r-s-c'> Subtotal : <h2 className='r-s-c '>{CustomProds.reduce((c, el) => c + el.quantity, 0)} items </h2> <h1 style={{ fontSize: "20px" }} className='ml10 mr20'> $ {getRealNumber(CustomProds.reduce((c, el) => c + (el.quantity * el.price), 0))}</h1></span>
                                    }
                                    <button className={"wmia cl mt20 p10 br20"} onClick={() => { setMoreProdsVSBL(true) }}>Add more products
                                        <svg version="1.1" viewBox="0 0 1024 1024" width="256" height="256" xmlns="http://www.w3.org/2000/svg">
                                            <path transform="translate(431)" d="m0 0h7l9 6 18 10 24 14 52 30 24 14 28 16 52 30 24 14 28 16 24 14 28 16 24 14 28 16 24 14 21 12 22 13 2 3 1 336 21 8 23 12 18 12 11 9 10 9 6 5 7 8 12 14 9 13 9 15 8 16 7 17 8 28 2 10h2v67l-2 5-4 18-6 21-6 15-9 19-10 16-8 11-9 11-12 13-4 4h-2v2h-2v2l-14 11-16 11-17 10-20 9-21 7-26 6-8 2h-62v-2l-27-6-21-7-27-13-16-10-17-13-15-14-11-11-11-14-14-21-3-5-5 2-18 10-24 14-28 16-26 15-24 14-23 13-13 8-7 4-4-1-25-14-17-10-21-12-26-15-24-14-26-15-21-12-26-15-24-14-52-30-21-12-24-14-104-60-21-12v-504l10-6 24-14 130-75 17-10 28-16 26-15 24-14 14-8 24-14 28-16 24-14 28-16 24-14 23-13 5-3h2zm3 70-11 6-28 16-24 14-21 12-24 14-14 8-24 14-23 13-24 14-26 15-28 16-27 16-25 14-27 16-14 8-2 3 21 12 24 14 52 30 24 14 28 16 24 14 21 12 17 10 28 16 78 45 24 14h3l23-13 24-14 104-60 24-14 21-12 24-14 28-16 24-14 23-13 24-14 22-13v-2l-24-14-208-120-24-14-28-16-24-14-21-12-10-6zm-373 251-1 59v338l21 12 24 14 14 8 24 14 42 24 24 14 14 8 24 14 21 12 24 14 28 16 26 15 28 16 17 10 10 6h3v-395l-5-4-97-56-24-14-28-16-24-14-52-30-28-16-24-14-52-30zm747 0-28 16-104 60-24 14-28 16-17 10-49 28-24 14-52 30-15 9-2 2v395l5-1 24-14 43-25 28-16 16-9 1-5-3-18-1-10v-30l3-25 5-22 7-21 14-29 12-19 13-16 11-12 10-10 17-13 10-7 17-10 19-9 27-9 25-5 19-2 21-1 1-8v-248zm-19 317-22 3-21 6-17 7-14 8-17 12-16 15-11 13-7 10-9 16-9 21-6 24-2 18v19l3 24 6 21 9 21 11 18 11 14 17 17 18 13 16 9 11 5 18 6 20 4 9 1h28l20-3 18-5 19-8 18-10 12-9 14-12 10-11v-2h2l10-14 8-14 8-19 6-21 3-20v-29l-3-20-5-18-8-19-10-18-12-16-19-19-18-13-16-9-19-8-19-5-21-3z" />
                                            <path transform="translate(770,705)" d="m0 0h61v65h64l2 2v57l-1 2h-65v65l-36 1h-22l-3-1v-65h-65v-61h65z" />
                                            <path transform="translate(1023,832)" d="m0 0" />
                                        </svg>
                                    </button>
                                    <button className='bl p10 mt20 wmia  br20' onClick={handelDoneStep3}>Done <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m700-300-57-56 84-84H120v-80h607l-83-84 57-56 179 180-180 180Z" /></svg></button>
                                </span>
                        }

                        <button className='cr   mt50' onClick={() => dispatch(backToStep2())}><svg xmlns="http://www.w3.org/2000/svg" style={{ transform: "rotate(180deg)" }} viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m700-300-57-56 84-84H120v-80h607l-83-84 57-56 179 180-180 180Z" /></svg>back</button>
                    </div>
                )
            }


        }
        , [])

    const FinaleStepCmp = () => {
        const { isLoaddingCustomProds, CustomProds } = useSelector(s => s.CustomProds)
        const { SendingOrderVSBL, isSendingOrder, orderCompleted, orderFailed } = useSelector(st => st.OrderMan)
        function handelSendOrder() {
            dispatch(SendOrderFun())
        }

        return (
            <div className='w1000 c-c-c'>
                <div className='wmia r-b-s h600'>
                    <div className="c-s-s" style={{ width: "48%" }}>
                        <h1 className='mb20'>Order Summary</h1>
                        <span className='r-s-c mb10 spnInfoOSsd'>
                            <p>Subtotal : </p>
                            <h1>$ {getRealNumber(NewOrderData.subtotal)}</h1>
                        </span>
                        <span className='r-s-c mb10 spnInfoOSsd'>
                            <p>Shipping cost : </p>
                            <h1 className='c-g'> Free !</h1>
                        </span>
                        <span className='r-s-c mb10 spnInfoOSsd'>
                            <p>delivery Date : </p>
                            <h1 className=''>{NewOrderData.deliveryDate}</h1>
                        </span>
                        <span className='r-s-c mb10 spnInfoOSsd'>
                            <p>Taxes based on the users location :</p>
                            <h1>10%</h1>
                        </span>
                        <span className='r-s-c mb10 spnInfoOSsd'>
                            <p>the total :</p>
                            <h1>
                                $ {
                                    getRealNumber((NewOrderData.total))
                                }
                            </h1>
                        </span>

                        <span className='c-s-s spnInfoOSsd  mt20'>
                            <p className='r-c-c '>
                                <svg xmlns="http://www.w3.org/2000/svg" className='mr15' viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M880-720v480q0 33-23.5 56.5T800-160H160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720Zm-720 80h640v-80H160v80Zm0 160v240h640v-240H160Zm0 240v-480 480Z" /></svg>
                                Paymenth method used :</p>
                            <div className="wmia mb20 p10 p20 r-b-c br20 ">
                                <span className='r-s-c'>
                                    <img className="w40 ml20" src={getrealImg(NewOrderData.paymentMethodUsed?.cardType)} alt="" />
                                    <div className="c-s-s ml20">
                                        <h1 className="cardNumbreele">
                                            {NewOrderData.paymentMethodUsed && Khazl(NewOrderData.paymentMethodUsed.CardNumber)}
                                        </h1>
                                        < p >{NewOrderData.paymentMethodUsed?.CardholderName}</p>
                                    </div>
                                    <h2 className='ml20'>{NewOrderData.paymentMethodUsed?.ExpiryDate}</h2>
                                </span>
                            </div>
                        </span>
                        <span className='c-s-s spnInfoOSsd mt20'>
                            <p className="r-c-c">
                                <svg xmlns="http://www.w3.org/2000/svg" className='mr10' viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Zm0 294q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0 106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Zm0-480Z" /></svg>
                                Shipping Address :
                            </p>
                            <div className="wmia mb20 p10 p20 r-b-c  br20 " >
                                <span className='r-s-c'>
                                    <p>{user.name} , {NewOrderData.addressUsed.phone} , {NewOrderData.addressUsed.houseApparNum} , {NewOrderData.addressUsed.street} {NewOrderData.addressUsed.city} , {NewOrderData.addressUsed.zip}</p>
                                </span>
                            </div>
                        </span>
                    </div>
                    <div className="c-s-s pl20" style={{ width: "48%" }}>
                        <p className='mb20'>{NewOrderData.products.reduce((q, i) => q + i.quantity, 0)} items of {NewOrderData.products.length} products</p>
                        <div className="cntListOrdedProds c-s-s wmia p10 " style={{ height: '500px', overflow: "auto" }}>
                            {
                                isLoaddingCustomProds ? <GoodLoader />
                                    : CustomProds.map(p =>
                                        <div key={p.id} className="r-b-c wmia mb20">
                                            <p><strong>{p.quantity}</strong> items of a  <strong>{p.title}</strong> </p>
                                            <img src={p.images[0]} alt="" className="w100" />
                                        </div>
                                    )
                            }
                        </div>
                    </div>
                </div>
                <div className="c-c-c wmia ">
                    {
                        orderCompleted ?
                            <div className='c-c-c'>
                                <span className='w400 p10 r-c-c '>Order has  been completed <svg xmlns="http://www.w3.org/2000/svg" className='ml20' viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" /></svg></span>
                                <button className='mt20 bl w300 br20 p10' onClick={() => dispatch(hideCmpCreateOrder())}>Continue Shopping </button>
                            </div>
                            : <>
                                {
                                    orderFailed
                                        ?
                                        <button className='r-c-c w300  btnCompleteOrder ' onClick={handelSendOrder}>
                                            {
                                                isSendingOrder ? <GoodLoader />
                                                    : <>
                                                        Try again   <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z" /></svg>
                                                    </>
                                            }

                                        </button>
                                        : <button className='r-c-c w300  btnCompleteOrder ' onClick={handelSendOrder}>
                                            {
                                                isSendingOrder ? <GoodLoader />
                                                    : <>
                                                        Complete Order  <svg version="1.1" viewBox="0 0 2048 2048" width="128" height="128" xmlns="http://www.w3.org/2000/svg">
                                                            <path transform="translate(113,586)" d="m0 0h147l7 2v54l2 24v6l-6 3h-109v65l-1 843 162-1 7-2 8-13 12-18 7-9 11-13 10-10 16-12 15-10 18-10 16-7 21-6 22-4 9-1h35l21 3 21 5 26 10 18 10 12 8 13 10 10 9 5 4 7 8 9 11 11 17 12 19 2 1 624 1h19v-908l-90 2h-20l-3-1-1-3v-86l1-1h132l33 1 13 3 11 7v2h2v2h2l6 9 3 8 1 4 1 31v145l4-1 54-2h245l21 3 15 4 16 7 12 7 12 9 10 9 9 11 10 15 9 17 10 22 16 39 17 42 19 46 9 22 12 29 10 24 12 29 16 38 16 40 5 19 1 9 1 26v244l-1 39-2 23-3 15-8 18-11 18-9 11-5 6-14 11-10 7-14 7-21 7-15 3-18 2-19 1-4 29-6 25-5 15-8 17-8 13-8 12-16 20-15 15-18 13-14 9-19 10-30 10-17 4-30 3h-13l-24-2-21-4-20-7-25-12-16-10-16-13-19-19-9-11-10-14-8-14-11-23-7-21-4-16-2-27v-2h-724l-2 7-2 20-5 21-6 18-11 24-8 14-12 16-8 10h-2l-2 4-3 1-1 3-8 7-12 10-13 9-16 9-16 7-25 8-24 5-11 1h-39l-21-3-19-5-20-8-16-8-16-10-11-9-12-11-14-14-13-17-9-15-11-21-8-22-6-25-3-23-1-5-9 1-62 1h-108l-25-2-9-3-12-11-10-15-3-14-1-14-1-38v-792l1-106 1-53 2-10 6-11 11-12 6-4 7-2zm1518 298-170 1-22 2-9 4-3 3-1 2-1 10-1 28-1 256v385l1 8 11 2h9l8-6 7-13 7-11 10-13 8-10 12-12 11-9 12-9 13-8 23-12 24-8 20-4 18-2h31l23 3 23 6 20 8 16 8 19 12 13 11 8 7 9 9 11 14 13 18 8 13 6 5 8 2 26-1 16-3 10-5 7-6 6-10 3-14 2-24v-13l-4-4-4-1-23-1-16-2-15-5-12-8-10-9-8-10-7-12-4-13-2-13-1-12v-26l2-21 4-16 6-12 11-14 10-9 10-6 16-6 17-3 21-1 6-2 2-5 1-8v-17l-2-4-9-2h-111l-211-1-18-1-12-4-4-5-5-11-2-12v-179l3-20 5-16 7-16 7-13 8-12 9-10 1-3 3-1 5-5 11-9 15-9 14-7 18-6 18-3 24-2h58l26 1 4-1-1-8-7-14-9-10-7-3-11-1-40-1zm152 99-5 1-13 1-108 1-15 2-15 5-10 6-10 9-7 8-8 15-4 11-2 14-1 16-1 90v41h275l16-1-2-9-18-43-15-37-20-49-19-47-12-27-5-7zm90 386-11 2-6 4-2 7-1 26 1 18 3 9 3 2 11 1h9l10-1 2-1 2-13v-25l-1-21-2-6-7-2zm-1378 188-17 2-17 5-16 8-16 13-10 11-6 8-9 17-6 16-3 16-1 10v16l3 18 4 13 9 17 9 12 11 12 14 11 12 7 21 7 11 2 21 1 16-2 20-6 16-8 11-7 10-9 5-5 9-11 10-18 5-16 3-17v-24l-2-13-5-17-8-16-7-10-9-10-8-8-14-10-17-8-13-4-21-3zm1127 0-21 3-19 7-13 8-11 9-6 5-10 13-10 18-7 19-3 16-1 21 2 15 5 17 8 17 8 11 12 13 10 9 11 7 12 6 16 5 11 2 21 1 19-3 17-5 17-9 14-10 8-7 7-8 10-15 6-14 5-16 1-7v-33l-3-16-6-16-9-16-12-14-11-10-16-10-15-7-15-4-16-2z" />
                                                            <path transform="translate(723,178)" d="m0 0h44l29 2 30 4 24 5 30 9 20 7 28 12 16 8 19 10 15 9 19 12 13 10 14 11 11 9 11 10 8 7 20 20 7 8 11 13 11 15 13 19 10 16 10 18 8 15 13 29 10 28 9 30 6 29 5 35 2 27v43l-2 25-6 38-5 23-9 29-7 21-16 36-10 19-7 12-14 23-14 18-11 14-9 10-7 8-9 10-19 19-8 7-14 11-7 6-19 14-11 7-25 15-34 17-25 10-36 12-33 8-28 5-25 3-12 1h-56l-30-3-29-5-32-8-33-11-33-14-17-8-18-10-18-11-19-13-18-14-14-12-13-12-21-21-7-8-10-11-11-14-12-16-11-17-12-20-12-23-8-17-10-26-10-30-8-31-4-23-4-33-1-14v-52l4-30 6-33 7-28 12-35 9-21 14-29 12-22 11-17 7-10 13-18 13-16 9-10 7-8 23-23 11-9 13-11 19-14 14-10 25-15 29-15 31-13 20-7 32-9 31-6 23-3zm-7 90-31 3-29 6-30 9-22 8-29 14-28 17-14 10-16 13-8 7-16 15-12 12-9 11-8 9-10 13-9 13-9 15-10 18-10 21-13 34-7 26-5 26-4 33-1 23 1 23 4 31 6 31 7 24 9 25 9 20 10 20 12 19 12 17 10 13 9 11 14 15 12 12 11 9 9 8 19 14 14 9 20 12 26 13 28 11 28 8 31 6 27 3 19 1h28l24-2 26-4 29-7 33-11 24-11 21-11 20-12 10-7 14-10 13-11 11-9 15-15 7-8 8-9 7-8 10-13 8-11 8-13 9-16 9-19 5-11 10-27 6-21 7-34 3-27 1-15v-21l-2-29-4-30-7-30-8-24-12-29-12-24-12-20-11-16-11-14-9-11-11-12-21-21-28-22-20-13-21-12-24-12-25-10-22-7-24-6-24-4-19-2z" />
                                                            <path transform="translate(915,466)" d="m0 0 13 2 16 8 12 11 5 8 2 6v19l-6 14-11 13-13 16-16 17-1 2h-2l-2 4-12 13-9 10-12 14-10 11-9 11-7 7-7 8-3 4h-2l-2 4-12 13-7 8-14 15-7 8-33 36-9 10-12 13-12 11-13 9-9 5h-13l-21-11-14-10-14-11-11-9-14-11-13-11-14-11-16-13-14-11-15-13-8-7-11-11-7-11-3-6-1-13 3-12 5-9 9-10 11-7 9-4h14l11 4 16 9 21 16 12 10 9 7 12 10 9 7 22 18 4 5 7 5 5-1 7-8 7-9 8-7 7-8 9-10 7-8 11-12 7-8 9-10 12-13 9-10 9-11 16-17 5-7h2l2-4 7-7 7-8 14-15 7-8 14-15 13-13 13-8 5-2z" />
                                                            <path transform="translate(1550,1304)" d="m0 0h31l55 1 13 4 9 7 4 8 1 5v12l-2 10-5 9-5 4-12 4-10 1-32 1h-41l-13-2-8-4-9-8-5-11-1-5v-9l4-10 6-8 8-6 5-2z" />
                                                            <path transform="translate(493,1631)" d="m0 0h19l12 4 13 10 5 8 1 4v16l-3 10-6 9-8 8-10 6-6 2h-14l-14-7-10-10-7-12-1-3v-15l4-11 9-10 7-6z" />
                                                            <path transform="translate(1623,1630)" d="m0 0h11l13 3 6 3 8 6 7 10 3 7v15l-4 10-8 11-12 9-8 4-10 1-10-3-8-4-9-8-6-9-3-7-2-13 4-13 6-9 8-7 10-5z" />
                                                            <path transform="translate(1783,984)" d="m0 0" />
                                                        </svg>
                                                    </>
                                            }

                                        </button>
                                }
                            </>
                    }
                    {!orderCompleted &&

                        <button className='cr  ' onClick={() => dispatch(backToStep3())} style={{ alignSelf: "start" }}> <svg xmlns="http://www.w3.org/2000/svg" style={{ transform: "rotate(180deg)" }} viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m700-300-57-56 84-84H120v-80h607l-83-84 57-56 179 180-180 180Z" /></svg>back</button>

                    }
                </div>
            </div>
        )
    }
    const SendingOrder = () => {
        const { SendingOrderVSBL, isSendingOrder, orderCompleted, orderFailed } = useSelector(st => st.OrderMan)
        return ReactDom.createPortal(
            <div className='backendMer'>
                <div className="w500 h300 p20 br20 bg-l c-c-c">
                    {
                        isSendingOrder ?
                            <GoodLoader />
                            : <>
                                {orderCompleted &&
                                    <>
                                        <LottieDone />
                                        <h1 className="mt20" style={{ textAlign: "center" }}>Your order has been completed successfully , We’ll get it delivered to you as quickly as we can. Thank you for your trust.</h1>
                                        <button className='mt20 p10 w200 bg-g br20 c-l' onClick={() => { dispatch(closeOrderCMpl()) }}>Ok</button>
                                    </>
                                }
                                {orderFailed &&
                                    <>
                                        <LottieError />
                                        <h1 className="mt20" style={{ textAlign: "center" }}>Failed to complete the order ! ,please try again , or check the order's detail  </h1>
                                        <button className='mt20 p10 bg-d w200 br20 c-l' onClick={() => { dispatch(closeOrderCMpl()) }}>Ok</button>

                                    </>
                                }

                            </>
                    }
                </div>
            </div>
            , document.getElementById('portlas'))
    }

    const handelCancelOrder = () => {
        dispatch(showPopupConfrm([
            "Cancel order creation",
            "Are you sure you want to cancel creating your order? This action will also cancel the selected address ,  payment method And Products you have added ",
            'confirmCancelCreateOrder'
        ]))
    }
    if (isWorkingOnPC) {
        return ReactDom.createPortal(
            <div className="backendMer">
                <main className=' p20 c-s-s bg-l br20 activeCmp ' style={{ minWidth: "700px", maxWidth: "1200px" }}>
                    <span className="wmia mb20  pb20 r-b-c" style={{ borderBottom: "solid 1px var(--border-color)" }}>
                        <h1 className="">Start a New Order</h1>
                        {
                            orderCompleted ?
                                <button className='r-c-c hoverEff2' onClick={() => dispatch(hideCmpCreateOrder())}>ending <svg xmlns="http://www.w3.org/2000/svg" className='ml10 h20' viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" /></svg></button>
                                :
                                <button className='r-c-c hoverEff2' onClick={handelCancelOrder}>Cancel<svg xmlns="http://www.w3.org/2000/svg" className='ml10 h20' viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" /></svg></button>
                        }
                    </span>
                    {!createOrderStep1 && !createOrderStep2 && !createOrderStep3 && !finaleSteps &&
                        <InitianleCreating />
                    }
                    {createOrderStep1 && <CreateOrderSt1 />}
                    {createOrderStep2 && <CreateOrderSt2 />}
                    {createOrderStep3 && <CreateOrderSt3 />}
                    {finaleSteps && <FinaleStepCmp />}
                    {SendingOrderVSBL && <SendingOrder />}

                </main>
            </div>
            , document.getElementById("portlas")
        )
    } else {

        useEffect(() => {
            MainOrderPagRef.current?.scrollIntoView({
                behavior: "smooth", block: "start"
            })
        }
            , []);

        return (
            <>
                <main ref={MainOrderPagRef} className='c-s-s p5 '>
                    <span className="wmia mb20  pb20 r-b-c" style={{ borderBottom: "solid 1px var(--border-color)" }}>
                        <h1 className="">Start a New Order</h1>
                    </span>
                    {!createOrderStep1 && !createOrderStep2 && !createOrderStep3 && !finaleSteps &&
                        <InitianleCreating />
                    }
                    {createOrderStep1 && <CreateOrderSt1 />}
                    {createOrderStep2 && <CreateOrderSt2 />}
                    {createOrderStep3 && <CreateOrderSt3 />}
                    {finaleSteps && <FinaleStepCmp />}
                    {SendingOrderVSBL && <SendingOrder />}

                </main>
            </>
        )
    }

}

export const BTN_MAN_ORDER = ({ prod }) => {
    const dispatch = useDispatch();
    const isWorkingOnPC = window.innerWidth > 800
    const { OrdersList } = useSelector(s => s.OrderMan)
    const { isLoggedIn } = useSelector(s => s.authe);
    const navigate = useNavigate()
    const handelSendToStartOrder = () => {
        if (isLoggedIn) {
            dispatch(startOrder([{ id: prod.id, price: prod.price, quantity: 1 }]))
            if (!isWorkingOnPC) {
                navigate('/create_order')
            }

        } else {
            if (isWorkingOnPC) {
                dispatch(showLogin())
            } else {
                navigate('/login')
            }
        }
    }
    let countProds = OrdersList.reduce((c, e) => {
        return c + e.products.filter(el => el.id == prod.id).length
    }, 0)
    return (
        <div className={countProds > 0 ? "c-s-s mb20 BtnOrderCnotein " : " BtnOrderCnotein c-s-s"}  >
            {
                countProds > 0 && < p className='mb10'>You ordered this item <strong className='ml5 mr5'>{countProds} </strong> times. </p >
            }
            <button className='btnOrder mr20 p10 br5  r-c-c ' onClick={handelSendToStartOrder}>Buy Now <svg version="1.1" viewBox="0 0 2048 2048" className="f-l ml10" xmlns="http://www.w3.org/2000/svg">
                <path transform="translate(1e3 170)" d="m0 0h45l23 2 24 4 25 6 27 9 25 11 21 11 18 11 17 12 13 10 14 12 16 15 12 13 9 11 10 13 16 24 13 23 9 20 9 24 7 24 5 23 4 26 4 37h251l36 3 21 3 19 5 17 6 24 11 21 12 17 12 16 13 10 9 15 15 9 11 11 15 11 18 10 19 11 28 5 18 5 27 2 25-1 21-3 25-10 73-8 50-8 58-8 50-8 58-8 50-8 58-8 50-8 58-8 51-9 64-7 44-6 45-8 50-6 43-6 38-8 37-5 17-6 16-11 24-10 16-8 12-8 11-6 8h-2l-2 4-17 17-11 9-10 8-21 13-21 11-26 10-23 7-28 5-27 3-44 2h-880l-43-2-24-3-23-5-30-10-23-11-20-12-14-10-11-9-20-18-11-12-13-17-10-15-10-18-8-17-9-24-6-24-6-31-21-141-24-164-17-114-18-122-33-223-10-67-3-25-1-27 3-24 6-29 9-27 10-22 11-19 8-12 10-13 9-11 8-9h2l2-4h2l2-4h2v-2l11-9 10-8 14-10 13-8 21-11 28-11 22-6 27-4 32-2 239-1 10-1 2-24 6-36 6-26 6-19 7-20 9-20 10-20 10-16 8-12 8-11 10-13 11-13 11-12 8-7 7-7 9-7 10-8 24-16 16-10 27-14 25-10 22-7 27-6 27-4zm3 172-24 4-21 7-16 8-12 7-13 10-12 11-12 12-9 12-9 14-8 17-7 19-6 23-3 15v7l5 1 38 2h273l17-1 8-2 1-1-1-13-6-25-9-27-12-23-12-17-12-13-11-10-17-12-18-10-20-8-16-4-21-3zm-544 340-38 1-19 3-11 4-13 8-11 9-10 11-7 11-5 12-3 10-1 7v15l4 37 8 56 10 65 9 62 8 53 7 50 8 52 9 62 8 54 9 60 9 62 8 53 11 76 8 51 7 48 6 27 7 19 7 12 5 6h2v2l13 10 16 8 13 4 19 3 19 1h900l23-1 15-2 11-3 12-5 11-7 13-11 8-11 7-14 6-23 4-22 10-68 8-52 11-74 14-95 10-67 13-88 11-74 14-95 7-47 10-68 10-67 4-31 1-12v-12l-4-16-9-19-9-11-9-9-13-8-15-7-14-3-7-1-64-1h-196l-1 5 1 26v57l-3 17-5 15-8 14-9 10-5 6-11 8-12 5-21 6-5 1h-14l-15-3-16-6-13-8-10-9-10-13-8-15-4-15-1-8-1-19v-74h-341l-1 1 1 32v54l-3 18-8 21-8 11-11 13-11 8-12 5-17 5-13 2-16-1-16-4-16-8-11-8-10-11-9-14-5-11-4-18-1-10v-85z" />
                <path transform="translate(1268,980)" d="m0 0h19l16 3 15 6 11 7 10 8 9 10 9 15 6 16 3 14v12l-3 16-6 15-10 16-11 12-14 14-8 7-10 9-15 13-8 7-15 13-14 12-12 11-10 8-13 12-11 9-13 12-12 11-8 7-13 11-11 10-11 9-15 13-3 3h-2v2l-11 9-10 9-11 9-12 11-8 7-15 14-14 12-11 9-8 7-10 8-13 11-10 7-16 8-16 5-7 2h-15l-12-2-13-5-13-7-14-11-13-12-12-11-137-137v-2h-2l-9-11-8-10-8-12-6-15-4-17v-12l5-18 7-16 6-9 9-11 12-10 14-8 16-6 7-1h20l15 3 18 8 13 9 11 10 8 7 27 27v2l4 2 12 12v2l4 2v2l4 2 20 20 7 8 9 8 7 8 6 4 5-1 8-7 10-9 11-9 15-14 14-12 8-7 14-12 10-9 8-7 11-10 8-7 14-12 12-11 7-6h2v-2l11-9 12-11 11-9 10-9 8-7 10-9 11-9 7-7 8-7 10-9 11-9 9-8 14-10 13-8 14-6z" />
            </svg>
            </button>
        </div>
    )
}
export const OrdersAndreturnPage = () => {
    const viewProdVsbl = useSelector(st => st.viewProduct.isVisible)
    const MainPageProdRef = useRef();
    const dispatch = useDispatch()
    const { user } = useSelector(s => s.authe)
    const navigate = useNavigate()
    const [ontedId, setotedId] = useState(null)
    const [isOneToUpdateDelvrDate, setisOneToUpdateDelvrDate] = useState(false)
    const [isOneToUpdateShippingAddress, setisOneToUpdateShippingAddress] = useState(false)
    const { IsGettingAllOrders, OrdersList, isUpdateingDelvrDate, isUpdateingShippingAddress, isCancelingOrder } = useSelector(s => s.OrderMan)
    const LaodSungleProdsInfo = useMemo(() =>
        ({ ob }) => {
            const [LoadingProdInfo, setLoadingProdInfo] = useState(true)
            const [SignleProdInfo, setSignleProdInfo] = useState(ob)
            async function getSingleProdIngo() {
                const res = await api.get('/products/' + ob.id)
                setSignleProdInfo(cu => ({ ...cu, ...res.data }))
                setLoadingProdInfo(false)
            }
            const handelOpenViewProd = (id) => {
                dispatch(showViewProd())
                dispatch(getViewProd(id))
            }

            useEffect(() => {
                getSingleProdIngo()
            }, [])
            return (
                <div onClick={() => handelOpenViewProd(SignleProdInfo.id)} className='wmia mb20 r-s-s p15 br20 ' style={{ borderBottom: "solid 1px var(--border-color)" }}>
                    {
                        LoadingProdInfo ? <GoodLoader /> :

                            <>
                                <img className='w200 mr20' src={SignleProdInfo.images[0]} alt="" />
                                <div className="c-s-s">
                                    <h1 className="mb10">
                                        {SignleProdInfo.title}
                                    </h1>
                                    <p className="mt15">
                                        {
                                            SignleProdInfo.description
                                        }
                                    </p>

                                    <p className='mt20'>
                                        Price  : <strong className='ml10' style={{ fontSize: "17px" }}>${SignleProdInfo.price}</strong>
                                    </p>

                                    <p className='mt10'>
                                        Quantity  : <strong className='ml10' style={{ fontSize: "17px" }}>{SignleProdInfo.quantity}</strong>
                                    </p>

                                    <p className='mt10'>
                                        Cost  : <strong className='ml10' style={{ fontSize: "17px" }}>${SignleProdInfo.quantity * SignleProdInfo.price}</strong>
                                    </p>

                                </div>
                            </>
                    }
                </div>
            )
        }, [])
    useEffect(
        () => {
            OrdersList.length == 0 && dispatch(GetAllOrders())
        }
        , []
    )


    const generatePDF = async (e, order) => {
        e.target.disabled = true
        var doc = new jsPDF()

        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("QuickCart", 105, 20, { align: "center" });
        doc.setFontSize(14);
        doc.setFont("helvetica", "normal");
        doc.text("Thank you for shopping with us!", 105, 30, { align: "center" });
        doc.setFontSize(12);
        doc.text(`User ID: ${order.userId}`, 10, 50);
        doc.text(`User full name : ${user.name}`, 10, 60);
        doc.text(`Order ID : ${order.id}`, 10, 70);
        doc.text(`Payment Method: ${Khazl(order.paymentMethodUsed.CardNumber)}`, 10, 80);
        doc.text(`Delivery Address: ${order.addressUsed.houseApparNum}  , ${order.addressUsed.street}  ,${order.addressUsed.city}  , ${order.addressUsed.zip}`, 10, 90);
        doc.text(`Order Status: ${order.status}`, 10, 100);
        doc.text(`Order Date: ${order.orderDate}`, 10, 110);
        doc.text(`Delivery Date: ${order.deliveryDate}`, 10, 120);
        doc.text("Products:", 10, 130);
        let yPosition = 140;
        for (var i = 0; i < order.products.length; i++) {
            const item = order.products[i];
            await api.get('/products/' + item.id).then(res => {
                let product = res.data
                doc.text(
                    `        ${i + 1}. ${product.title} - Quantity: ${item.quantity} - Price: $${product.price}`,
                    10,
                    yPosition
                );
                yPosition += 10;
            })
        };

        doc.text(`Subtotal: $${order.subtotal}`, 10, yPosition + 10);
        doc.text(`Total: $${order.total}`, 10, yPosition + 20);
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(12);
        doc.setFont("helvetica", "italic");
        doc.text(
            "Thank you for choosing QuickCart! We look forward to serving you again.",
            doc.internal.pageSize.width / 2,
            pageHeight - 20,
            { align: "center" }
        );
        doc.save(`invoice_${order.id}.pdf`);


    };

    function handelOpendChangeDate(o) {
        setotedId(o)
        setisOneToUpdateDelvrDate(true);
    }
    const HandelChangeDelvDate = useMemo(() =>
        ({ OrderData }) => {
            let now = new Date()
            now.setDate(now.getDate() + 2);
            now = now.toISOString().split('T')[0];
            const [selectedDate, setSelectedDate] = useState(null)
            const handelSendChangeDate = () => {
                dispatch(ChangeOrderDelvryDate([OrderData, selectedDate]))
                setisOneToUpdateDelvrDate(false);
            }
            return ReactDom.createPortal(
                <div className='backendMer'>
                    <div className="w600 psr h400 activeCmp  c-s-s br20 p20 bg-l">
                        <button className='btnClose' onClick={() => setisOneToUpdateDelvrDate(false)}><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" /></svg></button>
                        <h1 className='r-s-c wmia  mt20 pb20 mb20' style={{ borderBottom: "solid 1px var(--border-color)" }}>
                            <svg version="1.1" viewBox="0 0 2048 2048" className='mr20' xmlns="http://www.w3.org/2000/svg">
                                <path transform="translate(993,158)" d="m0 0h60l45 3 41 4 42 6 44 9 34 9 38 12 34 12 25 10 32 14 33 16 22 12 21 12 19 12 33 22 17 12 13 10 16 12 12 11 14 11 14 13 2 3v6l-8 10-3 1-2 4-9 10-9 11-12 14-8 10-11 13-9 11-10 11-9 11-9 10-9 11-9 10-7 8-11 13-7 8-11 13-9 11-9 12-5 6-4-1-12-9-11-10-14-11-19-14-24-16-22-14-21-12-19-10-28-13-33-13-36-12-40-10-31-6-23-3-36-3h-67l-36 3-33 5-36 8-36 10-34 12-28 12-27 13-23 13-25 15-12 8-14 10-26 20-14 12-8 7-14 12-16 16-7 8-12 13-3 4h-2l-2 4-11 13-13 17-13 18-15 23-15 26-11 20-11 23-10 24-8 21-10 31-10 41-6 31-3 22-3 40-1 33v32l121 1 16 1 12 3 8 4 9 8 8 13 5 11 3 12-1 9-9 16-14 19-12 14-9 11-9 10-9 11-9 10-8 10-9 10-9 11-11 12-7 8-13 15-10 11-9 11-11 12-7 8-11 13-13 15-9 10-14 17-12 13-7 8-9 10-7 8-12 13-9 11-10 11-7 8-20 26-4 5-16-17-12-14-11-12-9-11-10-11-9-11-13-15-12-14-11-12-7-8-12-14-12-13-7-8-48-56-11-12-7-8-12-14-10-11-9-11-12-13-9-11-11-12-9-11-12-14-11-14-10-11v-37l9-10 9-11 12-8 13-4h88l24 1 2-43 3-57 3-35 6-44 7-39 9-38 12-42 15-43 14-36 16-34 11-23 11-21 8-13 11-19 6-10 9-14 11-17 8-10 7-10 11-15 14-19 14-17 16-17 7-8 24-26 13-13 8-7 3-1v-2h2v-2l11-9 11-11 11-9 8-7 14-11 19-14 15-11 18-13 16-10 21-13 24-14 18-10 28-14 27-12 20-9 39-15 28-9 29-8 47-11 36-7 31-5 38-4z" />
                                <path transform="translate(1734,640)" d="m0 0 6 1 10 11 9 11 12 14 9 10 7 8 12 14 12 13 9 10 9 11 11 12 7 8 12 14 9 10 9 11 9 10 9 11 10 11 9 11 14 15 9 11 11 12 7 8 12 14 9 10 9 11 12 14 9 10 9 11 11 12 9 12 9 11 4 5v39h-3l-5 5-11 13-7 5-11 4-7 1-26 1h-39l-49-1-3 23-5 49-4 27-11 56-7 28-11 38-11 33-16 41-9 21-17 35-12 24-9 15-13 22-12 19-9 14-13 18-12 16-13 17-9 12-12 14-9 11-11 11-7 8-3 4h-2l-2 4-24 24-8 7-12 11-8 7-10 9-11 9-13 11-18 13-22 16-18 13-19 12-22 13-21 12-12 7-16 8-25 12-27 12-32 13-36 12-26 8-43 11-38 8-41 7-42 5-41 3-20 1h-51l-35-2-49-5-29-4-49-10-26-6-41-12-36-12-28-11-33-14-45-22-22-12-28-17-20-12-28-19-17-12-11-7-8-6-1-4-2-1 6-9 10-13 11-12 8-10 9-11 12-14 9-10 7-8 11-13 7-8 11-13 9-11 12-14 8-10 9-10 11-14 4-5h2l2-4 11-13 8-10 1-1 7 1 11 7 15 11 20 12 17 10 21 12 19 9 16 8 34 14 36 12 25 7 39 8 26 4 31 3 39 2h13l37-2 23-2 36-6 33-7 30-8 41-14 33-14 21-10 19-10 19-11 21-13 20-14 19-14 12-10 10-8 10-9 8-7 3-1v-2h2v-2h2v-2h2v-2h2v-2l8-7 2-3h2l2-4 11-11 7-8 13-16 13-17 10-14 18-27 14-24 9-17 11-23 10-23 10-27 8-26 7-27 8-36 6-35 4-27h-134l-16-3-11-7-7-8-7-11-6-15-1-14 8-16 11-16 11-12 7-8 11-13 9-11 13-15 7-8 4-5h2l2-4 13-14 9-11 7-7 7-8 13-16 9-10 9-11 26-30 11-12 9-10 7-8 12-14 9-10 9-11 9-10 1-2h2l2-4 9-10 7-8 9-11 11-13 9-10 7-8z" />
                                <path transform="translate(1,1133)" d="m0 0" />
                                <path transform="translate(2047,993)" d="m0 0" />
                            </svg> Change delivery date
                        </h1>
                        <div className="wmia c-c-c mt50">
                            <h1>When do you want to receive the order ?</h1>
                            <input min={now} type="date" name="" id="" className="w300 p20 br20 mt20" onChange={d => setSelectedDate(d.target.value)} />
                        </div>
                        <div className="r-e-c wmia mt50 pl20">
                            <button className='btnNormale' onClick={() => setisOneToUpdateDelvrDate(false)}>Cancel</button>
                            <button disabled={selectedDate == null} onClick={handelSendChangeDate} className='btnB w100 ml20'>Set <svg version="1.1" viewBox="0 0 2048 2048" className='ml10' xmlns="http://www.w3.org/2000/svg">
                                <path transform="translate(1243,275)" d="m0 0h9l15 3 16 6 16 9 11 8 14 12 8 7 10 9 15 14 13 12 30 28 24 22 14 13 8 7 13 12 11 10 8 7 13 12 15 14 11 10 8 7 15 14 16 15 24 22 16 15 17 16 10 9 12 11 10 9 12 11 8 7 12 11 8 7 17 16 12 11 8 7 30 28 24 22 4 3v2l4 2 10 10 8 7 8 8v2h2l10 14 5 12v10l-3 12-6 11-12 15h-2l-2 4-8 8-8 7-9 9-8 7-14 13-8 7-15 14-8 7-14 13-8 7-4 2v2l-8 7-15 14-3 1v2l-11 9-7 7-8 7-9 9-8 7-15 14-8 7-7 6-14 14-8 7-15 14-8 7-15 14-12 11-8 7-12 11-10 9-8 8-8 7-13 12-12 11h-2v2l-16 14-14 14-8 7-24 22-7 7-8 7-12 11-11 10-8 7-11 10-8 7-14 12-19 14-14 7-17 5-6 1h-17l-12-2-15-5-15-8-13-11-10-12-8-14-4-10-4-19-1-11v-151l-318-1-17-2-10-5-10-9-6-8-4-11-2-16-1-24v-104l1-46-1-5-13 10-11 10-8 7-15 14-10 9-14 12-9 9-8 7-15 14-8 7-12 11-33 31h-2v2l-8 7-10 9-8 7-15 14-8 7-13 12h-2v2l-8 7-7 7-8 7-9 9-8 7-16 15-8 7-7 7-8 7-16 15h-2v2l-8 7-32 30-8 7-13 12-8 7-11 10-11 9-17 16-10 10-14 10 1 3 5 2 11 10 10 8 7 7 8 7 13 12 11 10 8 7 7 7 8 7 15 14 8 7 16 15 13 12 10 9 8 7 6 5v2l4 2 10 10 8 7 15 14 8 7 15 14 24 22 15 14 12 11 7 7 8 7 15 14 8 7 15 14 12 11 10 9 11 10 8 7 15 14 11 9 12 11 13 12 7 7 11 9 8 8 6 4-1-5-1-17v-162l3-16 5-10 10-11 12-8 9-3 141-1h466l36 1 12 2 12 5 10 9 6 9 4 11 2 8v9l-3 10-8 14-7 9-8 5-10 3-8 1-80 1h-507l2 9-1 147-2 17-4 13-8 15-10 13-12 12-13 8-15 6-21 5h-13l-15-3-13-5-16-10-13-11-14-12-10-9-8-7-32-30-13-12-15-14-16-15-17-16-36-33-10-9-14-13-11-9-12-12-8-7-12-11-8-7-32-30-13-12-8-7-30-28-8-7-16-15-12-11-14-13-8-7-39-36-10-9-11-10-8-7-8-8-8-7-17-16-6-5v-2l-3-1-7-8-8-9-7-11-4-10v-10l4-13 6-10 6-8 9-10 7-7 11-9 7-7 8-7 16-15h2v-2l8-7 15-14 13-12 15-14 8-7 10-9 3-1v-2l8-7 13-12 7-7 8-7 16-15 12-11 26-24 15-14 13-12 14-13 8-7 12-11 10-9 14-13 11-9 9-9 8-7 52-48 7-7 8-7 3-3h2v-2l8-7 12-11 17-16 16-15 14-12 7-7 11-9 15-12 16-10 14-6 17-3h9l19 3 16 5 15 8 12 11 8 9 9 15 5 13 3 13 1 9v155l-1 3h314l20 2 10 4 10 8 6 7 6 12 2 9 1 49v94l-1 47 13-9 10-9 11-9 9-9 8-7 9-9 8-7 13-12 15-14 34-32 13-12 15-14 10-9 15-14 12-11 8-7 13-12 15-14 11-9 11-11 8-7 78-72 31-29 17-16 10-9 8-7 12-11 11-9 14-12 4-5 3-3-2-5-14-12-12-11-8-7-9-9-8-7-16-15-51-48-8-7-13-12-12-11-8-7-14-13-8-7-15-14-10-9-8-7-12-11-8-7-9-9-8-7-16-15-13-12-12-11-7-7-8-7-16-15-12-11-13-12-10-9-8-7-12-11-8-7-14-13-8-7-10-9-8-7-10-9-11-8 1 21v151l-1 18-4 13-7 12-8 8-10 5-14 3-12 1-503 1h-201l-18-2-12-6-9-9-9-14-3-9v-17l4-13 7-11 6-7 9-6 7-2 14-1h563l101-1 1-11v-131l1-24 3-13 8-16 8-12 11-12 13-10 12-7 15-6z" />
                            </svg>
                            </button>

                        </div>
                    </div>
                </div>
                , document.getElementById("portlas")
            )
        }
        , [])
    function handelOpendChangeShippingAddress(o) {
        setotedId(o)
        setisOneToUpdateShippingAddress(true);
    }
    const HandelChangeShippingAddress = useMemo(() =>
        ({ OrderData }) => {
            const [selectedAddress, setSelectedAddress] = useState(null)
            const handelSendChangeDate = () => {
                dispatch(ChangeOrderShippingAddress([OrderData, selectedAddress]))
                setisOneToUpdateShippingAddress(false);
            }
            const { allAddresses } = useSelector(s => s.addAddress)


            return ReactDom.createPortal(
                <div className='backendMer'>
                    <div className="w600 psr  activeCmp  c-s-s br20 p20 bg-l">
                        <button className='btnClose' onClick={() => setisOneToUpdateShippingAddress(false)}><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" /></svg></button>
                        <h1 className='r-s-c wmia  mt20 pb20 mb20' style={{ borderBottom: "solid 1px var(--border-color)" }}>
                            <svg version="1.1" viewBox="0 0 2048 2048" className='mr20' xmlns="http://www.w3.org/2000/svg">
                                <path transform="translate(993,158)" d="m0 0h60l45 3 41 4 42 6 44 9 34 9 38 12 34 12 25 10 32 14 33 16 22 12 21 12 19 12 33 22 17 12 13 10 16 12 12 11 14 11 14 13 2 3v6l-8 10-3 1-2 4-9 10-9 11-12 14-8 10-11 13-9 11-10 11-9 11-9 10-9 11-9 10-7 8-11 13-7 8-11 13-9 11-9 12-5 6-4-1-12-9-11-10-14-11-19-14-24-16-22-14-21-12-19-10-28-13-33-13-36-12-40-10-31-6-23-3-36-3h-67l-36 3-33 5-36 8-36 10-34 12-28 12-27 13-23 13-25 15-12 8-14 10-26 20-14 12-8 7-14 12-16 16-7 8-12 13-3 4h-2l-2 4-11 13-13 17-13 18-15 23-15 26-11 20-11 23-10 24-8 21-10 31-10 41-6 31-3 22-3 40-1 33v32l121 1 16 1 12 3 8 4 9 8 8 13 5 11 3 12-1 9-9 16-14 19-12 14-9 11-9 10-9 11-9 10-8 10-9 10-9 11-11 12-7 8-13 15-10 11-9 11-11 12-7 8-11 13-13 15-9 10-14 17-12 13-7 8-9 10-7 8-12 13-9 11-10 11-7 8-20 26-4 5-16-17-12-14-11-12-9-11-10-11-9-11-13-15-12-14-11-12-7-8-12-14-12-13-7-8-48-56-11-12-7-8-12-14-10-11-9-11-12-13-9-11-11-12-9-11-12-14-11-14-10-11v-37l9-10 9-11 12-8 13-4h88l24 1 2-43 3-57 3-35 6-44 7-39 9-38 12-42 15-43 14-36 16-34 11-23 11-21 8-13 11-19 6-10 9-14 11-17 8-10 7-10 11-15 14-19 14-17 16-17 7-8 24-26 13-13 8-7 3-1v-2h2v-2l11-9 11-11 11-9 8-7 14-11 19-14 15-11 18-13 16-10 21-13 24-14 18-10 28-14 27-12 20-9 39-15 28-9 29-8 47-11 36-7 31-5 38-4z" />
                                <path transform="translate(1734,640)" d="m0 0 6 1 10 11 9 11 12 14 9 10 7 8 12 14 12 13 9 10 9 11 11 12 7 8 12 14 9 10 9 11 9 10 9 11 10 11 9 11 14 15 9 11 11 12 7 8 12 14 9 10 9 11 12 14 9 10 9 11 11 12 9 12 9 11 4 5v39h-3l-5 5-11 13-7 5-11 4-7 1-26 1h-39l-49-1-3 23-5 49-4 27-11 56-7 28-11 38-11 33-16 41-9 21-17 35-12 24-9 15-13 22-12 19-9 14-13 18-12 16-13 17-9 12-12 14-9 11-11 11-7 8-3 4h-2l-2 4-24 24-8 7-12 11-8 7-10 9-11 9-13 11-18 13-22 16-18 13-19 12-22 13-21 12-12 7-16 8-25 12-27 12-32 13-36 12-26 8-43 11-38 8-41 7-42 5-41 3-20 1h-51l-35-2-49-5-29-4-49-10-26-6-41-12-36-12-28-11-33-14-45-22-22-12-28-17-20-12-28-19-17-12-11-7-8-6-1-4-2-1 6-9 10-13 11-12 8-10 9-11 12-14 9-10 7-8 11-13 7-8 11-13 9-11 12-14 8-10 9-10 11-14 4-5h2l2-4 11-13 8-10 1-1 7 1 11 7 15 11 20 12 17 10 21 12 19 9 16 8 34 14 36 12 25 7 39 8 26 4 31 3 39 2h13l37-2 23-2 36-6 33-7 30-8 41-14 33-14 21-10 19-10 19-11 21-13 20-14 19-14 12-10 10-8 10-9 8-7 3-1v-2h2v-2h2v-2h2v-2h2v-2l8-7 2-3h2l2-4 11-11 7-8 13-16 13-17 10-14 18-27 14-24 9-17 11-23 10-23 10-27 8-26 7-27 8-36 6-35 4-27h-134l-16-3-11-7-7-8-7-11-6-15-1-14 8-16 11-16 11-12 7-8 11-13 9-11 13-15 7-8 4-5h2l2-4 13-14 9-11 7-7 7-8 13-16 9-10 9-11 26-30 11-12 9-10 7-8 12-14 9-10 9-11 9-10 1-2h2l2-4 9-10 7-8 9-11 11-13 9-10 7-8z" />
                                <path transform="translate(1,1133)" d="m0 0" />
                                <path transform="translate(2047,993)" d="m0 0" />
                            </svg> Change Shpping address
                        </h1>
                        <span className='r-s-c wmia    mb20'>
                            <p>Choose an address or </p>
                            <BTN_OPEN_ADDRESS className={"btnB ml20"} stsvg={{ marginLeft: "15px" }} />
                        </span>
                        <div style={{ maxHeight: "400px", overflow: "auto" }} className="lisOfAddressToChange wmia p10 c-s-s mt10">
                            {
                                allAddresses.map(a =>
                                    <div onClick={() => setSelectedAddress(a)} key={a.id} className={selectedAddress?.id == a.id ? "wmia mb20 r-b-s btnB " : "wmia mb20 r-s-s p10 br20  bg-third hoverEff2"}>
                                        <strong> {a.houseApparNum} , {a.street}  , {a.city}  ,{a.zip} </strong>
                                        {
                                            selectedAddress?.id == a.id &&
                                            <svg xmlns="http://www.w3.org/2000/svg" className='mr20' viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" /></svg>
                                        }
                                    </div>
                                )
                            }
                        </div>

                        <div className="r-e-c wmia mt50 pl20">
                            <button className='btnNormale' onClick={() => setisOneToUpdateShippingAddress(false)}>Cancel</button>
                            <button disabled={selectedAddress == null} onClick={handelSendChangeDate} className='btnB w100 ml20'>Set <svg version="1.1" viewBox="0 0 2048 2048" className='ml10' xmlns="http://www.w3.org/2000/svg">
                                <path transform="translate(1243,275)" d="m0 0h9l15 3 16 6 16 9 11 8 14 12 8 7 10 9 15 14 13 12 30 28 24 22 14 13 8 7 13 12 11 10 8 7 13 12 15 14 11 10 8 7 15 14 16 15 24 22 16 15 17 16 10 9 12 11 10 9 12 11 8 7 12 11 8 7 17 16 12 11 8 7 30 28 24 22 4 3v2l4 2 10 10 8 7 8 8v2h2l10 14 5 12v10l-3 12-6 11-12 15h-2l-2 4-8 8-8 7-9 9-8 7-14 13-8 7-15 14-8 7-14 13-8 7-4 2v2l-8 7-15 14-3 1v2l-11 9-7 7-8 7-9 9-8 7-15 14-8 7-7 6-14 14-8 7-15 14-8 7-15 14-12 11-8 7-12 11-10 9-8 8-8 7-13 12-12 11h-2v2l-16 14-14 14-8 7-24 22-7 7-8 7-12 11-11 10-8 7-11 10-8 7-14 12-19 14-14 7-17 5-6 1h-17l-12-2-15-5-15-8-13-11-10-12-8-14-4-10-4-19-1-11v-151l-318-1-17-2-10-5-10-9-6-8-4-11-2-16-1-24v-104l1-46-1-5-13 10-11 10-8 7-15 14-10 9-14 12-9 9-8 7-15 14-8 7-12 11-33 31h-2v2l-8 7-10 9-8 7-15 14-8 7-13 12h-2v2l-8 7-7 7-8 7-9 9-8 7-16 15-8 7-7 7-8 7-16 15h-2v2l-8 7-32 30-8 7-13 12-8 7-11 10-11 9-17 16-10 10-14 10 1 3 5 2 11 10 10 8 7 7 8 7 13 12 11 10 8 7 7 7 8 7 15 14 8 7 16 15 13 12 10 9 8 7 6 5v2l4 2 10 10 8 7 15 14 8 7 15 14 24 22 15 14 12 11 7 7 8 7 15 14 8 7 15 14 12 11 10 9 11 10 8 7 15 14 11 9 12 11 13 12 7 7 11 9 8 8 6 4-1-5-1-17v-162l3-16 5-10 10-11 12-8 9-3 141-1h466l36 1 12 2 12 5 10 9 6 9 4 11 2 8v9l-3 10-8 14-7 9-8 5-10 3-8 1-80 1h-507l2 9-1 147-2 17-4 13-8 15-10 13-12 12-13 8-15 6-21 5h-13l-15-3-13-5-16-10-13-11-14-12-10-9-8-7-32-30-13-12-15-14-16-15-17-16-36-33-10-9-14-13-11-9-12-12-8-7-12-11-8-7-32-30-13-12-8-7-30-28-8-7-16-15-12-11-14-13-8-7-39-36-10-9-11-10-8-7-8-8-8-7-17-16-6-5v-2l-3-1-7-8-8-9-7-11-4-10v-10l4-13 6-10 6-8 9-10 7-7 11-9 7-7 8-7 16-15h2v-2l8-7 15-14 13-12 15-14 8-7 10-9 3-1v-2l8-7 13-12 7-7 8-7 16-15 12-11 26-24 15-14 13-12 14-13 8-7 12-11 10-9 14-13 11-9 9-9 8-7 52-48 7-7 8-7 3-3h2v-2l8-7 12-11 17-16 16-15 14-12 7-7 11-9 15-12 16-10 14-6 17-3h9l19 3 16 5 15 8 12 11 8 9 9 15 5 13 3 13 1 9v155l-1 3h314l20 2 10 4 10 8 6 7 6 12 2 9 1 49v94l-1 47 13-9 10-9 11-9 9-9 8-7 9-9 8-7 13-12 15-14 34-32 13-12 15-14 10-9 15-14 12-11 8-7 13-12 15-14 11-9 11-11 8-7 78-72 31-29 17-16 10-9 8-7 12-11 11-9 14-12 4-5 3-3-2-5-14-12-12-11-8-7-9-9-8-7-16-15-51-48-8-7-13-12-12-11-8-7-14-13-8-7-15-14-10-9-8-7-12-11-8-7-9-9-8-7-16-15-13-12-12-11-7-7-8-7-16-15-12-11-13-12-10-9-8-7-12-11-8-7-14-13-8-7-10-9-8-7-10-9-11-8 1 21v151l-1 18-4 13-7 12-8 8-10 5-14 3-12 1-503 1h-201l-18-2-12-6-9-9-9-14-3-9v-17l4-13 7-11 6-7 9-6 7-2 14-1h563l101-1 1-11v-131l1-24 3-13 8-16 8-12 11-12 13-10 12-7 15-6z" />
                            </svg>
                            </button>

                        </div>
                    </div>
                </div>
                , document.getElementById("portlas")
            )
        }
        , [])

    useEffect(() => {
        MainPageProdRef.current?.scrollIntoView({
            behavior: "smooth", block: "start"
        })
    }, [])


    return (
        <>
            {viewProdVsbl && <ViewProd />}
            <div ref={MainPageProdRef} style={{ minHeight: "800px" }} className="wima c-s-s p10 mt20">
                <div className="c-s-s wmia h400 introPageStyle psr">
                    <h1 className='ml20 mt50'>Order history </h1>
                    <img src="imgs/rb_2148562545.png" alt="" />
                </div>

                {
                    IsGettingAllOrders ?
                        <div className="mrauto c-c-c">
                            <GoodLoader />
                            <h1 className='mt10'>Just a moment, preparing your products...</h1>
                        </div> :
                        OrdersList.length > 0 ?
                            <div className="RealListOrder wmia c-s-c mrauto  p20 br20" style={{ maxWidth: "1500px" }}>
                                {
                                    OrdersList.map(e =>
                                        <div key={e.id} className="c-s-s p20 mb50 bg-l br20  wmia">
                                            <div className="wmia r-p-s">
                                                <div className="c-s-s" style={{ maxWidth: "48%" }}>
                                                    <span className='r-s-c mb10 spnInfoOSsd2'>
                                                        <p>Order Identifier : </p>
                                                        <h1>{e.id}</h1>
                                                    </span>
                                                    <span className='r-s-c mb10 spnInfoOSsd2'>
                                                        <p>Order status  : </p>
                                                        {
                                                            e.status == "Processing" ?
                                                                <h1>{e.status}</h1> :
                                                                <h1 className='c-r'>{e.status}</h1>
                                                        }
                                                    </span>
                                                    <span className='r-s-c mb10 spnInfoOSsd2'>
                                                        <p>Ordered  at  : </p>
                                                        <h1>{e.orderDate}</h1>
                                                    </span>

                                                    <span className='r-s-c mb10 spnInfoOSsd2'>
                                                        <p>Subtotal : </p>
                                                        <h1>$ {getRealNumber(e.subtotal)}</h1>
                                                    </span>
                                                    <span className='r-s-c mb10 spnInfoOSsd2'>
                                                        <p>Shipping cost : </p>
                                                        <h1 className='c-g'> Free !</h1>
                                                    </span>
                                                    <div className="spnInfoOSsd2 c-s-s mb10">
                                                        <span className='r-s-c  '>
                                                            <p>delivery Date : </p>
                                                            <h1 className=''>{e.deliveryDate}</h1>
                                                        </span>
                                                        {
                                                            isUpdateingDelvrDate ?
                                                                <button className='bl mt20 br20 w300 ' > <GoodLoader />
                                                                </button>
                                                                : <button className='bl mt20 br20 w300 ' onClick={() => handelOpendChangeDate(e)}>Change the delivery date  <svg version="1.1" viewBox="0 0 2048 2048" width="128" height="128" xmlns="http://www.w3.org/2000/svg">
                                                                    <path transform="translate(993,158)" d="m0 0h60l45 3 41 4 42 6 44 9 34 9 38 12 34 12 25 10 32 14 33 16 22 12 21 12 19 12 33 22 17 12 13 10 16 12 12 11 14 11 14 13 2 3v6l-8 10-3 1-2 4-9 10-9 11-12 14-8 10-11 13-9 11-10 11-9 11-9 10-9 11-9 10-7 8-11 13-7 8-11 13-9 11-9 12-5 6-4-1-12-9-11-10-14-11-19-14-24-16-22-14-21-12-19-10-28-13-33-13-36-12-40-10-31-6-23-3-36-3h-67l-36 3-33 5-36 8-36 10-34 12-28 12-27 13-23 13-25 15-12 8-14 10-26 20-14 12-8 7-14 12-16 16-7 8-12 13-3 4h-2l-2 4-11 13-13 17-13 18-15 23-15 26-11 20-11 23-10 24-8 21-10 31-10 41-6 31-3 22-3 40-1 33v32l121 1 16 1 12 3 8 4 9 8 8 13 5 11 3 12-1 9-9 16-14 19-12 14-9 11-9 10-9 11-9 10-8 10-9 10-9 11-11 12-7 8-13 15-10 11-9 11-11 12-7 8-11 13-13 15-9 10-14 17-12 13-7 8-9 10-7 8-12 13-9 11-10 11-7 8-20 26-4 5-16-17-12-14-11-12-9-11-10-11-9-11-13-15-12-14-11-12-7-8-12-14-12-13-7-8-48-56-11-12-7-8-12-14-10-11-9-11-12-13-9-11-11-12-9-11-12-14-11-14-10-11v-37l9-10 9-11 12-8 13-4h88l24 1 2-43 3-57 3-35 6-44 7-39 9-38 12-42 15-43 14-36 16-34 11-23 11-21 8-13 11-19 6-10 9-14 11-17 8-10 7-10 11-15 14-19 14-17 16-17 7-8 24-26 13-13 8-7 3-1v-2h2v-2l11-9 11-11 11-9 8-7 14-11 19-14 15-11 18-13 16-10 21-13 24-14 18-10 28-14 27-12 20-9 39-15 28-9 29-8 47-11 36-7 31-5 38-4z" />
                                                                    <path transform="translate(1734,640)" d="m0 0 6 1 10 11 9 11 12 14 9 10 7 8 12 14 12 13 9 10 9 11 11 12 7 8 12 14 9 10 9 11 9 10 9 11 10 11 9 11 14 15 9 11 11 12 7 8 12 14 9 10 9 11 12 14 9 10 9 11 11 12 9 12 9 11 4 5v39h-3l-5 5-11 13-7 5-11 4-7 1-26 1h-39l-49-1-3 23-5 49-4 27-11 56-7 28-11 38-11 33-16 41-9 21-17 35-12 24-9 15-13 22-12 19-9 14-13 18-12 16-13 17-9 12-12 14-9 11-11 11-7 8-3 4h-2l-2 4-24 24-8 7-12 11-8 7-10 9-11 9-13 11-18 13-22 16-18 13-19 12-22 13-21 12-12 7-16 8-25 12-27 12-32 13-36 12-26 8-43 11-38 8-41 7-42 5-41 3-20 1h-51l-35-2-49-5-29-4-49-10-26-6-41-12-36-12-28-11-33-14-45-22-22-12-28-17-20-12-28-19-17-12-11-7-8-6-1-4-2-1 6-9 10-13 11-12 8-10 9-11 12-14 9-10 7-8 11-13 7-8 11-13 9-11 12-14 8-10 9-10 11-14 4-5h2l2-4 11-13 8-10 1-1 7 1 11 7 15 11 20 12 17 10 21 12 19 9 16 8 34 14 36 12 25 7 39 8 26 4 31 3 39 2h13l37-2 23-2 36-6 33-7 30-8 41-14 33-14 21-10 19-10 19-11 21-13 20-14 19-14 12-10 10-8 10-9 8-7 3-1v-2h2v-2h2v-2h2v-2h2v-2l8-7 2-3h2l2-4 11-11 7-8 13-16 13-17 10-14 18-27 14-24 9-17 11-23 10-23 10-27 8-26 7-27 8-36 6-35 4-27h-134l-16-3-11-7-7-8-7-11-6-15-1-14 8-16 11-16 11-12 7-8 11-13 9-11 13-15 7-8 4-5h2l2-4 13-14 9-11 7-7 7-8 13-16 9-10 9-11 26-30 11-12 9-10 7-8 12-14 9-10 9-11 9-10 1-2h2l2-4 9-10 7-8 9-11 11-13 9-10 7-8z" />
                                                                    <path transform="translate(1,1133)" d="m0 0" />
                                                                    <path transform="translate(2047,993)" d="m0 0" />
                                                                </svg>
                                                                </button>
                                                        }

                                                    </div>

                                                    <span className='r-s-c mb10 spnInfoOSsd2'>
                                                        <p>Taxes based on the users location :</p>
                                                        <h1>10%</h1>
                                                    </span>
                                                    <span className='r-s-c mb10 spnInfoOSsd2'>
                                                        <p>the total :</p>
                                                        <h1>
                                                            $ {
                                                                getRealNumber((e.total))
                                                            }
                                                        </h1>
                                                    </span>

                                                    <span className='c-s-s spnInfoOSsd2  mt20'>
                                                        <p className='r-c-c '>
                                                            <svg xmlns="http://www.w3.org/2000/svg" className='mr15' viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M880-720v480q0 33-23.5 56.5T800-160H160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720Zm-720 80h640v-80H160v80Zm0 160v240h640v-240H160Zm0 240v-480 480Z" /></svg>
                                                            Paymenth method used :</p>
                                                        <div className="wmia mb20 p10 p20 r-b-c br20 ">
                                                            <span className='r-s-c'>
                                                                <img className="w40 ml20" src={getrealImg(e.paymentMethodUsed?.cardType)} alt="" />
                                                                <div className="c-s-s ml20">
                                                                    <h1 className="cardNumbreele">
                                                                        {e.paymentMethodUsed && Khazl(e.paymentMethodUsed.CardNumber)}
                                                                    </h1>
                                                                    < p >{e.paymentMethodUsed?.CardholderName}</p>
                                                                </div>
                                                                <h2 className='ml20'>{e.paymentMethodUsed?.ExpiryDate}</h2>
                                                            </span>
                                                        </div>
                                                    </span>
                                                    <span className='c-s-s spnInfoOSsd2 mt20'>
                                                        <p className="r-c-c">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className='mr10' viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Zm0 294q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0 106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Zm0-480Z" /></svg>
                                                            Shipping Address :
                                                        </p>
                                                        <div className="wmia mb10 p10 p20 r-b-c  br20 " >
                                                            <span className='r-s-c'>
                                                                <p>{e.addressUsed.phone} , {e.addressUsed.houseApparNum} , {e.addressUsed.street} {e.addressUsed.city} , {e.addressUsed.zip}</p>
                                                            </span>
                                                        </div>
                                                        {
                                                            isUpdateingShippingAddress ?
                                                                <button className='bl  br20 w300 ' > <GoodLoader />
                                                                </button>
                                                                : <button className='bl  br20 w300 ' onClick={() => handelOpendChangeShippingAddress(e)}>Change the Shipping address  <svg version="1.1" viewBox="0 0 2048 2048" width="128" height="128" xmlns="http://www.w3.org/2000/svg">
                                                                    <path transform="translate(993,158)" d="m0 0h60l45 3 41 4 42 6 44 9 34 9 38 12 34 12 25 10 32 14 33 16 22 12 21 12 19 12 33 22 17 12 13 10 16 12 12 11 14 11 14 13 2 3v6l-8 10-3 1-2 4-9 10-9 11-12 14-8 10-11 13-9 11-10 11-9 11-9 10-9 11-9 10-7 8-11 13-7 8-11 13-9 11-9 12-5 6-4-1-12-9-11-10-14-11-19-14-24-16-22-14-21-12-19-10-28-13-33-13-36-12-40-10-31-6-23-3-36-3h-67l-36 3-33 5-36 8-36 10-34 12-28 12-27 13-23 13-25 15-12 8-14 10-26 20-14 12-8 7-14 12-16 16-7 8-12 13-3 4h-2l-2 4-11 13-13 17-13 18-15 23-15 26-11 20-11 23-10 24-8 21-10 31-10 41-6 31-3 22-3 40-1 33v32l121 1 16 1 12 3 8 4 9 8 8 13 5 11 3 12-1 9-9 16-14 19-12 14-9 11-9 10-9 11-9 10-8 10-9 10-9 11-11 12-7 8-13 15-10 11-9 11-11 12-7 8-11 13-13 15-9 10-14 17-12 13-7 8-9 10-7 8-12 13-9 11-10 11-7 8-20 26-4 5-16-17-12-14-11-12-9-11-10-11-9-11-13-15-12-14-11-12-7-8-12-14-12-13-7-8-48-56-11-12-7-8-12-14-10-11-9-11-12-13-9-11-11-12-9-11-12-14-11-14-10-11v-37l9-10 9-11 12-8 13-4h88l24 1 2-43 3-57 3-35 6-44 7-39 9-38 12-42 15-43 14-36 16-34 11-23 11-21 8-13 11-19 6-10 9-14 11-17 8-10 7-10 11-15 14-19 14-17 16-17 7-8 24-26 13-13 8-7 3-1v-2h2v-2l11-9 11-11 11-9 8-7 14-11 19-14 15-11 18-13 16-10 21-13 24-14 18-10 28-14 27-12 20-9 39-15 28-9 29-8 47-11 36-7 31-5 38-4z" />
                                                                    <path transform="translate(1734,640)" d="m0 0 6 1 10 11 9 11 12 14 9 10 7 8 12 14 12 13 9 10 9 11 11 12 7 8 12 14 9 10 9 11 9 10 9 11 10 11 9 11 14 15 9 11 11 12 7 8 12 14 9 10 9 11 12 14 9 10 9 11 11 12 9 12 9 11 4 5v39h-3l-5 5-11 13-7 5-11 4-7 1-26 1h-39l-49-1-3 23-5 49-4 27-11 56-7 28-11 38-11 33-16 41-9 21-17 35-12 24-9 15-13 22-12 19-9 14-13 18-12 16-13 17-9 12-12 14-9 11-11 11-7 8-3 4h-2l-2 4-24 24-8 7-12 11-8 7-10 9-11 9-13 11-18 13-22 16-18 13-19 12-22 13-21 12-12 7-16 8-25 12-27 12-32 13-36 12-26 8-43 11-38 8-41 7-42 5-41 3-20 1h-51l-35-2-49-5-29-4-49-10-26-6-41-12-36-12-28-11-33-14-45-22-22-12-28-17-20-12-28-19-17-12-11-7-8-6-1-4-2-1 6-9 10-13 11-12 8-10 9-11 12-14 9-10 7-8 11-13 7-8 11-13 9-11 12-14 8-10 9-10 11-14 4-5h2l2-4 11-13 8-10 1-1 7 1 11 7 15 11 20 12 17 10 21 12 19 9 16 8 34 14 36 12 25 7 39 8 26 4 31 3 39 2h13l37-2 23-2 36-6 33-7 30-8 41-14 33-14 21-10 19-10 19-11 21-13 20-14 19-14 12-10 10-8 10-9 8-7 3-1v-2h2v-2h2v-2h2v-2h2v-2l8-7 2-3h2l2-4 11-11 7-8 13-16 13-17 10-14 18-27 14-24 9-17 11-23 10-23 10-27 8-26 7-27 8-36 6-35 4-27h-134l-16-3-11-7-7-8-7-11-6-15-1-14 8-16 11-16 11-12 7-8 11-13 9-11 13-15 7-8 4-5h2l2-4 13-14 9-11 7-7 7-8 13-16 9-10 9-11 26-30 11-12 9-10 7-8 12-14 9-10 9-11 9-10 1-2h2l2-4 9-10 7-8 9-11 11-13 9-10 7-8z" />
                                                                    <path transform="translate(1,1133)" d="m0 0" />
                                                                    <path transform="translate(2047,993)" d="m0 0" />
                                                                </svg>
                                                                </button>
                                                        }
                                                    </span>
                                                </div>
                                                <div style={{ width: "48%" }} className="  c-s-s">
                                                    <h2 className='mb10'>Order's Products  </h2>
                                                    <p className='ml20'>{e.products.reduce((t, c) => t + c.quantity, 0)} items of {e.products.length} Products</p>
                                                    <div style={{ maxHeight: "600px", overflow: "auto", border: "solid 1px var(--border-color)" }} className="listOfOrserProds  wmia mt20  c-s-s p10 br20 ">
                                                        {
                                                            e.products.map(
                                                                o => <LaodSungleProdsInfo key={o.id} ob={o} />
                                                            )
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='mt20 r-c-e'>
                                                {e.status == "Processing" &&
                                                    <span className='c-s-s'>
                                                        <p>Your order is still being processed. Thank you for your patience!</p>
                                                        {
                                                            isCancelingOrder ?
                                                                <GoodLoader />
                                                                :
                                                                <button className='mt10 w300 r-c-c btnCancelOrder p5 br20  ' onClick={() => dispatch(CancelOrder(e))}>Cancel the order  <svg version="1.1" viewBox="0 0 2048 2048" width="128" height="128" xmlns="http://www.w3.org/2000/svg">
                                                                    <path transform="translate(535,40)" d="m0 0h118l106 1h378l175-1h40l40 1 26 2 22 5 20 8 19 10 17 12 10 9 8 7 8 8 11 14 13 18 11 18 9 15 13 22 21 35 13 22 10 17 17 28 9 15 19 32 17 28 12 20 19 32 17 28 12 20 19 32 17 28 12 20 10 17 45 75 13 22 9 15 10 19 4 13v216l1 178 3 10 8 11 12 15 15 23 11 19 10 18 11 23 9 20 15 40 11 39 7 31 7 49 2 24 1 35-1 28-3 31-7 45-8 34-11 37-8 20-6 16-9 20-7 15-13 24-13 21-14 21-12 17-9 12-9 10-9 11-16 17-23 23-8 7-13 11-8 7-13 10-12 9-22 14-21 13-26 14-27 13-27 11-28 10-35 10-26 6-37 6-37 4-16 1h-48l-35-3-36-5-28-6-33-9-35-12-36-15-32-16-24-14-19-12-19-14-13-10-7-4-7-2h-101l-289-1h-500l-19-2-22-5-16-6-19-9-18-12-10-8-15-14-9-10-12-16-9-15-9-19-6-17-5-22-2-20-1-62v-130l1-809 8-21 7-12 16-26 17-29 8-13 6-10 11-18 13-22 12-20 10-17 12-20 8-13 6-10 13-22 15-25 13-21 6-11 17-28 10-17 15-25 17-29 8-13 15-25 8-13 7-12 33-55 10-17 8-13 9-15 7-11 9-13 9-10 7-8 4-2v-2l8-7 10-8 16-10 19-10 18-7 17-4 14-2zm118 123-121 1-15 2-6 3-9 7-9 10-12 18-11 19-8 13-13 22-17 28-9 16-7 10-9 16-17 28-14 24-12 19-11 19-16 26-11 19-9 14-11 19-15 25-13 22-8 13-13 22-7 11-24 40-9 14-6 10 6 1h683l-1-490-244-1zm373 1-1 5-1 24-1 94v367h689l-3-7-10-16-15-25-17-29-39-65-17-28-13-22-42-70-14-23-10-17-18-30-17-28-15-25-15-26-17-28-14-22-10-13-7-7-8-5-6-2-23-2zm-862 614-1 116v795l1 17 3 14 5 10 8 10 10 9 10 6 13 4 17 2 82 1h492l180-2 8-1-2-6-7-10-8-13-14-25-15-32-11-29-7-19-10-35-6-24-5-27-4-30-2-25-1-24v-20l2-31 3-27 9-49 8-31 12-36 11-28 12-26 8-16 8-15 10-17 8-12 7-11 9-12 10-14 11-14 11-13 9-10 11-12 14-14 8-7 11-10 11-9 16-12 13-10 19-13 19-12 15-9 23-12 16-8 23-10 30-11 33-10 36-8 37-6 18-2 20-1h65l29 2 30 4 31 6 31 8 33 11 21 8 20 9 24 11 24 13 20 13 10 6h1v-207l-1-8zm1279 245-31 2-25 3-31 6-24 6-32 11-24 10-26 13-14 9-11 6-12 8-18 13-17 14-11 9-7 7-6 5-6 7-6 5-7 8-10 11-21 28-10 15-9 14-14 26-8 16-10 24-9 23-7 25-7 36-4 27-2 19-1 21v14l2 27 5 35 6 29 8 29 12 32 12 26 8 16 14 24 15 22 14 18 9 11 13 15 21 21 11 9 9 8 20 15 24 16 24 14 19 10 22 10 29 11 36 10 31 6 36 4 19 1h27l29-2 39-6 36-9 27-9 27-11 32-16 22-13 24-16 12-9 14-11 11-10 8-7 27-27 10-13 6-7 10-14 7-10 15-23 6-11 9-17 14-32 11-33 6-22 6-31 4-31 2-25v-25l-3-39-4-27-8-36-7-22-11-31-17-35-14-25-18-27-10-13-8-10-11-13-4-5h-2l-2-4-12-12-8-7-13-12-17-13-15-11-15-10-20-12-27-14-28-12-28-10-27-8-32-6-31-4-28-2z" />
                                                                    <path transform="translate(1262,1207)" d="m0 0h12l15 4 16 8 8 6 10 9 61 61v2l4 2 5 6 3 2v2l4 2 17 17v2l3 1 6 7 8 7 12 13 6 4h5l19-19h2v-2h2v-2h2v-2h2l2-4h2l2-4 102-102 14-11 10-5 13-4h11l17 4 12 5 10 7 7 7 8 12 5 15 1 18-3 12-7 14-10 13-12 13-27 27-5 6-7 6-7 8-5 4-7 8-50 50-14 11-2 4 1 4 12 13 118 118 11 14 7 11 5 12 1 3 1 14-2 12-6 15-8 11-5 6-9 7-14 5-14 3h-11l-16-4-11-6-10-8-12-11-114-114-4-5-8-5-6-1-5 4-7 8-33 33-1 2h-2l-2 4-7 6-5 6-7 6-5 6-6 5-53 53-11 9-16 8-11 3-11 1-14-2-13-4-11-7-11-11-7-14-5-20v-9l4-14 6-12 10-13 14-15 54-54 7-8 29-29 8-7 8-8 8-7 8-9-1-5-7-8-121-121v-2h-2l-9-11-9-13-4-9-3-13v-11l3-13 8-16 6-8h2v-2l12-9 16-6z" />
                                                                    <path transform="translate(446,961)" d="m0 0h173l41 1 13 2 9 4 11 7 7 7 8 10 6 12 3 13v12l-3 12-7 14-10 13-8 7-12 6-10 2-36 2h-225l-15-2-10-4-10-8-8-8-9-13-4-9-3-11v-15l4-13 4-8 7-9 9-10 16-10 5-2 6-1z" />
                                                                </svg>
                                                                </button>

                                                        }

                                                    </span>
                                                }
                                                {e.status == "canceled" &&
                                                    <span className='c-s-s'>
                                                        <p>You canceled this order. You can reorder it now if you'd like</p>
                                                        {
                                                            isCancelingOrder ?
                                                                <GoodLoader />
                                                                :
                                                                <button className='mt10 w300 r-c-c bg-g p5 br20 ' style={{ fontSize: "16px" }} onClick={() => dispatch(Reorder(e))}>Reorder now
                                                                    <svg version="1.1" viewBox="0 0 2048 2048" className='ml10 w30 h30' xmlns="http://www.w3.org/2000/svg">
                                                                        <path transform="translate(918)" d="m0 0h27l-1 3-8-1 1 4 4 2 29 15 26 14 21 12 24 14 52 30 22 13 26 15 24 14 26 15 24 14 14 8 12 8 7 6 1 5-9 6-23 14-11 7-28 16-20 12-28 16-24 14-26 15-14 8-24 14-23 13-24 14-16 9-17 10-16 9-18 10-8 3-3-1-2-20-1-56-1-15-2-6-15 1-37 7-44 11-35 11-28 10-38 16-17 8-17 9-14 7-21 12-26 16-28 19-28 21-13 11-11 9-20 18-8 7-15 14-5 6-5 4-7 8-9 9-9 11-7 7-11 14-12 15-8 11-8 10-13 19-12 19-9 14-10 17-15 28-11 22-11 24-12 30-17 49-12 44-6 27-6 38-5 44-3 39v61l4 45 6 41 6 34 9 36 11 38 12 34 11 27 11 25 10 21 12 22 9 17 14 23 18 27 12 17 9 12 10 13 11 13 8 10 7 7 7 8 11 12 12 13 16 15 12 11 8 7 14 12 14 11 16 13 12 9 10 9 9 8 10 13 8 15 4 14 1 6v13l-4 20-7 14-12 16-6 7-11 8-16 8-9 3-11 1h-20l-16-4-14-7-11-7-17-12-13-10-17-14-11-9-12-11-11-9-9-9-8-7-34-34-7-8-12-13-7-8-9-10-9-11-14-17-15-20-13-18-22-33-12-19-17-29-14-26-16-32-14-32-15-38-16-47-11-39-8-33-8-41-6-39-5-45-2-26-1-30v-24l3-57 4-44 7-49 10-48 7-30 13-43 15-44 16-39 17-37 13-26 13-23 8-15 13-21 9-14 20-30 12-17 13-17 8-9 7-9 16-20 9-10 7-8 11-12 9-10 8-8 1-2h2l2-4 12-12h2l2-4 8-7 10-9 11-9 10-9 14-11 12-10 13-10 19-14 29-20 21-13 25-15 36-21 48-23 31-13 37-14 30-10 50-14 35-8 65-12 13-4 2-9 2-71 1-25z" />
                                                                        <path transform="translate(1491,258)" d="m0 0h22l14 3 18 8 16 10 14 10 14 11 13 11 10 8 14 12 11 9 9 9 8 7 40 40v2h2l7 8 11 12 9 11 9 10 11 14 16 21 12 17 13 18 24 38 9 15 10 18 11 20 8 16 11 23 9 20 16 40 14 40 8 27 11 40 6 27 8 43 5 36 5 52 2 46v25l-2 46-5 51-5 38-5 28-10 45-11 41-9 29-12 34-13 32-18 41-10 19-7 14-12 22-7 12-16 26-16 24-13 19-10 14-9 12-13 16-11 14-10 11-7 8-13 14-7 8-8 8-6 7-13 13h-2l-1 3-8 7-17 16-14 12-13 11-11 9-12 9-18 14-17 12-10 7-18 12-19 12-27 16-18 10-17 9-23 11-28 13-39 16-26 9-33 11-52 14-41 9-55 11-11 3-1 27-1 84h-22l1-2 2-1-21-14-23-13-18-10-25-14-20-12-26-15-46-26-17-10-26-15-49-28-22-13-11-6-10-8 1-5 9-7 16-11 46-26 13-8 20-12 17-10 24-14 26-15 20-12 26-15 21-12 25-14 46-26 15-8h6l2 7 1 58 2 34 25-4 50-11 28-8 37-12 38-15 34-15 15-8 16-8 27-15 21-13 20-13 17-12 15-11 18-14 12-10 11-9 15-14 12-11 3-3h2v-2l4-4h2l2-4 19-19 7-8 11-12 11-14 12-15 9-12 8-11 12-17 11-17 18-30 13-25 16-32 14-33 7-17 12-36 10-35 8-32 7-37 7-55 3-42v-59l-3-38-5-44-7-38-7-30-10-36-12-36-9-24-14-33-16-33-15-28-13-22-14-22-11-16-13-18-10-14-13-16-12-14-11-12-7-8-40-40-8-7-14-12-16-13-26-20-10-8-13-12-9-11-8-14-5-14-2-10v-14l4-17 5-13 8-12 8-10 13-11 15-8 12-4z" />
                                                                        <path transform="translate(1448,795)" d="m0 0h5l1 3-1 470-3 5-39 23-28 16-24 14-28 16-24 14-28 16-29 17-23 13-24 14-19 11-52 30-25 14-27 16-16 10-17 10-5-1-2-3-1-18v-447l3-7 5-5 10-6 42-23 34-20 21-12 48-28 28-16 16-9 26-15 24-14 56-32 23-13 28-16 17-10 20-12z" />
                                                                        <path transform="translate(596,796)" d="m0 0 6 1 15 9 22 13 24 14 25 14 35 20 11 8 1 2v121l3 10 5 5 9 6 19 10 14 8 24 14 20 12 22 12 8 3h8l3-1 3-13 1-8 1-98 4-1 16 9 13 8 18 10 22 13 24 14 24 13 10 8 2 3v471l-1 2-6-1-34-20-20-11-24-14-21-12-78-45-29-17-28-16-26-15-24-14-29-17-27-16-25-14-23-13-12-7-6-7-2-6v-408l1-53z" />
                                                                        <path transform="translate(1018,529)" d="m0 0h8l9 4 23 13 13 8 20 11 25 15 17 10 18 11 8 7 2 5-15 7-16 8-21 12-6 3-16 10-23 13-17 10-25 14-10 6-14 8-12 7-13 8-18 10-22 13-18 10-17 10-10 6-11 6-17 10-28 16-26 15-29 17-12 7-11 6-4 1-19-9-14-9-24-14-27-15-24-14-28-16-4-3 10-8 27-14 82-48 24-14 25-14 24-14 27-16 28-16 17-10 28-16 24-14 19-11 26-15 16-9 21-12z" />
                                                                        <path transform="translate(1302,691)" d="m0 0h6l17 9 13 8 25 14 17 10 21 13 18 10 12 9v2h2l-2 4-13 8-14 7-13 8-18 10-28 16-15 9-14 8-13 8-11 6-23 13-10 6-21 12-22 13-18 10-17 10-16 9-14 8-13 8-21 12-24 14-25 14-20 12-12 7-8 5h-7l-10-4-20-12-19-11-35-20-23-13-22-13v-3l8-4 11-7 21-12 22-12 20-12 26-15 24-14 26-15 23-13 17-10 43-25 25-14 17-10 42-24 17-10 28-16 24-13z" />
                                                                        <path transform="translate(1190,628)" d="m0 0h7l16 8 20 12 24 13 11 8 2 2-1 4-10 6-16 8-13 8-21 12-19 11-20 12-14 8-22 13-25 14-14 8-16 9-27 16-16 9-22 13-18 10-17 10-28 16-13 8-14 8-20 12-36 20-18 9-3 4-2 33-1 84-5-1-3-2v-2l-5-2-16-9-17-10-19-11-11-8-2-3-1-6v-73l1-30 2-5 7-6 18-10 15-9 15-8 15-9 24-14 28-16 24-14 23-13 17-10 23-13 21-12 24-14 19-11 22-13 14-8 17-10 23-13 14-8 39-22 16-10z" />
                                                                        <path transform="translate(1103,2046)" d="m0 0h2v2h-2z" />
                                                                        <path transform="translate(614,770)" d="m0 0 2 1z" />
                                                                        <path transform="translate(950,5)" d="m0 0" />
                                                                    </svg>
                                                                </button>

                                                        }

                                                    </span>
                                                }

                                                <button className='ml20 btnDownlasdInvi w300 r-c-c p5 br20  ' onClick={(b) => generatePDF(b, e)}>Download Invoice<svg version="1.1" viewBox="0 0 2048 2048" width="128" height="128" xmlns="http://www.w3.org/2000/svg">
                                                    <path transform="translate(273)" d="m0 0h757l-3 2-2 1 13 10 13 11 12 11 18 18 7 8 8 8 7 8 17 17 7 8 13 13 7 8 10 10 7 8 8 8 7 8 19 19 7 8 15 15 7 8 15 15 7 8 9 9v2h2l7 8 13 13 7 8 13 13 7 8 10 10 7 8 8 8 7 8 13 13 7 8 21 21 7 8 18 18 7 8 16 16 7 8 9 9 7 8 7 7 9 11 9 12 8 14 3 10 1 390 12 3 29 8 31 10 29 11 20 9 42 21 10 6 11 6 24 16 14 10 11 8 18 14 11 9 24 22 30 30 7 8 11 13 13 17 10 14 16 23 12 20 12 21 11 22 11 24 11 28 10 30 8 30 8 34 4 28 5 56 1 13v18l-8 87-4 24-12 43-10 32-6 19-6 15-9 20-10 18-7 14-9 15-6 12-9 14-8 12-13 17-10 13-14 17-9 10-8 10h-2l-2 4-7 8-8 7-9 9-14 11-10 9-14 11-10 9-11 8-24 16-24 14-28 15-27 14-27 11-43 14-30 9-25 6-28 5-39 5h-8v3h-100l3-2-23-3-37-9-42-10-26-8-21-7-21-8-25-11-19-9-18-10-17-10-20-13-18-13-11-8-17-14-8-7-10-9-8-7-34-34-7-8-12-14-13-16-14-20-11-16-8-11-6-7-2-1-543-1-33-3-22-4-21-6-21-9-21-11-12-8-13-10-12-11-10-10-18-22-12-19-12-23-9-25-6-24-3-21-2-25-1-93 1-1207 2-26 4-27 6-22 11-25 10-19 12-19 14-18h2l2-4 15-15 14-11 17-12 18-10 22-10 32-11zm83 85-34 1-21 2-25 5-12 4-12 6-15 10-11 9-12 12-12 17-6 10-5 11-7 21-5 26-1 11-1 27-1 1101v132l1 33 3 31 6 26 6 16 6 11 10 14 12 13 10 9 15 11 17 9 21 7 20 4 18 2 15 1 220 1h92l173-1-12-41-9-31-8-34-4-26-7-63-1-11v-28l4-47 7-44 6-29-360-1-14-3-10-6-7-6-7-11-3-10v-10l2-10 4-8 8-8 14-8 9-4h381l9-2 7-8 13-28 10-19 6-12 11-18 8-13 11-18 7-11v-4h-426l-35-1-10-2-10-5-10-9-6-9-4-10v-12l5-13 4-5v-2l4-2 8-7 9-5 4-1 17-1 91-1h333l103-1 11-4 11-7 19-14 17-13 27-18 13-8 25-13 19-10 23-11 28-11 21-7 31-9 29-7 38-6 35-4 32-2 49-1 1-330-1-2-231-1-26-2-27-4-24-6-20-8-15-8-17-12-14-12-9-9-13-17-12-19-11-23-5-15-6-27-3-20-1-13-1-54v-198l-1-9zm695 66 1 19v177l2 20 4 17 5 13 9 16 9 11 9 8 10 7 16 8 13 4 16 3 12 1 183 1-2-4-14-15-16-17-9-10-5-6h-2l-2-4-12-12-7-8-14-14-1-2h-2l-2-4-17-17-7-8-9-9-1-2h-2l-2-4-12-12-7-8-8-8-7-8-15-16-29-31-30-30-7-8-12-13-16-17-17-17zm288 810-25 2-36 5-29 6-31 9-33 11-23 10-16 8-27 14-27 16-17 12-13 11-13 10-10 9-11 9-17 16-13 14-11 14-10 12-20 26-10 15-9 16-12 21-12 23-6 12-11 29-17 55-5 26-4 35-4 34-1 14v16l6 57 5 33 7 28 12 38 6 17 11 26 13 26 13 23 11 19 9 12 13 17 11 13 9 11 11 12 7 8 12 12h2v2l8 7 11 9 13 11 16 13 17 12 17 10 18 10 28 15 24 11 21 8 38 12 27 7 26 5 57 6 13 1h18l68-7 23-4 24-6 39-12 25-9 24-11 31-16 17-10 14-8 20-14 25-20 12-10 11-9 16-15 7-8 9-10v-2h2l10-13 11-12 7-9 6-8 12-18 16-28 13-25 8-16 10-26 13-43 6-22 4-20 7-65 1-8v-31l-6-60-4-26-8-32-15-47-11-26-17-34-14-24-10-16-12-17-12-16-13-16-9-11-8-8-1-2h-2l-2-4-13-12-8-7-11-9-9-8-17-13-15-11-16-10-19-11-16-9-32-16-20-8-36-12-34-10-26-5-36-4-27-2zm-27 1085m3 0v1h7v-1z" />
                                                    <path transform="translate(1359,1135)" d="m0 0h14l13 4 9 6 5 5 6 9 3 9 1 7 1 269v193l11-10h2l2-4 13-13 7-8 2-3h2l2-4h2l2-4 6-7h2l2-4 11-11 1-2h2l2-4h2l2-4 7-8h2l2-4 12-13 7-8 6-7h2l2-4 9-9 7-8 2-3h2l2-4 9-9 7-8 18-18 17-12 8-3h18l11 4 10 9 7 10 6 10 1 6-4 13-8 15-10 13-12 13-7 8-12 12-7 8-7 7-7 8-30 32-9 10-13 14-7 8-15 16-4 5h-2l-2 4-7 7-7 8-14 15-11 12-12 12-7 8-10 10-7 8-8 8-7 8-5 4-5 5-8 7-16 10-11 4-8-1-12-5-13-9-15-14-20-20-7-8-15-16-5-5v-2h-2l-7-8-15-16-10-10-7-8-16-17-22-24-12-13-9-10-14-15-7-8-7-7-7-8-15-16-14-15-9-10-11-14-10-15-6-13-1-8 4-9 7-11 7-8 11-7 6-2h14l10 3 15 9 7 7 8 7 14 14 7 8 7 7v2h2l7 8 31 33 12 13 14 15 18 18v2h2l7 8 9 9 7 8 9 9 7 8 10 9-1-18v-431l1-16 4-13 7-10 7-7 8-5z" />
                                                    <path transform="translate(539,805)" d="m0 0h263l59 1 16 2 9 4 10 6 8 9 4 9 2 13-1 10-6 12-6 7-13 9-9 3-11 1-369 1h-45l-19-1-10-3-9-6-10-10-6-11-1-4v-15l3-11 7-9 8-7 16-8 4-1z" />
                                                    <path transform="translate(1451,2047)" d="m0 0h7v1h-7z" />
                                                    <path transform="translate(1416,2045)" d="m0 0 4 1z" />
                                                    <path transform="translate(1289,2044)" d="m0 0 2 1-2 2z" />
                                                    <path transform="translate(1269,2046)" d="m0 0 1 2-2-1z" />
                                                    <path transform="translate(1438,2047)" d="m0 0 2 1z" />
                                                    <path transform="translate(1433,2047)" d="m0 0 2 1z" />
                                                    <path transform="translate(1410,2047)" d="m0 0 2 1z" />
                                                    <path transform="translate(1285,2044)" d="m0 0" />
                                                    <path transform="translate(1429,2047)" d="m0 0" />
                                                    <path transform="translate(1287,2044)" d="m0 0" />
                                                </svg>

                                                </button>

                                            </div>
                                        </div>

                                    )
                                }
                            </div>
                            :
                            <div className="mrauto c-c-c">
                                <img src="imgs/emptyCoasd.png" className='w400' alt="" />
                                <h1 className="logo mt20">It seems like you haven’t made any purchases yet. Take a look at our catalog!</h1>
                                <button onClick={() => navigate("/Shop")} className='w300 bl p10 br20 mt50'>go shopping <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m700-300-57-56 84-84H120v-80h607l-83-84 57-56 179 180-180 180Z" /></svg> </button>
                            </div>
                }
            </div>
            {isOneToUpdateDelvrDate && <HandelChangeDelvDate OrderData={ontedId} />}
            {isOneToUpdateShippingAddress && <HandelChangeShippingAddress OrderData={ontedId} />}
        </>
    )
}