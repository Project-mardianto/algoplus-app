import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bell, MapPin } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/">
            <img src="/logo.png" alt="Logo" className="h-10" />
          </Link>
          <div className="flex items-center gap-4">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <MapPin className="mr-2 h-4 w-4" />
              Rumah
            </Button>
            <div className="relative">
              <Bell className="h-6 w-6 text-gray-600" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                2
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
