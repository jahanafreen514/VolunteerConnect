import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, CheckCircle, Navigation, RefreshCw } from 'lucide-react';
import { locationService } from '../../services/locationService';

// Custom Pin for Drag & Drop
const pickerIcon = L.divIcon({
  html: `
    <div class="flex items-center justify-center w-10 h-10 rounded-2xl bg-primary-600 text-white shadow-2xl border-2 border-white transform hover:scale-110 transition-transform animate-bounce">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
    </div>
  `,
  className: 'custom-picker-marker',
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

// Map events handler to allow clicking anywhere to move the marker
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
};

const LocationPickerMap = ({
  initialLat = 16.3067,
  initialLng = 80.4365,
  initialAddress = '',
  onConfirmLocation,
  height = '360px'
}) => {
  const [position, setPosition] = useState([initialLat, initialLng]);
  const [address, setAddress] = useState(initialAddress);
  const [loading, setLoading] = useState(false);
  const markerRef = useRef(null);

  useEffect(() => {
    if (initialLat && initialLng) {
      setPosition([initialLat, initialLng]);
      if (initialAddress) setAddress(initialAddress);
    }
  }, [initialLat, initialLng, initialAddress]);

  const updateLocation = async (lat, lng) => {
    setPosition([lat, lng]);
    setLoading(true);
    try {
      const res = await locationService.reverseGeocode(lat, lng);
      if (res?.data?.formattedAddress) {
        setAddress(res.data.formattedAddress);
      }
      if (onConfirmLocation) {
        onConfirmLocation({
          latitude: lat,
          longitude: lng,
          formattedAddress: res?.data?.formattedAddress || `${lat}, ${lng}`
        });
      }
    } catch (err) {
      console.warn('Reverse geocode warning:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerDragEnd = () => {
    const marker = markerRef.current;
    if (marker) {
      const { lat, lng } = marker.getLatLng();
      updateLocation(lat, lng);
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-white/15 shadow-xl bg-gray-950 flex flex-col">
      {/* Top Notification Bar */}
      <div className="p-3 bg-[#0a0f28]/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between text-xs text-gray-200 z-10">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary-400 shrink-0" />
          <span className="font-semibold text-white">
            Is this your exact location? Drag marker or click map to fine-tune.
          </span>
        </div>
        {loading && (
          <span className="text-cyan-400 flex items-center gap-1 font-medium">
            <RefreshCw className="w-3 h-3 animate-spin" /> Fetching address...
          </span>
        )}
      </div>

      <div style={{ height }}>
        <MapContainer
          center={position}
          zoom={14}
          style={{ height: '100%', width: '100%', zIndex: 10 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler onLocationSelect={updateLocation} />

          <Marker
            position={position}
            draggable={true}
            eventHandlers={{ dragend: handleMarkerDragEnd }}
            ref={markerRef}
            icon={pickerIcon}
          >
            <Popup>
              <div className="p-2 text-gray-900 font-sans">
                <p className="text-xs font-bold text-gray-800">Organization Pin</p>
                <p className="text-[11px] text-gray-500">Drag to adjust coordinates</p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Address Confirmation Ribbon */}
      <div className="p-3 bg-[#0a0f28]/95 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex-1 pr-2">
          <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Detected Location:</span>
          <p className="text-white font-medium truncate mt-0.5">{address || `${position[0].toFixed(4)}, ${position[1].toFixed(4)}`}</p>
        </div>

        <button
          type="button"
          onClick={() => onConfirmLocation && onConfirmLocation({ latitude: position[0], longitude: position[1], formattedAddress: address })}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all shrink-0"
        >
          <CheckCircle className="w-4 h-4" /> Confirm Location
        </button>
      </div>
    </div>
  );
};

export default LocationPickerMap;
