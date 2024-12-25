import React, { useState, useRef, useEffect } from 'react'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { useSelector, useDispatch } from 'react-redux'
import { api } from '../../slices/fetchProdSlice';
import ReactDom from "react-dom";
import '../../css/singles.css'
export const DispayRatingCmp = React.forwardRef(({ }, ref) => {
    const { isVisible,
        isLoadingRating,
        prodDate } = useSelector(st => st.displayRating);
    const dispatch = useDispatch()
    const getPersontage = (num) => {
        const reviewsCount = prodDate.reviews.length;
        let fuveStaes = prodDate.reviews.filter(t => t.rating == num).length;
        console.log(fuveStaes);
        let pers = ((fuveStaes / reviewsCount) * 100).toString();
        if (pers.indexOf(".") != -1) {
            pers = pers.substring(0, pers.indexOf('.') + 2);
        }
        return pers;
    }


    return (
        <div ref={ref} className='displayRattngsCmp c-s-s  h300 bg-l b10 p20'>
            {
                isLoadingRating ?
                    <div className="loader"></div>
                    : <>
                        <span className='r-s-c mb20'><svg version="1.1" viewBox="0 0 2048 2048" width="128" height="128" xmlns="http://www.w3.org/2000/svg">
                            <path transform="translate(1017,44)" d="m0 0h10l18 2 18 5 17 8 12 9 8 7 9 11 10 15 13 26 11 26 12 28 19 45 17 40 24 56 11 26 12 28 16 37 19 45 30 70 19 45 13 30 14 33 7 14 3 4 10 2 100 10 130 11 199 18 125 12 32 4 17 4 13 5 14 8 11 9 10 10 8 11 11 18 7 14 2 7v50l-2 4-4 4-9 17-9 12-9 10-7 7-7 8-8 7-8 8-8 7-10 9-11 9-15 14-11 9-15 13-11 10-8 7-14 12-7 7-11 9-11 10-11 9-11 10-8 7-10 9-11 9-15 13-12 11-8 7-10 9-8 7-10 9-8 7-11 9-12 11-11 9-12 11-11 9-12 11-8 7-12 11-11 9-9 9-11 9-9 8-14 11-14 12-3 3h-2l-2 4-1 6 3 17 8 36 13 59 11 49 13 57 11 48 12 54 12 53 13 57 11 48 13 57 6 27 4 27 1 10v11l-2 17-6 16-9 16-9 12-15 15-10 7-14 7-21 6-15 3h-19l-18-4-16-6-20-10-24-14-32-19-23-14-45-27-28-17-32-19-28-17-55-33-32-19-23-14-30-18-28-17-20-12-27-16-21-12-25-15-18-11-6-4-6 1-24 14-28 17-39 23-28 17-45 27-28 17-29 17-20 12-22 13-30 18-29 17-16 10-24 14-28 17-20 12-26 15-25 15-28 17-24 13-16 6-25 6-13 1-20-3-17-5-19-10-12-11-10-10-10-15-9-19-5-15-1-7v-22l4-28 9-41 16-71 15-66 9-39 17-75 20-88 16-71 13-57 5-23 7-30v-8l-7-9-13-11-8-7-28-24-10-9-8-7-10-9-11-9-7-7-8-7-10-9-11-9-13-12-11-9-14-13-11-9-12-11-11-9-11-10-8-7-15-13-10-9-8-7-10-9-11-9-12-11-8-7-14-12-10-9-11-9-10-9-11-9-14-13-8-7-20-18-12-11-8-7-10-9-11-9-22-22-8-11-14-25-2-3v-56l11-19 6-11 14-17 11-11 15-10 13-6 13-4 25-4 129-12 124-11 93-9 69-6 108-10 44-4 12-3 4-4 8-15 15-37 17-39 15-35 12-29 8-19 5-11 12-28 7-17 5-11 13-31 19-44 11-26 48-112 12-29 12-28 11-25 10-19 13-17 7-7 12-9 14-8 12-5 11-3z" fill="#FEBF11" />
                        </svg>
                            <h1 className='ml15'>{prodDate.rating}</h1>
                        </span>
                        <div className="wmia c-s-s mt10 mb20 cntINputsRang">
                            <div className='r-b-c wmia '>    <p className='w50' style={{minWidth:"50px"}}>5 star</p><div className="rangerInpu r-s-s "><span className=' inputsosdf' style={{ width: `${getPersontage(5)}%` }}></span></div><p className='ml10'>{`${getPersontage(5)}%`}</p></div>
                            <div className='r-b-c wmia mt10'><p className='w50' style={{minWidth:"50px"}}>4 star</p><div className="rangerInpu r-s-s "><span className=' inputsosdf' style={{ width: `${getPersontage(4)}%` }}></span></div><p className='ml10'>{`${getPersontage(4)}%`}</p></div>
                            <div className='r-b-c wmia mt10'><p className='w50' style={{minWidth:"50px"}}>3 star</p><div className="rangerInpu r-s-s "><span className=' inputsosdf' style={{ width: `${getPersontage(3)}%` }}></span></div><p className='ml10'>{`${getPersontage(3)}%`}</p></div>
                            <div className='r-b-c wmia mt10'><p className='w50' style={{minWidth:"50px"}}>2 star</p><div className="rangerInpu r-s-s "><span className=' inputsosdf' style={{ width: `${getPersontage(2)}%` }}></span></div><p className='ml10'>{`${getPersontage(2)}%`}</p></div>
                            <div className='r-b-c wmia mt10'><p className='w50' style={{minWidth:"50px"}}>1 star</p><div className="rangerInpu r-s-s "><span className=' inputsosdf' style={{ width: `${getPersontage(1)}%` }}></span></div><p className='ml10'>{`${getPersontage(1)}%`}</p></div>
                        </div>
                        <button className='r-c-c mt20 mrauto br20 hoverEff1 p10 w200 br5' onClick={() => dispatch(showReviewa())}>View Reviews <svg className='ml10' version="1.1" viewBox="0 0 2048 2048" width="128" height="128" xmlns="http://www.w3.org/2000/svg">
                            <path transform="translate(403,191)" d="m0 0h1244l35 2 24 3 16 4 17 6 20 10 13 9 16 12 12 11 8 8 13 17 11 18 8 16 6 15 5 18 3 24 1 19v632l-1 21-3 10-7 13-12 13-7 6-10 5-14 3h-19l-12-3-12-5-12-9-8-9-7-12-3-11-1-9-1-26-1-49v-575l-2-13-5-12-8-12-6-7-11-7-10-4-14-2-47-1-919-1h-86l-195 1-44 1-17 2-10 5-13 11-9 13-5 12-2 11-1 18-1 74v1177l1 22 3 18 3 8 7 10 7 8 10 7 10 5 14 3 10 1 613 1 28 1 13 1 10 3 12 7 12 12 7 10 4 8 3 10v23l-4 12-7 12-11 13-8 7-9 5-13 2-12 1-41 1h-596l-28-2-25-4-24-8-16-8-14-8-12-9-14-12-11-11-9-11-9-12-12-20-7-15-6-18-5-23-2-19-2-50-1-50v-1079l1-93 1-28 2-22 4-20 7-19 7-15 8-15 10-15 13-16 14-14 16-12 15-10 23-12 24-8 25-4 13-1z" />
                            <path transform="translate(1336,1045)" d="m0 0h51l25 2 28 5 24 7 26 10 23 11 19 11 18 12 17 13 13 11 8 7 7 8 12 12 11 14 11 15 12 19 9 16 9 19 11 29 7 25 5 27 3 27v38l-2 20-5 29-6 24-10 29-8 18-2 4 1 6 16 12 14 11 20 16 16 13 28 22 16 13 14 11 11 9 14 11 15 12 11 9 13 13 9 13 5 13 1 6v17l-3 11-6 12-7 10-9 10-12 7-18 6-10 1h-7l-16-5-17-10-26-20-16-13-14-11-32-26-14-11-16-13-14-11-17-14-14-11-12-10-5-2-6 1-8 6-14 10-18 11-23 12-25 10-24 8-21 5-36 6-19 2h-31l-36-4-20-4-30-9-27-11-16-8-17-9-21-14-13-10-11-9-12-11-5-4-7-8-11-12-13-17-10-14-11-18-12-23-9-21-7-19-7-25-5-27-2-16-1-14v-29l3-28 5-25 6-23 9-25 9-20 8-16 9-16 9-14 13-17 11-13 4-5 19-19 8-7 12-10 13-10 15-10 25-14 24-11 20-7 20-6 25-5zm12 129-22 3-21 5-16 6-16 8-14 9-12 9-13 11-13 13-10 13-9 14-8 14-8 17-6 19-4 19-2 18v25l2 19 6 25 6 17 12 23 14 21 9 10 7 8 12 11 18 13 14 8 16 8 19 7 26 6 18 2h29l19-3 23-6 20-8 21-11 19-13 14-12 10-10 8-10 10-14 10-18 8-19 5-16 3-15 3-24v-20l-3-26-4-19-7-19-11-23-10-16-11-14-11-12-12-11-17-12-16-9-19-9-22-7-22-4-12-1z" />
                            <path transform="translate(587,618)" d="m0 0h863l16 2 10 3 11 6 9 8 10 14 6 12 3 11v13l-3 12-8 16-9 12-8 8-12 6-12 3-22 2-734 1h-108l-14-1-15-4-11-8-8-7-8-10-8-16-3-11v-17l4-14 6-10 6-8 10-10 11-8 11-4z" />
                            <path transform="translate(598,959)" d="m0 0h328l29 2 11 4 11 7 9 9 9 13 6 13 2 8v16l-4 13-7 14-7 9-7 7-8 6-13 4-16 2-33 1h-313l-18-2-10-4-11-8-10-10-7-11-5-12-2-9v-17l6-18 7-11 5-6 11-9 11-7 4-2 6-1z" />
                        </svg>
                        </button>
                    </>
            }
        </div>
    )
});


export const ReviewReviews = () => {
    const dispatch = useDispatch();
    const { isVisible,
        isLoadingRating,
        prodDate, reviewReviewsVsbl } = useSelector(st => st.displayRating)
    const reviewRed = useRef();

    const handelCligkOur = (e) => {
        if (reviewReviewsVsbl == true) {
            if (!reviewRed.current.contains(e.target)) {
                dispatch(hideReviewa());
            }
        }
    }

    const ReviewAr = ({ rev }) => {
        const [isLikeR, setisLikeR] = useState(false)

        return (
            <div className="c-s-s p10 mb20 wmia  hoverEff1 pl20">
                <h2>{rev.reviewerName}</h2>
                <span className='r-b-c wmia'>
                    <p className="mt10 ml20 r-s-c">{rev.comment} <svg version="1.1" viewBox="0 0 2048 2048" className='ml20 w20 h20' xmlns="http://www.w3.org/2000/svg">
                        <path transform="translate(1017,44)" d="m0 0h10l18 2 18 5 17 8 12 9 8 7 9 11 10 15 13 26 11 26 12 28 19 45 17 40 24 56 11 26 12 28 16 37 19 45 30 70 19 45 13 30 14 33 7 14 3 4 10 2 100 10 130 11 199 18 125 12 32 4 17 4 13 5 14 8 11 9 10 10 8 11 11 18 7 14 2 7v50l-2 4-4 4-9 17-9 12-9 10-7 7-7 8-8 7-8 8-8 7-10 9-11 9-15 14-11 9-15 13-11 10-8 7-14 12-7 7-11 9-11 10-11 9-11 10-8 7-10 9-11 9-15 13-12 11-8 7-10 9-8 7-10 9-8 7-11 9-12 11-11 9-12 11-11 9-12 11-8 7-12 11-11 9-9 9-11 9-9 8-14 11-14 12-3 3h-2l-2 4-1 6 3 17 8 36 13 59 11 49 13 57 11 48 12 54 12 53 13 57 11 48 13 57 6 27 4 27 1 10v11l-2 17-6 16-9 16-9 12-15 15-10 7-14 7-21 6-15 3h-19l-18-4-16-6-20-10-24-14-32-19-23-14-45-27-28-17-32-19-28-17-55-33-32-19-23-14-30-18-28-17-20-12-27-16-21-12-25-15-18-11-6-4-6 1-24 14-28 17-39 23-28 17-45 27-28 17-29 17-20 12-22 13-30 18-29 17-16 10-24 14-28 17-20 12-26 15-25 15-28 17-24 13-16 6-25 6-13 1-20-3-17-5-19-10-12-11-10-10-10-15-9-19-5-15-1-7v-22l4-28 9-41 16-71 15-66 9-39 17-75 20-88 16-71 13-57 5-23 7-30v-8l-7-9-13-11-8-7-28-24-10-9-8-7-10-9-11-9-7-7-8-7-10-9-11-9-13-12-11-9-14-13-11-9-12-11-11-9-11-10-8-7-15-13-10-9-8-7-10-9-11-9-12-11-8-7-14-12-10-9-11-9-10-9-11-9-14-13-8-7-20-18-12-11-8-7-10-9-11-9-22-22-8-11-14-25-2-3v-56l11-19 6-11 14-17 11-11 15-10 13-6 13-4 25-4 129-12 124-11 93-9 69-6 108-10 44-4 12-3 4-4 8-15 15-37 17-39 15-35 12-29 8-19 5-11 12-28 7-17 5-11 13-31 19-44 11-26 48-112 12-29 12-28 11-25 10-19 13-17 7-7 12-9 14-8 12-5 11-3z" fill="#FEBF11" />
                    </svg><strong className='ml5'>{rev.rating}</strong>
                    </p>
                    <button onClick={() => setisLikeR(!isLikeR)}>
                        {
                            isLikeR ?
                                <svg version="1.1" className='w20 activeCmp h20' viewBox="0 0 2048 2048" xmlns="http://www.w3.org/2000/svg">
                                    <path transform="translate(1154)" d="m0 0h108v4h-14l-2 1 28 11 16 8 15 9 13 11 6 5 7 8 10 13 9 15 8 16 10 27 6 25 4 30 4 57 2 36v37l-2 29-7 71-5 51-6 40-7 39-6 36-7 39-10 56-8 43-1 4h421l34 1 28 2 16 3 20 7 21 11 24 16 19 14 12 11 12 13 16 24 9 15 9 17 10 28 4 20 1 11v27l-3 24-5 24-9 27-10 19-5 7-1 4h2l1 4-3 1 5 7 13 10 13 11 9 8 11 14 10 13 10 16 9 17 11 28 4 12 3 3-1 3v12l3-1v89h-2l-1-5-4-3-1 5-8 22-8 17-14 23-11 15-11 13-10 10-11 9-10 7-9 5v3h-2l5 12 10 19 8 20 6 22 5 29 1 12v16l-3 25-4 20-7 20-9 20-10 18-12 17-8 10-11 12-8 8-14 11-26 16-4 4 1 5 15 35 5 16 6 30 3 20v12l-5 34-4 17-7 19-8 16-10 16-10 15-8 11-11 13-11 9-10 8-24 16-22 12-25 10-12 4-1 2h-2l-1 3-1-2-11 1-1 1h-645l-1-2-35-4-66-10-76-10-50-9-42-8-66-14-54-14-50-15-49-15-24-8-6-4-1-6-1-25v-1054l2-7 11-12 14-10 16-12 15-12 11-9 12-11 11-9 12-11 11-9 17-16 8-7 15-14h2v-2l11-9 16-16 8-7 14-14 7-8 9-10 1-2h2l2-4 11-12 7-8 13-16 10-11 9-11 8-10h2l2-4 8-11 6-8 10-15 13-21 8-14 8-16 11-23 15-36 15-39 23-61 11-29 14-37 16-42 12-31 11-28 11-26 11-24 8-15 8-12 9-12 11-12 7-8 10-9h2v-2l12-9 16-9 21-10 13-5zm87 3m705 1043 1 3z" />
                                    <path transform="translate(142,899)" d="m0 0h228l51 1 5 2 1 1e3 -1 3-7 2h-358l-16-2-11-4-8-5-7-7-18-22-1-1v-931l12-13 6-7h2v-2l10-8 12-6 3-1 15-1z" />
                                    <path transform="translate(1007,2045)" d="m0 0 11 1 1 2h-16l1-2z" />
                                    <path transform="translate(1712,2047)" d="m0 0h5v1h-5z" />
                                    <path transform="translate(2046,1173)" d="m0 0h2l-1 2z" />
                                    <path transform="translate(2046,1295)" d="m0 0 2 1z" />
                                    <path transform="translate(1717,2046)" d="m0 0" />
                                    <path transform="translate(1e3 2046)" d="m0 0" />
                                    <path transform="translate(1,1871)" d="m0 0" />
                                    <path transform="translate(1953,1413)" d="m0 0" />
                                    <path transform="translate(2045,1197)" d="m0 0" />
                                </svg>
                                :
                                <svg className='w20 activeCmp h20' version="1.1" viewBox="0 0 2048 2048" width="128" height="128" xmlns="http://www.w3.org/2000/svg">
                                    <path transform="translate(1083)" d="m0 0h75l1 2 48 14 16 7 21 10 20 12 12 9 11 9 5 4v2l4 2 20 20 11 14 10 15 14 27 12 28 6 19 5 24 7 49 1 9v17l-4 48-4 38-5 30-17 69-11 41-11 42-13 48-8 30-10 41-5 27-8 54-1 5 24-3 48-9 51-9 36-5 74-8 41-3 39-1h38l29 1 36 3 36 5 31 6 23 6 29 10 21 9 16 8 15 9 21 14 13 10 13 12 11 11 11 14 12 18 11 23 9 29 6 22 2 13 1 15v19l-2 29-3 15-7 22-4 16v8l4 11 13 20 9 15 9 20 7 19 6 24 4 26 1 13v14l-3 30-3 17-4 15-5 13-10 19-9 16-12 20-11 23-1 3v10l4 14 12 57 1 14-2 35-8 36-5 17-6 15-15 31-11 19-9 12-10 12h-2l-2 4-15 16-8 10-5 11 2 46-1 19-3 17-6 24-6 18-8 18-8 16-7 11-21 28-13 16-11 11-14 11-18 14-12 8-20 12-17 9-27 12-29 11-29 9-46 12-38 8-41 7-23 3-2 2h-490l1-2 16-1h26l41 1 14-1-1-2-4-1-76-3-63-4-120-10-153-15-84-9-26-2-6 2-7 9-12 6-19 6-22 4-24 2-48 2h-180l-39-2-30-3-23-5-16-5-19-9-12-8-16-13-10-9-7-8-11-14-12-19-6-12-5-15-5-20-4-30-1-13-1-27v-649l2-24 4-26 6-21 11-25 12-20 11-14 7-8 16-14 18-12 16-9 17-7 19-5 23-4 10-1 28-1h206l38 1 35 3 19 5 18 8 5 3 3-1 7-11 6-12 6-10 14-25 7-10 8-11 10-13 9-11 8-9 7-8 12-13 45-45 9-11 10-13 12-16 8-11 6-8 10-15 17-28 13-23 9-15 9-16 12-21 9-16 12-21 10-18 9-16 11-23 15-31 15-33 9-19 26-56 12-27 9-21 32-80 12-31 3-14v-31l-1-21v-37l3-23 5-23 6-18 11-24 8-14 9-11 7-7 15-11 16-9zm32 116-3 5-5 26-2 22 1 24 2 25v23l-2 15-6 24-8 21-9 26-10 24-12 29-24 56-11 25-13 29-11 25-14 31-9 20-16 33-8 16-11 20-9 19-9 16-11 20-12 21-15 26-10 17-7 12-9 14-10 16-14 20-6 8-13 18-7 10-12 16-8 10-13 15-7 7-7 8-14 14v2l-3 1v2l-4 2-7 7-7 8-9 9-9 11-8 9-14 19-10 15-9 16-11 21-13 32-7 19-1 5v19l6 26v647l-1 55v44l55 6 96 9 110 9 88 6 86 4 40 1 79 1 128 3h108l70-7 37-5 28-5 32-8 33-11 27-12 24-13 15-10 12-9 6-5v-2l4-2v-2l4-2 9-10 6-8 6-10 7-14 5-14 4-17 2-15v-25l-3-17-2-17v-22l3-10 6-10 11-14 9-10 13-12 8-7 12-12v-2h2l9-13 8-13 11-24 4-14 4-24v-23l-5-25-7-28-9-27-5-18v-6l6-16 6-11 10-16 7-10 8-11 10-14 6-9 5-14 6-25 3-18v-12l-2-16-7-21-11-23-11-16-12-17-11-17-8-14-1-4v-12l5-20 9-21 4-11 6-18 2-10v-40l-3-15-7-19-6-11-12-14-10-9-15-10-14-8-19-8-15-5-21-5-31-5-43-5-42-3h-35l-59 3-44 4-49 7-44 7-74 14-53 9-14 1-10-2-12-5-13-7-9-7-3-3h-2l-2-4-6-7-9-14-6-13-5-17-3-19-3-32v-24l5-38 10-57 7-30 30-104 8-28 16-61 8-37 7-49 2-20v-31l-4-39-4-18-6-17-9-20-9-14-8-10-14-14-14-10-16-8-24-8-23-4-9-1zm-847 977-64 1-15 2-12 4-11 7-10 12-7 14-3 10-2 29-1 183v423l1 68 2 18 3 12 7 13 9 10 14 9 7 3 12 2 16 1h246l21-2 12-4 11-6 10-9 7-10 4-8 2-8 1-10 1-42v-623l-1-42-3-16-7-14-9-11-7-6-12-6-9-2-12-1-84-1z" />
                                    <path transform="translate(143,1211)" d="m0 0h1v608h-1l-1-32-1-64v-309l1-152z" fill="#F7F7F8" />
                                    <path transform="translate(1173)" d="m0 0h14l-3 2-4 1-7-2z" />
                                    <path transform="translate(1144,120)" d="m0 0" />
                                </svg>

                        }
                    </button>
                </span>
            </div>
        )
    }

    return ReactDom.createPortal(
        <div className="backendMer" onClick={handelCligkOur} >
            <div className="w500 activeCmp bg-l br10 p20" ref={reviewRed} style={{ position: "relative", }} >
                <button className='btnClose' onClick={() => dispatch(hideReviewa())}><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" /></svg></button>
                {
                    prodDate.reviews.map((rev, index) =>
                        <ReviewAr rev={rev} key={index} />
                    )
                }

            </div>
        </div>, document.getElementById("portlas")
    )
}


export const getProd = createAsyncThunk(
    "displayRatingSlice/getProd",
    async (prod_id, { RejectedWithValue }) => {
        try {


            const response = await api.get("/products/" + prod_id);
            return response.data
        } catch (error) {
            console.log(error.message);

            return RejectedWithValue(error.message)
        }
    }
)


const displayRatingSlice = createSlice({
    name: "displayRatingSlice",
    initialState: {
        isVisible: true,
        isLoadingRating: true,
        prodDate: [],
        reviewReviewsVsbl: false
    },
    reducers: {
        showRatingDisplay: (state) => {
            state.isVisible = true;
        },
        showReviewa: (state) => {
            state.reviewReviewsVsbl = true
        },
        hideReviewa: (state) => {
            state.reviewReviewsVsbl = false
        }
    }
    , extraReducers: (builder) => {
        builder
            .addCase(getProd.pending, (state) => {
                state.isLoadingRating = true
                state.prodDate = {}

            })
            .addCase(getProd.fulfilled, (state, action) => {
                state.isLoadingRating = false;
                state.prodDate = action.payload
            })
            .addCase(getProd.rejected, (state) => state.isLoadingRating = false)
    }
})

export const { showRatingDisplay, showReviewa, hideReviewa } = displayRatingSlice.actions;
export default displayRatingSlice.reducer;