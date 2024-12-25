import { configureStore } from "@reduxjs/toolkit";



// ----------------------------
import themeReducer from './slices/themeSilce'
import logimReducer from './slices/loginSlice';
import registerReducer from "./slices/registerSlice";
import authReducer from "./slices/authSilce"
import addAddressReducer from "./slices/addressManagement";
import productReducer from "./slices/fetchProdSlice"
import displayRatingReducer from "./c/singles/rattingCmp";
import viewProdReducer from "./c/shopping/viewProd";
import btnAddToCartReducer from './slices/btnAddToCart';
import ProfileReducer from "./slices/profileSlice";
import TenDoneReducer from "./slices/tenDoeneslice";
import paymentMethodReducer from "./slices/PaymenthMethodManagement"
import SaveReducer from "./slices/saveProdsSlice";
import MoreOfSameReducer from "./slices/MoreOfSameMan"
import WishListReducer from "./slices/WishListMan";
import OrdersManReducer from "./slices/OrdersMan";
import PopupConfReducer from "./slices/popupConfirm";
import CustomProdsReducer from "./slices/customProd";
// ----------------------------


const store = configureStore({
    reducer: {
        authe: authReducer,
        theme: themeReducer,
        loginVSBL: logimReducer,
        registerVSBL: registerReducer,
        addAddress: addAddressReducer,
        productsManager: productReducer,
        displayRating: displayRatingReducer,
        viewProduct: viewProdReducer,
        btnAddToCart: btnAddToCartReducer,
        profile: ProfileReducer,
        TenDone: TenDoneReducer,
        paymentMethod: paymentMethodReducer,
        saveMan: SaveReducer,
        MoreOfSame: MoreOfSameReducer,
        WishList: WishListReducer,
        OrderMan: OrdersManReducer,
        PopupCnof: PopupConfReducer,
        CustomProds: CustomProdsReducer,

    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredPaths: ['popup.func'],
                ignoredActions: ['popupConf/showPopupConfrm'], // Action that contains non-serializable values
            }
        })

})

export default store;