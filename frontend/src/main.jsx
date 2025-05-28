import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { store, persistor } from './store'
import './index.css'
import App from './App.jsx'

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: '#1a1a1a',
        color: 'white',
      },
    },
  },
  colors: {
    odrive: {
      50: '#e6fffa',
      100: '#b3f5ec',
      200: '#81e6d9',
      300: '#4fd1c7',
      400: '#38b2ac',
      500: '#0d7377',
      600: '#0a5d61',
      700: '#08474a',
      800: '#053134',
      900: '#021b1d',
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ChakraProvider theme={theme}>
          <App />
        </ChakraProvider>
      </PersistGate>
    </Provider>
  </StrictMode>,
)