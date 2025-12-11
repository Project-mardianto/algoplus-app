import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

export const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-decoration-none">
            <h1 className="text-2xl font-bold text-orange-600">AirGalon</h1>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => navigate('/profile')} className="rounded-full">
            <User className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
      </div>
    </header>
  );
};
