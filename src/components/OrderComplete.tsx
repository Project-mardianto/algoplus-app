import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Order, CartItem } from '@/types/order';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Home } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from "./ui/skeleton";

const DELIVERY_FEE = 5000;

const OrderItemsSkeleton = () => (
  <Card className="border-gray-200">
    <CardHeader className="bg-gray-50 rounded-t-lg">
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-4 w-32 mt-1" />
    </CardHeader>
    <CardContent className="p-6 space-y-6">
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Order Summary</h3>
        <div className="space-y-4">{[...Array(2)].map((_, i) => (<div key={i} className="flex justify-between items-center"><div className="flex gap-4"><Skeleton className="w-12 h-12 rounded-lg" /><div><Skeleton className="h-5 w-32 mb-2" /><Skeleton className="h-4 w-24" /></div></div><Skeleton className="h-5 w-20" /></div>))}
        </div>
      </div>
      <Separator />
      <div><div className="space-y-2"><div className="flex justify-between"><Skeleton className="h-5 w-20" /><Skeleton className="h-5 w-24" /></div><div className="flex justify-between"><Skeleton className="h-5 w-28" /><Skeleton className="h-5 w-24" /></div><Separator /><div className="flex justify-between"><Skeleton className="h-7 w-24" /><Skeleton className="h-7 w-28" /></div></div></div>
    </CardContent>
  </Card>
);

export default function OrderComplete() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) { setError("Order ID is missing."); setLoading(false); return; }
      try {
        const { data, error: orderError } = await supabase
          .from('orders')
          .select(`
            id, created_at, total_amount, status, shipping_address, user_id,
            order_items ( quantity, product:products (id, name, price, image) ),
            profiles ( full_name, address, phone )
          `)
          .eq('id', orderId)
          .single();
        if (orderError) throw orderError;
        if (!data) throw new Error("Order not found.");

        const transformedOrder: Order = {
            ...data,
            profiles: Array.isArray(data.profiles) ? data.profiles[0] : data.profiles,
            order_items: data.order_items.map((item: any) => ({
                ...item,
                product: Array.isArray(item.product) ? item.product[0] : item.product
            }))
        };

        setOrder(transformedOrder as Order);
      } catch (err: any) {
        setError(err.message);
        toast({ title: 'Error', description: 'Failed to fetch order details.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [orderId, toast]);

  const subtotal = useMemo(() => {
    if (!order?.order_items) return 0;
    return order.order_items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }, [order]);

  if (loading) return <div className="p-4 max-w-3xl mx-auto"><OrderItemsSkeleton/></div>;
  if (error) return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  if (!order) return <div className="p-4 text-center">Order not found.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-8"><div className="inline-block p-4 bg-green-100 rounded-full"><CheckCircle2 className="h-16 w-16 text-green-600" /></div><h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">Order Completed!</h1><p className="text-gray-600">Thank you for your purchase. Your order is confirmed!</p></div>
        <Card className="mb-6 border-green-200"><CardHeader className="bg-green-50 rounded-t-lg"><CardTitle className="text-xl text-green-800">Digital Receipt</CardTitle><p className="text-sm text-green-700">Order #{order.id.toString().padStart(4, '0')}</p></CardHeader><CardContent className="p-6 space-y-6"><div><h3 className="font-semibold text-gray-800 mb-3">Order Summary</h3><div className="space-y-4">
          {order.order_items?.map((item: CartItem) => (
            <div key={item.product.id} className="flex justify-between items-center">
              <div className="flex gap-4"><img src={item.product.image} alt={item.product.name} className="w-12 h-12 rounded-lg object-cover" />
                <div>
                  <p className="font-medium text-gray-800">{item.product.name}</p>
                  <p className="text-sm text-gray-500">{item.quantity} x Rp {item.product.price.toLocaleString('id-ID')}</p>
                </div>
              </div>
              <p className="font-semibold text-gray-800">Rp {(item.product.price * item.quantity).toLocaleString('id-ID')}</p>
            </div>
          ))}
        </div></div><Separator /><div><div className="space-y-2"><div className="flex justify-between text-gray-600"><span>Subtotal</span><span>Rp {subtotal.toLocaleString('id-ID')}</span></div><div className="flex justify-between text-gray-600"><span>Delivery Fee</span><span>Rp {DELIVERY_FEE.toLocaleString('id-ID')}</span></div><Separator /><div className="flex justify-between text-lg font-bold text-gray-800"><span>Total Paid</span><span className="text-green-600">Rp {order.total_amount.toLocaleString('id-ID')}</span></div></div></div><Separator /><div><p className="text-sm text-gray-600 mb-1">Date & Time</p><p className="font-semibold text-gray-900">{format(new Date(order.created_at), 'dd MMM yyyy, HH:mm')}</p></div></CardContent></Card>
        <div className="space-y-3"><Button onClick={() => navigate('/')} className="w-full bg-orange-600 hover:bg-orange-700 text-white h-14 text-lg font-semibold rounded-xl"><Home className="mr-2 h-5 w-5" />Place Another Order</Button></div>
      </div>
    </div>
  );
}
