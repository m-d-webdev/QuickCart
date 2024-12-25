import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { showViewProd, getViewProd } from '../shopping/viewProd';
import "../../css/header.css"
import { api } from '../../slices/fetchProdSlice'
import { useNavigate } from 'react-router-dom';
import GoodLoader from './goodLoader';
export const getRealNumber = (p) => {
    if (p.toString().indexOf(".") != -1) {
        return p.toString().substring(0, p.toString().indexOf(".") + 3)
    } else {
        return p
    }
}
const sou_cart = React.forwardRef(({ CloseCart }, ref) => {
    const dispatch = useDispatch();
    const [listCard, setlistCard] = useState([]);
    const [isLodingProds, setisLodingProds] = useState(true)
    const { userCart, isLoaing } = useSelector(s => s.btnAddToCart)
    const navigate = useNavigate();

    const getProdrestData = async () => {
        setisLodingProds(true);
        for (var i = 0; i < userCart.length; i++) {
            let prd_q = userCart[i].quantity
            await api.get('/products/' + userCart[i].prodId + "?select=title,price,images").then((res) => {
                setlistCard(cur => ([...cur, { ...res.data, quantity: prd_q }]))
            })
            if (i === userCart.length - 1) {
                setisLodingProds(false)
            }

        }
    }

    useEffect(() => {
        getProdrestData()
    }, []);

    const goToViewPrd = (id) => {
        CloseCart();
        dispatch(showViewProd())
        dispatch(getViewProd(id))
    }

    const DispayCartItem = ({ img, qn, price }) => {
        return (
            <div className="br10 c-c-c p20 w400  psr bg-l cntDisplayCartItem" style={{ top: "0" }}>
                <img src={img} alt="" />
                <span className="r-s-c mt20 wmia">Price of one item :<h1 className='ml15'>{price} $</h1></span>
                <span className="r-s-c mt10 wmia">Quantity : <h1 className='ml15'>{qn} item</h1></span>
                <span className="r-s-c mt10 wmia">Total price : <h1 className='ml15'>{qn * price} $</h1></span>
            </div>
        )
    }

    const CLoasdfjasdjsidj = () => {
        CloseCart();
    }

    const GotoCart = () => {
        CloseCart();
        navigate('/Cart')
    }
    return (
        <div  className="c-s-s p10 psr souCart bg-l w400  br5">
            <button className='btnClose  BtnCloseSouCat' style={{
                display: "none"
            }} onClick={CLoasdfjasdjsidj} ><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" /></svg></button>
            {isLoaing ? <div className="spinner"></div> :
                <div ref={ref} className='wmia' >
                    <div className="wmia r-w"><h2>Cart </h2>
                        <h2 className='mr5'>{userCart.length} Items</h2>
                    </div>

                    {
                        isLodingProds ?
                            <GoodLoader />

                            :
                            <>
                                <span className='mb20 r-b-c wmia mt10'>
                                    <h2>Subtotal  : {getRealNumber(listCard.reduce((cu, elm) => cu + (elm.price * elm.quantity), 0))} $</h2>
                                    <button onClick={GotoCart} className='tbnGoToCart r-c-c'>Go to cart</button>
                                </span>
                                <div className="listCardItems wmia c-s-s mt10 pl10">
                                    {listCard.length > 0 ?
                                        listCard.map(elm => <div key={elm.id} className=' p10 mt15 wmia hoverEff1 spPrded ' onClick={() => goToViewPrd(elm.id)}><DispayCartItem img={elm.images[0]} qn={elm.quantity} price={elm.price} /><p>{elm.title}</p> <strong className='r-c-c'>qty : {elm.quantity} </strong></div>)
                                        :
                                        <h1 className="logo mrauto mt50">Cart empty</h1>
                                    }
                                </div>
                            </>
                    }
                </div>
            }

        </div>
    )
})

export default sou_cart
