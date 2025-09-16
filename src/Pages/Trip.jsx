/* eslint-disable react-hooks/exhaustive-deps */
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet"
import { FiClock, FiMapPin, FiTrendingUp, FiX } from "react-icons/fi"
import { Link, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

import jsPDF from "jspdf"
import Log from "/Log.png"

const TripSummary = () => 
{
    const {id} = useParams()
    const [trip, setTrip] = useState()

    const [legModal, setLegModal] = useState(false)
    const [selectedLeg, setSelectedLeg] = useState()

    const BACKEND_URL=import.meta.env.VITE_BACKEND_URL

    const fetchData = async () => 
    {
        try 
        {
            const response = await fetch(`${BACKEND_URL}/api/trips/${id}/`)
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

    //Generating the EDS log
    const generateEDS = trip =>
    {
        const doc = new jsPDF("p", "mm", "a4")

        // Add the background template
        doc.addImage(Log, "PNG", 0, 0, 210, 297)

        // Example overlays
        doc.setFontSize(10)
        doc.text(new Date(trip.created_at).toLocaleDateString(), 160, 25)
        doc.text(`TRIP-${trip.id}`, 160, 32)
        doc.text(trip.user?.name || "N/A", 40, 40)

        // Pickup & Dropoff
        doc.text(`${trip.legs[0].start_location}`, 40, 55)
        doc.text(`${trip.legs[0].end_location}`, 40, 63)

        // Distance + Duration
        doc.text(`${trip.legs[0].distance} km`, 160, 55)
        doc.text(`${trip.legs[0].driving_hours} hrs`, 160, 63)

        // Instead of saving → open in new tab
        const pdfBlob = doc.output("blob")
        const pdfUrl = URL.createObjectURL(pdfBlob)
        window.open(pdfUrl, "_blank")
    }

    return (
        <div className="pt-2 w-4/5 mx-auto space-y-2">
            {/* Top Buttons */}
            <div className="flex justify-end gap-4 mb-2">
                <Link to={"/"} className="btn btn-success text-white transition">Add New Trip</Link>
                <Link to={"/trips"} className="btn btn-info text-white transition">View All Trips</Link>
            </div>

            {/* Map at the top */}
            <div className="h-[350px] w-full rounded-lg overflow-hidden shadow">
                <MapContainer center={[pickup_location[0], pickup_location[1]]} zoom={13} scrollWheelZoom={true} className="h-full w-full z-0">
                <TileLayer attribution='&copy OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
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
                        legs?.map((leg, idx) => 
                        {
                            const coords = leg.geometry?.coordinates?.map(c => [c[1], c[0]]) || []
                            return (
                                <Polyline key={`leg-${idx}`} positions={coords} color={legColors[idx % legColors.length]} weight={5} eventHandlers={
                                    {
                                        click: ()=> {
                                            setSelectedLeg({ steps: leg.steps, idx })
                                            setLegModal(true)
                                        }
                                    }
                                }/>
                            )
                        })
                    }
                </MapContainer>
            </div>

            {/* Trip Summary */}
            <div className="bg-white shadow rounded-lg p-4">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <h2 className="text-lg font-semibold mb-2 uppercase underline">Trip Summary</h2>
                    <button className="btn btn-success text-white hidden md:block" onClick={()=> generateEDS(trip)}>Generate EDS log</button>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
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
                <div className="flex justify-center mt-2 md:hidden">
                    <button className="btn btn-success text-white" onClick={()=> generateEDS(trip)}>Generate EDS log</button>
                </div>
            </div>

            {/* Steps modal */}
            {
                legModal &&
                    <div className="fixed inset-0 z-50 backdrop-blur-sm bg-opacity-80 flex justify-center items-center p-4">
                        <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-lg shadow-lg overflow-y-auto p-6 relative">
                            <button className="absolute top-4 right-4 text-gray-700 hover:text-gray-900" onClick={() => 
                            {
                                setSelectedLeg(null)
                                setLegModal(false)
                            }}>
                                <FiX size={24} />
                            </button>
                            <h2 className="text-xl font-semibold mb-4" style={{ color: legColors[selectedLeg.idx % legColors.length] }}>Leg {selectedLeg.idx + 1} Steps</h2>
                            <ol className="list-decimal list-inside space-y-2">
                            {
                                selectedLeg.steps.map((step, idx) => (
                                    <li key={`step-${idx}`}> 
                                        {step.instruction} ({(step.distance / 1609.34).toFixed(2)} mi, {(step.duration / 3600).toFixed(2)} hrs)
                                    </li>
                                ))
                            }
                            </ol>
                        </div>
                    </div>
            }
        </div>
    )
}

export default TripSummary
