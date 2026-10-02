import '@mantine/core/styles.css';
import './App.css'
import { RouterProvider } from 'react-router-dom'

import { router } from './components/routes'

function App() {
  return <RouterProvider router={router} />
}

export default App
