import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { auth, db } from '../config/fireBase'
import { setDoc, getDoc, updateDoc, doc } from 'firebase/firestore'
import '../css/singles.css';
import { api } from "./fetchProdSlice";
import { showTenDone } from "./tenDoeneslice";
import GoodLoader from "../c/singles/goodLoader";
export const getUserCartsItems = createAsyncThunk(
    "btnAddToCart/getUserCartsItems", async (t, { rejectWithValue }) => {

        try {
            const userId = localStorage.getItem('userId');
            if (userId != null) {
                const res = await getDoc(doc(db, "users", userId));
                if (res.data()?.cart) {
                    return res.data().cart
                } else {
                    return []
                }
            } else {
                let cart = localStorage.getItem('cart');
                cart != null ? cart = JSON.parse(cart) : cart = []
                return cart;
            }

        } catch (error) {
            return rejectWithValue(error.message);
        }
    });


const btnAddToCartSlice = createSlice({
    name: "btnAddToCart",
    initialState: {
        userCart: [],
        openedCard: [],
        adderNewAddres: false,
        isLoaing: true,
    },
    reducers: {
        add_itemToCurrentCart: (state, action) => {
            state.userCart.push(action.payload);
            state.adderNewAddres = true;
        },
        increaseQuantit: (state, action) => {
            let id = action.payload;
            let newState = state.userCart.map(el =>
                el.prodId === id ? { ...el, quantity: el.quantity + 1 } : el
            );
            state.userCart = newState
            if (localStorage.getItem("cart") != null) {
                localStorage.setItem("cart", JSON.stringify(newState));
            }
        },
        decreaseQuantit: (state, action) => {
            let id = action.payload;
            let newState = state.userCart.map(el =>
                el.prodId === id ? { ...el, quantity: el.quantity - 1 } : el
            );
            state.userCart = newState
            if (localStorage.getItem("cart") != null) {
                localStorage.setItem("cart", JSON.stringify(newState));
            }
        },
        rmoveItemFromCart: (state, action) => {
            let id = action.payload;
            let newState = state.userCart.filter(el => el.prodId != id);
            state.userCart = newState
            if (localStorage.getItem("cart") != null) {
                localStorage.setItem("cart", JSON.stringify(newState));
            }
        },


        finishAdding: (state) => {
            state.adderNewAddres = false;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getUserCartsItems.pending, (state) => {
                state.isLoaing = true;
            })
            .addCase(getUserCartsItems.fulfilled, (state, action) => {
                state.isLoaing = false;
                state.userCart = action.payload
            })
            .addCase(getUserCartsItems.rejected, (state, action) => {
                state.isLoaing = false;
            })


    }
})
export const { add_itemToCurrentCart, increaseQuantit, decreaseQuantit, rmoveItemFromCart, finishAdding } = btnAddToCartSlice.actions;

export default btnAddToCartSlice.reducer;

export const BTN_ADD_TO_CART = ({ prod_id, style }) => {
    const dispatch = useDispatch();
    const [idLoading2, setidLoading2] = useState(false)
    const { userCart, isLoaing } = useSelector(st => st.btnAddToCart)
    const { isLoggedIn, user } = useSelector(st => st.authe)

    const [isAlreadyIn, setisAlreadyIn] = useState(userCart.some(elm => elm.prodId === prod_id));
    const checkExisting = () => {
        if (userCart.some(el => el.prodId == prod_id)) {
            setisAlreadyIn(true);
        } else {
            setisAlreadyIn(false);
        }
    }

    useEffect(() => {
        if (!isLoaing) {
            checkExisting();
        }
    }, [userCart]);

    const handelAddToCart = async () => {
        if (!idLoading2) {
            setidLoading2(true);
            if (isLoggedIn) {
                await updateDoc(
                    doc(db, "users", localStorage.getItem("userId")),
                    { cart: [...userCart, { prodId: prod_id, quantity: 1 }] }
                ).then(() => {
                    dispatch(add_itemToCurrentCart({ prodId: prod_id, quantity: 1 }))
                    dispatch(showTenDone([, "Products Added  succesfully"]))
                    setidLoading2(false);
                    setisAlreadyIn(true)
                }).catch(err => {
                    console.log(err);
                    setidLoading2(false);
                })
            } else {
                let oldCad = localStorage.getItem("cart") || [];
                oldCad.length > 0 ? oldCad = JSON.parse(oldCad) : null
                oldCad.push({ prodId: prod_id, quantity: 1 });
                localStorage.setItem("cart", JSON.stringify(oldCad));
                dispatch(showTenDone([, "Products Added  succesfully"]))
                dispatch(add_itemToCurrentCart({ prodId: prod_id, quantity: 1 }))
                setidLoading2(false);
            }
        }
    };

    const handelIncreaseQuantity = async () => {
        if (!idLoading2) {
            setidLoading2(true);
            if (isLoggedIn) {
                await getDoc(doc(db, "users", localStorage.getItem("userId"))).then(async (res) => {
                    let newCart = res.data().cart.map(elm => elm.prodId === prod_id ? { ...elm, quantity: elm.quantity + 1 } : elm)
                    await updateDoc(
                        doc(db, "users", localStorage.getItem("userId")), { cart: newCart }
                    ).then(() => {
                        dispatch(increaseQuantit(prod_id));
                        setidLoading2(false);
                    })
                })
            }
            else {
                dispatch(increaseQuantit(prod_id));
                setidLoading2(false);
            }

        }
    }
    const handelRemoveQuantity = async () => {
        if (!idLoading2) {
            setidLoading2(true);
            if (isLoggedIn) {
                await getDoc(doc(db, "users", localStorage.getItem("userId"))).then(async (res) => {
                    let newCart = res.data().cart.filter(elm => elm.prodId != prod_id)
                    await updateDoc(
                        doc(db, "users", localStorage.getItem("userId")), { cart: newCart }
                    ).then(() => {
                        dispatch(rmoveItemFromCart(prod_id));
                        setisAlreadyIn(false)
                        setidLoading2(false);
                    })
                })
            } else {
                dispatch(rmoveItemFromCart(prod_id));
                setisAlreadyIn(false)
                setidLoading2(false);
            }

        }
    }

    return (
        <>
            {isLoaing ? <div className="spinner2 w20 h20"></div> :
                isAlreadyIn ?
                    <div className="c-s-s BtnAddddToooCart mb20 " style={style}>
                        {
                            !idLoading2 &&
                            <p className="mb10 activeCmp"><strong>{userCart.filter(elm => elm.prodId == prod_id)[0]?.quantity} </strong>Items in the Cart</p>
                        }
                        <div className="r-c-c  wmia" >
                            <button style={{minWidth:"100px"}} className='tbnAddToCArt activeCmp' onClick={handelIncreaseQuantity}  >
                                {idLoading2 ?
                                    <div className="spinner2 w20 h20"></div>
                                    :
                                    <>
                                        <h2 className="mr10">In the cart</h2>
                                        <svg version="1.1" viewBox="0 0 2048 2048" width="128" height="128" xmlns="http://www.w3.org/2000/svg">
                                            <path transform="translate(252,191)" d="m0 0h35l34 4 23 5 20 7 27 13 24 15 16 13 12 11 11 11 11 14 10 14 9 15 10 22 9 25 7 30 8 46 3 10 109 1h985l31 2 24 3 21 5 22 8 22 11 25 16 11 9 10 9 8 7 9 10 11 14 10 14 9 15 10 21 9 25 5 19 3 21v39l-3 31-6 38-6 34-10 63-6 35-9 57-7 40-9 57-7 40-9 57-6 32-10 68-8 46-7 28-12 32-12 23-10 16-12 16-12 14-7 8-14 14-11 9-17 13-14 9-22 12-21 9-24 8-28 7-18 3-14 1h-751l-23-1-26-3-25-6-15-5-19-8-21-11-15-10-10-8-13-11-14-14-9-11-10-13-12-19-11-21-7-18-7-25-7-36-10-67-23-163-29-202-11-77-29-202-11-76-8-57-4-29-5-24-5-14-8-16-9-13-10-10-15-10-11-5-16-5-12-3-23-2-30-2-12-3-10-5-12-12-8-14-5-13-2-14 1-14 4-13 6-11 9-12 10-7 13-6 9-2zm470 383-186 1 7 51 12 81 9 66 7 48 10 71 13 92 10 69 9 64 9 62 10 69 7 44 6 23 7 16 8 13 11 12 12 10 14 8 11 5 15 4 14 2 19 1h700l33-2 29-4 21-6 16-6 20-11 15-12 7-8 4-5 9-14 9-19 8-24 6-25 10-50 15-90 16-97 12-73 9-53 9-56 11-66 9-58 1-11v-34l-4-15-10-21-9-13-4-5-8-7-12-9-17-8-21-6-17-2-37-1-180-1z" />
                                            <path transform="translate(1263,802)" d="m0 0h20l15 4 14 7 10 8 8 9 8 14 5 16v21l-6 12-10 13-11 13-11 12-71 71-5 6-8 7-4 5-6 5-6 7-13 13h-2l-2 4-52 52h-2l-1 3-8 7-4 5-8 7-14 14-13 10-14 7-15 5-5 1h-7l-12-3-19-10-13-11-13-12-90-90v-2h-2l-9-11-10-15-6-15-1-8 3-15 5-12 8-13 14-14 14-8 10-4 5-1h16l13 4 10 5 12 9 11 9 10 10 7 6 7 8 5 4 7 8 9 9 8 10 4 3 5-2 16-16 8-7 78-78 5-6 8-7 10-11h2l1-3 29-29h2v-2l10-10h2v-2l8-7 12-10 12-7z" />
                                            <path transform="translate(1434,1685)" d="m0 0h32l18 4 15 6 15 9 14 12 8 9 9 14 7 14 5 15 2 9v30l-4 15-7 17-10 16-9 11-7 7-12 9-21 10-20 6-6 1h-24l-17-3-16-6-11-6-13-10-11-11-11-15-8-16-6-17-2-9v-26l4-19 6-16 9-15 11-13 8-8 13-9 17-9 12-4z" />
                                            <path transform="translate(757,1685)" d="m0 0h26l15 3 15 5 16 9 15 12 7 8 9 12 9 17 5 14 2 11v28l-3 15-7 18-8 14-11 14-9 9-14 10-19 8-21 6-18 1-21-3-15-4-17-8-12-9-10-10-7-8-11-18-7-17-4-14-1-6v-20l4-19 9-22 8-13 9-10 10-10 15-10 18-8 16-4z" />
                                        </svg>
                                    </>
                                }


                            </button>
                            <p className="sayRemoveFromCart ml10" onClick={handelRemoveQuantity}>Remove</p>
                        </div>
                    </div >
                    :
                    <button className='tbnAddToCArt BtnAddddToooCart ' onClick={handelAddToCart} style={style}>
                        {idLoading2 ? <div className="spinner2 w20 h20"></div> :

                            <>
                                <h2 className="mr10" >Add to cart</h2>
                                <svg version="1.1" viewBox="0 0 2048 2048" className="f-d" xmlns="http://www.w3.org/2000/svg">
                                    <path transform="translate(50,170)" d="m0 0h130l25 2 25 5 20 6 19 8 21 12 19 14 14 12 13 13 13 17 8 13 11 21 8 20 8 27 9 39 9 49 11 58 5 20 1 5h291l21 1 10 2 9 6 6 5 7 10 4 11v16l-4 10-8 11-9 8-8 3-17 2-100 1h-182l5 25 6 34 8 37 16 81 22 111 25 124 22 111 23 114 11 57 14 63 2 10h898l134-1 3-1 2-5 3-22 16-78 4-14 4-10 11-13 6-4 6-2h22l10 3 11 7 7 8 5 11 1 4v16l-6 30-7 40-9 45-7 31-5 15-7 12-5 5-5 4-12 4-31 1-1066 1-8 2h-20l-18-1-11-1h-137l-15 2-8 4-8 9-8 14-1 6v8l2 10 8 16 8 8 9 4 14 2h1022l400 1 27 1 13 1 11 4 10 9 6 10 4 10v15l-5 12-6 9-9 8-9 4-4 1-13 1-58 1h-1385l-31-3-21-6-16-8-13-9-12-11-10-11-9-13-8-14-7-19-4-17v-33l4-20 6-17 9-17 11-15 4-5h2v-2h2v-2l10-8 15-10 19-9 16-5 26-3h116l1-3-4-24-9-42-22-110-7-36-18-90-6-29-7-37-9-44-7-36-11-55-9-44-7-36-14-68-7-37-10-50-12-62-10-58-18-93-10-49-6-20-9-20-6-11-11-14-10-10-14-10-15-8-18-6-18-4-19-2-46-1h-88l-16-2-8-7-7-8-9-8v-35h2l2-4 8-8h2v-2l11-7 11-3z" />
                                    <path transform="translate(1421)" d="m0 0h144l3 2v2l10 1 34 7 30 8 29 9 33 12 25 11 23 11 21 12 16 10 12 8 17 12 19 14 11 9 11 10 8 7 12 11 25 25 7 8 11 13 13 17 14 19 10 15 17 29 8 15 11 23 10 22 8 21 11 31 7 25 9 40 6 30 2-2v139l-1 6 1 2v18l-2-1v-6l-2-4h-2l-4 16-8 36-8 27-7 21-11 28-12 27-10 19-10 18-10 17-12 18-8 11-10 13-18 22-9 10-1 2h-2l-2 4-7 7-7 8-12 12-8 7-12 11-17 13-10 8-13 10-19 13-18 11-14 8-12 7-23 11-25 11-35 13-35 10-25 6-21 4-27 4-30 3-36 2-32-1-32-3-35-5-26-5-31-8-37-12-32-13-26-12-22-12-14-8-24-15-11-8-24-18-14-12-11-9-17-16-21-21-7-8-12-14-11-14-15-20-8-12-13-20-9-15-13-25-8-16-12-27-15-42-8-29-8-37-5-33-3-31-1-40 2-37 5-43 6-32 4-16 7-25 11-33 8-20 9-20 12-25 15-27 11-17 7-11 13-18 14-18 9-11 9-10 9-11 31-31 8-7 13-11 14-11 15-11 11-8 15-10 27-16 27-14 30-14 35-13 32-10 36-9 37-7h2zm38 86-31 3-26 4-22 5-28 8-24 8-31 13-22 11-23 13-19 12-14 10-17 13-16 13-4 3v2l-4 2-9 9-7 6-12 12-7 8-10 11-13 17-10 14-10 15-12 19-17 32-10 23-5 11-12 34-5 17-7 33-6 40-2 18-1 17v29l3 31 5 33 7 34 8 28 11 31 11 25 8 17 13 23 15 24 4 5 14 19 13 16 7 8 9 10 14 15 3 1v2l8 7 10 9 11 9 17 13 17 12 19 12 15 9 23 12 19 9 25 10 28 9 31 8 34 6 28 3 14 1h53l32-3 36-6 29-7 29-9 33-13 35-17 24-14 23-15 15-11 16-13 13-11 15-14 8-7 9-10 11-12 6-7v-2h2l13-17 13-18 9-14 11-18 17-33 11-27 7-20 10-34 6-28 4-25 3-32 1-35-2-40-3-25-7-38-7-26-12-36-14-32-16-31-9-15-18-27-12-16-11-14-12-14-9-9-2-3h-2l-1-3-8-7-14-13-11-9-14-11-18-13-17-11-25-15-32-16-27-11-36-12-27-7-25-5-32-4-16-1z" />
                                    <path transform="translate(1482,257)" d="m0 0h19l11 4 10 6 7 7 4 9 2 15v213h193l27 1 10 2 9 6 8 8 6 10 3 8v16l-4 10-9 12-8 7-11 4-9 1-62 1h-152v33l-1 178-2 16-7 11-2 3h-2v2l-11 8-7 3h-20l-11-4-9-6-8-9-4-9-2-12-1-30v-164l1-20h-215l-13-2-9-5-7-7-7-10-4-8-3-10 1-8 8-15 11-12 9-6 2-1 11-1 45-1 158-1 10-1 1-21 1-185 1-13 4-12 6-8 8-7 10-5z" />
                                    <path transform="translate(1429,1707)" d="m0 0h40l24 4 19 6 16 7 16 10 11 8 12 11 13 13 10 13 8 13 8 16 7 18 5 19 2 12 1 26-2 20-5 24-6 15-8 16-10 15-13 17-10 11-10 8-12 9-19 11-15 7-29 10-1 2h-69v-5l-12-3-27-11-18-10-17-14-13-13-9-10-10-15-12-22-8-21-5-20-2-21v-11l2-22 4-19 5-15 7-16 10-17 10-14 11-12 9-9 12-9 15-10 21-11 21-7 15-3zm9 85-12 2-15 6-14 9-9 8-8 11-6 10-6 16-3 19 1 17 3 12 6 16 7 10 9 10 10 9 12 7 18 6 10 2h14l13-2 14-5 16-8 14-12 8-10 8-14 4-12 2-11v-22l-3-16-8-16-7-10-9-10-10-8-14-8-12-4-14-2zm-22 253m4 1 4 1z" />
                                    <path transform="translate(661,1707)" d="m0 0h40l24 4 19 6 15 7 9 5 18 12 12 11 14 14 10 13 8 13 8 16 7 18 5 19 2 12 1 14v13l-2 19-5 24-8 20-8 14-8 12-10 13-11 13-13 11-14 10-18 10-16 7-27 9v2h-69v-5l-12-3-22-9-21-11-13-10-10-9-14-14-10-14-9-15-8-16-7-18-5-20-1-6-1-25 2-23 4-19 5-15 7-16 10-17 10-14 11-12 11-11 17-12 19-11 16-7 20-6zm8 85-14 3-12 5-14 9-9 8-8 11-6 10-6 16-2 9-1 9v11l3 17 8 20 10 13 11 11 13 8 14 6 17 4h14l13-2 14-5 14-7 9-7 8-7 7-9 8-14 4-12 2-11v-22l-3-16-8-16-7-10-9-10-13-10-16-8-12-3-8-1zm-21 253m3 0m1 1 4 1z" />
                                    <path transform="translate(1583)" d="m0 0h14l-1 3-13-1z" />
                                    <path transform="translate(2046,452)" d="m0 0h2l-1 4-2-3z" />
                                    <path transform="translate(1483,2046)" d="m0 0 3 1-4 1z" />
                                    <path transform="translate(715,2047)" d="m0 0 3 1z" />
                                    <path transform="translate(1411)" d="m0 0h2l-1 2z" />
                                    <path transform="translate(1397,2047)" d="m0 0 2 1z" />
                                    <path transform="translate(629,2047)" d="m0 0 2 1z" />
                                </svg>
                            </>

                        }

                    </button>
            }
        </>

    )
}