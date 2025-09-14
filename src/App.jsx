import './App.css'
import "leaflet/dist/leaflet.css"

import { ToastContainer } from 'react-toastify'
import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'

import GenerateTrip from './Pages/GenerateTrip'
import TripSummary from './Pages/TripDetails'
import Trip from './Pages/Trip'

function App() 
{
  const [tripData, setTripData] = useState()

  console.log(tripData)
  return (
    <div className='bg-white max-w-screen min-h-screen text-black'>
      <ToastContainer/>
      <Routes>
        <Route path='/' element={<GenerateTrip setTripData={setTripData}/>}></Route>
        <Route path='/trips' element={<Trip/>}></Route>
        <Route path='/trip-details' element={<TripSummary tripData={tripData}/>}></Route>
      </Routes>     
    </div>
  )
}

export default App
