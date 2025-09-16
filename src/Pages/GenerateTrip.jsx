/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { toast } from "react-toastify"
import { Link, useNavigate } from "react-router-dom"
import { CircularProgress } from "@mui/material"

const GenerateTrip = () => 
{
    const navigate = useNavigate()
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

    // Queries and results
    const [pickupQuery, setPickupQuery] = useState("")
    const [dropoffQuery, setDropoffQuery] = useState("")
    const [pickupResults, setPickupResults] = useState([])
    const [dropoffResults, setDropoffResults] = useState([])

    // Selected values
    const [selectedPickup, setSelectedPickup] = useState(null)
    const [selectedDropoff, setSelectedDropoff] = useState(null)

    // Prevent double fetch
    const [pickupSelected, setPickupSelected] = useState(false)
    const [dropoffSelected, setDropoffSelected] = useState(false)

    // Loading states
    const [pickupLoading, setPickupLoading] = useState(false)
    const [dropoffLoading, setDropoffLoading] = useState(false)

    const [currentLocation, setCurrentLocation] = useState(null)
    const [cycle, setCycle] = useState()

    const [generatingTrip, setGeneratingTrip] = useState(false)

    // Fetch current location
    useEffect(() => 
    {
        if (navigator.geolocation) 
        {
            navigator.geolocation.getCurrentPosition(position => setCurrentLocation([position.coords.latitude, position.coords.longitude,]))
        }
    }, [])

    // Pickup search
    useEffect(() => 
    {
        if (pickupQuery.length > 2 && !pickupSelected) 
        {
            setPickupLoading(true)
            const timeOut = setTimeout(() => 
            {
                fetch(`${BACKEND_URL}/api/locations/search?text=${pickupQuery}`)
                .then((response) => response.json())
                .then((data) => setPickupResults(data.features || []))
                .catch((err) => toast.error(err))
                .finally(() => setPickupLoading(false))
            }, 500)

            return () => clearTimeout(timeOut)
        }
    }, [pickupQuery, pickupSelected])

    // Dropoff search
    useEffect(() => 
    {
        if (dropoffQuery.length > 2 && !dropoffSelected) 
        {
            setDropoffLoading(true)
            const timeOut = setTimeout(() => 
            {
                fetch(`${BACKEND_URL}/api/locations/search?text=${dropoffQuery}`)
                .then((response) => response.json())
                .then((data) => setDropoffResults(data.features || []))
                .catch((err) => toast.error(err))
                .finally(() => setDropoffLoading(false))
            }, 500)

            return () => clearTimeout(timeOut)
        }
    }, [dropoffQuery, dropoffSelected])

    const generateTrip = async e => 
    {
        e.preventDefault()
        if (!selectedPickup || !selectedDropoff || !cycle) 
        {
            toast.error("Please fill out all the fields")
            return
        }

        const body = 
        {
            current_location: currentLocation,
            pickup_location: [selectedPickup[1], selectedPickup[0]],
            dropoff_location: [selectedDropoff[1], selectedDropoff[0]],
            cycle_used: cycle,
        }

        try 
        {
            setGeneratingTrip(true)
            const response = await fetch(`${BACKEND_URL}/api/trips/`, 
            {
                method: "POST",
                headers: 
                {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(body),
            })

            if (!response.ok) 
            {
                const error = await response.json()
                toast.error(error)
                return
            }

            const data = await response.json()
            navigate(`/trips/${data.id}`)
            toast.success("Trip created successfully")
            setGeneratingTrip(false)
        } 
        catch (error) 
        {
            toast.error(`Error creating trip: ${error}`)
        }
    }

    return (
        <div className="pt-3 w-4/5 mx-auto">
            {
                currentLocation && (
                    <MapContainer center={currentLocation} zoom={13} className="h-56 rounded-lg shadow z-10">
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy OpenStreetMap contributors"/>
                        <Marker position={currentLocation}>
                            <Popup>You are here</Popup>
                        </Marker>
                    </MapContainer>
                )
            }

            <form onSubmit={generateTrip} className="mt-9">
                <div className="flex flex-col justify-center md:flex-row gap-6">
                    {/* Pickup Input */}
                    <div className="relative w-full">
                        <input type="search" className="input bg-inherit border border-black w-full" required placeholder="Enter pick up location" disabled={generatingTrip} value={pickupQuery}
                        onChange={(e) => 
                        {
                            setPickupQuery(e.target.value)
                            setPickupSelected(false)
                        }}/>
                        {
                            pickupLoading && 
                            (
                                <div className="absolute z-10 bg-white border border-gray-300 w-full p-2 text-gray-500 flex justify-center items-center">
                                    <CircularProgress size={22} />
                                </div>
                            )
                        }
                        {
                            pickupResults.length > 0 && 
                            (
                                <ul className={`bg-white border border-gray-300 w-full max-h-40 overflow-y-auto ${pickupResults.length > 0 ? "mt-1" : ""} md:absolute md:mt-0 md:z-10`}>
                                    {
                                        pickupResults.map((item, idx) => (
                                        <li key={idx} className="p-2 hover:bg-gray-200 cursor-pointer" onClick={() => 
                                            {
                                            setPickupQuery(item.properties.label)
                                            setSelectedPickup(item.geometry.coordinates)
                                            setPickupResults([])
                                            setPickupSelected(true)
                                            }}>{item.properties.label}</li>
                                        ))
                                    }
                                </ul>
                            )
                        }
                    </div>

                    {/* Dropoff Input */}
                    <div className="relative w-full">
                        <input type="search" className="input bg-inherit border border-black w-full" required disabled={generatingTrip} placeholder="Enter drop off location" value={dropoffQuery}
                        onChange={e => 
                        {
                            setDropoffQuery(e.target.value)
                            setDropoffSelected(false)
                        }}/>
                        {
                            dropoffLoading && 
                            (
                            <div className="absolute z-10 bg-white border border-gray-300 w-full p-2 text-gray-500 flex justify-center items-center">
                                <CircularProgress size={22} />
                            </div>
                            )
                        }
                        {
                            dropoffResults.length > 0 && (
                            <ul className={` bg-white border border-gray-300 w-full max-h-40 overflow-y-auto ${dropoffResults.length > 0 ? "mt-1" : ""} md:absolute md:mt-0 md:z-10`}>
                                {dropoffResults.map((item, idx) => (
                                <li key={idx} className="p-2 hover:bg-gray-200 cursor-pointer" onClick={() => 
                                    {
                                        setDropoffQuery(item.properties.label)
                                        setSelectedDropoff(item.geometry.coordinates)
                                        setDropoffResults([])
                                        setDropoffSelected(true)
                                    }}>{item.properties.label}</li>
                                ))}
                            </ul>
                            )
                        }
                    </div>

                    {/* Cycle Select */}
                    <select defaultValue="Select your current cycle" className="select bg-inherit border-black w-full z-50" value={cycle} onChange={(e) => setCycle(e.target.value)} disabled={generatingTrip}>
                        <option disabled={true}>Select your current cycle</option>
                        <option value={11}>11 hour cycle</option>
                        <option value={14}>14 hour cycle</option>
                    </select>
                </div>

                <div className="flex justify-center items-center gap-12 mt-5">
                    <button className="btn btn-success text-white" type="submit" disabled={generatingTrip}>
                        {
                            generatingTrip
                            ?
                                <CircularProgress size={22}/>
                            :
                                "Generate new trip"
                        }
                    </button>
                    <Link to="/trips" className="btn btn-info text-white" disabled={generatingTrip}>
                        {
                            generatingTrip
                            ?
                                <CircularProgress size={22}/>
                            :
                                "View generated trips"
                        }
                    </Link>
                </div>
            </form>
        </div>
    )
}

export default GenerateTrip