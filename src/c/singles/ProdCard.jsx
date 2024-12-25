import React, { useState, useEffect, useRef } from 'react'
import "../../css/mainShopping.css"
import { useDispatch, useSelector } from 'react-redux';
import { DispayRatingCmp } from './rattingCmp';
import { getViewProd } from "../shopping/viewProd"
import { showViewProd, hideViewProd } from '../shopping/viewProd';
import { getProd } from './rattingCmp';
import { BTN_ADD_TO_CART } from '../../slices/btnAddToCart';
export const RattingCmp = ({ product }) => {
    const dispatch = useDispatch();
    const [displayRatingVSBL, setdisplayRatingVSBL] = useState(false);
    const rattingParef = useRef();
    function handelClickOw() {
        setdisplayRatingVSBL(true);
        dispatch(getProd(product.id));
        const clfg = (e) => {
            if (!rattingParef.current.contains(e.target)) {
                document.removeEventListener("mousedown", clfg)
                setdisplayRatingVSBL(false);
            }
        }
        document.addEventListener("mousedown", clfg)
        document.onscroll = () => {
            document.removeEventListener("mousedown", clfg)
            setdisplayRatingVSBL(false);
        }
    }
    return (
        <div id={product.id} style={{ position: "relative" }} className='mt5 r-c-c'>

            <h2 onClick={handelClickOw} >{product.rating}</h2>
            <svg onClick={handelClickOw} className='ml10' version="1.1" viewBox="0 0 2048 2048" xmlns="http://www.w3.org/2000/svg">
                <path transform="translate(1017,44)" d="m0 0h10l18 2 18 5 17 8 12 9 8 7 9 11 10 15 13 26 11 26 12 28 19 45 17 40 24 56 11 26 12 28 16 37 19 45 30 70 19 45 13 30 14 33 7 14 3 4 10 2 100 10 130 11 199 18 125 12 32 4 17 4 13 5 14 8 11 9 10 10 8 11 11 18 7 14 2 7v50l-2 4-4 4-9 17-9 12-9 10-7 7-7 8-8 7-8 8-8 7-10 9-11 9-15 14-11 9-15 13-11 10-8 7-14 12-7 7-11 9-11 10-11 9-11 10-8 7-10 9-11 9-15 13-12 11-8 7-10 9-8 7-10 9-8 7-11 9-12 11-11 9-12 11-11 9-12 11-8 7-12 11-11 9-9 9-11 9-9 8-14 11-14 12-3 3h-2l-2 4-1 6 3 17 8 36 13 59 11 49 13 57 11 48 12 54 12 53 13 57 11 48 13 57 6 27 4 27 1 10v11l-2 17-6 16-9 16-9 12-15 15-10 7-14 7-21 6-15 3h-19l-18-4-16-6-20-10-24-14-32-19-23-14-45-27-28-17-32-19-28-17-55-33-32-19-23-14-30-18-28-17-20-12-27-16-21-12-25-15-18-11-6-4-6 1-24 14-28 17-39 23-28 17-45 27-28 17-29 17-20 12-22 13-30 18-29 17-16 10-24 14-28 17-20 12-26 15-25 15-28 17-24 13-16 6-25 6-13 1-20-3-17-5-19-10-12-11-10-10-10-15-9-19-5-15-1-7v-22l4-28 9-41 16-71 15-66 9-39 17-75 20-88 16-71 13-57 5-23 7-30v-8l-7-9-13-11-8-7-28-24-10-9-8-7-10-9-11-9-7-7-8-7-10-9-11-9-13-12-11-9-14-13-11-9-12-11-11-9-11-10-8-7-15-13-10-9-8-7-10-9-11-9-12-11-8-7-14-12-10-9-11-9-10-9-11-9-14-13-8-7-20-18-12-11-8-7-10-9-11-9-22-22-8-11-14-25-2-3v-56l11-19 6-11 14-17 11-11 15-10 13-6 13-4 25-4 129-12 124-11 93-9 69-6 108-10 44-4 12-3 4-4 8-15 15-37 17-39 15-35 12-29 8-19 5-11 12-28 7-17 5-11 13-31 19-44 11-26 48-112 12-29 12-28 11-25 10-19 13-17 7-7 12-9 14-8 12-5 11-3z" fill="#FEBF11" />
            </svg>
            <svg onClick={handelClickOw} className='ml20 w20 h20' xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z" /></svg>
            {displayRatingVSBL && <DispayRatingCmp ref={rattingParef} />}
        </div>
    )
}
const ProductCard = React.forwardRef(({ product }, ref) => {
    const dispatch = useDispatch();
    const handelGoToViewProd = () => {
        dispatch(showViewProd())
        dispatch(getViewProd(product.id))
    };

    return (
        <>
            <div ref={ref} id={product.id} className="cntProd w300  c-p-s br10 p10 ml10 mt50 bg-l">
                <img onClick={handelGoToViewProd} src={product.images[0]} loading='lazy' alt="" />
                <div className="cntOtherProdsInfo c-s-s">

                    <h1 onClick={handelGoToViewProd} className='mt10' style={{ cursor: "pointer" }}>{product.title}</h1>
                    <p onClick={handelGoToViewProd} className="mt10 mb10">
                        {product.description}
                    </p>
                    <span className='mt5 '>Availability Status : <strong> {product.availabilityStatus}</strong></span>
                    <span className='mt5 mb10'>Discount Percentage : <strong>{product.discountPercentage} %</strong></span>
                    <RattingCmp product={product} />
                    <span className='r-s-c mt20'>
                        <h2 className="c-r">- {product.discountPercentage} %</h2>
                        <h1 className=' ml10'>$ {product.price}</h1>
                    </span>
                    <BTN_ADD_TO_CART prod_id={product.id} style={{ padding: "5px", marginTop: "30px" }} />
                </div>
            </div>
        </>
    )
})
export default ProductCard