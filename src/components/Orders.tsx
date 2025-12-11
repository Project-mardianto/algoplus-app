import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Order } from '@/types/order';
import { useToast } from '@/components/ui/use-toast';
import { Package, Clock, CheckCircle, XCircle, ShoppingCart, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import BottomNav from './BottomNav';
import { format } from 'date-fns';
import LoadingScreen from './LoadingScreen';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const statusConfig = {
  confirmed: { icon: Clock, color: 'bg-blue-500', label: 'Confirmed' },
  preparing: { icon: Package, color: 'bg-yellow-500', label: 'Preparing' },
  out_for_delivery: { icon: Clock, color: 'bg-orange-500', label: 'Delivering' },
  arrived: { icon: CheckCircle, color: 'bg-purple-500', label: 'Arrived' },
  completed: { icon: CheckCircle, color: 'bg-green-500', label: 'Completed' },
  cancelled: { icon: XCircle, color: 'bg-red-500', label: 'Cancelled' },
};

// A new helper to get initials from a name
const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }

        // The new query now also fetches the driver's profile
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items(*, products(*)),
            driver:driver_id (*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedOrders: Order[] = data.map(o => ({
          ...o,
          order_items: o.order_items.map((item: any) => ({
            quantity: item.quantity,
            product: {
              ...item.products,
              image: item.products.image_url,
            }
          })),
          // The driver profile is now part of the order object
          driver: o.driver ? {
              id: o.driver.id,
              full_name: o.driver.full_name,
              avatar_url: o.driver.avatar_url,
          } : undefined,
        }));

        setOrders(formattedOrders);

      } catch (error: any) {
        toast({ title: 'Error fetching orders', description: error.message, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [toast, navigate]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white shadow-sm sticky top-0 z-10">
            <div className="max-w-3xl mx-auto px-4 py-4">
                <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
            </div>
        </div>

        <div className="max-w-3xl mx-auto p-4">
            {orders.length === 0 ? (
                <div className="text-center py-20">
                    <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Place your first order to see it here.</p>
                    <Button className="mt-6" onClick={() => navigate('/')}>Order Now</Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => {
                        const currentStatus = statusConfig[order.status] || statusConfig.confirmed;
                        const showDriverInfo = order.driver && (order.status === 'out_for_delivery' || order.status === 'arrived');

                        return (
                            <Card key={order.id} className="overflow-hidden">
                                <div className="p-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold">Order #{order.id.toString().padStart(4, '0')}</h3>
                                        <Badge className={`${currentStatus.color} text-white`}>{currentStatus.label}</Badge>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {format(new Date(order.created_at), 'dd MMM yyyy, HH:mm')}
                                    </p>
                                </div>
                                
                                {showDriverInfo && order.driver && (
                                  <div className="px-4 pb-4 border-t border-gray-100">
                                    <div className="flex items-center gap-3 pt-4">
                                      <Avatar className="w-10 h-10">
                                        <AvatarImage src={order.driver.avatar_url} alt={order.driver.full_name} />
                                        <AvatarFallback>{getInitials(order.driver.full_name)}</AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="font-medium text-sm">{order.driver.full_name}</p>
                                        <p className="text-xs text-gray-500">Your driver</p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                <div className="px-4 pb-4 border-t border-gray-100">
                                    <div className="mt-4 space-y-3">
                                        {order.order_items.map(item => (
                                            <div key={item.product.id} className="flex items-center gap-3">
                                                <img src={item.product.image} alt={item.product.name} className="w-10 h-10 rounded-md object-cover bg-gray-100"/>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">{item.product.name}</p>
                                                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-600">Total</span>
                                    <span className="font-bold text-lg">Rp {order.total_amount.toLocaleString('id-ID')}</span>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>

        <BottomNav activeTab="orders" />
    </div>
  );
}
