import { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Droplets, Bell, MapPin } from "lucide-react";
import { Product } from "@/types/product";
import { useNavigate } from "react-router-dom";
import { ImageSlider } from "./ImageSlider";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import LoadingScreen from "@/components/LoadingScreen";
import { useCart } from "@/context/CartContext";
import LocationModal from "@/components/LocationModal";

// Correctly import the local products data
import { products as localProducts } from "@/data/products";

interface Address {
  name: string;
  address: string;
}

export default function Home() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cart, updateQuantity } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLocationModalOpen, setLocationModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const unreadNotifications = 2; // Mock unread count

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Use the local product data
        setProducts(localProducts);
      } catch (error: any) {
        toast({ title: "Gagal memuat produk", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [toast]);

  const handleSelectAddress = (address: Address) => {
    setSelectedAddress(address);
    setLocationModalOpen(false);
  };

  const getQuantityForProduct = (productId: string) => {
    const item = cart.find(i => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
         <div className="max-w-7xl mx-auto px-4 py-4"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="p-2 rounded-xl bg-[#ea580c]"><Droplets className="h-6 w-6 text-white" /></div></div><div className="flex items-center gap-2"><Button onClick={() => setLocationModalOpen(true)} className="rounded-full font-semibold bg-orange-600 text-white hover:bg-orange-700"><MapPin className="mr-2 h-4 w-4" />{selectedAddress ? selectedAddress.name : 'Rumah'}</Button><button onClick={() => navigate("/notifications")} className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"><Bell className="h-6 w-6 text-gray-700" />{unreadNotifications > 0 && (<Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-orange-600 text-white text-xs">{unreadNotifications}</Badge>)}</button></div></div></div>
      </div>

      {isLocationModalOpen && <LocationModal onClose={() => setLocationModalOpen(false)} onSelectAddress={handleSelectAddress} />}

      <ImageSlider />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6"><h2 className="text-xl font-bold text-gray-900 mb-2">Pilih Air Anda</h2><p className="text-gray-600">Pilih dari koleksi air premium kami</p></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              quantity={getQuantityForProduct(product.id)}
              onQuantityChange={updateQuantity}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
