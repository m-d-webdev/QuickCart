import React from 'react'
import { useState, useEffect, useRef } from 'react';
import { cancelSearching, fetchSearch } from '../../slices/fetchProdSlice';
import { useSelector, useDispatch } from 'react-redux';
import { setsearchTerme } from '../../slices/fetchProdSlice';
import { api } from '../../slices/fetchProdSlice';
// export const fetchSearch = createAsyncThunk(
//     "productsSlice/fetchSearch",
//     async (searchTerme, { RejectWithValues }) => {
//         const response = await api.get('/products/search?q=' + searchTerme);
//         return response.data.products;

//     }
// )
function searchInput() {
    const dispatch = useDispatch()

    const [founedResultSearch, setfounedResultSearch] = useState([]);
    const [mainResSearchVSBL, setmainResSearchVSBL] = useState(false);
    const { isSearching, arraySearchTermes, searchTerme } = useSelector(s => s.productsManager);

    const mainSearchRef = useRef();
    async function handelSearch(e) {
        setmainResSearchVSBL(true);
        dispatch(setsearchTerme(e.target.value));
        setfounedResultSearch([])
        if (e.target.value.length > 0) {
            const result = await api.get('/products/search?q=' + searchTerme);

            setfounedResultSearch(result.data.products.map(elm => ({ id: elm.id, title: elm.title })))

        } else { setfounedResultSearch([]) }
    }

    const handelFocusOnSearch = (event) => {
        const clickOutElm = (e) => {
            if (!mainSearchRef.current?.contains(e.target) && !event.target.contains(e.target)) {
                document.removeEventListener("mousedown", clickOutElm)
                setmainResSearchVSBL(false)
            }
        }
        document.removeEventListener("mousedown", clickOutElm)
        document.addEventListener("mousedown", clickOutElm)
    }

    const handelSubmitForm = (e) => {
        e.preventDefault();
        if (searchTerme != "") {
            setmainResSearchVSBL(false);
            dispatch(fetchSearch(searchTerme))
        }
    }

    return (
        <div className="r-c-c wmia p10">
            {isSearching &&

                <button className='mr20 c-c-c' onClick={() => dispatch(cancelSearching())}>
                    <svg version="1.1" viewBox="0 0 2048 2048" width="128" height="128" xmlns="http://www.w3.org/2000/svg">
                        <path transform="translate(741)" d="m0 0h4v3l7 1 1-4h132l-1 4 5 2 16 11 10 9 9 11 10 19 5 17v22l-4 14-7 16-6 10-8 10-8 8-8 5-15 6-12 3-24 3-56 4-30 3-32 5-35 7-32 8-36 12-24 9-22 9-27 12-36 19-28 17-14 9-14 10-18 13-18 14-13 11-14 12-17 16-6 5-5 5-15 16-9 10-7 8-11 13-10 12-13 17-9 13-11 16-12 19-9 15-12 21-18 36-11 26-14 37-12 37-8 32-8 42-5 32-3 32-1 21v57l2 31 4 36 5 29 9 42 8 30 15 44 12 30 14 30 16 32 13 22 12 19 11 16 13 18 9 12 13 16 9 11 7 7 7 8 9 10 26 26 10 8v2l4 2 13 12 14 11 13 10 18 13 13 9 21 13 28 17 35 18 31 14 26 10 34 12 27 8 34 8 27 5 44 6 35 3 18 1h54l38-3 37-5 32-6 32-8 30-9 30-10 39-16 26-12 24-12 24-14 20-12 22-15 14-10 13-10 16-12 14-12 11-9 15-15h2l1-3 8-7 16-16 1-2h2l2-4 13-13 7-8 13-16 4-5 9-12 13-18 9-13 12-19 13-22 8-14 10-20 9-17 8-16 8-14 13-16 11-9 10-6 15-5 9-2 13-1 17 2 18 6 16 9 12 11 10 13 8 15 4 12 1 6v23l-4 16-7 17-12 26-10 19-14 26-14 23-9 15-18 27-10 14-13 19-18 22-1 4 1 5 6 6v2l4 2 16 17 46 46 8 7 82 82 5 6 8 7 7 8 162 162 6 5 7 8 5 4 7 8 123 123v2h2l7 8 11 13 9 13 8 12 1 1v55l-3-1-2 5-11 15-9 11-8 7-15 10-5 3-3 3 1 3h-52l-19-10-16-12-10-9-6-5-6-7-8-7-8-8v-2l-3-1-5-6-455-455-7-8-2-1h-7l-14 9-13 10-19 14-39 26-26 15-16 9-34 18-30 14-17 7-11 5-37 14-49 15-44 11-34 7-52 8-36 4-43 3h-48l-63-4-66-10-28-5-51-13-27-8-46-16-30-12-28-13-25-12-20-10-24-14-25-15-24-16-17-12-21-16-16-12-14-12-11-9-15-14-12-11-34-34v-2h-2l-7-8-13-14v-2h-2l-9-11-13-16-13-17-14-19-12-17-15-23-19-32-13-23-19-38-15-34-16-42-14-43-16-65-7-36-2-10-1-2-1-9-1-3-1-1-2-4-2-10-1-3v-205l3 1 16-80 10-42 8-29 15-45 12-30 15-33 14-29 13-25 14-24 10-16 8-13 7-10 8-12 12-16 10-14 11-14 11-13 7-8 11-13 12-13 7-8 15-16 11-11 8-7 15-14 11-9 13-12 14-11 15-12 11-8 20-14 13-9 17-11 20-12 13-8 27-15 25-12 16-8 25-11 49-18 25-8 35-10 42-10 41-8 22-4 2-3h2zm-736 962 1 3z" />
                        <path transform="translate(1417)" d="m0 0h72l-1 2h-5l2 4 12 8 10 8 15 13 116 116 8 7 14 14 8 7 4 4v2l4 2 19 19 7 8 4 2 8-5 12-12 8-7 7-7 1-2h2l2-4 128-128 7-8 3-1 1-3 6-5 5-5 12-11 17-12 5-6h76v6h-2l-2-2-9-2 2 4 5 2 13 9 10 9 9 10 12 17 2 4v3h2v54h-2l-2 4h-2l-2 5-9 12-11 13-9 10-17 17-6 7h-2l-2 4-120 120h-2v2l-16 16h-2l-2 4-10 9-4 3 2 4 12 11 8 7 150 150 7 8 8 8 7 8 9 11 11 16 6 9v54l-3-1-2 6-8 11-7 10h-2l-2 4-9 8-11 7-16 7-19 5h-14l-13-2-13-5-15-9-17-14-15-14-156-156-7-8-10-9-7-1-7 8-6 7-7 6-5 6-7 6-7 8-60 60-7 8-5 4-1 2h-2v2h-2l-2 4-8 8h-2l-2 4-12 12h-2v2h-2v2h-2l-2 4-4 4h-2v2l-7 6-1 2h-2v2h-2l-2 4h-2v2l-8 7-9 9-14 11-16 8-13 5-12 3h-14l-16-3-14-5-13-8-11-10-5-5-9-12-7-15-4-13-1-5v-23l5-16 8-16 9-12 4-5h2l2-4 129-129 3-4h2l1-3 7-6 2-3h2l2-4h2v-2l8-7 25-25 6-5-1-5-10-9-174-174-7-8-11-14-8-14-5-11-4-17v-12l3-15 6-16 10-16 14-14 19-13 2-3z" />
                        <path transform="translate(887)" d="m0 0 3 1z" />
                        <path transform="translate(1938,2047)" d="m0 0 2 1z" />
                        <path transform="translate(2047,36)" d="m0 0" />
                        <path transform="translate(738)" d="m0 0" />
                        <path transform="translate(2047 2e3)" d="m0 0" />
                        <path transform="translate(2047,57)" d="m0 0" />
                        <path transform="translate(2047,53)" d="m0 0" />
                        <path transform="translate(2047,45)" d="m0 0" />
                        <path transform="translate(1928,1)" d="m0 0" />
                        <path transform="translate(2007)" d="m0 0" />
                    </svg>
                    <p className='mt10'>cancel </p>
                </button>
            }

            <div className="barSearchHome r-c-c ">
                <svg className='ml15' version="1.1" viewBox="0 0 2048 2048" xmlns="http://www.w3.org/2000/svg">
                    <path transform="translate(790)" d="m0 0 3 1 1 2 6-1v-2h115l4 2 3-1 1 2 1-3h4 4l2 4h6v-4h14v5l-1 1 39 5 45 8 31 7 56 14 36 12 37 14 30 13 26 12 19 10 26 14 28 17 17 11 24 16 13 10 14 10 18 14 11 9 14 12 11 9v2l4 2 10 10 8 7 34 34 7 8 12 13 9 11 12 14 10 13 14 18 14 20 13 19 14 22 15 26 10 18 14 26 13 28 13 30 15 40 11 34 8 28 11 46 6 33 6 43 4 38 2 32 1 39-2 54-3 30-9 65-6 30-15 60-15 46-13 35-13 30-10 22-8 16-13 25-10 17-6 11-25 40-13 18-14 19-6 8-11 15-12 14-7 8-12 14-31 33-13 13-8 7-12 11-10 9-8 7-10 8-12 10-14 11-13 9-30 21-17 11-22 13-20 12-26 14-17 9-28 13-25 11-43 16-39 12-39 10-30 7-32 6-55 8-32 3-35 2h-63l-36-2-38-4-54-9-34-7-55-15-30-10-35-13-27-11-38-18-25-12-25-14-23-14-22-14-16-11-16-12-19-14-13-10-14-12-10-9-8-7-12-11-15-14-8-7v-2l-4-2-16-17-15-16-10-11-7-8-12-14-11-14-14-18-24-34-12-19-14-23-10-17-10-18-19-38-15-34-18-48-12-37-16-64-10-51-1-2-1-9-1-2-1-4-2-5-2-9-1-3v-203l1 2 2-1 17-85 7-29 9-34 13-40 16-42 13-28 11-24 8-16 13-24 12-20 8-13 11-18 6-9 12-17 14-19 13-17 13-16 9-11 9-10 12-13 7-9h2l2-4 15-16 11-11 11-9 5-5h2v-2l8-7 10-9 14-12 17-13 18-14 18-13 17-12 22-14 17-10 25-15 26-14 29-14 27-12 26-10 42-15 28-8 42-11 37-8 53-9 26-4 1-2h3zm135 3 4 1zm-80 242-35 2-35 4-32 6-30 7-35 10-29 10-29 12-28 13-23 12-16 9-24 15-18 12-17 13-28 22-12 11-8 7-16 15-12 12-7 8-9 9-7 8-10 11-8 11-9 12-14 19-18 27-6 11-8 13-12 23-8 16-10 22-14 36-10 30-10 37-6 28-5 37-4 40-1 17v48l3 36 7 49 6 29 8 30 11 36 11 28 13 30 16 32 11 19 9 15 22 33 16 21 9 11 12 14 11 12 14 15 16 16 8 7 7 7 11 9 13 11 18 13 13 10 24 16 28 17 22 12 32 16 32 13 34 12 31 9 21 5 37 7 39 5 39 3h48l38-3 32-4 36-7 36-9 29-9 28-10 22-9 34-16 27-14 22-13 11-7 18-12 18-13 14-11 10-8 10-9 8-7 3-2v-2l4-2 13-12 22-22 7-8v-2h2l9-11 11-13 20-26 9-13 10-15 11-18 12-22 8-15 11-23 15-36 12-36 7-25 6-23 5-23 6-39 3-33 1-17v-58l-2-29-5-36-8-43-12-46-14-40-9-22-11-24-17-34-10-17-13-21-8-12-12-17-13-17-11-14-11-13-11-12-9-10-14-14-8-7-12-11-11-9-12-10-13-10-18-13-17-12-26-16-25-14-17-9-24-11-32-13-34-12-28-8-39-9-29-5-36-4-39-2zm-840 736 1 4z" />
                    <path transform="translate(1663,1491)" d="m0 0 6 2 7 6 7 8 19 19 2 1v2l4 2 22 22 8 7 56 56 8 7 32 32 8 7 40 40 6 5 5 6 3 2v2l4 2v2l4 2 34 34 6 5 5 6 8 7 45 45 7 8 9 10 13 18 11 20 4 10h2v70l-5 3-12 23-8 11-11 13-10 10-13 9-17 9-16 6-16 4-3 2h-19v-2h-11l-18-4-12-4-19-10-13-9-13-12-8-7-33-33-7-6-4-4v-2l-4-2-34-34-8-7-37-37-8-7-29-29-8-7v-2l-4-2v-2l-4-2-64-64-8-7-26-26-2-1v-2h-2v-2l-4-2v-2l-4-2-25-25-8-7-9-8v-2h-2l-3-4 1-4 15-11 7-7 10-8 14-12 8-7 8-8 8-7 45-45 7-8 9-9 8-10 10-11 7-8 10-13 4-5z" />
                    <path transform="translate(955)" d="m0 0h32v1l-11 1-1 1-20-1z" />
                    <path transform="translate(936)" d="m0 0h2v3l2 1h-6l2-1z" />
                    <path transform="translate(2047,1963)" d="m0 0h1v5l-3-1z" />
                    <path transform="translate(786)" d="m0 0 2 1z" />
                    <path transform="translate(774)" d="m0 0 2 1z" />
                    <path transform="translate(1885,2046)" d="m0 0" />
                    <path transform="translate(2044,1960)" d="m0 0" />
                    <path transform="translate(956,2)" d="m0 0" />
                    <path transform="translate(795,2)" d="m0 0" />
                    <path transform="translate(784)" d="m0 0" />
                </svg>
                <form action="" onSubmit={handelSubmitForm} className='wmia'>
                    <input type="text" value={searchTerme} onChange={handelSearch} onClick={handelFocusOnSearch} placeholder='What are you looking for ??' />
                </form>
                {mainResSearchVSBL &&
                    <div className="c-s-s p15 bg-l br10 wmia mainResultSearch" ref={mainSearchRef}>
                        {founedResultSearch.length > 0 ?
                            founedResultSearch.map(s => <p className='p10 pl20 mt10 hoverEff1 wmia' key={s.id} onClick={(e) => { dispatch(setsearchTerme(s.title)); setmainResSearchVSBL(false); dispatch(fetchSearch(s.title)) }} >{s.title}</p>)
                            :
                            <div className="wmia   mt20 c-c-c h200">

                                <svg className='w50 h50' version="1.1" viewBox="0 0 2048 2048" width="128" height="128" xmlns="http://www.w3.org/2000/svg">
                                    <path transform="translate(257)" d="m0 0h1526v2l8 1 30 9 23 8 23 10 23 12 19 12 14 10 9 7 11 9 23 23 9 11 8 10 12 17 13 22 8 15 11 25 15 44 4 14 2-1v1551h-3l-1-3 1-3-4 1-1-4-12 39-8 18-10 21-15 25-11 16-10 13-9 10-7 8-15 14-14 12-15 11-21 13-18 10-26 12-24 9-30 9-23 6h-1508l1-2-35-11-35-12-28-13-20-11-12-8-12-9-11-9-10-9-25-25-9-11-14-19-13-21-14-27-10-25-11-34-4-14-2-3v-1532h4l7-21 6-20 10-25 9-19 13-22 12-18 8-11 10-11 7-8 4-5 8-7 10-10 11-9 10-8 15-10 17-10 23-12 24-10 22-7 18-5 8-2zm78 120-43 2-21 3-19 5-19 8-18 10-14 10-10 8-10 9-11 11-9 11-7 10-11 19-7 14-6 15-4 13-3 15-2 19-1 24v189h1632l164-1 8-1 1-1 1-180-1-31-3-24-6-24-7-17-8-16-7-12-12-17-14-15-13-12-16-11-15-9-21-10-20-7-20-4-32-2-35-1zm-332 136-1 4 2-4zm-2 6m119 371v1075l1 28 3 33 5 21 6 16 8 16 7 13 13 17 11 13 12 12 17 13 16 10 21 11 16 6 25 6 28 3 38 2h1346l36-1 27-2 21-4 27-9 26-13 18-12 10-8 10-9 9-9 7-9 8-10 7-11 6-11 7-15 7-21 5-28 2-29v-995l1-89-1-10zm1925 1149 1 2zm-1 5m-1 14v2h2v-2z" />
                                    <path transform="translate(1008,1137)" d="m0 0h27l23 2 23 5 19 7 16 8 11 6 16 11 10 8 13 13 8 12 5 13 1 5v18l-4 13-5 9-8 10-7 7-9 6-12 4-6 1h-17l-13-3-16-8-22-16-14-7-11-3-14-1-6 1-10 1-12 4-8 4-14 10-19 13-11 4-11 2h-9l-14-3-14-7-10-9-6-7-8-16-4-11-1-6v-8l4-12 9-16 9-10 5-5 9-8 21-14 29-15 18-6 19-4z" />
                                    <path transform="translate(1463,900)" d="m0 0h19l14 3 13 7 10 9 9 14 4 12 2 12 1 13v49l-3 17-5 13-7 11-11 12-13 8-10 3-7 1h-12l-16-4-10-6-10-9-7-8-7-14-3-9-3-18-1-12v-28l2-23 4-15 7-14 8-9 14-9 12-5z" />
                                    <path transform="translate(570,899)" d="m0 0 19 2 11 4 11 6 5 4 8 10 6 12 4 16 1 9 1 21v21l-1 20-3 14-8 16-9 12-8 7-16 8-12 3h-11l-16-4-11-6-10-9-8-10-8-18-3-16-1-10v-43l2-18 3-12 7-13 9-11 14-9 10-4z" />
                                    <path transform="translate(321,256)" d="m0 0h60l15 2 13 5 9 6 10 10 6 9 6 15 1 4v14l-3 14-6 12-8 11h-2v2l-13 9-10 4-7 2-19 2h-59l-18-3-14-7-4-3v-2l-4-2-8-11-7-14-3-13v-13l4-14 9-15 11-12 14-8 13-3z" />
                                    <path transform="translate(902,256)" d="m0 0h54l21 3 12 5 9 6 10 11 8 14 3 11v16l-3 13-7 14-8 10-8 7-12 6-13 3-24 2h-49l-17-2-10-4-10-6-10-10-8-13-5-15-1-7v-8l4-15 6-12 9-12 9-7 8-5 9-3z" />
                                    <path transform="translate(614,256)" d="m0 0h53l17 2 14 5 11 8 10 11 8 14 3 9v18l-3 12-7 14-8 10-10 8-10 5-12 3-20 2h-57l-14-2-11-4-10-7-9-9-7-11-6-16-1-7v-11l4-13 6-11 9-12 8-7 14-8 11-2z" />
                                    <path transform="translate(1807)" d="m0 0h8v1h-8z" />
                                    <path transform="translate(236)" d="m0 0 4 1z" />
                                    <path transform="translate(246,2047)" d="m0 0 3 1z" />
                                    <path transform="translate(1803)" d="m0 0 3 1z" />
                                    <path transform="translate(1784)" d="m0 0 3 1z" />
                                    <path transform="translate(2047,243)" d="m0 0" />
                                    <path transform="translate(1785,2047)" d="m0 0" />
                                    <path transform="translate(1779,2047)" d="m0 0" />
                                    <path transform="translate(1776,2047)" d="m0 0" />
                                    <path transform="translate(1785,2045)" d="m0 0" />
                                </svg>

                                <p className='mt20'>There are no suggestions, but you can search.</p>
                            </div>}
                    </div>
                }
            </div>
        </div>

    )
}

export default searchInput
