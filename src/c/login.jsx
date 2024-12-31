import { useState, useEffect, useRef } from 'react'
import ReactDom from "react-dom"
import { useSelector, useDispatch } from 'react-redux';
import { hideLogin } from '../slices/loginSlice';
import { loginUser, reinitialState, resetPasseord } from '../slices/authSilce';
import { showRegister } from '../slices/registerSlice';
import { useNavigate } from 'react-router-dom';
function Login() {
    const displatch = useDispatch();
    const [passRestEmailShowing, setpassRestEmailShowing] = useState(false)
    const loginElemRef = useRef();
    const InpRef = useRef();
    const { isLoggedIn, isLoadingAuth, errorAuth, ResendMessageSent } = useSelector(st => st.authe);
    const [allFieledAddes, setallFieledAddes] = useState(false)
    const [credentialt, setCeredential] = useState({
        email: "", password: ""
    })
    const deviceTypePc = window.innerWidth > 800

    const navigate = useNavigate()
    useEffect(() => {
        displatch(reinitialState())
        InpRef.current?.focus()
    }, [])
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    useEffect(() => {
        if (isLoggedIn) {
            if (deviceTypePc) {
                displatch(hideLogin())
            } else {
                navigate(-1)
            }
        }
    }, [isLoadingAuth])

    const handelSubmitLoginForm = (e) => {
        displatch(loginUser(credentialt))
    }

    useEffect(() => {
        (emailRegex.test(credentialt.email) && credentialt.password.length >= 6) ? setallFieledAddes(true) : setallFieledAddes(false)
    }, [credentialt])

    const ResetPasswordComp = () => {
        const [emailToRePas, setemailToRePas] = useState("");
        const [isEmailValide, setisEmailValide] = useState(false)
        const handelSendResetPas = (e) => {
            e.preventDefault();
            if (emailToRePas != "") {
                displatch(resetPasseord(emailToRePas))
            }
        }

        useEffect(() => {
            setisEmailValide(emailRegex.test(emailToRePas))
        }, [emailToRePas])
        return ReactDom.createPortal(
            <div className='backendMer' ref={loginElemRef}>
                <form onSubmit={handelSendResetPas} style={{ position: "relative" }} className="activeCmp  c-p-c w600 h300 br10 bg-l p15">
                    {isLoadingAuth ? <div className="loader"></div>
                        : <>
                            <span className='btnClose' onClick={() => setpassRestEmailShowing(false)}><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" /></svg></span>
                            <h1 className='r-s-c wmia pb20 mb20' style={{ borderBottom: "solid 1px var(--border-color)" }}>
                                <svg version="1.1" viewBox="0 0 2048 2048" className='mr10 w30 h30' xmlns="http://www.w3.org/2000/svg">
                                    <path transform="translate(1016,439)" d="m0 0 36 1 36 4 23 5 25 7 20 7 18 8 19 9 24 14 15 10 18 13 22 18v2l4 2 16 16 7 8 11 13 10 13 10 15 10 16 8 14 11 22 11 28 6 18 7 27 4 21 3 26 1 15 1 65 5 5 16 10 12 9 15 14 7 8 11 15 10 18 8 19 5 15 2 9 1 11v388l-1 25-2 17-5 19-10 23-8 14-10 14-8 10-12 12-14 11-18 11-25 10-17 4-25 3-21 1h-583l-23-2-21-4-20-7-21-11-16-12-12-11-12-13-11-16-10-17-7-16-6-21-3-17-1-13-1-39v-305l1-51 2-19 4-15 10-25 8-14 7-11 9-12 11-12 11-10 18-12 13-8v-70l2-23 5-30 7-27 12-36 12-27 10-18 11-19 6-8 9-13 10-13 10-12 7-8 23-23 28-22 17-12 16-10 24-13 22-10 28-10 28-7 22-4 26-3zm-14 121-29 4-19 5-21 7-29 14-14 9-18 13-14 12-12 11-7 8-11 13-10 15-10 17-8 15-9 21-7 21-5 25-2 19-2 49 1 2 6 1 28 1h451l10-3v-12l-1-29-2-23-6-31-5-17-12-28-12-22-9-14-12-16-14-15-8-8-14-11-18-13-23-13-14-7-20-8-17-5-26-5-18-2zm-212 402-63 1-14 2-12 5-10 9-5 10-2 13-1 21v365l3 14 6 12 5 5 8 6 12 4 13 2 28 1h549l21-2 12-5 11-7 6-7 3-7 2-12 1-12 1-175v-191l-2-16-4-12-6-10-7-6-8-4-9-2-10-1-66-1z" />
                                    <path transform="translate(693)" d="m0 0h48v4l16 9 19 11 22 13 15 9 26 16 22 13 26 16 14 9 12 9 7 7 7 11 5 12 3 12v9l-3 12-10 21-12 22-15 28-14 24-12 22-10 17-15 26-11 18-10 12-12 6-20 7h-14l-13-3-16-8-11-11-6-10-7-18-1-4v-9l3-14 5-13 8-15 6-9 1-2-2-1 3-5-8 1-19 7-35 15-32 15-18 10-12 6-15 9-18 11-20 13-15 10-11 8-18 13-10 9-9 7-13 11-11 9-16 15-7 7-8 7-22 22-7 8-8 8-7 8-10 12-11 14-9 12-12 15-8 11-9 13-10 15-8 13-11 17-14 25-12 22-15 31-11 26-13 34-14 41-12 42-6 25-7 40-7 46-3 37-1 22v58l2 37 3 30 5 33 9 48 8 33 11 37 10 30 13 33 11 26 16 34 16 30 16 27 7 11 22 33 13 18 14 18 13 16 9 11 12 13 18 20 15 15v2l4 2 14 14 11 9 8 8 8 7 12 10 10 8 17 13 16 12 21 14 18 11 9 6 21 13 38 20 26 13 38 16 30 12 43 14 29 8 59 14 17 5 13 7 7 6 9 12 5 11 4 14v10l-4 13-8 16-11 12-10 8-8 3-7 2h-22l-45-8-33-8-35-10-46-15-26-10-32-13-29-13-19-10-16-8-19-10-24-14-14-9-22-14-12-8-15-11-19-14-13-10-14-11-13-11-11-9-15-14-8-7-3-2v-2l-4-2-37-37-7-8-12-13v-2h-2l-9-11-10-11-9-11-11-14-14-18-14-20-22-33-10-16-11-18-14-25-15-29-15-31-13-31-14-36-12-35-14-49-7-30-7-33-8-49-4-32-3-42-1-19v-67l3-45 3-27 9-60 7-35 15-60 13-41 9-24 6-17 11-26 13-29 10-21 10-19 16-30 14-23 10-16 7-10 11-17 12-17 9-12 11-14 12-15 10-13 11-13 7-9h2l2-4 13-14 1-2h2l2-4 36-36 8-7 13-12 11-9 13-11 14-11 15-12 19-14 16-11 18-12 17-11 18-11 16-10 24-13 38-20 24-11 24-10 21-8 24-7 2-2-7-6-13-8-14-10-7-7-8-11-8-16-2-7v-17l4-13 6-10 10-13 14-10z" />
                                    <path transform="translate(1159,95)" d="m0 0h18l32 5 35 7 30 8 34 10 41 14 30 12 29 12 15 7 40 20 22 12 20 12 16 10 25 16 13 9 14 10 19 14 16 13 13 10 13 11 14 12 4 3v2l4 2 32 30 8 8 7 8 7 7 7 8 7 7 7 8 9 10 11 14 10 12 10 13 8 11 13 18 15 22 11 17 13 21 9 16 10 18 12 23 12 24 13 29 11 27 11 30 11 33 9 30 9 36 9 41 6 38 6 47 3 37 1 23v65l-2 38-3 32-10 67-7 34-10 42-18 58-7 20-11 29-15 35-15 31-8 16-12 23-15 26-9 14-10 16-10 15-10 14-8 12-9 12-13 16-7 9-13 16-1 2h-2l-2 4-12 14-22 24-28 28-8 7-12 12-11 9-14 12-14 11-11 9-9 7-28 21-33 22-22 14-26 15-16 9-35 18-29 14-28 12-48 16 12 10 16 10 11 9 7 7 8 13 4 8 3 11v15l-4 13-6 11-8 10-8 7-11 6-2 3 8-1-2 4h-45l-10-7-17-10-26-15-23-14-22-13-16-10-25-15-23-14-13-10-10-9-7-8-4-9-5-19v-7l4-15 10-21 13-23 12-21 14-25 12-22 6-10 26-46 9-13 10-10 14-7 14-3h17l13 4 12 6 12 11 8 14 4 11 1 6v9l-2 13-6 16-16 33h3l15-5 20-9 36-16 30-15 23-13 29-17 25-16 13-9 14-10 16-12 16-13 11-9 14-12 11-9 17-16 27-27 7-8 8-8 9-11 11-13 14-18 20-26 8-11 6-9 24-38 12-21 10-19 12-23 14-31 14-35 7-20 11-33 13-48 10-50 7-46 3-28 2-36v-64l-3-44-6-48-6-36-9-39-8-29-9-30-13-35-6-16-13-31-20-41-12-22-12-21-15-24-10-15-11-16-24-32-11-14-9-10-9-11-9-9-7-8-39-39-8-7-13-12-11-9-12-10-32-24-25-17-22-14-28-17-26-14-31-16-31-14-41-16-40-13-29-8-24-6-49-11-12-4-9-6-9-9-9-14-6-15-2-7v-8l7-21 8-11 8-9 16-11z" />
                                    <path transform="translate(1013,1095)" d="m0 0h18l16 5 10 6 9 7v2h2l9 13 5 13 2 14 1 35v37l-1 17-3 12-6 12-11 14-11 9-12 5-10 2h-17l-12-3-12-7-10-9-6-7-7-14-4-14-1-10v-78l3-16 4-10 7-12 8-8 13-9 12-5z" />
                                    <path transform="translate(744)" d="m0 0 3 1-3 1z" />
                                    <path transform="translate(744,253)" d="m0 0h2l-1 2z" />
                                    <path transform="translate(1310,2047)" d="m0 0 2 1z" />
                                    <path transform="translate(748)" d="m0 0 2 1z" />
                                </svg>
                                Reset  password
                            </h1>
                            <p>    Eneter Your email for reset the password</p>
                            <div className="LabelInpInfo">
                                <input type="text" id="Email" className={!emailRegex.test(emailToRePas) ? 'inpError' : ""} onChange={(e) => setemailToRePas(e.target.value)} placeholder='' />
                                <label htmlFor="Email">E-mail</label>
                                <svg xmlns="http://www.w3.org/2000/svg" className='iconeLabelInpinfo' viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z" /></svg>
                            </div>
                            {
                                ResendMessageSent ?
                                    <>
                                        <p className="c-g">Password reset email sent! Check your inbox and follow the steps required to recover your password.</p>
                                        <button className='bl w200 mt10 br20' onClick={() => setpassRestEmailShowing(false)}>Ok </button>
                                    </> :
                                    <button style={{ alignSelf: "end" }} disabled={!isEmailValide} className='bl w200 p5 br1'>Send<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z" /></svg></button>
                            }
                            {
                                errorAuth && errorAuth
                            }
                        </>
                    }
                </form>
            </div>, document.getElementById("portlas")
        )
    }
    function handelHideLoginCom() {
        if (!passRestEmailShowing) {
            displatch(hideLogin())
        }
    }
    if (deviceTypePc) {
        return ReactDom.createPortal(
            <div className='backendMer' ref={loginElemRef}>
                <div style={{ position: "relative" }} className="activeCmp  c-p-c w600 h500 br10 bg-l p15">
                    {isLoadingAuth ?
                        <div className="spinner2"></div>
                        :
                        <>
                            <span className='btnClose' onClick={handelHideLoginCom}><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" /></svg></span>
                            <h1 className='r-s-c wmia pb20 mb20' style={{ borderBottom: "solid 1px var(--border-color)" }}>
                                <svg version="1.1" viewBox="0 0 2048 2048" className='mr10 w30 h30' xmlns="http://www.w3.org/2000/svg">
                                    <path transform="translate(960,106)" d="m0 0h40l29 2 31 4 36 7 28 8 31 11 25 11 20 10 27 16 27 18 16 12 14 12 11 9 7 7 8 7 16 16v2h2l7 8 10 12 10 13 13 18 15 23 16 29 13 27 9 23 11 33 6 22 7 37 4 29 2 31v24l-1 22-3 26-8 44-7 28-14 41-13 29-10 20-9 16-12 19-7 11-11 15-13 16-7 8-12 14-28 28-11 9-14 12-10 7-12 9-15 10-36 21-23 11-26 11-27 9-34 9-26 5-28 4-34 3h-52l-30-3-25-4-31-7-29-9-22-8-26-11-27-13-21-12-22-14-12-9-14-11-11-9-10-9-8-7-27-27-9-11-9-10-13-17-10-14-11-17-10-17-11-20-14-31-9-24-9-27-7-28-6-33-4-38v-57l2-23 5-32 5-24 8-30 7-21 11-27 16-34 11-19 11-18 9-13 11-15 13-17 12-14 9-10 19-19h2v-2h2v-2l11-9 12-10 19-14 16-11 17-11 21-12 22-11 28-12 34-12 29-8 27-5 28-4zm-5 129-29 3-25 5-25 7-28 10-25 12-14 8-19 12-16 12-10 8-15 13-16 16-7 8-9 10-8 10-8 11-12 19-9 16-11 23-11 26-6 21-5 22-5 31-2 18v42l4 32 6 28 8 28 11 28 13 26 12 20 12 17 12 15 9 11 8 8 6 7 8 7 7 7 10 8 19 14 23 15 30 16 29 12 26 8 36 7 26 3 20 1h22l23-2 25-4 22-5 26-8 27-11 23-11 32-20 13-10 9-7 11-9 10-9 18-18 20-25 10-15 13-21 14-28 10-27 8-26 7-36 3-29v-33l-3-35-5-26-6-24-10-28-9-21-13-25-15-24-12-16-9-11-14-15-13-13-11-9-13-11-24-16-15-9-27-14-29-12-23-7-25-6-27-4-11-1z" />
                                    <path transform="translate(1572,1045)" d="m0 0h49l26 2 25 4 23 6 24 8 24 10 19 10 14 8 17 11 14 10 11 9 14 12 20 20 9 11 13 16 11 16 11 18 6 10 12 26 9 25 5 15 6 24 5 30 2 20v39l-3 25-4 25-6 25-10 30-8 18-8 16-9 17-6 10-8 12-10 13-9 11-9 10-7 8-11 11-8 7-16 13-18 13-13 8-14 8-16 8-25 11-24 8-26 7-21 4-25 3-14 1h-69l-7 9-28 28-1 2h-2l-2 4-8 8h-2l-2 4-12 12h-2l-2 4-12 12h-2l-2 4-60 60h-2l-2 4h-2l-2 4-8 8h-2v2h-2l-2 4-10 10h-2v2l-8 7-9 9-12 9-18 6-19 2h-188l-19-2-11-4-10-6-14-12-6-9-5-11-3-16-1-9v-192l1-13 6-15 9-13 7-8h2l2-4h2l2-4 8-8 8-7 17-17 3-4h2l2-4 6-5 7-8 7-7h2l2-4 24-24 8-7 4-5h2v-2l8-7 6-7h2l2-4 7-6 1-2h2l2-4 13-12 1-2h2v-2l8-7 26-26 4-7 1-4-4-22-1-32 2-22 6-37 8-31 11-31 14-29 9-16 8-13 8-12 10-13 12-14 9-10 19-19 8-7 14-11 14-10 19-12 16-9 25-12 22-8 28-8 26-5zm13 129-21 2-24 5-21 7-19 9-13 8-15 11-22 18v2l-4 2-2 4h-2l-9 11-8 11-9 14-8 16-10 24-6 19-4 21-1 9v40l5 31 3 14v17l-4 12-9 14-9 11-9 10-6 6v2l-4 2-4 4v2l-4 2v2l-4 2-8 8v2l-4 2-12 12v2l-4 2-12 12v2l-4 2v2l-4 2v2l-4 2v2l-4 2v2l-4 2v2l-4 2v2l-4 2-20 20v2h-2v2h-2v2l-4 2-7 8-15 15-6 5v2l-4 2-21 21-4 3v2l-4 2-8 9-3 8-1 12v28l-1 55 2 5 7 1h92l12-6 13-12 16-16 7-8 14-14 8-7v-2h2l6-7 126-126 11-9 8-6 20-10 15 1 37 6 18 2h33l19-3 25-6 24-9 19-10 17-11 16-12 13-12 10-11 13-18 14-24 9-21 6-19 4-19 2-16 1-25-2-28-5-25-5-15-11-25-10-18-14-20-10-11-7-8-22-18-13-8-14-8-14-7-15-6-21-6-17-3-25-2z" />
                                    <path transform="translate(956,1118)" d="m0 0h82l44 2 37 3 16 5 9 5 10 8 7 9 8 16 4 12 1 14-3 12-8 17-8 10-11 11-12 5-14 3h-41l-44-2-45-1h-27l-39 1-58 3-63 6-40 5-47 8-50 10-56 14-43 13-30 10-37 14-38 17-35 17-25 14-11 7-15 9-11 7-10 7-17 13-14 11-12 11-7 6-5 6-5 4-1 2h-2l-2 4-11 13-9 13-11 17-8 16-7 18-4 20-2 19-1 86v23l2 31 1 4 9 1 33 1h590l29 1 17 2 15 8 13 12 9 13 5 12 1 4v24l-4 13-7 11-8 10h-2v2l-11 9-9 4-15 2-21 1h-634l-23-2-21-5-21-9-13-8-9-7-10-9-9-9-10-13-9-15-10-22-4-15-3-16-1-10v-136l3-29 5-26 6-21 7-19 13-29 12-21 15-23 12-15 9-11 12-13 7-8 18-18 8-7 14-12 16-13 19-14 15-10 23-15 29-17 27-14 16-8 27-13 28-12 32-12 25-9 44-14 40-11 46-11 47-10 34-6 55-8 52-6 59-4z" />
                                    <path transform="translate(1590,1294)" d="m0 0h16l15 2 13 4 16 8 9 7 10 9 12 17 7 15 3 10 1 5v29l-4 16-8 16-8 12h-2l-2 4-5 5-9 8-11 7-18 7-16 4h-21l-18-4-16-7-11-7-11-10-11-14-8-16-6-18-1-5v-22l3-14 6-16 6-10 8-11 13-13 19-11 15-5z" />
                                </svg>
                                Log in to you Account</h1>

                            <div className="LabelInpInfo">
                                <input ref={InpRef} type="text" className={!emailRegex.test(credentialt.email) ? 'inpError' : ""} value={credentialt.email} id="Email" onChange={(e) => setCeredential(current => ({ ...current, email: e.target.value }))} placeholder='' />
                                <label htmlFor="Email">E-mail</label>
                                <svg xmlns="http://www.w3.org/2000/svg" className='iconeLabelInpinfo' viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z" /></svg>
                            </div>
                            <div className="LabelInpInfo">
                                <input type="password" id="password" value={credentialt.password} className={credentialt.password.length < 6 ? 'inpError' : ""} onChange={(e) => setCeredential(current => ({ ...current, password: e.target.value }))} placeholder='' />
                                <label htmlFor="password">Password</label>
                                <svg xmlns="http://www.w3.org/2000/svg" className='iconeLabelInpinfo' viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm240-120q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z" /></svg>
                            </div>
                            <div className="LabelInpInfo">
                                <p className="wmia ml20 hoverEff2" onClick={() => setpassRestEmailShowing(true)}>Did you forget your password?</p>
                            </div>
                            <div className="LabelinpCheck">
                                <input type="checkbox" name="stayLoged" id="stayLoged" />
                                <label htmlFor="stayLoged">Stay loged in</label>
                            </div>
                            {
                                errorAuth &&
                                <p className="c-r">
                                    Invalide Credential
                                </p>
                            }
                            {
                                <span className='wmia r-b-c' >
                                    <strong onClick={() => {
                                        displatch(showRegister())
                                    }} style={{ cursor: "pointer" }} className='ml20'> Create an account</strong>
                                    <button disabled={!allFieledAddes} style={{ alignSelf: "end" }} className='bl w200 br5 p5' onClick={handelSubmitLoginForm}>Log in <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m700-300-57-56 84-84H120v-80h607l-83-84 57-56 179 180-180 180Z" /></svg></button>
                                </span>
                            }

                        </>
                    }
                </div>
                {
                    passRestEmailShowing && <ResetPasswordComp />
                }
            </div>, document.getElementById("portlas")
        )
    } else {
        return (
            <>
                <div style={{ position: "relative", paddingTop: "300px" }} className=" c-s-c wmia  br10  p10">
                    {isLoadingAuth ?
                        <div className="loader3"></div>
                        :
                        <>
                            <img src="imgs/rb_7863-removebg-preview.png" alt="" className="wmia FielsDesSds" />
                            <div className='wmia  bg-l p20 br20 c-p-s' style={{
                                filter: " drop-shadow(0 0 10px var(--filter-color))"
                            }}>

                                <h1 className='r-s-c wmia pb20 mb20' style={{ borderBottom: "solid 1px var(--border-color)" }}>
                                    <svg version="1.1" viewBox="0 0 2048 2048" className='mr10 w30 h30' xmlns="http://www.w3.org/2000/svg">
                                        <path transform="translate(960,106)" d="m0 0h40l29 2 31 4 36 7 28 8 31 11 25 11 20 10 27 16 27 18 16 12 14 12 11 9 7 7 8 7 16 16v2h2l7 8 10 12 10 13 13 18 15 23 16 29 13 27 9 23 11 33 6 22 7 37 4 29 2 31v24l-1 22-3 26-8 44-7 28-14 41-13 29-10 20-9 16-12 19-7 11-11 15-13 16-7 8-12 14-28 28-11 9-14 12-10 7-12 9-15 10-36 21-23 11-26 11-27 9-34 9-26 5-28 4-34 3h-52l-30-3-25-4-31-7-29-9-22-8-26-11-27-13-21-12-22-14-12-9-14-11-11-9-10-9-8-7-27-27-9-11-9-10-13-17-10-14-11-17-10-17-11-20-14-31-9-24-9-27-7-28-6-33-4-38v-57l2-23 5-32 5-24 8-30 7-21 11-27 16-34 11-19 11-18 9-13 11-15 13-17 12-14 9-10 19-19h2v-2h2v-2l11-9 12-10 19-14 16-11 17-11 21-12 22-11 28-12 34-12 29-8 27-5 28-4zm-5 129-29 3-25 5-25 7-28 10-25 12-14 8-19 12-16 12-10 8-15 13-16 16-7 8-9 10-8 10-8 11-12 19-9 16-11 23-11 26-6 21-5 22-5 31-2 18v42l4 32 6 28 8 28 11 28 13 26 12 20 12 17 12 15 9 11 8 8 6 7 8 7 7 7 10 8 19 14 23 15 30 16 29 12 26 8 36 7 26 3 20 1h22l23-2 25-4 22-5 26-8 27-11 23-11 32-20 13-10 9-7 11-9 10-9 18-18 20-25 10-15 13-21 14-28 10-27 8-26 7-36 3-29v-33l-3-35-5-26-6-24-10-28-9-21-13-25-15-24-12-16-9-11-14-15-13-13-11-9-13-11-24-16-15-9-27-14-29-12-23-7-25-6-27-4-11-1z" />
                                        <path transform="translate(1572,1045)" d="m0 0h49l26 2 25 4 23 6 24 8 24 10 19 10 14 8 17 11 14 10 11 9 14 12 20 20 9 11 13 16 11 16 11 18 6 10 12 26 9 25 5 15 6 24 5 30 2 20v39l-3 25-4 25-6 25-10 30-8 18-8 16-9 17-6 10-8 12-10 13-9 11-9 10-7 8-11 11-8 7-16 13-18 13-13 8-14 8-16 8-25 11-24 8-26 7-21 4-25 3-14 1h-69l-7 9-28 28-1 2h-2l-2 4-8 8h-2l-2 4-12 12h-2l-2 4-12 12h-2l-2 4-60 60h-2l-2 4h-2l-2 4-8 8h-2v2h-2l-2 4-10 10h-2v2l-8 7-9 9-12 9-18 6-19 2h-188l-19-2-11-4-10-6-14-12-6-9-5-11-3-16-1-9v-192l1-13 6-15 9-13 7-8h2l2-4h2l2-4 8-8 8-7 17-17 3-4h2l2-4 6-5 7-8 7-7h2l2-4 24-24 8-7 4-5h2v-2l8-7 6-7h2l2-4 7-6 1-2h2l2-4 13-12 1-2h2v-2l8-7 26-26 4-7 1-4-4-22-1-32 2-22 6-37 8-31 11-31 14-29 9-16 8-13 8-12 10-13 12-14 9-10 19-19 8-7 14-11 14-10 19-12 16-9 25-12 22-8 28-8 26-5zm13 129-21 2-24 5-21 7-19 9-13 8-15 11-22 18v2l-4 2-2 4h-2l-9 11-8 11-9 14-8 16-10 24-6 19-4 21-1 9v40l5 31 3 14v17l-4 12-9 14-9 11-9 10-6 6v2l-4 2-4 4v2l-4 2v2l-4 2-8 8v2l-4 2-12 12v2l-4 2-12 12v2l-4 2v2l-4 2v2l-4 2v2l-4 2v2l-4 2v2l-4 2v2l-4 2-20 20v2h-2v2h-2v2l-4 2-7 8-15 15-6 5v2l-4 2-21 21-4 3v2l-4 2-8 9-3 8-1 12v28l-1 55 2 5 7 1h92l12-6 13-12 16-16 7-8 14-14 8-7v-2h2l6-7 126-126 11-9 8-6 20-10 15 1 37 6 18 2h33l19-3 25-6 24-9 19-10 17-11 16-12 13-12 10-11 13-18 14-24 9-21 6-19 4-19 2-16 1-25-2-28-5-25-5-15-11-25-10-18-14-20-10-11-7-8-22-18-13-8-14-8-14-7-15-6-21-6-17-3-25-2z" />
                                        <path transform="translate(956,1118)" d="m0 0h82l44 2 37 3 16 5 9 5 10 8 7 9 8 16 4 12 1 14-3 12-8 17-8 10-11 11-12 5-14 3h-41l-44-2-45-1h-27l-39 1-58 3-63 6-40 5-47 8-50 10-56 14-43 13-30 10-37 14-38 17-35 17-25 14-11 7-15 9-11 7-10 7-17 13-14 11-12 11-7 6-5 6-5 4-1 2h-2l-2 4-11 13-9 13-11 17-8 16-7 18-4 20-2 19-1 86v23l2 31 1 4 9 1 33 1h590l29 1 17 2 15 8 13 12 9 13 5 12 1 4v24l-4 13-7 11-8 10h-2v2l-11 9-9 4-15 2-21 1h-634l-23-2-21-5-21-9-13-8-9-7-10-9-9-9-10-13-9-15-10-22-4-15-3-16-1-10v-136l3-29 5-26 6-21 7-19 13-29 12-21 15-23 12-15 9-11 12-13 7-8 18-18 8-7 14-12 16-13 19-14 15-10 23-15 29-17 27-14 16-8 27-13 28-12 32-12 25-9 44-14 40-11 46-11 47-10 34-6 55-8 52-6 59-4z" />
                                        <path transform="translate(1590,1294)" d="m0 0h16l15 2 13 4 16 8 9 7 10 9 12 17 7 15 3 10 1 5v29l-4 16-8 16-8 12h-2l-2 4-5 5-9 8-11 7-18 7-16 4h-21l-18-4-16-7-11-7-11-10-11-14-8-16-6-18-1-5v-22l3-14 6-16 6-10 8-11 13-13 19-11 15-5z" />
                                    </svg>
                                    Log in to you Account</h1>

                                <div className="LabelInpInfo   mt20">
                                    <input ref={InpRef} type="text" className={!emailRegex.test(credentialt.email) ? 'inpError' : ""} value={credentialt.email} id="Email" name='email' onChange={(e) => setCeredential(current => ({ ...current, email: e.target.value }))} placeholder='' />
                                    <label htmlFor="Email">E-mail</label>
                                    <svg xmlns="http://www.w3.org/2000/svg" className='iconeLabelInpinfo' viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z" /></svg>
                                </div>
                                <div className="LabelInpInfo  mt20">
                                    <input type="password" id="password" name='password' value={credentialt.password} className={credentialt.password.length < 6 ? 'inpError' : ""} onChange={(e) => setCeredential(current => ({ ...current, password: e.target.value }))} placeholder='' />
                                    <label htmlFor="password">Password</label>
                                    <svg xmlns="http://www.w3.org/2000/svg" className='iconeLabelInpinfo' viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm240-120q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z" /></svg>
                                </div>
                                <div className="LabelInpInfo mt20">
                                    <p className="wmia  hoverEff2" onClick={() => setpassRestEmailShowing(true)}>Did you forget your password?</p>
                                </div>
                                <div className="LabelinpCheck mt20">
                                    <input type="checkbox" name="stayLoged" id="stayLoged" />
                                    <label htmlFor="stayLoged">Stay loged in</label>
                                </div>
                                {
                                    errorAuth &&
                                    <p className="c-r mt10">
                                        Invalide Credential
                                    </p>
                                }
                                {
                                    <span className='wmia r-b-c' >
                                        <button disabled={!allFieledAddes} className='bl mt50 wmia br20 p10' onClick={handelSubmitLoginForm}>Log in <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m700-300-57-56 84-84H120v-80h607l-83-84 57-56 179 180-180 180Z" /></svg></button>
                                    </span>
                                }
                            </div>
                        </>
                    }
                </div>
                {
                    passRestEmailShowing && <ResetPasswordComp />
                }
            </>
        )
    }

}
export default Login
