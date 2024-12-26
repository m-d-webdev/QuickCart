import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
// import { showViewProd, getViewProd } from './viewProd';
import { api, fetchCategory } from '../../slices/fetchProdSlice'
import { getViewProd, showViewProd, ViewProd } from './viewProd'
import { db, auth } from '../../config/fireBase'
import { getDoc, doc, updateDoc, setDoc, } from 'firebase/firestore'
import { finishAdding, increaseQuantit, decreaseQuantit, rmoveItemFromCart } from '../../slices/btnAddToCart'
import { getRealNumber } from '../singles/sou_cart'
import '../../css/card.css'
import ProductCard from '../singles/ProdCard'
import { BTN_OPEN_ADDRESS } from '../../slices/addressManagement'
import { BTN_MAN_SAVE_PRODS } from '../../slices/saveProdsSlice'
import { GetMoreOfSame, setOrinOriginaleTtitle } from '../../slices/MoreOfSameMan'
import { BTN_MAN_ADD_TO_WISH_LIST } from '../../slices/WishListMan'
import { startOrder } from '../../slices/OrdersMan'
import GoodLoader from '../singles/goodLoader'
import { showLogin } from '../../slices/loginSlice'
function cart() {
    const dispatch = useDispatch();
    const [listCard, setlistCard] = useState([]);
    const { isLoggedIn } = useSelector(st => st.authe)
    const [isLodingProds, setisLodingProds] = useState(true)
    const { userCart, isLoaing, adderNewAddres } = useSelector(s => s.btnAddToCart)
    const viewProdVsbl = useSelector(st => st.viewProduct.isVisible)
    const LisstCardItemsRef = useRef(null);
    const MoreOFSamaeRef = useRef(null);
    const ContainerCartRef = useRef(null);
    const IsUsingpc = window.innerWidth > 800
    const getProdRestData = async () => {
        if (userCart.length == 0) {
            setisLodingProds(false)
            return
        }
        for (var i = 0; i < userCart.length; i++) {
            let prd_q = userCart[i].quantity
            await api.get('/products/' + userCart[i].prodId + "?select=title,price,images,category").then((res) => {
                setlistCard(cur => ([...cur, { ...res.data, quantity: prd_q }]))
            })
            if (i === userCart.length - 1) {
                setisLodingProds(false)
            }
        }
    }

    useEffect(() => {
        ContainerCartRef.current.scrollIntoView({
            behavior: "smooth",
            bloc: "top"
        })
    }, [])

    useEffect(() => {
        if (!isLoaing) {
            setisLodingProds(true);
            getProdRestData()
        }
    }, [isLoaing]);

    useEffect(() => {
        if (adderNewAddres) {
            let newsItems = userCart.filter(prod => !listCard.some(el => el.id === prod.prodId))
            if (newsItems.length > 0) {
                for (var i = 0; i < newsItems.length; i++) {
                    let prd_q = newsItems[i].quantity
                    api.get('/products/' + newsItems[i].prodId + "?select=title,price,images,category").then((res) => {
                        setlistCard(cur => ([...cur, { ...res.data, quantity: prd_q }]))
                    });

                    if (i === newsItems.length - 1) {
                        // setisLodingProds(false)
                        dispatch(finishAdding());
                    }
                }
                setTimeout(() => {
                    LisstCardItemsRef.current.scrollIntoView({
                        behavior: "smooth",
                        block: "end"
                    })
                }, 300)
            }


        }

        setlistCard(
            listCard.filter(prod => userCart.some(el => el.prodId === prod.id))
        )
        // setisLodingProds(false);
    }, [userCart])



    const CartItem = ({ data }) => {
        const { isLoadingMoreOfSame, moreOfSameData, orginaleProdTite } = useSelector(st => st.MoreOfSame)
        const [viewMoreLikeThisVSBL, setviewMoreLikeThisVSBL] = useState(false)
        const dispatch = useDispatch();
        const [RemovingLoad, setRemovingLoad] = useState(false)
        const [idLoading2, setidLoading2] = useState(false)
        const getProdLikeThis = () => {
            setviewMoreLikeThisVSBL(true);
            dispatch(GetMoreOfSame(data.category));
        }
        useEffect(() => {
            MoreOFSamaeRef.current?.scrollIntoView({
                behavior: "smooth",
                bloc: "end"
            })
        }, [moreOfSameData])
        const goToViewPrd = () => {
            dispatch(showViewProd());
            dispatch(getViewProd(data.id))
        };
        const handelIncreaseQuantity = async () => {
            if (!idLoading2) {
                setidLoading2(true);
                if (isLoggedIn) {
                    await getDoc(doc(db, "users", localStorage.getItem("userId"))).then(async (res) => {
                        let newCart = res.data().cart.map(elm => elm.prodId === data.id ? { ...elm, quantity: elm.quantity + 1 } : elm)
                        await updateDoc(
                            doc(db, "users", localStorage.getItem("userId")), { cart: newCart }
                        ).then(() => {
                            dispatch(increaseQuantit(data.id));
                            setidLoading2(false);
                        })
                    })
                } else {
                    dispatch(increaseQuantit(data.id));
                    setidLoading2(false);

                }
            }
        };
        const handelDecreaseQuantity = async () => {
            if (!idLoading2) {
                setidLoading2(true);
                if (isLoggedIn) {
                    await getDoc(doc(db, "users", localStorage.getItem("userId"))).then(async (res) => {
                        let newCart = res.data().cart.map(elm => elm.prodId === data.id ? { ...elm, quantity: elm.quantity - 1 } : elm)
                        await updateDoc(
                            doc(db, "users", localStorage.getItem("userId")), { cart: newCart }
                        ).then(() => {
                            dispatch(decreaseQuantit(data.id));
                            setidLoading2(false);
                        })
                    })
                } else {
                    dispatch(decreaseQuantit(data.id));
                    setidLoading2(false);
                }

            }
        };
        const handelRemoveQuantity = async () => {
            setRemovingLoad(true)
            if (!idLoading2) {
                if (isLoggedIn) {
                    await getDoc(doc(db, "users", localStorage.getItem("userId"))).then(async (res) => {
                        let newCart = res.data().cart.filter(elm => elm.prodId != data.id)
                        await updateDoc(
                            doc(db, "users", localStorage.getItem("userId")), { cart: newCart }
                        ).then(() => {
                            dispatch(rmoveItemFromCart(data.id));
                            setRemovingLoad(false)
                        })
                    })
                } else {
                    dispatch(rmoveItemFromCart(data.id));
                    setRemovingLoad(false)
                }

            }
        };

        if (IsUsingpc) {
            return (
                <>
                    <div className="prodCartElem mb20 wmia psr  r-s-s p15">
                        <div className="c-c-c cntProdImg  w300" onClick={goToViewPrd}>
                            <img src={data.images[0]} alt="" />
                        </div>


                        {
                            RemovingLoad ? <GoodLoader /> :
                                <>
                                    <div className="c-s-s ml15 wmia">
                                        <h1 className="" style={{ cursor: "pointer" }} onClick={goToViewPrd}>{data.title}</h1>
                                        <h2 className='mt10' style={{ fontSize: "17px" }}>$ {data.price}</h2>
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
                                            <button className='btnIncreseQuantity mr15 tbnsRegl ' onClick={handelIncreaseQuantity}>
                                                {
                                                    idLoading2 ? <div className="spinner2"></div> :
                                                        <>
                                                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" /></svg>
                                                        </>
                                                }
                                            </button>
                                            <h1 className='ml10 mr10'> {
                                                userCart.filter(p => p.prodId == data.id)[0]?.quantity
                                            }</h1>
                                            {
                                                userCart.filter(p => p.prodId == data.id)[0]?.quantity > 1 ?
                                                    <button className='btnDeccreseQuantity ml15 tbnsRegl ' onClick={handelDecreaseQuantity}>
                                                        {
                                                            idLoading2 ? <div className="spinner2"></div> :
                                                                <>
                                                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M200-440v-80h560v80H200Z" /></svg>
                                                                </>
                                                        }
                                                    </button>
                                                    :
                                                    <button className='btnDeleteFromCart ml15 tbnsRegl ' onClick={handelRemoveQuantity}>
                                                        {
                                                            idLoading2 ? <div className="spinner2"></div> :
                                                                <>
                                                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" /></svg>
                                                                </>
                                                        }
                                                    </button>
                                            }

                                        </span>
                                        <span className="r-c-c mt20">
                                            Total price times quantity :
                                            <h1 className='ml10' style={{ fontSize: "22px" }}> $ {data.price * userCart.filter(p => p.prodId == data.id)[0]?.quantity}</h1>
                                        </span>
                                        <button className='br br20 w200 mt50' onClick={getProdLikeThis}>
                                            <svg version="1.1" viewBox="0 0 2048 2048" className='ml10' xmlns="http://www.w3.org/2000/svg">
                                                <path transform="translate(1202)" d="m0 0h7v2l3 1v-3h171l7 1v2l27 5 44 9 32 8 42 12 28 10 33 13 26 12 19 9 16 9 11 6 22 13 17 11 18 12 19 14 17 13 13 10 10 9 11 9 13 12 16 15 21 21 7 8 12 13 9 11 12 14 10 13 14 19 18 27 14 22 12 21 14 27 11 22 13 30 14 38 9 27 14 50 8 37 8 41 2 12h2v201h-2l-1-9v-2l-3-1 1 3-3 2-10 49-8 32-11 37-8 24-12 31-13 30-20 40-9 15-6 11-15 24-7 10-7 11-10 14-10 13-11 14-22 26-9 11-43 43-8 7-11 10-11 9-15 12-13 10-16 12-20 14-11 7-21 13-21 12-28 15-32 15-32 13-24 9-37 12-28 7-4 2-4 13-5 20-12 36-9 25-13 31-8 17-16 32-13 23-9 16-15 23-10 15-10 14-14 18-14 17-11 14-12 13-7 8-42 42-8 6-5 5-10 9-14 11-13 10-16 12-15 11-22 14-24 15-26 14-19 10-17 8-15 7-26 11-40 14-30 9-50 13-43 9-36 6-1 2h-159l1-2-42-9-66-15-42-12-32-11-28-11-20-9-25-12-23-12-24-14-21-13-25-17-17-13-16-12-11-9-13-11-20-18-7-7-8-7-19-19-7-8-7-7-7-8-9-10-22-28-15-20-14-20-9-14-11-18-11-19-12-22-14-28-11-25-10-25-13-38-12-44-6-24-8-41v-6l-2-1v-6l-2-1-1-12h-2l-1-3v-180l3-1 10-50 9-40 10-37 10-30 14-37 12-27 21-42 16-28 10-16 24-36 14-18 9-12 9-11 8-10 13-15 11-12 7-8 18-18h2l2-4 12-11 8-7 14-12 13-10 15-12 19-14 18-13 18-11 14-9 29-17 23-12 23-11 25-11 41-15 21-7 41-11 5-3 10-36 8-24 10-28 10-24 9-21 20-40 13-23 15-25 20-30 13-18 11-14 13-16 11-14 10-11 7-8 5-6h2l2-4 24-24 8-7 11-10 8-7 14-11 11-9 32-24 15-10 23-15 20-12 21-12 31-16 29-13 28-11 38-13 27-8 51-12 41-8 7-1zm68 120-43 3-36 5-38 8-31 8-36 12-21 8-24 10-30 15-24 13-23 14-17 11-18 13-28 22-15 13-8 7-16 15-20 20-7 8-7 7-7 8-13 16-13 18-14 19-7 11-6 9-13 22-9 16-12 23-13 28-14 36-3 8v4h47l66 4 42 5 41 7 39 9 34 10 21 7 32 12 30 13 16 7 42 22 28 17 21 13 12 9 14 10 19 14 22 18 12 11 8 7 26 24 19 19 7 8 9 10 7 8 13 16 13 17 15 20 9 13 11 17 12 19 13 23 12 23 15 31 13 32 11 30 10 30 7 26 9 39 6 37 4 31 3 32 2 44v49l14-3 28-11 27-12 19-10 26-14 23-14 12-8 22-15 18-14 16-13 11-9 12-11 8-7 32-32 7-8 9-11 12-14 14-19 13-18 8-12 7-11 10-17 8-14 9-19 8-16 13-30 10-28 8-24 8-30 8-35 5-32 3-29 2-32v-46l-2-31-3-27-6-36-6-29-8-31-12-36-10-27-13-29-16-32-14-24-14-23-14-20-13-17-8-10-7-9h-2l-2-4-9-10-7-8-11-12-22-22-8-7-10-9-25-20-19-14-20-14-26-16-21-12-27-14-23-11-44-17-38-12-33-8-31-6-37-5-44-3zm-552 551-34 2-8 1-2 4v9l-2 22-1 22v45l2 33 2 16 18 1h431l32 1-2-4-11-11-28-22-14-10-12-8-17-11-21-12-28-15-24-11-32-13-28-10-38-11-27-6-37-6-23-3-38-3zm-172 33-26 9-24 10-26 12-27 14-20 12-21 13-20 14-13 10-14 11-13 11-11 9-11 11-8 7-23 23-7 8-10 11-8 10-10 12-8 11-12 17-13 18-9 15-10 17-10 18-9 19-8 16-12 28-10 28-9 28-8 32-8 37-5 37-2 26-1 21v35l2 37 4 36 5 30 9 39 9 32 12 34 11 26 8 18 10 21 10 18 14 24 7 11 8 12 13 18 11 14 13 16 9 11 7 7 7 8 11 12 17 17 8 7 13 12 22 18 16 12 18 13 30 19 21 12 26 14 34 16 28 11 30 10 28 8 30 7 41 7 37 4 41 2h32l31-2 38-5 27-5 39-9 34-10 18-6 35-14 15-7 23-11 23-12 20-12 24-15 18-13 12-9 14-11 28-24 13-12 10-10 4-3v-2l3-1 7-8 8-8 8-10 13-15 10-13 18-24 11-17 17-28 12-22 10-21 8-16 9-21 8-22 3-11v-3l-33 1-60-2-28-2-54-8-33-6-38-10-28-8-25-9-26-10-26-11-27-13-16-8-24-13-20-12-27-18-19-13-15-12-13-10-11-9-14-12-34-32-12-12-1-2h-2l-2-4-13-13-9-11-11-12-11-14-15-20-13-18-16-24-11-18-14-24-17-33-17-38-11-28-7-20-8-24-7-25-9-40-6-33-5-33-3-34-1-19-1-56 2-19zm1494 151m-1338 90 3 9 16 40 17 36 12 23 10 18 13 22 7 7 2 1 219 1h210l131-1 1-4-8-20-8-19-10-23-13-28-15-29-10-17-7-10-6-5-239-1zm188 275 1 4 7 7 9 7 10 8 17 13 15 10 22 14 36 20 38 19 36 15 28 10 28 8 29 7 28 5 29 4 34 3 16 1h57l36-2 5-3 1-6 3-52v-52l-2-34-1-5h-431l-31-1z" />
                                                <path transform="translate(1407)" d="m0 0h18l-3 2-5 1-9-1z" />
                                                <path transform="translate(628,2045)" d="m0 0h6l2 3h-9z" />
                                                <path transform="translate(863,2047)" d="m0 0h6v1h-6z" />
                                                <path transform="translate(2047,628)" d="m0 0h1v5h-1z" />
                                                <path transform="translate(1426)" d="m0 0 2 1z" />
                                                <path transform="translate(2047,870)" d="m0 0" />
                                                <path transform="translate(2040,861)" d="m0 0" />
                                                <path transform="translate(2047,625)" d="m0 0" />
                                                <path transform="translate(1397,3)" d="m0 0" />
                                                <path transform="translate(1187)" d="m0 0" />
                                            </svg>See Related
                                        </button>
                                        <div className=" r-s-s CntBtnsManProdCart mt15" style={{ alignSelf: "end" }}>
                                            <BTN_MAN_SAVE_PRODS prodId={data.id} />
                                            <BTN_MAN_ADD_TO_WISH_LIST prodId={data.id} className={'c-b ml20'} />
                                        </div>

                                    </div>
                                    <button className='btnRemoveFinItem ' onClick={handelRemoveQuantity}>
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" /></svg>
                                    </button>
                                </>
                        }
                    </div>
                    {
                        viewMoreLikeThisVSBL &&
                        <>
                            <button onClick={() => setviewMoreLikeThisVSBL(false)} className='mb10 ' style={{ alignSelf: "end" }}><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" /></svg></button>
                            <div className="ctnListItemLikeThis  mb20 r-s-s" ref={MoreOFSamaeRef}>
                                {isLoadingMoreOfSame ? <div className="loader"></div> :
                                    moreOfSameData.map(prod => <ProductCard product={prod} key={prod.id} />)
                                }
                            </div>
                        </>
                    }
                </>

            )
        } else {
            return (
                <>
                    <div className="mb20 wmia psr bg-l p10 br20 r-s-s" style={{
                        paddingTop: "40px"
                    }}>
                        <div className="c-c-c " onClick={goToViewPrd}>
                            <img className='w100' src={data.images[0]} alt="" />
                        </div>


                        {
                            RemovingLoad ? <GoodLoader /> :
                                <>
                                    <div className="c-s-s  ml10 wmia">
                                        <h1 className="" style={{ cursor: "pointer" }} onClick={goToViewPrd}>{data.title}</h1>
                                        <h2 className='mt10' style={{ fontSize: "17px" }}>$ {data.price}</h2>
                                        <span className="cntBtnIncreaseDecrease r-s-c mt10">
                                            <p className='mr10 r-c-c'><svg version="1.1" viewBox="0 0 2048 2048" className='mr10' xmlns="http://www.w3.org/2000/svg">
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
                                            <button className='btnIncreseQuantity mr10 tbnsRegl ' onClick={handelIncreaseQuantity}>
                                                {
                                                    idLoading2 ? <div className="spinner2"></div> :
                                                        <>
                                                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" /></svg>
                                                        </>
                                                }
                                            </button>
                                            <h1 className='ml10 mr10'> {
                                                userCart.filter(p => p.prodId == data.id)[0]?.quantity
                                            }</h1>
                                            {
                                                userCart.filter(p => p.prodId == data.id)[0]?.quantity > 1 ?
                                                    <button className='btnDeccreseQuantity ml10 tbnsRegl ' onClick={handelDecreaseQuantity}>
                                                        {
                                                            idLoading2 ? <div className="spinner2"></div> :
                                                                <>
                                                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M200-440v-80h560v80H200Z" /></svg>
                                                                </>
                                                        }
                                                    </button>
                                                    :
                                                    <button className='btnDeleteFromCart ml10 tbnsRegl ' onClick={handelRemoveQuantity}>
                                                        {
                                                            idLoading2 ? <div className="spinner2"></div> :
                                                                <>
                                                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" /></svg>
                                                                </>
                                                        }
                                                    </button>
                                            }

                                        </span>
                                        <span className="r-c-c mt10">
                                            Total price times quantity :
                                            <h1 className='ml10' style={{ fontSize: "22px" }}> $ {data.price * userCart.filter(p => p.prodId == data.id)[0]?.quantity}</h1>
                                        </span>
                                        <button className='br br20  mt10' onClick={getProdLikeThis}>
                                            <svg version="1.1" viewBox="0 0 2048 2048" className='ml10' xmlns="http://www.w3.org/2000/svg">
                                                <path transform="translate(1202)" d="m0 0h7v2l3 1v-3h171l7 1v2l27 5 44 9 32 8 42 12 28 10 33 13 26 12 19 9 16 9 11 6 22 13 17 11 18 12 19 14 17 13 13 10 10 9 11 9 13 12 16 15 21 21 7 8 12 13 9 11 12 14 10 13 14 19 18 27 14 22 12 21 14 27 11 22 13 30 14 38 9 27 14 50 8 37 8 41 2 12h2v201h-2l-1-9v-2l-3-1 1 3-3 2-10 49-8 32-11 37-8 24-12 31-13 30-20 40-9 15-6 11-15 24-7 10-7 11-10 14-10 13-11 14-22 26-9 11-43 43-8 7-11 10-11 9-15 12-13 10-16 12-20 14-11 7-21 13-21 12-28 15-32 15-32 13-24 9-37 12-28 7-4 2-4 13-5 20-12 36-9 25-13 31-8 17-16 32-13 23-9 16-15 23-10 15-10 14-14 18-14 17-11 14-12 13-7 8-42 42-8 6-5 5-10 9-14 11-13 10-16 12-15 11-22 14-24 15-26 14-19 10-17 8-15 7-26 11-40 14-30 9-50 13-43 9-36 6-1 2h-159l1-2-42-9-66-15-42-12-32-11-28-11-20-9-25-12-23-12-24-14-21-13-25-17-17-13-16-12-11-9-13-11-20-18-7-7-8-7-19-19-7-8-7-7-7-8-9-10-22-28-15-20-14-20-9-14-11-18-11-19-12-22-14-28-11-25-10-25-13-38-12-44-6-24-8-41v-6l-2-1v-6l-2-1-1-12h-2l-1-3v-180l3-1 10-50 9-40 10-37 10-30 14-37 12-27 21-42 16-28 10-16 24-36 14-18 9-12 9-11 8-10 13-15 11-12 7-8 18-18h2l2-4 12-11 8-7 14-12 13-10 15-12 19-14 18-13 18-11 14-9 29-17 23-12 23-11 25-11 41-15 21-7 41-11 5-3 10-36 8-24 10-28 10-24 9-21 20-40 13-23 15-25 20-30 13-18 11-14 13-16 11-14 10-11 7-8 5-6h2l2-4 24-24 8-7 11-10 8-7 14-11 11-9 32-24 15-10 23-15 20-12 21-12 31-16 29-13 28-11 38-13 27-8 51-12 41-8 7-1zm68 120-43 3-36 5-38 8-31 8-36 12-21 8-24 10-30 15-24 13-23 14-17 11-18 13-28 22-15 13-8 7-16 15-20 20-7 8-7 7-7 8-13 16-13 18-14 19-7 11-6 9-13 22-9 16-12 23-13 28-14 36-3 8v4h47l66 4 42 5 41 7 39 9 34 10 21 7 32 12 30 13 16 7 42 22 28 17 21 13 12 9 14 10 19 14 22 18 12 11 8 7 26 24 19 19 7 8 9 10 7 8 13 16 13 17 15 20 9 13 11 17 12 19 13 23 12 23 15 31 13 32 11 30 10 30 7 26 9 39 6 37 4 31 3 32 2 44v49l14-3 28-11 27-12 19-10 26-14 23-14 12-8 22-15 18-14 16-13 11-9 12-11 8-7 32-32 7-8 9-11 12-14 14-19 13-18 8-12 7-11 10-17 8-14 9-19 8-16 13-30 10-28 8-24 8-30 8-35 5-32 3-29 2-32v-46l-2-31-3-27-6-36-6-29-8-31-12-36-10-27-13-29-16-32-14-24-14-23-14-20-13-17-8-10-7-9h-2l-2-4-9-10-7-8-11-12-22-22-8-7-10-9-25-20-19-14-20-14-26-16-21-12-27-14-23-11-44-17-38-12-33-8-31-6-37-5-44-3zm-552 551-34 2-8 1-2 4v9l-2 22-1 22v45l2 33 2 16 18 1h431l32 1-2-4-11-11-28-22-14-10-12-8-17-11-21-12-28-15-24-11-32-13-28-10-38-11-27-6-37-6-23-3-38-3zm-172 33-26 9-24 10-26 12-27 14-20 12-21 13-20 14-13 10-14 11-13 11-11 9-11 11-8 7-23 23-7 8-10 11-8 10-10 12-8 11-12 17-13 18-9 15-10 17-10 18-9 19-8 16-12 28-10 28-9 28-8 32-8 37-5 37-2 26-1 21v35l2 37 4 36 5 30 9 39 9 32 12 34 11 26 8 18 10 21 10 18 14 24 7 11 8 12 13 18 11 14 13 16 9 11 7 7 7 8 11 12 17 17 8 7 13 12 22 18 16 12 18 13 30 19 21 12 26 14 34 16 28 11 30 10 28 8 30 7 41 7 37 4 41 2h32l31-2 38-5 27-5 39-9 34-10 18-6 35-14 15-7 23-11 23-12 20-12 24-15 18-13 12-9 14-11 28-24 13-12 10-10 4-3v-2l3-1 7-8 8-8 8-10 13-15 10-13 18-24 11-17 17-28 12-22 10-21 8-16 9-21 8-22 3-11v-3l-33 1-60-2-28-2-54-8-33-6-38-10-28-8-25-9-26-10-26-11-27-13-16-8-24-13-20-12-27-18-19-13-15-12-13-10-11-9-14-12-34-32-12-12-1-2h-2l-2-4-13-13-9-11-11-12-11-14-15-20-13-18-16-24-11-18-14-24-17-33-17-38-11-28-7-20-8-24-7-25-9-40-6-33-5-33-3-34-1-19-1-56 2-19zm1494 151m-1338 90 3 9 16 40 17 36 12 23 10 18 13 22 7 7 2 1 219 1h210l131-1 1-4-8-20-8-19-10-23-13-28-15-29-10-17-7-10-6-5-239-1zm188 275 1 4 7 7 9 7 10 8 17 13 15 10 22 14 36 20 38 19 36 15 28 10 28 8 29 7 28 5 29 4 34 3 16 1h57l36-2 5-3 1-6 3-52v-52l-2-34-1-5h-431l-31-1z" />
                                                <path transform="translate(1407)" d="m0 0h18l-3 2-5 1-9-1z" />
                                                <path transform="translate(628,2045)" d="m0 0h6l2 3h-9z" />
                                                <path transform="translate(863,2047)" d="m0 0h6v1h-6z" />
                                                <path transform="translate(2047,628)" d="m0 0h1v5h-1z" />
                                                <path transform="translate(1426)" d="m0 0 2 1z" />
                                                <path transform="translate(2047,870)" d="m0 0" />
                                                <path transform="translate(2040,861)" d="m0 0" />
                                                <path transform="translate(2047,625)" d="m0 0" />
                                                <path transform="translate(1397,3)" d="m0 0" />
                                                <path transform="translate(1187)" d="m0 0" />
                                            </svg>See Related
                                        </button>
                                        <div className=" r-s-s  mt15" style={{ alignSelf: "end" }}>
                                            <BTN_MAN_SAVE_PRODS prodId={data.id} />
                                            <BTN_MAN_ADD_TO_WISH_LIST prodId={data.id} className={'c-b ml20'} />
                                        </div>
                                    </div>
                                    <button className='btnRemoveFinItem ' onClick={handelRemoveQuantity}>
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" /></svg>
                                    </button>
                                </>
                        }
                    </div>
                    {
                        viewMoreLikeThisVSBL &&
                        <>
                            <button onClick={() => setviewMoreLikeThisVSBL(false)} className='mb10 ' style={{ alignSelf: "end" }}><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" /></svg></button>
                            <div className="ctnListItemLikeThis  mb20 r-s-s" ref={MoreOFSamaeRef}>
                                {isLoadingMoreOfSame ? <div className="loader"></div> :
                                    moreOfSameData.map(prod => <ProductCard product={prod} key={prod.id} />)
                                }
                            </div>
                        </>
                    }
                </>

            )
        }

    }

    const SamryCart = () => {
        const [CartCost, setCartCost] = useState(listCard.reduce((c, elm) => c + (elm.price * elm.quantity), 0))
        const CalclateTotalePrice = () => CartCost + CartCost * 0.1
        const { isLoggedIn } = useSelector(s => s.authe)
        useEffect(() => {
            setCartCost(listCard.reduce((c, elm) => c + (elm.price * (userCart.filter(a => a.prodId == elm.id)[0]?.quantity)), 0))
        }, [userCart]);

        const handelGoToorder = () => {
            if (isLoggedIn) {
                dispatch(startOrder(listCard.map(elm => ({ id: elm.id, price: elm.price, quantity: elm.quantity }))))
            } else {
                dispatch(showLogin())
            }
        }
        if (IsUsingpc) {
            return (
                <div className="cartSummary p10 c-s-c bg-l ml20">
                    <h2>Cart Summary</h2>
                    <span className="r-b-c wmia p10 pr20 mt15">
                        <p>Subtotal </p>
                        <h1 className='mr20'>$ {getRealNumber(CartCost)}
                        </h1>
                    </span>

                    <span className="r-b-c wmia p10 pr20 mt10">
                        <p className='r-c-c'><svg version="1.1" viewBox="0 0 2048 2048" className='w30 h30 mr10' xmlns="http://www.w3.org/2000/svg">
                            <path transform="translate(449,596)" d="m0 0h139l812 1 16 1 10 3 11 7 7 8 5 10v23l-5 26-11 48-7 30-8 37-10 43-4 17-1 2h236l39 1 32 2 28 4 25 6 26 8 25 10 26 12 24 14 19 12 16 12 16 13 17 16 16 16 7 8 14 18 13 18 12 20 15 28 13 29 7 20 8 27 8 30 2 4h1v80l-2-1-7 30-11 57-11 55-6 34-8 44-8 46-7 36-7 28-5 12-6 8-8 6-12 4-15 2h-41l-18-1-4 8-5 16-11 25-10 19-7 11-9 12-12 14-7 7-8 7-9 8-18 12-16 9-20 8-18 6-21 5-24 3h-35l-22-3-21-5-16-6-12-5-17-9-15-10-11-9-12-11-13-13-11-14-14-22-8-16-9-20-9-25-1-2-18 1h-129l-110 1-102-1h-158l-2 9-6 20-11 24-8 15-10 14-8 10-9 10-4 5-8 7-10 9-19 14-17 10-15 6-24 8-21 5-25 3h-35l-26-4-19-5-20-8-20-10-11-7-16-12-13-12-10-10-9-11-13-18-15-29-8-19-7-19-2-4-2-1-111 1-18-1-15-3-8-4-9-10-8-14-3-12 2-10 8-15 9-10 12-6 7-1 24-1 112-1 3-5 9-25 8-20 8-15 9-14 9-12 12-14 15-14 13-10 17-11 23-12 21-8 18-5 22-3h48l17 2 22 5 16 6 25 12 16 10 11 8 11 9 10 9 7 8 13 16 10 15 12 23 8 20 8 23 1 3 214-1 6-2 5-15 6-22 7-35 9-37 9-42 8-34 10-45 11-48 10-43 9-42 11-46 8-36 12-52 7-31 14-61 13-55 15-60 18-77 11-44 6-25h-980l-9-2-6-4-7-7-7-11-5-10-1-4v-7l3-10 8-15 6-7 10-6 6-2zm943 342-5 2-3 5-9 37-9 44-7 30-9 41-7 29-10 45-7 30-9 40-8 34-8 36-9 38-7 33-7 30-8 37-8 33-6 25-6 20-2 8h206l2-2 5-20 8-20 10-21 9-14 11-15 9-11 6-6v-2l4-2 14-12 21-14 14-8 21-9 18-6 18-4 16-2 14-1h17l27 2 21 4 21 7 27 13 16 10 12 9 15 13 11 11 11 14 10 15 9 16 9 19 11 30 4 6 6 2 7 1h8l7-3 3-9 6-29 15-80 9-46 10-54 7-36 7-42 1-11v-15l-2-23-4-22-7-26-10-25-9-19-11-19-8-12-13-18-13-15-17-17-11-9-17-13-17-11-15-9-17-9-19-8-30-10-21-5-22-3-12-1-29-1zm-681 513-20 3-16 5-15 8-10 7-11 9-11 11-10 14-6 10-5 11-4 13-3 15-1 28 2 21 4 16 5 13 10 16 11 13 5 6 8 7 13 10 20 10 21 6 15 2h22l19-3 16-5 13-6 14-8 10-8 3-2v-2l4-2 8-8 11-15 10-19 4-16 1-8 1-31-1-18-3-16-4-12-11-20-9-11-9-10-16-13-16-9-14-6-15-4-14-2zm939 0-20 3-16 5-19 10-12 9-5 4v2h-2v2h-2v2l-4 2v2h-2l-12 17-10 21-5 15-4 20-1 10v10l3 21 5 16 8 18 9 14 9 11 12 12 14 10 15 8 18 6 14 3 8 1h21l16-2 20-6 16-7 14-9 10-8 9-8v-2l3-1 14-19 6-12 7-21 3-22v-17l-2-18-4-15-9-21-8-13-8-10-9-10-17-13-16-9-15-6-18-4-10-1z" />
                            <path transform="translate(143,1279)" d="m0 0h389l29 1 11 2 8 5 7 7 5 10 4 12v14l-4 11-7 11-7 7-10 4-8 1-44 1h-470l-18-2-8-3-7-6-7-10-2-4h-2v-2h-2v-35l11-9 11-11 9-2 27-1z" />
                            <path transform="translate(213,1023)" d="m0 0h317l30 1 11 2 8 5 6 5 6 10 4 9 1 4v14l-5 13-9 12-8 6-8 3-11 1-55 1-355 1-24-1-12-3-6-4-9-10-7-11-3-8v-13l4-11 8-12 8-8 8-4 10-1z" />
                            <path transform="translate(267,767)" d="m0 0h248l41 1 13 2 7 3 8 6 6 9 4 8 2 8v11l-4 12-6 10-9 9-10 5-6 1-33 1h-323l-10-3-6-4-5-5-8-10-5-10-2-6v-9l5-14 7-10 7-7 7-5 3-1 15-1z" />
                            <path transform="translate(2047,1156)" d="m0 0 1 4h-3v-3z" />
                        </svg>
                            Shipping Cost </p>
                        <h1 className='mr20'>Free </h1>
                    </span>
                    <div className="r-b-s wmia p10 pr20 mt15">
                        <p className='r-s-c'><svg version="1.1" viewBox="0 0 2048 2048" className=' mr10' xmlns="http://www.w3.org/2000/svg">
                            <path transform="translate(211,255)" d="m0 0h1627l36 2 25 3 19 5 20 8 18 10 16 12 10 8 12 11v2h2l11 14 9 13 12 21 12 28 6 17 2-1v384l-2-3-8 10-8 11-5 6-11 8-10 4-23 3-24 3-23 5-21 7-23 11-17 11-14 11-18 18-11 14-6 8-11 19-8 20-7 25-4 25-1 20 3 27 5 21 8 24 9 17 9 14 12 16 12 13 10 9 17 12 20 12 18 8 15 5 23 5 41 6 12 3 12 7 10 9 13 16 4 5v2h2v398l-3-1 1-4h-2l-3-3-3 10-7 18-11 21-12 16-7 9-9 10-14 14-11 8-10 7-14 8-19 8-21 6-15 3-31 3-35 1h-1629l-19-1-27-4-19-5-21-9-19-11-16-12-13-12-14-14-10-13-12-19-12-25-8-21-3-3v-386l7-7 9-11 7-7 17-12 6-2 45-6 20-4 16-5 24-10 14-8 12-8 13-11 8-7 6-7 5-5 10-12 8-13 8-14 6-15 6-21 4-19 2-30-2-25-3-18-6-20-8-20-8-15-10-15-13-16-15-15-19-14-21-12-17-7-25-7-16-3-33-4-15-3-14-7-9-7-4-5-6-11-5-6h-3l-1-3v-383l3-3 11-27 9-20 13-21 11-13 8-10 9-9 16-12 14-9 20-11 21-8 17-4 27-3zm128 127-117 1-36 1-16 2-9 4-9 7-8 7-10 16-3 10-2 10-1 17v246l1 6 16 5 21 6 24 10 16 8 23 12 25 17 16 13 8 7h2v2l8 7 7 7 7 8 11 13 14 19 13 21 11 21 10 23 8 22 7 25 5 30 1 9 1 30-1 27-4 31-6 25-10 30-9 20-7 15-10 17-10 15-11 16-9 11-9 10-5 6-8 7-8 8-11 9-10 8-17 11-22 13-29 14-21 8-33 11-5 4-1 155v82l1 23 3 18 4 10 7 11 10 10 12 8 12 4 16 2 350 1h594l710-1 24-2 10-3 11-6 10-8 7-9 6-13 3-13 1-10v-260l-3-3-20-5-22-8-25-11-25-13-19-12-18-13-10-9-11-9-16-16-7-8-11-14-13-18-13-21-12-23-12-28-8-26-6-29-2-14-1-13v-49l3-23 5-26 10-31 8-20 8-16 9-17 10-16 13-19 9-12 9-10 2-4h2l4-4v-2l4-2 14-14 20-15 15-10 16-10 24-13 24-10 25-8 17-5 3-3v-262l-1-11-4-12-6-11-9-12-13-9-10-4-13-2-42-1-157-1z" />
                            <path transform="translate(1155,490)" d="m0 0 9 2 47 16 37 14 20 7 7 4-1 7-5 11-9 25-10 28-16 43-48 128-14 38-7 18-6 17-18 47-11 30-13 34-6 17-11 29-13 34-7 20-9 24-17 45-16 42-11 30-15 40-11 29-8 20-7 20-15 40-23 61-7 19-16 42-14 37-13 34-6 15-6-1-26-11-36-13-44-16-7-4-1-5 11-27 9-25 6-15 7-20 10-26 7-18 6-17 15-40 16-43 24-64 11-29 14-37 11-30 11-29 16-42 30-81 14-36 7-20 10-26 11-30 9-24 22-58 14-38 24-64 32-86 14-37 11-30 6-17z" />
                            <path transform="translate(1375,1058)" d="m0 0h14l24 2 21 4 21 7 19 10 14 8 17 13 12 11 7 7 9 11 8 11 8 13 9 17 8 21 6 24 3 22v21l-4 27-5 20-5 14-8 16-9 17-14 19-15 16-14 12-11 8-13 8-15 7-21 8-15 4-17 3-18 2h-25l-25-3-21-6-16-6-21-11-17-12-15-13-13-13-13-17-11-18-8-16-8-20-5-17-3-16-1-9v-25l3-24 6-22 6-17 8-16 9-16 8-11 11-13 16-16 14-11 16-10 16-8 19-8 17-5 19-3zm-3 129-14 4-12 6-12 11-9 14-5 15-1 4v17l3 10 8 16 7 9 11 10 12 6 17 4h12l12-3 16-8 13-11 9-14 4-13 1-7v-17l-5-17-6-11-7-8-11-8-12-6-13-3z" />
                            <path transform="translate(713,661)" d="m0 0 31 1 20 3 21 6 18 8 17 9 16 11 13 11 10 9 10 11 11 15 12 21 11 26 5 17 3 15 1 11v37l-2 17-6 23-10 24-10 18-10 15-8 10-12 13-8 7-12 9-10 7-25 13-19 7-15 4-20 4-17 2h-19l-25-3-18-4-21-8-16-8-12-7-12-9-11-9-12-11v-2h-2l-9-11-9-12-9-15-8-16-7-17-5-18-4-19-1-10v-26l4-27 6-21 10-24 9-17 10-14 12-14 19-19 18-13 14-8 19-9 21-7 18-4zm-2 129-12 3-14 7-10 9-8 11-7 14-2 8v20l4 13 9 16 9 10 10 7 16 6 11 2h13l15-5 11-6 10-9 8-10 7-14 2-11v-18l-4-15-7-13-6-7-10-8-13-7-12-3z" />
                            <path transform="translate(2046,389)" d="m0 0h2l-1 4z" />
                            <path transform="translate(2046,796)" d="m0 0h2v2l-3-1z" />
                            <path transform="translate(2047,1257)" d="m0 0" />
                            <path transform="translate(2043,792)" d="m0 0" />
                            <path transform="translate(0,401)" d="m0 0" />
                        </svg>
                            Promo code</p>
                        <div className="c-s-e">
                            <input type="text" className='w200' />
                            <button className='bl mt5'>Apply</button>
                        </div>
                    </div>
                    <span className="r-b-c wmia p10 pr20 mt15">
                        <p>Taxes based on the users location</p>
                        <h1 className='mr20'>10%</h1>
                    </span>
                    <span className="r-b-c wmia p10 pr20 mt15">
                        <p>Total </p>
                        <h1 className='mr20'>$ {getRealNumber(CalclateTotalePrice())}</h1>
                    </span>
                    {
                        isLoggedIn ?
                            <>
                                {/* <HandelAddressForShipping /> */}
                                <button className='bl mt20 wmia p10' style={{ cursor: "pointer" }} onClick={handelGoToorder}>Proceed to Checkout</button>
                            </> :
                            <>
                                <h2>You are not logged in, you must log in or register (it's easy)  ,to proceed with your order </h2>
                            </>
                    }

                </div>
            )
        } else {
            return (
                <div className=" p10 c-s-s bg-l  wmia" style={{
                    position: "sticky",
                    bottom: "0"
                }}>
                    <h2>Cart Summary</h2>
                    <span className="r-b-c wmia mt15  pr20 mt15">
                        <p>Subtotal </p>
                        <h1 className='mr20'>$ {getRealNumber(CartCost)}
                        </h1>
                    </span>

                    <span className="r-b-c wmia mt15  pr20 ">
                        <p className='r-c-c'><svg version="1.1" viewBox="0 0 2048 2048" className='w30 h30 mr10' xmlns="http://www.w3.org/2000/svg">
                            <path transform="translate(449,596)" d="m0 0h139l812 1 16 1 10 3 11 7 7 8 5 10v23l-5 26-11 48-7 30-8 37-10 43-4 17-1 2h236l39 1 32 2 28 4 25 6 26 8 25 10 26 12 24 14 19 12 16 12 16 13 17 16 16 16 7 8 14 18 13 18 12 20 15 28 13 29 7 20 8 27 8 30 2 4h1v80l-2-1-7 30-11 57-11 55-6 34-8 44-8 46-7 36-7 28-5 12-6 8-8 6-12 4-15 2h-41l-18-1-4 8-5 16-11 25-10 19-7 11-9 12-12 14-7 7-8 7-9 8-18 12-16 9-20 8-18 6-21 5-24 3h-35l-22-3-21-5-16-6-12-5-17-9-15-10-11-9-12-11-13-13-11-14-14-22-8-16-9-20-9-25-1-2-18 1h-129l-110 1-102-1h-158l-2 9-6 20-11 24-8 15-10 14-8 10-9 10-4 5-8 7-10 9-19 14-17 10-15 6-24 8-21 5-25 3h-35l-26-4-19-5-20-8-20-10-11-7-16-12-13-12-10-10-9-11-13-18-15-29-8-19-7-19-2-4-2-1-111 1-18-1-15-3-8-4-9-10-8-14-3-12 2-10 8-15 9-10 12-6 7-1 24-1 112-1 3-5 9-25 8-20 8-15 9-14 9-12 12-14 15-14 13-10 17-11 23-12 21-8 18-5 22-3h48l17 2 22 5 16 6 25 12 16 10 11 8 11 9 10 9 7 8 13 16 10 15 12 23 8 20 8 23 1 3 214-1 6-2 5-15 6-22 7-35 9-37 9-42 8-34 10-45 11-48 10-43 9-42 11-46 8-36 12-52 7-31 14-61 13-55 15-60 18-77 11-44 6-25h-980l-9-2-6-4-7-7-7-11-5-10-1-4v-7l3-10 8-15 6-7 10-6 6-2zm943 342-5 2-3 5-9 37-9 44-7 30-9 41-7 29-10 45-7 30-9 40-8 34-8 36-9 38-7 33-7 30-8 37-8 33-6 25-6 20-2 8h206l2-2 5-20 8-20 10-21 9-14 11-15 9-11 6-6v-2l4-2 14-12 21-14 14-8 21-9 18-6 18-4 16-2 14-1h17l27 2 21 4 21 7 27 13 16 10 12 9 15 13 11 11 11 14 10 15 9 16 9 19 11 30 4 6 6 2 7 1h8l7-3 3-9 6-29 15-80 9-46 10-54 7-36 7-42 1-11v-15l-2-23-4-22-7-26-10-25-9-19-11-19-8-12-13-18-13-15-17-17-11-9-17-13-17-11-15-9-17-9-19-8-30-10-21-5-22-3-12-1-29-1zm-681 513-20 3-16 5-15 8-10 7-11 9-11 11-10 14-6 10-5 11-4 13-3 15-1 28 2 21 4 16 5 13 10 16 11 13 5 6 8 7 13 10 20 10 21 6 15 2h22l19-3 16-5 13-6 14-8 10-8 3-2v-2l4-2 8-8 11-15 10-19 4-16 1-8 1-31-1-18-3-16-4-12-11-20-9-11-9-10-16-13-16-9-14-6-15-4-14-2zm939 0-20 3-16 5-19 10-12 9-5 4v2h-2v2h-2v2l-4 2v2h-2l-12 17-10 21-5 15-4 20-1 10v10l3 21 5 16 8 18 9 14 9 11 12 12 14 10 15 8 18 6 14 3 8 1h21l16-2 20-6 16-7 14-9 10-8 9-8v-2l3-1 14-19 6-12 7-21 3-22v-17l-2-18-4-15-9-21-8-13-8-10-9-10-17-13-16-9-15-6-18-4-10-1z" />
                            <path transform="translate(143,1279)" d="m0 0h389l29 1 11 2 8 5 7 7 5 10 4 12v14l-4 11-7 11-7 7-10 4-8 1-44 1h-470l-18-2-8-3-7-6-7-10-2-4h-2v-2h-2v-35l11-9 11-11 9-2 27-1z" />
                            <path transform="translate(213,1023)" d="m0 0h317l30 1 11 2 8 5 6 5 6 10 4 9 1 4v14l-5 13-9 12-8 6-8 3-11 1-55 1-355 1-24-1-12-3-6-4-9-10-7-11-3-8v-13l4-11 8-12 8-8 8-4 10-1z" />
                            <path transform="translate(267,767)" d="m0 0h248l41 1 13 2 7 3 8 6 6 9 4 8 2 8v11l-4 12-6 10-9 9-10 5-6 1-33 1h-323l-10-3-6-4-5-5-8-10-5-10-2-6v-9l5-14 7-10 7-7 7-5 3-1 15-1z" />
                            <path transform="translate(2047,1156)" d="m0 0 1 4h-3v-3z" />
                        </svg>
                            Shipping Cost </p>
                        <h1 className='mr20 bg-g p5  w60 br10 ' style={{
                            textAlign: "center"
                        }}>Free </h1>
                    </span>

                    <span className="r-b-c wmia  pr20 mt15">
                        <p>Taxes based on the users location</p>
                        <h1 className='mr20'>10%</h1>
                    </span>
                    <span className="r-b-c wmia  pr20 mt15">
                        <p>Total </p>
                        <h1 className='mr20'>$ {getRealNumber(CalclateTotalePrice())}</h1>
                    </span>
                    {
                        isLoggedIn ?
                            <>
                                {/* <HandelAddressForShipping /> */}
                                <button className='bl mt20 wmia p10' style={{ cursor: "pointer" }} onClick={handelGoToorder}>Proceed to Checkout</button>
                            </> :
                            <>
                                <h2>You are not logged in, you must log in or register (it's easy)  ,to proceed with your order </h2>
                            </>
                    }

                </div>
            )
        }

    }
    if (IsUsingpc) {

        return (
            <main ref={LisstCardItemsRef} style={{ minHeight: "800px" }}>
                {
                    viewProdVsbl && <ViewProd />
                }
                <div className="c-s-s wmia h400 introPageStyle psr">
                    <h1 className=' ml20 mt20'>Shopping Cart</h1>
                    <img src="imgs/freepik__expand__76699.png" alt="" />
                </div>
                <div ref={ContainerCartRef} style={{ minHeight: "600px" }} className='CardContainer r-p-s mt20 brs20 p20' >
                    {isLoaing ? <div className="loader"></div> :
                        <>
                            {isLodingProds ? <div className="loader"></div>
                                :
                                <>
                                    {listCard.length == 0 ?
                                        <div className="c-c-c mrauto">
                                            <h1 className='logo '>Cart Empty !</h1>
                                            <a href="/Shop " className='bl mt20 w300 br20'>Start Shopping  </a>
                                        </div>
                                        :
                                        <>
                                            <div className="listCartItems  c-s-s ">
                                                <>
                                                    {listCard.map(prod => <CartItem key={prod.id} data={prod} />)}
                                                </>
                                            </div>
                                            <SamryCart />
                                        </>
                                    }
                                </>
                            }
                        </>}

                </div>
            </main>

        )
    }
    else {
        return (
            <main ref={LisstCardItemsRef} style={{ minHeight: "800px" }}>

                <div className="c-s-s wmia h200 introPageStyle psr">
                    <h1 className=' ml20 mt10'>Shopping Cart</h1>
                    <img src="imgs/freepik__expand__76699.png" alt="" />
                </div>
                {
                    viewProdVsbl && <ViewProd />
                }
                <div ref={ContainerCartRef} style={{ minHeight: "600px" }} className='wmia c-s-s  brs20 p5' >
                    {isLoaing ? <div className="loader"></div> :
                        <>
                            {isLodingProds ? <div className="loader"></div>
                                :
                                <>
                                    {listCard.length == 0 ?
                                        <div className="c-c-c mrauto">
                                            <h1 className='logo '>Cart Empty !</h1>
                                            <a href="/Shop " className='bl mt20 w300 br20'>Start Shopping  </a>
                                        </div>
                                        :
                                        <>
                                            <div
                                                className="wmia bg-third c-s-s " style={{
                                                    overflow: "auto"
                                                }}>
                                                <>
                                                    {listCard.map(prod => <CartItem key={prod.id} data={prod} />)}
                                                </>
                                            </div>
                                            <SamryCart />
                                        </>
                                    }
                                </>
                            }
                        </>}

                </div>
            </main>
        )
    }
}

export default cart
