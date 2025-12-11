import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Package, MapPin, Truck, CheckCircle2, Navigation, LogOut } from 'lucide-react';
import { Order, OrderStatus } from '@/types/order';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from "@/components/ui/skeleton";

const DriverAppSkeleton = () => (
  <div className="min-h-screen bg-gray-50 animate-pulse">
    <div className="bg-orange-600/10"><div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center"><div className="flex items-center gap-3"><Skeleton className="h-12 w-12 rounded-full" /><div><Skeleton className="h-6 w-32 mb-2" /><Skeleton className="h-4 w-48" /></div></div><Skeleton className="h-10 w-10 rounded-md" /></div></div>
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
      <div><Skeleton className="h-8 w-64 mb-4" /><Card><CardHeader><Skeleton className="h-6 w-24" /></CardHeader><CardContent className="space-y-4 pt-4"><div className="space-y-3"><Skeleton className="h-16 w-full rounded-lg" /><Skeleton className="h-16 w-full rounded-lg" /></div><Skeleton className="h-12 w-full rounded-md" /></CardContent></Card></div>
      <div><Skeleton className="h-8 w-56 mb-4" /><div className="space-y-4">{[...Array(2)].map((_, i) => (<Card key={i}><CardContent className="p-4 flex justify-between items-center"><div><Skeleton className="h-5 w-28 mb-2" /><Skeleton className="h-4 w-40" /></div><div className="flex items-center gap-2"><Skeleton className="h-10 w-24 rounded-md" /><Skeleton className="h-10 w-10 rounded-md" /></div></CardContent></Card>))}
        </div>
      </div>
    </div>
  </div>
);

export default function DriverApp() {
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [myOrder, setMyOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user) { navigate('/login'); return; }
        setUser(data.user);
      } catch (error) { navigate('/login'); }
    };
    fetchUser();
  }, [navigate]);

  const fetchOrders = useCallback(async (driverId: string) => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`user_id, *, order_items(*, product:products(*)), profiles(*)`)
        .in('status', ['ready_for_pickup', 'out_for_delivery'])
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      const transformedOrders = ordersData.map(order => ({
        ...order,
        profiles: Array.isArray(order.profiles) ? order.profiles[0] : order.profiles,
        order_items: order.order_items.map(item => ({
          ...item,
          product: Array.isArray(item.product) ? item.product[0] : item.product,
        })),
      })) as unknown as Order[];

      setAvailableOrders(transformedOrders.filter(o => o.status === 'ready_for_pickup'));
      setMyOrder(transformedOrders.find(o => o.status === 'out_for_delivery' && o.driver_id === driverId) || null);
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      toast({ title: 'Error', description: 'Failed to fetch orders.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);


  useEffect(() => {
    if (!user) return;
    fetchOrders(user.id);
    const subscription = supabase
      .channel('driver-app-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders(user.id))
      .subscribe();
    return () => { supabase.removeChannel(subscription); };
  }, [user, fetchOrders]);

  const handleUpdateStatus = async (orderId: number, newStatus: OrderStatus, driverId?: string) => {
    const { error } = await supabase.from('orders').update({ status: newStatus, driver_id: driverId }).eq('id', orderId);
    if (error) toast({ title: 'Error', description: `Failed to update order: ${error.message}`, variant: 'destructive' });
    else toast({ title: 'Success', description: `Order status updated!` });
  };

  const handleSignOut = async () => { await supabase.auth.signOut(); navigate('/login'); };
  
  if (!user || loading) return <DriverAppSkeleton />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-orange-600 shadow text-white"><div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center"><div className="flex items-center gap-3"><Avatar className="h-12 w-12 border-2 border-white"><AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} /><AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback></Avatar><div><h1 className="text-xl font-bold">Welcome, Driver!</h1><p className="text-sm opacity-90">Ready for a new delivery.</p></div></div><Button variant="ghost" size="icon" onClick={handleSignOut} className="text-white hover:bg-white/20"><LogOut /></Button></div></div>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {myOrder && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">My Current Delivery</h2>
            <Card className="border-2 border-orange-500 shadow-lg"><CardHeader><CardTitle>Order #{myOrder.id}</CardTitle></CardHeader><CardContent className="space-y-4 pt-4"><div className="space-y-3"><LocationInfo title="Pickup From" address="Depot Sudirman - Jl. Sudirman No. 45" icon={<Package className="text-blue-500" />} /><LocationInfo title="Deliver To" address={myOrder.shipping_address} icon={<MapPin className="text-green-500" />} /></div><Button onClick={() => handleUpdateStatus(myOrder.id, 'arrived')} className="w-full h-12 text-lg bg-green-600 hover:bg-green-700"><CheckCircle2 className="mr-2" /> Mark as Delivered</Button></CardContent></Card>
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Available Jobs</h2>
          {availableOrders.length > 0 ? (<div className="space-y-4">{availableOrders.map((order) => (<Card key={order.id} className="hover:shadow-md transition-shadow"><CardContent className="p-4 flex justify-between items-center"><div><h3 className="font-semibold text-gray-900">Order #{order.id}</h3><p className="text-sm text-gray-600 mt-1">To: {order.shipping_address}</p></div><div className="flex items-center gap-2"><Button onClick={() => handleUpdateStatus(order.id, 'out_for_delivery', user.id)} className="bg-orange-600 hover:bg-orange-700">Accept Job</Button><Button variant="outline"><Navigation className="h-4 w-4"/></Button></div></CardContent></Card>))}</div>) : (<div className="text-center py-12 bg-gray-100 rounded-lg"><Truck className="mx-auto h-12 w-12 text-gray-400" /><h3 className="mt-2 text-lg font-medium text-gray-800">No Available Jobs</h3><p className="mt-1 text-sm text-gray-500">Waiting for new orders from suppliers...</p></div>)}
        </div>
      </div>
    </div>
  );
}

const LocationInfo = ({ title, address, icon }: { title: string, address: string, icon: React.ReactNode }) => (
    <div className="flex gap-3 items-start bg-gray-50 p-3 rounded-lg">
        <div className="mt-1">{icon}</div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="font-semibold text-gray-800">{address}</p>
        </div>
    </div>
);
