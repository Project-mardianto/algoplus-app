import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Package, Truck, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Order, OrderStatus } from '@/types/order'; // Simplified Driver type is not needed anymore
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from './ui/skeleton';

// Skeleton component to mimic the layout of the supplier panel while loading
const SupplierPanelSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div>
                <Skeleton className="h-6 w-32 rounded" />
                <Skeleton className="h-4 w-48 mt-2 rounded" />
              </div>
              <Skeleton className="h-7 w-24 rounded-full" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full rounded" />
                  <Skeleton className="h-4 w-3/4 rounded" />
                </div>
              </div>
            </div>
            <Skeleton className="h-px w-full my-4" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-1/4 rounded" />
              <Skeleton className="h-6 w-1/3 rounded" />
            </div>
            <Skeleton className="h-10 w-full mt-4 rounded-lg" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// Represents a driver user profile
interface DriverProfile {
    id: string;
    full_name: string;
    avatar_url: string;
}

export default function SupplierPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`*, order_items (quantity, products (*)), profiles (full_name)`)
        .in('status', ['confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery'])
        .order('created_at', { ascending: true });
      if (ordersError) throw ordersError;

      const formattedOrders: Order[] = ordersData.map(o => ({
        ...o,
        order_items: o.order_items.map((item: any) => ({ 
            quantity: item.quantity, 
            product: { ...item.products, image: item.products.image_url } 
        }))
      }));
      setOrders(formattedOrders);

      // Fetch available drivers
      const { data: driversData, error: driversError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('role', 'driver');
      if (driversError) throw driversError;
      setDrivers(driversData || []);

    } catch (err: any) {
      toast({ title: 'Error fetching data', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
    const subscription = supabase
      .channel('supplier-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchData)
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, [fetchData]);

  // Updated handler to include driver assignment
  const handleUpdateStatus = async (orderId: number, newStatus: OrderStatus, driverId?: string) => {
    const updatePayload: { status: OrderStatus; driver_id?: string } = { status: newStatus };
    if (driverId) {
      updatePayload.driver_id = driverId;
    }
    
    const { error } = await supabase.from('orders').update(updatePayload).eq('id', orderId);
    if (error) {
      toast({ title: 'Update Failed', description: error.message, variant: 'destructive' });
    }
  };

  const getStatusProps = (status: OrderStatus) => {
    switch (status) {
      case 'confirmed': return { color: 'bg-yellow-100 text-yellow-800', icon: <AlertCircle className="h-4 w-4" />, label: 'Confirmed' };
      case 'preparing': return { color: 'bg-blue-100 text-blue-800', icon: <Clock className="h-4 w-4" />, label: 'Preparing' };
      case 'ready_for_pickup': return { color: 'bg-green-100 text-green-800', icon: <CheckCircle2 className="h-4 w-4" />, label: 'Ready' };
      case 'out_for_delivery': return { color: 'bg-purple-100 text-purple-800', icon: <Truck className="h-4 w-4" />, label: 'In Transit' };
      default: return { color: 'bg-gray-100 text-gray-800', icon: <Package className="h-4 w-4" />, label: status };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-orange-600 shadow-md text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold">Supplier Dashboard</h1>
        </div>
      </div>

      {loading ? (
        <SupplierPanelSkeleton />
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {orders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.map((order) => {
                const statusProps = getStatusProps(order.status);
                return (
                  <Card key={order.id} className="shadow-sm hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="pb-4">
                       <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                          <p className="text-sm text-gray-500 mt-1">By: {order.profiles?.full_name || 'N/A'}</p>
                        </div>
                        <Badge className={statusProps.color}>{statusProps.icon}<span className="ml-1.5">{statusProps.label}</span></Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {order.order_items?.map(item => (
                          <div key={item.product.id} className="flex items-center gap-3 bg-gray-50 p-2 rounded-md">
                            <img src={item.product.image} alt={item.product.name} className="w-12 h-12 rounded-md object-cover" />
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800">{item.product.name}</p>
                              <p className="text-sm text-gray-500">{item.quantity} x Rp {item.product.price.toLocaleString('id-ID')}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Separator className="my-4" />
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-gray-600">Total</span>
                        <span className="text-lg text-orange-600">Rp {order.total_amount.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="mt-4 space-y-2">
                        {order.status === 'confirmed' && (
                          <Button onClick={() => handleUpdateStatus(order.id, 'preparing')} className="w-full bg-blue-600 hover:bg-blue-700"><Clock className="mr-2 h-4 w-4" />Start Preparation</Button>
                        )}
                        {order.status === 'preparing' && (
                          <Button onClick={() => handleUpdateStatus(order.id, 'ready_for_pickup')} className="w-full bg-green-600 hover:bg-green-700"><CheckCircle2 className="mr-2 h-4 w-4" />Mark as Ready for Pickup</Button>
                        )}
                        {order.status === 'ready_for_pickup' && (
                          <Card className="bg-orange-50 border-orange-200">
                              <CardHeader className="p-3"><CardTitle className="text-base">Assign Driver</CardTitle></CardHeader>
                              <CardContent className="p-3 space-y-2">
                                  {drivers.length > 0 ? drivers.map(driver => (
                                      <Button key={driver.id} variant="outline" className="w-full justify-start h-auto p-2" onClick={() => handleUpdateStatus(order.id, 'out_for_delivery', driver.id)}>
                                          <Avatar className="h-9 w-9 mr-3"><AvatarImage src={driver.avatar_url} /><AvatarFallback>{driver.full_name[0]}</AvatarFallback></Avatar>
                                          <div><p className="font-semibold text-sm">{driver.full_name}</p></div>
                                      </Button>
                                  )) : <p className="text-sm text-center text-gray-500 py-2">No drivers available.</p>}
                              </CardContent>
                          </Card>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
           ) : (
            <div className="text-center py-16">
                <Package className="mx-auto h-16 w-16 text-gray-400" />
                <h2 className="mt-4 text-xl font-semibold text-gray-800">No Active Orders</h2>
                <p className="mt-2 text-gray-500">New orders from customers will appear here in real-time.</p>
            </div>
           )}
        </div>
      )}
    </div>
  );
}
