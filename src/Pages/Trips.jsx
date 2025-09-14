import { useEffect, useState, useRef } from "react"
import { toast } from "react-toastify"
import { Link } from "react-router-dom"

const TRIPS_PER_PAGE = 5

const AllTrips = () => 
{
    const [trips, setTrips] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)

    // Cache for location names
    const locationCache = useRef({})

    const fetchTrips = async () => 
    {
        try 
        {
            const response = await fetch("http://127.0.0.1:8000/api/trips/")
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
            const data = await response.json()
            setTrips(data)
        } 
        catch (error) 
        {
            toast.error("Failed to fetch trips: " + error.message)
        } 
        finally 
        {
            setLoading(false)
        }
    }

    useEffect(() => 
    {
        fetchTrips()
    }, [])

    // Pagination
    const indexOfLastTrip = currentPage * TRIPS_PER_PAGE
    const indexOfFirstTrip = indexOfLastTrip - TRIPS_PER_PAGE
    const currentTrips = trips.slice(indexOfFirstTrip, indexOfLastTrip)
    const totalPages = Math.ceil(trips.length / TRIPS_PER_PAGE)

    const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1))
    const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages))

    return (
        <div className="p-2.5 w-11/12 mx-auto">
            <h2 className="text-2xl font-semibold mb-1.5">All Trips</h2>

            <table className="min-w-full bg-white shadow rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="py-2 px-4 text-left">Pickup Location</th>
                        <th className="py-2 px-4 text-left">Dropoff Location</th>
                        <th className="py-2 px-4 text-left">Distance (miles)</th>
                        <th className="py-2 px-4 text-left">Duration (hrs)</th>
                        <th className="py-2 px-4 text-left">View</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        loading 
                        ? 
                            (
                                // Show spinner rows while loading trips
                                Array.from({ length: TRIPS_PER_PAGE }).map((_, idx) => 
                                (
                                    <tr key={idx} className="border-b">
                                        <td colSpan={5} className="py-6 text-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                                        </td>
                                    </tr>
                                ))
                            ) 
                        : 
                            currentTrips.length === 0 
                            ? 
                                (
                                    <tr>
                                        <td colSpan={5} className="py-4 text-center text-gray-500">No trips found.</td>
                                    </tr>
                                ) 
                            : 
                                (
                                    currentTrips.map((trip) => (
                                        <TripRow key={trip.id} trip={trip} locationCache={locationCache} />
                                    ))
                                )
                    }
                </tbody>
            </table>

            {/* Pagination */}
            {
                !loading && currentTrips.length > 0 && 
                (
                    <div className="flex justify-center gap-4 mt-2.5">
                        <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={handlePrevPage} disabled={currentPage === 1}>Previous</button>
                        <span className="px-2 py-2">Page {currentPage} of {totalPages}</span>
                        <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={handleNextPage} disabled={currentPage === totalPages}>Next</button>
                    </div>
                )
            }
        </div>
    )
}

// Component for a single row that fetches location names with caching
const TripRow = ({ trip, locationCache }) => 
{
    const [pickupName, setPickupName] = useState("")
    const [dropoffName, setDropoffName] = useState("")
    const [loadingRow, setLoadingRow] = useState(true)

    useEffect(() => 
    {
        const fetchLocation = async (lat, lon) => 
        {
            const key = `${lat},${lon}`
            if (locationCache.current[key]) return locationCache.current[key]

            try 
            {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
                const data = await res.json()
                const name = data.display_name || key
                locationCache.current[key] = name
                return name
            } 
            catch 
            {
                return key
            }
        }

        const fetchNames = async () => 
        {
            setLoadingRow(true)
            const pickup = await fetchLocation(trip.pickup_location[0], trip.pickup_location[1])
            const dropoff = await fetchLocation(trip.dropoff_location[0], trip.dropoff_location[1])
            setPickupName(pickup)
            setDropoffName(dropoff)
            setLoadingRow(false)
        }

        fetchNames()
    }, [trip, locationCache])

    return loadingRow 
    ? 
        (
            <tr className="border-b">
                <td colSpan={5} className="py-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                </td>
            </tr>
        ) 
    : 
        (
            <tr className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">{pickupName}</td>
                <td className="py-2 px-4">{dropoffName}</td>
                <td className="py-2 px-4">{trip.distance}</td>
                <td className="py-2 px-4">{trip.duration}</td>
                <td className="py-2 px-4">
                    <Link to={`/trips/${trip.id}`} className="btn btn-info text-white transition">View</Link>
                </td>
            </tr>
        )
}

export default AllTrips