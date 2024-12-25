import { createRoot } from 'react-dom/client'
import './css/index.css'
import { BrowserRouter } from "react-router-dom"
import App from './App.jsx'
import { Provider } from 'react-redux'
import store from './store.jsx'
createRoot(document.getElementById('root')).render(
  <BrowserRouter >
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>
)
