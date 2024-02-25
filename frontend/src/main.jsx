import React from 'react'
import ReactDOM from 'react-dom'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'; // Import ChakraProvider
import store from './redux/store'
import { Provider } from 'react-redux'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Provider store={store}>
      <ChakraProvider> {/* Wrap your app with ChakraProvider */}
        <App />
      </ChakraProvider>
    </Provider>
  </BrowserRouter>,
)
