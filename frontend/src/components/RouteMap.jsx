import { useEffect, useState, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { decodePolyline } from '../utils/polylineDecoder'
import 'leaflet/dist/leaflet.css'
import './RouteMap.css'

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Component to adjust map bounds
function MapBounds({ bars }) {
  const map = useMap()

  useEffect(() => {
    const barsWithCoords = bars.filter(bar => bar.coordinates)
    if (barsWithCoords.length > 0) {
      const group = new L.featureGroup(
        barsWithCoords.map(bar => L.marker(bar.coordinates))
      )
      if (group.getBounds().isValid()) {
        map.fitBounds(group.getBounds().pad(0.1))
      }
    }
  }, [bars, map])

  return null
}

function RouteMap({ bars, route, apiKey, participantLocations = [] }) {
  const [routePaths, setRoutePaths] = useState([])
  
  // Create custom icon for participant markers (memoized to avoid recreation)
  const participantIcon = useMemo(() => L.divIcon({
    className: 'participant-marker',
    html: '<div class="participant-marker-dot"></div>',
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  }), [])

  useEffect(() => {
    // Decode route paths if available
    if (route?.routePaths && route.routePaths.length > 0) {
      const decodedPaths = route.routePaths.map((polyline, index) => {
        if (polyline) {
          // Check if it's already coordinates (from step path extraction)
          if (typeof polyline === 'object' && polyline.type === 'coordinates' && polyline.path) {
            console.log(`Using direct coordinates for route segment ${index + 1}:`, polyline.path.length, 'points')
            return polyline.path
          }
          
          // Otherwise, decode the encoded polyline string
          try {
            // Decode the polyline to get actual walking route
            const decoded = decodePolyline(polyline)
            console.log(`Decoded route segment ${index + 1}:`, decoded.length, 'points')
            return decoded
          } catch (error) {
            console.error(`Error decoding polyline ${index + 1}:`, error)
            // Fallback to straight line
            if (route.bars && route.bars[index] && route.bars[index + 1]) {
              const current = route.bars[index]
              const next = route.bars[index + 1]
              if (current.coordinates && next.coordinates) {
                return [current.coordinates, next.coordinates]
              }
            }
            return null
          }
        } else {
          // Fallback to straight line for this segment
          if (route.bars && route.bars[index] && route.bars[index + 1]) {
            const current = route.bars[index]
            const next = route.bars[index + 1]
            if (current.coordinates && next.coordinates) {
              return [current.coordinates, next.coordinates]
            }
          }
          return null
        }
      }).filter(path => path !== null)
      
      console.log('Final decoded paths:', decodedPaths.length, 'segments')
      setRoutePaths(decodedPaths)
    } else if (route?.bars && route.bars.length > 1) {
      // Fallback to straight lines if no route paths available
      const straightLines = []
      for (let i = 0; i < route.bars.length - 1; i++) {
        const current = route.bars[i]
        const next = route.bars[i + 1]
        if (current.coordinates && next.coordinates) {
          straightLines.push([current.coordinates, next.coordinates])
        }
      }
      setRoutePaths(straightLines)
    } else {
      setRoutePaths([])
    }
  }, [route])

  if (bars.length === 0) {
    return (
      <div className="map-placeholder">
        <div className="placeholder-content">
          <span className="placeholder-icon">🗺️</span>
          <h3>Add bars to see them on the map</h3>
          <p>Start by adding your first bar using the form on the left</p>
        </div>
      </div>
    )
  }

  // Get center point for initial map view
  const center = bars[0]?.coordinates || [40.7128, -74.0060] // Default to NYC

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapBounds bars={bars} />
      
      {bars
        .filter(bar => bar.coordinates)
        .map((bar, index) => {
          const routeBar = route?.bars?.find(rb => rb.id === bar.id)
          const order = routeBar?.order || null
          
          return (
            <Marker key={bar.id} position={bar.coordinates}>
              <Popup>
                <div className="marker-popup">
                  {order && <span className="route-order">Stop #{order}</span>}
                  <strong>{bar.name}</strong>
                  <p>{bar.address}</p>
                  {bar.capacity && (
                    <p className="capacity-info">
                      Capacity: {bar.currentAttendees || 0} / {bar.capacity}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}
      
      {routePaths.length > 0 && routePaths.map((path, index) => (
        <Polyline
          key={index}
          positions={path}
          color="#667eea"
          weight={4}
          opacity={0.7}
        />
      ))}
      
      {/* Participant location markers */}
      {participantLocations.map((participant) => (
        <Marker
          key={participant.userId}
          position={participant.location}
          icon={participantIcon}
        >
          <Popup>
            <div className="marker-popup">
              <span className="participant-label">👤 Participant</span>
              <strong>{participant.userId}</strong>
              {participant.group && (
                <p className="participant-group">Group {participant.group}</p>
              )}
              {participant.currentBarId && (
                <p className="participant-status">At a bar</p>
              )}
              <p className="location-time">
                Last updated: {new Date(participant.lastUpdate).toLocaleTimeString()}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

export default RouteMap

