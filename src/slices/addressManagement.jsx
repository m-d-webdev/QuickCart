import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { auth, db } from '../config/fireBase'
import { setDoc, updateDoc, getDoc, doc } from 'firebase/firestore'
import { act, useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ReactDom from "react-dom"
import { v4 } from 'uuid'
import { showTenDone } from './tenDoeneslice'
import { useNavigate } from 'react-router-dom'
import { hideProfile } from './profileSlice'
export const checkAddress = createAsyncThunk(
    "auth/checkAddress",
    async (_, { rejectWithValue }) => {
        const userExists = await getDoc(doc(db, "users", localStorage.getItem("userId")));
        if (userExists.data().addresses != undefined) {
            return userExists.data().addresses.filter(e => e.isDefault == true)[0];
        } else {
            return rejectWithValue('No address provideed')
        }

    }
)

export const getUserAddress = createAsyncThunk(
    "addAddress/getUserAddress", async (_, { rejectWithValue }) => {
        try {

            const requ = await getDoc(doc(db, "users", localStorage.getItem("userId")));
            if (requ.data().addresses != undefined) {
                return requ.data().addresses;
            } else {

                return rejectWithValue('');
            }
        }
        catch (error) {
            return rejectWithValue(error.message);
        }

    })

export const updateAddressF = createAsyncThunk(
    "addAddress/updateAddressF",
    async (addressObject, { dispatch, getState, rejectWithValue }) => {
        try {
            const isPc = window.innerWidth
            const resp = await getDoc(doc(db, "users", localStorage.getItem("userId")));
            let allAddress = resp.data().addresses;
            const updated_allAddress = allAddress.map(ad => ad.id == addressObject.id ? ad = addressObject : ad)
            await updateDoc(doc(db, "users", localStorage.getItem("userId")), { addresses: updated_allAddress });
            addressObject.isDefault == true ? dispatch(getUserAddress()) : null;
            dispatch(showTenDone([, "Your Address has been updated successfully !"]))
            return addressObject;
        } catch (error) {
            console.log(error);
            dispatch(showTenDone([false, "Faild to update the address !"]))
            return rejectWithValue(error.message)

        }
    }
)


export const submitAddress = createAsyncThunk(
    "addAddress/submitAddress",
    async (addressObject, { rejectWithValue, getState, dispatch }) => {
        try {
            let addressNewId = v4()
            const { haveAnAddress } = getState().addAddress;
            if (!haveAnAddress) {
                await setDoc(doc(db, "users", localStorage.getItem("userId")), { addresses: [{ ...addressObject, id: addressNewId }] }, { merge: true });
                dispatch(showTenDone([true, "Address saved successfully"]))
                return [{ ...addressObject, id: addressNewId }];
            }
            else {
                return await getDoc(doc(db, "users", localStorage.getItem("userId"))).then(async (res) => {
                    let AlluserAddress = res.data().addresses;
                    if (addressObject.isDefault == true) {
                        AlluserAddress.map(a => a.isDefault == true ? a.isDefault = false : a)
                    }
                    AlluserAddress.push({ ...addressObject, id: addressNewId });
                    await updateDoc(doc(db, "users", localStorage.getItem("userId")), { addresses: AlluserAddress })
                    dispatch(showTenDone([true, "Address saved successfully"]))
                    return AlluserAddress;
                })
            }
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const addAddressSlice = createSlice({
    name: "addAddress",
    initialState: {
        isVisible: false,
        haveAnAddress: false,
        userAddress: null,
        allAddresses: [],
        userAdded: false,
        address_added_success: false,
        address_updated_success: false,
        userAdded: false,
        isLoadingAddress: false,
        // -------------------
        errorAddress: null,
        //  Update address States ==== 
        isVisible2: false,
        wantedToUpdatedAddress: null,
        isUpdatingAddress: false
    },
    reducers: {
        showAddAddress: (state) => {
            state.isVisible = true;
        },
        hideAddAddress: (state) => {
            state.isVisible = false;
        },
        showUpdateAddress: (state, action) => {
            const deviceTypePc = window.innerWidth > 800;
            state.wantedToUpdatedAddress = action.payload;
            if (deviceTypePc) {
                state.isVisible2 = true;
            }
        },
        hideUpdateAddress: (state) => {
            state.isVisible2 = false;
        },
        resedAddUptatingStatus: (state, action) => {
            if (action.payload == 1) {
                state.address_added_success = false;
            } else if (action.payload == 2) {
                state.address_updated_success = false;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(checkAddress.fulfilled, (state, action) => {
                state.userAddress = action.payload
                state.isVisible = false;
                state.haveAnAddress = true;
            })
            .addCase(checkAddress.rejected, (state) => {
                state.haveAnAddress = false;
                state.isVisible = true;
            })
            .addCase(submitAddress.pending, (state) => {
                state.isLoadingAddress = true;
            })
            .addCase(submitAddress.fulfilled, (state, action) => {
                state.isLoadingAddress = false;
                state.isVisible = false;
                state.userAdded = true;
                state.address_added_success = true;
                state.haveAnAddress = true;
                state.allAddresses = action.payload;
                state.userAddress = action.payload.filter(ad => ad.isDefault == true)[0]
            })
            .addCase(submitAddress.rejected, (state, action) => {
                state.isLoadingAddress = false;
                state.isVisible = true;
                state.userAdded = false;
                state.errorAddress = action.payload;
            })
            .addCase(getUserAddress.pending, (state, action) => {
                state.isLoadingAddress = true;
            })
            .addCase(getUserAddress.fulfilled, (state, action) => {
                state.isLoadingAddress = false;
                state.haveAnAddress = true;
                state.userAddress = action.payload.filter(ad => ad.isDefault == true)[0];
                state.allAddresses = action.payload

            })
            .addCase(getUserAddress.rejected, (state, action) => {
                state.isLoadingAddress = false;
                state.haveAnAddress = false;
                state.errorAddress = action.payload;
            })
            .addCase(updateAddressF.pending, (state) => {
                state.isUpdatingAddress = true;
            })
            .addCase(updateAddressF.fulfilled, (state) => {
                state.isUpdatingAddress = false;
                state.isVisible2 = false;
                state.address_updated_success = true;

            })
            .addCase(updateAddressF.rejected, (state) => {
                state.isUpdatingAddress = false;

            })
    }

})

export const { showAddAddress, hideAddAddress, showUpdateAddress, hideUpdateAddress, resedAddUptatingStatus } = addAddressSlice.actions;
export default addAddressSlice.reducer;

export const changeNav = (path) => {
    const navigate = useNavigate()
    navigate(path)
}

export const AddAddress = () => {
    const dispatch = useDispatch()
    const deviceTypePc = window.innerWidth > 800
    const { haveAnAddress, isLoadingAddress, address_added_success } = useSelector(st => st.addAddress);
    const [addressObject, setaddressObject] = useState({
        phone: "", houseApparNum: "", street: "", city: "", zip: "", isDefault: haveAnAddress == true ? false : true
    })
    const MainPagePuRef = useRef()
    const navigate = useNavigate();
    useEffect(() => {
        if (address_added_success) {
            console.log('test');
            dispatch(resedAddUptatingStatus(1))
            navigate(-1)
        }
    }, [address_added_success])
    const handelSubmitLogin = (e) => {
        e.preventDefault();
        dispatch(submitAddress(addressObject));
    }
    function handelHideAddress() {
        dispatch(hideAddAddress())
    }
    const [AllDone, setAllDone] = useState(true)
    useEffect(() => {
        setAllDone(Object.keys(addressObject).some(k => addressObject[k] == "" && k != "isDefault"))
    }, [addressObject])
    if (deviceTypePc) {
        return ReactDom.createPortal(
            <div className='backendMer'>
                <div action="" style={{ position: "relative" }} className="activeCmp w600 h700 bg-l p20 br10 c-p-s">
                    {
                        isLoadingAddress ? <div className="loader"></div> :
                            <>
                                <button className='btnClose' onClick={handelHideAddress} type='button'><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" /></svg></button>
                                <h1 className='r-s-c wmia pb20 mb20' style={{ borderBottom: "solid 1px var(--border-color)" }}>
                                    <svg version="1.1" viewBox="0 0 2048 2048" className='mr10' height="128" xmlns="http://www.w3.org/2000/svg">
                                        <path transform="translate(652)" d="m0 0h182l1 1 4-1h49v1l-12 1-1 1h-19-3l-2 2 1 1 41 5 33 6 31 8 30 9 33 10 33 11 24 10 26 13 18 10 26 14 18 10 27 16 15 11 13 10 16 13 14 11 17 14 26 22 16 14v2l3 1 7 8 8 8 9 11 12 14 11 14 11 13 10 13 14 18 13 19 11 18 15 26 16 30 10 19 8 16 9 20 8 21 14 44 16 54 5 22 5 33 7 63 3 36v59l-3 34-5 19-6 11-10 13h-2v2l-12 8-13 4-12 2h-13l-16-4-10-5-12-11-10-11-4-7-3-13-1-10v-18l3-28v-35l-7-68-3-30-4-22-7-27-17-55-12-33-11-24-12-23-12-22-14-25-11-17-12-17-12-15-9-12-12-14-8-10-12-14-6-6v-2l-4-2v-2l-4-2-9-9-11-9-14-12-13-11-20-16-19-14-19-12-21-12-27-15-32-17-23-10-25-9-45-14-35-10-20-4-33-4-52-5-15-1h-37l-45 4-44 5-31 6-31 9-30 9-23 8-22 8-25 12-19 10-12 7-12 6-13 8-11 6-13 8-16 11-15 12-11 9-14 12-10 8-13 11-11 9-18 18-9 11-8 9-8 10-10 13-14 17-13 16-9 14-7 11-6 11-13 24-12 22-13 25-8 20-16 47-15 48-5 24-5 48-7 63v26l4 47 6 41 6 31 9 34 12 36 15 44 11 30 7 20 11 27 12 26 13 27 8 16 9 17 9 19 10 19 12 24 10 18 13 22 8 13 14 23 11 17 11 18 30 48 22 33 12 17 13 18 12 17 10 14 39 54 14 19 13 16 10 13 14 18 11 14 9 11 13 16 11 14 13 16 11 14 13 15 12 14 11 12 7 8 12 14 11 12 9 11 12 13 9 11 10 11 7 8 12 13 8 10 13 14 8 10 5 4h5l8-8 8-10 10-11 9-11 9-10 11-13h2l2-4h2l2-4 11-12 6-5 5-5 8-7 12-7 12-3h23l12 3 12 6 9 7 7 8 7 11 5 13 2 10v13l-2 9-7 14-12 16-9 11-12 14-14 15-7 8-14 15-6 7h-2l-2 4-9 9-7 8-14 15-11 12-14 15-14 13-12 8-7 6v2h-40l-11-7-14-11-10-9-26-26-7-8-15-16-9-10-16-17-6-6v-2h-2l-7-8-12-13-7-8-12-14-10-11-9-11-10-11-7-8-12-14-11-13-13-15-9-11-11-13-7-9-11-13-9-11-12-15-13-17-10-13-15-20-12-15-10-13-16-21-18-24-16-21-13-19-10-14-34-51-29-43-20-30-19-29-15-25-10-17-13-24-12-22-16-30-13-23-15-29-9-16-19-37-14-31-13-30-16-40-16-45-16-53-12-49-9-44v-5l-2-1v-4h-2l-2-8-2 2h-4v-175h2l2-5 8-59 5-28 7-28 13-43 18-56 13-30 12-23 14-25 11-21 8-14 11-19 12-19 22-28 13-16 9-11 12-14 9-11 6-7 9-11 6-7h2l2-4 8-7 7-7 13-10 10-9 11-9 13-11 14-11 16-13 18-13 10-7 17-10 25-14 46-25 23-12 21-9 38-13 55-17 27-7 18-4 24-4 31-4 8-1h-5l-2-2-17-2zm153 1m22 0m4 0m-155 2m24 0v1h7v-1zm125 0m20 0m-155 1v1h9v-1zm143 0m3 0m-830 866 1 2zm-2 4m5 6 1 2z" />
                                        <path transform="translate(1525,1024)" d="m0 0h20l44 3 34 4 26 5 25 7 38 12 25 10 25 12 19 10 21 12 18 11 19 14 16 13 14 11 11 10 11 9 15 15 9 11 9 10 9 11 13 16 12 17 11 17 12 22 12 23 8 16 11 26 14 43 9 31 5 26 6 41h2v141h-2v-4h-2v-2h2l-2-4-1-3-3 4-2 6-8 34-12 38-8 24-11 24-13 26-13 23-9 17-13 17-6 8-10 12-11 14-11 13-9 11-11 11-8 7-11 10-9 7-16 13-11 8-19 14-22 13-32 17-16 8-15 7-28 10-47 15-25 6-22 4-23 3-1 2-6 2h-8l-1-3v3l-3-1-1 1h-71l-4-2h-9v-2l-25-3-31-6-52-15-36-12-21-9-25-13-22-12-20-12-11-8-17-13-13-11-14-11-13-12-8-7-10-10-9-11-10-11-8-10-11-13-10-13-12-17-16-28-15-28-12-25-8-21-14-43-7-26-4-20-4-36-4-44v-16l2-27 6-54 4-20 12-41 8-24 6-17 7-16 11-22 8-14 7-14 12-21 8-12 16-21 11-13 10-13 10-12 7-8 9-10 10-9 14-11 13-11 10-8 18-14 16-11 28-16 34-18 19-9 29-10 28-9 27-7 25-5 36-4 23-2zm-9 129-34 3-28 5-32 8-32 11-18 8-22 12-15 9-11 7-14 10-16 13-14 11-16 15-9 10-9 11-9 10-11 14-10 14-9 16-9 15-8 16-8 18-13 36-5 18-5 27-7 55v23l7 58 6 26 8 26 9 25 12 25 10 19 12 19 8 11 10 13 13 16 9 11 18 18 11 9 13 11 16 12 18 12 21 12 22 12 21 9 37 12 24 6 34 5 34 3h22l57-6 23-5 38-12 22-8 26-13 24-14 16-10 17-13 16-13 11-9 11-11 2-1v-2h2l8-10 10-11 8-10 7-9 11-15 9-16 8-14 14-27 9-25 9-31 5-21 4-30 3-26 1-13-1-28-5-45-4-20-7-27-11-31-10-23-13-25-14-23-14-19-12-14-9-11-4-5h-2l-2-4-16-16-14-11-12-10-18-13-20-12-23-13-17-8-13-6-40-13-25-6-29-4-33-3zm530 342 1 2zm0 4m-7 120 1 2zm-458 425m-17 2 4 1z" />
                                        <path transform="translate(758,384)" d="m0 0h17l30 2 28 3 26 5 27 8 23 8 18 8 22 11 27 16 17 12 17 14 10 8 10 9 8 7 10 10 7 8 11 13 9 12 10 14 12 19 12 22 8 16 9 21 10 31 9 36 4 33 2 20v33l-5 52-6 25-7 24-8 24-12 26-13 25-9 15-8 12-9 12-9 11-14 17-14 15-13 12-14 11-9 8-14 10-17 11-16 9-18 10-25 11-30 10-33 9-23 4-39 4h-44l-40-4-24-5-27-8-32-11-21-10-22-12-21-13-18-13-14-12-11-9-6-5-16-16-7-8-9-10-11-14-13-17-12-19-10-18-11-21-11-28-8-24-7-27-4-26-4-40v-27l6-53 5-23 11-36 11-28 11-22 11-20 12-19 8-11 13-16 11-14 15-16 11-11 11-9 16-13 16-12 15-10 23-13 23-12 26-10 30-9 26-6 33-4zm-14 129-24 3-25 6-21 7-20 9-14 8-15 10-14 10-14 12-12 11-1 3-4 2-9 11-11 14-12 19-6 11-12 25-6 18-5 19-4 21-3 27v20l3 26 5 25 8 26 8 18 10 20 12 19 13 16 8 10 18 18 11 9 18 13 13 8 24 13 25 10 23 6 16 3 26 3h26l27-3 22-4 24-7 22-9 24-13 15-10 12-9 14-11 12-11 14-16 12-16 9-14 9-16 9-19 7-21 5-20 4-23 2-17v-23l-2-24-4-25-4-15-10-29-12-24-11-18-10-14-14-17-15-15-11-9-16-12-21-13-21-11-20-8-20-6-25-5-20-2z" />
                                        <path transform="translate(1527,1280)" d="m0 0h10l15 2 14 5 11 8 7 7 7 10 5 11 2 8 1 10v130h120l20 2 11 3 12 6 12 11 7 8 6 10 3 9 1 5v19l-4 14-7 12-11 14-9 7-9 4-12 2-10 1-28 1h-101v107l-1 26-2 13-8 16-10 13-8 7-12 6-14 3h-20l-12-3-12-6-10-9-7-8-8-14-3-7-2-12-1-17-1-115h-130l-15-3-12-5-9-7-8-8-9-14-5-12-2-10v-8l3-15 8-16 11-13 14-10 8-4 13-2 13-1 116-1 3-1 1-6 1-104 1-23 3-13 5-9 9-12 6-7 13-9 8-4z" />
                                        <path transform="translate(1625,2045)" d="m0 0 4 1v2h-26v-1z" />
                                        <path transform="translate(1443,2045)" d="m0 0h8l5 2v1h-14z" />
                                        <path transform="translate(2047,1441)" d="m0 0h1v12h-1v-5h-2v-4h2z" />
                                        <path transform="translate(1588,2046)" d="m0 0h3v2l-3-1z" />
                                        <path transform="translate(2047,1456)" d="m0 0 1 4-2-1z" />
                                        <path transform="translate(1597,2046)" d="m0 0 2 2-3-1z" />
                                        <path transform="translate(1593,2046)" d="m0 0 2 2h-2z" />
                                        <path transform="translate(1584,2047)" d="m0 0 3 1z" />
                                        <path transform="translate(2041,1628)" d="m0 0 1 2-2-1z" />
                                        <path transform="translate(746,2047)" d="m0 0 2 1z" />
                                        <path transform="translate(790,2046)" d="m0 0 2 1z" />
                                        <path transform="translate(2047,1462)" d="m0 0" />
                                        <path transform="translate(1495,2047)" d="m0 0" />
                                        <path transform="translate(2047,1636)" d="m0 0" />
                                        <path transform="translate(2046,1635)" d="m0 0" />
                                        <path transform="translate(2041,1625)" d="m0 0" />
                                        <path transform="translate(2045,1486)" d="m0 0" />
                                        <path transform="translate(2045,1462)" d="m0 0" />
                                        <path transform="translate(5,879)" d="m0 0" />
                                    </svg>Add a new  address
                                </h1>
                                <div className="LabelInpInfo">
                                    <input onChange={e => setaddressObject(cu => ({ ...cu, phone: e.target.value }))} type="text" id="phone" name='phone' placeholder='' />
                                    <label htmlFor="phone">Phone number</label>
                                    <svg xmlns="http://www.w3.org/2000/svg" className='iconeLabelInpinfo' viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M760-480q0-117-81.5-198.5T480-760v-80q75 0 140.5 28.5t114 77q48.5 48.5 77 114T840-480h-80Zm-160 0q0-50-35-85t-85-35v-80q83 0 141.5 58.5T680-480h-80Zm198 360q-125 0-247-54.5T329-329Q229-429 174.5-551T120-798q0-18 12-30t30-12h162q14 0 25 9.5t13 22.5l26 140q2 16-1 27t-11 19l-97 98q20 37 47.5 71.5T387-386q31 31 65 57.5t72 48.5l94-94q9-9 23.5-13.5T670-390l138 28q14 4 23 14.5t9 23.5v162q0 18-12 30t-30 12ZM241-600l66-66-17-94h-89q5 41 14 81t26 79Zm358 358q39 17 79.5 27t81.5 13v-88l-94-19-67 67ZM241-600Zm358 358Z" /></svg> </div>
                                <div className="LabelInpInfo">
                                    <input onChange={e => setaddressObject(cu => ({ ...cu, houseApparNum: e.target.value }))} type="text" id="House" name='House' placeholder='' />
                                    <label htmlFor="House">House/Apartment Number</label>
                                    <svg xmlns="http://www.w3.org/2000/svg" className='iconeLabelInpinfo' viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M160-120v-375l-72 55-48-64 120-92v-124h80v63l240-183 440 336-48 63-72-54v375H160Zm80-80h200v-160h80v160h200v-356L480-739 240-556v356Zm-80-560q0-50 35-85t85-35q17 0 28.5-11.5T320-920h80q0 50-35 85t-85 35q-17 0-28.5 11.5T240-760h-80Zm80 560h480-480Z" /></svg>  </div>
                                <div className="LabelInpInfo">
                                    <input onChange={e => setaddressObject(cu => ({ ...cu, street: e.target.value }))} type="text" id="Street" name='Street' placeholder='' />
                                    <label htmlFor="Street">Street Name</label>
                                    <svg version="1.1" viewBox="0 0 2048 2048" className='iconeLabelInpinfo' xmlns="http://www.w3.org/2000/svg">
                                        <path transform="translate(663)" d="m0 0h37l3 7 14 12 4 7 1 7v1451l-3 31-4 18-6 16-11 20-10 15-9 11-13 13-18 13-12 7-23 9-19 5-32 3-29 1h-412l-93-1-8-1-9-11-11-11v-34l13-11 9-9 9-2 20-1h118l40 1v-304l-1-7-9-3-27-8-19-8-20-10-16-10-13-10-10-9-8-7-10-10-18-22-12-18-12-21-11-24-8-22-8-28-6-25-1-1v-143l2 2 3-13 15-73 13-57 9-34 14-48 13-38 12-31 13-30 12-26 12-22 16-26 10-14 13-16 6-7 16-14 19-13 16-8 13-4 12-2h23l14 2 15 5 16 8 16 11 13 12 8 8 9 11 13 17 12 19 13 23 9 17 16 36 11 27 13 36 16 52 15 56 9 40 8 40 5 31 7 56 3 37v43l-3 25-7 37-7 25-12 31-8 16-9 16-14 21-9 11-9 10-18 18-14 11-15 10-18 10-22 10-21 7-24 7-1 84-1 227 268-1 21-2 13-4 16-9 12-10 7-10 8-15 3-15 1-14 1-1421 1-35 6-10 6-7 5-5 3-4zm-415 481-10 4-10 8-8 7-9 11-11 15-8 13-15 28-13 28-11 27-11 29-14 43-14 49-10 41-8 35-5 31-7 49-4 41v44l4 31 5 23 6 21 6 15 11 22 11 16 11 13 13 12 15 11 19 12 27 13h1l1-42 1-83 1-13 4-10 6-8 7-7 10-4h19l10 3 9 5 6 5 4 8 3 12 1 18v107l1 8 12-3 19-10 20-12 16-13 5-4 7-8 12-15 13-22 5-10 10-26 5-21 4-25 1-11v-57l-2-28-6-43-8-47-11-50-15-56-13-42-9-27-12-31-12-28-12-25-10-18-12-19-10-13-11-12-9-8-10-6-4-1z" />
                                        <path transform="translate(1065)" d="m0 0h41l-4 3 6 7 8 7 5 6 2 6 1 18v664l1 17 3 17 5 14 7 12 12 12 14 9 12 5 14 3 10 1 59 1 283 1v-88l1-103-18-3-16-5-20-8-23-11-11-7-14-10-14-12-13-13-9-11-12-18-9-17-9-21-6-19-4-19-2-21v-37l3-32 9-47 9-36 11-37 7-21 12-32 11-26 16-33 13-22 10-15 9-12 10-13 9-10 13-13 14-10 14-9 16-9 2-3h69l-3 3 5 4 16 8 16 11 11 9 5 4v2l4 2 6 6v2h2l9 11 12 16 14 22 9 15 8 16 12 26 14 36 12 36 11 37 7 28 9 45 3 21 1 11 1 23v15l-2 28-4 19-8 26-12 25-10 16-8 10-11 13-14 14-14 11-13 9-14 8-21 9-27 9-20 6-1 21-1 168-1 2 212-1h100l68 1 17 1 6 4 6 7 8 7 5 4 1-2v36h-3l-4 2v2l-4 4-7 9-8 3-11 2-192 1h-585l-38-1-26-3-19-5-20-8-15-9-14-11-20-20-10-13-14-24-6-14-5-19-3-24-1-25v-677l7-11 9-10zm516 80-10 4-13 11-8 7-13 16-13 20-6 11-16 32-13 30-11 30-8 24-12 43-6 28-5 32-2 24v20l3 21 6 21 8 16 10 14 6 7h2v2l8 7 9 7 16 10 16 8 9 3h6l1-4 1-43 3-16 4-8 3-3v-2l14-7 10-3h8l12 3 12 7 7 9 5 13 1 4 1 51 7-1 12-4 25-13 12-9 12-11 7-8 7-10 5-10 8-24 3-12 1-8v-34l-4-34-5-28-7-30-8-27-8-25-7-20-12-30-16-34-12-21-8-12-9-12-9-11-4-5-8-7-12-7-7-2z" />
                                        <path transform="translate(1216,1204)" d="m0 0h763l37 1 8 2 11 9 13 13v31l-8 7-11 11-10 4-13 2-811 2-14 2-19 8-10 8-9 9-7 11-6 14-3 10-2 22-2 402-2 25-3 24-4 19-12 36-8 17-11 20-12 17-11 14-8 10h-2l-2 4-14 14-8 7-14 11-14 10-20 12-15 8-23 10-36 12-15 4v2h-6-3-862l1-5-3-7-14-10-2-2v-34l11-9 11-11 3-1 16-1 50-1 731-1 26-1 28-3 20-4 20-6 17-8 22-13 13-10 13-11 12-12 10-13 6-8 9-15 7-14 9-25 4-19 3-32 1-186 1-230 2-20 4-15 8-21 12-22 12-16 9-10 9-9 14-11 14-9 14-7 24-8 11-2 11-1z" />
                                        <path transform="translate(875,1526)" d="m0 0h14l11 4 11 7 8 10 3 8 1 8v125l-2 22-3 16-5 16-8 18-11 18-12 16-14 14-15 11-24 13-17 6-27 6-15 2-17 1h-146l-20-2-9-6-8-9-7-12-1-3v-15l4-11 8-12 7-6 9-4 4-1 167-1 17-2 16-5 14-7 10-8 9-9 8-16 4-14 2-12 1-30v-99l2-11 6-11 7-6 14-8z" />
                                        <path transform="translate(1658 1e3)" d="m0 0h55l15 1 12 3 8 4 9 8 6 10 3 11v13l-4 9-8 11-9 6-9 4-7 1-24 1h-57l-17-2-9-6-9-9-7-14-1-4v-10l5-14 7-9 8-7 10-4 8-2z" />
                                        <path transform="translate(1112 1e3)" d="m0 0h38l21 2 12 4 8 6 7 8 4 8 1 4v20l-4 9-6 8-7 6-8 5-4 1-25 1h-67l-13-2-9-6-8-9-8-16-1-4v-7l3-10 6-10 11-12 7-3 10-2z" />
                                        <path transform="translate(875,683)" d="m0 0h13l11 3 10 6 7 8 5 11 2 8 1 29v45l-1 14-3 11-7 9-4 5-13 9-6 2h-9l-12-3-11-6-7-7-6-12-3-16-1-20v-40l1-19 3-12 5-9 5-5 7-6 9-4z" />
                                        <path transform="translate(312,1766)" d="m0 0h88l12 2 9 4 8 6 7 8 4 10 1 6v10l-3 10-6 9-4 5-9 6-13 4-10 1-47 1h-14l-16-1-13-3-9-6-5-5-6-7-5-10-1-3v-14l4-10 10-13 10-6z" />
                                        <path transform="translate(39,1766)" d="m0 0h80l11 2 14 7 9 8 6 12v19l-5 12-11 12-8 5-11 3-8 1h-77l-12-2-11-6-10-9-6-7v-35l12-11 5-4 8-4 6-2z" />
                                        <path transform="translate(878,963)" d="m0 0 13 1 11 4 10 7 6 9 4 10 1 9 1 39v37l-2 13-4 9-6 9-8 8-10 4-10 1-14-2-10-5-7-6-7-11-3-12-1-7-1-17 1-61 2-11 6-12 8-7 12-7z" />
                                        <path transform="translate(1930 1e3)" d="m0 0h71l16 2 12 5 9 7 7 8 1 1 2-2v36l-8 7-7 7-9 6-8 2-13 1-39 1h-31l-15-1-9-3-8-7-8-9-6-12v-14l4-11 7-11 9-8 8-3z" />
                                        <path transform="translate(874,121)" d="m0 0h17l11 4 8 6 7 9 5 12 1 6 1 27v43l-2 21-4 9-7 9-9 8-8 4-4 1h-12l-13-4-11-8-6-8-4-10-2-12-1-13v-22l1-42 3-14 6-12 7-7 12-6z" />
                                        <path transform="translate(872,1246)" d="m0 0h19l9 2 8 5 8 9 5 11 2 7 1 27v50l-1 14-4 10-8 11-8 7-10 5h-17l-13-4-9-7-7-10-4-14-1-7v-78l4-15 5-9 8-8 9-5z" />
                                        <path transform="translate(1392 1e3)" d="m0 0h35l23 2 13 4 9 6 8 9 4 11v18l-4 10-6 9-6 5-8 4-17 3-27 1h-53l-13-2-9-6-9-10-5-9-2-6v-13l4-13 8-10 11-8 10-3 7-1z" />
                                        <path transform="translate(873,402)" d="m0 0h17l10 3 10 7 7 9 5 12 1 10 1 37v28l-1 16-4 13-7 11-9 8-8 3-6 1h-9l-16-4-9-6-7-9-3-8-3-16-1-25 1-51 2-11 7-14 7-6 10-6z" />
                                        <path transform="translate(892,2045)" d="m0 0h2v3l-3-1z" />
                                        <path transform="translate(1624)" d="m0 0h6v1h-6z" />
                                        <path transform="translate(1,1024)" d="m0 0" />
                                        <path transform="translate(0,2047)" d="m0 0 2 1z" />
                                        <path transform="translate(0,1784)" d="m0 0" />
                                        <path transform="translate(701)" d="m0 0 2 1z" />
                                        <path transform="translate(2,2027)" d="m0 0" />
                                        <path transform="translate(1,2026)" d="m0 0" />
                                        <path transform="translate(1,1825)" d="m0 0" />
                                        <path transform="translate(1,1624)" d="m0 0" />
                                        <path transform="translate(2047,1224)" d="m0 0" />
                                        <path transform="translate(2047,1061)" d="m0 0" />
                                    </svg>
                                </div>
                                <div className="LabelInpInfo">
                                    <input onChange={e => setaddressObject(cu => ({ ...cu, city: e.target.value }))} type="text" id="City" name='City' placeholder='' />
                                    <label htmlFor="City">City</label>
                                    <svg version="1.1" viewBox="0 0 2048 2048" className='iconeLabelInpinfo' xmlns="http://www.w3.org/2000/svg">
                                        <path transform="translate(1238,31)" d="m0 0 9 2 1 2 1 180 28-5 32-7h2v-90l1-17 1-1 60 1 3 2v52l-1 39 78-14 85-18 19-4h10l1 2v87l-1 620h64v-153l1-34 1-3 2-1 60-1-1-62 1-56 1-9h12l44 2 8 2 1 3-1 96-1 24h16l43 2 6 2 1 4-1 184 38 1 22 1 4 2v123l14 1 33 1 13 1 4 2v207l-1 749 62 2 3 1v26l-1 33-2 2-118 1h-1855l-8-1-1-1v-30l1-23 1-8 1-1h109l16-1-1-128-6-4-16-6-17-9-16-12-10-9-14-14-13-17-10-18-8-16-7-19-5-21-3-22v-45l3-24 5-20 9-25 8-16 8-13 8-11 11-13 17-17 18-12 15-8 16-6 19-4 18-2h18l22 4 17 6 16 8 14 11 11 8v-24l-1-13-10-4-12-3-28-11-21-11-12-8-16-13-8-7-16-16-11-14-11-16-9-15-8-15-10-23-7-21-5-20-3-19-2-22v-33l2-24 3-20 5-19 8-24 9-21 13-24 13-19 13-16 9-10 11-11 14-11 14-10 18-10 21-10 16-5 20-4 23-2h14l29 1-1-38v-348h-39l-22-1-2-2v-52l2-8 2-1 146-1h416l8-1 1-1 1-177 3-6 8-3 134-26 27-5 17-4h4l-1-32v-121l2-5 1-1 38-1h21l3 3v64l-1 78 45-8 14-3 5-1v-88l1-105 2-3zm262 198-30 7-70 15-90 18-37 7-200 40-76 15-40 7-26 6-3 1-1 5-1 326 1 975 1 53 36-6 11-1h34l27 3 23 5 20 7 25 13 15 10 13 10 4 2v2l8 7 18 18 6 4h6l17-9 20-4 34-5 2-1v-508l1-238 1-21h41l19-1 2-1v-77l1-49 4-1h186l2-1-1-25-1-90v-115l1-403zm-1077 314-7 1-1 300v105l2 4 16 10 13 10 14 12 15 15 9 11 7 8 5 3 4 1 19 1 28 4 24 5 24 9 10 5h2l1-55h59l4 1v59l-7 2-41 3 1 3 9 6 15 12 8 7 15 15 11 14 8 11 9 15 14 27 7 19 7 24 4 21 2 20v52l-3 30-5 22-8 25-7 17-11 21-15 23-11 15-14 15-14 13-13 10-20 12-17 9-30 11-12 3-9 5-1 2v33l1 20v15l-3 9-7 9-11 13-11 14-13 15-9 10-7 8-12 14-9 10-9 11-8 9-9 11-11 13-9 11-13 15-11 12v2h-2l-7 8-10 11-9 11-7 7-3 7-1 9-2 52v55l16 1h112l2-1v-44l2-18 4-17 5-12 9-19 10-15 7-9 8-10 2-1v-2l4-2 10-9 19-12 21-10 17-5 24-4h32l21 3 21 6 19 9 17 11 14 12 12 11 7 7 7 5 4 2h6l8-9 8-12 13-19 8-12 8-8 5-6 8-7 12-10 8-6 2-4v-156l-1-746v-145l1-137-1-7zm1273 191-1 73v54l1 1h64l-1-125-5-1-35-2zm-319 192-2 1v62l10 1 78 1h341l20-1v-33l-1-28-1-1-36-1-364-1zm-1073 67-18 3-20 7-19 10-12 8-14 12-13 13-11 15-9 15-8 15-7 19-6 21-4 19-2 16-1 15v16l3 26 5 22 7 23 9 19 10 16 10 13 12 13 11 10 19 13 23 13 13 7h4l1-9v-158l1-45 1-8 58 1 4 1v191l1 26 4 1 14-6 17-10 11-7 14-10 6-5v-2l4-2 8-8 12-16 8-13 10-19 7-19 7-27 3-19 1-10v-30l-3-26-5-21-9-25-8-16-9-16-11-16-13-15-11-10-14-10-21-11-18-6-14-3-9-1zm1008 62-1 168v519l1 28 2 7 3 2 7-1 7-4 10-9 14-12 13-11 7-8 1-610 1-4 42-1h399l4 1 1 2v716l2 8 22 14 13 9 14 11 9 7 4 2-1-833-35-1zm-782 32-1 2 5 21 5 32 2 18 1 19v13l-1 22-3 26-5 20-8 25-8 19-12 22-12 18-10 14-11 12v2l-4 2-13 13-10 8-11 8-18 10-8 5-1 4 12 13 14 10 13 8 14 7 16 6 13 3 8 1h24l15-2 16-4 17-7 17-9 17-12 15-14 7-8 13-18 13-24 6-15 7-25 4-19 2-19v-27l-3-25-4-20-11-33-8-16-6-11-9-13-9-11-13-13-14-11-15-9-22-10-25-8zm909 96v385l1 136 9-1 29-5 10-1h29l26 3 17 3h7v-519l-1-1zm195 0-3 2v544l2 8 11 9 14 12 9 9 7 8 14 18 14 24 5 5 13 2 25 2h14v-643zm-1282 280-1 72v195l2 2 11-9 8-9 8-10 6-7v-2h2l9-11 5-6v-2h2l7-8 11-13 12-14 10-11 9-11 11-12 6-9 6-8 3-10 1-12v-29l-1-3-9-5-6-1-25-10-26-12-10-6-14-9-13-10-13-12-5-5-4-3zm-174 42-14 4-17 9-10 9-9 9-10 14-8 16-7 20-4 15-3 22v24l3 19 4 14 6 16 8 16 9 12 9 10 10 9 18 10 11 4 5 1h21l16-4 17-9 13-10 10-10 9-12 7-12 7-19 5-19 2-15v-25l-2-21-4-16-5-15-9-19-9-13-9-10-7-7-15-10-13-5-9-2zm1321 254-21 2-22 5-16 6-19 10-11 8-16 13-9 9-11 14-7 10-8 13-12 22-5 5-8-6-1-2h-2l-2-4-11-11-14-11-14-8-12-5-16-4-18-1-16 2-13 4-17 8-13 9-15 14-9 10-6 5-3-4h-2l-2-4-7-10-10-17-12-17-9-11-12-13-14-11-14-9-16-8-16-6-16-4-15-2h-31l-20 3-21 6-16 7-14 8-14 11-10 9-9 9-12 16-8 13-7 14-10 26-5 15-3 4-7-1-25-9-23-4h-14l-10 2h-7l-10-6-8-11-9-12-9-10-13-10-16-9-15-5-14-2h-21l-14 3-16 7-11 6-10 9-7 7-10 15-9 19-4 13-1 5v23l3 13 5 5 5 1 15 1h1240l24-1 17-2v-3l-9-9-14-10-19-14-16-9-23-9-19-5-16-2h-14l-18 2-21 5-10 4h-5l-5-7-8-20-13-28-12-19-8-10-11-12-10-9-15-10-14-8-20-8-20-5-27-3zm-1213 29-12 6-16 10-19 10-14 7-2 2v122l1 5 13 1h48l2-1 1-158z" />
                                        <path transform="translate(997,1374)" d="m0 0h180l5 2 1 2 1 156v94l-4 3h-187l-2-2-1-32v-71l1-145 1-6zm62 64-4 1v123l1 5h62l1-1 1-118-1-7-1-1-11-1-27-1z" />
                                        <path transform="translate(1116,414)" d="m0 0h64l3 2 1 3v249l-2 3h-124l-60-1-6-2-1-5-1-24v-190l1-29 1-3 3-1zm-60 65-1 2v125l18 1h45l1-1 1-67v-58l-1-1-8-1z" />
                                        <path transform="translate(998,1054)" d="m0 0h178l6 1 1 2v252l-3 2h-181l-7-2-1-1-1-17v-86l1-144 2-6zm61 64-4 2v126l1 1h61l2-1 1-87v-35l-2-4-14-1-29-1z" />
                                        <path transform="translate(1374,414)" d="m0 0h61l4 2v253l-1 1-14 1h-171l-5-2-1-1-1-24v-51l1-156 1-17 1-4 2-1zm-55 64-8 1v127l7 1h56l1-1 1-90v-33l-1-3-6-1-34-1z" />
                                        <path transform="translate(998,734)" d="m0 0h40l143 1 2 2v252l-4 2h-151l-31-1-5-2-1-3-1-21v-75l1-147 2-7zm60 64-3 3v125l7 1h55l3-1v-125l-16-2-28-1z" />
                                        <path transform="translate(533,862)" d="m0 0 9 1 2 3v59l-5 2h-53l-6-2-2-7v-30l1-20 2-4 6-1z" />
                                        <path transform="translate(518,735)" d="m0 0h19l6 2 1 1v60l-4 1h-37l-21-1-3-2-1-5v-37l1-14 1-3 2-1z" />
                                        <path transform="translate(486,607)" d="m0 0 52 1 5 3 1 4v54l-4 2h-19l-36-1-6-2-1-4v-35l1-18 1-3z" />
                                        <path transform="translate(635,863)" d="m0 0h33l3 3 1 3v56l-1 1h-61l-3-2-1-22 1-33 2-5z" />
                                        <path transform="translate(662,735)" d="m0 0 7 1 3 4v57l-1 1h-62l-2-2v-55l2-5z" />
                                        <path transform="translate(744,607)" d="m0 0h48l6 2 1 3v56l-2 2-16 1h-43l-2-2-1-8v-21l1-27 1-5z" />
                                        <path transform="translate(769,735)" d="m0 0h27l3 4v57l-3 2-24 1h-34l-2-2-1-5v-48l2-7 7-1z" />
                                        <path transform="translate(785,990)" d="m0 0h9l4 2 1 2v58l-4 2h-56l-3-2-1-4v-48l2-7 4-1z" />
                                        <path transform="translate(767,863)" d="m0 0h30l2 4v57l-2 2-34 1h-22l-5-2-1-10v-46l1-3 2-1z" />
                                        <path transform="translate(609,608)" d="m0 0h54l6 2 2 1 1 57-2 2h-61l-2-2v-45l1-14z" />
                                    </svg>

                                </div>
                                <div className="LabelInpInfo">
                                    <input onChange={e => setaddressObject(cu => ({ ...cu, zip: e.target.value }))} type="text" id="ZIP" name='ZIP' placeholder='' />
                                    <label htmlFor="ZIP">Postal Code/ZIP Code</label>
                                    <svg version="1.1" viewBox="0 0 2048 2048" className='iconeLabelInpinfo' xmlns="http://www.w3.org/2000/svg">
                                        <path transform="translate(991,9)" d="m0 0h45l22 3 25 6 27 9 23 10 19 11 24 16 17 14 11 9v2l4 2 12 13 13 17 12 18 12 21 8 17 8 21 7 24 4 22 3 29v21l-2 20-5 29-6 22-7 19-11 25-14 26-11 19-14 22-5 8h70l546 1 35 2 24 4 19 6 17 7 16 8 24 16 11 9 12 11 11 12 13 18 14 24 8 17 12 30 2 7h2v1017l-3-1 1-3-2-1-2-5-11 32-8 17-15 24-9 12-9 11-17 17-17 13-16 10-15 8-22 9-22 6-23 4-22 2-18 1-574 2-24 2-21 5-12 5-11 7-14 11-9 9-14 19-14 22-10 17-13 20-22 36-15 24-9 13-9 10-8 5-6 2-12 1-3 1v-2l-9-2-9-6-9-10-7-10-14-22-15-24-13-21-18-30-16-24-13-17-14-14-15-10-16-8-16-5-17-3-15-1-74-1h-503l-29-2-23-3-20-5-18-6-18-8-20-12-12-9-13-11-7-6-7-8-8-8-12-16-8-13-12-23-11-26-5-14-2-2v-348l11-8 13-10 10-5h9l12 5 13 9 8 9 3 10 1 143v117l1 34 3 24 4 17 6 16 7 14 9 12 9 10 7 7 10 8 18 11 15 7 14 4 20 3 10 1 25 1h552l28 1 21 2 22 5 17 6 18 8 17 10 12 8 14 12 8 7 9 9 9 11 9 12 15 23 18 30 11 20 4 4h3l11-18 10-16 8-14 10-15 9-14 11-15 11-13 4-5 8-7 14-11 17-11 25-13 22-8 22-5 18-2 47-1 561-1 21-2 23-6 21-10 15-10 10-9 5-4 7-8 8-11 8-13 7-19 5-22 2-27v-903l-2-29-3-16-7-19-9-16-10-13-8-9-8-7-13-9-19-10-20-6-22-3-47-2h-610l-25 1-4 4-16 27-9 16-6 10-15 24-7 11-9 12-8 10h-2l-2 4-10 9-12 8-18 7-19 5-6 1h-20l-17-4-15-6-9-5-10-8-8-7-7-8-9-11-12-18-13-21-17-28-14-22-9-11h-429l-209 1-23 1-16 2-21 6-16 8-17 12-15 15-10 14-8 14-6 15-4 14-3 24-1 12-1 204-1 67-1 14-3 7-5 6-18 13-8 6-9-3-13-7-14-11-8-7v-341l3 1 3-9 11-28 9-19 12-20 10-13 8-10 9-10 8-7 14-11 15-10 18-10 26-10 23-6 24-3 20-1 71-1h525l-2-5-13-22-8-13-12-22-9-17-11-25-9-27-5-22-3-23-1-14v-29l3-24 6-27 11-32 15-31 12-19 12-17 11-13 7-8 17-17 11-9 12-9 22-14 14-8 22-10 30-10 26-5zm11 82-25 2-22 4-18 6-16 8-14 8-13 10-10 8-12 11v2h-2l-9 11-8 11-9 14-8 15-6 15-6 19-4 17-2 15-1 21 2 24 5 20 8 24 8 16 12 23 8 13 10 17 21 33 11 18 16 26 12 20 10 16 10 17 9 15 12 19 13 21 8 11 9 10 8 5 4 1 11-8 8-8 9-12 10-17 6-10 13-21 15-24 13-22 9-14 17-28 13-20 11-18 13-21 12-21 10-18 10-23 5-16 4-20 2-15v-38l-4-25-4-15-6-16-10-21-11-17-9-11-11-12-15-13-14-10-15-9-15-8-19-7-21-5-15-2-16-1zm1042 1564m-1 2 1 3z" />
                                        <path transform="translate(880,1233)" d="m0 0h33l20 2 21 5 19 8 19 11 11 8 14 12 11 12 11 15 10 17 7 15 8 24 3 18v37l-4 23-5 16-7 17-9 16-10 14-10 11-6 7-22 18-16 9-19 8-20 6-27 4h-32l-24-4-17-5-20-9-15-10-9-7-12-11-8-8-11-14-10-15-12-25-7-23-3-18-1-12v-10l2-19 4-19 6-18 7-16 8-14 13-18 7-8h2l2-4 8-7 12-9 16-10 16-8 15-6 16-4zm6 80-15 3-16 8-9 6-14 14-10 17-6 15-2 8-1 10v17l3 14 7 16 10 15 9 10 15 10 15 7 13 3 8 1h9l16-2 15-5 17-9 10-8 8-8 9-13 6-14 3-15 1-14-1-14-4-15-6-14-7-10-9-10-14-11-14-7-14-4-7-1z" />
                                        <path transform="translate(1185,1235)" d="m0 0h37l35 1 21 2 17 4 15 6 14 8 11 8 10 9 9 11 9 12 9 16 9 22 5 19 3 23v45l-2 17-5 22-6 16-12 23-10 14-9 11-8 7-11 9-14 8-19 7-14 4-19 3-31 2h-42l-21-2-8-4-5-4-6-9-5-12-3-16-1-14v-153l1-65 1-16 5-13 6-8 6-5 10-5 8-2zm39 80-4 2v159l2 5 5 2 11 1 20-2 14-5 13-7 10-10 6-12 5-16 2-9 1-9v-30l-3-17-7-20-6-11-9-10-12-7-8-2-19-2z" />
                                        <path transform="translate(738,783)" d="m0 0h111l27 2 8 3 5 4 7 10 8 14 1 3v11l-4 10-14 23-11 17-13 21-8 12-7 10-13 21-14 21-18 28-15 22-11 15-4 7 25 1 50 1 31 2 9 3 9 8 6 10 4 9 1 10-2 10-6 11-8 9-4 5-7 2-22 1-96 1-65-1-18-2-7-5-11-15-5-11-1-9 3-10 6-12 24-36 11-17 7-11 10-15 18-28 15-23 21-32 10-15 7-14h-68l-23-1-16-3-7-8-6-9-7-16v-7l8-16 6-9 9-7 9-3 13-1z" />
                                        <path transform="translate(543,1233)" d="m0 0h37l20 3 19 5 13 5 16 9 10 8 10 10 6 12v11l-3 12-8 11-13 11-10 7-6-1-45-18-16-4-17-1-16 2-14 5-14 8-10 9-7 7-10 17-5 13-3 14-1 19 3 17 5 14 10 15 11 12 14 10 15 7 12 3 7 1h15l14-3 16-8 17-12 11-8 10-4h11l10 3 10 6 10 10 6 10 1 3v11l-4 10-6 9-8 10-8 9-10 8-16 10-19 8-18 5-22 3h-29l-21-3-19-5-21-9-16-10-13-11-8-7-12-13-12-17-9-15-11-24-6-23-2-15v-29l4-23 6-20 5-12 9-17 7-11 8-10 9-11 13-12 16-11 18-10 20-8 15-4z" />
                                        <path transform="translate(1222,783)" d="m0 0h51l26 3 18 5 17 8 16 12 8 7 11 14 9 14 8 20 3 14 1 11v14l-3 17-6 16-7 14-10 14-10 11-11 9-9 6-15 7-17 5-21 3-35 3-1 1v67l-2 13-6 12-11 11-9 4h-19l-13-4-11-8-7-11-2-11-1-17v-249l5-13 11-12 10-6 8-2zm28 80-4 3-1 4-1 17v27l2 10 4 3 10 2h11l17-4 10-6 7-8 4-8v-10l-4-11-6-8-7-6-7-3-19-2z" />
                                        <path transform="translate(1531,1233)" d="m0 0h52l32 1 11 2 14 7 6 7 5 13 1 5v10l-4 13-6 9-13 9-11 3-8 1-63 2-1 25v17l7 1 53 3 14 2 11 7 7 7 5 13v19l-3 10-6 9-8 6-14 3-29 2-37 1 1 38 1 6 3 1 24 1 41 1 13 2 8 4 8 9 5 12 2 10v7l-4 13-6 8-8 7-10 5-9 1-29 1h-80l-14-2-8-3-11-10-4-9-3-12-1-11v-245l2-13 6-12 5-6 9-6 5-2 6-1z" />
                                        <path transform="translate(1e3 165)" d="m0 0h18l21 3 14 4 17 8 14 10 18 18 12 18 9 20 4 15 1 7v32l-3 16-5 14-8 15-8 11-9 11-10 9-13 9-11 6-12 5-21 5-17 2h-10l-19-2-15-4-19-9-13-9-10-9-7-7-11-15-10-21-5-15-3-15-1-16 2-20 4-15 8-19 12-18 5-6h2l2-4 7-7 10-7 13-8 14-6 15-4zm3 80-12 4-9 6-9 10-3 13v11l3 12 6 9 7 6 10 4 7 2h12l11-4 8-5 5-5 6-9 3-10v-11l-4-12-6-8-9-8-8-4-4-1z" />
                                        <path transform="translate(1020,785)" d="m0 0h20l9 3 12 8 7 8 3 8 1 7 1 65v123l-1 70-1 13-4 10-8 9-11 7-10 2h-9l-12-2-11-7-8-9-4-8-2-8-1-21v-163l1-78 2-11 4-8 8-9 11-8z" />
                                        <path transform="translate(35,1112)" d="m0 0h9l11 4 9 6 10 11 4 7 1 4v15l-4 9-7 10h-2v2l-10 8-13 7h-2v-2l-8-1-16-9-10-9-7-6v-33l11-9 9-8 10-5z" />
                                        <path transform="translate(992)" d="m0 0h44v1l-26 1h-14z" />
                                        <path transform="translate(1035,2042)" d="m0 0" />
                                        <path transform="translate(2,995)" d="m0 0" />
                                    </svg>

                                </div>
                                {haveAnAddress &&
                                    <div className="LabelinpCheck">
                                        <input type="checkbox" id='inpSerAsDDef' onChange={e => setaddressObject(cu => ({ ...cu, isDefault: !cu.isDefault }))} />
                                        <label htmlFor="inpSerAsDDef"> Set As your  default address </label>
                                    </div>
                                }
                                <button disabled={AllDone} className='bl  mt20  p10 br20 w200' onClick={handelSubmitLogin} style={{ alignSelf: "end" }}>Submit<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m700-300-57-56 84-84H120v-80h607l-83-84 57-56 179 180-180 180Z" /></svg></button>

                            </>
                    }
                </div>
            </div>
            , document.getElementById("portlas")
        )
    } else {


        useEffect(() => {
            
            if (window.location.pathname != "/add_address") {
                console.log('deffre');
                navigate('/add_address')
                return;
            }

            MainPagePuRef.current?.scrollIntoView({
                behavior: "smooth", block: "start"
            })
        }, [])
        return (
            <>
                <div ref={MainPagePuRef} style={{ position: "relative", paddingTop: "350px" }} className="wmia c-s-s">
                    {
                        isLoadingAddress ? <div className="loader"></div> :
                            <>
                                <img src="imgs/rb_2148494141-removebg-preview.png" alt="" className="wmia FielsDesSds" />
                                <div className='wmia  bg-l p20 br20 c-p-s' style={{
                                    filter: " drop-shadow(0 0 10px var(--filter-color))"
                                }}>

                                    <h1 className='r-s-c wmia pb20 mb20' style={{ borderBottom: "solid 1px var(--border-color)" }}>
                                        <svg version="1.1" viewBox="0 0 2048 2048" className='mr10' height="128" xmlns="http://www.w3.org/2000/svg">
                                            <path transform="translate(652)" d="m0 0h182l1 1 4-1h49v1l-12 1-1 1h-19-3l-2 2 1 1 41 5 33 6 31 8 30 9 33 10 33 11 24 10 26 13 18 10 26 14 18 10 27 16 15 11 13 10 16 13 14 11 17 14 26 22 16 14v2l3 1 7 8 8 8 9 11 12 14 11 14 11 13 10 13 14 18 13 19 11 18 15 26 16 30 10 19 8 16 9 20 8 21 14 44 16 54 5 22 5 33 7 63 3 36v59l-3 34-5 19-6 11-10 13h-2v2l-12 8-13 4-12 2h-13l-16-4-10-5-12-11-10-11-4-7-3-13-1-10v-18l3-28v-35l-7-68-3-30-4-22-7-27-17-55-12-33-11-24-12-23-12-22-14-25-11-17-12-17-12-15-9-12-12-14-8-10-12-14-6-6v-2l-4-2v-2l-4-2-9-9-11-9-14-12-13-11-20-16-19-14-19-12-21-12-27-15-32-17-23-10-25-9-45-14-35-10-20-4-33-4-52-5-15-1h-37l-45 4-44 5-31 6-31 9-30 9-23 8-22 8-25 12-19 10-12 7-12 6-13 8-11 6-13 8-16 11-15 12-11 9-14 12-10 8-13 11-11 9-18 18-9 11-8 9-8 10-10 13-14 17-13 16-9 14-7 11-6 11-13 24-12 22-13 25-8 20-16 47-15 48-5 24-5 48-7 63v26l4 47 6 41 6 31 9 34 12 36 15 44 11 30 7 20 11 27 12 26 13 27 8 16 9 17 9 19 10 19 12 24 10 18 13 22 8 13 14 23 11 17 11 18 30 48 22 33 12 17 13 18 12 17 10 14 39 54 14 19 13 16 10 13 14 18 11 14 9 11 13 16 11 14 13 16 11 14 13 15 12 14 11 12 7 8 12 14 11 12 9 11 12 13 9 11 10 11 7 8 12 13 8 10 13 14 8 10 5 4h5l8-8 8-10 10-11 9-11 9-10 11-13h2l2-4h2l2-4 11-12 6-5 5-5 8-7 12-7 12-3h23l12 3 12 6 9 7 7 8 7 11 5 13 2 10v13l-2 9-7 14-12 16-9 11-12 14-14 15-7 8-14 15-6 7h-2l-2 4-9 9-7 8-14 15-11 12-14 15-14 13-12 8-7 6v2h-40l-11-7-14-11-10-9-26-26-7-8-15-16-9-10-16-17-6-6v-2h-2l-7-8-12-13-7-8-12-14-10-11-9-11-10-11-7-8-12-14-11-13-13-15-9-11-11-13-7-9-11-13-9-11-12-15-13-17-10-13-15-20-12-15-10-13-16-21-18-24-16-21-13-19-10-14-34-51-29-43-20-30-19-29-15-25-10-17-13-24-12-22-16-30-13-23-15-29-9-16-19-37-14-31-13-30-16-40-16-45-16-53-12-49-9-44v-5l-2-1v-4h-2l-2-8-2 2h-4v-175h2l2-5 8-59 5-28 7-28 13-43 18-56 13-30 12-23 14-25 11-21 8-14 11-19 12-19 22-28 13-16 9-11 12-14 9-11 6-7 9-11 6-7h2l2-4 8-7 7-7 13-10 10-9 11-9 13-11 14-11 16-13 18-13 10-7 17-10 25-14 46-25 23-12 21-9 38-13 55-17 27-7 18-4 24-4 31-4 8-1h-5l-2-2-17-2zm153 1m22 0m4 0m-155 2m24 0v1h7v-1zm125 0m20 0m-155 1v1h9v-1zm143 0m3 0m-830 866 1 2zm-2 4m5 6 1 2z" />
                                            <path transform="translate(1525,1024)" d="m0 0h20l44 3 34 4 26 5 25 7 38 12 25 10 25 12 19 10 21 12 18 11 19 14 16 13 14 11 11 10 11 9 15 15 9 11 9 10 9 11 13 16 12 17 11 17 12 22 12 23 8 16 11 26 14 43 9 31 5 26 6 41h2v141h-2v-4h-2v-2h2l-2-4-1-3-3 4-2 6-8 34-12 38-8 24-11 24-13 26-13 23-9 17-13 17-6 8-10 12-11 14-11 13-9 11-11 11-8 7-11 10-9 7-16 13-11 8-19 14-22 13-32 17-16 8-15 7-28 10-47 15-25 6-22 4-23 3-1 2-6 2h-8l-1-3v3l-3-1-1 1h-71l-4-2h-9v-2l-25-3-31-6-52-15-36-12-21-9-25-13-22-12-20-12-11-8-17-13-13-11-14-11-13-12-8-7-10-10-9-11-10-11-8-10-11-13-10-13-12-17-16-28-15-28-12-25-8-21-14-43-7-26-4-20-4-36-4-44v-16l2-27 6-54 4-20 12-41 8-24 6-17 7-16 11-22 8-14 7-14 12-21 8-12 16-21 11-13 10-13 10-12 7-8 9-10 10-9 14-11 13-11 10-8 18-14 16-11 28-16 34-18 19-9 29-10 28-9 27-7 25-5 36-4 23-2zm-9 129-34 3-28 5-32 8-32 11-18 8-22 12-15 9-11 7-14 10-16 13-14 11-16 15-9 10-9 11-9 10-11 14-10 14-9 16-9 15-8 16-8 18-13 36-5 18-5 27-7 55v23l7 58 6 26 8 26 9 25 12 25 10 19 12 19 8 11 10 13 13 16 9 11 18 18 11 9 13 11 16 12 18 12 21 12 22 12 21 9 37 12 24 6 34 5 34 3h22l57-6 23-5 38-12 22-8 26-13 24-14 16-10 17-13 16-13 11-9 11-11 2-1v-2h2l8-10 10-11 8-10 7-9 11-15 9-16 8-14 14-27 9-25 9-31 5-21 4-30 3-26 1-13-1-28-5-45-4-20-7-27-11-31-10-23-13-25-14-23-14-19-12-14-9-11-4-5h-2l-2-4-16-16-14-11-12-10-18-13-20-12-23-13-17-8-13-6-40-13-25-6-29-4-33-3zm530 342 1 2zm0 4m-7 120 1 2zm-458 425m-17 2 4 1z" />
                                            <path transform="translate(758,384)" d="m0 0h17l30 2 28 3 26 5 27 8 23 8 18 8 22 11 27 16 17 12 17 14 10 8 10 9 8 7 10 10 7 8 11 13 9 12 10 14 12 19 12 22 8 16 9 21 10 31 9 36 4 33 2 20v33l-5 52-6 25-7 24-8 24-12 26-13 25-9 15-8 12-9 12-9 11-14 17-14 15-13 12-14 11-9 8-14 10-17 11-16 9-18 10-25 11-30 10-33 9-23 4-39 4h-44l-40-4-24-5-27-8-32-11-21-10-22-12-21-13-18-13-14-12-11-9-6-5-16-16-7-8-9-10-11-14-13-17-12-19-10-18-11-21-11-28-8-24-7-27-4-26-4-40v-27l6-53 5-23 11-36 11-28 11-22 11-20 12-19 8-11 13-16 11-14 15-16 11-11 11-9 16-13 16-12 15-10 23-13 23-12 26-10 30-9 26-6 33-4zm-14 129-24 3-25 6-21 7-20 9-14 8-15 10-14 10-14 12-12 11-1 3-4 2-9 11-11 14-12 19-6 11-12 25-6 18-5 19-4 21-3 27v20l3 26 5 25 8 26 8 18 10 20 12 19 13 16 8 10 18 18 11 9 18 13 13 8 24 13 25 10 23 6 16 3 26 3h26l27-3 22-4 24-7 22-9 24-13 15-10 12-9 14-11 12-11 14-16 12-16 9-14 9-16 9-19 7-21 5-20 4-23 2-17v-23l-2-24-4-25-4-15-10-29-12-24-11-18-10-14-14-17-15-15-11-9-16-12-21-13-21-11-20-8-20-6-25-5-20-2z" />
                                            <path transform="translate(1527,1280)" d="m0 0h10l15 2 14 5 11 8 7 7 7 10 5 11 2 8 1 10v130h120l20 2 11 3 12 6 12 11 7 8 6 10 3 9 1 5v19l-4 14-7 12-11 14-9 7-9 4-12 2-10 1-28 1h-101v107l-1 26-2 13-8 16-10 13-8 7-12 6-14 3h-20l-12-3-12-6-10-9-7-8-8-14-3-7-2-12-1-17-1-115h-130l-15-3-12-5-9-7-8-8-9-14-5-12-2-10v-8l3-15 8-16 11-13 14-10 8-4 13-2 13-1 116-1 3-1 1-6 1-104 1-23 3-13 5-9 9-12 6-7 13-9 8-4z" />
                                            <path transform="translate(1625,2045)" d="m0 0 4 1v2h-26v-1z" />
                                            <path transform="translate(1443,2045)" d="m0 0h8l5 2v1h-14z" />
                                            <path transform="translate(2047,1441)" d="m0 0h1v12h-1v-5h-2v-4h2z" />
                                            <path transform="translate(1588,2046)" d="m0 0h3v2l-3-1z" />
                                            <path transform="translate(2047,1456)" d="m0 0 1 4-2-1z" />
                                            <path transform="translate(1597,2046)" d="m0 0 2 2-3-1z" />
                                            <path transform="translate(1593,2046)" d="m0 0 2 2h-2z" />
                                            <path transform="translate(1584,2047)" d="m0 0 3 1z" />
                                            <path transform="translate(2041,1628)" d="m0 0 1 2-2-1z" />
                                            <path transform="translate(746,2047)" d="m0 0 2 1z" />
                                            <path transform="translate(790,2046)" d="m0 0 2 1z" />
                                            <path transform="translate(2047,1462)" d="m0 0" />
                                            <path transform="translate(1495,2047)" d="m0 0" />
                                            <path transform="translate(2047,1636)" d="m0 0" />
                                            <path transform="translate(2046,1635)" d="m0 0" />
                                            <path transform="translate(2041,1625)" d="m0 0" />
                                            <path transform="translate(2045,1486)" d="m0 0" />
                                            <path transform="translate(2045,1462)" d="m0 0" />
                                            <path transform="translate(5,879)" d="m0 0" />
                                        </svg>Add a new  address
                                    </h1>
                                    <div className="LabelInpInfo mt20">
                                        <input onChange={e => setaddressObject(cu => ({ ...cu, phone: e.target.value }))} type="text" id="phone" name='phone' placeholder='' />
                                        <label htmlFor="phone">Phone number</label>
                                        <svg xmlns="http://www.w3.org/2000/svg" className='iconeLabelInpinfo' viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M760-480q0-117-81.5-198.5T480-760v-80q75 0 140.5 28.5t114 77q48.5 48.5 77 114T840-480h-80Zm-160 0q0-50-35-85t-85-35v-80q83 0 141.5 58.5T680-480h-80Zm198 360q-125 0-247-54.5T329-329Q229-429 174.5-551T120-798q0-18 12-30t30-12h162q14 0 25 9.5t13 22.5l26 140q2 16-1 27t-11 19l-97 98q20 37 47.5 71.5T387-386q31 31 65 57.5t72 48.5l94-94q9-9 23.5-13.5T670-390l138 28q14 4 23 14.5t9 23.5v162q0 18-12 30t-30 12ZM241-600l66-66-17-94h-89q5 41 14 81t26 79Zm358 358q39 17 79.5 27t81.5 13v-88l-94-19-67 67ZM241-600Zm358 358Z" /></svg> </div>
                                    <div className="LabelInpInfo mt20">
                                        <input onChange={e => setaddressObject(cu => ({ ...cu, houseApparNum: e.target.value }))} type="text" id="House" name='House' placeholder='' />
                                        <label htmlFor="House">House/Apartment Number</label>
                                        <svg xmlns="http://www.w3.org/2000/svg" className='iconeLabelInpinfo' viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M160-120v-375l-72 55-48-64 120-92v-124h80v63l240-183 440 336-48 63-72-54v375H160Zm80-80h200v-160h80v160h200v-356L480-739 240-556v356Zm-80-560q0-50 35-85t85-35q17 0 28.5-11.5T320-920h80q0 50-35 85t-85 35q-17 0-28.5 11.5T240-760h-80Zm80 560h480-480Z" /></svg>  </div>
                                    <div className="LabelInpInfo mt20">
                                        <input onChange={e => setaddressObject(cu => ({ ...cu, street: e.target.value }))} type="text" id="Street" name='Street' placeholder='' />
                                        <label htmlFor="Street">Street Name</label>
                                        <svg version="1.1" viewBox="0 0 2048 2048" className='iconeLabelInpinfo' xmlns="http://www.w3.org/2000/svg">
                                            <path transform="translate(663)" d="m0 0h37l3 7 14 12 4 7 1 7v1451l-3 31-4 18-6 16-11 20-10 15-9 11-13 13-18 13-12 7-23 9-19 5-32 3-29 1h-412l-93-1-8-1-9-11-11-11v-34l13-11 9-9 9-2 20-1h118l40 1v-304l-1-7-9-3-27-8-19-8-20-10-16-10-13-10-10-9-8-7-10-10-18-22-12-18-12-21-11-24-8-22-8-28-6-25-1-1v-143l2 2 3-13 15-73 13-57 9-34 14-48 13-38 12-31 13-30 12-26 12-22 16-26 10-14 13-16 6-7 16-14 19-13 16-8 13-4 12-2h23l14 2 15 5 16 8 16 11 13 12 8 8 9 11 13 17 12 19 13 23 9 17 16 36 11 27 13 36 16 52 15 56 9 40 8 40 5 31 7 56 3 37v43l-3 25-7 37-7 25-12 31-8 16-9 16-14 21-9 11-9 10-18 18-14 11-15 10-18 10-22 10-21 7-24 7-1 84-1 227 268-1 21-2 13-4 16-9 12-10 7-10 8-15 3-15 1-14 1-1421 1-35 6-10 6-7 5-5 3-4zm-415 481-10 4-10 8-8 7-9 11-11 15-8 13-15 28-13 28-11 27-11 29-14 43-14 49-10 41-8 35-5 31-7 49-4 41v44l4 31 5 23 6 21 6 15 11 22 11 16 11 13 13 12 15 11 19 12 27 13h1l1-42 1-83 1-13 4-10 6-8 7-7 10-4h19l10 3 9 5 6 5 4 8 3 12 1 18v107l1 8 12-3 19-10 20-12 16-13 5-4 7-8 12-15 13-22 5-10 10-26 5-21 4-25 1-11v-57l-2-28-6-43-8-47-11-50-15-56-13-42-9-27-12-31-12-28-12-25-10-18-12-19-10-13-11-12-9-8-10-6-4-1z" />
                                            <path transform="translate(1065)" d="m0 0h41l-4 3 6 7 8 7 5 6 2 6 1 18v664l1 17 3 17 5 14 7 12 12 12 14 9 12 5 14 3 10 1 59 1 283 1v-88l1-103-18-3-16-5-20-8-23-11-11-7-14-10-14-12-13-13-9-11-12-18-9-17-9-21-6-19-4-19-2-21v-37l3-32 9-47 9-36 11-37 7-21 12-32 11-26 16-33 13-22 10-15 9-12 10-13 9-10 13-13 14-10 14-9 16-9 2-3h69l-3 3 5 4 16 8 16 11 11 9 5 4v2l4 2 6 6v2h2l9 11 12 16 14 22 9 15 8 16 12 26 14 36 12 36 11 37 7 28 9 45 3 21 1 11 1 23v15l-2 28-4 19-8 26-12 25-10 16-8 10-11 13-14 14-14 11-13 9-14 8-21 9-27 9-20 6-1 21-1 168-1 2 212-1h100l68 1 17 1 6 4 6 7 8 7 5 4 1-2v36h-3l-4 2v2l-4 4-7 9-8 3-11 2-192 1h-585l-38-1-26-3-19-5-20-8-15-9-14-11-20-20-10-13-14-24-6-14-5-19-3-24-1-25v-677l7-11 9-10zm516 80-10 4-13 11-8 7-13 16-13 20-6 11-16 32-13 30-11 30-8 24-12 43-6 28-5 32-2 24v20l3 21 6 21 8 16 10 14 6 7h2v2l8 7 9 7 16 10 16 8 9 3h6l1-4 1-43 3-16 4-8 3-3v-2l14-7 10-3h8l12 3 12 7 7 9 5 13 1 4 1 51 7-1 12-4 25-13 12-9 12-11 7-8 7-10 5-10 8-24 3-12 1-8v-34l-4-34-5-28-7-30-8-27-8-25-7-20-12-30-16-34-12-21-8-12-9-12-9-11-4-5-8-7-12-7-7-2z" />
                                            <path transform="translate(1216,1204)" d="m0 0h763l37 1 8 2 11 9 13 13v31l-8 7-11 11-10 4-13 2-811 2-14 2-19 8-10 8-9 9-7 11-6 14-3 10-2 22-2 402-2 25-3 24-4 19-12 36-8 17-11 20-12 17-11 14-8 10h-2l-2 4-14 14-8 7-14 11-14 10-20 12-15 8-23 10-36 12-15 4v2h-6-3-862l1-5-3-7-14-10-2-2v-34l11-9 11-11 3-1 16-1 50-1 731-1 26-1 28-3 20-4 20-6 17-8 22-13 13-10 13-11 12-12 10-13 6-8 9-15 7-14 9-25 4-19 3-32 1-186 1-230 2-20 4-15 8-21 12-22 12-16 9-10 9-9 14-11 14-9 14-7 24-8 11-2 11-1z" />
                                            <path transform="translate(875,1526)" d="m0 0h14l11 4 11 7 8 10 3 8 1 8v125l-2 22-3 16-5 16-8 18-11 18-12 16-14 14-15 11-24 13-17 6-27 6-15 2-17 1h-146l-20-2-9-6-8-9-7-12-1-3v-15l4-11 8-12 7-6 9-4 4-1 167-1 17-2 16-5 14-7 10-8 9-9 8-16 4-14 2-12 1-30v-99l2-11 6-11 7-6 14-8z" />
                                            <path transform="translate(1658 1e3)" d="m0 0h55l15 1 12 3 8 4 9 8 6 10 3 11v13l-4 9-8 11-9 6-9 4-7 1-24 1h-57l-17-2-9-6-9-9-7-14-1-4v-10l5-14 7-9 8-7 10-4 8-2z" />
                                            <path transform="translate(1112 1e3)" d="m0 0h38l21 2 12 4 8 6 7 8 4 8 1 4v20l-4 9-6 8-7 6-8 5-4 1-25 1h-67l-13-2-9-6-8-9-8-16-1-4v-7l3-10 6-10 11-12 7-3 10-2z" />
                                            <path transform="translate(875,683)" d="m0 0h13l11 3 10 6 7 8 5 11 2 8 1 29v45l-1 14-3 11-7 9-4 5-13 9-6 2h-9l-12-3-11-6-7-7-6-12-3-16-1-20v-40l1-19 3-12 5-9 5-5 7-6 9-4z" />
                                            <path transform="translate(312,1766)" d="m0 0h88l12 2 9 4 8 6 7 8 4 10 1 6v10l-3 10-6 9-4 5-9 6-13 4-10 1-47 1h-14l-16-1-13-3-9-6-5-5-6-7-5-10-1-3v-14l4-10 10-13 10-6z" />
                                            <path transform="translate(39,1766)" d="m0 0h80l11 2 14 7 9 8 6 12v19l-5 12-11 12-8 5-11 3-8 1h-77l-12-2-11-6-10-9-6-7v-35l12-11 5-4 8-4 6-2z" />
                                            <path transform="translate(878,963)" d="m0 0 13 1 11 4 10 7 6 9 4 10 1 9 1 39v37l-2 13-4 9-6 9-8 8-10 4-10 1-14-2-10-5-7-6-7-11-3-12-1-7-1-17 1-61 2-11 6-12 8-7 12-7z" />
                                            <path transform="translate(1930 1e3)" d="m0 0h71l16 2 12 5 9 7 7 8 1 1 2-2v36l-8 7-7 7-9 6-8 2-13 1-39 1h-31l-15-1-9-3-8-7-8-9-6-12v-14l4-11 7-11 9-8 8-3z" />
                                            <path transform="translate(874,121)" d="m0 0h17l11 4 8 6 7 9 5 12 1 6 1 27v43l-2 21-4 9-7 9-9 8-8 4-4 1h-12l-13-4-11-8-6-8-4-10-2-12-1-13v-22l1-42 3-14 6-12 7-7 12-6z" />
                                            <path transform="translate(872,1246)" d="m0 0h19l9 2 8 5 8 9 5 11 2 7 1 27v50l-1 14-4 10-8 11-8 7-10 5h-17l-13-4-9-7-7-10-4-14-1-7v-78l4-15 5-9 8-8 9-5z" />
                                            <path transform="translate(1392 1e3)" d="m0 0h35l23 2 13 4 9 6 8 9 4 11v18l-4 10-6 9-6 5-8 4-17 3-27 1h-53l-13-2-9-6-9-10-5-9-2-6v-13l4-13 8-10 11-8 10-3 7-1z" />
                                            <path transform="translate(873,402)" d="m0 0h17l10 3 10 7 7 9 5 12 1 10 1 37v28l-1 16-4 13-7 11-9 8-8 3-6 1h-9l-16-4-9-6-7-9-3-8-3-16-1-25 1-51 2-11 7-14 7-6 10-6z" />
                                            <path transform="translate(892,2045)" d="m0 0h2v3l-3-1z" />
                                            <path transform="translate(1624)" d="m0 0h6v1h-6z" />
                                            <path transform="translate(1,1024)" d="m0 0" />
                                            <path transform="translate(0,2047)" d="m0 0 2 1z" />
                                            <path transform="translate(0,1784)" d="m0 0" />
                                            <path transform="translate(701)" d="m0 0 2 1z" />
                                            <path transform="translate(2,2027)" d="m0 0" />
                                            <path transform="translate(1,2026)" d="m0 0" />
                                            <path transform="translate(1,1825)" d="m0 0" />
                                            <path transform="translate(1,1624)" d="m0 0" />
                                            <path transform="translate(2047,1224)" d="m0 0" />
                                            <path transform="translate(2047,1061)" d="m0 0" />
                                        </svg>
                                    </div>
                                    <div className="LabelInpInfo mt20">
                                        <input onChange={e => setaddressObject(cu => ({ ...cu, city: e.target.value }))} type="text" id="City" name='City' placeholder='' />
                                        <label htmlFor="City">City</label>
                                        <svg version="1.1" viewBox="0 0 2048 2048" className='iconeLabelInpinfo' xmlns="http://www.w3.org/2000/svg">
                                            <path transform="translate(1238,31)" d="m0 0 9 2 1 2 1 180 28-5 32-7h2v-90l1-17 1-1 60 1 3 2v52l-1 39 78-14 85-18 19-4h10l1 2v87l-1 620h64v-153l1-34 1-3 2-1 60-1-1-62 1-56 1-9h12l44 2 8 2 1 3-1 96-1 24h16l43 2 6 2 1 4-1 184 38 1 22 1 4 2v123l14 1 33 1 13 1 4 2v207l-1 749 62 2 3 1v26l-1 33-2 2-118 1h-1855l-8-1-1-1v-30l1-23 1-8 1-1h109l16-1-1-128-6-4-16-6-17-9-16-12-10-9-14-14-13-17-10-18-8-16-7-19-5-21-3-22v-45l3-24 5-20 9-25 8-16 8-13 8-11 11-13 17-17 18-12 15-8 16-6 19-4 18-2h18l22 4 17 6 16 8 14 11 11 8v-24l-1-13-10-4-12-3-28-11-21-11-12-8-16-13-8-7-16-16-11-14-11-16-9-15-8-15-10-23-7-21-5-20-3-19-2-22v-33l2-24 3-20 5-19 8-24 9-21 13-24 13-19 13-16 9-10 11-11 14-11 14-10 18-10 21-10 16-5 20-4 23-2h14l29 1-1-38v-348h-39l-22-1-2-2v-52l2-8 2-1 146-1h416l8-1 1-1 1-177 3-6 8-3 134-26 27-5 17-4h4l-1-32v-121l2-5 1-1 38-1h21l3 3v64l-1 78 45-8 14-3 5-1v-88l1-105 2-3zm262 198-30 7-70 15-90 18-37 7-200 40-76 15-40 7-26 6-3 1-1 5-1 326 1 975 1 53 36-6 11-1h34l27 3 23 5 20 7 25 13 15 10 13 10 4 2v2l8 7 18 18 6 4h6l17-9 20-4 34-5 2-1v-508l1-238 1-21h41l19-1 2-1v-77l1-49 4-1h186l2-1-1-25-1-90v-115l1-403zm-1077 314-7 1-1 300v105l2 4 16 10 13 10 14 12 15 15 9 11 7 8 5 3 4 1 19 1 28 4 24 5 24 9 10 5h2l1-55h59l4 1v59l-7 2-41 3 1 3 9 6 15 12 8 7 15 15 11 14 8 11 9 15 14 27 7 19 7 24 4 21 2 20v52l-3 30-5 22-8 25-7 17-11 21-15 23-11 15-14 15-14 13-13 10-20 12-17 9-30 11-12 3-9 5-1 2v33l1 20v15l-3 9-7 9-11 13-11 14-13 15-9 10-7 8-12 14-9 10-9 11-8 9-9 11-11 13-9 11-13 15-11 12v2h-2l-7 8-10 11-9 11-7 7-3 7-1 9-2 52v55l16 1h112l2-1v-44l2-18 4-17 5-12 9-19 10-15 7-9 8-10 2-1v-2l4-2 10-9 19-12 21-10 17-5 24-4h32l21 3 21 6 19 9 17 11 14 12 12 11 7 7 7 5 4 2h6l8-9 8-12 13-19 8-12 8-8 5-6 8-7 12-10 8-6 2-4v-156l-1-746v-145l1-137-1-7zm1273 191-1 73v54l1 1h64l-1-125-5-1-35-2zm-319 192-2 1v62l10 1 78 1h341l20-1v-33l-1-28-1-1-36-1-364-1zm-1073 67-18 3-20 7-19 10-12 8-14 12-13 13-11 15-9 15-8 15-7 19-6 21-4 19-2 16-1 15v16l3 26 5 22 7 23 9 19 10 16 10 13 12 13 11 10 19 13 23 13 13 7h4l1-9v-158l1-45 1-8 58 1 4 1v191l1 26 4 1 14-6 17-10 11-7 14-10 6-5v-2l4-2 8-8 12-16 8-13 10-19 7-19 7-27 3-19 1-10v-30l-3-26-5-21-9-25-8-16-9-16-11-16-13-15-11-10-14-10-21-11-18-6-14-3-9-1zm1008 62-1 168v519l1 28 2 7 3 2 7-1 7-4 10-9 14-12 13-11 7-8 1-610 1-4 42-1h399l4 1 1 2v716l2 8 22 14 13 9 14 11 9 7 4 2-1-833-35-1zm-782 32-1 2 5 21 5 32 2 18 1 19v13l-1 22-3 26-5 20-8 25-8 19-12 22-12 18-10 14-11 12v2l-4 2-13 13-10 8-11 8-18 10-8 5-1 4 12 13 14 10 13 8 14 7 16 6 13 3 8 1h24l15-2 16-4 17-7 17-9 17-12 15-14 7-8 13-18 13-24 6-15 7-25 4-19 2-19v-27l-3-25-4-20-11-33-8-16-6-11-9-13-9-11-13-13-14-11-15-9-22-10-25-8zm909 96v385l1 136 9-1 29-5 10-1h29l26 3 17 3h7v-519l-1-1zm195 0-3 2v544l2 8 11 9 14 12 9 9 7 8 14 18 14 24 5 5 13 2 25 2h14v-643zm-1282 280-1 72v195l2 2 11-9 8-9 8-10 6-7v-2h2l9-11 5-6v-2h2l7-8 11-13 12-14 10-11 9-11 11-12 6-9 6-8 3-10 1-12v-29l-1-3-9-5-6-1-25-10-26-12-10-6-14-9-13-10-13-12-5-5-4-3zm-174 42-14 4-17 9-10 9-9 9-10 14-8 16-7 20-4 15-3 22v24l3 19 4 14 6 16 8 16 9 12 9 10 10 9 18 10 11 4 5 1h21l16-4 17-9 13-10 10-10 9-12 7-12 7-19 5-19 2-15v-25l-2-21-4-16-5-15-9-19-9-13-9-10-7-7-15-10-13-5-9-2zm1321 254-21 2-22 5-16 6-19 10-11 8-16 13-9 9-11 14-7 10-8 13-12 22-5 5-8-6-1-2h-2l-2-4-11-11-14-11-14-8-12-5-16-4-18-1-16 2-13 4-17 8-13 9-15 14-9 10-6 5-3-4h-2l-2-4-7-10-10-17-12-17-9-11-12-13-14-11-14-9-16-8-16-6-16-4-15-2h-31l-20 3-21 6-16 7-14 8-14 11-10 9-9 9-12 16-8 13-7 14-10 26-5 15-3 4-7-1-25-9-23-4h-14l-10 2h-7l-10-6-8-11-9-12-9-10-13-10-16-9-15-5-14-2h-21l-14 3-16 7-11 6-10 9-7 7-10 15-9 19-4 13-1 5v23l3 13 5 5 5 1 15 1h1240l24-1 17-2v-3l-9-9-14-10-19-14-16-9-23-9-19-5-16-2h-14l-18 2-21 5-10 4h-5l-5-7-8-20-13-28-12-19-8-10-11-12-10-9-15-10-14-8-20-8-20-5-27-3zm-1213 29-12 6-16 10-19 10-14 7-2 2v122l1 5 13 1h48l2-1 1-158z" />
                                            <path transform="translate(997,1374)" d="m0 0h180l5 2 1 2 1 156v94l-4 3h-187l-2-2-1-32v-71l1-145 1-6zm62 64-4 1v123l1 5h62l1-1 1-118-1-7-1-1-11-1-27-1z" />
                                            <path transform="translate(1116,414)" d="m0 0h64l3 2 1 3v249l-2 3h-124l-60-1-6-2-1-5-1-24v-190l1-29 1-3 3-1zm-60 65-1 2v125l18 1h45l1-1 1-67v-58l-1-1-8-1z" />
                                            <path transform="translate(998,1054)" d="m0 0h178l6 1 1 2v252l-3 2h-181l-7-2-1-1-1-17v-86l1-144 2-6zm61 64-4 2v126l1 1h61l2-1 1-87v-35l-2-4-14-1-29-1z" />
                                            <path transform="translate(1374,414)" d="m0 0h61l4 2v253l-1 1-14 1h-171l-5-2-1-1-1-24v-51l1-156 1-17 1-4 2-1zm-55 64-8 1v127l7 1h56l1-1 1-90v-33l-1-3-6-1-34-1z" />
                                            <path transform="translate(998,734)" d="m0 0h40l143 1 2 2v252l-4 2h-151l-31-1-5-2-1-3-1-21v-75l1-147 2-7zm60 64-3 3v125l7 1h55l3-1v-125l-16-2-28-1z" />
                                            <path transform="translate(533,862)" d="m0 0 9 1 2 3v59l-5 2h-53l-6-2-2-7v-30l1-20 2-4 6-1z" />
                                            <path transform="translate(518,735)" d="m0 0h19l6 2 1 1v60l-4 1h-37l-21-1-3-2-1-5v-37l1-14 1-3 2-1z" />
                                            <path transform="translate(486,607)" d="m0 0 52 1 5 3 1 4v54l-4 2h-19l-36-1-6-2-1-4v-35l1-18 1-3z" />
                                            <path transform="translate(635,863)" d="m0 0h33l3 3 1 3v56l-1 1h-61l-3-2-1-22 1-33 2-5z" />
                                            <path transform="translate(662,735)" d="m0 0 7 1 3 4v57l-1 1h-62l-2-2v-55l2-5z" />
                                            <path transform="translate(744,607)" d="m0 0h48l6 2 1 3v56l-2 2-16 1h-43l-2-2-1-8v-21l1-27 1-5z" />
                                            <path transform="translate(769,735)" d="m0 0h27l3 4v57l-3 2-24 1h-34l-2-2-1-5v-48l2-7 7-1z" />
                                            <path transform="translate(785,990)" d="m0 0h9l4 2 1 2v58l-4 2h-56l-3-2-1-4v-48l2-7 4-1z" />
                                            <path transform="translate(767,863)" d="m0 0h30l2 4v57l-2 2-34 1h-22l-5-2-1-10v-46l1-3 2-1z" />
                                            <path transform="translate(609,608)" d="m0 0h54l6 2 2 1 1 57-2 2h-61l-2-2v-45l1-14z" />
                                        </svg>

                                    </div>
                                    <div className="LabelInpInfo mt20">
                                        <input onChange={e => setaddressObject(cu => ({ ...cu, zip: e.target.value }))} type="text" id="ZIP" name='ZIP' placeholder='' />
                                        <label htmlFor="ZIP">Postal Code/ZIP Code</label>
                                        <svg version="1.1" viewBox="0 0 2048 2048" className='iconeLabelInpinfo' xmlns="http://www.w3.org/2000/svg">
                                            <path transform="translate(991,9)" d="m0 0h45l22 3 25 6 27 9 23 10 19 11 24 16 17 14 11 9v2l4 2 12 13 13 17 12 18 12 21 8 17 8 21 7 24 4 22 3 29v21l-2 20-5 29-6 22-7 19-11 25-14 26-11 19-14 22-5 8h70l546 1 35 2 24 4 19 6 17 7 16 8 24 16 11 9 12 11 11 12 13 18 14 24 8 17 12 30 2 7h2v1017l-3-1 1-3-2-1-2-5-11 32-8 17-15 24-9 12-9 11-17 17-17 13-16 10-15 8-22 9-22 6-23 4-22 2-18 1-574 2-24 2-21 5-12 5-11 7-14 11-9 9-14 19-14 22-10 17-13 20-22 36-15 24-9 13-9 10-8 5-6 2-12 1-3 1v-2l-9-2-9-6-9-10-7-10-14-22-15-24-13-21-18-30-16-24-13-17-14-14-15-10-16-8-16-5-17-3-15-1-74-1h-503l-29-2-23-3-20-5-18-6-18-8-20-12-12-9-13-11-7-6-7-8-8-8-12-16-8-13-12-23-11-26-5-14-2-2v-348l11-8 13-10 10-5h9l12 5 13 9 8 9 3 10 1 143v117l1 34 3 24 4 17 6 16 7 14 9 12 9 10 7 7 10 8 18 11 15 7 14 4 20 3 10 1 25 1h552l28 1 21 2 22 5 17 6 18 8 17 10 12 8 14 12 8 7 9 9 9 11 9 12 15 23 18 30 11 20 4 4h3l11-18 10-16 8-14 10-15 9-14 11-15 11-13 4-5 8-7 14-11 17-11 25-13 22-8 22-5 18-2 47-1 561-1 21-2 23-6 21-10 15-10 10-9 5-4 7-8 8-11 8-13 7-19 5-22 2-27v-903l-2-29-3-16-7-19-9-16-10-13-8-9-8-7-13-9-19-10-20-6-22-3-47-2h-610l-25 1-4 4-16 27-9 16-6 10-15 24-7 11-9 12-8 10h-2l-2 4-10 9-12 8-18 7-19 5-6 1h-20l-17-4-15-6-9-5-10-8-8-7-7-8-9-11-12-18-13-21-17-28-14-22-9-11h-429l-209 1-23 1-16 2-21 6-16 8-17 12-15 15-10 14-8 14-6 15-4 14-3 24-1 12-1 204-1 67-1 14-3 7-5 6-18 13-8 6-9-3-13-7-14-11-8-7v-341l3 1 3-9 11-28 9-19 12-20 10-13 8-10 9-10 8-7 14-11 15-10 18-10 26-10 23-6 24-3 20-1 71-1h525l-2-5-13-22-8-13-12-22-9-17-11-25-9-27-5-22-3-23-1-14v-29l3-24 6-27 11-32 15-31 12-19 12-17 11-13 7-8 17-17 11-9 12-9 22-14 14-8 22-10 30-10 26-5zm11 82-25 2-22 4-18 6-16 8-14 8-13 10-10 8-12 11v2h-2l-9 11-8 11-9 14-8 15-6 15-6 19-4 17-2 15-1 21 2 24 5 20 8 24 8 16 12 23 8 13 10 17 21 33 11 18 16 26 12 20 10 16 10 17 9 15 12 19 13 21 8 11 9 10 8 5 4 1 11-8 8-8 9-12 10-17 6-10 13-21 15-24 13-22 9-14 17-28 13-20 11-18 13-21 12-21 10-18 10-23 5-16 4-20 2-15v-38l-4-25-4-15-6-16-10-21-11-17-9-11-11-12-15-13-14-10-15-9-15-8-19-7-21-5-15-2-16-1zm1042 1564m-1 2 1 3z" />
                                            <path transform="translate(880,1233)" d="m0 0h33l20 2 21 5 19 8 19 11 11 8 14 12 11 12 11 15 10 17 7 15 8 24 3 18v37l-4 23-5 16-7 17-9 16-10 14-10 11-6 7-22 18-16 9-19 8-20 6-27 4h-32l-24-4-17-5-20-9-15-10-9-7-12-11-8-8-11-14-10-15-12-25-7-23-3-18-1-12v-10l2-19 4-19 6-18 7-16 8-14 13-18 7-8h2l2-4 8-7 12-9 16-10 16-8 15-6 16-4zm6 80-15 3-16 8-9 6-14 14-10 17-6 15-2 8-1 10v17l3 14 7 16 10 15 9 10 15 10 15 7 13 3 8 1h9l16-2 15-5 17-9 10-8 8-8 9-13 6-14 3-15 1-14-1-14-4-15-6-14-7-10-9-10-14-11-14-7-14-4-7-1z" />
                                            <path transform="translate(1185,1235)" d="m0 0h37l35 1 21 2 17 4 15 6 14 8 11 8 10 9 9 11 9 12 9 16 9 22 5 19 3 23v45l-2 17-5 22-6 16-12 23-10 14-9 11-8 7-11 9-14 8-19 7-14 4-19 3-31 2h-42l-21-2-8-4-5-4-6-9-5-12-3-16-1-14v-153l1-65 1-16 5-13 6-8 6-5 10-5 8-2zm39 80-4 2v159l2 5 5 2 11 1 20-2 14-5 13-7 10-10 6-12 5-16 2-9 1-9v-30l-3-17-7-20-6-11-9-10-12-7-8-2-19-2z" />
                                            <path transform="translate(738,783)" d="m0 0h111l27 2 8 3 5 4 7 10 8 14 1 3v11l-4 10-14 23-11 17-13 21-8 12-7 10-13 21-14 21-18 28-15 22-11 15-4 7 25 1 50 1 31 2 9 3 9 8 6 10 4 9 1 10-2 10-6 11-8 9-4 5-7 2-22 1-96 1-65-1-18-2-7-5-11-15-5-11-1-9 3-10 6-12 24-36 11-17 7-11 10-15 18-28 15-23 21-32 10-15 7-14h-68l-23-1-16-3-7-8-6-9-7-16v-7l8-16 6-9 9-7 9-3 13-1z" />
                                            <path transform="translate(543,1233)" d="m0 0h37l20 3 19 5 13 5 16 9 10 8 10 10 6 12v11l-3 12-8 11-13 11-10 7-6-1-45-18-16-4-17-1-16 2-14 5-14 8-10 9-7 7-10 17-5 13-3 14-1 19 3 17 5 14 10 15 11 12 14 10 15 7 12 3 7 1h15l14-3 16-8 17-12 11-8 10-4h11l10 3 10 6 10 10 6 10 1 3v11l-4 10-6 9-8 10-8 9-10 8-16 10-19 8-18 5-22 3h-29l-21-3-19-5-21-9-16-10-13-11-8-7-12-13-12-17-9-15-11-24-6-23-2-15v-29l4-23 6-20 5-12 9-17 7-11 8-10 9-11 13-12 16-11 18-10 20-8 15-4z" />
                                            <path transform="translate(1222,783)" d="m0 0h51l26 3 18 5 17 8 16 12 8 7 11 14 9 14 8 20 3 14 1 11v14l-3 17-6 16-7 14-10 14-10 11-11 9-9 6-15 7-17 5-21 3-35 3-1 1v67l-2 13-6 12-11 11-9 4h-19l-13-4-11-8-7-11-2-11-1-17v-249l5-13 11-12 10-6 8-2zm28 80-4 3-1 4-1 17v27l2 10 4 3 10 2h11l17-4 10-6 7-8 4-8v-10l-4-11-6-8-7-6-7-3-19-2z" />
                                            <path transform="translate(1531,1233)" d="m0 0h52l32 1 11 2 14 7 6 7 5 13 1 5v10l-4 13-6 9-13 9-11 3-8 1-63 2-1 25v17l7 1 53 3 14 2 11 7 7 7 5 13v19l-3 10-6 9-8 6-14 3-29 2-37 1 1 38 1 6 3 1 24 1 41 1 13 2 8 4 8 9 5 12 2 10v7l-4 13-6 8-8 7-10 5-9 1-29 1h-80l-14-2-8-3-11-10-4-9-3-12-1-11v-245l2-13 6-12 5-6 9-6 5-2 6-1z" />
                                            <path transform="translate(1e3 165)" d="m0 0h18l21 3 14 4 17 8 14 10 18 18 12 18 9 20 4 15 1 7v32l-3 16-5 14-8 15-8 11-9 11-10 9-13 9-11 6-12 5-21 5-17 2h-10l-19-2-15-4-19-9-13-9-10-9-7-7-11-15-10-21-5-15-3-15-1-16 2-20 4-15 8-19 12-18 5-6h2l2-4 7-7 10-7 13-8 14-6 15-4zm3 80-12 4-9 6-9 10-3 13v11l3 12 6 9 7 6 10 4 7 2h12l11-4 8-5 5-5 6-9 3-10v-11l-4-12-6-8-9-8-8-4-4-1z" />
                                            <path transform="translate(1020,785)" d="m0 0h20l9 3 12 8 7 8 3 8 1 7 1 65v123l-1 70-1 13-4 10-8 9-11 7-10 2h-9l-12-2-11-7-8-9-4-8-2-8-1-21v-163l1-78 2-11 4-8 8-9 11-8z" />
                                            <path transform="translate(35,1112)" d="m0 0h9l11 4 9 6 10 11 4 7 1 4v15l-4 9-7 10h-2v2l-10 8-13 7h-2v-2l-8-1-16-9-10-9-7-6v-33l11-9 9-8 10-5z" />
                                            <path transform="translate(992)" d="m0 0h44v1l-26 1h-14z" />
                                            <path transform="translate(1035,2042)" d="m0 0" />
                                            <path transform="translate(2,995)" d="m0 0" />
                                        </svg>

                                    </div>
                                    {haveAnAddress &&
                                        <div className="LabelinpCheck mt20">
                                            <input type="checkbox" id='inpSerAsDDef' onChange={e => setaddressObject(cu => ({ ...cu, isDefault: !cu.isDefault }))} />
                                            <label htmlFor="inpSerAsDDef"> Set As your  default address </label>
                                        </div>
                                    }
                                    <button disabled={AllDone} className='bl  mt50  wmia  p10 br20 ' onClick={handelSubmitLogin} style={{ alignSelf: "end" }}>Submit<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m700-300-57-56 84-84H120v-80h607l-83-84 57-56 179 180-180 180Z" /></svg></button>
                                </div>

                            </>
                    }
                </div>
            </>
        )
    }
}

export const UpdateAddress = () => {
    const dispatch = useDispatch()
    const deviceTypePc = window.innerWidth > 800
    const naviagate = useNavigate()
    const MainPagePuRef = useRef()
    const { address_updated_success, haveAnAddress, wantedToUpdatedAddress, isUpdatingAddress } = useSelector(st => st.addAddress);
    function goTOMain() {
        naviagate('/home');
    }
    if (wantedToUpdatedAddress == null) {
        goTOMain()
        return
    }

    useEffect(() => {
        if (address_updated_success) {
            dispatch(resedAddUptatingStatus(2))
            naviagate(-1)
        }
    }, [address_updated_success])

    const [addressObject, setaddressObject] = useState({
        id: wantedToUpdatedAddress.id,
        phone: wantedToUpdatedAddress.phone,
        houseApparNum: wantedToUpdatedAddress.houseApparNum,
        street: wantedToUpdatedAddress.street,
        city: wantedToUpdatedAddress.city,
        zip: wantedToUpdatedAddress.zip,
        isDefault: wantedToUpdatedAddress.isDefault
    })
    const handelSubmitLogin = (e) => {
        e.preventDefault();
        dispatch(updateAddressF(addressObject));
    }
    const someThingChanged = () => Object.keys(addressObject).map(elm => addressObject[elm] != wantedToUpdatedAddress[elm]).some(e => e == true);
    const [someThingChangedValue, setsomeThingChangedValue] = useState(someThingChanged())
    useEffect(() => {
        setsomeThingChangedValue(someThingChanged())
    }, [addressObject]);
    const handelHideAddress = () => dispatch(hideUpdateAddress());

    if (deviceTypePc) {
        return ReactDom.createPortal(
            <div className='backendMer'>
                <div action="" style={{ position: "relative" }} className="activeCmp w600 h700 bg-l p20 br10 c-p-s">
                    {
                        isUpdatingAddress ? <div className="loader"></div> :
                            <>
                                <button className='btnClose' onClick={handelHideAddress} type='button'><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" /></svg></button>
                                <h1 className='r-s-c wmia pb20 mb20' style={{ borderBottom: "solid 1px var(--border-color)" }}><svg xmlns="http://www.w3.org/2000/svg" className='mr20 w30 h30' viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M480-120q-75 0-140.5-28.5t-114-77q-48.5-48.5-77-114T120-480q0-75 28.5-140.5t77-114q48.5-48.5 114-77T480-840q82 0 155.5 35T760-706v-94h80v240H600v-80h110q-41-56-101-88t-129-32q-117 0-198.5 81.5T200-480q0 117 81.5 198.5T480-200q105 0 183.5-68T756-440h82q-15 137-117.5 228.5T480-120Zm112-192L440-464v-216h80v184l128 128-56 56Z" /></svg>Update Address</h1>
                                <div className="LabelInpInfo">
                                    <input onChange={e => setaddressObject(cu => ({ ...cu, phone: e.target.value }))} value={addressObject.phone} type="text" id="phone" name='phone' placeholder='' />
                                    <label htmlFor="phone">Phone number</label>
                                    <svg xmlns="http://www.w3.org/2000/svg" className='iconeLabelInpinfo' viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M760-480q0-117-81.5-198.5T480-760v-80q75 0 140.5 28.5t114 77q48.5 48.5 77 114T840-480h-80Zm-160 0q0-50-35-85t-85-35v-80q83 0 141.5 58.5T680-480h-80Zm198 360q-125 0-247-54.5T329-329Q229-429 174.5-551T120-798q0-18 12-30t30-12h162q14 0 25 9.5t13 22.5l26 140q2 16-1 27t-11 19l-97 98q20 37 47.5 71.5T387-386q31 31 65 57.5t72 48.5l94-94q9-9 23.5-13.5T670-390l138 28q14 4 23 14.5t9 23.5v162q0 18-12 30t-30 12ZM241-600l66-66-17-94h-89q5 41 14 81t26 79Zm358 358q39 17 79.5 27t81.5 13v-88l-94-19-67 67ZM241-600Zm358 358Z" /></svg> </div>
                                <div className="LabelInpInfo">
                                    <input onChange={e => setaddressObject(cu => ({ ...cu, houseApparNum: e.target.value }))} value={addressObject.houseApparNum} type="text" id="House" name='House' placeholder='' />
                                    <label htmlFor="House">House/Apartment Number</label>
                                    <svg xmlns="http://www.w3.org/2000/svg" className='iconeLabelInpinfo' viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M160-120v-375l-72 55-48-64 120-92v-124h80v63l240-183 440 336-48 63-72-54v375H160Zm80-80h200v-160h80v160h200v-356L480-739 240-556v356Zm-80-560q0-50 35-85t85-35q17 0 28.5-11.5T320-920h80q0 50-35 85t-85 35q-17 0-28.5 11.5T240-760h-80Zm80 560h480-480Z" /></svg>  </div>
                                <div className="LabelInpInfo">
                                    <input onChange={e => setaddressObject(cu => ({ ...cu, street: e.target.value }))} value={addressObject.street} type="text" id="Street" name='Street' placeholder='' />
                                    <label htmlFor="Street">Street Name</label>
                                    <svg version="1.1" viewBox="0 0 2048 2048" className='iconeLabelInpinfo' xmlns="http://www.w3.org/2000/svg">
                                        <path transform="translate(663)" d="m0 0h37l3 7 14 12 4 7 1 7v1451l-3 31-4 18-6 16-11 20-10 15-9 11-13 13-18 13-12 7-23 9-19 5-32 3-29 1h-412l-93-1-8-1-9-11-11-11v-34l13-11 9-9 9-2 20-1h118l40 1v-304l-1-7-9-3-27-8-19-8-20-10-16-10-13-10-10-9-8-7-10-10-18-22-12-18-12-21-11-24-8-22-8-28-6-25-1-1v-143l2 2 3-13 15-73 13-57 9-34 14-48 13-38 12-31 13-30 12-26 12-22 16-26 10-14 13-16 6-7 16-14 19-13 16-8 13-4 12-2h23l14 2 15 5 16 8 16 11 13 12 8 8 9 11 13 17 12 19 13 23 9 17 16 36 11 27 13 36 16 52 15 56 9 40 8 40 5 31 7 56 3 37v43l-3 25-7 37-7 25-12 31-8 16-9 16-14 21-9 11-9 10-18 18-14 11-15 10-18 10-22 10-21 7-24 7-1 84-1 227 268-1 21-2 13-4 16-9 12-10 7-10 8-15 3-15 1-14 1-1421 1-35 6-10 6-7 5-5 3-4zm-415 481-10 4-10 8-8 7-9 11-11 15-8 13-15 28-13 28-11 27-11 29-14 43-14 49-10 41-8 35-5 31-7 49-4 41v44l4 31 5 23 6 21 6 15 11 22 11 16 11 13 13 12 15 11 19 12 27 13h1l1-42 1-83 1-13 4-10 6-8 7-7 10-4h19l10 3 9 5 6 5 4 8 3 12 1 18v107l1 8 12-3 19-10 20-12 16-13 5-4 7-8 12-15 13-22 5-10 10-26 5-21 4-25 1-11v-57l-2-28-6-43-8-47-11-50-15-56-13-42-9-27-12-31-12-28-12-25-10-18-12-19-10-13-11-12-9-8-10-6-4-1z" />
                                        <path transform="translate(1065)" d="m0 0h41l-4 3 6 7 8 7 5 6 2 6 1 18v664l1 17 3 17 5 14 7 12 12 12 14 9 12 5 14 3 10 1 59 1 283 1v-88l1-103-18-3-16-5-20-8-23-11-11-7-14-10-14-12-13-13-9-11-12-18-9-17-9-21-6-19-4-19-2-21v-37l3-32 9-47 9-36 11-37 7-21 12-32 11-26 16-33 13-22 10-15 9-12 10-13 9-10 13-13 14-10 14-9 16-9 2-3h69l-3 3 5 4 16 8 16 11 11 9 5 4v2l4 2 6 6v2h2l9 11 12 16 14 22 9 15 8 16 12 26 14 36 12 36 11 37 7 28 9 45 3 21 1 11 1 23v15l-2 28-4 19-8 26-12 25-10 16-8 10-11 13-14 14-14 11-13 9-14 8-21 9-27 9-20 6-1 21-1 168-1 2 212-1h100l68 1 17 1 6 4 6 7 8 7 5 4 1-2v36h-3l-4 2v2l-4 4-7 9-8 3-11 2-192 1h-585l-38-1-26-3-19-5-20-8-15-9-14-11-20-20-10-13-14-24-6-14-5-19-3-24-1-25v-677l7-11 9-10zm516 80-10 4-13 11-8 7-13 16-13 20-6 11-16 32-13 30-11 30-8 24-12 43-6 28-5 32-2 24v20l3 21 6 21 8 16 10 14 6 7h2v2l8 7 9 7 16 10 16 8 9 3h6l1-4 1-43 3-16 4-8 3-3v-2l14-7 10-3h8l12 3 12 7 7 9 5 13 1 4 1 51 7-1 12-4 25-13 12-9 12-11 7-8 7-10 5-10 8-24 3-12 1-8v-34l-4-34-5-28-7-30-8-27-8-25-7-20-12-30-16-34-12-21-8-12-9-12-9-11-4-5-8-7-12-7-7-2z" />
                                        <path transform="translate(1216,1204)" d="m0 0h763l37 1 8 2 11 9 13 13v31l-8 7-11 11-10 4-13 2-811 2-14 2-19 8-10 8-9 9-7 11-6 14-3 10-2 22-2 402-2 25-3 24-4 19-12 36-8 17-11 20-12 17-11 14-8 10h-2l-2 4-14 14-8 7-14 11-14 10-20 12-15 8-23 10-36 12-15 4v2h-6-3-862l1-5-3-7-14-10-2-2v-34l11-9 11-11 3-1 16-1 50-1 731-1 26-1 28-3 20-4 20-6 17-8 22-13 13-10 13-11 12-12 10-13 6-8 9-15 7-14 9-25 4-19 3-32 1-186 1-230 2-20 4-15 8-21 12-22 12-16 9-10 9-9 14-11 14-9 14-7 24-8 11-2 11-1z" />
                                        <path transform="translate(875,1526)" d="m0 0h14l11 4 11 7 8 10 3 8 1 8v125l-2 22-3 16-5 16-8 18-11 18-12 16-14 14-15 11-24 13-17 6-27 6-15 2-17 1h-146l-20-2-9-6-8-9-7-12-1-3v-15l4-11 8-12 7-6 9-4 4-1 167-1 17-2 16-5 14-7 10-8 9-9 8-16 4-14 2-12 1-30v-99l2-11 6-11 7-6 14-8z" />
                                        <path transform="translate(1658 1e3)" d="m0 0h55l15 1 12 3 8 4 9 8 6 10 3 11v13l-4 9-8 11-9 6-9 4-7 1-24 1h-57l-17-2-9-6-9-9-7-14-1-4v-10l5-14 7-9 8-7 10-4 8-2z" />
                                        <path transform="translate(1112 1e3)" d="m0 0h38l21 2 12 4 8 6 7 8 4 8 1 4v20l-4 9-6 8-7 6-8 5-4 1-25 1h-67l-13-2-9-6-8-9-8-16-1-4v-7l3-10 6-10 11-12 7-3 10-2z" />
                                        <path transform="translate(875,683)" d="m0 0h13l11 3 10 6 7 8 5 11 2 8 1 29v45l-1 14-3 11-7 9-4 5-13 9-6 2h-9l-12-3-11-6-7-7-6-12-3-16-1-20v-40l1-19 3-12 5-9 5-5 7-6 9-4z" />
                                        <path transform="translate(312,1766)" d="m0 0h88l12 2 9 4 8 6 7 8 4 10 1 6v10l-3 10-6 9-4 5-9 6-13 4-10 1-47 1h-14l-16-1-13-3-9-6-5-5-6-7-5-10-1-3v-14l4-10 10-13 10-6z" />
                                        <path transform="translate(39,1766)" d="m0 0h80l11 2 14 7 9 8 6 12v19l-5 12-11 12-8 5-11 3-8 1h-77l-12-2-11-6-10-9-6-7v-35l12-11 5-4 8-4 6-2z" />
                                        <path transform="translate(878,963)" d="m0 0 13 1 11 4 10 7 6 9 4 10 1 9 1 39v37l-2 13-4 9-6 9-8 8-10 4-10 1-14-2-10-5-7-6-7-11-3-12-1-7-1-17 1-61 2-11 6-12 8-7 12-7z" />
                                        <path transform="translate(1930 1e3)" d="m0 0h71l16 2 12 5 9 7 7 8 1 1 2-2v36l-8 7-7 7-9 6-8 2-13 1-39 1h-31l-15-1-9-3-8-7-8-9-6-12v-14l4-11 7-11 9-8 8-3z" />
                                        <path transform="translate(874,121)" d="m0 0h17l11 4 8 6 7 9 5 12 1 6 1 27v43l-2 21-4 9-7 9-9 8-8 4-4 1h-12l-13-4-11-8-6-8-4-10-2-12-1-13v-22l1-42 3-14 6-12 7-7 12-6z" />
                                        <path transform="translate(872,1246)" d="m0 0h19l9 2 8 5 8 9 5 11 2 7 1 27v50l-1 14-4 10-8 11-8 7-10 5h-17l-13-4-9-7-7-10-4-14-1-7v-78l4-15 5-9 8-8 9-5z" />
                                        <path transform="translate(1392 1e3)" d="m0 0h35l23 2 13 4 9 6 8 9 4 11v18l-4 10-6 9-6 5-8 4-17 3-27 1h-53l-13-2-9-6-9-10-5-9-2-6v-13l4-13 8-10 11-8 10-3 7-1z" />
                                        <path transform="translate(873,402)" d="m0 0h17l10 3 10 7 7 9 5 12 1 10 1 37v28l-1 16-4 13-7 11-9 8-8 3-6 1h-9l-16-4-9-6-7-9-3-8-3-16-1-25 1-51 2-11 7-14 7-6 10-6z" />
                                        <path transform="translate(892,2045)" d="m0 0h2v3l-3-1z" />
                                        <path transform="translate(1624)" d="m0 0h6v1h-6z" />
                                        <path transform="translate(1,1024)" d="m0 0" />
                                        <path transform="translate(0,2047)" d="m0 0 2 1z" />
                                        <path transform="translate(0,1784)" d="m0 0" />
                                        <path transform="translate(701)" d="m0 0 2 1z" />
                                        <path transform="translate(2,2027)" d="m0 0" />
                                        <path transform="translate(1,2026)" d="m0 0" />
                                        <path transform="translate(1,1825)" d="m0 0" />
                                        <path transform="translate(1,1624)" d="m0 0" />
                                        <path transform="translate(2047,1224)" d="m0 0" />
                                        <path transform="translate(2047,1061)" d="m0 0" />
                                    </svg>
                                </div>
                                <div className="LabelInpInfo">
                                    <input onChange={e => setaddressObject(cu => ({ ...cu, city: e.target.value }))} value={addressObject.city} type="text" id="City" name='City' placeholder='' />
                                    <label htmlFor="City">City</label>
                                    <svg version="1.1" viewBox="0 0 2048 2048" className='iconeLabelInpinfo' xmlns="http://www.w3.org/2000/svg">
                                        <path transform="translate(1238,31)" d="m0 0 9 2 1 2 1 180 28-5 32-7h2v-90l1-17 1-1 60 1 3 2v52l-1 39 78-14 85-18 19-4h10l1 2v87l-1 620h64v-153l1-34 1-3 2-1 60-1-1-62 1-56 1-9h12l44 2 8 2 1 3-1 96-1 24h16l43 2 6 2 1 4-1 184 38 1 22 1 4 2v123l14 1 33 1 13 1 4 2v207l-1 749 62 2 3 1v26l-1 33-2 2-118 1h-1855l-8-1-1-1v-30l1-23 1-8 1-1h109l16-1-1-128-6-4-16-6-17-9-16-12-10-9-14-14-13-17-10-18-8-16-7-19-5-21-3-22v-45l3-24 5-20 9-25 8-16 8-13 8-11 11-13 17-17 18-12 15-8 16-6 19-4 18-2h18l22 4 17 6 16 8 14 11 11 8v-24l-1-13-10-4-12-3-28-11-21-11-12-8-16-13-8-7-16-16-11-14-11-16-9-15-8-15-10-23-7-21-5-20-3-19-2-22v-33l2-24 3-20 5-19 8-24 9-21 13-24 13-19 13-16 9-10 11-11 14-11 14-10 18-10 21-10 16-5 20-4 23-2h14l29 1-1-38v-348h-39l-22-1-2-2v-52l2-8 2-1 146-1h416l8-1 1-1 1-177 3-6 8-3 134-26 27-5 17-4h4l-1-32v-121l2-5 1-1 38-1h21l3 3v64l-1 78 45-8 14-3 5-1v-88l1-105 2-3zm262 198-30 7-70 15-90 18-37 7-200 40-76 15-40 7-26 6-3 1-1 5-1 326 1 975 1 53 36-6 11-1h34l27 3 23 5 20 7 25 13 15 10 13 10 4 2v2l8 7 18 18 6 4h6l17-9 20-4 34-5 2-1v-508l1-238 1-21h41l19-1 2-1v-77l1-49 4-1h186l2-1-1-25-1-90v-115l1-403zm-1077 314-7 1-1 300v105l2 4 16 10 13 10 14 12 15 15 9 11 7 8 5 3 4 1 19 1 28 4 24 5 24 9 10 5h2l1-55h59l4 1v59l-7 2-41 3 1 3 9 6 15 12 8 7 15 15 11 14 8 11 9 15 14 27 7 19 7 24 4 21 2 20v52l-3 30-5 22-8 25-7 17-11 21-15 23-11 15-14 15-14 13-13 10-20 12-17 9-30 11-12 3-9 5-1 2v33l1 20v15l-3 9-7 9-11 13-11 14-13 15-9 10-7 8-12 14-9 10-9 11-8 9-9 11-11 13-9 11-13 15-11 12v2h-2l-7 8-10 11-9 11-7 7-3 7-1 9-2 52v55l16 1h112l2-1v-44l2-18 4-17 5-12 9-19 10-15 7-9 8-10 2-1v-2l4-2 10-9 19-12 21-10 17-5 24-4h32l21 3 21 6 19 9 17 11 14 12 12 11 7 7 7 5 4 2h6l8-9 8-12 13-19 8-12 8-8 5-6 8-7 12-10 8-6 2-4v-156l-1-746v-145l1-137-1-7zm1273 191-1 73v54l1 1h64l-1-125-5-1-35-2zm-319 192-2 1v62l10 1 78 1h341l20-1v-33l-1-28-1-1-36-1-364-1zm-1073 67-18 3-20 7-19 10-12 8-14 12-13 13-11 15-9 15-8 15-7 19-6 21-4 19-2 16-1 15v16l3 26 5 22 7 23 9 19 10 16 10 13 12 13 11 10 19 13 23 13 13 7h4l1-9v-158l1-45 1-8 58 1 4 1v191l1 26 4 1 14-6 17-10 11-7 14-10 6-5v-2l4-2 8-8 12-16 8-13 10-19 7-19 7-27 3-19 1-10v-30l-3-26-5-21-9-25-8-16-9-16-11-16-13-15-11-10-14-10-21-11-18-6-14-3-9-1zm1008 62-1 168v519l1 28 2 7 3 2 7-1 7-4 10-9 14-12 13-11 7-8 1-610 1-4 42-1h399l4 1 1 2v716l2 8 22 14 13 9 14 11 9 7 4 2-1-833-35-1zm-782 32-1 2 5 21 5 32 2 18 1 19v13l-1 22-3 26-5 20-8 25-8 19-12 22-12 18-10 14-11 12v2l-4 2-13 13-10 8-11 8-18 10-8 5-1 4 12 13 14 10 13 8 14 7 16 6 13 3 8 1h24l15-2 16-4 17-7 17-9 17-12 15-14 7-8 13-18 13-24 6-15 7-25 4-19 2-19v-27l-3-25-4-20-11-33-8-16-6-11-9-13-9-11-13-13-14-11-15-9-22-10-25-8zm909 96v385l1 136 9-1 29-5 10-1h29l26 3 17 3h7v-519l-1-1zm195 0-3 2v544l2 8 11 9 14 12 9 9 7 8 14 18 14 24 5 5 13 2 25 2h14v-643zm-1282 280-1 72v195l2 2 11-9 8-9 8-10 6-7v-2h2l9-11 5-6v-2h2l7-8 11-13 12-14 10-11 9-11 11-12 6-9 6-8 3-10 1-12v-29l-1-3-9-5-6-1-25-10-26-12-10-6-14-9-13-10-13-12-5-5-4-3zm-174 42-14 4-17 9-10 9-9 9-10 14-8 16-7 20-4 15-3 22v24l3 19 4 14 6 16 8 16 9 12 9 10 10 9 18 10 11 4 5 1h21l16-4 17-9 13-10 10-10 9-12 7-12 7-19 5-19 2-15v-25l-2-21-4-16-5-15-9-19-9-13-9-10-7-7-15-10-13-5-9-2zm1321 254-21 2-22 5-16 6-19 10-11 8-16 13-9 9-11 14-7 10-8 13-12 22-5 5-8-6-1-2h-2l-2-4-11-11-14-11-14-8-12-5-16-4-18-1-16 2-13 4-17 8-13 9-15 14-9 10-6 5-3-4h-2l-2-4-7-10-10-17-12-17-9-11-12-13-14-11-14-9-16-8-16-6-16-4-15-2h-31l-20 3-21 6-16 7-14 8-14 11-10 9-9 9-12 16-8 13-7 14-10 26-5 15-3 4-7-1-25-9-23-4h-14l-10 2h-7l-10-6-8-11-9-12-9-10-13-10-16-9-15-5-14-2h-21l-14 3-16 7-11 6-10 9-7 7-10 15-9 19-4 13-1 5v23l3 13 5 5 5 1 15 1h1240l24-1 17-2v-3l-9-9-14-10-19-14-16-9-23-9-19-5-16-2h-14l-18 2-21 5-10 4h-5l-5-7-8-20-13-28-12-19-8-10-11-12-10-9-15-10-14-8-20-8-20-5-27-3zm-1213 29-12 6-16 10-19 10-14 7-2 2v122l1 5 13 1h48l2-1 1-158z" />
                                        <path transform="translate(997,1374)" d="m0 0h180l5 2 1 2 1 156v94l-4 3h-187l-2-2-1-32v-71l1-145 1-6zm62 64-4 1v123l1 5h62l1-1 1-118-1-7-1-1-11-1-27-1z" />
                                        <path transform="translate(1116,414)" d="m0 0h64l3 2 1 3v249l-2 3h-124l-60-1-6-2-1-5-1-24v-190l1-29 1-3 3-1zm-60 65-1 2v125l18 1h45l1-1 1-67v-58l-1-1-8-1z" />
                                        <path transform="translate(998,1054)" d="m0 0h178l6 1 1 2v252l-3 2h-181l-7-2-1-1-1-17v-86l1-144 2-6zm61 64-4 2v126l1 1h61l2-1 1-87v-35l-2-4-14-1-29-1z" />
                                        <path transform="translate(1374,414)" d="m0 0h61l4 2v253l-1 1-14 1h-171l-5-2-1-1-1-24v-51l1-156 1-17 1-4 2-1zm-55 64-8 1v127l7 1h56l1-1 1-90v-33l-1-3-6-1-34-1z" />
                                        <path transform="translate(998,734)" d="m0 0h40l143 1 2 2v252l-4 2h-151l-31-1-5-2-1-3-1-21v-75l1-147 2-7zm60 64-3 3v125l7 1h55l3-1v-125l-16-2-28-1z" />
                                        <path transform="translate(533,862)" d="m0 0 9 1 2 3v59l-5 2h-53l-6-2-2-7v-30l1-20 2-4 6-1z" />
                                        <path transform="translate(518,735)" d="m0 0h19l6 2 1 1v60l-4 1h-37l-21-1-3-2-1-5v-37l1-14 1-3 2-1z" />
                                        <path transform="translate(486,607)" d="m0 0 52 1 5 3 1 4v54l-4 2h-19l-36-1-6-2-1-4v-35l1-18 1-3z" />
                                        <path transform="translate(635,863)" d="m0 0h33l3 3 1 3v56l-1 1h-61l-3-2-1-22 1-33 2-5z" />
                                        <path transform="translate(662,735)" d="m0 0 7 1 3 4v57l-1 1h-62l-2-2v-55l2-5z" />
                                        <path transform="translate(744,607)" d="m0 0h48l6 2 1 3v56l-2 2-16 1h-43l-2-2-1-8v-21l1-27 1-5z" />
                                        <path transform="translate(769,735)" d="m0 0h27l3 4v57l-3 2-24 1h-34l-2-2-1-5v-48l2-7 7-1z" />
                                        <path transform="translate(785,990)" d="m0 0h9l4 2 1 2v58l-4 2h-56l-3-2-1-4v-48l2-7 4-1z" />
                                        <path transform="translate(767,863)" d="m0 0h30l2 4v57l-2 2-34 1h-22l-5-2-1-10v-46l1-3 2-1z" />
                                        <path transform="translate(609,608)" d="m0 0h54l6 2 2 1 1 57-2 2h-61l-2-2v-45l1-14z" />
                                    </svg>
                                </div>
                                <div className="LabelInpInfo">
                                    <input onChange={e => setaddressObject(cu => ({ ...cu, zip: e.target.value }))} value={addressObject.zip} type="text" id="ZIP" name='ZIP' placeholder='' />
                                    <label htmlFor="ZIP">Postal Code/ZIP Code</label>
                                    <svg version="1.1" viewBox="0 0 2048 2048" className='iconeLabelInpinfo' xmlns="http://www.w3.org/2000/svg">
                                        <path transform="translate(991,9)" d="m0 0h45l22 3 25 6 27 9 23 10 19 11 24 16 17 14 11 9v2l4 2 12 13 13 17 12 18 12 21 8 17 8 21 7 24 4 22 3 29v21l-2 20-5 29-6 22-7 19-11 25-14 26-11 19-14 22-5 8h70l546 1 35 2 24 4 19 6 17 7 16 8 24 16 11 9 12 11 11 12 13 18 14 24 8 17 12 30 2 7h2v1017l-3-1 1-3-2-1-2-5-11 32-8 17-15 24-9 12-9 11-17 17-17 13-16 10-15 8-22 9-22 6-23 4-22 2-18 1-574 2-24 2-21 5-12 5-11 7-14 11-9 9-14 19-14 22-10 17-13 20-22 36-15 24-9 13-9 10-8 5-6 2-12 1-3 1v-2l-9-2-9-6-9-10-7-10-14-22-15-24-13-21-18-30-16-24-13-17-14-14-15-10-16-8-16-5-17-3-15-1-74-1h-503l-29-2-23-3-20-5-18-6-18-8-20-12-12-9-13-11-7-6-7-8-8-8-12-16-8-13-12-23-11-26-5-14-2-2v-348l11-8 13-10 10-5h9l12 5 13 9 8 9 3 10 1 143v117l1 34 3 24 4 17 6 16 7 14 9 12 9 10 7 7 10 8 18 11 15 7 14 4 20 3 10 1 25 1h552l28 1 21 2 22 5 17 6 18 8 17 10 12 8 14 12 8 7 9 9 9 11 9 12 15 23 18 30 11 20 4 4h3l11-18 10-16 8-14 10-15 9-14 11-15 11-13 4-5 8-7 14-11 17-11 25-13 22-8 22-5 18-2 47-1 561-1 21-2 23-6 21-10 15-10 10-9 5-4 7-8 8-11 8-13 7-19 5-22 2-27v-903l-2-29-3-16-7-19-9-16-10-13-8-9-8-7-13-9-19-10-20-6-22-3-47-2h-610l-25 1-4 4-16 27-9 16-6 10-15 24-7 11-9 12-8 10h-2l-2 4-10 9-12 8-18 7-19 5-6 1h-20l-17-4-15-6-9-5-10-8-8-7-7-8-9-11-12-18-13-21-17-28-14-22-9-11h-429l-209 1-23 1-16 2-21 6-16 8-17 12-15 15-10 14-8 14-6 15-4 14-3 24-1 12-1 204-1 67-1 14-3 7-5 6-18 13-8 6-9-3-13-7-14-11-8-7v-341l3 1 3-9 11-28 9-19 12-20 10-13 8-10 9-10 8-7 14-11 15-10 18-10 26-10 23-6 24-3 20-1 71-1h525l-2-5-13-22-8-13-12-22-9-17-11-25-9-27-5-22-3-23-1-14v-29l3-24 6-27 11-32 15-31 12-19 12-17 11-13 7-8 17-17 11-9 12-9 22-14 14-8 22-10 30-10 26-5zm11 82-25 2-22 4-18 6-16 8-14 8-13 10-10 8-12 11v2h-2l-9 11-8 11-9 14-8 15-6 15-6 19-4 17-2 15-1 21 2 24 5 20 8 24 8 16 12 23 8 13 10 17 21 33 11 18 16 26 12 20 10 16 10 17 9 15 12 19 13 21 8 11 9 10 8 5 4 1 11-8 8-8 9-12 10-17 6-10 13-21 15-24 13-22 9-14 17-28 13-20 11-18 13-21 12-21 10-18 10-23 5-16 4-20 2-15v-38l-4-25-4-15-6-16-10-21-11-17-9-11-11-12-15-13-14-10-15-9-15-8-19-7-21-5-15-2-16-1zm1042 1564m-1 2 1 3z" />
                                        <path transform="translate(880,1233)" d="m0 0h33l20 2 21 5 19 8 19 11 11 8 14 12 11 12 11 15 10 17 7 15 8 24 3 18v37l-4 23-5 16-7 17-9 16-10 14-10 11-6 7-22 18-16 9-19 8-20 6-27 4h-32l-24-4-17-5-20-9-15-10-9-7-12-11-8-8-11-14-10-15-12-25-7-23-3-18-1-12v-10l2-19 4-19 6-18 7-16 8-14 13-18 7-8h2l2-4 8-7 12-9 16-10 16-8 15-6 16-4zm6 80-15 3-16 8-9 6-14 14-10 17-6 15-2 8-1 10v17l3 14 7 16 10 15 9 10 15 10 15 7 13 3 8 1h9l16-2 15-5 17-9 10-8 8-8 9-13 6-14 3-15 1-14-1-14-4-15-6-14-7-10-9-10-14-11-14-7-14-4-7-1z" />
                                        <path transform="translate(1185,1235)" d="m0 0h37l35 1 21 2 17 4 15 6 14 8 11 8 10 9 9 11 9 12 9 16 9 22 5 19 3 23v45l-2 17-5 22-6 16-12 23-10 14-9 11-8 7-11 9-14 8-19 7-14 4-19 3-31 2h-42l-21-2-8-4-5-4-6-9-5-12-3-16-1-14v-153l1-65 1-16 5-13 6-8 6-5 10-5 8-2zm39 80-4 2v159l2 5 5 2 11 1 20-2 14-5 13-7 10-10 6-12 5-16 2-9 1-9v-30l-3-17-7-20-6-11-9-10-12-7-8-2-19-2z" />
                                        <path transform="translate(738,783)" d="m0 0h111l27 2 8 3 5 4 7 10 8 14 1 3v11l-4 10-14 23-11 17-13 21-8 12-7 10-13 21-14 21-18 28-15 22-11 15-4 7 25 1 50 1 31 2 9 3 9 8 6 10 4 9 1 10-2 10-6 11-8 9-4 5-7 2-22 1-96 1-65-1-18-2-7-5-11-15-5-11-1-9 3-10 6-12 24-36 11-17 7-11 10-15 18-28 15-23 21-32 10-15 7-14h-68l-23-1-16-3-7-8-6-9-7-16v-7l8-16 6-9 9-7 9-3 13-1z" />
                                        <path transform="translate(543,1233)" d="m0 0h37l20 3 19 5 13 5 16 9 10 8 10 10 6 12v11l-3 12-8 11-13 11-10 7-6-1-45-18-16-4-17-1-16 2-14 5-14 8-10 9-7 7-10 17-5 13-3 14-1 19 3 17 5 14 10 15 11 12 14 10 15 7 12 3 7 1h15l14-3 16-8 17-12 11-8 10-4h11l10 3 10 6 10 10 6 10 1 3v11l-4 10-6 9-8 10-8 9-10 8-16 10-19 8-18 5-22 3h-29l-21-3-19-5-21-9-16-10-13-11-8-7-12-13-12-17-9-15-11-24-6-23-2-15v-29l4-23 6-20 5-12 9-17 7-11 8-10 9-11 13-12 16-11 18-10 20-8 15-4z" />
                                        <path transform="translate(1222,783)" d="m0 0h51l26 3 18 5 17 8 16 12 8 7 11 14 9 14 8 20 3 14 1 11v14l-3 17-6 16-7 14-10 14-10 11-11 9-9 6-15 7-17 5-21 3-35 3-1 1v67l-2 13-6 12-11 11-9 4h-19l-13-4-11-8-7-11-2-11-1-17v-249l5-13 11-12 10-6 8-2zm28 80-4 3-1 4-1 17v27l2 10 4 3 10 2h11l17-4 10-6 7-8 4-8v-10l-4-11-6-8-7-6-7-3-19-2z" />
                                        <path transform="translate(1531,1233)" d="m0 0h52l32 1 11 2 14 7 6 7 5 13 1 5v10l-4 13-6 9-13 9-11 3-8 1-63 2-1 25v17l7 1 53 3 14 2 11 7 7 7 5 13v19l-3 10-6 9-8 6-14 3-29 2-37 1 1 38 1 6 3 1 24 1 41 1 13 2 8 4 8 9 5 12 2 10v7l-4 13-6 8-8 7-10 5-9 1-29 1h-80l-14-2-8-3-11-10-4-9-3-12-1-11v-245l2-13 6-12 5-6 9-6 5-2 6-1z" />
                                        <path transform="translate(1e3 165)" d="m0 0h18l21 3 14 4 17 8 14 10 18 18 12 18 9 20 4 15 1 7v32l-3 16-5 14-8 15-8 11-9 11-10 9-13 9-11 6-12 5-21 5-17 2h-10l-19-2-15-4-19-9-13-9-10-9-7-7-11-15-10-21-5-15-3-15-1-16 2-20 4-15 8-19 12-18 5-6h2l2-4 7-7 10-7 13-8 14-6 15-4zm3 80-12 4-9 6-9 10-3 13v11l3 12 6 9 7 6 10 4 7 2h12l11-4 8-5 5-5 6-9 3-10v-11l-4-12-6-8-9-8-8-4-4-1z" />
                                        <path transform="translate(1020,785)" d="m0 0h20l9 3 12 8 7 8 3 8 1 7 1 65v123l-1 70-1 13-4 10-8 9-11 7-10 2h-9l-12-2-11-7-8-9-4-8-2-8-1-21v-163l1-78 2-11 4-8 8-9 11-8z" />
                                        <path transform="translate(35,1112)" d="m0 0h9l11 4 9 6 10 11 4 7 1 4v15l-4 9-7 10h-2v2l-10 8-13 7h-2v-2l-8-1-16-9-10-9-7-6v-33l11-9 9-8 10-5z" />
                                        <path transform="translate(992)" d="m0 0h44v1l-26 1h-14z" />
                                        <path transform="translate(1035,2042)" d="m0 0" />
                                        <path transform="translate(2,995)" d="m0 0" />
                                    </svg>
                                </div>
                                <button disabled={!someThingChangedValue} className='bl  mt20  p10 br20 w200' onClick={handelSubmitLogin} style={{ alignSelf: "end" }}>Save<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M200-120v-640q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v640L480-240 200-120Zm80-122 200-86 200 86v-518H280v518Zm0-518h400-400Z" /></svg></button>
                            </>
                    }
                </div>
            </div>
            , document.getElementById("portlas")
        )
    } else {
        useEffect(() => {
            MainPagePuRef.current?.scrollIntoView({
                behavior: "smooth", block: "start"
            })
        }, [])
        return (
            <>
                {
                    haveAnAddress ?
                        <>
                            <div ref={MainPagePuRef} action="" style={{ position: "relative", paddingTop: "350px" }} className="wmia  p10  c-p-s">
                                {
                                    isUpdatingAddress ? <div className="loader"></div> :
                                        <>
                                            <img src="imgs/rb_2148494141-removebg-preview.png" alt="" className="wmia FielsDesSds" />
                                            <div className='wmia  bg-l p20 br20 c-p-s' style={{
                                                filter: " drop-shadow(0 0 10px var(--filter-color))"
                                            }}>
                                                <h1 className='r-s-c wmia pb20 mb20' style={{ borderBottom: "solid 1px var(--border-color)" }}><svg xmlns="http://www.w3.org/2000/svg" className='mr20 w30 h30' viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M480-120q-75 0-140.5-28.5t-114-77q-48.5-48.5-77-114T120-480q0-75 28.5-140.5t77-114q48.5-48.5 114-77T480-840q82 0 155.5 35T760-706v-94h80v240H600v-80h110q-41-56-101-88t-129-32q-117 0-198.5 81.5T200-480q0 117 81.5 198.5T480-200q105 0 183.5-68T756-440h82q-15 137-117.5 228.5T480-120Zm112-192L440-464v-216h80v184l128 128-56 56Z" /></svg>Update Address</h1>
                                                <div className="LabelInpInfo mt20">
                                                    <input onChange={e => setaddressObject(cu => ({ ...cu, phone: e.target.value }))} value={addressObject.phone} type="text" id="phone" name='phone' placeholder='' />
                                                    <label htmlFor="phone">Phone number</label>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className='iconeLabelInpinfo' viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M760-480q0-117-81.5-198.5T480-760v-80q75 0 140.5 28.5t114 77q48.5 48.5 77 114T840-480h-80Zm-160 0q0-50-35-85t-85-35v-80q83 0 141.5 58.5T680-480h-80Zm198 360q-125 0-247-54.5T329-329Q229-429 174.5-551T120-798q0-18 12-30t30-12h162q14 0 25 9.5t13 22.5l26 140q2 16-1 27t-11 19l-97 98q20 37 47.5 71.5T387-386q31 31 65 57.5t72 48.5l94-94q9-9 23.5-13.5T670-390l138 28q14 4 23 14.5t9 23.5v162q0 18-12 30t-30 12ZM241-600l66-66-17-94h-89q5 41 14 81t26 79Zm358 358q39 17 79.5 27t81.5 13v-88l-94-19-67 67ZM241-600Zm358 358Z" /></svg> </div>
                                                <div className="LabelInpInfo mt20">
                                                    <input onChange={e => setaddressObject(cu => ({ ...cu, houseApparNum: e.target.value }))} value={addressObject.houseApparNum} type="text" id="House" name='House' placeholder='' />
                                                    <label htmlFor="House">House/Apartment Number</label>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className='iconeLabelInpinfo' viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M160-120v-375l-72 55-48-64 120-92v-124h80v63l240-183 440 336-48 63-72-54v375H160Zm80-80h200v-160h80v160h200v-356L480-739 240-556v356Zm-80-560q0-50 35-85t85-35q17 0 28.5-11.5T320-920h80q0 50-35 85t-85 35q-17 0-28.5 11.5T240-760h-80Zm80 560h480-480Z" /></svg>  </div>
                                                <div className="LabelInpInfo mt20">
                                                    <input onChange={e => setaddressObject(cu => ({ ...cu, street: e.target.value }))} value={addressObject.street} type="text" id="Street" name='Street' placeholder='' />
                                                    <label htmlFor="Street">Street Name</label>
                                                    <svg version="1.1" viewBox="0 0 2048 2048" className='iconeLabelInpinfo' xmlns="http://www.w3.org/2000/svg">
                                                        <path transform="translate(663)" d="m0 0h37l3 7 14 12 4 7 1 7v1451l-3 31-4 18-6 16-11 20-10 15-9 11-13 13-18 13-12 7-23 9-19 5-32 3-29 1h-412l-93-1-8-1-9-11-11-11v-34l13-11 9-9 9-2 20-1h118l40 1v-304l-1-7-9-3-27-8-19-8-20-10-16-10-13-10-10-9-8-7-10-10-18-22-12-18-12-21-11-24-8-22-8-28-6-25-1-1v-143l2 2 3-13 15-73 13-57 9-34 14-48 13-38 12-31 13-30 12-26 12-22 16-26 10-14 13-16 6-7 16-14 19-13 16-8 13-4 12-2h23l14 2 15 5 16 8 16 11 13 12 8 8 9 11 13 17 12 19 13 23 9 17 16 36 11 27 13 36 16 52 15 56 9 40 8 40 5 31 7 56 3 37v43l-3 25-7 37-7 25-12 31-8 16-9 16-14 21-9 11-9 10-18 18-14 11-15 10-18 10-22 10-21 7-24 7-1 84-1 227 268-1 21-2 13-4 16-9 12-10 7-10 8-15 3-15 1-14 1-1421 1-35 6-10 6-7 5-5 3-4zm-415 481-10 4-10 8-8 7-9 11-11 15-8 13-15 28-13 28-11 27-11 29-14 43-14 49-10 41-8 35-5 31-7 49-4 41v44l4 31 5 23 6 21 6 15 11 22 11 16 11 13 13 12 15 11 19 12 27 13h1l1-42 1-83 1-13 4-10 6-8 7-7 10-4h19l10 3 9 5 6 5 4 8 3 12 1 18v107l1 8 12-3 19-10 20-12 16-13 5-4 7-8 12-15 13-22 5-10 10-26 5-21 4-25 1-11v-57l-2-28-6-43-8-47-11-50-15-56-13-42-9-27-12-31-12-28-12-25-10-18-12-19-10-13-11-12-9-8-10-6-4-1z" />
                                                        <path transform="translate(1065)" d="m0 0h41l-4 3 6 7 8 7 5 6 2 6 1 18v664l1 17 3 17 5 14 7 12 12 12 14 9 12 5 14 3 10 1 59 1 283 1v-88l1-103-18-3-16-5-20-8-23-11-11-7-14-10-14-12-13-13-9-11-12-18-9-17-9-21-6-19-4-19-2-21v-37l3-32 9-47 9-36 11-37 7-21 12-32 11-26 16-33 13-22 10-15 9-12 10-13 9-10 13-13 14-10 14-9 16-9 2-3h69l-3 3 5 4 16 8 16 11 11 9 5 4v2l4 2 6 6v2h2l9 11 12 16 14 22 9 15 8 16 12 26 14 36 12 36 11 37 7 28 9 45 3 21 1 11 1 23v15l-2 28-4 19-8 26-12 25-10 16-8 10-11 13-14 14-14 11-13 9-14 8-21 9-27 9-20 6-1 21-1 168-1 2 212-1h100l68 1 17 1 6 4 6 7 8 7 5 4 1-2v36h-3l-4 2v2l-4 4-7 9-8 3-11 2-192 1h-585l-38-1-26-3-19-5-20-8-15-9-14-11-20-20-10-13-14-24-6-14-5-19-3-24-1-25v-677l7-11 9-10zm516 80-10 4-13 11-8 7-13 16-13 20-6 11-16 32-13 30-11 30-8 24-12 43-6 28-5 32-2 24v20l3 21 6 21 8 16 10 14 6 7h2v2l8 7 9 7 16 10 16 8 9 3h6l1-4 1-43 3-16 4-8 3-3v-2l14-7 10-3h8l12 3 12 7 7 9 5 13 1 4 1 51 7-1 12-4 25-13 12-9 12-11 7-8 7-10 5-10 8-24 3-12 1-8v-34l-4-34-5-28-7-30-8-27-8-25-7-20-12-30-16-34-12-21-8-12-9-12-9-11-4-5-8-7-12-7-7-2z" />
                                                        <path transform="translate(1216,1204)" d="m0 0h763l37 1 8 2 11 9 13 13v31l-8 7-11 11-10 4-13 2-811 2-14 2-19 8-10 8-9 9-7 11-6 14-3 10-2 22-2 402-2 25-3 24-4 19-12 36-8 17-11 20-12 17-11 14-8 10h-2l-2 4-14 14-8 7-14 11-14 10-20 12-15 8-23 10-36 12-15 4v2h-6-3-862l1-5-3-7-14-10-2-2v-34l11-9 11-11 3-1 16-1 50-1 731-1 26-1 28-3 20-4 20-6 17-8 22-13 13-10 13-11 12-12 10-13 6-8 9-15 7-14 9-25 4-19 3-32 1-186 1-230 2-20 4-15 8-21 12-22 12-16 9-10 9-9 14-11 14-9 14-7 24-8 11-2 11-1z" />
                                                        <path transform="translate(875,1526)" d="m0 0h14l11 4 11 7 8 10 3 8 1 8v125l-2 22-3 16-5 16-8 18-11 18-12 16-14 14-15 11-24 13-17 6-27 6-15 2-17 1h-146l-20-2-9-6-8-9-7-12-1-3v-15l4-11 8-12 7-6 9-4 4-1 167-1 17-2 16-5 14-7 10-8 9-9 8-16 4-14 2-12 1-30v-99l2-11 6-11 7-6 14-8z" />
                                                        <path transform="translate(1658 1e3)" d="m0 0h55l15 1 12 3 8 4 9 8 6 10 3 11v13l-4 9-8 11-9 6-9 4-7 1-24 1h-57l-17-2-9-6-9-9-7-14-1-4v-10l5-14 7-9 8-7 10-4 8-2z" />
                                                        <path transform="translate(1112 1e3)" d="m0 0h38l21 2 12 4 8 6 7 8 4 8 1 4v20l-4 9-6 8-7 6-8 5-4 1-25 1h-67l-13-2-9-6-8-9-8-16-1-4v-7l3-10 6-10 11-12 7-3 10-2z" />
                                                        <path transform="translate(875,683)" d="m0 0h13l11 3 10 6 7 8 5 11 2 8 1 29v45l-1 14-3 11-7 9-4 5-13 9-6 2h-9l-12-3-11-6-7-7-6-12-3-16-1-20v-40l1-19 3-12 5-9 5-5 7-6 9-4z" />
                                                        <path transform="translate(312,1766)" d="m0 0h88l12 2 9 4 8 6 7 8 4 10 1 6v10l-3 10-6 9-4 5-9 6-13 4-10 1-47 1h-14l-16-1-13-3-9-6-5-5-6-7-5-10-1-3v-14l4-10 10-13 10-6z" />
                                                        <path transform="translate(39,1766)" d="m0 0h80l11 2 14 7 9 8 6 12v19l-5 12-11 12-8 5-11 3-8 1h-77l-12-2-11-6-10-9-6-7v-35l12-11 5-4 8-4 6-2z" />
                                                        <path transform="translate(878,963)" d="m0 0 13 1 11 4 10 7 6 9 4 10 1 9 1 39v37l-2 13-4 9-6 9-8 8-10 4-10 1-14-2-10-5-7-6-7-11-3-12-1-7-1-17 1-61 2-11 6-12 8-7 12-7z" />
                                                        <path transform="translate(1930 1e3)" d="m0 0h71l16 2 12 5 9 7 7 8 1 1 2-2v36l-8 7-7 7-9 6-8 2-13 1-39 1h-31l-15-1-9-3-8-7-8-9-6-12v-14l4-11 7-11 9-8 8-3z" />
                                                        <path transform="translate(874,121)" d="m0 0h17l11 4 8 6 7 9 5 12 1 6 1 27v43l-2 21-4 9-7 9-9 8-8 4-4 1h-12l-13-4-11-8-6-8-4-10-2-12-1-13v-22l1-42 3-14 6-12 7-7 12-6z" />
                                                        <path transform="translate(872,1246)" d="m0 0h19l9 2 8 5 8 9 5 11 2 7 1 27v50l-1 14-4 10-8 11-8 7-10 5h-17l-13-4-9-7-7-10-4-14-1-7v-78l4-15 5-9 8-8 9-5z" />
                                                        <path transform="translate(1392 1e3)" d="m0 0h35l23 2 13 4 9 6 8 9 4 11v18l-4 10-6 9-6 5-8 4-17 3-27 1h-53l-13-2-9-6-9-10-5-9-2-6v-13l4-13 8-10 11-8 10-3 7-1z" />
                                                        <path transform="translate(873,402)" d="m0 0h17l10 3 10 7 7 9 5 12 1 10 1 37v28l-1 16-4 13-7 11-9 8-8 3-6 1h-9l-16-4-9-6-7-9-3-8-3-16-1-25 1-51 2-11 7-14 7-6 10-6z" />
                                                        <path transform="translate(892,2045)" d="m0 0h2v3l-3-1z" />
                                                        <path transform="translate(1624)" d="m0 0h6v1h-6z" />
                                                        <path transform="translate(1,1024)" d="m0 0" />
                                                        <path transform="translate(0,2047)" d="m0 0 2 1z" />
                                                        <path transform="translate(0,1784)" d="m0 0" />
                                                        <path transform="translate(701)" d="m0 0 2 1z" />
                                                        <path transform="translate(2,2027)" d="m0 0" />
                                                        <path transform="translate(1,2026)" d="m0 0" />
                                                        <path transform="translate(1,1825)" d="m0 0" />
                                                        <path transform="translate(1,1624)" d="m0 0" />
                                                        <path transform="translate(2047,1224)" d="m0 0" />
                                                        <path transform="translate(2047,1061)" d="m0 0" />
                                                    </svg>
                                                </div>
                                                <div className="LabelInpInfo mt20">
                                                    <input onChange={e => setaddressObject(cu => ({ ...cu, city: e.target.value }))} value={addressObject.city} type="text" id="City" name='City' placeholder='' />
                                                    <label htmlFor="City">City</label>
                                                    <svg version="1.1" viewBox="0 0 2048 2048" className='iconeLabelInpinfo' xmlns="http://www.w3.org/2000/svg">
                                                        <path transform="translate(1238,31)" d="m0 0 9 2 1 2 1 180 28-5 32-7h2v-90l1-17 1-1 60 1 3 2v52l-1 39 78-14 85-18 19-4h10l1 2v87l-1 620h64v-153l1-34 1-3 2-1 60-1-1-62 1-56 1-9h12l44 2 8 2 1 3-1 96-1 24h16l43 2 6 2 1 4-1 184 38 1 22 1 4 2v123l14 1 33 1 13 1 4 2v207l-1 749 62 2 3 1v26l-1 33-2 2-118 1h-1855l-8-1-1-1v-30l1-23 1-8 1-1h109l16-1-1-128-6-4-16-6-17-9-16-12-10-9-14-14-13-17-10-18-8-16-7-19-5-21-3-22v-45l3-24 5-20 9-25 8-16 8-13 8-11 11-13 17-17 18-12 15-8 16-6 19-4 18-2h18l22 4 17 6 16 8 14 11 11 8v-24l-1-13-10-4-12-3-28-11-21-11-12-8-16-13-8-7-16-16-11-14-11-16-9-15-8-15-10-23-7-21-5-20-3-19-2-22v-33l2-24 3-20 5-19 8-24 9-21 13-24 13-19 13-16 9-10 11-11 14-11 14-10 18-10 21-10 16-5 20-4 23-2h14l29 1-1-38v-348h-39l-22-1-2-2v-52l2-8 2-1 146-1h416l8-1 1-1 1-177 3-6 8-3 134-26 27-5 17-4h4l-1-32v-121l2-5 1-1 38-1h21l3 3v64l-1 78 45-8 14-3 5-1v-88l1-105 2-3zm262 198-30 7-70 15-90 18-37 7-200 40-76 15-40 7-26 6-3 1-1 5-1 326 1 975 1 53 36-6 11-1h34l27 3 23 5 20 7 25 13 15 10 13 10 4 2v2l8 7 18 18 6 4h6l17-9 20-4 34-5 2-1v-508l1-238 1-21h41l19-1 2-1v-77l1-49 4-1h186l2-1-1-25-1-90v-115l1-403zm-1077 314-7 1-1 300v105l2 4 16 10 13 10 14 12 15 15 9 11 7 8 5 3 4 1 19 1 28 4 24 5 24 9 10 5h2l1-55h59l4 1v59l-7 2-41 3 1 3 9 6 15 12 8 7 15 15 11 14 8 11 9 15 14 27 7 19 7 24 4 21 2 20v52l-3 30-5 22-8 25-7 17-11 21-15 23-11 15-14 15-14 13-13 10-20 12-17 9-30 11-12 3-9 5-1 2v33l1 20v15l-3 9-7 9-11 13-11 14-13 15-9 10-7 8-12 14-9 10-9 11-8 9-9 11-11 13-9 11-13 15-11 12v2h-2l-7 8-10 11-9 11-7 7-3 7-1 9-2 52v55l16 1h112l2-1v-44l2-18 4-17 5-12 9-19 10-15 7-9 8-10 2-1v-2l4-2 10-9 19-12 21-10 17-5 24-4h32l21 3 21 6 19 9 17 11 14 12 12 11 7 7 7 5 4 2h6l8-9 8-12 13-19 8-12 8-8 5-6 8-7 12-10 8-6 2-4v-156l-1-746v-145l1-137-1-7zm1273 191-1 73v54l1 1h64l-1-125-5-1-35-2zm-319 192-2 1v62l10 1 78 1h341l20-1v-33l-1-28-1-1-36-1-364-1zm-1073 67-18 3-20 7-19 10-12 8-14 12-13 13-11 15-9 15-8 15-7 19-6 21-4 19-2 16-1 15v16l3 26 5 22 7 23 9 19 10 16 10 13 12 13 11 10 19 13 23 13 13 7h4l1-9v-158l1-45 1-8 58 1 4 1v191l1 26 4 1 14-6 17-10 11-7 14-10 6-5v-2l4-2 8-8 12-16 8-13 10-19 7-19 7-27 3-19 1-10v-30l-3-26-5-21-9-25-8-16-9-16-11-16-13-15-11-10-14-10-21-11-18-6-14-3-9-1zm1008 62-1 168v519l1 28 2 7 3 2 7-1 7-4 10-9 14-12 13-11 7-8 1-610 1-4 42-1h399l4 1 1 2v716l2 8 22 14 13 9 14 11 9 7 4 2-1-833-35-1zm-782 32-1 2 5 21 5 32 2 18 1 19v13l-1 22-3 26-5 20-8 25-8 19-12 22-12 18-10 14-11 12v2l-4 2-13 13-10 8-11 8-18 10-8 5-1 4 12 13 14 10 13 8 14 7 16 6 13 3 8 1h24l15-2 16-4 17-7 17-9 17-12 15-14 7-8 13-18 13-24 6-15 7-25 4-19 2-19v-27l-3-25-4-20-11-33-8-16-6-11-9-13-9-11-13-13-14-11-15-9-22-10-25-8zm909 96v385l1 136 9-1 29-5 10-1h29l26 3 17 3h7v-519l-1-1zm195 0-3 2v544l2 8 11 9 14 12 9 9 7 8 14 18 14 24 5 5 13 2 25 2h14v-643zm-1282 280-1 72v195l2 2 11-9 8-9 8-10 6-7v-2h2l9-11 5-6v-2h2l7-8 11-13 12-14 10-11 9-11 11-12 6-9 6-8 3-10 1-12v-29l-1-3-9-5-6-1-25-10-26-12-10-6-14-9-13-10-13-12-5-5-4-3zm-174 42-14 4-17 9-10 9-9 9-10 14-8 16-7 20-4 15-3 22v24l3 19 4 14 6 16 8 16 9 12 9 10 10 9 18 10 11 4 5 1h21l16-4 17-9 13-10 10-10 9-12 7-12 7-19 5-19 2-15v-25l-2-21-4-16-5-15-9-19-9-13-9-10-7-7-15-10-13-5-9-2zm1321 254-21 2-22 5-16 6-19 10-11 8-16 13-9 9-11 14-7 10-8 13-12 22-5 5-8-6-1-2h-2l-2-4-11-11-14-11-14-8-12-5-16-4-18-1-16 2-13 4-17 8-13 9-15 14-9 10-6 5-3-4h-2l-2-4-7-10-10-17-12-17-9-11-12-13-14-11-14-9-16-8-16-6-16-4-15-2h-31l-20 3-21 6-16 7-14 8-14 11-10 9-9 9-12 16-8 13-7 14-10 26-5 15-3 4-7-1-25-9-23-4h-14l-10 2h-7l-10-6-8-11-9-12-9-10-13-10-16-9-15-5-14-2h-21l-14 3-16 7-11 6-10 9-7 7-10 15-9 19-4 13-1 5v23l3 13 5 5 5 1 15 1h1240l24-1 17-2v-3l-9-9-14-10-19-14-16-9-23-9-19-5-16-2h-14l-18 2-21 5-10 4h-5l-5-7-8-20-13-28-12-19-8-10-11-12-10-9-15-10-14-8-20-8-20-5-27-3zm-1213 29-12 6-16 10-19 10-14 7-2 2v122l1 5 13 1h48l2-1 1-158z" />
                                                        <path transform="translate(997,1374)" d="m0 0h180l5 2 1 2 1 156v94l-4 3h-187l-2-2-1-32v-71l1-145 1-6zm62 64-4 1v123l1 5h62l1-1 1-118-1-7-1-1-11-1-27-1z" />
                                                        <path transform="translate(1116,414)" d="m0 0h64l3 2 1 3v249l-2 3h-124l-60-1-6-2-1-5-1-24v-190l1-29 1-3 3-1zm-60 65-1 2v125l18 1h45l1-1 1-67v-58l-1-1-8-1z" />
                                                        <path transform="translate(998,1054)" d="m0 0h178l6 1 1 2v252l-3 2h-181l-7-2-1-1-1-17v-86l1-144 2-6zm61 64-4 2v126l1 1h61l2-1 1-87v-35l-2-4-14-1-29-1z" />
                                                        <path transform="translate(1374,414)" d="m0 0h61l4 2v253l-1 1-14 1h-171l-5-2-1-1-1-24v-51l1-156 1-17 1-4 2-1zm-55 64-8 1v127l7 1h56l1-1 1-90v-33l-1-3-6-1-34-1z" />
                                                        <path transform="translate(998,734)" d="m0 0h40l143 1 2 2v252l-4 2h-151l-31-1-5-2-1-3-1-21v-75l1-147 2-7zm60 64-3 3v125l7 1h55l3-1v-125l-16-2-28-1z" />
                                                        <path transform="translate(533,862)" d="m0 0 9 1 2 3v59l-5 2h-53l-6-2-2-7v-30l1-20 2-4 6-1z" />
                                                        <path transform="translate(518,735)" d="m0 0h19l6 2 1 1v60l-4 1h-37l-21-1-3-2-1-5v-37l1-14 1-3 2-1z" />
                                                        <path transform="translate(486,607)" d="m0 0 52 1 5 3 1 4v54l-4 2h-19l-36-1-6-2-1-4v-35l1-18 1-3z" />
                                                        <path transform="translate(635,863)" d="m0 0h33l3 3 1 3v56l-1 1h-61l-3-2-1-22 1-33 2-5z" />
                                                        <path transform="translate(662,735)" d="m0 0 7 1 3 4v57l-1 1h-62l-2-2v-55l2-5z" />
                                                        <path transform="translate(744,607)" d="m0 0h48l6 2 1 3v56l-2 2-16 1h-43l-2-2-1-8v-21l1-27 1-5z" />
                                                        <path transform="translate(769,735)" d="m0 0h27l3 4v57l-3 2-24 1h-34l-2-2-1-5v-48l2-7 7-1z" />
                                                        <path transform="translate(785,990)" d="m0 0h9l4 2 1 2v58l-4 2h-56l-3-2-1-4v-48l2-7 4-1z" />
                                                        <path transform="translate(767,863)" d="m0 0h30l2 4v57l-2 2-34 1h-22l-5-2-1-10v-46l1-3 2-1z" />
                                                        <path transform="translate(609,608)" d="m0 0h54l6 2 2 1 1 57-2 2h-61l-2-2v-45l1-14z" />
                                                    </svg>
                                                </div>
                                                <div className="LabelInpInfo mt20">
                                                    <input onChange={e => setaddressObject(cu => ({ ...cu, zip: e.target.value }))} value={addressObject.zip} type="text" id="ZIP" name='ZIP' placeholder='' />
                                                    <label htmlFor="ZIP">Postal Code/ZIP Code</label>
                                                    <svg version="1.1" viewBox="0 0 2048 2048" className='iconeLabelInpinfo' xmlns="http://www.w3.org/2000/svg">
                                                        <path transform="translate(991,9)" d="m0 0h45l22 3 25 6 27 9 23 10 19 11 24 16 17 14 11 9v2l4 2 12 13 13 17 12 18 12 21 8 17 8 21 7 24 4 22 3 29v21l-2 20-5 29-6 22-7 19-11 25-14 26-11 19-14 22-5 8h70l546 1 35 2 24 4 19 6 17 7 16 8 24 16 11 9 12 11 11 12 13 18 14 24 8 17 12 30 2 7h2v1017l-3-1 1-3-2-1-2-5-11 32-8 17-15 24-9 12-9 11-17 17-17 13-16 10-15 8-22 9-22 6-23 4-22 2-18 1-574 2-24 2-21 5-12 5-11 7-14 11-9 9-14 19-14 22-10 17-13 20-22 36-15 24-9 13-9 10-8 5-6 2-12 1-3 1v-2l-9-2-9-6-9-10-7-10-14-22-15-24-13-21-18-30-16-24-13-17-14-14-15-10-16-8-16-5-17-3-15-1-74-1h-503l-29-2-23-3-20-5-18-6-18-8-20-12-12-9-13-11-7-6-7-8-8-8-12-16-8-13-12-23-11-26-5-14-2-2v-348l11-8 13-10 10-5h9l12 5 13 9 8 9 3 10 1 143v117l1 34 3 24 4 17 6 16 7 14 9 12 9 10 7 7 10 8 18 11 15 7 14 4 20 3 10 1 25 1h552l28 1 21 2 22 5 17 6 18 8 17 10 12 8 14 12 8 7 9 9 9 11 9 12 15 23 18 30 11 20 4 4h3l11-18 10-16 8-14 10-15 9-14 11-15 11-13 4-5 8-7 14-11 17-11 25-13 22-8 22-5 18-2 47-1 561-1 21-2 23-6 21-10 15-10 10-9 5-4 7-8 8-11 8-13 7-19 5-22 2-27v-903l-2-29-3-16-7-19-9-16-10-13-8-9-8-7-13-9-19-10-20-6-22-3-47-2h-610l-25 1-4 4-16 27-9 16-6 10-15 24-7 11-9 12-8 10h-2l-2 4-10 9-12 8-18 7-19 5-6 1h-20l-17-4-15-6-9-5-10-8-8-7-7-8-9-11-12-18-13-21-17-28-14-22-9-11h-429l-209 1-23 1-16 2-21 6-16 8-17 12-15 15-10 14-8 14-6 15-4 14-3 24-1 12-1 204-1 67-1 14-3 7-5 6-18 13-8 6-9-3-13-7-14-11-8-7v-341l3 1 3-9 11-28 9-19 12-20 10-13 8-10 9-10 8-7 14-11 15-10 18-10 26-10 23-6 24-3 20-1 71-1h525l-2-5-13-22-8-13-12-22-9-17-11-25-9-27-5-22-3-23-1-14v-29l3-24 6-27 11-32 15-31 12-19 12-17 11-13 7-8 17-17 11-9 12-9 22-14 14-8 22-10 30-10 26-5zm11 82-25 2-22 4-18 6-16 8-14 8-13 10-10 8-12 11v2h-2l-9 11-8 11-9 14-8 15-6 15-6 19-4 17-2 15-1 21 2 24 5 20 8 24 8 16 12 23 8 13 10 17 21 33 11 18 16 26 12 20 10 16 10 17 9 15 12 19 13 21 8 11 9 10 8 5 4 1 11-8 8-8 9-12 10-17 6-10 13-21 15-24 13-22 9-14 17-28 13-20 11-18 13-21 12-21 10-18 10-23 5-16 4-20 2-15v-38l-4-25-4-15-6-16-10-21-11-17-9-11-11-12-15-13-14-10-15-9-15-8-19-7-21-5-15-2-16-1zm1042 1564m-1 2 1 3z" />
                                                        <path transform="translate(880,1233)" d="m0 0h33l20 2 21 5 19 8 19 11 11 8 14 12 11 12 11 15 10 17 7 15 8 24 3 18v37l-4 23-5 16-7 17-9 16-10 14-10 11-6 7-22 18-16 9-19 8-20 6-27 4h-32l-24-4-17-5-20-9-15-10-9-7-12-11-8-8-11-14-10-15-12-25-7-23-3-18-1-12v-10l2-19 4-19 6-18 7-16 8-14 13-18 7-8h2l2-4 8-7 12-9 16-10 16-8 15-6 16-4zm6 80-15 3-16 8-9 6-14 14-10 17-6 15-2 8-1 10v17l3 14 7 16 10 15 9 10 15 10 15 7 13 3 8 1h9l16-2 15-5 17-9 10-8 8-8 9-13 6-14 3-15 1-14-1-14-4-15-6-14-7-10-9-10-14-11-14-7-14-4-7-1z" />
                                                        <path transform="translate(1185,1235)" d="m0 0h37l35 1 21 2 17 4 15 6 14 8 11 8 10 9 9 11 9 12 9 16 9 22 5 19 3 23v45l-2 17-5 22-6 16-12 23-10 14-9 11-8 7-11 9-14 8-19 7-14 4-19 3-31 2h-42l-21-2-8-4-5-4-6-9-5-12-3-16-1-14v-153l1-65 1-16 5-13 6-8 6-5 10-5 8-2zm39 80-4 2v159l2 5 5 2 11 1 20-2 14-5 13-7 10-10 6-12 5-16 2-9 1-9v-30l-3-17-7-20-6-11-9-10-12-7-8-2-19-2z" />
                                                        <path transform="translate(738,783)" d="m0 0h111l27 2 8 3 5 4 7 10 8 14 1 3v11l-4 10-14 23-11 17-13 21-8 12-7 10-13 21-14 21-18 28-15 22-11 15-4 7 25 1 50 1 31 2 9 3 9 8 6 10 4 9 1 10-2 10-6 11-8 9-4 5-7 2-22 1-96 1-65-1-18-2-7-5-11-15-5-11-1-9 3-10 6-12 24-36 11-17 7-11 10-15 18-28 15-23 21-32 10-15 7-14h-68l-23-1-16-3-7-8-6-9-7-16v-7l8-16 6-9 9-7 9-3 13-1z" />
                                                        <path transform="translate(543,1233)" d="m0 0h37l20 3 19 5 13 5 16 9 10 8 10 10 6 12v11l-3 12-8 11-13 11-10 7-6-1-45-18-16-4-17-1-16 2-14 5-14 8-10 9-7 7-10 17-5 13-3 14-1 19 3 17 5 14 10 15 11 12 14 10 15 7 12 3 7 1h15l14-3 16-8 17-12 11-8 10-4h11l10 3 10 6 10 10 6 10 1 3v11l-4 10-6 9-8 10-8 9-10 8-16 10-19 8-18 5-22 3h-29l-21-3-19-5-21-9-16-10-13-11-8-7-12-13-12-17-9-15-11-24-6-23-2-15v-29l4-23 6-20 5-12 9-17 7-11 8-10 9-11 13-12 16-11 18-10 20-8 15-4z" />
                                                        <path transform="translate(1222,783)" d="m0 0h51l26 3 18 5 17 8 16 12 8 7 11 14 9 14 8 20 3 14 1 11v14l-3 17-6 16-7 14-10 14-10 11-11 9-9 6-15 7-17 5-21 3-35 3-1 1v67l-2 13-6 12-11 11-9 4h-19l-13-4-11-8-7-11-2-11-1-17v-249l5-13 11-12 10-6 8-2zm28 80-4 3-1 4-1 17v27l2 10 4 3 10 2h11l17-4 10-6 7-8 4-8v-10l-4-11-6-8-7-6-7-3-19-2z" />
                                                        <path transform="translate(1531,1233)" d="m0 0h52l32 1 11 2 14 7 6 7 5 13 1 5v10l-4 13-6 9-13 9-11 3-8 1-63 2-1 25v17l7 1 53 3 14 2 11 7 7 7 5 13v19l-3 10-6 9-8 6-14 3-29 2-37 1 1 38 1 6 3 1 24 1 41 1 13 2 8 4 8 9 5 12 2 10v7l-4 13-6 8-8 7-10 5-9 1-29 1h-80l-14-2-8-3-11-10-4-9-3-12-1-11v-245l2-13 6-12 5-6 9-6 5-2 6-1z" />
                                                        <path transform="translate(1e3 165)" d="m0 0h18l21 3 14 4 17 8 14 10 18 18 12 18 9 20 4 15 1 7v32l-3 16-5 14-8 15-8 11-9 11-10 9-13 9-11 6-12 5-21 5-17 2h-10l-19-2-15-4-19-9-13-9-10-9-7-7-11-15-10-21-5-15-3-15-1-16 2-20 4-15 8-19 12-18 5-6h2l2-4 7-7 10-7 13-8 14-6 15-4zm3 80-12 4-9 6-9 10-3 13v11l3 12 6 9 7 6 10 4 7 2h12l11-4 8-5 5-5 6-9 3-10v-11l-4-12-6-8-9-8-8-4-4-1z" />
                                                        <path transform="translate(1020,785)" d="m0 0h20l9 3 12 8 7 8 3 8 1 7 1 65v123l-1 70-1 13-4 10-8 9-11 7-10 2h-9l-12-2-11-7-8-9-4-8-2-8-1-21v-163l1-78 2-11 4-8 8-9 11-8z" />
                                                        <path transform="translate(35,1112)" d="m0 0h9l11 4 9 6 10 11 4 7 1 4v15l-4 9-7 10h-2v2l-10 8-13 7h-2v-2l-8-1-16-9-10-9-7-6v-33l11-9 9-8 10-5z" />
                                                        <path transform="translate(992)" d="m0 0h44v1l-26 1h-14z" />
                                                        <path transform="translate(1035,2042)" d="m0 0" />
                                                        <path transform="translate(2,995)" d="m0 0" />
                                                    </svg>
                                                </div>
                                                <button disabled={!someThingChangedValue} className='bl  mt20  p10 br20 wmia' onClick={handelSubmitLogin} style={{ alignSelf: "end" }}>Save<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M200-120v-640q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v640L480-240 200-120Zm80-122 200-86 200 86v-518H280v518Zm0-518h400-400Z" /></svg></button>
                                            </div>
                                        </>
                                }
                            </div>
                        </>
                        : <div>
                            Error ! , No address
                        </div>
                }

            </>

        )
    }
}

export const BTN_OPEN_ADDRESS = ({ className, stl, stsvg }) => {
    const dispatch = useDispatch()
    const user = useSelector(st => st.authe.user);
    const { isVisible } = useSelector(st => st.addAddress);
    const navigate = useNavigate()
    const handelOpenAddAddress = () => {
        const deviceTypePc = window.innerWidth > 800
        if (deviceTypePc) {
            dispatch(showAddAddress())
        } else {
            dispatch(hideProfile())
            navigate('/add_address')
        }
    }
    return (
        <button className={`${className} r-c-c`} onClick={handelOpenAddAddress} style={stl}>
            Add new address
            <svg style={stsvg} version="1.1" viewBox="0 0 2048 2048" width="128" height="128" xmlns="http://www.w3.org/2000/svg">
                <path transform="translate(1010,191)" d="m0 0h27l43 2 37 3 39 5 33 6 43 10 28 8 36 13 23 10 26 12 24 12 24 14 20 13 16 11 19 14 16 13 11 9 17 16 12 11 7 8 9 12 8 15 3 10v15l-5 14-8 14-8 10-8 8-11 6-15 5-11 2-11-1-13-5-14-9-11-9-16-15-8-7-10-9-20-15-14-10-17-11-15-9-18-10-31-15-28-11-33-11-35-9-25-5-27-4-35-4-29-2-25-1h-19l-39 2-34 3-40 6-30 6-35 10-36 12-28 12-24 12-14 8-10 6-19 12-18 13-17 14-11 9-17 16-16 16-7 8-11 13-10 13-12 17-7 10-11 19-8 14-14 27-14 34-12 34-7 27-9 42-5 31-3 31-1 18v64l2 30 4 35 6 36 9 43 8 30 13 41 12 33 17 41 16 34 16 32 13 23 15 26 12 19 7 11 24 36 12 17 10 13 14 19 10 13 11 14 9 11 12 14 7 8 9 10 11 12 7 8 16 17 11 12 12 13 14 15 12 12 8 7 11 11 2 1v2l4 2 10 10 8 7 12 12 8 7 11 10 10 8 13 11 11 9 15 13 15 10 12 7 16 6 12 1h12l12-3 16-8 12-7 13-10 28-24 10-9 11-9 12-11 8-7 16-15 3-1v-2l8-7 4-4h2l2-4h2l1-3 8-7 8-9 8-7 12-13 4-4h2l2-4 14-14 7-8 11-12 1-2h2l2-4 8-8 9-11 13-15 11-13 11-14 10-13 10-12 12-16 10-13 16-24 7-10 7-11 8-12 16-25 9-15 11-19 14-26 16-32 14-31 12-29 9-24 11-27 7-14 9-10 5-5 14-8 13-4 7-1h9l13 2 14 6 13 10 11 14 6 12 4 13v14l-5 18-13 38-15 36-15 34-8 16-7 16-12 22-10 19-9 15-6 11-12 20-13 21-7 11-9 13-4 6-15 22-13 18-8 10-10 14h-2l-2 4-13 18-6 7-11 14-2 3h-2l-2 4-11 13-13 15-10 11-7 8-10 11-1 2h-2l-2 4-15 16-7 8-59 59h-2l-1 3-8 7-16 15-12 11-10 9-8 7-14 12-4 4h-2v2l-14 11-11 10-14 11-12 9-21 13-17 9-27 10-23 6-25 3h-26l-24-3-20-5-21-8-20-10-14-9-19-14-16-13-11-9-14-12-10-9-8-7-20-18-5-4v-2l-4-2-11-11-8-7-16-15-17-16-37-37-7-8-8-8-7-8-12-13-9-10-12-14-10-11-9-11-11-13-22-28-14-18-9-12-26-36-30-45-30-50-16-29-18-35-16-34-13-30-12-30-10-28-14-43-13-50-9-43-8-52-4-38-2-30-1-22v-32l2-37 5-49 6-38 9-41 10-37 12-35 15-37 18-38 9-16 8-13 6-11 22-33 8-11 11-14 11-12 8-10 16-17 29-29 8-7 13-11 10-8 19-14 13-9 20-13 29-17 12-7 19-9 15-7 29-12 44-15 33-9 43-9 38-6 38-4 32-2z" />
                <path transform="translate(1e3 490)" d="m0 0h36l25 2 26 4 25 6 17 5 20 8 24 11 25 14 19 13 12 9 13 11 10 9 12 11 7 8 10 11 11 14 12 17 15 25 12 25 10 25 8 24 6 29 3 19 2 22v40l-3 26-6 34-7 24-10 27-14 29-9 16-10 15-10 14-9 12-8 10-8 9-8 7-13 13-11 9-15 11-15 10-20 12-28 14-24 9-26 8-23 5-32 5-18 2h-37l-33-4-25-5-22-6-27-10-26-12-18-10-22-14-17-13-13-11-5-4-18-18v-2h-2l-7-8-11-13-14-19-12-19-9-16-14-30-8-22-8-28-5-24-4-29v-42l4-33 4-22 6-24 11-31 9-20 14-27 7-10 9-14 12-16 8-10 9-10 7-8 12-11 11-10 13-10 13-9 17-11 21-12 23-11 26-10 27-7 27-5 17-2zm11 129-25 2-22 4-17 5-23 10-17 10-16 11-13 11-6 5-7 8-8 8-8 10-9 13-9 16-9 19-7 19-5 19-3 20-1 12v22l3 24 4 19 8 23 8 18 10 18 10 14 11 14 17 17 14 11 10 7 15 9 19 9 11 5 25 7 24 4 12 1h28l22-3 27-7 21-8 23-12 18-12 11-9 10-9 13-13 10-13 6-8 9-15 9-19 9-27 5-25 2-17v-29l-2-19-5-23-5-16-11-25-10-18-10-14-9-11-9-10-10-10-13-10-15-10-16-9-19-9-25-8-20-4-22-2z" />
                <path transform="translate(1592,554)" d="m0 0h16l12 3 13 7 10 8 9 11 7 12 4 13 2 26v47h55l19 2 13 4 11 6 11 9 9 12 6 12 3 14v13l-3 12-9 17-11 13-8 6-8 4-14 4-15 2h-55l-3 1-2 67-2 11-6 12-8 12-9 10-11 7-14 6-7 2-11 1-16-4-12-7-13-12-10-11-8-14-2-7-1-8-1-62-2-4h-13l-16 1h-31l-15-2-14-7-11-8-12-12-8-14-4-12v-15l4-16 6-11 6-9 6-7 8-7 11-7 16-4 9-1h55l4-1 1-18 1-42 3-15 8-16 9-12 8-8 10-7 8-4z" />
            </svg>

        </button>
    )
}


