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
  fonts: {
    heading: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
    body: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
    mono: `'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace`,
  },
  radii: {
    md: '4px',
    lg: '6px',
  },
  styles: {
    global: {
      body: {
        bg: '#0e0f12',
        color: 'gray.100',
      },
    },
  },
  colors: {
    gray: {
      650: '#3a4453',
      750: '#222831',
      850: '#16191f',
    },
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
  components: {
    Button: {
      baseStyle: { fontWeight: 600, letterSpacing: '0.01em' },
      defaultProps: { colorScheme: 'odrive' },
    },
    Heading: {
      baseStyle: { letterSpacing: '-0.01em' },
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