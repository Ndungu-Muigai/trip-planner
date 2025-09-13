import './App.css'
import GenerateTrip from './Pages/Trip'
import { ToastContainer } from 'react-toastify'

import '@mantine/core/styles.css';

import { MantineProvider } from '@mantine/core'

function App() {

  return (
    <div className='bg-white max-w-screen h-screen text-black'>
      <ToastContainer/>
      <GenerateTrip/>     
    </div>
  )
}

export default App
