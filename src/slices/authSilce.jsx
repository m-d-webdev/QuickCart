import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { auth, db, GoogleProvider } from "../config/fireBase";
import { updateProfile, signOut, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, deleteUser, EmailAuthProvider, reauthenticateWithCredential, onAuthStateChanged, reauthenticateWithPopup } from "firebase/auth";
import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { showLogin } from "./loginSlice";
import ReactDom from 'react-dom'
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { showTenDone, LottieDone } from "./tenDoeneslice";
import { getUserCartsItems } from "./btnAddToCart";
export const signinwithpopup = createAsyncThunk('auth/signinwithpopup', async (_, { rejectWithValue, dispatch }) => {
    try {
        const userCreadentail = await signInWithPopup(auth, GoogleProvider);
        const res = await getDoc(doc(db, "users", userCreadentail.user.uid));
        if (!res.exists()) {
            await setDoc(doc(db, "users", userCreadentail.user.uid), {});
        }
        dispatch(getUserCartsItems());
        dispatch(showTenDone([, "You have successfully signed in with Google. Enjoy your experience!"]))
        return { id: userCreadentail.user.uid, name: userCreadentail.user.displayName, image: userCreadentail.user.photoURL };
    } catch (er) {
        dispatch(showTenDone([false, "Sign-in failed. Please try again or check your Google account credentials."]))
        return rejectWithValue(er.message)
    }
})

export const loginUser = createAsyncThunk('auth/loginUser', async ({ email, password }, { rejectWithValue, dispatch }) => {
    try {
        const userCreadentail = await signInWithEmailAndPassword(auth, email, password);
        dispatch(showTenDone([, "Welcome back! You have successfully signed in with your email and password."]))
        dispatch(getUserCartsItems());
        return { id: userCreadentail.user.uid, name: userCreadentail.user.displayName, image: userCreadentail.user.photoURL };
    } catch (error) {
        dispatch(showTenDone([false, "Login  failed. Please check your email and password and try again."]))
        return rejectWithValue(error.message);
    }
})

export const resetPasseord = createAsyncThunk(
    "auth/resetPasseord",
    async (email, { rejectWithValue, dispatch }) => {
        try {
            await sendPasswordResetEmail(auth, email);
            dispatch(showTenDone([, 'Password reset email has been sent.']))
            return true;
        } catch (error) {
            return rejectWithValue(error.message);
        }

    }
)

export const registerUser = createAsyncThunk(
    "auth/registerUser",
    async ({ email, password, displayName }, { rejectWithValue, dispatch }) => {
        try {
            const userCre = await createUserWithEmailAndPassword(auth, email, password);
            const Newuser = userCre.user;
            return updateProfile(Newuser, {
                displayName: displayName,
                photoURL: "https://i.pinimg.com/736x/3b/de/a5/3bdea5f546bb0eae992501ddbbb71394.jpg"
            }).then(async () => {
                await setDoc(doc(db, "users", Newuser.uid), {});
                dispatch(showTenDone([, "Your account has been created successfully! Welcome aboard."]))
                return { id: Newuser.uid, name: displayName, image: "https://i.pinimg.com/736x/3b/de/a5/3bdea5f546bb0eae992501ddbbb71394.jpg" };
            }).catch(error => {
                return rejectWithValue(error.message)
            })
        } catch (error) {
            return rejectWithValue(error.message)
        }
    });
// 
export const updateUserInfo = createAsyncThunk(
    'authe/updateUserInfo', async (newOb, { rejectWithValue, dispatch }) => {
        try {
            await updateProfile(auth.currentUser, newOb);
            dispatch(showTenDone([, "Your Informations updated succesfully"]))
            return newOb.displayName
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

// -----
export const ReauthentcateUser = createAsyncThunk(
    "authe/ReauthentcateUser",
    async (password, { dispatch, rejectWithValue, getState }) => {
        try {
            if (auth.currentUser) {
                let userEmail = getState().authe.user.email;
                let ProviderType = auth.currentUser.providerData[0]?.providerId
                if (ProviderType == "password") {
                    const credential = EmailAuthProvider.credential(userEmail, password);
                    await reauthenticateWithCredential(auth.currentUser, credential);
                    dispatch(showTenDone([, 'Authentication Successfully']))
                } else if (ProviderType == "google.com") {
                    await reauthenticateWithPopup(auth.currentUser, GoogleProvider)
                    dispatch(showTenDone([, 'Authentication Successfully']))
                }
            } else {
                dispatch(showTenDone([false, 'Authentication failed']))
                return rejectWithValue("No user Founded")

            }
        } catch (error) {
            console.log(error.message);
            dispatch(showTenDone([false, 'Authentication failed']))
            return rejectWithValue(error.message)

        }

    })
export const DeleteUserAccount = createAsyncThunk(
    "authe/DeleteUserAccount",
    async (_, { rejectWithValue, dispatch }) => {
        try {
            return await deleteDoc(doc(db, "users", localStorage.getItem("userId"))).then(async () => {
                await deleteDoc(doc(db, "cards", localStorage.getItem("userId"))).then(async () => {
                    await deleteDoc(doc(db, "orders", localStorage.getItem("userId"))).then(async () => {
                        await deleteUser(auth.currentUser)
                        dispatch(showTenDone([, "Your account has been deleted successfully"]))
                        return true;
                    })

                })
            })
        } catch (e) {
            console.log(e);
            dispatch(showTenDone([false, "Failed to  deleted your account"]))
            return rejectWithValue(e.message)

        }
    }
)

export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async () => {
        try {
            await signOut(auth);
            return true
        } catch (error) {
            return error.message
        }
        ;
    }
)

const authSilce = createSlice({
    name: "authe",
    initialState: {
        user: null,
        isLoggedIn: false,
        isRegistersuc: false,
        isLoadingAuth: false,
        errorAuth: null,
        ResendMessageSent: false,
        editPicVSBL: false,
        updatedSuccess: false,
        // -------------
        isAuthentifated: false,
        ReauthentCmpVSBL: false,
        iSReauthenticating: false,
        iSdelettingAccount: false,
    },
    reducers: {
        intialeAuth: (state, action) => {
            state.isLoggedIn = true
            state.user = action.payload
        },
        reinitialState: (state) => {
            state.errorAuth = null

        },
        showEditPrfPic: (state) => {
            state.editPicVSBL = true;

        },
        hideEditPrfPic: (state) => {
            state.editPicVSBL = false;
        },
        showReauthentCmp: (state) => {
            state.ReauthentCmpVSBL = true
        },
        hideReauthentCmp: (state) => {
            state.ReauthentCmpVSBL = false
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(signinwithpopup.fulfilled, (state, action) => {
                state.user = action.payload
                state.isLoggedIn = true
                state.isRegistersuc = true;
            })
            // -----------

            .addCase(loginUser.pending, (state) => {
                state.isLoadingAuth = true;
                state.errorAuth = null;
            })

            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoadingAuth = false;
                state.user = action.payload;
                state.isRegistersuc = true;
                state.isLoggedIn = true
            })

            .addCase(loginUser.rejected, (state, action) => {
                state.isLoadingAuth = false;
                state.isLoggedIn = false;
                state.errorAuth = action.payload;
            })

            // --------------

            .addCase(resetPasseord.pending, (state) => {
                state.isLoadingAuth = true;
                state.ResendMessageSent = false;
            })
            .addCase(resetPasseord.fulfilled, (state) => {
                state.isLoadingAuth = false;
                state.ResendMessageSent = true;
            })
            .addCase(resetPasseord.rejected, (state, action) => {
                state.isLoadingAuth = false;
                state.ResendMessageSent = false;
                state.errorAuth = action.payload;
            })
            // -------- 
            .addCase(registerUser.pending, (state) => {
                state.isLoadingAuth = true;
                state.errorAuth = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.isLoadingAuth = false;
                state.isLoggedIn = true;
                state.isRegistersuc = true;
                state.user = action.payload;
            })

            .addCase(registerUser.rejected, (state, action) => {
                state.isLoadingAuth = false;
                state.isLoggedIn = false;
                state.errorAuth = action.payload;
            })
            //  ---------------
            .addCase(updateUserInfo.pending, (state) => {
                state.isLoadingAuth = true;
            })
            .addCase(updateUserInfo.fulfilled, (state, action) => {
                state.isLoadingAuth = false;
                state.updatedSuccess = true;
                state.user = { ...state.user, name: action.payload }
            })
            .addCase(updateUserInfo.rejected, (state, action) => {
                state.isLoadingAuth = false;
                state.updatedSuccess = true;
            })
            // -------------

            // ===================
            .addCase(logoutUser.fulfilled, (state) => {
                state.isLoadingAuth = false;
                state.isLoggedIn = false;
                state.user = null;
                state.ResendMessageSent = false
                state.isRegistersuc = false;
                localStorage.removeItem('userId');
                window.location.href = "/"
            })
            // -----------
            .addCase(ReauthentcateUser.pending, (state) => {
                state.iSReauthenticating = true;
            })
            .addCase(ReauthentcateUser.fulfilled, (state, action) => {
                state.isAuthentifated = true;
                state.iSReauthenticating = false;
            })

            .addCase(ReauthentcateUser.rejected, (state, action) => {
                state.isAuthentifated = false;
                state.iSReauthenticating = false;
            })

            // -----------
            .addCase(DeleteUserAccount.pending, (state) => {
                state.iSdelettingAccount = true;
            })
            .addCase(DeleteUserAccount.rejected, (state, action) => {
                state.iSdelettingAccount = false;
            })

            .addCase(DeleteUserAccount.fulfilled, (state) => {
                state.iSdelettingAccount = false;
                state.isLoggedIn = false;
                state.user = null;
                state.ReauthentCmpVSBL = false
                state.isRegistersuc = false;
                localStorage.clear();
                setTimeout(() => {
                    window.location.href = "/home"
                }, 500)
            })


    }
})






export const { intialeAuth, reinitialState, showEditPrfPic, hideEditPrfPic, showReauthentCmp, hideReauthentCmp } = authSilce.actions;
export default authSilce.reducer;




export const EditProfilePicture = () => {
    const dispatch = useDispatch()
    return ReactDom.createPortal(
        <div className="backendMer">
            <div className="c-c-c activeCmp bg-l p20 w500 h500 br10">
                <h1 className="logo" style={{ textAlign: "center" }}>
                    We're sorry! We couldn't update your profile picture due to a database error. Please try again later.
                </h1>
                <button className="bl w100 mt50" onClick={() => dispatch(hideEditPrfPic())}>Ok </button>
            </div>
        </div>, document.getElementById("portlas")
    )
}

export const Reauthenticate = () => {
    let ProviderType = auth.currentUser.providerData[0]?.providerId
    const dispatch = useDispatch();
    const [password, setPassword] = useState("");
    const { iSdelettingAccount, iSReauthenticating, isAuthentifated } = useSelector(s => s.authe)
    const SendPasswordToRea = () => {
        if (ProviderType == "password") {
            if (password.length >= 6) {
                dispatch(ReauthentcateUser(password))
            }
        } else {
            if (ProviderType == 'google.com') {
                dispatch(ReauthentcateUser())
            }
        }
    }
    return ReactDom.createPortal(
        <div className="backendMer">
            <div className="CNT_COFIRM_PASS c-p-c activeCmp p20 w600 psr h400 br20 bg-l">

                {
                    iSdelettingAccount || iSReauthenticating ? <div className="c-c-c">
                        {
                            iSdelettingAccount ? <><div className="spinner"></div> <h1 className="mt50">Deleting Account</h1> </>
                                : <><div className="spinner"></div> <h1 className="mt50">Reauthenticating</h1> </>
                        }
                    </div>
                        :
                        <>
                            <button className="btnClose   hoverEff2" onClick={() => dispatch(hideReauthentCmp())}>Close <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" /></svg> </button>
                            {
                                isAuthentifated ?
                                    <>
                                        <LottieDone />
                                        <h1 className="mt20">Authentication Successfully</h1>
                                        <p className="mt50">This action cannot be undone. Are you sure you want to proceed ? , You may lose all your data on this website, including your personal information, addresses, payment methods, order history, and other details.</p>
                                        <button className="bg-r mt50 w300 p10 r-c-c" onClick={() => { dispatch(DeleteUserAccount()) }} >
                                            Delete  Account <svg style={{ fill: "#fff" }} xmlns="http://www.w3.org/2000/svg" className="ml10" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" /></svg>
                                        </button>
                                    </>
                                    :
                                    <>
                                        <h1 className='r-s-c wmia pb20 mb20' style={{ borderBottom: "solid 1px var(--border-color)" }}>Reauthentication</h1>

                                        <p className="mt20">To delete your account, you need to reauthenticate.</p>
                                        {ProviderType == "password" &&
                                            <>
                                                <p className="mt20"> Please log in again or re-enter your credentials to proceed.</p>
                                                <div className="LabelInpInfo mt50 mb50">
                                                    <input type="password" onChange={e => setPassword(e.target.value)} name="password" id="password" placeholder="" />
                                                    <label htmlFor="password">enter your password </label>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="iconeLabelInpinfo" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm240-120q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z" /></svg>
                                                </div>
                                            </>
                                        }
                                        <button className="bl  w300 p10 r-c-c" onClick={() => { SendPasswordToRea() }} >
                                            Authenticate
                                            <svg version="1.1" viewBox="0 0 2048 2048" style={{ fill: "#fff" }} xmlns="http://www.w3.org/2000/svg">
                                                <path transform="translate(972,459)" d="m0 0h35l27 3 25 5 24 7 20 8 23 11 27 16 19 14 14 12 13 12 13 16 10 14 8 13 10 18 8 19 10 30 5 25 3 32-1 19-3 29-4 20-8 25-8 24-9 21-9 20-9 17-8 16-10 17-6 11-14 24-8 11-11 16-15 22-8 10-6 8-11 13-9 11-12 14-8 10-16 16-14 11-9 4-9-1-12-6-10-8-7-6-7-10-4-7-1-2 8-21 10-18 6-8 9-14 12-17 7-11 4-5 24-36 11-16 13-20 10-17 5-7 6-11 13-24 13-28 12-33 5-22 3-19v-44l-5-26-7-19-10-18-10-14-12-13-11-11-18-13-17-10-23-11-26-8-22-4-10-1h-38l-24 4-20 6-19 8-21 13-14 10-12 11-7 6-6 7h-2l-2 4-9 11-10 15-15 26-14 27-9 17-7 12-10 16-20 30-10 13-12 14-18 20-7 8-10 10-8 7-12 11-11 9-7 6-13 10-11 8-27 18-25 15-27 15-23 12-28 13-26 11-23 9-29 11-40 13-25 6-7 1h-8l-9-3-10-9-7-10-4-10-1-4v-17l2-8 7-8 11-8 12-6 106-43 36-16 26-13 22-12 21-13 20-13 10-7 12-9 11-9 16-13 7-7 8-7 17-17 9-11 8-9 10-13 14-19 10-16 13-22 9-17 21-42 14-23 10-14 9-12h2l2-4 17-17 11-9 12-9 18-11 16-9 17-8 18-7 23-6 21-4 26-3z" />
                                                <path transform="translate(1131,68)" d="m0 0h9l19 4 42 11 40 12 30 11 16 6 13 5 20 8 28 13 19 9 19 10 24 14 17 11 19 12 18 13 16 13 10 8 16 13 8 8 8 7 18 18 7 8 7 7 9 11 13 16 13 19 10 14 9 15 8 14 10 18 8 15 13 29 11 28 11 34 9 34 8 43 4 28 3 37 1 21v63l-3 60-4 39-8 53-8 54-6 33-2 19v10l2 18 7 16 7 12 9 10 12 11 13 9 16 12 10 9 4 7 1 2v15l-4 10-7 11-11 11-6 3-6 1h-12l-15-3-15-5-16-8-11-7-15-14-8-8-11-15-8-14-8-17-5-13-4-15-4-22-1-10v-24l7-50 9-57 5-30 8-69 3-39 1-29v-20l-2-39-4-39-6-34-6-25-9-31-6-18-14-34-8-16-12-23-14-23-13-19-11-15-13-16-14-15-22-22-8-7-13-11-14-11-17-13-22-15-19-12-19-11-22-12-22-11-20-9-30-12-36-12-56-17-24-8-17-8-9-7-6-7-4-10v-10l4-16 5-9 9-10 9-6z" />
                                                <path transform="translate(984,251)" d="m0 0h35l30 2 33 4 34 6 24 6 26 8 27 10 20 9 23 11 22 12 23 14 36 26 13 10 10 9 8 7 12 11 17 17 9 11 11 14 7 10 9 15 8 15 7 18 2 12-3 16-6 11-8 9-8 7-7 7-3 2-6-1-8-6-7-7-9-11-9-10-9-11-10-11-9-11-8-8-7-8-29-29-8-7-13-11-14-11-18-13-15-9-22-12-21-10-23-9-27-9-33-8-24-4-42-4h-54l-32 3-30 5-26 6-26 8-25 9-25 11-22 11-15 9-30 20-13 10-11 9-13 11-15 14-14 11-16 11-10 5-6 2-9-1-12-6-13-12-11-15-2-4 1-7 11-19 8-10 9-10 7-8h2l2-4 8-7 11-11 8-7 17-14 12-9 28-20 18-11 27-15 16-8 29-13 19-7 26-8 33-8 42-6 36-3z" />
                                                <path transform="translate(985,693)" d="m0 0h15l10 3 9 5 8 9 4 10v15l-3 12-10 24-8 17-10 19-8 14-9 15-11 18-8 12-7 9-12 16-13 17-11 14-11 12-7 8-10 10-7 8-7 6-1 2h-2v2h-2v2l-8 7-6 6h-2l-1 3-8 7-10 9-10 8-10 9-11 8-16 12-14 10-17 12-22 14-13 8-18 11-46 25-16 8-27 13-23 10-31 13-36 14-47 16-33 11-50 16-21 6-14 3h-10l-8-4-10-15-7-18-1-7 5-15 6-9 16-12 17-9 29-12 46-17 29-10 37-13 29-11 22-9 31-13 35-17 22-12 23-13 19-12 28-19 13-10 12-9 14-11 11-9 11-10 8-7 15-14 17-17 3-4h2v-2l5-4 9-11 7-7 8-10 14-17 27-36 7-11 7-10 11-17 6-10 15-26 7-11 13-16 8-6z" />
                                                <path transform="translate(1435,667)" d="m0 0h17l13 4 9 7 7 9 5 11 3 13 1 17-4 45-8 70-5 40-9 100-4 38v40l4 26 7 25 5 12 7 13 11 17 11 13 1 3h2l6 7 11 9 7 6 23 15 28 15 29 12 21 8 38 15 17 8 10 9 6 10 3 10v10l-4 14-8 16-6 8-5 3-18-3-23-6-31-9-38-14-28-12-16-7-22-12-14-8-16-11-13-10-15-13-16-16-9-11-10-13-13-21-8-16-6-14-8-25-5-22-4-31-1-14v-21l4-88 3-48 4-41 5-36 5-35 9-69 5-24 4-12 5-8 12-6z" />
                                                <path transform="translate(1027,1360)" d="m0 0 18 1 15 4 17 7 14 8 11 8 14 11 20 15 15 9 25 17 18 13 8 7v2h2l9 11 8 16 2 6v8l-4 13-6 10-9 8-16 10-5 2h-6l-4-3-15-6-19-10-13-8-11-7-34-24-19-11-16-7-9-2-15-1-16 2-20 5-31 11-33 14-50 21-25 11-20 8-26 11-17 7-13 6-20 8-28 12-26 11-30 13-41 17-29 12-32 13-27 10-21 5h-13l-10-4-7-7-8-14-4-16 1-13 3-10 7-8 14-9 26-10 17-5 30-10 29-9 38-13 81-32 25-11 25-12 23-11 33-16 22-11 14-8 50-28 27-15 22-12 21-10 21-7 11-2z" />
                                                <path transform="translate(898,51)" d="m0 0h35l17 3 14 7 9 10 5 10 2 9v19l-4 11-8 9-9 4-21 5-56 8-40 7-37 8-29 8-30 10-31 12-22 10-19 10-14 8-20 12-14 10-9 7-14 11-11 9-14 12-8 8-8 7-15 15-7 8-7 7-9 11-4 5h-2l-2 4-13 16-11 14-11 13-24 28-11 12-9 10-9 8-7 3h-8l-15-6-11-8-8-8-4-10 1-10 11-28 15-29 9-15 15-23 12-17 10-13 12-14 9-10 7-8 26-26 11-9 14-12 20-15 27-18 16-10 25-14 36-19 25-11 31-13 29-11 44-15 32-9 27-7 34-7z" />
                                                <path transform="translate(884,1155)" d="m0 0h8l19 4 19 9 9 7 6 8 2 5-1 7-6 10-9 10-17 17-8 7-15 12-12 8-10 7-27 18-20 12-25 14-26 14-16 8-47 23-29 14-35 15-20 8-16 6-25 9-37 13-22 7-33 10-37 9-5 1h-20l-15-4-15-8-8-8-5-9 1-7 4-8 4-5 4-7 14-14 18-11 16-8 19-8 37-13 29-10 27-10 17-6 35-13 30-12 29-12 23-10 16-8 23-12 14-8 22-13 19-12 33-22 14-10 16-10 16-8 12-5z" />
                                                <path transform="translate(1014,1616)" d="m0 0 22 2 15 3 16 5 20 8 26 13 16 9 24 13 22 12 29 15 34 17 28 13 31 15 45 21 35 17 17 9 11 9 8 10 4 9 1 4v8l-4 12-7 13-8 11-5 4-12 3-16-4-18-6-33-15-33-16-45-22-64-32-23-11-19-10-42-21-17-8-28-11-19-5-6-1h-19l-13 2-16 5-34 15-11 5-6 2-12-5-12-9-8-9-6-12 1-11 5-14 9-14 9-9 14-10 16-9 14-7 22-8 22-4z" />
                                                <path transform="translate(1197,1169)" d="m0 0h10l10 3 11 7 12 12 11 14 14 19 13 18 11 13 7 8 14 15 12 12 8 7 15 13 11 9 19 14 21 14 11 7 19 11 22 12 16 8 33 16 24 10 20 8 42 18 16 8 19 10 10 8 8 8 7 11 3 8v9l-3 9-7 11-14 15-11 6h-11l-9-2-31-12-19-8-15-7-40-18-33-15-19-9-22-12-20-12-24-16-12-9-13-10-14-11-13-11-11-9-10-10-8-7-7-7-2-1v-2l-4-2-41-41-8-7-34-34-7-8-12-15-6-10-6-15-1-3v-12l7-17 8-9 8-5z" />
                                                <path transform="translate(1e3 1849)" d="m0 0h16l21 3 25 6 33 11 27 12 21 10 16 10 14 11 7 6 10 13 5 10 2 8v14l-3 9-7 11-13 13-6 3-9-2-28-11-25-11-41-17-15-5-20-5-18-2h-19l-25 5-17 7-17 9-19 11-19 8-12 4h-11l-13-3-13-7-8-7-7-10-2-4v-16l3-9 10-14 7-6 10-7 18-10 23-12 36-18 21-8 19-6 16-3z" />
                                                <path transform="translate(529,584)" d="m0 0h9l10 6 8 11 7 16 3 9v13l-4 12-8 15-7 9-10 13-8 7-12 10-15 11-14 9-22 12-16 8-19 9-24 10-35 12-12 3h-8l-10-4-12-11-8-13-2-5v-14l6-12 8-9h2l2-4 8-7 20-11 26-12 24-12 18-12 9-7 13-12 14-15 7-8 16-12 11-6 10-4z" />
                                                <path transform="translate(1346,1554)" d="m0 0 10 1 22 6 36 12 36 13 26 11 25 12 14 8 18 13 15 15 4 7 1 4v13l-2 9-6 10-7 7-11 8-5 4h-9l-10-4-17-5-22-8-29-11-43-18-38-17-16-8-11-7-9-9-5-8-1-3v-7l5-15 11-18 10-10z" />
                                                <path transform="translate(716,1735)" d="m0 0h22l11 3 12 6 10 9 8 9 4 9v8l-4 8-8 9h-2v2h-2v2h-2l-2 4-14 11-16 8-20 9-24 7-20 5-6 1h-11l-11-4-10-9-6-10-2-5v-14l3-10 10-16 9-9 15-11 23-12 24-8z" />
                                            </svg>

                                        </button>
                                    </>
                            }

                        </>
                }
            </div>

        </div>, document.getElementById("portlas")
    )
}