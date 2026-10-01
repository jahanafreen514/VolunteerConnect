import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ExternalLink, Navigation, Award, ShieldCheck, Newspaper, MapPin, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

// Fix Leaflet's default icon paths for Vite/bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom SVGs for Pastel Markers
const createCustomIcon = (type) => {
  let iconHtml = '';
  if (type === 'user') {
    iconHtml = `
      <div class="relative flex items-center justify-center w-8 h-8">
        <span class="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-[#BFD8C2]"></span>
        <span class="relative inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#D8EEE5] text-[#244e44] font-bold shadow-md border-2 border-white">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3" fill="currentColor"></circle></svg>
        </span>
      </div>
    `;
  } else if (type === 'ngo') {
    iconHtml = `
      <div class="flex items-center justify-center w-8 h-8 rounded-2xl bg-[#BFD8C2] text-[#26372B] shadow-md border-2 border-white transform hover:scale-105 transition-transform">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path></svg>
      </div>
    `;
  } else if (type === 'news') {
    iconHtml = `
      <div class="flex items-center justify-center w-8 h-8 rounded-2xl bg-[#F6D8C5] text-[#7a4221] shadow-md border-2 border-white transform hover:scale-105 transition-transform">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path><path d="M18 14h-8"></path><path d="M15 18h-5"></path><path d="M10 6h8v4h-8V6Z"></path></svg>
      </div>
    `;
  } else {
    // Opportunity Marker: Soft Powder Blue
    iconHtml = `
      <div class="flex items-center justify-center w-8 h-8 rounded-2xl bg-[#C9DDF2] text-[#24426b] shadow-md border-2 border-white transform hover:scale-105 transition-transform">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
      </div>
    `;
  }

  return L.divIcon({
    html: iconHtml,
    className: 'custom-leaflet-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
  });
};

// Component to dynamically re-center map when props change
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || 12, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
};

const InteractiveMap = ({
  userLocation,
  opportunities = [],
  ngos = [],
  newsEvents = [],
  center = [16.3067, 80.4365],
  zoom = 11,
  height = '500px',
  className = ''
}) => {
  const mapCenter = userLocation?.lat && userLocation?.lng 
    ? [userLocation.lat, userLocation.lng] 
    : center;

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-[#E6E8EC] shadow-soft-md bg-white ${className}`} style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', zIndex: 10 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater center={mapCenter} zoom={zoom} />

        {/* 1. Volunteer User Current Location Marker */}
        {userLocation?.lat && userLocation?.lng && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={createCustomIcon('user')}
          >
            <Popup className="custom-leaflet-popup">
              <div className="p-2 text-[#354052] font-sans">
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D8EEE5] text-[#244e44] mb-1">
                  YOU ARE HERE
                </span>
                <p className="text-xs font-bold text-[#26372B]">Your Current Location</p>
                <p className="text-[11px] text-[#667085]">Discovering nearby community opportunities</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* 2. Verified NGOs Markers */}
        {ngos.map((ngo) => {
          const lat = ngo.latitude || ngo.location?.coordinates?.[1];
          const lng = ngo.longitude || ngo.location?.coordinates?.[0];
          if (!lat || !lng) return null;

          return (
            <Marker
              key={ngo._id || ngo.id}
              position={[lat, lng]}
              icon={createCustomIcon('ngo')}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-3 text-[#354052] font-sans max-w-[240px]">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D8EEE5] text-[#244e44] flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-[#54947f]" /> VERIFIED NGO
                    </span>
                    {ngo.distanceKm !== undefined && (
                      <span className="text-[11px] font-medium text-[#667085]">
                        {ngo.distanceKm} km away
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-[#26372B] line-clamp-1">{ngo.organizationName}</h4>
                  <p className="text-xs text-[#667085] line-clamp-2 mt-0.5">{ngo.description || ngo.address}</p>

                  <div className="mt-3 pt-2 border-t border-[#E6E8EC] flex items-center justify-between text-xs">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#556e5a] font-semibold hover:underline"
                    >
                      <Navigation className="w-3 h-3" /> Directions
                    </a>
                    {ngo.userId && (
                      <Link
                        to={`/opportunities?ngoId=${ngo.userId._id || ngo.userId}`}
                        className="text-[#466c9c] font-semibold hover:underline"
                      >
                        View Events →
                      </Link>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 3. Published Opportunities Markers */}
        {opportunities.map((opp) => {
          const lat = opp.latitude || opp.location?.latitude || opp.location?.coordinates?.[1];
          const lng = opp.longitude || opp.location?.longitude || opp.location?.coordinates?.[0];
          if (!lat || !lng) return null;

          return (
            <Marker
              key={opp._id}
              position={[lat, lng]}
              icon={createCustomIcon('opportunity')}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-3 text-[#354052] font-sans max-w-[240px]">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C9DDF2] text-[#24426b]">
                      {opp.category || 'OPPORTUNITY'}
                    </span>
                    {opp.distanceKm !== undefined && (
                      <span className="text-[11px] font-medium text-[#667085]">
                        {opp.distanceKm < 1 ? '< 1 km' : `${opp.distanceKm.toFixed(1)} km`}
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-[#26372B] line-clamp-1">{opp.title}</h4>
                  <p className="text-xs text-[#667085] line-clamp-2 mt-0.5">
                    {opp.ngo?.organizationName || opp.ngoId?.name || 'Verified NGO'}
                  </p>

                  <div className="mt-3 pt-2 border-t border-[#E6E8EC] flex items-center justify-between text-xs">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#556e5a] font-semibold hover:underline"
                    >
                      <Navigation className="w-3 h-3" /> Route
                    </a>
                    <Link
                      to={`/opportunities/${opp._id}`}
                      className="text-[#466c9c] font-semibold hover:underline"
                    >
                      Details →
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 4. Real-World Community Needs / News Events */}
        {newsEvents.map((ev) => {
          const lat = ev.latitude || ev.location?.coordinates?.[1];
          const lng = ev.longitude || ev.location?.coordinates?.[0];
          if (!lat || !lng) return null;

          return (
            <Marker
              key={ev._id}
              position={[lat, lng]}
              icon={createCustomIcon('news')}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-3 text-[#354052] font-sans max-w-[250px]">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F6D8C5] text-[#7a4221] flex items-center gap-1">
                      <Newspaper className="w-3 h-3" /> COMMUNITY ALERT
                    </span>
                    {ev.distanceKm !== undefined && (
                      <span className="text-[11px] font-medium text-[#667085]">
                        {ev.distanceKm < 1 ? '< 1 km' : `${ev.distanceKm.toFixed(1)} km`}
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-[#26372B] line-clamp-1">{ev.title}</h4>
                  <p className="text-xs text-[#667085] line-clamp-2 mt-0.5">{ev.summary}</p>

                  <div className="mt-3 pt-2 border-t border-[#E6E8EC] flex items-center justify-between text-xs">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#556e5a] font-semibold hover:underline"
                    >
                      <Navigation className="w-3 h-3" /> Route
                    </a>
                    {ev.source_url && (
                      <a
                        href={ev.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#466c9c] font-semibold hover:underline inline-flex items-center gap-0.5"
                      >
                        Source <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default InteractiveMap;
