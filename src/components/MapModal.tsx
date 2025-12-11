import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { X, Search, Map, LocateFixed, ArrowLeft, CheckCircle } from 'lucide-react';

// Fix for default icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface MapModalProps {
  onClose: () => void;
  onSelectLocation: (lat: number, lon: number, address?: string) => void;
}

const MapEvents = ({ onMapClick }: { onMapClick: (latlng: L.LatLng) => void }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
};

// Mock data for addresses
const mockAddresses = [
  { id: 1, name: 'Rumah', detail: 'Jl. Jend. Sudirman No. 123, Jakarta Pusat', lat: -6.208763, lon: 106.845599 },
  { id: 2, name: 'Kantor', detail: 'Gedung Cyber, Lt. 10, Jl. HR Rasuna Said, Jakarta Selatan', lat: -6.229386, lon: 106.829353 },
];

const MapModal: React.FC<MapModalProps> = ({ onClose, onSelectLocation }) => {
  const [view, setView] = useState<'initial' | 'map'>('initial');
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-6.200000, 106.816666]); // Default to Jakarta
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(1);

  useEffect(() => {
    if (view === 'map') {
      // Try to get user's current location to center the map
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setMapCenter(userPos);
          setPosition(userPos);
        },
        () => {
          // Could not get location, user will be in Jakarta
        }
      );
    }
  }, [view]);

  const handleMapClick = (latlng: L.LatLng) => {
    setPosition([latlng.lat, latlng.lng]);
  };

  const handleSelectFromMap = () => {
    if (position) {
      onSelectLocation(position[0], position[1], `Lokasi dari Peta`);
    }
  };

  const handleSelectAddress = (address: typeof mockAddresses[0]) => {
    setSelectedAddressId(address.id);
    onSelectLocation(address.lat, address.lon, address.detail);
  }

  const renderInitialView = () => (
    <>
      <div className="flex justify-between items-center mb-4 border-b pb-4">
        <h2 className="text-lg font-bold text-gray-800">Pilih lokasi</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X className="h-6 w-6" /></button>
      </div>
      <div className="p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input placeholder="Cari alamat di Indonesia" className="pl-10 h-12" />
        </div>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button variant="outline" className="h-12 text-gray-700">
            <LocateFixed className="h-5 w-5 mr-2" />
            Lokasimu saat ini
          </Button>
          <Button variant="outline" className="h-12 text-gray-700" onClick={() => setView('map')}>
            <Map className="h-5 w-5 mr-2" />
            Pilih lewat peta
          </Button>
        </div>
        <div>
          <h3 className="font-bold text-gray-800 mb-3">Alamat Pengiriman</h3>
          <div className="space-y-3">
            {mockAddresses.map((address) => (
              <div
                key={address.id}
                onClick={() => handleSelectAddress(address)}
                className={`border rounded-lg p-3 cursor-pointer transition-all flex justify-between items-center ${
                  selectedAddressId === address.id
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div>
                  <h4 className="font-semibold text-gray-900">{address.name}</h4>
                  <p className="text-sm text-gray-600">{address.detail}</p>
                </div>
                {selectedAddressId === address.id && (
                  <CheckCircle className="h-5 w-5 text-orange-600 flex-shrink-0 ml-3" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  const renderMapView = () => (
    <>
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setView('initial')} className="text-gray-500 hover:text-gray-800">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h2 className="text-lg font-bold">Pilih Lokasi dari Peta</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X className="h-6 w-6" /></button>
      </div>
      <div className="flex-1 relative rounded-lg overflow-hidden">
        <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {position && <Marker position={position}></Marker>}
          <MapEvents onMapClick={handleMapClick} />
        </MapContainer>
      </div>
      <div className="mt-4 flex justify-end">
        <Button className="w-full h-12" onClick={handleSelectFromMap} disabled={!position}>
          Pilih Lokasi Ini
        </Button>
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-lg sm:max-h-[90vh] sm:rounded-lg flex flex-col transform transition-transform duration-300 ease-in-out">
        {view === 'initial' ? renderInitialView() : renderMapView()}
      </div>
    </div>
  );
};

export default MapModal;
