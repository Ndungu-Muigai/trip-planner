import './App.css'
import "leaflet/dist/leaflet.css"

import { ToastContainer } from 'react-toastify'
import { Routes, Route } from 'react-router-dom'

import GenerateTrip from './Pages/GenerateTrip'
import TripSummary from './Pages/TripDetails'
import Trip from './Pages/Trip'

function App() 
{
  return (
    <div className='bg-white max-w-screen min-h-screen text-black'>
      <ToastContainer/>
      <Routes>
        <Route path='/' element={<GenerateTrip/>}></Route>
        <Route path='/trips/:id' element={<Trip />}></Route>
      </Routes>     
    </div>
  )
}

export default App
