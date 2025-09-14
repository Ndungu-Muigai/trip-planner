/* eslint-disable react-hooks/exhaustive-deps */
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { FiClock, FiMapPin, FiTrendingUp } from "react-icons/fi"
import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

const TripSummary = () => 
{
    const {id} = useParams()
    const [trip, setTrip] = useState()

    const fetchData = async () => 
    {
        try 
        {
            const response = await fetch(`http://127.0.0.1:8000/api/trips/${id}/`)
            if (!response.ok) 
            {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            const data = await response.json()
            setTrip(data)
        } 
        catch (error) 
        {
            toast.error("Failed to fetch trip data: " + error.message)
        }
    }

    useEffect(()=>
    {
        fetchData()
    },[id])

    if (!trip) return <div>Loading...</div>

    const { duration, current_location, pickup_location, dropoff_location, distance, driving_hours, rests, fuel_stops, legs } = trip

    // Define colors for legs
    const legColors = ["blue", "green", "orange", "purple"]

    return (
        <div className="p-4 space-y-2">
            {/* Map at the top */}
            <div className="h-[400px] w-full rounded-lg overflow-hidden shadow">
                <MapContainer center={[pickup_location[0], pickup_location[1]]} zoom={13} scrollWheelZoom={true} className="h-full w-full">
                <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                    <Marker position={current_location}>
                        <Popup>Current location</Popup>
                    </Marker>
                    <Marker position={pickup_location}>
                        <Popup>Pickup</Popup>
                    </Marker>
                    <Marker position={dropoff_location}>
                        <Popup>Dropoff</Popup>
                    </Marker>

                    {/* Render each leg with different color */}
                    {
                        legs?.map((leg, idx) => {
                            const coords = leg.geometry?.coordinates?.map(c => [c[1], c[0]]) || []
                            return (
                                <Polyline key={`leg-${idx}`} positions={coords} color={legColors[idx % legColors.length]} weight={5}/>
                            )
                        })
                    }
                </MapContainer>
            </div>

            {/* Trip Summary */}
            <div className="bg-white shadow rounded-lg px-4 py-3">
                <h2 className="text-lg font-semibold mb-2">Trip Summary</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                        <FiClock className="text-blue-500" />
                        <span><strong>{duration}</strong> hrs total</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FiTrendingUp className="text-green-500" />
                        <span><strong>{driving_hours}</strong> hrs driving</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FiMapPin className="text-red-500" />
                        <span>{distance} miles</span>
                    </div>
                    <div>
                        <span>Rests: {rests?.length || 0}</span><br />
                        <span>Fuel stops: {fuel_stops || 0}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TripSummary
