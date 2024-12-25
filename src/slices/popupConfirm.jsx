import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { act, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ReactDom from "react-dom"
import { hideCmpCreateOrder } from './OrdersMan'

const PopupConfSlice = createSlice({
    name: "popupConf",
    initialState: {
        PopupVSBL: false,
        message: "",
        des: "",
        funcKey: ""
    },
    reducers: {
        showPopupConfrm: (state, action) => {
            state.PopupVSBL = true;
            state.funcKey = action.payload[2];
            state.des = action.payload[1];
            state.message = action.payload[0];
        },
        hidePopupConfrm: (state) => {
            state.PopupVSBL = false
        }

    }
})

export const { showPopupConfrm, hidePopupConfrm } = PopupConfSlice.actions
export default PopupConfSlice.reducer





export const PopupConfCmp = () => {
    const dispatch = useDispatch();

    const actionMap = {
        confirmCancelCreateOrder: () => dispatch(hideCmpCreateOrder())
    }
    const { message, des, funcKey } = useSelector(s => s.PopupCnof)
    function handelExcteDunc() {
        actionMap[funcKey] && actionMap[funcKey]()
        dispatch(hidePopupConfrm());

    }


    return ReactDom.createPortal(
        <div className='backendMer'>
            <div className="w500 h300 psr activeCmp p20 c-p-c br20 bg-l">
                <button className='btnClose' onClick={() => dispatch(hidePopupConfrm())}><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" /></svg></button>
                <h1 className="logo mt20" style={{ textAlign: "center" }}>{message}</h1>
                <p className="mt20" style={{ textAlign: "center" }}>{des}</p>
                <span className="r-e-c wmia mt20">
                    <button className='p10 w100 br5 mr20' onClick={() => dispatch(hidePopupConfrm())}>Cancel</button>
                    <button className='p10 w200 br5 bl' onClick={handelExcteDunc}>sure</button>
                </span>
            </div>
        </div>,
        document.getElementById('portlas'))
}
