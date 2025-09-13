import { useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { toast } from "react-toastify"

const GenerateTrip = () => 
{
    const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImM3ZjRhNTExNDc4YzQyMTFhMjJiN2RkYTgzNWQ2ZGRiIiwiaCI6Im11cm11cjY0In0="

    //Setting the query parameters and the results
    const [pickupQuery, setPickupQuery] = useState("");
    const [dropoffQuery, setDropoffQuery] = useState("");
    const [pickupResults, setPickupResults] = useState([]);
    const [dropoffResults, setDropoffResults] = useState([]);

    const [selectedPickup, setSelectedPickup] = useState(null);
    const [selectedDropoff, setSelectedDropoff] = useState(null)

    const [currentLocation, setCurrentLocation] = useState(null);
    const [cycle, setCycle] = useState()

    //Fetching the current location
    useEffect(()=>
    {
        if(navigator.geolocation)
        {
            navigator.geolocation.getCurrentPosition(position => setCurrentLocation([position.coords.latitude, position.coords.longitude]))
        }
    },[])

    //Searching pickup locations based on user input
    useEffect(()=>
    {
        if(pickupQuery.length > 2)
        {
            fetch(`https://api.openrouteservice.org/geocode/autocomplete?api_key=${ORS_API_KEY}&text=${pickupQuery}`)
            .then(response => response.json())
            .then(data => 
            {
                setPickupResults(data.features || [])
            })
            .catch(console.error)
        }
    },[pickupQuery])

    //Searching dropoff locations based on user input
    useEffect(()=>
    {
        if(dropoffQuery.length > 2)
        {
            fetch(`https://api.openrouteservice.org/geocode/autocomplete?api_key=${ORS_API_KEY}&text=${dropoffQuery}`)
            .then(response => response.json())
            .then(data => 
            {
                console.log(data)
                setDropoffResults(data.features || [])
            })
            .catch(console.error)
        }
    },[dropoffQuery])

    const generateTrip = e =>
    {
        e.preventDefault()
        if(!selectedPickup || !selectedDropoff || !cycle)
        {
            toast.error("Please fill out all the fields")
            return;
        }

        const data = {pickupResults, dropoffResults, cycle}
        console.log("Form submitted: ", data)
    }

    return ( 
        <div className="pt-3 w-4/5 mx-auto">
            {
                currentLocation && 
                <MapContainer center={currentLocation} zoom={13} className="h-56 rounded-lg shadow z-10">
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors"/>
                    <Marker position={currentLocation}>
                        <Popup>You are here</Popup>
                    </Marker>
                </MapContainer>
            }
            <form onSubmit={generateTrip} className="mt-9">
                <div className="flex flex-col justify-center md:flex-row gap-6">
                    <div className="relative w-full">
                        <input type="search" className="input bg-inherit border border-black " required placeholder="Enter pick up location" value={pickupQuery} onChange={e => setPickupQuery(e.target.value)}/>
                        {
                            pickupResults.length > 0 &&
                            <ul className="absolute z-10 bg-white border border-gray-300 w-full max-h-40 overflow-y-auto">
                                {
                                    pickupResults.map((item, idx) =>
                                    {
                                        return(
                                            <li key={idx} className="p-2 hover:bg-gray-200 cursor-pointer" onClick={()=>
                                            {
                                                setPickupQuery(item.properties.label)
                                                setSelectedPickup(item.properties.label)
                                                setPickupResults([])
                                            }
                                            }>{item.properties.label}</li>
                                        )
                                    })
                                }
                            </ul>
                        }
                    </div>
                    <div className="relative w-full">
                        <input type="search" className="input bg-inherit border border-black " required placeholder="Enter drop off location" value={dropoffQuery} onChange={e => setDropoffQuery(e.target.value)}/>
                        {
                            dropoffResults.length > 0 &&
                            <ul className="absolute z-10 bg-white border border-gray-300 w-full max-h-40 overflow-y-auto">
                                {
                                    dropoffResults.map((item, idx) =>
                                    {
                                        return(
                                            <li key={idx} className="p-2 hover:bg-gray-200 cursor-pointer" onClick={()=>
                                            {
                                                setDropoffQuery(item.properties.label)
                                                setSelectedDropoff(item.properties.label)
                                                setDropoffResults([])
                                            }
                                            }>{item.properties.label}</li>
                                        )
                                    })
                                }
                            </ul>
                        }
                    </div>
                    <select defaultValue="Select your current cycle" className="select bg-inherit border-black w-full z-50" value={cycle} onChange={e => setCycle(e.target.value)}>
                        <option disabled={true}>Select your current cycle</option>
                        <option value={"11"}>11 hour cycle</option>
                        <option value={"14"}>14 hour cycle</option>
                    </select>
                </div>

                <div className="flex justify-center mt-5">
                    <button className="btn btn-success text-white" type="submit">Generate trip details</button>
                </div>
            </form>
        </div>
     );
}
 
export default GenerateTrip;