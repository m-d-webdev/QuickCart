import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import ReactDOM from 'react-dom'
import { useState, useRef, useEffect, useMemo } from "react";
import "../css/singles.css"
import { db, auth } from "../config/fireBase";
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { BTN_OPEN_ADDRESS, getUserAddress, showUpdateAddress } from "./addressManagement";
import { DeleteUserAccount, logoutUser, showEditPrfPic, showReauthentCmp, updateUserInfo } from "./authSilce";
import { showTenDone } from "./tenDoeneslice";
import { ShowAddPaymenthMethod, Khazl, getDefaultCard, DeleteCard, SetCardAsDef, showUpatePaymentMethod } from "./PaymenthMethodManagement";
import { Navigate, useNavigate } from "react-router-dom";
const profileSlice = createSlice({
    name: "profileSlice",
    initialState: {
        cmp_visible: false,
    }, reducers: {
        showProfile: (state) => {
            state.cmp_visible = true
        },
        hideProfile: (state) => {
            state.cmp_visible = false
        }
    }
})

export const { showProfile, hideProfile } = profileSlice.actions
export default profileSlice.reducer


export const getrealImg = (t) => {
    switch (t) {
        case 'visa':
            return "imgs/V-removebg-preview.png"
            break;
        case "mastercard":
            return "imgs/Mastercard_logo_svg_free_download-removebg-preview.png"
            break;
        case "americanexpress":
            return "imgs/E-Ticket-removebg-preview.png"
            break;
        case 'discover':
            return "imgs/Discover-removebg-preview.png"
            break;
    }
}
export const ProfileCmp = () => {
    const naviagte = useNavigate()
    const IsWorkOnPc = window.innerWidth > 800
    if (IsWorkOnPc) {
        return <ProfileForPcs />
    } else {
        useEffect(() => {
            naviagte('/profile')
        }, [])
    }
}


const ProfileForPcs = () => {
    const dispatch = useDispatch();
    let o = { v1: false, v2: false, v3: false, v4: false }
    const [componenetVisiblety, setcomponenetVisiblety] = useState({ v1: true, v2: false, v3: false, v4: false });
    const naviagate = useNavigate()
    const OpenPaymentMethodsSection = () => {
        setcomponenetVisiblety({ ...o, v3: true })
        dispatch(getDefaultCard())
    }
    const deviceTypePc = window.innerWidth > 800
    const GoToAddPaymentMethod = () => {
        if (!deviceTypePc) {
            dispatch(ShowAddPaymenthMethod())
        } else {
            naviagate('/add_payment_method')
        }
    }
    const UserInformations = () => {
        const { user, isLoggedIn, isLoadingAuth } = useSelector(st => st.authe)
        const { haveAnAddress, userAddress } = useSelector(st => st.addAddress)
        const { havePaymenthMethod, defaultPaymenthMethod, AllPaymenthMethod, isLodingPay } = useSelector(c => c.paymentMethod);
        const cmpEditPrfRef = useRef(null);
        const [isCmpEditPrVSBL, setisCmpEditPrVSBL] = useState(false)
        const [onToUpdateName, setonToUpdateName] = useState(false)
        const dispatch = useDispatch()
        const EditPrfoPicCmp = () => {
            useEffect(() => {
                if (isCmpEditPrVSBL == true && cmpEditPrfRef?.current) {
                    document.onmousedown = (e) => {
                        if (!cmpEditPrfRef.current?.contains(e.target)) {
                            setisCmpEditPrVSBL(false)
                        }
                    }
                }
            }, [isCmpEditPrVSBL])
            return (
                <div ref={cmpEditPrfRef} className="c-s-c bg-l p20 w200 h200 br10 ctnBtnChangeProfPic">
                    <p className="mb20">Change Profile Photo</p>
                    <button onClick={() => dispatch(showEditPrfPic())} className="c-b">Edit Photo </button>
                    <button className="mt20 c-r">Remove current photo</button>
                </div>
            )
        }

        const [newName, setNewName] = useState(user?.name);
        const handelSaveName = () => {
            setonToUpdateName(false);
            if (newName != "" && newName != user.name) {
                dispatch(updateUserInfo({ 'displayName': newName }));
            }
        }
        return (
            <>
                {isLoadingAuth ? <div className="loader"></div> :
                    isLoggedIn &&
                    <div className="c-s-s wmia ">
                        <div className="mrauto">

                            <div className="c-c-c   psr">
                                {
                                    isCmpEditPrVSBL &&
                                    <EditPrfoPicCmp />
                                }
                                <img onClick={() => setisCmpEditPrVSBL(true)} style={{ filter: " drop-shadow(0 0 var(--filter-color))", width: "150px", height: "150px" }} className="imgCercle" src={user.image} alt="" />
                            </div>
                            <h1 style={{ paddingRight: "50px" }} className="logo mt20 pr20 psr c-s-c">
                                {user.name}
                                <svg onClick={() => setonToUpdateName(true)} xmlns="http://www.w3.org/2000/svg" className="btnEditAddr" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" /></svg>
                            </h1>
                            {
                                onToUpdateName &&
                                <div style={{ paddingRight: "50px" }} className="c-s-s pt20  psr">
                                    <button onClick={() => setonToUpdateName(false)} className="btnClose"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" /></svg></button>
                                    <input type="text" className="w400 p10 br5 " onChange={e => setNewName(e.target.value)} placeholder="Enter Your Name" />
                                    <button onClick={handelSaveName} className="bl mt10 w100">Save</button>
                                </div>
                            }
                        </div>
                        <p className="r-c-c mt50"><svg xmlns="http://www.w3.org/2000/svg" className="mr10 w20 h20" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m438-426 198-198-57-57-141 141-56-56-57 57 113 113Zm42 240q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0 106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Zm0-480Z" /></svg>Default Address</p>
                        <div className="cntDeautlAddress c-s-c mt5 psr wmia p15 br20 pr20">
                            {
                                haveAnAddress ?
                                    <>
                                        <p className="" style={{ fontSize: "17px" }}>{userAddress.phone} , {userAddress.houseApparNum} , {userAddress.street} , {userAddress.city} , {userAddress.zip}</p>
                                        <svg onClick={() => setcomponenetVisiblety({ ...o, v2: true })} xmlns="http://www.w3.org/2000/svg" className="btnEditAddr" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" /></svg>
                                    </> :
                                    <>
                                        <p>You don't provide any address</p>
                                        <BTN_OPEN_ADDRESS className="mt10 w200 bg-b br20 c-l" stsvg={{ fill: "#fff", marginLeft: "10px" }} />
                                    </>
                            }
                        </div>
                        <p className="r-c-c mt50"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" className="mr10 w20 h20"><path d="M160-640h640v-80H160v80Zm-80-80q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v240H160v240h164v80H160q-33 0-56.5-23.5T80-240v-480ZM598-80 428-250l56-56 114 112 226-226 56 58L598-80ZM160-720v480-180 113-413Z" /></svg>Default Payment Method</p>
                        <div className="cntDeautlAddress mt5 wmia p15 br20">
                            {
                                havePaymenthMethod ?
                                    <span className=" wmia br20 p10  r-p-c" >
                                        <img className="w70" src={getrealImg(defaultPaymenthMethod?.cardType)} alt="" />
                                        <div className="c-s-s">
                                            <h1 className="cardNumbreele">
                                                {defaultPaymenthMethod && Khazl(defaultPaymenthMethod.CardNumber)}
                                            </h1>
                                            < p >{defaultPaymenthMethod?.CardholderName}</p>
                                        </div>
                                        <h2>{defaultPaymenthMethod?.ExpiryDate}</h2>
                                    </span>
                                    :
                                    <>
                                        <p>You don't provide any paymenth Method yet</p>
                                        <button className="bl p10 br20 w300 mt50" onClick={() => GoToAddPaymentMethod()}>
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
                                            </svg>Add a payment method
                                        </button>
                                    </>
                            }
                        </div>
                    </div>

                }
            </>

        )
    }
    // ---------------------------------------------
    const { haveAnAddress, userAddress, userAdded, isLoadingAddress, errorAddress } = useSelector(s => s.addAddress)

    const AddressManagementCmp = useMemo(() =>
        () => {
            const [isLoadingAllAddress, setisLoadingAllAddress] = useState(true)
            const [allAddresses, setallAddresses] = useState([])
            const getAllAddresses = async () => {
                getDoc(doc(db, "users", localStorage.getItem('userId'))).then(res => {
                    setallAddresses(res.data().addresses);
                    setisLoadingAllAddress(false)
                })
            }
            useEffect(() => {
                haveAnAddress ? getAllAddresses() : null
            }, []);


            const SingleAddress = ({ addr }) => {
                const [isChanginAddress, setisChanginAddress] = useState(false)
                const setAdddressAsDefault = async (id) => {
                    setisChanginAddress(true)
                    try {
                        const updatedAddress = allAddresses.map(elm => {
                            elm.id == id ? elm.isDefault = true : elm.isDefault = false;
                            return elm
                        });
                        await updateDoc(doc(db, "users", localStorage.getItem("userId")), { addresses: updatedAddress });
                        dispatch(showTenDone([true, "Address changed to default"]))
                        setisChanginAddress(false);
                        setallAddresses(updatedAddress);
                        dispatch(getUserAddress());
                    } catch (error) {
                        console.log(error.message);
                    }
                }
                const DelAdddress = async (id) => {
                    setisChanginAddress(true)
                    try {
                        const updatedAddress = allAddresses.filter(elm => elm.id != id);
                        await updateDoc(doc(db, "users", localStorage.getItem("userId")), { addresses: updatedAddress });
                        setisChanginAddress(false);
                        setallAddresses(updatedAddress);
                        dispatch(showTenDone([true, "Address Deleted"]))
                        dispatch(getUserAddress());
                    } catch (error) {
                        console.log(error.message);
                    }
                }
                const goToUpdate = () => {
                    dispatch(showUpdateAddress(addr))
                    if (!deviceTypePc) {
                        naviagate('/update_address');
                    }
                }
                return (

                    <div className="wmia br20 pl20 mt15 addressElemesd psr r-b-c p5 mt5">
                        {isChanginAddress ?
                            <div className="spinner"></div>
                            :
                            <>
                                {addr.isDefault ?
                                    <svg className="iconeIsdefault f-b" version="1.1" viewBox="0 0 2048 2048" width="128" height="128" xmlns="http://www.w3.org/2000/svg">
                                        <path transform="translate(810)" d="m0 0h426l1 3 17 9 13 9 9 7 9 11 7 11 6 16 5 21 1 15v131l5 2 21 8 10 5 17 6 24 11 5 2 2-4h2l2-4 6-7 8-7 8-8 7-8 51-51 11-9 12-10 15-9 11-5 18-4h22l17 4 12 5 12 7 16 12 8 8 8 7 95 95v2l4 2v2l4 2 7 7 5 6 7 6 6 7 6 5 5 6 7 6 77 77 7 8 10 10 13 17 9 14 6 13 4 18v22l-4 15-4 9-8 14-10 14-12 14-10 10-7 8-6 5-7 8-8 7-7 8-13 12-23 23-6 5-1 4 6 9 12 29 15 36 3 3 136 1 20 3 15 4 14 7 12 9 9 8 9 12 13 22 2 5h2v423l-4 2-12 22-9 11-8 8-18 13-15 5-18 4-16 2-132 1-3 3-4 8-10 24-10 25-7 15 1 6 7 8 5 5 9 10 69 69 11 14 10 15 8 16 4 16v24l-4 16-8 16-7 11-10 13-9 10-7 8-224 224-8 7-11 10-11 9-15 9-12 5-12 3-14 2h-16l-11-2-16-6-15-9-14-12-12-11-12-12-6-5-7-8-51-51-7-5-1-2h-3v-2l-17 8-27 11-21 8-9 4-4 4-1 8v130l-2 14-5 17-5 12-12 18-10 11-11 7-15 7h-2l1 7v2h-425v-2l-5-2-20-10-14-9-10-9-9-12-8-13-7-25-2-10-1-142-5-2-10-5-58-24-4-2-5 1-16 16-7 8-4 2v2h-2l-2 4-20 20-5 6-8 7-23 23-11 9-7 6-13 8-12 6-15 4-16 2h-13l-16-3-16-7-12-8-10-8-20-18-163-163v-2l-4-2-4-4v-2l-3-1-5-6-7-6-5-6-7-6-5-5v-2l-3-1-5-6-8-7-4-4v-2l-3-1-7-8-12-13-12-17-9-17-4-14-1-6v-20l4-17 7-16 13-19 12-13 7-8 28-28 7-8h2l2-4 12-12 8-7 14-14 7-8 2-4-10-21-8-22-9-20-5-14-1-2h-147l-21-5-15-6-9-6-14-12-9-11-4-6-8-16-4-4-1-6-1-2v-417h2l2-5 11-19 11-14 2-3h2v-2l16-12 14-7 17-5 13-2h134l7-2 5-6 11-25 11-30 7-12v-5l-7-9-10-10-6-7-66-66-9-11-11-15-10-19-4-13-1-6v-18l3-16 5-13 7-13 12-16 9-10 5-6h2l1-3 8-7 66-66 3-4h2l1-3 8-7 5-6h2l1-3 8-7 1-2h2l2-4h2l2-4 6-5 2-3h2l2-4 9-8 7-8 8-8h2l2-4 84-84 11-9 13-10 17-9 17-5 6-1h22l16 4 15 6 14 9 13 11 8 7 7 7 7 6 5 6 7 6 5 6 12 12 3 2v2l4 2v2l4 2v2l4 2 8 8 7 8 5 4 4 4v2l4 2 2 2 6-1 17-8 31-12 20-8 5-5 1-6v-107l1-28 3-15 4-15 5-12 13-17 10-9 10-7 17-10zm424 1m-120 184-184 1v111l-3 26-4 14-8 15-12 16-9 8-16 8-28 11-35 12-30 10-17 7-62 31-19 8-21 8-10 3-19 1-7-1-16-5-17-9-12-9-12-11-8-7-39-39-7-8-9-9-7-8-5-2-5 3-10 10-3 2v2l-4 2-44 44v2l-4 2-8 8v2l-4 2-20 20v2l-4 2-5 6-3 2v2l-4 2v2l-4 2v2l-3 1-5 7 1 6 16 15 21 21h2v2l8 7 17 17 1 2h2l2 4 9 9 11 15 9 16 6 15 2 9v17l-3 14-9 24-8 18-27 54-11 27-12 36-11 32-9 20-7 14-8 10-6 7-14 9-12 6-17 4-29 3-40 1h-66v187l43-1h46l26 1 19 2 15 4 16 8 11 8 9 9 9 13 8 16 8 20 17 50 9 25 13 29 24 48 11 27 4 13 1 7v14l-2 11-8 20-9 15-11 14-8 8-7 8-21 21-7 6-7 8-12 11-3 2v2l-4 2-6 5-2 4 1 5 9 11h2l1 3 6 5 76 76 7 8 13 12 8 8 6 4 4-1 6-5 7-8v-2h2l8-8v-2l4-2 2-4h2l7-8 34-34 14-11 15-11 20-9 12-2h11l17 2 19 6 17 7 23 11 19 10 31 15 26 10 51 17 28 11 16 9 11 9 8 10 8 13 5 11 3 11 2 13 1 13 1 111h183l1-5 2-113 2-17 3-13 7-14 12-16 1-3 4-2 13-11 19-9 30-11 52-18 21-9 35-17 16-8 21-10 23-9 12-3h26l16 4 16 7 11 7 13 11 4 4h2l1 3 8 7 34 34 7 8 8 7 9 10 5 4 5-1 6-5 7-8 15-14 7-8 40-40v-2h2v-2l4-2 28-28 8-6v-2h2l4-5v-2h2l1-7-9-10-17-17-8-7-22-22-6-7-13-13-11-14-7-10-9-19-5-17v-10l2-15 5-15 11-26 11-23 10-19 13-28 8-21 12-36 11-32 8-18 4-8 10-13 9-10 15-9 13-6 20-4 12-1h113l1-29 1-93v-56l-1-8-14-1h-71l-38-1-19-3-11-4-14-8-10-8-7-7-9-13-7-14-11-28-14-41-10-28-14-30-15-30-12-26-8-21-4-18-1-10 3-14 6-15 10-19 10-12 7-8 3-3v-2h2l7-8 43-43 11-9 6-7-1-6-12-13-43-43-1-2h-2l-2-4h-2l-2-4h-2l-2-4-12-12h-2v-2h-2v-2h-2l-2-4h-2l-2-4-30-30-9-2-8 7-7 7v2l-4 2-4 4v2l-3 1-7 8-13 13v2l-4 2v2l-4 2v2l-3 1-6 7-8 7-11 10-9 7-11 7-20 8-11 3h-28l-30-12-35-17-38-19-25-10-47-16-31-11-19-9-10-7-10-9-8-11-10-19-4-16-2-18-1-115zm126 1855m-4 1 4 1zm-2 1m-4 1m8 0m-4 1m-7 1m3 0 4 1z" />
                                        <path transform="translate(1213,794)" d="m0 0h17l16 3 16 6 14 8 10 9 8 8 10 15 6 13 5 21v19l-4 20-7 14-12 18-9 11-4 5h-2l-2 4-28 28-6 5-223 223-11 9-12 9-10 6-20 8-13 3h-20l-19-5-16-8-9-6-16-13-12-11-7-7-6-5-6-7-6-5-7-8-39-39-7-6-5-6-17-17-11-14-10-14-8-16-5-16-1-6v-18l5-19 8-16 9-13 11-12 18-13 14-6 13-3 7-1h16l16 3 12 4 14 7 14 10 10 9 8 7 28 28 7 8 6 6 4-1 11-11 7-6 34-34 5-6 8-7 6-7h2v-2l8-7 65-65 1-2h2l2-4 11-10 7-8 4-2v-2h2v-2h2l2-4 10-10h2v-2h2l2-4 12-11 11-9 13-9 15-7 15-4z" />
                                        <path transform="translate(1239)" d="m0 0h11l-1 3-9-1z" />
                                        <path transform="translate(806,2045)" d="m0 0 8 2v1h-7z" />
                                        <path transform="translate(794,2042)" d="m0 0 4 1-2 3-3-3z" />
                                        <path transform="translate(799,2045)" d="m0 0h2l-1 3z" />
                                        <path transform="translate(815,2046)" d="m0 0 2 2h-2z" />
                                        <path transform="translate(803,2046)" d="m0 0 2 2h-2z" />
                                        <path transform="translate(2047,1245)" d="m0 0 1 2-2-1z" />
                                        <path transform="translate(0,1233)" d="m0 0 2 2h-2z" />
                                        <path transform="translate(814,2045)" d="m0 0" />
                                        <path transform="translate(265,1382)" d="m0 0" />
                                        <path transform="translate(807)" d="m0 0" />
                                    </svg>
                                    :
                                    <svg onClick={() => setAdddressAsDefault(addr.id)} className="iconeIsdefault" version="1.1" viewBox="0 0 2048 2048" width="128" height="128" xmlns="http://www.w3.org/2000/svg">
                                        <path transform="translate(0)" d="m0 0h2048v2048h-2048z" fill="#010101" />
                                        <path transform="translate(946,192)" d="m0 0h155l2 2 1 108 1 11 11 11 2 7 3 30 7 8 12 10 16 6 12 6 5 4 20 8 7 4 5 5 9 3 5 2 3-2h10l11 3 5 5 4 5 7 2 10 2 2-2 9 1 11 4 5 4 4 4 22 8 6 4 5 5 15 5 10 4 6 7 5 2 11 2 3-1h57l10-3 10-9 13-12 14-15 13-13h2l2-4h2l2-4 30-30 8-7 6-1 7 3 9 7 7 8 84 84 6 10v8l-7 8-5 4-7 8-55 55-7 6-7 8-3 3h-2l-2 4-2 5v60l2 18 9 11 8 21 9 15 8 20 7 10 3 10 3 15v9l4 6 5 4 3 7 4 22 1 10 7 9 4 8 6 16 9 14 6 17 6 8 9 11 7 3 14 1h11l11 4 4 5 4 6 121 2 2 3v153l-10 2-58 1-36 1-18 1-5 5-4 6-3 1-21 1h-9l-9 4-11 14-4 6-7 21-8 9-4 12-2 9-7 8h-2l-3 9-1 15-3 15-2 4-6 5-5 12-4 12-8 10-5 13-3 10-2 3h-2v2h-2v2h-2l-2 5-2 8-3 26-3 5-7 6-2 5-2 22v48l2 10 9 11 81 81 5 8v8l-4 6-12 11-7 8-55 55-5 4-7 8-6 5-7 8-7 5-6-1-9-5-5-5-11-12-36-36v-2h-2l-6-7-8-7-12-12-2-1v-2l-4-2-7-6-2-1h-32l-4-1-4 1-34 2-12 6v2l-5 3-9 2-16 8-7 5-16 5-11 7-5 4-15 3-7 1-7-1-8 4-8 9-2 1-22 3-6-1-12 7-8 6-11 3-20 11-13 6-14 7-14 11-3 4-1 10-1 26-5 5-7 5-2 56-1 65-1 1-14 1-93 1h-48l-3-2-1-8v-90l-1-18-3-7-5-4v-2h-2l-3-8-2-26-4-8-10-10-11-8-12-2-12-7-8-6-12-3-8-4-10-9-8-2-10 1-5-2h-8l-8-5-10-9-13-2-10-6-10-8-8-1-12-5-11-8-18-4-12-1-9-5-8-6-10-2-17-1h-52l-4 1-2 4-68 68h-2l-2 4-8 8h-2l-2 4-4 5-8 6-5-2-8-4-46-46-8-7-30-30-9-11-9-10-2-4 1-6 4-7 9-9h2l2-4 12-12 8-7 4-5 8-7 34-34 9-11 3-5 1-46v-11l-1-12-1-7-8-15-6-13-16-32-8-17-5-11-5-19-4-13-6-12-7-27-5-12-5-10-7-16-9-17-7-16-11-14-4-5-7-2-33-2-9-11-4-1-22-1-95-1-2-3v-148l2-8 72-1 32-1 14-1 6-3 7-9 5-1h23l9-3 6-4 8-10 6-8 4-13 6-11 6-10 4-12 7-12 4-7 4-23 4-11 7-11 4-21 2-9 6-12 6-10 4-12 8-12 5-9 3-10 10-20 2-14 1-20 1-8v-33l-7-10-11-11-4-5-8-7-50-50-7-8-9-10-2-4 1-6 6-10 10-9 7-8 10-10h2l2-4 8-8 6-5 7-8 9-8 7-8 18-18 16-14 4-1 9 3 8 7 7 8 75 75 6 4 13 2 4-1 52-1 12-2 6-4 6-7 20-2 12-2 8-4 9-7 16-5 11-7 6-4 18-7 13-9 7-2 23-3 10-5 8-6 16-5 18-11 15-5 13-10 9-8 2-4 1-27 5-9 8-10 1-3 1-18 1-96z" fill="#FEFEFE" />
                                        <path transform="translate(2046,1261)" d="m0 0h2v787h-787l4-9 7-8 5-4 7-8 12-12h2l2-4h2l2-4 7-8v-94l1-62 3-8 5-5 10-9 7-4 15-5 11-8 8-5h10l9 6 16 17 84 84 8 5 8 2 9-3 9 2 9 4 7 8 12 3 9-2 4-2 2-4 5-6 2-1h27l8-3 10-9 14-13 7-8 262-262 1-2v-24l4-10 7-8h2l2-4 2-5v-9l-4-8-10-10-2-4v-25l-6-9-12-13-76-76-7-8-5-4-6-8-1-7 7-14 7-10 5-16 6-8 13-14 19-1 87-1 57-1 7-4 7-8 13-13 7-8 13-12z" fill="#FEFEFE" />
                                        <path transform="translate(0,1261)" d="m0 0 10 5 12 12 2 1v2l4 2 11 12 5 4 7 8 4 3 14 1h141l9 2 6 5 10 14 5 13 4 10 9 11 3 7v8l-6 8-8 7-7 8-43 43-7 8-4 2v2l-8 7-4 5-8 7-9 10-4 4-5 10 2 6-2 20-5 5-6 5-6 10 2 10 3 5 7 5 3 5 3 20v13l7 8 185 185 5 6 3 2v2l4 2v2l4 2 5 6 7 6 7 8 27 27 8 7 29 29 12 7 5-1 5-2 8 1 12 5 5 5v2l5 2 7 1h9l9-8 4-5 2-1h30l10-6 2-3h2l2-4 13-12 12-13 52-52 6-7 8-7 8-8 4-2 9 2 11 6 5 4 21 9 8 6 8 7 4 6 2 11 1 148 2 6 13 12 24 24 8 10 3 5v2h-786z" fill="#FEFEFE" />
                                        <path transform="translate(1260)" d="m0 0h788v786l-7-1-11-11-7-8-29-29-4-2h-158l-5-2-11-12-6-9-7-21-8-10-4-7 1-9 5-8 13-12 25-25 8-7 7-8 7-6 7-8 33-33 6-7v-23l3-9 4-6 5-4 4-6 2-8-3-9-9-10-4-5-1-5v-22l-7-10-12-13-43-43-7-8-5-4-7-8-22-22-7-6-7-8-9-8-6-7-8-7-6-6v-2l-4-2-64-64v-2l-4-2-13-14-3-2v-2l-4-2-7-8-26-26-8-7-15-15-8-4-7 1-6 1-11-1-7-4-10-10-3-2-7-1-10 3-6 8-4 4-14 2-17-1-6 3-11 12-8 7-21 21-5 6-8 7-21 21-1 2h-2v2l-8 7-6 7h-2v2l-8 7-6 7-7 4-7-1-8-3-8-9-3-2v-2l-12-1-10-4-20-16-1-13v-149l-4-6-43-43z" fill="#FEFEFE" />
                                        <path transform="translate(0)" d="m0 0h785l-1 5-9 10-15 16-14 14-9 7-1 2v39l-1 118-2 7-9 10-11 9-6 2-7-1-8 5-9 10-10 4-9-2-8-7-10-10-7-8-74-74-3-2v-2l-4-2-7-6-9-2-5 1h-9l-10-2-10-9-6-5h-11l-7 3-7 10-6 2-15 1-4-1h-8l-8 5-9 10h-2v2l-8 7-10 11h-2l-2 4-232 232h-2v2l-8 7-9 10-5 5-4 8 1 5 1 4-2 18-12 11-5 9 1 8 3 6 9 7 3 9 2 18v10l7 8 9 9 7 8 77 77 8 7 5 8-1 9-3 6-8 7-5 14-3 10-11 13-6 7-2 1-125 1h-38l-5 5-8 10-25 25-10 8-6 1-1-1z" fill="#FEFEFE" />
                                    </svg>
                                }

                                <span className="r-c-c">
                                    <svg xmlns="http://www.w3.org/2000/svg" className={addr.isDefault ? "f-b mr10" : "mr10"} viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 2.88-2.88 7.19-5 9.88C9.92 16.21 7 11.85 7 9z" /><circle cx="12" cy="9" r="2.5" /></svg>
                                    <p className={addr.isDefault ? "c-b" : ""}>{addr.phone} , {addr.houseApparNum} , {addr.street} , {addr.city} , {addr.zip}</p>
                                </span>
                                {
                                    !addr.isDefault &&
                                    <div className="r-s-c  ml10 cntButonUpdateAdd">
                                        <button className="c-b" onClick={goToUpdate}>update</button>
                                        <button className="c-r" onClick={() => DelAdddress(addr.id)}>delete</button>
                                    </div>
                                }
                            </>
                        }

                    </div>
                )
            }
            return (
                <div style={{ minHeight: "400px" }} className="wmia c-p-s p10">
                    {haveAnAddress ?
                        <>
                            <h1> Saved Addresses</h1>
                            <div className="defaultAddresMAs bg-b br20 p10 mt10 wmia c-s-s">
                                {isLoadingAddress ? <div className="spinner"></div> :
                                    <>
                                        <p className="mb20  r-c-c ml10" style={{ color: "#fff" }}><svg style={{ fill: "#fff" }} xmlns="http://www.w3.org/2000/svg" className="mr10" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q65 0 123 19t107 53l-58 59q-38-24-81-37.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160q133 0 226.5-93.5T800-480q0-18-2-36t-6-35l65-65q11 32 17 66t6 70q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm-56-216L254-466l56-56 114 114 400-401 56 56-456 457Z" /></svg>Your default Address</p>
                                        <h1 className="c-l mrauto r-s-c" style={{ textAlign: "center", color: "#fff" }}>
                                            {userAddress.phone} ,
                                            {userAddress.houseApparNum} ,
                                            {userAddress.street} ,
                                            {userAddress.city} ,
                                            {userAddress.zip}
                                        </h1>
                                        <button className="mt20 w200  br20 " style={{ backgroundColor: "#fff", color: "#000" }} onClick={() => {
                                            dispatch(showUpdateAddress(userAddress));
                                            if (!deviceTypePc) {
                                                naviagate('/update_address');
                                            }
                                        }}><svg xmlns="http://www.w3.org/2000/svg" style={{ fill: "#000" }} className="mr10" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M480-120q-75 0-140.5-28.5t-114-77q-48.5-48.5-77-114T120-480q0-75 28.5-140.5t77-114q48.5-48.5 114-77T480-840q82 0 155.5 35T760-706v-94h80v240H600v-80h110q-41-56-101-88t-129-32q-117 0-198.5 81.5T200-480q0 117 81.5 198.5T480-200q105 0 183.5-68T756-440h82q-15 137-117.5 228.5T480-120Zm112-192L440-464v-216h80v184l128 128-56 56Z" /></svg>Update</button>
                                    </>

                                }
                            </div>
                            <div style={{ minHeight: "200px" }} className="listOfItems mt20 pl20 wmia c-s-s">
                                {
                                    isLoadingAllAddress ? <div className="loader"></div> :
                                        allAddresses.map(addr =>
                                            <SingleAddress addr={addr} key={addr.id} />
                                        )
                                }
                            </div>
                            <BTN_OPEN_ADDRESS className='mt20 w300 p10 br20 bl' />

                        </> :
                        <div className="mrauto c-c-c ">
                            <h1 className="logo mt50">You didn't provide any address yet !</h1>
                            <BTN_OPEN_ADDRESS className={'bl w300 br20 p10 mt20 '} />
                        </div>
                    }
                </div>
            )
        }

        , [userAddress])

    // ---------------------------------------------
    const PaymentMethodCmp = () => {
        const { isVisible, isDeletting, havePaymenthMethod, defaultPaymenthMethod, AllPaymenthMethod, isLodingPay } = useSelector(c => c.paymentMethod);
        const SingleCardElem = ({ c }) => {
            function sendTodelet() {
                dispatch(DeleteCard(c.id))
            }
            function sendToSetAsDef() {
                dispatch(SetCardAsDef(c.id))
            }

            return (
                <div className="listCardElem r-b-c psr p10 mt10 br20 wmia">

                    {c.isDefault ?
                        <svg className="iconeIsdefault f-b" version="1.1" viewBox="0 0 2048 2048" width="128" height="128" xmlns="http://www.w3.org/2000/svg">
                            <path transform="translate(810)" d="m0 0h426l1 3 17 9 13 9 9 7 9 11 7 11 6 16 5 21 1 15v131l5 2 21 8 10 5 17 6 24 11 5 2 2-4h2l2-4 6-7 8-7 8-8 7-8 51-51 11-9 12-10 15-9 11-5 18-4h22l17 4 12 5 12 7 16 12 8 8 8 7 95 95v2l4 2v2l4 2 7 7 5 6 7 6 6 7 6 5 5 6 7 6 77 77 7 8 10 10 13 17 9 14 6 13 4 18v22l-4 15-4 9-8 14-10 14-12 14-10 10-7 8-6 5-7 8-8 7-7 8-13 12-23 23-6 5-1 4 6 9 12 29 15 36 3 3 136 1 20 3 15 4 14 7 12 9 9 8 9 12 13 22 2 5h2v423l-4 2-12 22-9 11-8 8-18 13-15 5-18 4-16 2-132 1-3 3-4 8-10 24-10 25-7 15 1 6 7 8 5 5 9 10 69 69 11 14 10 15 8 16 4 16v24l-4 16-8 16-7 11-10 13-9 10-7 8-224 224-8 7-11 10-11 9-15 9-12 5-12 3-14 2h-16l-11-2-16-6-15-9-14-12-12-11-12-12-6-5-7-8-51-51-7-5-1-2h-3v-2l-17 8-27 11-21 8-9 4-4 4-1 8v130l-2 14-5 17-5 12-12 18-10 11-11 7-15 7h-2l1 7v2h-425v-2l-5-2-20-10-14-9-10-9-9-12-8-13-7-25-2-10-1-142-5-2-10-5-58-24-4-2-5 1-16 16-7 8-4 2v2h-2l-2 4-20 20-5 6-8 7-23 23-11 9-7 6-13 8-12 6-15 4-16 2h-13l-16-3-16-7-12-8-10-8-20-18-163-163v-2l-4-2-4-4v-2l-3-1-5-6-7-6-5-6-7-6-5-5v-2l-3-1-5-6-8-7-4-4v-2l-3-1-7-8-12-13-12-17-9-17-4-14-1-6v-20l4-17 7-16 13-19 12-13 7-8 28-28 7-8h2l2-4 12-12 8-7 14-14 7-8 2-4-10-21-8-22-9-20-5-14-1-2h-147l-21-5-15-6-9-6-14-12-9-11-4-6-8-16-4-4-1-6-1-2v-417h2l2-5 11-19 11-14 2-3h2v-2l16-12 14-7 17-5 13-2h134l7-2 5-6 11-25 11-30 7-12v-5l-7-9-10-10-6-7-66-66-9-11-11-15-10-19-4-13-1-6v-18l3-16 5-13 7-13 12-16 9-10 5-6h2l1-3 8-7 66-66 3-4h2l1-3 8-7 5-6h2l1-3 8-7 1-2h2l2-4h2l2-4 6-5 2-3h2l2-4 9-8 7-8 8-8h2l2-4 84-84 11-9 13-10 17-9 17-5 6-1h22l16 4 15 6 14 9 13 11 8 7 7 7 7 6 5 6 7 6 5 6 12 12 3 2v2l4 2v2l4 2v2l4 2 8 8 7 8 5 4 4 4v2l4 2 2 2 6-1 17-8 31-12 20-8 5-5 1-6v-107l1-28 3-15 4-15 5-12 13-17 10-9 10-7 17-10zm424 1m-120 184-184 1v111l-3 26-4 14-8 15-12 16-9 8-16 8-28 11-35 12-30 10-17 7-62 31-19 8-21 8-10 3-19 1-7-1-16-5-17-9-12-9-12-11-8-7-39-39-7-8-9-9-7-8-5-2-5 3-10 10-3 2v2l-4 2-44 44v2l-4 2-8 8v2l-4 2-20 20v2l-4 2-5 6-3 2v2l-4 2v2l-4 2v2l-3 1-5 7 1 6 16 15 21 21h2v2l8 7 17 17 1 2h2l2 4 9 9 11 15 9 16 6 15 2 9v17l-3 14-9 24-8 18-27 54-11 27-12 36-11 32-9 20-7 14-8 10-6 7-14 9-12 6-17 4-29 3-40 1h-66v187l43-1h46l26 1 19 2 15 4 16 8 11 8 9 9 9 13 8 16 8 20 17 50 9 25 13 29 24 48 11 27 4 13 1 7v14l-2 11-8 20-9 15-11 14-8 8-7 8-21 21-7 6-7 8-12 11-3 2v2l-4 2-6 5-2 4 1 5 9 11h2l1 3 6 5 76 76 7 8 13 12 8 8 6 4 4-1 6-5 7-8v-2h2l8-8v-2l4-2 2-4h2l7-8 34-34 14-11 15-11 20-9 12-2h11l17 2 19 6 17 7 23 11 19 10 31 15 26 10 51 17 28 11 16 9 11 9 8 10 8 13 5 11 3 11 2 13 1 13 1 111h183l1-5 2-113 2-17 3-13 7-14 12-16 1-3 4-2 13-11 19-9 30-11 52-18 21-9 35-17 16-8 21-10 23-9 12-3h26l16 4 16 7 11 7 13 11 4 4h2l1 3 8 7 34 34 7 8 8 7 9 10 5 4 5-1 6-5 7-8 15-14 7-8 40-40v-2h2v-2l4-2 28-28 8-6v-2h2l4-5v-2h2l1-7-9-10-17-17-8-7-22-22-6-7-13-13-11-14-7-10-9-19-5-17v-10l2-15 5-15 11-26 11-23 10-19 13-28 8-21 12-36 11-32 8-18 4-8 10-13 9-10 15-9 13-6 20-4 12-1h113l1-29 1-93v-56l-1-8-14-1h-71l-38-1-19-3-11-4-14-8-10-8-7-7-9-13-7-14-11-28-14-41-10-28-14-30-15-30-12-26-8-21-4-18-1-10 3-14 6-15 10-19 10-12 7-8 3-3v-2h2l7-8 43-43 11-9 6-7-1-6-12-13-43-43-1-2h-2l-2-4h-2l-2-4h-2l-2-4-12-12h-2v-2h-2v-2h-2l-2-4h-2l-2-4-30-30-9-2-8 7-7 7v2l-4 2-4 4v2l-3 1-7 8-13 13v2l-4 2v2l-4 2v2l-3 1-6 7-8 7-11 10-9 7-11 7-20 8-11 3h-28l-30-12-35-17-38-19-25-10-47-16-31-11-19-9-10-7-10-9-8-11-10-19-4-16-2-18-1-115zm126 1855m-4 1 4 1zm-2 1m-4 1m8 0m-4 1m-7 1m3 0 4 1z" />
                            <path transform="translate(1213,794)" d="m0 0h17l16 3 16 6 14 8 10 9 8 8 10 15 6 13 5 21v19l-4 20-7 14-12 18-9 11-4 5h-2l-2 4-28 28-6 5-223 223-11 9-12 9-10 6-20 8-13 3h-20l-19-5-16-8-9-6-16-13-12-11-7-7-6-5-6-7-6-5-7-8-39-39-7-6-5-6-17-17-11-14-10-14-8-16-5-16-1-6v-18l5-19 8-16 9-13 11-12 18-13 14-6 13-3 7-1h16l16 3 12 4 14 7 14 10 10 9 8 7 28 28 7 8 6 6 4-1 11-11 7-6 34-34 5-6 8-7 6-7h2v-2l8-7 65-65 1-2h2l2-4 11-10 7-8 4-2v-2h2v-2h2l2-4 10-10h2v-2h2l2-4 12-11 11-9 13-9 15-7 15-4z" />
                            <path transform="translate(1239)" d="m0 0h11l-1 3-9-1z" />
                            <path transform="translate(806,2045)" d="m0 0 8 2v1h-7z" />
                            <path transform="translate(794,2042)" d="m0 0 4 1-2 3-3-3z" />
                            <path transform="translate(799,2045)" d="m0 0h2l-1 3z" />
                            <path transform="translate(815,2046)" d="m0 0 2 2h-2z" />
                            <path transform="translate(803,2046)" d="m0 0 2 2h-2z" />
                            <path transform="translate(2047,1245)" d="m0 0 1 2-2-1z" />
                            <path transform="translate(0,1233)" d="m0 0 2 2h-2z" />
                            <path transform="translate(814,2045)" d="m0 0" />
                            <path transform="translate(265,1382)" d="m0 0" />
                            <path transform="translate(807)" d="m0 0" />
                        </svg>
                        :
                        <svg onClick={sendToSetAsDef} className="iconeIsdefault" version="1.1" viewBox="0 0 2048 2048" width="128" height="128" xmlns="http://www.w3.org/2000/svg">
                            <path transform="translate(0)" d="m0 0h2048v2048h-2048z" fill="#010101" />
                            <path transform="translate(946,192)" d="m0 0h155l2 2 1 108 1 11 11 11 2 7 3 30 7 8 12 10 16 6 12 6 5 4 20 8 7 4 5 5 9 3 5 2 3-2h10l11 3 5 5 4 5 7 2 10 2 2-2 9 1 11 4 5 4 4 4 22 8 6 4 5 5 15 5 10 4 6 7 5 2 11 2 3-1h57l10-3 10-9 13-12 14-15 13-13h2l2-4h2l2-4 30-30 8-7 6-1 7 3 9 7 7 8 84 84 6 10v8l-7 8-5 4-7 8-55 55-7 6-7 8-3 3h-2l-2 4-2 5v60l2 18 9 11 8 21 9 15 8 20 7 10 3 10 3 15v9l4 6 5 4 3 7 4 22 1 10 7 9 4 8 6 16 9 14 6 17 6 8 9 11 7 3 14 1h11l11 4 4 5 4 6 121 2 2 3v153l-10 2-58 1-36 1-18 1-5 5-4 6-3 1-21 1h-9l-9 4-11 14-4 6-7 21-8 9-4 12-2 9-7 8h-2l-3 9-1 15-3 15-2 4-6 5-5 12-4 12-8 10-5 13-3 10-2 3h-2v2h-2v2h-2l-2 5-2 8-3 26-3 5-7 6-2 5-2 22v48l2 10 9 11 81 81 5 8v8l-4 6-12 11-7 8-55 55-5 4-7 8-6 5-7 8-7 5-6-1-9-5-5-5-11-12-36-36v-2h-2l-6-7-8-7-12-12-2-1v-2l-4-2-7-6-2-1h-32l-4-1-4 1-34 2-12 6v2l-5 3-9 2-16 8-7 5-16 5-11 7-5 4-15 3-7 1-7-1-8 4-8 9-2 1-22 3-6-1-12 7-8 6-11 3-20 11-13 6-14 7-14 11-3 4-1 10-1 26-5 5-7 5-2 56-1 65-1 1-14 1-93 1h-48l-3-2-1-8v-90l-1-18-3-7-5-4v-2h-2l-3-8-2-26-4-8-10-10-11-8-12-2-12-7-8-6-12-3-8-4-10-9-8-2-10 1-5-2h-8l-8-5-10-9-13-2-10-6-10-8-8-1-12-5-11-8-18-4-12-1-9-5-8-6-10-2-17-1h-52l-4 1-2 4-68 68h-2l-2 4-8 8h-2l-2 4-4 5-8 6-5-2-8-4-46-46-8-7-30-30-9-11-9-10-2-4 1-6 4-7 9-9h2l2-4 12-12 8-7 4-5 8-7 34-34 9-11 3-5 1-46v-11l-1-12-1-7-8-15-6-13-16-32-8-17-5-11-5-19-4-13-6-12-7-27-5-12-5-10-7-16-9-17-7-16-11-14-4-5-7-2-33-2-9-11-4-1-22-1-95-1-2-3v-148l2-8 72-1 32-1 14-1 6-3 7-9 5-1h23l9-3 6-4 8-10 6-8 4-13 6-11 6-10 4-12 7-12 4-7 4-23 4-11 7-11 4-21 2-9 6-12 6-10 4-12 8-12 5-9 3-10 10-20 2-14 1-20 1-8v-33l-7-10-11-11-4-5-8-7-50-50-7-8-9-10-2-4 1-6 6-10 10-9 7-8 10-10h2l2-4 8-8 6-5 7-8 9-8 7-8 18-18 16-14 4-1 9 3 8 7 7 8 75 75 6 4 13 2 4-1 52-1 12-2 6-4 6-7 20-2 12-2 8-4 9-7 16-5 11-7 6-4 18-7 13-9 7-2 23-3 10-5 8-6 16-5 18-11 15-5 13-10 9-8 2-4 1-27 5-9 8-10 1-3 1-18 1-96z" fill="#FEFEFE" />
                            <path transform="translate(2046,1261)" d="m0 0h2v787h-787l4-9 7-8 5-4 7-8 12-12h2l2-4h2l2-4 7-8v-94l1-62 3-8 5-5 10-9 7-4 15-5 11-8 8-5h10l9 6 16 17 84 84 8 5 8 2 9-3 9 2 9 4 7 8 12 3 9-2 4-2 2-4 5-6 2-1h27l8-3 10-9 14-13 7-8 262-262 1-2v-24l4-10 7-8h2l2-4 2-5v-9l-4-8-10-10-2-4v-25l-6-9-12-13-76-76-7-8-5-4-6-8-1-7 7-14 7-10 5-16 6-8 13-14 19-1 87-1 57-1 7-4 7-8 13-13 7-8 13-12z" fill="#FEFEFE" />
                            <path transform="translate(0,1261)" d="m0 0 10 5 12 12 2 1v2l4 2 11 12 5 4 7 8 4 3 14 1h141l9 2 6 5 10 14 5 13 4 10 9 11 3 7v8l-6 8-8 7-7 8-43 43-7 8-4 2v2l-8 7-4 5-8 7-9 10-4 4-5 10 2 6-2 20-5 5-6 5-6 10 2 10 3 5 7 5 3 5 3 20v13l7 8 185 185 5 6 3 2v2l4 2v2l4 2 5 6 7 6 7 8 27 27 8 7 29 29 12 7 5-1 5-2 8 1 12 5 5 5v2l5 2 7 1h9l9-8 4-5 2-1h30l10-6 2-3h2l2-4 13-12 12-13 52-52 6-7 8-7 8-8 4-2 9 2 11 6 5 4 21 9 8 6 8 7 4 6 2 11 1 148 2 6 13 12 24 24 8 10 3 5v2h-786z" fill="#FEFEFE" />
                            <path transform="translate(1260)" d="m0 0h788v786l-7-1-11-11-7-8-29-29-4-2h-158l-5-2-11-12-6-9-7-21-8-10-4-7 1-9 5-8 13-12 25-25 8-7 7-8 7-6 7-8 33-33 6-7v-23l3-9 4-6 5-4 4-6 2-8-3-9-9-10-4-5-1-5v-22l-7-10-12-13-43-43-7-8-5-4-7-8-22-22-7-6-7-8-9-8-6-7-8-7-6-6v-2l-4-2-64-64v-2l-4-2-13-14-3-2v-2l-4-2-7-8-26-26-8-7-15-15-8-4-7 1-6 1-11-1-7-4-10-10-3-2-7-1-10 3-6 8-4 4-14 2-17-1-6 3-11 12-8 7-21 21-5 6-8 7-21 21-1 2h-2v2l-8 7-6 7h-2v2l-8 7-6 7-7 4-7-1-8-3-8-9-3-2v-2l-12-1-10-4-20-16-1-13v-149l-4-6-43-43z" fill="#FEFEFE" />
                            <path transform="translate(0)" d="m0 0h785l-1 5-9 10-15 16-14 14-9 7-1 2v39l-1 118-2 7-9 10-11 9-6 2-7-1-8 5-9 10-10 4-9-2-8-7-10-10-7-8-74-74-3-2v-2l-4-2-7-6-9-2-5 1h-9l-10-2-10-9-6-5h-11l-7 3-7 10-6 2-15 1-4-1h-8l-8 5-9 10h-2v2l-8 7-10 11h-2l-2 4-232 232h-2v2l-8 7-9 10-5 5-4 8 1 5 1 4-2 18-12 11-5 9 1 8 3 6 9 7 3 9 2 18v10l7 8 9 9 7 8 77 77 8 7 5 8-1 9-3 6-8 7-5 14-3 10-11 13-6 7-2 1-125 1h-38l-5 5-8 10-25 25-10 8-6 1-1-1z" fill="#FEFEFE" />
                        </svg>
                    }
                    <div className="r-s-c">
                        <img src={getrealImg(c.cardType)} alt="" className="w50" />
                        <div className="c-s-s ml15">
                            <p className="ml20">{Khazl(c.CardNumber)}</p>
                            <span className="mt5">{c.ExpiryDate}</span>
                        </div>
                    </div>
                    {!c.isDefault &&
                        <div className="r-s-c  ml10 cntButonUpdate3">
                            <button className="c-b hoverEff2" onClick={() => dispatch(showUpatePaymentMethod(c))}>update</button>
                            <button className="c-r hoverEff2" onClick={sendTodelet}>delete</button>
                        </div>

                    }


                </div>
            )
        }


        return (
            <div style={{ minHeight: "400px" }} className="wmia br20 pl20 mt15  psr c-s-s p5 mt5">
                {
                    isLodingPay ? <div className="loader"></div>
                        : havePaymenthMethod ?
                            <>

                                <h1>Payment Methods </h1>
                                <div className="defaultAddresMAs bg-b br20 p10 mt10 wmia c-s-s">
                                    {isLodingPay ? <div className="spinner"></div> :
                                        <>
                                            <p className="mb20  r-c-c ml10" style={{ color: "#fff" }}><svg style={{ fill: "#fff" }} xmlns="http://www.w3.org/2000/svg" className="mr10" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q65 0 123 19t107 53l-58 59q-38-24-81-37.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160q133 0 226.5-93.5T800-480q0-18-2-36t-6-35l65-65q11 32 17 66t6 70q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm-56-216L254-466l56-56 114 114 400-401 56 56-456 457Z" /></svg>Your default Payment Method</p>
                                            <span className=" wmia br20 p10 cntDefaultCard r-p-c" style={{ textAlign: "center", color: "#fff" }}>
                                                <img className="w70" src={getrealImg(defaultPaymenthMethod?.cardType)} alt="" />
                                                <div className="c-s-s">
                                                    <h1>
                                                        {defaultPaymenthMethod && Khazl(defaultPaymenthMethod.CardNumber)}
                                                    </h1>
                                                    <p>{defaultPaymenthMethod?.CardholderName}</p>
                                                </div>
                                                <h2>{defaultPaymenthMethod?.ExpiryDate}</h2>
                                            </span>

                                            <button className="mt20 w200  br20 " style={{ backgroundColor: "#fff", color: "#000" }} onClick={() => { dispatch(showUpatePaymentMethod(defaultPaymenthMethod)) }}><svg xmlns="http://www.w3.org/2000/svg" style={{ fill: "#000" }} className="mr10" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M480-120q-75 0-140.5-28.5t-114-77q-48.5-48.5-77-114T120-480q0-75 28.5-140.5t77-114q48.5-48.5 114-77T480-840q82 0 155.5 35T760-706v-94h80v240H600v-80h110q-41-56-101-88t-129-32q-117 0-198.5 81.5T200-480q0 117 81.5 198.5T480-200q105 0 183.5-68T756-440h82q-15 137-117.5 228.5T480-120Zm112-192L440-464v-216h80v184l128 128-56 56Z" /></svg>Update</button>
                                        </>
                                    }
                                </div>
                                <div className="listAllCards c-s-s ">
                                    {isLodingPay ? <div className="spinner"></div> :
                                        <>
                                            {AllPaymenthMethod && AllPaymenthMethod.map(c =>
                                                <SingleCardElem c={c} key={c.id} />

                                            )}
                                        </>
                                    }
                                </div>
                                <button className="bl p10 br20 w300 mt50" onClick={() => GoToAddPaymentMethod()}>
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
                                    </svg>Add a new payment method
                                </button>
                            </> :
                            <div className="mrauto c-c-c">
                                <h1 className="logo mt50">You didn't provide any Any Payment Method yet !</h1>
                                <button className="bl p10 br20 w300 mt20 " onClick={() => GoToAddPaymentMethod()}>
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
                                    </svg>Add a  payment method
                                </button>
                            </div>
                }

            </div>
        )
    }


    const DeletAccount = () => {



        return (
            <div style={{ minHeight: "400px" }} className="wmia br20 pl20 mt15  psr c-s-s p5 mt5">
                <h1>Delete Account</h1>
                <div className="mt20 ">
                    <h2>Warning: Account Deletion</h2>
                    <p className="mt10">
                        Before proceeding, please note the following:
                    </p>
                    <ul className="mt20 ml20">
                        <li style={{ listStyle: "initial" }} className="mt10"> <p>All <b>payment methods</b> associated with your account will be permanently deleted. </p></li>
                        <li style={{ listStyle: "initial" }} className="mt10"> <p>Your saved <b>addresses</b> will no longer be available. </p></li>
                        <li style={{ listStyle: "initial" }} className="mt10"> <p>Any pending or completed <b>orders</b> will be permanently removed from your account. </p></li>
                        <li style={{ listStyle: "initial" }} className="mt10"> <p>Your <b>shopping cart</b> and wishlists will be cleared. </p></li>
                        <li style={{ listStyle: "initial" }} className="mt10"> <p>You will lose access to all account-related data, including order history and account preferences. </p></li>
                        <li style={{ listStyle: "initial" }} className="mt10"> <p> This action is <b>irreversible</b>, and you will need to create a new account to use our services again. </p></li>
                    </ul>
                    <p className="mt50">Are you sure you want to delete your account?</p>

                    <div className="modal-actions mt20">
                        <button className="bg-r w300 p10 r-c-c" onClick={() => { dispatch(showReauthentCmp()) }} >
                            Yes, Delete My Account <svg style={{ fill: "#fff" }} xmlns="http://www.w3.org/2000/svg" className="ml10" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" /></svg>
                        </button>
                        <button className="bl mt20  w300 p10" onClick={() => dispatch(logoutUser())}>
                            Log out only <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z" /></svg>
                        </button>
                        <button onClick={() => dispatch(hideProfile())} className=" mt20  w200 p10" >
                            Cancel
                        </button>

                    </div>
                </div>
            </div>
        )
    }

    return ReactDOM.createPortal(
        <div className="backendMer">
            <main className="profileCmp activeCmp psr bg-l p20 br20 r-s-s ">
                <button className="btnClose  r-c-c" onClick={() => dispatch(hideProfile())}>Close <svg xmlns="http://www.w3.org/2000/svg" className="ml10" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" /></svg></button>
                <div className="sideBareProfile psr w200 c-p-s p10">
                    <span onClick={() => setcomponenetVisiblety({ ...o, v1: true })} className="wmia hoverEff1  r-s-c p10 ">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr10" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z" /></svg>
                        User Information
                    </span>
                    <span onClick={() => setcomponenetVisiblety({ ...o, v2: true })} className="wmia hoverEff1 mt15  r-s-c p10 ">
                        <svg version="1.1" viewBox="0 0 2048 2048" className="mr10" xmlns="http://www.w3.org/2000/svg">
                            <path transform="translate(818)" d="m0 0h7l1 2 1-2h183l10 3v2l12 1 38 7 37 8 46 12 30 9 41 15 28 12 29 14 17 8 22 12 27 16 14 9 24 16 19 14 20 15 14 11 14 12 10 9 2 1v2l4 2 7 7 8 7 12 11 21 21 7 8 11 12 7 8 14 17 11 14 14 18 10 14 22 33 7 11 9 15 15 27 18 36 13 28 13 33 13 37 10 33 12 50 6 33 7 50 3 33 2 48v38l-2 43-4 35-8 43-7 36-2 9-1 2-5-1-20-9-26-8-39-10-38-8-22-5-6-3 1-9 5-18 5-26 3-20 3-34 1-20v-32l-3-52-3-31-6-37-8-36-10-36-10-30-10-26-13-29-9-19-12-22-14-25-13-20-11-16-12-17-10-13-9-11-13-15-4-4v-2h-2l-7-8-6-6v-2h-2l-7-8-11-11-8-7-14-13-25-20-17-13-16-11-18-12-21-13-23-13-15-8-28-13-33-14-37-13-25-7-40-10-35-6-42-5-30-2-30-1-45 2-33 3-38 6-34 7-29 8-26 8-40 15-25 11-29 14-24 13-38 24-12 8-16 12-14 11-9 7-15 13-12 11-13 12-27 27-7 8-13 14-9 12h-2l-2 5-7 9-12 16-14 20-15 24-15 26-15 29-9 19-12 29-10 29-8 25-11 42-5 25-4 27-4 42-2 27-1 23v25l2 30 4 34 7 39 8 32 12 40 13 37 12 29 10 23 13 28 14 28 12 22 15 27 14 23 16 26 10 16 16 24 11 16 14 20 10 14 12 16 10 14 12 16 14 18 12 15 13 17 11 13 8 10 12 14 9 11 10 11 9 11 11 12 7 8 10 11 7 8 9 10 5 6 22 22 7 8 9 9 7 8 16 17 9 9 7 8 25 25v2l4 2 22 22 6 5 24 24 8 7 17 17 8 7 7 6v2l4 2 9 9 8 7 12 11 8 7 13 12 11 10 11 9 13 12 11 9 15 13 16 15 13 11 10 9 8 7 12 10 9 7 5 5-2 4-12 10-8 7-12 11-8 7-10 9-11 10-8 7-10 9-14 11-10 8-3 1v2h-2l-2 4-9 6-10-10-11-9-13-10-14-11-13-11-11-9-12-11-8-7-11-10-11-9-9-9-11-9-7-7-11-9-8-8-8-7-10-9-8-8-8-7-9-9-8-7-21-21-8-7-13-13-8-7-26-26-5-4-7-8-26-26v-2h-2l-7-8-16-17-14-15-9-10-7-8-12-13-10-11-7-8-11-12-9-11-11-12-9-11-8-9-11-14-11-13-18-22-12-14-11-14-14-18-8-11-12-16-10-13-14-19-13-18-12-17-30-45-11-18-10-15-13-21-15-26-16-29-14-26-15-28-16-34-15-35-11-29-9-25-14-44-10-40-8-38-5-30-4-41-2-38v-33l2-39 3-40 4-30 8-49 7-30 9-35 8-26 10-29 15-38 14-31 18-36 13-23 9-15 8-13 18-27 7-10 10-14 21-28 11-13 7-8 7-7 8-10 7-7 7-8 8-8 7-8 10-9 13-13 8-7 13-12 11-9 9-8 19-14 30-22 24-16 26-16 35-20 21-10 15-8 28-12 21-8 16-6 36-12 34-10 39-9 35-7 29-5 2-1z" />
                            <path transform="translate(1410,1142)" d="m0 0 42 1h112l3 1 1 2v115l1 16 2 8 12 5 18 5 27 12 16 8 7 3 3-3h2v-2h2l2-4 7-7 7-8h2v-2l7-6 7-8 4-4h2v-2l13-13 8-7 4-5 8-7 16-17 5-5 5 2 10 10 7 8 26 26 2 1v2l4 2 12 12 7 8 31 31 8 11 1 4-4 5-10 8-36 36-1 2h-2l-2 4h-2v2l-8 7-21 21-8 7-4 2v7l8 13 8 18 8 19 8 25 1 2 3 1 141 1 1 1 1 101v54l-2 3-3 1-118 1-24 1-7 24-13 29-11 21 1 6 6 9 3 3v2h2v2h2l4 5 8 7 34 34v2l3 1 7 8 8 7 7 8 9 10 2 4v5l-13 12-8 7-4 5-7 6-1 2h-2l-2 4-48 48-7 6-7 8-9 9-4-1-9-7-8-10-8-7-52-52-7-8-12-12-4-1-16 7-8 4-36 14-20 7h-2v143h-160l-1-20-1-120-4-4-33-11-27-13-11-6-8-1-7 7-7 8-7 6-7 8-10 10-1 2h-2l-2 4-6 6h-2l-2 4-8 8-16 14-7 8-11 12-3 2-13-10-7-9-8-7-70-70-10-8-6-7 2-4 11-11 7-8 73-73 5-8-1-6-9-16-13-32-9-27h-145l-2-5v-155l3-2h133l11-2 4-9 8-24 11-26 10-17-2-6-6-7-8-7-9-10-33-33-8-7v-2l-3-1-5-6-6-5v-2l-4-2-10-8-5-6 1-5 16-16 5-6 6-5 3-4h2l2-4h2v-2l8-7 6-7h2v-2l8-7 5-6 8-7 22-22 6-7h2l2-4 5-5 5 1 9 9 7 9 11 11 8 7 49 49 7 8 5 4 4 1 24-12 23-9 27-9 3-3 1-4 1-46 1-82 2-9zm65 294-22 3-19 5-18 8-14 9-13 10-15 14-9 9-9 12-8 13-6 12-8 24-4 18-2 23 2 22 3 15 5 16 7 17 9 16 10 14 11 12 7 7 10 8 19 12 17 8 21 7 23 4h28l21-3 15-4 21-9 16-9 17-12 16-15 11-13 12-19 8-20 6-22 3-24v-12l-2-25-5-19-8-21-10-19-11-15-9-10-9-9-13-10-17-10-21-9-16-5-15-3-9-1z" />
                            <path transform="translate(889,440)" d="m0 0h59l31 3 22 4 31 8 28 10 23 10 22 12 18 11 19 13 10 8 13 10 12 11 8 7 15 15 7 8 10 12 11 15 9 13 12 19 14 27 7 15 10 27 8 26 5 22 5 33 2 24v34l-2 21-6 40-6 24-10 32-16 36-13 23-10 16-14 20-9 12-18 21h-2l-2 4-24 22-14 11-12 9-15 10-20 12-18 10-28 12-25 9-25 7-28 6-34 4-17 1h-36l-24-2-36-6-29-8-29-10-33-15-24-14-14-9-11-8-13-10-13-11-10-9-7-6-5-6-5-5-13-14-11-14-10-13-14-21-12-21-8-15-13-31-7-21-7-27-5-24-4-31-1-15v-27l3-30 6-36 7-28 9-27 15-34 11-20 14-23 9-12 7-9 10-13 12-14 23-23 8-7 16-13 13-10 15-10 24-14 26-13 28-11 18-6 30-7 26-4zm17 161-24 2-24 5-20 7-23 11-14 9-10 7-16 13-11 10-7 8-9 10-8 11-8 13-8 14-8 19-9 27-4 19-2 17-1 21 3 29 5 24 6 18 8 19 10 19 13 19 11 13 6 7h2v2l8 7 10 9 15 11 20 12 22 10 17 6 19 5 29 4h27l23-3 16-3 19-5 24-10 22-12 12-8 13-10 12-11 2-1v-2l4-2 13-15 6-8 9-13 13-24 12-36 5-25 2-22v-13l-2-22-4-25-6-20-8-20-8-16-10-17-12-16-12-14-12-11-17-13-14-9-18-10-16-7-24-8-18-4-20-2z" />
                            <path transform="translate(1034)" d="m0 0h17v2h-16z" />
                            <path transform="translate(913,2046)" d="m0 0 2 1h-3z" />
                            <path transform="translate(1021,3)" d="m0 0 2 1z" />
                            <path transform="translate(915,2047)" d="m0 0" />
                            <path transform="translate(1653,1874)" d="m0 0" />
                            <path transform="translate(1020)" d="m0 0" />
                            <path transform="translate(793)" d="m0 0" />
                        </svg>

                        Address Management
                    </span>
                    <span onClick={OpenPaymentMethodsSection} className="wmia hoverEff1  mt15 r-s-c p10 ">
                        <svg version="1.1" viewBox="0 0 2048 2048" className="mr10" xmlns="http://www.w3.org/2000/svg">
                            <path transform="translate(1770,240)" d="m0 0h35l19 3 18 6 21 10 15 10 11 9 13 12 11 14 10 16 9 19 7 23 4 21 6 46 9 78 12 110 9 75 10 86 7 60 6 53 8 66 9 79 11 90 8 62 8 59h2v84l-1 2-3 1-12 28-14 20-9 11-6 7-8 7-10 9-14 10-16 8-21 7-20 5-34 5-18 2-3 1-1 167-2 39-2 19-3 16-7 19-10 19-8 12-12 14-11 11-18 13-16 8-19 7-22 5-19 2-16 1h-1540l-31-3-22-6-18-8-11-7-12-9-12-11-11-11-12-17-9-16-13-27-2-1v-976l8-16 10-21 12-20 13-16 1-2h2v-2h2v-2l8-7 12-9 16-10 17-8 13-4 25-4 12-1 33-1h1452l52 1 33 2 18 3 16 5 16 7 18 11 13 10 12 11v2h2l12 16 9 15 9 19 5 15 3 12 3 28 1 19v443l-1 23-1 11-4 8-5 4-9 3-5 1h-17l-8-3-6-5-4-9-1-5-1-488-2-20-3-12-5-13-10-15-12-13-10-8-17-9-14-4-21-2-236-1h-1019l-284 1-28 2-12 3-16 8-11 8-11 11-8 11-9 17-4 11-3 25-1 102v748l1 50 2 19 4 16 5 11 7 12 12 13 11 9 14 8 15 5 13 2 13 1 50 1h127l375 1h641l355-2 20-3 12-4 12-6 14-10 10-10 7-10 8-16 4-16 2-15 1-20 1-107 1-168 1-14 3-5 5-4 10-5 6-1h15l11 4 5 5 2 10 4 36 1 3h14l22-3 19-4 21-8 10-6 9-7 10-10 8-13 7-16 3-14 1-9v-21l-4-44-9-80-10-83-7-65-11-92-11-94-7-61-14-119-7-61-11-96-9-78-4-27-5-16-6-15-9-14-12-12-11-8-16-8-9-3-10-2h-33l-36 3-99 12-72 8-65 8-81 9-56 7-62 7-64 8-84 9-66 8-81 9-65 8-61 7-56 7-84 9-67 8-71 8-65 8-71 8-73 9-80 9-64 8-25 5-11 5-11 7-11 9-14 12-8 6-11 4h-5l-11-8-8-8-4-6-1-3v-13l4-10 9-12 11-11 12-9 18-11 15-7 16-5 27-5 51-7 68-8 52-6 73-9 71-8 58-7 66-7 83-10 62-7 64-8 72-8 74-9 63-7 74-9 72-8 56-7 81-9 67-8 71-8 75-9 130-15z" />
                            <path transform="translate(340,944)" d="m0 0h79l46 1 26 1 14 2 13 5 10 5 12 9 11 11 10 15 7 14 4 15 1 9 1 26v89l-2 35-4 18-6 14-6 10-8 10-5 5-8 7-17 9-12 4-21 3-16 1-48 1h-85l-48-1-22-2-16-4-14-7-11-9-9-9-10-14-8-17-4-15-2-16-1-31v-63l1-34 2-18 3-14 7-17 9-13 5-6 8-7 12-9 15-7 14-3 26-2zm-58 62-13 2-6 4-4 5-4 9-2 12-1 12v117l3 14 5 10 7 6 18 4 12 1h163l20-1 14-3 6-4 5-6 3-5 2-8 2-27v-86l-2-35-4-12-7-6-10-2-18-1z" />
                            <path transform="translate(525,1523)" d="m0 0h271l77 1 10 4 6 5 2 4 1 14-1 13-4 10-4 5-9 3-61 1h-563l-34-1-10-2-7-6-5-10-1-6v-9l3-12 6-8 6-4 7-1h69z" />
                            <path transform="translate(1531,817)" d="m0 0h14l7 3 8 9 11 21 10 26 10 33 5 24 3 22 1 14v42l-2 26-4 25-6 24-12 36-13 27-8 11-7 5-3 1h-7l-13-4-9-6-9-9-2-4 2-12 6-18 9-24 8-27 5-26 2-16 1-16v-32l-2-23-6-29-6-20-13-37-5-15-1-4v-7l7-8 11-8z" />
                            <path transform="translate(668,1362)" d="m0 0h165l39 1 10 3 8 7 2 7-1 23-3 10-6 7-3 1-15 1h-256l-18-2-7-7-4-8-1-4v-13l3-11 5-8 9-6z" />
                            <path transform="translate(272,1362)" d="m0 0h190l26 1 9 4 7 6 3 6v21l-3 10-6 8-7 3-24 1h-248l-11-1-6-3-6-9-2-6-1-14 3-14 5-6 10-5 3-1z" />
                            <path transform="translate(1439,1362)" d="m0 0h179l22 1 13 3 6 4 3 7v20l-2 12-6 9-9 3-40 1h-217l-22-1-7-2-6-7-4-10-1-5v-9l4-13 6-8 8-4z" />
                            <path transform="translate(1051,1362)" d="m0 0h165l38 1 12 3 7 4 3 3 1 3v22l-2 11-6 9-11 3-68 1h-197l-15-1-5-2-6-8-3-9-1-5v-10l3-11 6-8 8-5z" />
                            <path transform="translate(1418,875)" d="m0 0h10l10 5 8 9 8 15 9 24 5 20 3 19 1 12v25l-2 21-5 24-7 21-8 18-7 10-7 6-4 2-7 1-12-2-12-6-7-7-2-5v-13l12-41 4-21 1-9v-29l-3-17-6-21-9-28-1-10 4-8 4-5 9-6z" />
                            <path transform="translate(344,1074)" d="m0 0h74l9 2 10 6 5 6 2 4v21l-4 9-8 7-8 3-10 1h-73l-8-3-5-5-6-9-1-4v-17l5-10 8-7z" />
                            <path transform="translate(1301,932)" d="m0 0h8l10 4 8 6 6 7 6 12 4 17v27l-4 17-6 12-7 8h-2v2l-10 6-9 1-13-5-8-6-6-7-1-5v-12l4-17v-16l-4-14v-9l3-13 2-4 10-7z" />
                            <path transform="translate(2044,1335)" d="m0 0 3 1-3 3-1-3z" />
                            <path transform="translate(2047,1204)" d="m0 0h1v8h-1z" />
                            <path transform="translate(2047,1340)" d="m0 0 1 3-2 1z" />
                            <path transform="translate(2047,1192)" d="m0 0 1 3h-2z" />
                            <path transform="translate(2046,1346)" d="m0 0h2v2h-2z" />
                            <path transform="translate(2047,1200)" d="m0 0" />
                            <path transform="translate(2047,1196)" d="m0 0" />
                            <path transform="translate(2047,1188)" d="m0 0" />
                        </svg>
                        Payment Methods
                    </span>
                    <span onClick={() => setcomponenetVisiblety({ ...o, v4: true })} className="wmia hoverEff1 mt15  r-s-c p10 ">
                        <svg version="1.1" viewBox="0 0 2048 2048" className="mr10" xmlns="http://www.w3.org/2000/svg">
                            <path transform="translate(1477,945)" d="m0 0h173l45 1 12 3 12 7 10 8 9 9 6 10 4 11 2 9 1 10v89h82l34 1 23 3 15 5 16 8 11 7 12 11 8 8 11 15 8 16 6 16 3 15 1 9v17l-2 16-7 21-11 21-8 10-6 7-8 7-11 8-12 7-2 3 1 10-1 465-1 40-2 27-4 16-8 20-9 15-7 9-9 10-12 11-15 10-16 7-18 5-24 3-15 1-36 1h-394l-28-2-17-3-17-6-17-9-10-8-12-11-11-12-12-20-6-13-5-16-4-19-3-26-1020 2h-44l-32-1-14-2-8-4-10-12-5-10-3-10-1-7v-35l3-38 5-38 8-46 8-36 11-40 9-27 10-27 8-19 12-27 10-21 12-22 13-22 9-15 9-13 13-19 21-28 9-11 8-9 7-8 9-10 7-8 9-9 5-6 8-7 21-21 8-7 13-11 20-16 16-12 33-22 23-14 21-12 25-13 28-13 32-13 38-13 32-9 36-8 47-8 40-4 38-2h53l32 2 40 4 36 6 30 7 41 11 43 15 22 9 23 10 36 18 16 9 23 13 4-1 12-16 6-7 10-8 13-9 19-9 13-4 16-2 14-1 104-1 1-67 1-26 2-12 8-16 6-8 9-10 9-7 9-6 5-2 8-1zm-24 84-1 5-1 37v26l1 4 60 1h133l19-1 1-1 1-33v-35l-1-2-165-1zm-693 110-44 3-40 5-32 6-36 9-27 8-38 14-19 8-15 7-33 17-7 4-24 15-15 10-20 14-14 11-16 13-13 12-8 7-10 9-25 25v2h-2l-9 11-9 10-22 28-10 13-12 18-14 23-7 11-17 32-11 24-6 13-11 28-12 36-7 23-9 39-7 35-4 28-4 33v10l2 1 27 1h783l136-1h101l3-2 1-89 1-273v-51l-2-7-7-6-9-7-10-9-14-14-10-15-9-20-6-8-9-8-19-12-22-13-18-10-32-16-31-13-30-11-29-9-37-9-33-6-35-4-41-3zm495 48-14 2-8 7-4 6-5 11-2 6v12l4 10 8 7 9 4 24 6 6 1 203 1h171l194-1 19-3 17-4 10-5 5-5 3-14v-9l-6-17-6-10-10-4-8-1zm173 157-138 1v503l2 16 5 13 6 8 11 8 7 3 11 2 189 1h226l36-1 11-2 11-4 9-6 7-7 4-10 3-21 1-467-1-36-2-1z" />
                            <path transform="translate(778,64)" d="m0 0 35 1 33 3 26 4 28 7 36 12 28 12 21 10 16 9 21 13 20 14 16 12 17 14 5 4v2l4 2 24 24 7 8 11 13 10 13 12 17 14 22 9 16 9 17 9 20 11 29 9 28 7 30 6 37 3 30v47l-2 24-8 45-6 25-7 23-10 27-13 28-11 21-8 14-14 22-11 14-6 8-11 13-7 8-11 12-22 22-8 7-14 11-10 8-11 8-12 8-13 8-21 12-33 16-21 8-36 12-26 6-31 6-32 4-26 1h-15l-26-1-33-4-30-6-30-8-32-11-24-10-21-10-23-13-17-11-16-11-17-13-15-13-13-12-18-18v-2h-2l-7-8-9-10-13-17-11-15-10-15-15-26-8-15-11-24-11-30-6-18-8-32-6-33-3-27-1-19v-26l2-30 3-25 5-28 5-19 8-27 6-17 11-26 8-17 12-22 11-18 7-10 12-17 20-25 10-11 1-2h2l2-4h2l2-4 8-8h2l1-3 8-7 10-9 10-8 21-16 18-12 22-13 27-14 25-11 25-9 27-8 28-6 27-4 26-2zm-14 84-36 3-28 5-20 5-24 8-27 11-17 8-23 13-10 7-11 8-16 12-15 13-12 11-12 12-9 11-10 12-8 12-10 14-11 19-9 17-12 27-9 24-5 17-6 28-5 36-1 15v27l2 25 6 36 7 28 8 24 9 22 10 21 13 22 16 23 11 14 12 14 25 25 11 9 12 10 18 13 18 11 16 9 24 12 26 10 19 6 39 8 36 4 30 1 32-2 32-5 32-8 18-6 25-10 28-14 20-12 16-11 12-9 16-13 8-7 5-4v-2l4-2 10-10 7-8 2-4h2l12-16 10-13 10-15 12-21 8-16 11-27 9-30 6-25 4-25 2-20v-51l-3-26-4-24-7-27-11-33-14-30-10-19-13-21-13-17-8-10-9-10-7-8-12-12h-2l-1-3-11-9-13-11-20-14-19-12-18-10-27-13-24-9-22-7-23-5-19-3-23-2-18-1z" />
                            <path transform="translate(1692,1564)" d="m0 0h20l10 3 9 5 5 4 6 9 3 15 1 16v170l-2 20-4 10-7 8-14 9-6 2h-15l-12-3-9-5-9-9-5-9-2-8-1-10v-190l4-14 6-9 5-6 7-5z" />
                            <path transform="translate(1407,1563)" d="m0 0h15l14 4 9 6 7 8 4 11 2 19v176l-2 17-5 12-8 9-12 8-7 2h-16l-12-3-11-8-6-8-4-8-2-10-1-14v-179l3-14 5-10 9-10 10-6z" />
                            <path transform="translate(1549,1563)" d="m0 0h17l13 4 10 6 7 8 3 8 2 11 1 14v160l-2 28-4 12-7 9-12 9-7 3h-17l-11-3-9-5-6-5-7-10-3-11-1-10v-187l4-16 9-14 7-6 5-3z" />
                        </svg>
                        Delete  Account
                    </span>
                </div>
                <div style={{ minHeight: "100%" }} className="ml20 r-s-s wmia">
                    {
                        componenetVisiblety.v1 && <UserInformations />
                    }
                    {
                        componenetVisiblety.v2 && <AddressManagementCmp />
                    }
                    {
                        componenetVisiblety.v3 && <PaymentMethodCmp />
                    }
                    {
                        componenetVisiblety.v4 && <DeletAccount />
                    }
                </div>
            </main>
        </div>, document.getElementById("portlas")
    )
}

export const ProfileForPhones = () => {
    const dispatch = useDispatch();
    const MainProfPageRef = useRef()
    let o = { v2: false, v3: false, v4: false }
    const [componenetVisiblety, setcomponenetVisiblety] = useState({ v2: true, v3: false, v4: false });
    const deviceTypePc = window.innerWidth > 800
    const naviagate = useNavigate();
    const OpenPaymentMethodsSection = () => {
        setcomponenetVisiblety({ ...o, v3: true })
        dispatch(getDefaultCard())
    }

    const Go_TO_UPDATE_PAYMENT_METHOD = (p) => {
        dispatch(showUpatePaymentMethod(p))

        if (!deviceTypePc) {
            naviagate('/update_payment_method')
        }
    }

    const GoToAddPaymentMethod = () => {
        if (deviceTypePc) {
            dispatch(ShowAddPaymenthMethod())
        } else {
            naviagate('/add_payment_method')
        }
    }
    useEffect(() => {
        MainProfPageRef.current?.scrollIntoView({
            behavior: "smooth", block: "start"
        })
    }, [])
    const UserInformations = () => {
        const { user, isLoggedIn, isLoadingAuth } = useSelector(st => st.authe)
        const { haveAnAddress, userAddress } = useSelector(st => st.addAddress)
        const { havePaymenthMethod, defaultPaymenthMethod, AllPaymenthMethod, isLodingPay } = useSelector(c => c.paymentMethod);
        const cmpEditPrfRef = useRef(null);
        const [isCmpEditPrVSBL, setisCmpEditPrVSBL] = useState(false)
        const [onToUpdateName, setonToUpdateName] = useState(false)
        const dispatch = useDispatch()
        const EditPrfoPicCmp = () => {
            useEffect(() => {
                if (isCmpEditPrVSBL == true && cmpEditPrfRef?.current) {
                    document.onmousedown = (e) => {
                        if (!cmpEditPrfRef.current?.contains(e.target)) {
                            setisCmpEditPrVSBL(false)
                        }
                    }
                }
            }, [isCmpEditPrVSBL])
            return (
                <div ref={cmpEditPrfRef} className="c-s-c bg-l p20 w200 h200 br10 " style={{
                    position: "absolute",
                    zIndex: "2",
                    top: "160px"
                }}>
                    <p className="mb20">Change Profile Photo</p>
                    <button onClick={() => dispatch(showEditPrfPic())} className="c-b">Edit Photo </button>
                    <button className="mt20 c-r">Remove current photo</button>
                </div>
            )
        }


        const [newName, setNewName] = useState(user?.name);
        const handelSaveName = () => {
            setonToUpdateName(false);
            if (newName != "" && newName != user.name) {
                dispatch(updateUserInfo({ 'displayName': newName }));
            }
        }
        return (
            <>
                {isLoadingAuth ? <div className="spinner"></div> :
                    isLoggedIn &&
                    <div className="c-s-s mb20 wmia ">
                        <div className="mrauto">
                            <div className="c-c-c   psr">
                                {
                                    isCmpEditPrVSBL &&
                                    <EditPrfoPicCmp />
                                }
                                <img onClick={() => setisCmpEditPrVSBL(true)} style={{ filter: " drop-shadow(0 0 var(--filter-color))", width: "200px", height: "200px" }} className="imgCercle" src={user.image} alt="" />
                            </div>
                            <h1 style={{ paddingRight: "50px" }} className="logo mt20 pr20 psr c-s-c">
                                {user.name}
                                <svg onClick={() => setonToUpdateName(true)} xmlns="http://www.w3.org/2000/svg" className="btnEditAddr" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" /></svg>
                            </h1>
                            {
                                onToUpdateName &&
                                <div style={{ paddingRight: "50px" }} className="c-s-s pt20 wmia  psr">
                                    <button onClick={() => setonToUpdateName(false)} className="btnClose"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" /></svg></button>
                                    <input type="text" className="wmia p10 br5 " onChange={e => setNewName(e.target.value)} placeholder="Enter Your Name" />
                                    <button onClick={handelSaveName} className="bl mt10 w100">Save</button>
                                </div>
                            }
                        </div>
                        <p className="r-c-c mt50"><svg xmlns="http://www.w3.org/2000/svg" className="mr10 w20 h20" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m438-426 198-198-57-57-141 141-56-56-57 57 113 113Zm42 240q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0 106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Zm0-480Z" /></svg>Default Address</p>
                        <div className="cntDeautlAddress c-s-c mt5 psr wmia p15 br20 pr20">
                            {
                                haveAnAddress ?
                                    <>
                                        <p className="" style={{ fontSize: "17px" }}>{userAddress.phone} , {userAddress.houseApparNum} , {userAddress.street} , {userAddress.city} , {userAddress.zip}</p>
                                    </> :
                                    <>
                                        <p>You don't provide any address</p>
                                        <BTN_OPEN_ADDRESS className="mt10 wmia p5 bg-b br20 c-l" stsvg={{ fill: "#fff", marginLeft: "10px" }} />
                                    </>
                            }
                        </div>
                        <p className="r-c-c mt50"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" className="mr10 w20 h20"><path d="M160-640h640v-80H160v80Zm-80-80q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v240H160v240h164v80H160q-33 0-56.5-23.5T80-240v-480ZM598-80 428-250l56-56 114 112 226-226 56 58L598-80ZM160-720v480-180 113-413Z" /></svg>Default Payment Method</p>
                        <div className="cntDeautlAddress mt5 wmia p15 br20">
                            {
                                havePaymenthMethod ?
                                    <span className=" wmia br20 p10  r-p-c" >
                                        <img className="w30" src={getrealImg(defaultPaymenthMethod?.cardType)} alt="" />
                                        <div className="c-s-s">
                                            <h1 className="cardNumbreele">
                                                {defaultPaymenthMethod && Khazl(defaultPaymenthMethod.CardNumber)}
                                            </h1>
                                            < p >{defaultPaymenthMethod?.CardholderName}</p>
                                        </div>
                                        <h2>{defaultPaymenthMethod?.ExpiryDate}</h2>
                                    </span>
                                    :
                                    <>
                                        <p>You don't provide any paymenth Method yet</p>
                                        <button className="bl p5 br20 wmia mt20" onClick={() => GoToAddPaymentMethod()}>
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
                                            </svg>Add a payment method
                                        </button>
                                    </>
                            }
                        </div>
                    </div>

                }
            </>

        )
    }
    // ---------------------------------------------
    const { haveAnAddress, userAddress, userAdded, isLoadingAddress, errorAddress } = useSelector(s => s.addAddress)

    const AddressManagementCmp = useMemo(() =>
        () => {
            const [isLoadingAllAddress, setisLoadingAllAddress] = useState(true)
            const [allAddresses, setallAddresses] = useState([])
            const getAllAddresses = async () => {
                getDoc(doc(db, "users", localStorage.getItem('userId'))).then(res => {
                    setallAddresses(res.data().addresses);
                    setisLoadingAllAddress(false)
                })
            }
            useEffect(() => {
                haveAnAddress ? getAllAddresses() : null
            }, []);


            const SingleAddress = ({ addr }) => {
                const [isChanginAddress, setisChanginAddress] = useState(false)
                const setAdddressAsDefault = async (id) => {
                    setisChanginAddress(true)
                    try {
                        const updatedAddress = allAddresses.map(elm => {
                            elm.id == id ? elm.isDefault = true : elm.isDefault = false;
                            return elm
                        });
                        await updateDoc(doc(db, "users", localStorage.getItem("userId")), { addresses: updatedAddress });
                        dispatch(showTenDone([true, "Address changed to default"]))
                        setisChanginAddress(false);
                        setallAddresses(updatedAddress);
                        dispatch(getUserAddress());
                    } catch (error) {
                        console.log(error.message);
                    }
                }
                const DelAdddress = async (id) => {
                    setisChanginAddress(true)
                    try {
                        const updatedAddress = allAddresses.filter(elm => elm.id != id);
                        await updateDoc(doc(db, "users", localStorage.getItem("userId")), { addresses: updatedAddress });
                        setisChanginAddress(false);
                        setallAddresses(updatedAddress);
                        dispatch(showTenDone([true, "Address Deleted"]))
                        dispatch(getUserAddress());
                    } catch (error) {
                        console.log(error.message);
                    }
                }
                const goToUpdate = () => {
                    dispatch(showUpdateAddress(addr))
                    if (!deviceTypePc) {
                        naviagate('/update_address');
                    }
                }
                return (

                    <div className="br20  mt15 addressElemesd psr r-b-c p5 mt5">
                        {isChanginAddress ?
                            <div className="spinner"></div>
                            :
                            <>
                                {addr.isDefault ?
                                    <svg className="iconeIsdefault f-b" version="1.1" viewBox="0 0 2048 2048" width="128" height="128" xmlns="http://www.w3.org/2000/svg">
                                        <path transform="translate(810)" d="m0 0h426l1 3 17 9 13 9 9 7 9 11 7 11 6 16 5 21 1 15v131l5 2 21 8 10 5 17 6 24 11 5 2 2-4h2l2-4 6-7 8-7 8-8 7-8 51-51 11-9 12-10 15-9 11-5 18-4h22l17 4 12 5 12 7 16 12 8 8 8 7 95 95v2l4 2v2l4 2 7 7 5 6 7 6 6 7 6 5 5 6 7 6 77 77 7 8 10 10 13 17 9 14 6 13 4 18v22l-4 15-4 9-8 14-10 14-12 14-10 10-7 8-6 5-7 8-8 7-7 8-13 12-23 23-6 5-1 4 6 9 12 29 15 36 3 3 136 1 20 3 15 4 14 7 12 9 9 8 9 12 13 22 2 5h2v423l-4 2-12 22-9 11-8 8-18 13-15 5-18 4-16 2-132 1-3 3-4 8-10 24-10 25-7 15 1 6 7 8 5 5 9 10 69 69 11 14 10 15 8 16 4 16v24l-4 16-8 16-7 11-10 13-9 10-7 8-224 224-8 7-11 10-11 9-15 9-12 5-12 3-14 2h-16l-11-2-16-6-15-9-14-12-12-11-12-12-6-5-7-8-51-51-7-5-1-2h-3v-2l-17 8-27 11-21 8-9 4-4 4-1 8v130l-2 14-5 17-5 12-12 18-10 11-11 7-15 7h-2l1 7v2h-425v-2l-5-2-20-10-14-9-10-9-9-12-8-13-7-25-2-10-1-142-5-2-10-5-58-24-4-2-5 1-16 16-7 8-4 2v2h-2l-2 4-20 20-5 6-8 7-23 23-11 9-7 6-13 8-12 6-15 4-16 2h-13l-16-3-16-7-12-8-10-8-20-18-163-163v-2l-4-2-4-4v-2l-3-1-5-6-7-6-5-6-7-6-5-5v-2l-3-1-5-6-8-7-4-4v-2l-3-1-7-8-12-13-12-17-9-17-4-14-1-6v-20l4-17 7-16 13-19 12-13 7-8 28-28 7-8h2l2-4 12-12 8-7 14-14 7-8 2-4-10-21-8-22-9-20-5-14-1-2h-147l-21-5-15-6-9-6-14-12-9-11-4-6-8-16-4-4-1-6-1-2v-417h2l2-5 11-19 11-14 2-3h2v-2l16-12 14-7 17-5 13-2h134l7-2 5-6 11-25 11-30 7-12v-5l-7-9-10-10-6-7-66-66-9-11-11-15-10-19-4-13-1-6v-18l3-16 5-13 7-13 12-16 9-10 5-6h2l1-3 8-7 66-66 3-4h2l1-3 8-7 5-6h2l1-3 8-7 1-2h2l2-4h2l2-4 6-5 2-3h2l2-4 9-8 7-8 8-8h2l2-4 84-84 11-9 13-10 17-9 17-5 6-1h22l16 4 15 6 14 9 13 11 8 7 7 7 7 6 5 6 7 6 5 6 12 12 3 2v2l4 2v2l4 2v2l4 2 8 8 7 8 5 4 4 4v2l4 2 2 2 6-1 17-8 31-12 20-8 5-5 1-6v-107l1-28 3-15 4-15 5-12 13-17 10-9 10-7 17-10zm424 1m-120 184-184 1v111l-3 26-4 14-8 15-12 16-9 8-16 8-28 11-35 12-30 10-17 7-62 31-19 8-21 8-10 3-19 1-7-1-16-5-17-9-12-9-12-11-8-7-39-39-7-8-9-9-7-8-5-2-5 3-10 10-3 2v2l-4 2-44 44v2l-4 2-8 8v2l-4 2-20 20v2l-4 2-5 6-3 2v2l-4 2v2l-4 2v2l-3 1-5 7 1 6 16 15 21 21h2v2l8 7 17 17 1 2h2l2 4 9 9 11 15 9 16 6 15 2 9v17l-3 14-9 24-8 18-27 54-11 27-12 36-11 32-9 20-7 14-8 10-6 7-14 9-12 6-17 4-29 3-40 1h-66v187l43-1h46l26 1 19 2 15 4 16 8 11 8 9 9 9 13 8 16 8 20 17 50 9 25 13 29 24 48 11 27 4 13 1 7v14l-2 11-8 20-9 15-11 14-8 8-7 8-21 21-7 6-7 8-12 11-3 2v2l-4 2-6 5-2 4 1 5 9 11h2l1 3 6 5 76 76 7 8 13 12 8 8 6 4 4-1 6-5 7-8v-2h2l8-8v-2l4-2 2-4h2l7-8 34-34 14-11 15-11 20-9 12-2h11l17 2 19 6 17 7 23 11 19 10 31 15 26 10 51 17 28 11 16 9 11 9 8 10 8 13 5 11 3 11 2 13 1 13 1 111h183l1-5 2-113 2-17 3-13 7-14 12-16 1-3 4-2 13-11 19-9 30-11 52-18 21-9 35-17 16-8 21-10 23-9 12-3h26l16 4 16 7 11 7 13 11 4 4h2l1 3 8 7 34 34 7 8 8 7 9 10 5 4 5-1 6-5 7-8 15-14 7-8 40-40v-2h2v-2l4-2 28-28 8-6v-2h2l4-5v-2h2l1-7-9-10-17-17-8-7-22-22-6-7-13-13-11-14-7-10-9-19-5-17v-10l2-15 5-15 11-26 11-23 10-19 13-28 8-21 12-36 11-32 8-18 4-8 10-13 9-10 15-9 13-6 20-4 12-1h113l1-29 1-93v-56l-1-8-14-1h-71l-38-1-19-3-11-4-14-8-10-8-7-7-9-13-7-14-11-28-14-41-10-28-14-30-15-30-12-26-8-21-4-18-1-10 3-14 6-15 10-19 10-12 7-8 3-3v-2h2l7-8 43-43 11-9 6-7-1-6-12-13-43-43-1-2h-2l-2-4h-2l-2-4h-2l-2-4-12-12h-2v-2h-2v-2h-2l-2-4h-2l-2-4-30-30-9-2-8 7-7 7v2l-4 2-4 4v2l-3 1-7 8-13 13v2l-4 2v2l-4 2v2l-3 1-6 7-8 7-11 10-9 7-11 7-20 8-11 3h-28l-30-12-35-17-38-19-25-10-47-16-31-11-19-9-10-7-10-9-8-11-10-19-4-16-2-18-1-115zm126 1855m-4 1 4 1zm-2 1m-4 1m8 0m-4 1m-7 1m3 0 4 1z" />
                                        <path transform="translate(1213,794)" d="m0 0h17l16 3 16 6 14 8 10 9 8 8 10 15 6 13 5 21v19l-4 20-7 14-12 18-9 11-4 5h-2l-2 4-28 28-6 5-223 223-11 9-12 9-10 6-20 8-13 3h-20l-19-5-16-8-9-6-16-13-12-11-7-7-6-5-6-7-6-5-7-8-39-39-7-6-5-6-17-17-11-14-10-14-8-16-5-16-1-6v-18l5-19 8-16 9-13 11-12 18-13 14-6 13-3 7-1h16l16 3 12 4 14 7 14 10 10 9 8 7 28 28 7 8 6 6 4-1 11-11 7-6 34-34 5-6 8-7 6-7h2v-2l8-7 65-65 1-2h2l2-4 11-10 7-8 4-2v-2h2v-2h2l2-4 10-10h2v-2h2l2-4 12-11 11-9 13-9 15-7 15-4z" />
                                        <path transform="translate(1239)" d="m0 0h11l-1 3-9-1z" />
                                        <path transform="translate(806,2045)" d="m0 0 8 2v1h-7z" />
                                        <path transform="translate(794,2042)" d="m0 0 4 1-2 3-3-3z" />
                                        <path transform="translate(799,2045)" d="m0 0h2l-1 3z" />
                                        <path transform="translate(815,2046)" d="m0 0 2 2h-2z" />
                                        <path transform="translate(803,2046)" d="m0 0 2 2h-2z" />
                                        <path transform="translate(2047,1245)" d="m0 0 1 2-2-1z" />
                                        <path transform="translate(0,1233)" d="m0 0 2 2h-2z" />
                                        <path transform="translate(814,2045)" d="m0 0" />
                                        <path transform="translate(265,1382)" d="m0 0" />
                                        <path transform="translate(807)" d="m0 0" />
                                    </svg>
                                    :
                                    <svg onClick={() => setAdddressAsDefault(addr.id)} className="iconeIsdefault" version="1.1" viewBox="0 0 2048 2048" width="128" height="128" xmlns="http://www.w3.org/2000/svg">
                                        <path transform="translate(0)" d="m0 0h2048v2048h-2048z" fill="#010101" />
                                        <path transform="translate(946,192)" d="m0 0h155l2 2 1 108 1 11 11 11 2 7 3 30 7 8 12 10 16 6 12 6 5 4 20 8 7 4 5 5 9 3 5 2 3-2h10l11 3 5 5 4 5 7 2 10 2 2-2 9 1 11 4 5 4 4 4 22 8 6 4 5 5 15 5 10 4 6 7 5 2 11 2 3-1h57l10-3 10-9 13-12 14-15 13-13h2l2-4h2l2-4 30-30 8-7 6-1 7 3 9 7 7 8 84 84 6 10v8l-7 8-5 4-7 8-55 55-7 6-7 8-3 3h-2l-2 4-2 5v60l2 18 9 11 8 21 9 15 8 20 7 10 3 10 3 15v9l4 6 5 4 3 7 4 22 1 10 7 9 4 8 6 16 9 14 6 17 6 8 9 11 7 3 14 1h11l11 4 4 5 4 6 121 2 2 3v153l-10 2-58 1-36 1-18 1-5 5-4 6-3 1-21 1h-9l-9 4-11 14-4 6-7 21-8 9-4 12-2 9-7 8h-2l-3 9-1 15-3 15-2 4-6 5-5 12-4 12-8 10-5 13-3 10-2 3h-2v2h-2v2h-2l-2 5-2 8-3 26-3 5-7 6-2 5-2 22v48l2 10 9 11 81 81 5 8v8l-4 6-12 11-7 8-55 55-5 4-7 8-6 5-7 8-7 5-6-1-9-5-5-5-11-12-36-36v-2h-2l-6-7-8-7-12-12-2-1v-2l-4-2-7-6-2-1h-32l-4-1-4 1-34 2-12 6v2l-5 3-9 2-16 8-7 5-16 5-11 7-5 4-15 3-7 1-7-1-8 4-8 9-2 1-22 3-6-1-12 7-8 6-11 3-20 11-13 6-14 7-14 11-3 4-1 10-1 26-5 5-7 5-2 56-1 65-1 1-14 1-93 1h-48l-3-2-1-8v-90l-1-18-3-7-5-4v-2h-2l-3-8-2-26-4-8-10-10-11-8-12-2-12-7-8-6-12-3-8-4-10-9-8-2-10 1-5-2h-8l-8-5-10-9-13-2-10-6-10-8-8-1-12-5-11-8-18-4-12-1-9-5-8-6-10-2-17-1h-52l-4 1-2 4-68 68h-2l-2 4-8 8h-2l-2 4-4 5-8 6-5-2-8-4-46-46-8-7-30-30-9-11-9-10-2-4 1-6 4-7 9-9h2l2-4 12-12 8-7 4-5 8-7 34-34 9-11 3-5 1-46v-11l-1-12-1-7-8-15-6-13-16-32-8-17-5-11-5-19-4-13-6-12-7-27-5-12-5-10-7-16-9-17-7-16-11-14-4-5-7-2-33-2-9-11-4-1-22-1-95-1-2-3v-148l2-8 72-1 32-1 14-1 6-3 7-9 5-1h23l9-3 6-4 8-10 6-8 4-13 6-11 6-10 4-12 7-12 4-7 4-23 4-11 7-11 4-21 2-9 6-12 6-10 4-12 8-12 5-9 3-10 10-20 2-14 1-20 1-8v-33l-7-10-11-11-4-5-8-7-50-50-7-8-9-10-2-4 1-6 6-10 10-9 7-8 10-10h2l2-4 8-8 6-5 7-8 9-8 7-8 18-18 16-14 4-1 9 3 8 7 7 8 75 75 6 4 13 2 4-1 52-1 12-2 6-4 6-7 20-2 12-2 8-4 9-7 16-5 11-7 6-4 18-7 13-9 7-2 23-3 10-5 8-6 16-5 18-11 15-5 13-10 9-8 2-4 1-27 5-9 8-10 1-3 1-18 1-96z" fill="#FEFEFE" />
                                        <path transform="translate(2046,1261)" d="m0 0h2v787h-787l4-9 7-8 5-4 7-8 12-12h2l2-4h2l2-4 7-8v-94l1-62 3-8 5-5 10-9 7-4 15-5 11-8 8-5h10l9 6 16 17 84 84 8 5 8 2 9-3 9 2 9 4 7 8 12 3 9-2 4-2 2-4 5-6 2-1h27l8-3 10-9 14-13 7-8 262-262 1-2v-24l4-10 7-8h2l2-4 2-5v-9l-4-8-10-10-2-4v-25l-6-9-12-13-76-76-7-8-5-4-6-8-1-7 7-14 7-10 5-16 6-8 13-14 19-1 87-1 57-1 7-4 7-8 13-13 7-8 13-12z" fill="#FEFEFE" />
                                        <path transform="translate(0,1261)" d="m0 0 10 5 12 12 2 1v2l4 2 11 12 5 4 7 8 4 3 14 1h141l9 2 6 5 10 14 5 13 4 10 9 11 3 7v8l-6 8-8 7-7 8-43 43-7 8-4 2v2l-8 7-4 5-8 7-9 10-4 4-5 10 2 6-2 20-5 5-6 5-6 10 2 10 3 5 7 5 3 5 3 20v13l7 8 185 185 5 6 3 2v2l4 2v2l4 2 5 6 7 6 7 8 27 27 8 7 29 29 12 7 5-1 5-2 8 1 12 5 5 5v2l5 2 7 1h9l9-8 4-5 2-1h30l10-6 2-3h2l2-4 13-12 12-13 52-52 6-7 8-7 8-8 4-2 9 2 11 6 5 4 21 9 8 6 8 7 4 6 2 11 1 148 2 6 13 12 24 24 8 10 3 5v2h-786z" fill="#FEFEFE" />
                                        <path transform="translate(1260)" d="m0 0h788v786l-7-1-11-11-7-8-29-29-4-2h-158l-5-2-11-12-6-9-7-21-8-10-4-7 1-9 5-8 13-12 25-25 8-7 7-8 7-6 7-8 33-33 6-7v-23l3-9 4-6 5-4 4-6 2-8-3-9-9-10-4-5-1-5v-22l-7-10-12-13-43-43-7-8-5-4-7-8-22-22-7-6-7-8-9-8-6-7-8-7-6-6v-2l-4-2-64-64v-2l-4-2-13-14-3-2v-2l-4-2-7-8-26-26-8-7-15-15-8-4-7 1-6 1-11-1-7-4-10-10-3-2-7-1-10 3-6 8-4 4-14 2-17-1-6 3-11 12-8 7-21 21-5 6-8 7-21 21-1 2h-2v2l-8 7-6 7h-2v2l-8 7-6 7-7 4-7-1-8-3-8-9-3-2v-2l-12-1-10-4-20-16-1-13v-149l-4-6-43-43z" fill="#FEFEFE" />
                                        <path transform="translate(0)" d="m0 0h785l-1 5-9 10-15 16-14 14-9 7-1 2v39l-1 118-2 7-9 10-11 9-6 2-7-1-8 5-9 10-10 4-9-2-8-7-10-10-7-8-74-74-3-2v-2l-4-2-7-6-9-2-5 1h-9l-10-2-10-9-6-5h-11l-7 3-7 10-6 2-15 1-4-1h-8l-8 5-9 10h-2v2l-8 7-10 11h-2l-2 4-232 232h-2v2l-8 7-9 10-5 5-4 8 1 5 1 4-2 18-12 11-5 9 1 8 3 6 9 7 3 9 2 18v10l7 8 9 9 7 8 77 77 8 7 5 8-1 9-3 6-8 7-5 14-3 10-11 13-6 7-2 1-125 1h-38l-5 5-8 10-25 25-10 8-6 1-1-1z" fill="#FEFEFE" />
                                    </svg>
                                }

                                <span className="r-c-c">
                                    <svg xmlns="http://www.w3.org/2000/svg" className={addr.isDefault ? "f-b mr10" : "mr10"} viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 2.88-2.88 7.19-5 9.88C9.92 16.21 7 11.85 7 9z" /><circle cx="12" cy="9" r="2.5" /></svg>
                                    <p className={addr.isDefault ? "c-b" : ""}>{addr.phone} , {addr.houseApparNum} , {addr.street} , {addr.city} , {addr.zip}</p>
                                </span>
                                {
                                    !addr.isDefault &&
                                    <div className="r-s-c  ml10 cntButonUpdateAdd">
                                        <button className="c-b" onClick={goToUpdate}>update</button>
                                        <button className="c-r" onClick={() => DelAdddress(addr.id)}>delete</button>
                                    </div>
                                }
                            </>
                        }

                    </div>
                )
            }
            return (
                <div style={{ minHeight: "400px" }} className="mt50 wmia c-p-s">
                    {haveAnAddress ?
                        <>
                            <h1 className="pb15 wmia r-s-c "> Saved Addresses</h1>
                            <div className="defaultAddresMAs bg-b br20 p5 mt10 wmia c-s-s">
                                {isLoadingAddress ? <div className="spinner"></div> :
                                    <>
                                        <p className="mb20  r-c-c ml10" style={{ color: "#fff" }}><svg style={{ fill: "#fff" }} xmlns="http://www.w3.org/2000/svg" className="mr10" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q65 0 123 19t107 53l-58 59q-38-24-81-37.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160q133 0 226.5-93.5T800-480q0-18-2-36t-6-35l65-65q11 32 17 66t6 70q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm-56-216L254-466l56-56 114 114 400-401 56 56-456 457Z" /></svg>Your default Address</p>
                                        <h1 className="c-l mrauto r-s-c" style={{ textAlign: "center", color: "#fff" }}>
                                            {userAddress.phone} ,
                                            {userAddress.houseApparNum} ,
                                            {userAddress.street} ,
                                            {userAddress.city} ,
                                            {userAddress.zip}
                                        </h1>
                                        <button className="mt20 w200  br20 " style={{ backgroundColor: "#fff", color: "#000" }} onClick={() => {
                                            dispatch(showUpdateAddress(userAddress));
                                            if (!deviceTypePc) {
                                                naviagate('/update_address');
                                            }
                                        }}><svg xmlns="http://www.w3.org/2000/svg" style={{ fill: "#000" }} className="mr10" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M480-120q-75 0-140.5-28.5t-114-77q-48.5-48.5-77-114T120-480q0-75 28.5-140.5t77-114q48.5-48.5 114-77T480-840q82 0 155.5 35T760-706v-94h80v240H600v-80h110q-41-56-101-88t-129-32q-117 0-198.5 81.5T200-480q0 117 81.5 198.5T480-200q105 0 183.5-68T756-440h82q-15 137-117.5 228.5T480-120Zm112-192L440-464v-216h80v184l128 128-56 56Z" /></svg>Update</button>
                                    </>

                                }
                            </div>
                            <div style={{ minHeight: "200px" }} className="listOfItems mt20  pl20 wmia c-s-s">
                                {
                                    isLoadingAllAddress ? <div className="loader"></div> :
                                        allAddresses.map(addr =>
                                            <SingleAddress addr={addr} key={addr.id} />
                                        )
                                }
                            </div>
                            <BTN_OPEN_ADDRESS className='mt50 wmia p5 br20 bl' />

                        </> :
                        <div className="mrauto c-c-c ">
                            <h1 className="logo mt50">You didn't provide any address yet !</h1>
                            <BTN_OPEN_ADDRESS className={'bl wmia br20 br20 p10 mt20 '} />
                        </div>
                    }
                </div>
            )
        }

        , [userAddress])

    // ---------------------------------------------
    const PaymentMethodCmp = () => {
        const { havePaymenthMethod, defaultPaymenthMethod, AllPaymenthMethod, isLodingPay } = useSelector(c => c.paymentMethod);
        const SingleCardElem = ({ c }) => {
            function sendTodelet() {
                dispatch(DeleteCard(c.id))
            }
            function sendToSetAsDef() {
                dispatch(SetCardAsDef(c.id))
            }

            return (
                <div className="listCardElem r-b-c psr  mt10 br20 wmia">

                    {c.isDefault ?
                        <svg className="iconeIsdefault f-b" version="1.1" viewBox="0 0 2048 2048" width="128" height="128" xmlns="http://www.w3.org/2000/svg">
                            <path transform="translate(810)" d="m0 0h426l1 3 17 9 13 9 9 7 9 11 7 11 6 16 5 21 1 15v131l5 2 21 8 10 5 17 6 24 11 5 2 2-4h2l2-4 6-7 8-7 8-8 7-8 51-51 11-9 12-10 15-9 11-5 18-4h22l17 4 12 5 12 7 16 12 8 8 8 7 95 95v2l4 2v2l4 2 7 7 5 6 7 6 6 7 6 5 5 6 7 6 77 77 7 8 10 10 13 17 9 14 6 13 4 18v22l-4 15-4 9-8 14-10 14-12 14-10 10-7 8-6 5-7 8-8 7-7 8-13 12-23 23-6 5-1 4 6 9 12 29 15 36 3 3 136 1 20 3 15 4 14 7 12 9 9 8 9 12 13 22 2 5h2v423l-4 2-12 22-9 11-8 8-18 13-15 5-18 4-16 2-132 1-3 3-4 8-10 24-10 25-7 15 1 6 7 8 5 5 9 10 69 69 11 14 10 15 8 16 4 16v24l-4 16-8 16-7 11-10 13-9 10-7 8-224 224-8 7-11 10-11 9-15 9-12 5-12 3-14 2h-16l-11-2-16-6-15-9-14-12-12-11-12-12-6-5-7-8-51-51-7-5-1-2h-3v-2l-17 8-27 11-21 8-9 4-4 4-1 8v130l-2 14-5 17-5 12-12 18-10 11-11 7-15 7h-2l1 7v2h-425v-2l-5-2-20-10-14-9-10-9-9-12-8-13-7-25-2-10-1-142-5-2-10-5-58-24-4-2-5 1-16 16-7 8-4 2v2h-2l-2 4-20 20-5 6-8 7-23 23-11 9-7 6-13 8-12 6-15 4-16 2h-13l-16-3-16-7-12-8-10-8-20-18-163-163v-2l-4-2-4-4v-2l-3-1-5-6-7-6-5-6-7-6-5-5v-2l-3-1-5-6-8-7-4-4v-2l-3-1-7-8-12-13-12-17-9-17-4-14-1-6v-20l4-17 7-16 13-19 12-13 7-8 28-28 7-8h2l2-4 12-12 8-7 14-14 7-8 2-4-10-21-8-22-9-20-5-14-1-2h-147l-21-5-15-6-9-6-14-12-9-11-4-6-8-16-4-4-1-6-1-2v-417h2l2-5 11-19 11-14 2-3h2v-2l16-12 14-7 17-5 13-2h134l7-2 5-6 11-25 11-30 7-12v-5l-7-9-10-10-6-7-66-66-9-11-11-15-10-19-4-13-1-6v-18l3-16 5-13 7-13 12-16 9-10 5-6h2l1-3 8-7 66-66 3-4h2l1-3 8-7 5-6h2l1-3 8-7 1-2h2l2-4h2l2-4 6-5 2-3h2l2-4 9-8 7-8 8-8h2l2-4 84-84 11-9 13-10 17-9 17-5 6-1h22l16 4 15 6 14 9 13 11 8 7 7 7 7 6 5 6 7 6 5 6 12 12 3 2v2l4 2v2l4 2v2l4 2 8 8 7 8 5 4 4 4v2l4 2 2 2 6-1 17-8 31-12 20-8 5-5 1-6v-107l1-28 3-15 4-15 5-12 13-17 10-9 10-7 17-10zm424 1m-120 184-184 1v111l-3 26-4 14-8 15-12 16-9 8-16 8-28 11-35 12-30 10-17 7-62 31-19 8-21 8-10 3-19 1-7-1-16-5-17-9-12-9-12-11-8-7-39-39-7-8-9-9-7-8-5-2-5 3-10 10-3 2v2l-4 2-44 44v2l-4 2-8 8v2l-4 2-20 20v2l-4 2-5 6-3 2v2l-4 2v2l-4 2v2l-3 1-5 7 1 6 16 15 21 21h2v2l8 7 17 17 1 2h2l2 4 9 9 11 15 9 16 6 15 2 9v17l-3 14-9 24-8 18-27 54-11 27-12 36-11 32-9 20-7 14-8 10-6 7-14 9-12 6-17 4-29 3-40 1h-66v187l43-1h46l26 1 19 2 15 4 16 8 11 8 9 9 9 13 8 16 8 20 17 50 9 25 13 29 24 48 11 27 4 13 1 7v14l-2 11-8 20-9 15-11 14-8 8-7 8-21 21-7 6-7 8-12 11-3 2v2l-4 2-6 5-2 4 1 5 9 11h2l1 3 6 5 76 76 7 8 13 12 8 8 6 4 4-1 6-5 7-8v-2h2l8-8v-2l4-2 2-4h2l7-8 34-34 14-11 15-11 20-9 12-2h11l17 2 19 6 17 7 23 11 19 10 31 15 26 10 51 17 28 11 16 9 11 9 8 10 8 13 5 11 3 11 2 13 1 13 1 111h183l1-5 2-113 2-17 3-13 7-14 12-16 1-3 4-2 13-11 19-9 30-11 52-18 21-9 35-17 16-8 21-10 23-9 12-3h26l16 4 16 7 11 7 13 11 4 4h2l1 3 8 7 34 34 7 8 8 7 9 10 5 4 5-1 6-5 7-8 15-14 7-8 40-40v-2h2v-2l4-2 28-28 8-6v-2h2l4-5v-2h2l1-7-9-10-17-17-8-7-22-22-6-7-13-13-11-14-7-10-9-19-5-17v-10l2-15 5-15 11-26 11-23 10-19 13-28 8-21 12-36 11-32 8-18 4-8 10-13 9-10 15-9 13-6 20-4 12-1h113l1-29 1-93v-56l-1-8-14-1h-71l-38-1-19-3-11-4-14-8-10-8-7-7-9-13-7-14-11-28-14-41-10-28-14-30-15-30-12-26-8-21-4-18-1-10 3-14 6-15 10-19 10-12 7-8 3-3v-2h2l7-8 43-43 11-9 6-7-1-6-12-13-43-43-1-2h-2l-2-4h-2l-2-4h-2l-2-4-12-12h-2v-2h-2v-2h-2l-2-4h-2l-2-4-30-30-9-2-8 7-7 7v2l-4 2-4 4v2l-3 1-7 8-13 13v2l-4 2v2l-4 2v2l-3 1-6 7-8 7-11 10-9 7-11 7-20 8-11 3h-28l-30-12-35-17-38-19-25-10-47-16-31-11-19-9-10-7-10-9-8-11-10-19-4-16-2-18-1-115zm126 1855m-4 1 4 1zm-2 1m-4 1m8 0m-4 1m-7 1m3 0 4 1z" />
                            <path transform="translate(1213,794)" d="m0 0h17l16 3 16 6 14 8 10 9 8 8 10 15 6 13 5 21v19l-4 20-7 14-12 18-9 11-4 5h-2l-2 4-28 28-6 5-223 223-11 9-12 9-10 6-20 8-13 3h-20l-19-5-16-8-9-6-16-13-12-11-7-7-6-5-6-7-6-5-7-8-39-39-7-6-5-6-17-17-11-14-10-14-8-16-5-16-1-6v-18l5-19 8-16 9-13 11-12 18-13 14-6 13-3 7-1h16l16 3 12 4 14 7 14 10 10 9 8 7 28 28 7 8 6 6 4-1 11-11 7-6 34-34 5-6 8-7 6-7h2v-2l8-7 65-65 1-2h2l2-4 11-10 7-8 4-2v-2h2v-2h2l2-4 10-10h2v-2h2l2-4 12-11 11-9 13-9 15-7 15-4z" />
                            <path transform="translate(1239)" d="m0 0h11l-1 3-9-1z" />
                            <path transform="translate(806,2045)" d="m0 0 8 2v1h-7z" />
                            <path transform="translate(794,2042)" d="m0 0 4 1-2 3-3-3z" />
                            <path transform="translate(799,2045)" d="m0 0h2l-1 3z" />
                            <path transform="translate(815,2046)" d="m0 0 2 2h-2z" />
                            <path transform="translate(803,2046)" d="m0 0 2 2h-2z" />
                            <path transform="translate(2047,1245)" d="m0 0 1 2-2-1z" />
                            <path transform="translate(0,1233)" d="m0 0 2 2h-2z" />
                            <path transform="translate(814,2045)" d="m0 0" />
                            <path transform="translate(265,1382)" d="m0 0" />
                            <path transform="translate(807)" d="m0 0" />
                        </svg>
                        :
                        <svg onClick={sendToSetAsDef} className="iconeIsdefault" version="1.1" viewBox="0 0 2048 2048" width="128" height="128" xmlns="http://www.w3.org/2000/svg">
                            <path transform="translate(0)" d="m0 0h2048v2048h-2048z" fill="#010101" />
                            <path transform="translate(946,192)" d="m0 0h155l2 2 1 108 1 11 11 11 2 7 3 30 7 8 12 10 16 6 12 6 5 4 20 8 7 4 5 5 9 3 5 2 3-2h10l11 3 5 5 4 5 7 2 10 2 2-2 9 1 11 4 5 4 4 4 22 8 6 4 5 5 15 5 10 4 6 7 5 2 11 2 3-1h57l10-3 10-9 13-12 14-15 13-13h2l2-4h2l2-4 30-30 8-7 6-1 7 3 9 7 7 8 84 84 6 10v8l-7 8-5 4-7 8-55 55-7 6-7 8-3 3h-2l-2 4-2 5v60l2 18 9 11 8 21 9 15 8 20 7 10 3 10 3 15v9l4 6 5 4 3 7 4 22 1 10 7 9 4 8 6 16 9 14 6 17 6 8 9 11 7 3 14 1h11l11 4 4 5 4 6 121 2 2 3v153l-10 2-58 1-36 1-18 1-5 5-4 6-3 1-21 1h-9l-9 4-11 14-4 6-7 21-8 9-4 12-2 9-7 8h-2l-3 9-1 15-3 15-2 4-6 5-5 12-4 12-8 10-5 13-3 10-2 3h-2v2h-2v2h-2l-2 5-2 8-3 26-3 5-7 6-2 5-2 22v48l2 10 9 11 81 81 5 8v8l-4 6-12 11-7 8-55 55-5 4-7 8-6 5-7 8-7 5-6-1-9-5-5-5-11-12-36-36v-2h-2l-6-7-8-7-12-12-2-1v-2l-4-2-7-6-2-1h-32l-4-1-4 1-34 2-12 6v2l-5 3-9 2-16 8-7 5-16 5-11 7-5 4-15 3-7 1-7-1-8 4-8 9-2 1-22 3-6-1-12 7-8 6-11 3-20 11-13 6-14 7-14 11-3 4-1 10-1 26-5 5-7 5-2 56-1 65-1 1-14 1-93 1h-48l-3-2-1-8v-90l-1-18-3-7-5-4v-2h-2l-3-8-2-26-4-8-10-10-11-8-12-2-12-7-8-6-12-3-8-4-10-9-8-2-10 1-5-2h-8l-8-5-10-9-13-2-10-6-10-8-8-1-12-5-11-8-18-4-12-1-9-5-8-6-10-2-17-1h-52l-4 1-2 4-68 68h-2l-2 4-8 8h-2l-2 4-4 5-8 6-5-2-8-4-46-46-8-7-30-30-9-11-9-10-2-4 1-6 4-7 9-9h2l2-4 12-12 8-7 4-5 8-7 34-34 9-11 3-5 1-46v-11l-1-12-1-7-8-15-6-13-16-32-8-17-5-11-5-19-4-13-6-12-7-27-5-12-5-10-7-16-9-17-7-16-11-14-4-5-7-2-33-2-9-11-4-1-22-1-95-1-2-3v-148l2-8 72-1 32-1 14-1 6-3 7-9 5-1h23l9-3 6-4 8-10 6-8 4-13 6-11 6-10 4-12 7-12 4-7 4-23 4-11 7-11 4-21 2-9 6-12 6-10 4-12 8-12 5-9 3-10 10-20 2-14 1-20 1-8v-33l-7-10-11-11-4-5-8-7-50-50-7-8-9-10-2-4 1-6 6-10 10-9 7-8 10-10h2l2-4 8-8 6-5 7-8 9-8 7-8 18-18 16-14 4-1 9 3 8 7 7 8 75 75 6 4 13 2 4-1 52-1 12-2 6-4 6-7 20-2 12-2 8-4 9-7 16-5 11-7 6-4 18-7 13-9 7-2 23-3 10-5 8-6 16-5 18-11 15-5 13-10 9-8 2-4 1-27 5-9 8-10 1-3 1-18 1-96z" fill="#FEFEFE" />
                            <path transform="translate(2046,1261)" d="m0 0h2v787h-787l4-9 7-8 5-4 7-8 12-12h2l2-4h2l2-4 7-8v-94l1-62 3-8 5-5 10-9 7-4 15-5 11-8 8-5h10l9 6 16 17 84 84 8 5 8 2 9-3 9 2 9 4 7 8 12 3 9-2 4-2 2-4 5-6 2-1h27l8-3 10-9 14-13 7-8 262-262 1-2v-24l4-10 7-8h2l2-4 2-5v-9l-4-8-10-10-2-4v-25l-6-9-12-13-76-76-7-8-5-4-6-8-1-7 7-14 7-10 5-16 6-8 13-14 19-1 87-1 57-1 7-4 7-8 13-13 7-8 13-12z" fill="#FEFEFE" />
                            <path transform="translate(0,1261)" d="m0 0 10 5 12 12 2 1v2l4 2 11 12 5 4 7 8 4 3 14 1h141l9 2 6 5 10 14 5 13 4 10 9 11 3 7v8l-6 8-8 7-7 8-43 43-7 8-4 2v2l-8 7-4 5-8 7-9 10-4 4-5 10 2 6-2 20-5 5-6 5-6 10 2 10 3 5 7 5 3 5 3 20v13l7 8 185 185 5 6 3 2v2l4 2v2l4 2 5 6 7 6 7 8 27 27 8 7 29 29 12 7 5-1 5-2 8 1 12 5 5 5v2l5 2 7 1h9l9-8 4-5 2-1h30l10-6 2-3h2l2-4 13-12 12-13 52-52 6-7 8-7 8-8 4-2 9 2 11 6 5 4 21 9 8 6 8 7 4 6 2 11 1 148 2 6 13 12 24 24 8 10 3 5v2h-786z" fill="#FEFEFE" />
                            <path transform="translate(1260)" d="m0 0h788v786l-7-1-11-11-7-8-29-29-4-2h-158l-5-2-11-12-6-9-7-21-8-10-4-7 1-9 5-8 13-12 25-25 8-7 7-8 7-6 7-8 33-33 6-7v-23l3-9 4-6 5-4 4-6 2-8-3-9-9-10-4-5-1-5v-22l-7-10-12-13-43-43-7-8-5-4-7-8-22-22-7-6-7-8-9-8-6-7-8-7-6-6v-2l-4-2-64-64v-2l-4-2-13-14-3-2v-2l-4-2-7-8-26-26-8-7-15-15-8-4-7 1-6 1-11-1-7-4-10-10-3-2-7-1-10 3-6 8-4 4-14 2-17-1-6 3-11 12-8 7-21 21-5 6-8 7-21 21-1 2h-2v2l-8 7-6 7h-2v2l-8 7-6 7-7 4-7-1-8-3-8-9-3-2v-2l-12-1-10-4-20-16-1-13v-149l-4-6-43-43z" fill="#FEFEFE" />
                            <path transform="translate(0)" d="m0 0h785l-1 5-9 10-15 16-14 14-9 7-1 2v39l-1 118-2 7-9 10-11 9-6 2-7-1-8 5-9 10-10 4-9-2-8-7-10-10-7-8-74-74-3-2v-2l-4-2-7-6-9-2-5 1h-9l-10-2-10-9-6-5h-11l-7 3-7 10-6 2-15 1-4-1h-8l-8 5-9 10h-2v2l-8 7-10 11h-2l-2 4-232 232h-2v2l-8 7-9 10-5 5-4 8 1 5 1 4-2 18-12 11-5 9 1 8 3 6 9 7 3 9 2 18v10l7 8 9 9 7 8 77 77 8 7 5 8-1 9-3 6-8 7-5 14-3 10-11 13-6 7-2 1-125 1h-38l-5 5-8 10-25 25-10 8-6 1-1-1z" fill="#FEFEFE" />
                        </svg>
                    }
                    <div className="r-s-c">
                        <img src={getrealImg(c.cardType)} alt="" className="w50" />
                        <div className="c-s-s ml15">
                            <p className="ml20">{Khazl(c.CardNumber)}</p>
                            <span className="mt5">{c.ExpiryDate}</span>
                        </div>
                    </div>
                    {!c.isDefault &&
                        <div className="r-s-c  ml10 cntButonUpdate3">
                            <button className="c-b hoverEff2" onClick={() => Go_TO_UPDATE_PAYMENT_METHOD(c)}>update</button>
                            <button className="c-r hoverEff2" onClick={sendTodelet}>delete</button>
                        </div>

                    }


                </div>
            )
        }


        return (
            <div style={{ minHeight: "400px" }} className="wmia   mt50  psr c-s-s  ">
                {
                    isLodingPay ? <div className="loader"></div>
                        : havePaymenthMethod ?
                            <>

                                <h1 className="pb15 wmia r-s-c ">Payment Methods </h1>
                                <div className="defaultAddresMAs bg-b br20 p5 mt10 wmia c-s-s">
                                    {isLodingPay ? <div className="spinner"></div> :
                                        <>
                                            <p className="mb20  r-c-c ml10" style={{ color: "#fff" }}><svg style={{ fill: "#fff" }} xmlns="http://www.w3.org/2000/svg" className="mr10" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q65 0 123 19t107 53l-58 59q-38-24-81-37.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160q133 0 226.5-93.5T800-480q0-18-2-36t-6-35l65-65q11 32 17 66t6 70q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm-56-216L254-466l56-56 114 114 400-401 56 56-456 457Z" /></svg>Your default Payment Method</p>
                                            <span className=" wmia br20 p10 cntDefaultCard r-p-c" style={{ textAlign: "center", color: "#fff" }}>
                                                <img className="w70" src={getrealImg(defaultPaymenthMethod?.cardType)} alt="" />
                                                <div className="c-s-s">
                                                    <h1>
                                                        {defaultPaymenthMethod && Khazl(defaultPaymenthMethod.CardNumber)}
                                                    </h1>
                                                    <p>{defaultPaymenthMethod?.CardholderName}</p>
                                                </div>
                                                <h2>{defaultPaymenthMethod?.ExpiryDate}</h2>
                                            </span>

                                            <button className="mt20 w200  br20 " style={{ backgroundColor: "#fff", color: "#000" }} onClick={() => { Go_TO_UPDATE_PAYMENT_METHOD(defaultPaymenthMethod) }}><svg xmlns="http://www.w3.org/2000/svg" style={{ fill: "#000" }} className="mr10" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M480-120q-75 0-140.5-28.5t-114-77q-48.5-48.5-77-114T120-480q0-75 28.5-140.5t77-114q48.5-48.5 114-77T480-840q82 0 155.5 35T760-706v-94h80v240H600v-80h110q-41-56-101-88t-129-32q-117 0-198.5 81.5T200-480q0 117 81.5 198.5T480-200q105 0 183.5-68T756-440h82q-15 137-117.5 228.5T480-120Zm112-192L440-464v-216h80v184l128 128-56 56Z" /></svg>Update</button>
                                        </>
                                    }
                                </div>
                                <div className="listAllCards c-s-s ">
                                    {isLodingPay ? <div className="spinner"></div> :
                                        <>
                                            {AllPaymenthMethod && AllPaymenthMethod.map(c =>
                                                <SingleCardElem c={c} key={c.id} />

                                            )}
                                        </>
                                    }
                                </div>
                                <button className="bl p5 br20 wmia mt50" onClick={() => GoToAddPaymentMethod()}>
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
                                    </svg>Add a new payment method
                                </button>
                            </> :
                            <div className="mrauto c-c-c">
                                <h1 className="logo mt50" style={{
                                    textAlign: "center"
                                }}>You didn't provide any Any Payment Method yet !</h1>
                                <button className="bl p10 br20 wmia mt20 " onClick={() => GoToAddPaymentMethod()}>
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
                                    </svg>Add a  payment method
                                </button>
                            </div>
                }

            </div>
        )
    }


    const DeletAccount = () => {



        return (
            <div style={{ minHeight: "400px" }} className="wmia br20  mt50  psr c-s-s  ">
                <h1>Delete Account</h1>
                <div className="mt20 ">
                    <h2>Warning: Account Deletion</h2>
                    <p className="mt10">
                        Before proceeding, please note the following:
                    </p>
                    <ul className="mt20">
                        <li style={{ listStyle: "initial" }} className="mt10"> <p>All <b>payment methods</b> associated with your account will be permanently deleted. </p></li>
                        <li style={{ listStyle: "initial" }} className="mt10"> <p>Your saved <b>addresses</b> will no longer be available. </p></li>
                        <li style={{ listStyle: "initial" }} className="mt10"> <p>Any pending or completed <b>orders</b> will be permanently removed from your account. </p></li>
                        <li style={{ listStyle: "initial" }} className="mt10"> <p>Your <b>shopping cart</b> and wishlists will be cleared. </p></li>
                        <li style={{ listStyle: "initial" }} className="mt10"> <p>You will lose access to all account-related data, including order history and account preferences. </p></li>
                        <li style={{ listStyle: "initial" }} className="mt10"> <p> This action is <b>irreversible</b>, and you will need to create a new account to use our services again. </p></li>
                    </ul>
                    <p className="mt50">Are you sure you want to delete your account?</p>

                    <div className="modal-actions mt20">
                        <button className="bg-r w300 p10 r-c-c" onClick={() => { dispatch(showReauthentCmp()) }} >
                            Yes, Delete My Account <svg style={{ fill: "#fff" }} xmlns="http://www.w3.org/2000/svg" className="ml10" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" /></svg>
                        </button>
                        <button className="bl mt20  w300 p10" onClick={() => dispatch(logoutUser())}>
                            Log out only <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            <main ref={MainProfPageRef} style={{
                paddingTop: "250px",
                backdropFilter: ""
            }} className="profilePagePhone  psr  wmia  c-s-s ">

                <img src="imgs/rb_2850-removebg-preview (1).png" alt="" className="wmia FielsDesSds" />
                <div className='wmia  bg-l p20 br20 c-p-s' style={{
                    filter: " drop-shadow(0 0 10px var(--filter-color))"
                }}>
                    <UserInformations />
                    <div className="sideBareProfile2 psr wmia r-p-s p5">
                        <span onClick={() => setcomponenetVisiblety({ ...o, v2: true })} id={componenetVisiblety.v2 ? 'active' : "inactive"} className=" c-c-c ">
                            <svg version="1.1" viewBox="0 0 2048 2048" className="" xmlns="http://www.w3.org/2000/svg">
                                <path transform="translate(818)" d="m0 0h7l1 2 1-2h183l10 3v2l12 1 38 7 37 8 46 12 30 9 41 15 28 12 29 14 17 8 22 12 27 16 14 9 24 16 19 14 20 15 14 11 14 12 10 9 2 1v2l4 2 7 7 8 7 12 11 21 21 7 8 11 12 7 8 14 17 11 14 14 18 10 14 22 33 7 11 9 15 15 27 18 36 13 28 13 33 13 37 10 33 12 50 6 33 7 50 3 33 2 48v38l-2 43-4 35-8 43-7 36-2 9-1 2-5-1-20-9-26-8-39-10-38-8-22-5-6-3 1-9 5-18 5-26 3-20 3-34 1-20v-32l-3-52-3-31-6-37-8-36-10-36-10-30-10-26-13-29-9-19-12-22-14-25-13-20-11-16-12-17-10-13-9-11-13-15-4-4v-2h-2l-7-8-6-6v-2h-2l-7-8-11-11-8-7-14-13-25-20-17-13-16-11-18-12-21-13-23-13-15-8-28-13-33-14-37-13-25-7-40-10-35-6-42-5-30-2-30-1-45 2-33 3-38 6-34 7-29 8-26 8-40 15-25 11-29 14-24 13-38 24-12 8-16 12-14 11-9 7-15 13-12 11-13 12-27 27-7 8-13 14-9 12h-2l-2 5-7 9-12 16-14 20-15 24-15 26-15 29-9 19-12 29-10 29-8 25-11 42-5 25-4 27-4 42-2 27-1 23v25l2 30 4 34 7 39 8 32 12 40 13 37 12 29 10 23 13 28 14 28 12 22 15 27 14 23 16 26 10 16 16 24 11 16 14 20 10 14 12 16 10 14 12 16 14 18 12 15 13 17 11 13 8 10 12 14 9 11 10 11 9 11 11 12 7 8 10 11 7 8 9 10 5 6 22 22 7 8 9 9 7 8 16 17 9 9 7 8 25 25v2l4 2 22 22 6 5 24 24 8 7 17 17 8 7 7 6v2l4 2 9 9 8 7 12 11 8 7 13 12 11 10 11 9 13 12 11 9 15 13 16 15 13 11 10 9 8 7 12 10 9 7 5 5-2 4-12 10-8 7-12 11-8 7-10 9-11 10-8 7-10 9-14 11-10 8-3 1v2h-2l-2 4-9 6-10-10-11-9-13-10-14-11-13-11-11-9-12-11-8-7-11-10-11-9-9-9-11-9-7-7-11-9-8-8-8-7-10-9-8-8-8-7-9-9-8-7-21-21-8-7-13-13-8-7-26-26-5-4-7-8-26-26v-2h-2l-7-8-16-17-14-15-9-10-7-8-12-13-10-11-7-8-11-12-9-11-11-12-9-11-8-9-11-14-11-13-18-22-12-14-11-14-14-18-8-11-12-16-10-13-14-19-13-18-12-17-30-45-11-18-10-15-13-21-15-26-16-29-14-26-15-28-16-34-15-35-11-29-9-25-14-44-10-40-8-38-5-30-4-41-2-38v-33l2-39 3-40 4-30 8-49 7-30 9-35 8-26 10-29 15-38 14-31 18-36 13-23 9-15 8-13 18-27 7-10 10-14 21-28 11-13 7-8 7-7 8-10 7-7 7-8 8-8 7-8 10-9 13-13 8-7 13-12 11-9 9-8 19-14 30-22 24-16 26-16 35-20 21-10 15-8 28-12 21-8 16-6 36-12 34-10 39-9 35-7 29-5 2-1z" />
                                <path transform="translate(1410,1142)" d="m0 0 42 1h112l3 1 1 2v115l1 16 2 8 12 5 18 5 27 12 16 8 7 3 3-3h2v-2h2l2-4 7-7 7-8h2v-2l7-6 7-8 4-4h2v-2l13-13 8-7 4-5 8-7 16-17 5-5 5 2 10 10 7 8 26 26 2 1v2l4 2 12 12 7 8 31 31 8 11 1 4-4 5-10 8-36 36-1 2h-2l-2 4h-2v2l-8 7-21 21-8 7-4 2v7l8 13 8 18 8 19 8 25 1 2 3 1 141 1 1 1 1 101v54l-2 3-3 1-118 1-24 1-7 24-13 29-11 21 1 6 6 9 3 3v2h2v2h2l4 5 8 7 34 34v2l3 1 7 8 8 7 7 8 9 10 2 4v5l-13 12-8 7-4 5-7 6-1 2h-2l-2 4-48 48-7 6-7 8-9 9-4-1-9-7-8-10-8-7-52-52-7-8-12-12-4-1-16 7-8 4-36 14-20 7h-2v143h-160l-1-20-1-120-4-4-33-11-27-13-11-6-8-1-7 7-7 8-7 6-7 8-10 10-1 2h-2l-2 4-6 6h-2l-2 4-8 8-16 14-7 8-11 12-3 2-13-10-7-9-8-7-70-70-10-8-6-7 2-4 11-11 7-8 73-73 5-8-1-6-9-16-13-32-9-27h-145l-2-5v-155l3-2h133l11-2 4-9 8-24 11-26 10-17-2-6-6-7-8-7-9-10-33-33-8-7v-2l-3-1-5-6-6-5v-2l-4-2-10-8-5-6 1-5 16-16 5-6 6-5 3-4h2l2-4h2v-2l8-7 6-7h2v-2l8-7 5-6 8-7 22-22 6-7h2l2-4 5-5 5 1 9 9 7 9 11 11 8 7 49 49 7 8 5 4 4 1 24-12 23-9 27-9 3-3 1-4 1-46 1-82 2-9zm65 294-22 3-19 5-18 8-14 9-13 10-15 14-9 9-9 12-8 13-6 12-8 24-4 18-2 23 2 22 3 15 5 16 7 17 9 16 10 14 11 12 7 7 10 8 19 12 17 8 21 7 23 4h28l21-3 15-4 21-9 16-9 17-12 16-15 11-13 12-19 8-20 6-22 3-24v-12l-2-25-5-19-8-21-10-19-11-15-9-10-9-9-13-10-17-10-21-9-16-5-15-3-9-1z" />
                                <path transform="translate(889,440)" d="m0 0h59l31 3 22 4 31 8 28 10 23 10 22 12 18 11 19 13 10 8 13 10 12 11 8 7 15 15 7 8 10 12 11 15 9 13 12 19 14 27 7 15 10 27 8 26 5 22 5 33 2 24v34l-2 21-6 40-6 24-10 32-16 36-13 23-10 16-14 20-9 12-18 21h-2l-2 4-24 22-14 11-12 9-15 10-20 12-18 10-28 12-25 9-25 7-28 6-34 4-17 1h-36l-24-2-36-6-29-8-29-10-33-15-24-14-14-9-11-8-13-10-13-11-10-9-7-6-5-6-5-5-13-14-11-14-10-13-14-21-12-21-8-15-13-31-7-21-7-27-5-24-4-31-1-15v-27l3-30 6-36 7-28 9-27 15-34 11-20 14-23 9-12 7-9 10-13 12-14 23-23 8-7 16-13 13-10 15-10 24-14 26-13 28-11 18-6 30-7 26-4zm17 161-24 2-24 5-20 7-23 11-14 9-10 7-16 13-11 10-7 8-9 10-8 11-8 13-8 14-8 19-9 27-4 19-2 17-1 21 3 29 5 24 6 18 8 19 10 19 13 19 11 13 6 7h2v2l8 7 10 9 15 11 20 12 22 10 17 6 19 5 29 4h27l23-3 16-3 19-5 24-10 22-12 12-8 13-10 12-11 2-1v-2l4-2 13-15 6-8 9-13 13-24 12-36 5-25 2-22v-13l-2-22-4-25-6-20-8-20-8-16-10-17-12-16-12-14-12-11-17-13-14-9-18-10-16-7-24-8-18-4-20-2z" />
                                <path transform="translate(1034)" d="m0 0h17v2h-16z" />
                                <path transform="translate(913,2046)" d="m0 0 2 1h-3z" />
                                <path transform="translate(1021,3)" d="m0 0 2 1z" />
                                <path transform="translate(915,2047)" d="m0 0" />
                                <path transform="translate(1653,1874)" d="m0 0" />
                                <path transform="translate(1020)" d="m0 0" />
                                <path transform="translate(793)" d="m0 0" />
                            </svg>
                            <p className="mt10">Addresses</p>
                        </span>
                        <span onClick={OpenPaymentMethodsSection} id={componenetVisiblety.v3 ? 'active' : "inactive"} className="   c-c-c">
                            <svg version="1.1" viewBox="0 0 2048 2048" className="" xmlns="http://www.w3.org/2000/svg">
                                <path transform="translate(1770,240)" d="m0 0h35l19 3 18 6 21 10 15 10 11 9 13 12 11 14 10 16 9 19 7 23 4 21 6 46 9 78 12 110 9 75 10 86 7 60 6 53 8 66 9 79 11 90 8 62 8 59h2v84l-1 2-3 1-12 28-14 20-9 11-6 7-8 7-10 9-14 10-16 8-21 7-20 5-34 5-18 2-3 1-1 167-2 39-2 19-3 16-7 19-10 19-8 12-12 14-11 11-18 13-16 8-19 7-22 5-19 2-16 1h-1540l-31-3-22-6-18-8-11-7-12-9-12-11-11-11-12-17-9-16-13-27-2-1v-976l8-16 10-21 12-20 13-16 1-2h2v-2h2v-2l8-7 12-9 16-10 17-8 13-4 25-4 12-1 33-1h1452l52 1 33 2 18 3 16 5 16 7 18 11 13 10 12 11v2h2l12 16 9 15 9 19 5 15 3 12 3 28 1 19v443l-1 23-1 11-4 8-5 4-9 3-5 1h-17l-8-3-6-5-4-9-1-5-1-488-2-20-3-12-5-13-10-15-12-13-10-8-17-9-14-4-21-2-236-1h-1019l-284 1-28 2-12 3-16 8-11 8-11 11-8 11-9 17-4 11-3 25-1 102v748l1 50 2 19 4 16 5 11 7 12 12 13 11 9 14 8 15 5 13 2 13 1 50 1h127l375 1h641l355-2 20-3 12-4 12-6 14-10 10-10 7-10 8-16 4-16 2-15 1-20 1-107 1-168 1-14 3-5 5-4 10-5 6-1h15l11 4 5 5 2 10 4 36 1 3h14l22-3 19-4 21-8 10-6 9-7 10-10 8-13 7-16 3-14 1-9v-21l-4-44-9-80-10-83-7-65-11-92-11-94-7-61-14-119-7-61-11-96-9-78-4-27-5-16-6-15-9-14-12-12-11-8-16-8-9-3-10-2h-33l-36 3-99 12-72 8-65 8-81 9-56 7-62 7-64 8-84 9-66 8-81 9-65 8-61 7-56 7-84 9-67 8-71 8-65 8-71 8-73 9-80 9-64 8-25 5-11 5-11 7-11 9-14 12-8 6-11 4h-5l-11-8-8-8-4-6-1-3v-13l4-10 9-12 11-11 12-9 18-11 15-7 16-5 27-5 51-7 68-8 52-6 73-9 71-8 58-7 66-7 83-10 62-7 64-8 72-8 74-9 63-7 74-9 72-8 56-7 81-9 67-8 71-8 75-9 130-15z" />
                                <path transform="translate(340,944)" d="m0 0h79l46 1 26 1 14 2 13 5 10 5 12 9 11 11 10 15 7 14 4 15 1 9 1 26v89l-2 35-4 18-6 14-6 10-8 10-5 5-8 7-17 9-12 4-21 3-16 1-48 1h-85l-48-1-22-2-16-4-14-7-11-9-9-9-10-14-8-17-4-15-2-16-1-31v-63l1-34 2-18 3-14 7-17 9-13 5-6 8-7 12-9 15-7 14-3 26-2zm-58 62-13 2-6 4-4 5-4 9-2 12-1 12v117l3 14 5 10 7 6 18 4 12 1h163l20-1 14-3 6-4 5-6 3-5 2-8 2-27v-86l-2-35-4-12-7-6-10-2-18-1z" />
                                <path transform="translate(525,1523)" d="m0 0h271l77 1 10 4 6 5 2 4 1 14-1 13-4 10-4 5-9 3-61 1h-563l-34-1-10-2-7-6-5-10-1-6v-9l3-12 6-8 6-4 7-1h69z" />
                                <path transform="translate(1531,817)" d="m0 0h14l7 3 8 9 11 21 10 26 10 33 5 24 3 22 1 14v42l-2 26-4 25-6 24-12 36-13 27-8 11-7 5-3 1h-7l-13-4-9-6-9-9-2-4 2-12 6-18 9-24 8-27 5-26 2-16 1-16v-32l-2-23-6-29-6-20-13-37-5-15-1-4v-7l7-8 11-8z" />
                                <path transform="translate(668,1362)" d="m0 0h165l39 1 10 3 8 7 2 7-1 23-3 10-6 7-3 1-15 1h-256l-18-2-7-7-4-8-1-4v-13l3-11 5-8 9-6z" />
                                <path transform="translate(272,1362)" d="m0 0h190l26 1 9 4 7 6 3 6v21l-3 10-6 8-7 3-24 1h-248l-11-1-6-3-6-9-2-6-1-14 3-14 5-6 10-5 3-1z" />
                                <path transform="translate(1439,1362)" d="m0 0h179l22 1 13 3 6 4 3 7v20l-2 12-6 9-9 3-40 1h-217l-22-1-7-2-6-7-4-10-1-5v-9l4-13 6-8 8-4z" />
                                <path transform="translate(1051,1362)" d="m0 0h165l38 1 12 3 7 4 3 3 1 3v22l-2 11-6 9-11 3-68 1h-197l-15-1-5-2-6-8-3-9-1-5v-10l3-11 6-8 8-5z" />
                                <path transform="translate(1418,875)" d="m0 0h10l10 5 8 9 8 15 9 24 5 20 3 19 1 12v25l-2 21-5 24-7 21-8 18-7 10-7 6-4 2-7 1-12-2-12-6-7-7-2-5v-13l12-41 4-21 1-9v-29l-3-17-6-21-9-28-1-10 4-8 4-5 9-6z" />
                                <path transform="translate(344,1074)" d="m0 0h74l9 2 10 6 5 6 2 4v21l-4 9-8 7-8 3-10 1h-73l-8-3-5-5-6-9-1-4v-17l5-10 8-7z" />
                                <path transform="translate(1301,932)" d="m0 0h8l10 4 8 6 6 7 6 12 4 17v27l-4 17-6 12-7 8h-2v2l-10 6-9 1-13-5-8-6-6-7-1-5v-12l4-17v-16l-4-14v-9l3-13 2-4 10-7z" />
                                <path transform="translate(2044,1335)" d="m0 0 3 1-3 3-1-3z" />
                                <path transform="translate(2047,1204)" d="m0 0h1v8h-1z" />
                                <path transform="translate(2047,1340)" d="m0 0 1 3-2 1z" />
                                <path transform="translate(2047,1192)" d="m0 0 1 3h-2z" />
                                <path transform="translate(2046,1346)" d="m0 0h2v2h-2z" />
                                <path transform="translate(2047,1200)" d="m0 0" />
                                <path transform="translate(2047,1196)" d="m0 0" />
                                <path transform="translate(2047,1188)" d="m0 0" />
                            </svg>
                            <p className="mt10">Carts</p>
                        </span>
                        <span onClick={() => setcomponenetVisiblety({ ...o, v4: true })} id={componenetVisiblety.v4 ? 'active' : "inactive"} className=" c-c-c ">
                            <svg version="1.1" viewBox="0 0 2048 2048" className="" xmlns="http://www.w3.org/2000/svg">
                                <path transform="translate(1477,945)" d="m0 0h173l45 1 12 3 12 7 10 8 9 9 6 10 4 11 2 9 1 10v89h82l34 1 23 3 15 5 16 8 11 7 12 11 8 8 11 15 8 16 6 16 3 15 1 9v17l-2 16-7 21-11 21-8 10-6 7-8 7-11 8-12 7-2 3 1 10-1 465-1 40-2 27-4 16-8 20-9 15-7 9-9 10-12 11-15 10-16 7-18 5-24 3-15 1-36 1h-394l-28-2-17-3-17-6-17-9-10-8-12-11-11-12-12-20-6-13-5-16-4-19-3-26-1020 2h-44l-32-1-14-2-8-4-10-12-5-10-3-10-1-7v-35l3-38 5-38 8-46 8-36 11-40 9-27 10-27 8-19 12-27 10-21 12-22 13-22 9-15 9-13 13-19 21-28 9-11 8-9 7-8 9-10 7-8 9-9 5-6 8-7 21-21 8-7 13-11 20-16 16-12 33-22 23-14 21-12 25-13 28-13 32-13 38-13 32-9 36-8 47-8 40-4 38-2h53l32 2 40 4 36 6 30 7 41 11 43 15 22 9 23 10 36 18 16 9 23 13 4-1 12-16 6-7 10-8 13-9 19-9 13-4 16-2 14-1 104-1 1-67 1-26 2-12 8-16 6-8 9-10 9-7 9-6 5-2 8-1zm-24 84-1 5-1 37v26l1 4 60 1h133l19-1 1-1 1-33v-35l-1-2-165-1zm-693 110-44 3-40 5-32 6-36 9-27 8-38 14-19 8-15 7-33 17-7 4-24 15-15 10-20 14-14 11-16 13-13 12-8 7-10 9-25 25v2h-2l-9 11-9 10-22 28-10 13-12 18-14 23-7 11-17 32-11 24-6 13-11 28-12 36-7 23-9 39-7 35-4 28-4 33v10l2 1 27 1h783l136-1h101l3-2 1-89 1-273v-51l-2-7-7-6-9-7-10-9-14-14-10-15-9-20-6-8-9-8-19-12-22-13-18-10-32-16-31-13-30-11-29-9-37-9-33-6-35-4-41-3zm495 48-14 2-8 7-4 6-5 11-2 6v12l4 10 8 7 9 4 24 6 6 1 203 1h171l194-1 19-3 17-4 10-5 5-5 3-14v-9l-6-17-6-10-10-4-8-1zm173 157-138 1v503l2 16 5 13 6 8 11 8 7 3 11 2 189 1h226l36-1 11-2 11-4 9-6 7-7 4-10 3-21 1-467-1-36-2-1z" />
                                <path transform="translate(778,64)" d="m0 0 35 1 33 3 26 4 28 7 36 12 28 12 21 10 16 9 21 13 20 14 16 12 17 14 5 4v2l4 2 24 24 7 8 11 13 10 13 12 17 14 22 9 16 9 17 9 20 11 29 9 28 7 30 6 37 3 30v47l-2 24-8 45-6 25-7 23-10 27-13 28-11 21-8 14-14 22-11 14-6 8-11 13-7 8-11 12-22 22-8 7-14 11-10 8-11 8-12 8-13 8-21 12-33 16-21 8-36 12-26 6-31 6-32 4-26 1h-15l-26-1-33-4-30-6-30-8-32-11-24-10-21-10-23-13-17-11-16-11-17-13-15-13-13-12-18-18v-2h-2l-7-8-9-10-13-17-11-15-10-15-15-26-8-15-11-24-11-30-6-18-8-32-6-33-3-27-1-19v-26l2-30 3-25 5-28 5-19 8-27 6-17 11-26 8-17 12-22 11-18 7-10 12-17 20-25 10-11 1-2h2l2-4h2l2-4 8-8h2l1-3 8-7 10-9 10-8 21-16 18-12 22-13 27-14 25-11 25-9 27-8 28-6 27-4 26-2zm-14 84-36 3-28 5-20 5-24 8-27 11-17 8-23 13-10 7-11 8-16 12-15 13-12 11-12 12-9 11-10 12-8 12-10 14-11 19-9 17-12 27-9 24-5 17-6 28-5 36-1 15v27l2 25 6 36 7 28 8 24 9 22 10 21 13 22 16 23 11 14 12 14 25 25 11 9 12 10 18 13 18 11 16 9 24 12 26 10 19 6 39 8 36 4 30 1 32-2 32-5 32-8 18-6 25-10 28-14 20-12 16-11 12-9 16-13 8-7 5-4v-2l4-2 10-10 7-8 2-4h2l12-16 10-13 10-15 12-21 8-16 11-27 9-30 6-25 4-25 2-20v-51l-3-26-4-24-7-27-11-33-14-30-10-19-13-21-13-17-8-10-9-10-7-8-12-12h-2l-1-3-11-9-13-11-20-14-19-12-18-10-27-13-24-9-22-7-23-5-19-3-23-2-18-1z" />
                                <path transform="translate(1692,1564)" d="m0 0h20l10 3 9 5 5 4 6 9 3 15 1 16v170l-2 20-4 10-7 8-14 9-6 2h-15l-12-3-9-5-9-9-5-9-2-8-1-10v-190l4-14 6-9 5-6 7-5z" />
                                <path transform="translate(1407,1563)" d="m0 0h15l14 4 9 6 7 8 4 11 2 19v176l-2 17-5 12-8 9-12 8-7 2h-16l-12-3-11-8-6-8-4-8-2-10-1-14v-179l3-14 5-10 9-10 10-6z" />
                                <path transform="translate(1549,1563)" d="m0 0h17l13 4 10 6 7 8 3 8 2 11 1 14v160l-2 28-4 12-7 9-12 9-7 3h-17l-11-3-9-5-6-5-7-10-3-11-1-10v-187l4-16 9-14 7-6 5-3z" />
                            </svg>
                            <p className="mt10">Deletion</p>
                        </span>
                    </div>
                    <div className="r-s-s wmia">
                        {/* {
                        componenetVisiblety.v1 && <UserInformations />
                    } */}
                        {
                            componenetVisiblety.v2 && <AddressManagementCmp />
                        }
                        {
                            componenetVisiblety.v3 && <PaymentMethodCmp />
                        }
                        {
                            componenetVisiblety.v4 && <DeletAccount />
                        }
                    </div>
                </div>
            </main>
        </>
    )
}