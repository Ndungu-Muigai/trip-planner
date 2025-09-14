import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { FiInfo, FiClock, FiMap, FiX } from "react-icons/fi"
import { useState } from "react"

const Trip = () => 
{
    const [distanceBreakdown, setDistanceBreakdown] = useState(false)

    return (
        <div className="pt-4 w-11/12 md:w-4/5 mx-auto">

            {/* Map Section */}
            <div className="relative rounded-lg overflow-hidden">
                <MapContainer zoom={13} className="h-64 md:h-72 w-full z-10">
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy OpenStreetMap contributors"/>
                    <Marker position={[0, 0]}>
                        <Popup>You are here</Popup>
                    </Marker>
                </MapContainer>
            </div>

            {/* Trip Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* Distance Card */}
                <div className="flex items-center justify-between bg-white shadow-md rounded-lg p-4 cursor-pointer">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Distance</p>
                        <p className="text-xl font-bold text-gray-800">1,239 miles</p>
                    </div>
                    <FiInfo size={24} className="text-blue-500 hover:text-blue-600 transition-colors" onClick={() => setDistanceBreakdown(true)} title="Click to view trip details"/>
                </div>
                {/* Estimate Time Card */}
                <div className="flex items-center justify-between bg-white shadow-md rounded-lg p-4 cursor-pointer">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Trip Estimate Time</p>
                        <p className="text-xl font-bold text-gray-800">23h 30m</p>
                    </div>
                    <FiClock size={24} className="text-green-500 hover:text-green-600 transition-colors"/>
                </div>
            </div>
            
            {/* Distance Breakdown Modal */}
            {
                distanceBreakdown && 
                (
                    <div className="fixed inset-0 z-10 overflow-y-auto flex items-center justify-center px-4">

                            {/* Background overlay */}
                            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                            </div>

                            {/* Modal Content */}
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:align-middle sm:max-w-md w-full">
                                <div className="bg-white px-4 pt-5 pb-3 sm:p-6 sm:pb-5 relative">
                                    {/* Close Button */}
                                    <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-800" onClick={() => setDistanceBreakdown(false)}>
                                        <FiX size={20} />
                                    </button>

                                    {/* Modal Header */}
                                    <div className="flex items-center mb-4">
                                        <FiInfo className="text-blue-500 mr-2" />
                                        <h2 className="text-lg font-semibold text-gray-800">Distance Breakdown</h2>
                                    </div>

                                    {/* Distance Segments */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between bg-gray-50 p-3 rounded-md shadow-sm">
                                            <p className="text-gray-600">Current location → Pickup:</p>
                                            <p className="font-medium text-gray-800">12.02 miles</p>
                                        </div>
                                        <div className="flex justify-between bg-gray-50 p-3 rounded-md shadow-sm">
                                            <p className="text-gray-600">Pickup → Dropoff:</p>
                                            <p className="font-medium text-gray-800">31.67 miles</p>
                                        </div>
                                        <div className="flex justify-between bg-gray-50 p-3 rounded-md shadow-sm">
                                            <p className="text-gray-600">Total:</p>
                                            <p className="font-bold text-gray-900">43.69 miles</p>
                                        </div>
                                    </div>

                                </div>
                            </div>
                    </div>
                )
            }

            {/* Driving timeline */}
            <div className="mt-4">
                <h2 className="text-lg font-semibold mb-3">Driver Timeline (HOS)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="border rounded p-4 bg-inherit shadow hover:shadow-lg transition mb-4">
                        <h3 className="font-bold mb-2 text-indigo-700">Day 1</h3>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">#</th>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Duration</th>
                                </tr>
                            </thead> 
                            <tbody className="divide-y divide-gray-200">
                                <tr className="hover:bg-gray-50">
                                    <td className="px-4 py-2 text-sm text-gray-800">1</td>
                                    <td className="px-4 py-2 text-sm text-gray-800">Driving</td>
                                    <td className="px-4 py-2 text-sm text-gray-800">12 hours</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-4 py-2 text-sm text-gray-800">2</td>
                                    <td className="px-4 py-2 text-sm text-gray-800">Pick up</td>
                                    <td className="px-4 py-2 text-sm text-gray-800">1 hours</td>
                                </tr>
                            </tbody>
                            <tr className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-sm text-gray-800">3</td>
                                <td className="px-4 py-2 text-sm text-gray-800">Fueling</td>
                                <td className="px-4 py-2 text-sm text-gray-800">30 minutes</td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Trip