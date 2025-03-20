import React, { useEffect, useState, useRef, useMemo } from 'react'
import "../css/home.css";
import SearchInput from './singles/searchInput';
import ProductCard from './singles/ProdCard';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ViewProd } from './shopping/viewProd';
import { fetchCategory } from '../slices/fetchProdSlice';
import Image from './singles/Image';
function Home() {
  const navigate = useNavigate();
  const { isLoadingData, searchTerme, resultSearch, isSearching } = useSelector(s => s.productsManager);
  const viewProdVsbl = useSelector(st => st.viewProduct.isVisible)
  const MainResSearRef = useRef(null)
  const HomePageRef = useRef(null)
  const dispatch = useDispatch()
  const CategoriesElment = useMemo(() =>
    () => {
      const [listCategories, setlistCategories] = useState([]);
      const [loadingCategories, setloadingCategories] = useState(true);
      useEffect(() => {
        fetch('https://dummyjson.com/products/categories').then(res => res.json()).then(res => {
          res.forEach(r => {
            fetch("https://dummyjson.com/products/category/" + r.slug).then(res2 => res2.json()).then(res3 => {
              setlistCategories(current => [...current, { slug: r.slug, name: r.name, products: [res3.products[0], res3.products[1], res3.products[2], res3.products[4]] }])
            })
          })
          setloadingCategories(false)
        })
      }, [])
      const GoTOCate = (cat) => {
        navigate('/shop/' + cat)
      }
      return (
        <>

          <div className="mainCategories p20 mt100" style={{ minHeight: "500px" }}>
            {loadingCategories ? <div className="loader"></div> :
              listCategories.map(e =>
                <div style={{ cursor: "pointer" }} key={e.name} onClick={() => GoTOCate(e.slug)} className='cntCateg c-p-c  br10 p10  mt20 mr10 '>
                  <h1>{e.name}</h1>
                  <div className="r-w-p-s wmia ">

                    {
                      e.products.map(prod =>
                        prod != undefined &&
                        <div key={prod.title} className="c-s-c p10 cntCateProd">
                          <Image   src={prod.images[0]}  />
                          <p className="mt10">{prod.title}</p>
                        </div>
                      )
                    }
                  </div>

                </div>

              )
            }
          </div>
        </>
      )
    }
    , [])
  function AdsCmp() {
    return (
      <>
        <div className="adsList mb20">
          <div style={{ backgroundColor: "#f0efed" }} className="r-p-c cntAdCm mt100">
            <div className="c-s-s p10">
              <h1 style={{ fontSize: "22px", color: "#000" }}>Men's Show Up Short Sleeve Cuban Shirt in Green Size XL</h1>
              <p style={{ maxWidth: "800px", color: "#000" }} className='mt50'>Model Height: 6'1 - Wearing Large Big & Tall: Height 6'5 - Wearing XXL Available In Green. Cuban Collar Short Sleeve Front Button Closure Left Chest Pocket Disclaimer: Stripe Placement May Vary 96% Polyester 4% ElastanePair With "Show Up Slim Slit Pants" Or "Show Up Basketball Shorts" Imported | Mens Show Up Short Sleeve Cuban Shirt in Green size XL by Fashion Nova</p>
              <button className='bl w200 br20 p10 mt20'>Check out<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m700-300-57-56 84-84H120v-80h607l-83-84 57-56 179 180-180 180Z" /></svg></button>
            </div>
            <img style={{ width: "500px", minWidth: "400px" }} src="/imgs/menCloth.jpg" alt="" />
          </div>
          <div style={{ backgroundColor: "#fafafa" }} className="r-p-c cntAdCm mt100">
            <div className="c-s-s p10">
              <h1 style={{ fontSize: "22px", color: "#000" }}>Chanel Bleu De Chanel Parfum Spray </h1>
              <p style={{ maxWidth: "800px", color: "#000" }} className='mt50'>A citrus woody fragrance for men.
                Deep, fresh, intense, vibrant, sensual & seductive.
                Top notes of citrus accord, vetiver & pink pepper.
                Heart notes of grapefruit, dry cedar tones & labdanum.
                Base notes of frankincense, ginger & sandalwood.
                Launched in 2014.
                Perfect for all occasions.</p>
              <button className='bl w200 br20 p10 mt20'>Check out<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m700-300-57-56 84-84H120v-80h607l-83-84 57-56 179 180-180 180Z" /></svg></button>
            </div>
            <img src="/imgs/riha.jpg" alt="" />
          </div>

          <div style={{ backgroundColor: "#020202" }} className="r-p-c cntAdCm mt100">
            <div className="c-s-s p10">
              <h1 style={{ fontSize: "22px", color: "#000", color: "#fff" }} className=''>Audemars Piguet at SIHH 2019</h1>
              <p style={{ maxWidth: "800px", color: "#000", color: "#fff" }} className='mt50 '>Swiss Haute Horlogerie Manufacturer Audemars Piguet  has once again graced the Salon de la Haute Horlogerie Internationale with its presence, and its lineup of exceptional watches was impressive – to say the least.</p>
              <button className='bl w200 br20 p10 mt20'>Check out<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m700-300-57-56 84-84H120v-80h607l-83-84 57-56 179 180-180 180Z" /></svg></button>
            </div>
            <img src="/imgs/Audemars Piguet.jpg" alt="" />
          </div>
          <div style={{ backgroundColor: "#cbcac5" }} className="r-p-c cntAdCm mt100">
            <div className="c-s-s p10">
              <h1 style={{ fontSize: "22px", color: "#000", }} className=''>Gel Face Wash</h1>
              <p style={{ maxWidth: "800px", color: "#000", }} className='mt50 '>Acne Blemish Clarifying Cleanser ── Formulated with a powerful acne treatment and cleanser in one formula, use daily for an exceptional skin improvement effect.</p>
              <button className='bl w200 br20 p10 mt20'>Check out<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m700-300-57-56 84-84H120v-80h607l-83-84 57-56 179 180-180 180Z" /></svg></button>
            </div>
            <img style={{ width: "auto", }} src="/imgs/face wash product manipulation.jpg" alt="" />
          </div>
        </div>
        <button className='mrauto'>Check out more featured products <svg className='ml20' xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m700-300-57-56 84-84H120v-80h607l-83-84 57-56 179 180-180 180Z" /></svg></button>
      </>
    )
  }
  useEffect(() => {
    HomePageRef.current.scrollIntoView({
      behavior: "smooth", block: "start"
    })
  }, [])

  const goToMainProds = () => {
    navigate('/Shop')
  }

  const DisplayResult = () => {
    return (
      <div className='wmia bg-l c-s-s p10' ref={MainResSearRef}>
        <div className="ml20 r-s-c wmia mb20">
          <p className='ml10 mr20'><strong className='mr10'>{resultSearch.length}</strong> Result For " <strong> {searchTerme} </strong> "</p>
          <svg className='w40 h40' version="1.1" viewBox="0 0 2048 2048" width="128" height="128" xmlns="http://www.w3.org/2000/svg">
            <path transform="translate(936,609)" d="m0 0h82l43 3 34 4 37 6 37 8 35 9 38 12 25 9 27 11 28 12 19 9 16 8 18 10 19 11 24 15 15 10 19 13 12 9 18 14 14 11 10 8 10 9 8 7 14 13 2 1v2l4 2v2l4 2 12 12 7 8 9 9 7 8 9 10 7 8 14 17 10 13 13 18 10 14 10 15 12 19 12 20 8 13 8 16 12 23 9 20 11 26 12 31 13 40 1 4h3v8h4l2-5 12-21 7-14 6-11 13-24 10-19 12-21 11-21 7-10 7-9 7-6 7-4 4-1h8l14 3 14 9 10 10 5 9v12l-2 9-8 16-15 31-6 10-8 16-12 23-13 23-8 16-10 18-15 29-7 12-6 12-12 21-10 17-10 11-12 9-2 1h-10l-19-5-29-12-28-12-38-16-39-16-75-31-23-10-14-9-9-9-6-10-1-8 2-12 4-9 9-13 9-7 9-5h8l24 8 36 14 28 12 26 10 28 12 15 6 10 6v-7l-7-22-14-40-11-27-11-25-18-36-13-23-14-23-18-27-11-15-13-17-24-28-29-31-12-12-8-7-14-13-8-7-11-9-15-12-16-12-19-13-11-8-16-10-20-12-21-12-29-15-33-15-40-15-40-13-52-13-38-7-43-5-39-3h-67l-49 4-43 6-29 6-40 10-35 11-28 10-15 6-13 6-24 11-16 8-25 13-11 7-11 6-17 11-27 18-18 13-14 11-14 12-10 8-13 12-8 7-10 10-8 7-7 8-12 12-7 8-10 12-11 14-11 13-20 26-9 11-9 10-12 9-8 4h-9l-8-3-13-7-8-7-8-11-3-7v-9l5-15 9-15 11-16 12-16 13-17 12-14 3-4h2l2-4 11-13 7-7 7-8 40-40 8-7 10-9 14-11 10-9 13-10 36-26 16-10 19-12 15-9 36-20 28-14 32-14 40-15 31-10 37-10 30-7 49-9 36-5z" />
            <path transform="translate(264,1132)" d="m0 0h9l9 2 11 6 11 11 7 14 1 4v10l-7 14-10 11-10 7-8 3h-10l-11-3-9-6-10-10-7-12-2-6v-9l5-13 7-9 8-8 8-4z" />
            <path transform="translate(222,1300)" d="m0 0h10l10 3 10 6 9 9 6 10 2 7v12l-4 10-6 8-2 3h-2v2l-13 9-12 3-9-1-12-5-9-7-6-7-6-12-1-3v-14l4-10 6-9 8-7 12-6z" />
          </svg>
        </div>
        <div className="wmia bg-l r-w-p-s">
          {isLoadingData ? <div className="loader"></div> :
            resultSearch.length > 0 ?
              resultSearch.map(e => <ProductCard key={e.id} product={e} ref={null} />)
              : <div className="wmia c-c-c mt50">
                <img className='w300' src="imgs/10434122-removebg-preview.png" alt="" />
                <h1 className="mt50">No result for ' {searchTerme} '</h1>
              </div>
          }</div>
      </div>)
  }

  useEffect(() => {
    if (MainResSearRef.current) {
      MainResSearRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start"
      })
    }
  }, [resultSearch])
  return (
    <>

      <main className='HomePage  p20 c-p-c' ref={HomePageRef}>
        <h1 style={{ fontSize: "30px" }} className='mt50'> QuickCart</h1>
        <SearchInput />

        <h1 style={{ textAlign: "center", maxWidth: "1000px", lineHeight: 2 }} className='mt100'>Welcome to QuickCart, your one-stop shop for all your needs! Explore our wide range of high-quality products and enjoy a seamless shopping experience with fast delivery, easy checkout, and amazing deals. Happy shopping!</h1>
        <button onClick={goToMainProds} className='p10 br20 r-c-c  mt50 bg-l' style={{ fontSize: "17px", width: "300px" }}>Start Shopping <svg className='ml30' xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m700-300-57-56 84-84H120v-80h607l-83-84 57-56 179 180-180 180Z" /></svg></button>
      </main>
      {
        viewProdVsbl && <ViewProd />
      }
      {isSearching && <DisplayResult />}

      <AdsCmp />
      <CategoriesElment />
    </>
  )
}

export default Home
