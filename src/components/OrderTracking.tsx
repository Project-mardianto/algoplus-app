import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Order, OrderStatus } from '@/types/order';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, Star, Clock, CheckCircle, Package, Truck, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from './ui/skeleton';

const OrderTrackingSkeleton = () => (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <Card className="overflow-hidden border-gray-200"><Skeleton className="h-60 w-full" /><div className="p-6 bg-white"><div className="flex items-center justify-between"><Skeleton className="h-12 w-3/4" /><Skeleton className="h-16 w-16 rounded-full" /></div><Separator className="my-4" /><Skeleton className="h-6 w-full" /></div></Card>
        <Card className="border-gray-200"><CardContent className="p-6"><div className="flex items-center gap-4"><Skeleton className="h-16 w-16 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-1/2" /></div><Skeleton className="h-12 w-12 rounded-full" /></div></CardContent></Card>
        <Card className="border-gray-200"><CardContent className="p-6"><Skeleton className="h-8 w-1/3 mb-5" /><div className="space-y-8">{[...Array(4)].map((_, i) => (<div key={i} className="flex gap-4 items-start"><Skeleton className="w-10 h-10 rounded-full" /><div className="pt-1.5 flex-1 space-y-2"><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-1/2" /></div></div>))}</div></CardContent></Card>
    </div>
);

interface StatusStep { status: OrderStatus; label: string; icon: React.ReactNode; }
const getInitials = (name: string) => (name || '').split(' ').map((n) => n[0]).join('').toUpperCase();
const STATUS_SEQUENCE: OrderStatus[] = ['confirmed', 'preparing', 'out_for_delivery', 'arrived'];

export default function OrderTracking() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [driverProfile, setDriverProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eta, setEta] = useState(15); // Default ETA
  const { toast } = useToast();

  const statusSteps = useMemo((): StatusStep[] => [
    { status: 'confirmed', label: 'Order Confirmed', icon: <CheckCircle className="w-5 h-5" /> },
    { status: 'preparing', label: 'Preparing Your Order', icon: <Package className="w-5 h-5" /> },
    { status: 'out_for_delivery', label: 'Out for Delivery', icon: <Truck className="w-5 h-5" /> },
    { status: 'arrived', label: 'Driver Has Arrived', icon: <Star className="w-5 h-5" /> },
  ], []);

  const fetchOrderAndDriver = useCallback(async () => {
    if (!orderId) { setError("Order ID is missing."); setLoading(false); return; }
    try {
      // Aliased 'products' to 'product' to match the TypeScript type 'CartItem'
      const { data, error } = await supabase.from('orders').select('*, order_items(*, product:products(*)), profiles(*)').eq('id', orderId).single();
      if (error) throw error;
      if (!data) throw new Error("Order not found.");
      setOrder(data as Order);
      if (data.driver_id) {
        const { data: driverData, error: driverError } = await supabase.from('profiles').select('full_name, avatar_url, rating, vehicle_number').eq('id', data.driver_id).single();
        if (driverError) throw driverError;
        setDriverProfile(driverData);
      }
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Error Fetching Order", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [orderId, toast]);

  useEffect(() => {
    fetchOrderAndDriver();
    const channel = supabase.channel(`order-tracking:${orderId}`)
      .on<Order>('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` }, (payload) => {
        const newOrder = payload.new as Order;
        setOrder(currentOrder => ({ ...currentOrder, ...newOrder, order_items: currentOrder?.order_items || [], profiles: currentOrder?.profiles || null }));
        if (newOrder.status === 'arrived') {
            toast({ title: "Driver has arrived!", description: "Your order is now complete.", duration: 5000 });
            setTimeout(() => navigate(`/complete/${orderId}`), 3000);
        }
      }).subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, [orderId, fetchOrderAndDriver, navigate, toast]);

  if (loading) return <OrderTrackingSkeleton />;
  if (error) return <div className="min-h-screen flex items-center justify-center"><div className="text-center text-red-500">Error: {error}</div></div>;
  if (!order) return <div className="min-h-screen flex items-center justify-center"><div className="text-center">Order not found.</div></div>;

  const currentStatusIndex = STATUS_SEQUENCE.indexOf(order.status);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <Card className="overflow-hidden border-gray-200"><div className="relative h-60 bg-gray-100 flex items-center justify-center"><img src="https://www.medcoenergi.com/images/uploads/subsidiaries/map-dummy.jpg" alt="Delivery Map" className="w-full h-full object-cover" /></div><div className="p-6 bg-white"><div className="flex items-center justify-between"><div><p className="text-gray-500 text-sm">Estimated Arrival</p><p className="text-3xl font-bold text-gray-800">{eta > 0 ? `${eta} min` : 'Arriving now'}</p></div><div className="bg-orange-500 p-4 rounded-full"><Clock className="h-8 w-8 text-white" /></div></div><Separator className="my-4" /><div><p className="text-gray-500 text-sm mb-1">Delivery To</p><p className="font-semibold text-gray-800 whitespace-pre-line">{order.shipping_address}</p></div></div></Card>
        {driverProfile && <Card className="border-gray-200"><CardContent className="p-6"><div className="flex items-center gap-4"><Avatar className="h-16 w-16 border-2 border-orange-100"><AvatarImage src={driverProfile.avatar_url} /><AvatarFallback>{getInitials(driverProfile.full_name)}</AvatarFallback></Avatar><div className="flex-1"><h3 className="font-bold text-lg text-gray-900">{driverProfile.full_name}</h3><div className="flex items-center gap-3 text-sm text-gray-500 mt-1"><div className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /><span className="font-semibold text-gray-700">{driverProfile.rating?.toFixed(1) || 'N/A'}</span></div><Separator orientation="vertical" className="h-4" /><span>{driverProfile.vehicle_number || 'No vehicle'}</span></div></div><Button size="icon" className="bg-green-500 hover:bg-green-600 rounded-full h-12 w-12"><Phone className="h-5 w-5" /></Button></div></CardContent></Card>}
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg text-gray-900 mb-5">Order Status</h3>
            <div className="space-y-2">
                {statusSteps.map((step, index) => {
                    const isCompleted = index < currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;
                    return (
                        <div key={step.status} className={`flex gap-4 items-start transition-opacity duration-500 ${isCompleted || isCurrent ? 'opacity-100' : 'opacity-40'}`}>
                            <div className="flex flex-col items-center h-full">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isCurrent ? 'bg-orange-500 text-white ring-4 ring-orange-100' : isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                    {step.icon}
                                </div>
                                {index < statusSteps.length - 1 && (
                                    <div className={`w-0.5 flex-1 mt-2 transition-colors duration-500 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} style={{minHeight: '40px'}}/>
                                )}
                            </div>
                            <div className="pt-1.5">
                                <p className={`font-semibold ${isCurrent ? 'text-orange-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>{step.label}</p>
                                {isCurrent && !isCompleted && <p className="text-sm text-gray-500 animate-pulse">Updating status...</p>}
                            </div>
                        </div>
                    );
                })}
            </div>
          </CardContent>
        </Card>
        {order.status === 'arrived' && (
          <Button onClick={() => navigate(`/complete/${orderId}`)} className="w-full bg-green-600 hover:bg-green-700 h-14 text-lg font-semibold rounded-xl shadow-lg">
            Finalize Order
          </Button>
        )}
      </div>
    </div>
  );
}
