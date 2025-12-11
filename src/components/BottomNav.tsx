import { Home, ShoppingBag, User, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';

interface BottomNavProps {
  activeTab?: 'home' | 'orders' | 'profile';
}

export default function BottomNav({ activeTab = 'home' }: BottomNavProps) {
  const navigate = useNavigate();
  const { itemCount } = useCart();

  const tabs = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, path: '/orders' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-[100] safe-area-bottom">
      <div className="max-w-7xl mx-auto px-4">
        {itemCount > 0 ? (
          <div className="flex items-center justify-center h-16 py-2">
            <Button
              onClick={() => navigate('/checkout')}
              className="w-full bg-orange-600 hover:bg-orange-700 h-full text-lg font-semibold rounded-xl shadow-lg flex items-center justify-center"
            >
              <ShoppingCart className="mr-3 h-6 w-6" />
              <span>Lanjutkan ke Checkout ({itemCount} item)</span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-around h-16">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.id === activeTab;

              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(tab.path)}
                  className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                    isActive ? 'text-orange-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Icon className={`h-6 w-6 mb-1 ${isActive ? 'fill-orange-100' : ''}`} />
                  <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
