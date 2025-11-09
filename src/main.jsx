import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { SessionProvider } from './contexts/SessionProvider'
import { ThemeProvider } from './contexts/ThemeProvider'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <SessionProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </SessionProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
