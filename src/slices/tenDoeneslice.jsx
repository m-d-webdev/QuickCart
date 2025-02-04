import { useState, useEffect, useRef } from 'react'
import { createSlice } from '@reduxjs/toolkit'
import Lottie from 'react-lottie';

import { useSelector, useDispatch } from 'react-redux'
import ReactDom from 'react-dom';
import animationDat from "../media/Animation - 1731398071278.json"
import animationDatError from "../media/Animation - 1733431728523.json"
const TenDoneSlice = createSlice({
    name: "tenDone",
    initialState: {
        isVisible: false,
        message: "",
        isSuccess: false
    },
    reducers: {
        showTenDone: (state, action) => {
            state.isVisible = false;
            state.isVisible = true;
            state.message = action.payload[1]
            state.isSuccess = action.payload[0] != null ? action.payload[0] : true
        },
        hideTenDone: (state) => {
            state.isVisible = false;
            state.message = ''
        }
    }
})



export const LottieDone = ({ w, h }) => {
    const defaultOptions = {
        loop: false,
        autoplay: true,
        animationData: animationDat,
    };

    return (
        <div>
            <Lottie options={defaultOptions} height={w ? w : 100} width={h ? h : 100} />
        </div>
    );
};
export const LottieError = ({ w, h }) => {
    const defaultOptions = {
        loop: false,
        autoplay: true,
        animationData: animationDatError,
    };
    return (
        <div>
            <Lottie options={defaultOptions} height={w ? w : 100} width={h ? h : 100} />
        </div>
    );
};
export function TenDone() {
    const dispatch = useDispatch();
    const tenDoneRed = useRef(null);
    const { message, isSuccess } = useSelector(st => st.TenDone);
    useEffect(() => {
        setTimeout(() => {
            tenDoneRed.current.classList.add("inactive");
            setTimeout(() => dispatch(hideTenDone()), 200);
        }, 4000);
    }, [])

    return ReactDom.createPortal(
        <div ref={tenDoneRed} className='TenDoneContainer p15 br20 r-c-c bg-d'>
            {isSuccess ? <LottieDone w={50} h={50} /> : <LottieError w={50} h={50} />}
            <p className='c-l ml20'>{message ? message : "The operation was successfully completed."}</p>
        </div >, document.getElementById("portlas")
    )
}
export const { showTenDone, hideTenDone } = TenDoneSlice.actions
export default TenDoneSlice.reducer
