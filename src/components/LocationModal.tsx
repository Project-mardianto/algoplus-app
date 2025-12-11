import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Target, Map, MoreHorizontal, Home, Pencil, Trash2, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EditAddressModal from './EditAddressModal';
import AddAddressModal from './AddAddressModal';
import { supabase } from '@/lib/supabase';
import { useToast } from './ui/use-toast';
import { User } from '@supabase/supabase-js';

const MapModal = lazy(() => import('./MapModal'));

interface Address {
  id: number;
  name: string;
  address: string;
  user_id?: string;
}

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface LocationModalProps {
  onClose: () => void;
  onSelectAddress: (address: { name: string; address: string; }) => void;
}

const LocationModal = ({ onClose, onSelectAddress }: LocationModalProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addingAddress, setAddingAddress] = useState<SearchResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [highlightedAddressId, setHighlightedAddressId] = useState<number | null>(null);
  const [isMapModalOpen, setMapModalOpen] = useState(false); // State for MapModal

  useEffect(() => {
    const fetchUserAndAddresses = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data, error } = await supabase.from('addresses').select('*').eq('user_id', user.id);
        if (error) {
          toast({ title: 'Error', description: 'Gagal memuat alamat.', variant: 'destructive' });
        } else {
          setAddresses(data || []);
        }
      }
      setLoading(false);
    };
    fetchUserAndAddresses();
  }, [toast]);

  useEffect(() => {
    if (highlightedAddressId) {
      const timer = setTimeout(() => {
        setHighlightedAddressId(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [highlightedAddressId]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=id`);
      const data: SearchResult[] = await response.json();
      setSearchResults(data);
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal mencari alamat.', variant: 'destructive' });
    }
    setIsSearching(false);
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        handleLocationSelect(latitude, longitude);
      }, (error) => {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      });
    } else {
      toast({ title: 'Error', description: 'Geolocation tidak didukung oleh browser ini.', variant: 'destructive' });
    }
  };

  const handleLocationSelect = async (lat: number, lon: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
      const data = await response.json();
      if (data && data.display_name) {
        const searchResult: SearchResult = {
          place_id: data.place_id,
          display_name: data.display_name,
          lat: data.lat,
          lon: data.lon,
        };
        handleSelectSearchResult(searchResult);
      } else {
        toast({ title: 'Error', description: 'Gagal mendapatkan alamat dari lokasi yang dipilih.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal mendapatkan alamat dari lokasi yang dipilih.', variant: 'destructive' });
    }
    setMapModalOpen(false);
  };

  const handleSelectSearchResult = (result: SearchResult) => {
    setAddingAddress(result);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSaveNewAddress = async (name: string): Promise<boolean> => {
    if (!user) {
      toast({ title: 'Gagal Menyimpan', description: 'Anda harus masuk untuk menyimpan alamat baru.', variant: 'destructive' });
      navigate('/login');
      return false;
    }
    if (!addingAddress) {
        toast({ title: 'Error', description: 'Tidak ada alamat yang dipilih.', variant: 'destructive' });
        return false;
    }

    const newAddressData = { name, address: addingAddress.display_name, user_id: user.id };
    const { data: savedAddress, error } = await supabase.from('addresses').insert(newAddressData).select().single();

    if (error) {
      toast({ title: 'Error', description: 'Gagal menyimpan alamat. Silakan coba lagi.', variant: 'destructive' });
      return false;
    } else if (savedAddress) {
      toast({ title: 'Sukses', description: 'Alamat berhasil disimpan.' });
      onSelectAddress({ name: savedAddress.name, address: savedAddress.address });
      onClose();
      return true;
    }
    return false;
  };

  const handleSelectAddress = (address: Address) => {
    onSelectAddress({ name: address.name, address: address.address });
    onClose();
  };

  const handleEdit = (e: React.MouseEvent, address: Address) => {
    e.stopPropagation();
    setEditingAddress(address);
  };

  const handleDelete = async (e: React.MouseEvent, addressId: number) => {
    e.stopPropagation();
    if (window.confirm("Apakah Anda yakin ingin menghapus alamat ini?")) {
      const { error } = await supabase.from('addresses').delete().eq('id', addressId);
      if (error) {
        toast({ title: 'Error', description: 'Gagal menghapus alamat.', variant: 'destructive' });
      } else {
        setAddresses(prev => prev.filter((addr) => addr.id !== addressId));
        toast({ title: 'Sukses', description: 'Alamat berhasil dihapus.' });
      }
    }
  };

  const handleSaveAddress = async (updatedAddress: { name: string; address: string; }) => {
    if (editingAddress) {
      const { data, error } = await supabase.from('addresses').update(updatedAddress).eq('id', editingAddress.id).select().single();
      if (error) {
        toast({ title: 'Error', description: 'Gagal memperbarui alamat.', variant: 'destructive' });
      } else if (data) {
        setAddresses(prev => prev.map((addr) => (addr.id === data.id ? data : addr)));
        toast({ title: 'Sukses', description: 'Alamat berhasil diperbarui.' });
      }
      setEditingAddress(null);
    }
  };
  
  const closeAddAddressModal = () => {
    setAddingAddress(null);
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-end">
        <div className="bg-white w-full max-w-lg rounded-t-2xl p-4 transform transition-all h-[90vh] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div></div>
            <h2 className="text-lg font-bold text-center">Pilih lokasi</h2>
            <button onClick={onClose}><X className="h-6 w-6" /></button>
          </div>
          <div className="relative mb-4">
            <Input type="text" placeholder="Cari alamat di Indonesia" className="pl-10 bg-gray-100 border-gray-100" value={searchQuery} onChange={(e) => handleSearch(e.target.value)} />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          </div>
          {isSearching && <p>Mencari...</p>}
          {searchResults.length > 0 && (
            <div className="space-y-2 mb-4">
              {searchResults.map((result) => (
                <div key={result.place_id} onClick={() => handleSelectSearchResult(result)} className="p-2 border rounded-lg cursor-pointer hover:bg-gray-100">
                  {result.display_name}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 mb-6">
            <Button variant="outline" className="flex-1 rounded-full" onClick={handleGetCurrentLocation}><Target className="mr-2 h-4 w-4" />Lokasimu saat ini</Button>
            <Button variant="outline" className="flex-1 rounded-full" onClick={() => setMapModalOpen(true)}><Map className="mr-2 h-4 w-4 text-orange-600" />Pilih lewat peta</Button>
          </div>

          <div className="mb-6 flex-grow overflow-y-auto">
            <div className="flex justify-between items-center mb-2"><h3 className="font-bold">Alamat Pengiriman</h3></div>
            {loading ? <p>Loading...</p> : (
              <div className="space-y-2">
                {addresses.map((fav) => (
                  <div 
                    key={fav.id} 
                    onClick={() => handleSelectAddress(fav)} 
                    className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${fav.id === highlightedAddressId ? 'bg-orange-100' : ''}`}>
                    <Home className="h-6 w-6 text-gray-500 mt-1" />
                    <div className="flex-1">
                      <p className="font-semibold">{fav.name}</p>
                      <p className="text-sm text-gray-600">{fav.address}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}><MoreHorizontal className="h-5 w-5" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={(e) => handleEdit(e, fav)}><Pencil className="mr-2 h-4 w-4" />Ubah</DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handleDelete(e, fav.id)} className="text-red-500"><Trash2 className="mr-2 h-4 w-4" />Hapus</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {editingAddress && <EditAddressModal address={editingAddress} onClose={() => setEditingAddress(null)} onSave={handleSaveAddress} />}
      {addingAddress && 
        <AddAddressModal 
          addressLine={addingAddress.display_name} 
          suggestedName={addingAddress.display_name.split(',')[0]} 
          onClose={closeAddAddressModal} 
          onSave={handleSaveNewAddress} />}
      {isMapModalOpen && (
        <Suspense fallback={<div>Memuat peta...</div>}>
          <MapModal onClose={() => setMapModalOpen(false)} onSelectLocation={handleLocationSelect} />
        </Suspense>
      )}
    </>
  );
};

export default LocationModal;
