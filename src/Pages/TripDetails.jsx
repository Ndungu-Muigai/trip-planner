import React from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
/**
 * Helper: Group logs into days
 */
const groupLogsByDay = (logs) => {
  let days = [];
  let currentDay = [];
  let dayCount = 1;

  logs.forEach((log) => {
    currentDay.push(log);

    // Split when daily reset appears
    if (log.status.includes("Daily Reset")) {
      days.push({ day: dayCount, logs: currentDay });
      currentDay = [];
      dayCount++;
    }
  });

  if (currentDay.length > 0) {
    days.push({ day: dayCount, logs: currentDay });
  }

  return days;
};

/**
 * Stop marker colors
 */
const stopColor = {
  pickup: "green",
  dropoff: "red",
  fuel: "orange",
  break: "yellow",
  daily_reset: "purple",
  default: "blue",
};

/**
 * Helper: Convert decimal hours to hours and minutes
 */
const formatHours = (decimalHours) => {
  if (!decimalHours) return "0h 0m";
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  return `${hours}h ${minutes}m`;
};

/**
 * TripSummary component
 * props:
 * - tripData: response from Django (legs, logs, geojson, stops, remaining_cycle_hours)
 */
const TripSummary = ({ tripData }) => 
{
    const navigate=useNavigate()

  if (!tripData) {
    return <p className="text-gray-500">No trip data available.</p>;
  }

  const { logs, geojson, legs, remaining_cycle_hours, stops } = tripData;

  // Extract all LineString routes from GeoJSON
  let allRoutes = [];
  try {
    const lines = geojson.features.filter(
      (f) => f.geometry.type === "LineString"
    );
    allRoutes = lines.map((line) =>
      line.geometry.coordinates.map((c) => [c[1], c[0]])
    );
  } catch (e) {
    console.error("Failed to parse routes:", e);
  }

  const groupedLogs = groupLogsByDay(logs);

  return (
    <div className="mt-8 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold mb-4">Trip Summary</h1>
        <button className="btn btn-success" onClick={()=>navigate("/")}>Back</button>
      </div>

      {/* Map Section */}
      {allRoutes.length > 0 && (
        <MapContainer
          center={allRoutes[0][0]}
          zoom={6}
          className="h-96 w-full rounded-lg shadow mb-6"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {/* Render all routes */}
          {allRoutes.map((coords, idx) => (
            <Polyline
              key={idx}
              positions={coords}
              color={idx === 0 ? "blue" : "red"}
              weight={4}
            />
          ))}

          {/* Stops Markers */}
          {Array.isArray(stops) &&
            stops.map((stop, idx) => {
              const [lon, lat] = stop.location;
              const color = stopColor[stop.type] || stopColor.default;

              return (
                <Marker
                  key={idx}
                  position={[lat, lon]}
                  icon={L.divIcon({
                    className: "custom-stop-marker",
                    html: `<div style="background:${color}; width:16px; height:16px; border-radius:50%; border:2px solid #000"></div>`,
                  })}
                >
                  <Popup>
                    <strong>{stop.type}</strong>
                    <br />
                    {stop.label || ""}
                  </Popup>
                </Marker>
              );
            })}
        </MapContainer>
      )}

      {/* Legs info */}
      <div className="bg-gray-50 p-4 rounded mb-6 shadow">
        <h2 className="text-lg font-semibold mb-2">Legs</h2>
        <ul className="list-disc ml-6">
          {Array.isArray(legs) && legs.length > 0 ? (
            legs.map((leg, idx) => (
              <li key={idx}>
                <strong>{leg.label}:</strong>{" "}
                {leg.distance_miles} miles, {formatHours(leg.duration_hours)}
              </li>
            ))
          ) : (
            <li>No legs data available</li>
          )}
        </ul>
        <p className="mt-2 font-medium">
          <strong>Remaining Cycle Hours:</strong> {formatHours(remaining_cycle_hours)}
        </p>
      </div>

      {/* Timeline grouped by days */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Driver Timeline (HOS)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {groupedLogs.map((day, idx) => (
    <div
      key={idx}
      className="border rounded p-4 bg-white shadow hover:shadow-lg transition"
    >
      <h3 className="font-bold mb-3 text-indigo-700">Day {day.day}</h3>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">#</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Duration</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {day.logs.map((log, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="px-4 py-2 text-sm text-gray-800">{i + 1}</td>
              <td className="px-4 py-2 text-sm text-gray-800">{log.status}</td>
              <td className="px-4 py-2 text-sm text-gray-800">{formatHours(log.duration_hours)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ))}
</div>

      </div>
    </div>
  );
};

export default TripSummary;
