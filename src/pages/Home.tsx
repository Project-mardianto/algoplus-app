import { useState, useEffect } from 'react';
import { Product } from '@/types/product';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';

const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart, getCartItem } = useCart();
  const cartItem = getCartItem(product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 0) {
      addToCart(product, newQuantity);
    }
  };

  const onQuantityChange = (amount: number) => {
    handleQuantityChange(quantity + amount);
  }


  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
      <div className="h-40 sm:h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
        <img className="h-full w-full object-cover" src={product.image} alt={product.name} />
      </div>
      <div className="p-4 sm:p-5">
        <h3 className="text-base sm:text-lg font-bold text-gray-800 truncate">{product.name}</h3>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 min-h-[30px]">{product.description}</p>
        <div className="flex justify-between items-center mt-3">
          <p className="text-base sm:text-lg font-extrabold text-orange-600">
            Rp {product.price.toLocaleString('id-ID')}
            <span className="text-xs font-normal text-gray-500"> / {product.unit}</span>
          </p>
          {quantity === 0 ? (
            <Button onClick={() => handleQuantityChange(1)} size="sm" className="bg-orange-500 hover:bg-orange-600 text-white rounded-full">
              Add
            </Button>
          ) : (
            <div className="flex items-center gap-2 bg-orange-500 text-white rounded-full px-2 py-1">
              <Button onClick={() => onQuantityChange(-1)} size="icon" variant="ghost" className="h-6 w-6 rounded-full hover:bg-orange-400">
                <Minus className="h-4 w-4" />
              </Button>
              <span className="font-bold text-sm min-w-[20px] text-center">{quantity}</span>
              <Button onClick={() => onQuantityChange(1)} size="icon" variant="ghost" className="h-6 w-6 rounded-full hover:bg-orange-400">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { itemCount } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (error) throw error;
        setProducts(data || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);


  return (
    <div className="bg-gray-50 min-h-screen pb-32"> {/* Added pb-32 for padding at the bottom */}
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
            <div className="relative h-48 sm:h-64 md:h-80 rounded-2xl overflow-hidden shadow-lg">
                <img src="https://images.pexels.com/photos/327090/pexels-photo-327090.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Hero Ice Image" className="w-full h-full object-cover"/>
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">Segarkan Harimu</h1>
                </div>
            </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Pilih Air Minum Anda</h2>
        <p className="text-gray-500 mb-8">Pilih dari koleksi air premium kami.</p>

        {loading && <p>Loading products...</p>}
        {error && <p className="text-red-500">Error fetching products: {error}</p>}
        
        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
      
      {itemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-t-lg z-20">
            <div className="max-w-6xl mx-auto px-4 py-3">
                <Button 
                    onClick={() => navigate('/checkout')} 
                    className="w-full bg-orange-600 hover:bg-orange-700 h-14 text-lg font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2">
                    <ShoppingCart className="h-5 w-5"/>
                    <span>Lanjutkan ke Checkout ({itemCount} item)</span>
                </Button>
            </div>
        </div>
      )}
    </div>
  );
};
