import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { BookingModalProvider } from './context/BookingModalContext.jsx'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <BookingModalProvider>
        <App />
      </BookingModalProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

