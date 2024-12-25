import { useState, useEffect, useRef } from 'react'
import "../../css/mainShopping.css"
import { useDispatch, useSelector } from 'react-redux';


const ProductCard2 = ({ product }) => {
    const dispatch = useDispatch();

    return (
        <>
            <div className="cntProd w300  c-p-s br10 p10 ml10 mt50 bg-l">
                <img src={product.images[0]} alt="" />
                <div className="cntOtherProdsInfo c-s-s">
                    <h1 className='mt10' style={{ cursor: "pointer" }}>{product.title}</h1>
                    <p className="mt10 mb20">
                        {product.description}
                    </p>
                    <span className='mt5'>Availability Status : <strong> {product.availabilityStatus}</strong></span>
                    <span className='mt5'>Discount Percentage : <strong>{product.discountPercentage} %</strong></span>

                    <span className='r-s-c mt20'>
                        <h2 className="c-r">- {product.discountPercentage} %</h2>
                        <h1 className=' ml10'>$ {product.price}</h1>
                    </span>
                </div>
            </div>
        </>
    )
}
export default ProductCard2