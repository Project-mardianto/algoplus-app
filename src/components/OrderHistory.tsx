import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Order } from "@/types/order";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "./LoadingScreen";
import BottomNav from "./BottomNav";

type OrderStatus = Order['status'];

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          toast({
            title: "Authentication Error",
            description: "You must be logged in to view your order history.",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }

        const { data, error } = await supabase
          .from("orders")
          .select(
            `
            id,
            created_at,
            total_amount,
            status,
            shipping_address,
            user_id,
            order_items:order_items(
                quantity,
                product:products(
                    id,
                    name,
                    price,
                    image,
                    description,
                    type
                )
            )
        `
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        if (data) {
          const typedOrders: Order[] = data.map(order => ({
            ...order,
            user_id: user.id,
            order_items: order.order_items.map((item: any) => ({
              quantity: item.quantity,
              product: {
                ...item.product,
                id: item.product.id,
              }
            }))
          }));
          setOrders(typedOrders);
        }
      } catch (error: any) {
        toast({
          title: "Failed to fetch orders",
          description:
            error.message || "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [toast, navigate]);

  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case 'confirmed':
        return "bg-blue-100 text-blue-800";
      case 'preparing':
        return "bg-yellow-100 text-yellow-800";
      case 'out_for_delivery':
        return "bg-indigo-100 text-indigo-800";
      case 'completed':
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 text-center">
            My Orders
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {orders.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-xl font-semibold text-gray-700">No Orders Yet</h2>
            <p className="text-gray-500 mt-2">
              You haven't placed any orders. Start shopping now!
            </p>
            <Button onClick={() => navigate("/")} className="mt-6 bg-orange-600 hover:bg-orange-700">
              Shop Now
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="flex flex-row justify-between items-center p-4 bg-white">
                  <div>
                    <h2 className="font-semibold">Order #{order.id}</h2>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={getStatusBadgeVariant(order.status)}
                  >
                    {order.status.replace('_', ' ')}
                  </Badge>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {order.order_items?.map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <img
                          src={item.product?.image || 'https://placehold.co/64'}
                          alt={item.product?.name}
                          className="w-16 h-16 rounded-md object-cover bg-gray-100"
                        />
                        <div>
                          <p className="font-medium text-sm">
                            {item.product?.name || 'Product not found'}
                          </p>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <BottomNav activeTab="orders" />
    </div>
  );
}
