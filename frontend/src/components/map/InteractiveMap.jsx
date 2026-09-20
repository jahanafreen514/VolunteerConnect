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

// Custom SVGs for High-End Custom Markers
const createCustomIcon = (type, color = '#6366f1') => {
  let iconHtml = '';
  if (type === 'user') {
    iconHtml = `
      <div class="relative flex items-center justify-center w-8 h-8">
        <span class="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-cyan-400"></span>
        <span class="relative inline-flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500 text-white font-bold shadow-lg border-2 border-white">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3" fill="currentColor"></circle></svg>
        </span>
      </div>
    `;
  } else if (type === 'ngo') {
    iconHtml = `
      <div class="flex items-center justify-center w-9 h-9 rounded-2xl bg-emerald-600 text-white shadow-xl border-2 border-white transform hover:scale-110 transition-transform">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path></svg>
      </div>
    `;
  } else if (type === 'news') {
    iconHtml = `
      <div class="flex items-center justify-center w-9 h-9 rounded-2xl bg-amber-500 text-white shadow-xl border-2 border-white transform hover:scale-110 transition-transform">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path><path d="M18 14h-8"></path><path d="M15 18h-5"></path><path d="M10 6h8v4h-8V6Z"></path></svg>
      </div>
    `;
  } else {
    // Standard Opportunity Marker
    iconHtml = `
      <div class="flex items-center justify-center w-9 h-9 rounded-2xl bg-indigo-600 text-white shadow-xl border-2 border-white transform hover:scale-110 transition-transform">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
      </div>
    `;
  }

  return L.divIcon({
    html: iconHtml,
    className: 'custom-leaflet-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20]
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
  center = [16.3067, 80.4365], // Default Guntur/AP hub
  zoom = 11,
  height = '500px',
  className = ''
}) => {
  const mapCenter = userLocation?.lat && userLocation?.lng 
    ? [userLocation.lat, userLocation.lng] 
    : center;

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-gray-950 ${className}`} style={{ height }}>
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
              <div className="p-2 text-gray-900 font-sans">
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800 mb-1">
                  YOU ARE HERE
                </span>
                <p className="text-xs font-bold text-gray-800">Your Current Location</p>
                <p className="text-[11px] text-gray-500">Discovering nearby community opportunities</p>
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
                <div className="p-3 text-gray-900 font-sans max-w-[240px]">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> VERIFIED NGO
                    </span>
                    {ngo.distanceKm !== undefined && (
                      <span className="text-[11px] font-semibold text-gray-500">
                        {ngo.distanceKm} km away
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{ngo.organizationName}</h4>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{ngo.description || ngo.address}</p>

                  <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-700 font-semibold hover:underline"
                    >
                      <Navigation className="w-3.5 h-3.5" /> Directions
                    </a>
                    {ngo.userId && (
                      <Link
                        to={`/opportunities?ngoId=${ngo.userId._id || ngo.userId}`}
                        className="text-indigo-600 font-semibold hover:underline"
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

        {/* 3. Active Opportunities Markers */}
        {opportunities.map((opp) => {
          const lat = opp.location?.latitude || opp.location?.geo?.coordinates?.[1];
          const lng = opp.location?.longitude || opp.location?.geo?.coordinates?.[0];
          if (!lat || !lng) return null;

          const isNews = opp.source_type === 'news';

          return (
            <Marker
              key={opp._id}
              position={[lat, lng]}
              icon={createCustomIcon(isNews ? 'news' : 'opportunity')}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-3 text-gray-900 font-sans max-w-[260px]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isNews ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {isNews ? '📰 NEWS-DERIVED' : (opp.category || 'COMMUNITY').toUpperCase()}
                    </span>
                    {opp.distanceKm !== undefined && (
                      <span className="text-[11px] font-bold text-gray-600">
                        {opp.distanceKm} km away
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{opp.title}</h4>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                    {opp.location?.formattedAddress || opp.location?.city || 'Local initiative'}
                  </p>

                  <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-gray-700 font-semibold hover:text-indigo-600"
                    >
                      <Navigation className="w-3.5 h-3.5" /> Directions
                    </a>

                    <Link
                      to={`/opportunities/${opp._id}`}
                      className="inline-flex items-center gap-1 text-indigo-600 font-bold hover:underline"
                    >
                      Details <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 4. Real-World News Events Markers (If unadopted) */}
        {newsEvents.map((event) => {
          const lat = event.location?.latitude || event.location?.geo?.coordinates?.[1];
          const lng = event.location?.longitude || event.location?.geo?.coordinates?.[0];
          if (!lat || !lng) return null;

          return (
            <Marker
              key={event._id}
              position={[lat, lng]}
              icon={createCustomIcon('news')}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-3 text-gray-900 font-sans max-w-[260px]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      🚨 PUBLIC NEED
                    </span>
                    {event.distanceKm !== undefined && (
                      <span className="text-[11px] font-bold text-gray-600">
                        {event.distanceKm} km away
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-gray-900 line-clamp-2">{event.title}</h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{event.summary}</p>

                  <div className="mt-2 text-[11px] text-gray-600 font-medium">
                    Source: <span className="font-semibold text-gray-800">{event.source_name}</span>
                  </div>

                  <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                    <a
                      href={event.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-700 font-semibold hover:underline"
                    >
                      View Source Article →
                    </a>
                    {event.adoptedOpportunityId && (
                      <Link
                        to={`/opportunities/${event.adoptedOpportunityId}`}
                        className="text-indigo-600 font-bold hover:underline"
                      >
                        Join Drive →
                      </Link>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[400] bg-black/75 backdrop-blur-md px-3 py-2 rounded-xl border border-white/15 text-[11px] text-gray-200 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> You
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Verified NGOs
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Opportunities
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> News Needs
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;
