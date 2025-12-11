import { useState, useEffect, useCallback } from 'react';
import { Order } from '@/types/order';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Wallet, CreditCard, MapPin, Plus, Minus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { useCart } from '@/context/CartContext';
import { WaterGallonIcon } from '@/components/icons/WaterGallonIcon';

const useMidtransSnap = (clientKey: string) => {
  useEffect(() => {
    if (!clientKey) return;
    const script = document.createElement('script');
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute('data-client-key', clientKey);
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, [clientKey]);
};

const CheckoutSkeleton = () => { return <div>Memuat...</div> };

interface CheckoutProps { onConfirmOrder: (order: Order) => void; onBack: () => void; }
const DELIVERY_FEE = 5000;
const GALLON_RENT_FEE_PER_ITEM = 1000;
const MAX_RENTED_GALLONS = 100;

export default function Checkout({ onConfirmOrder, onBack }: CheckoutProps) {
  const { cart: items, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [rentedGallonQuantity, setRentedGallonQuantity] = useState(0);
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const MIDTRANS_CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || '';
  useMidtransSnap(MIDTRANS_CLIENT_KEY);

  const totalWaterGallons = items
    .filter(item => 'unit' in item.product && item.product.unit === 'galon')
    .reduce((sum, item) => sum + item.quantity, 0);

  const gallonRentFee = rentedGallonQuantity * GALLON_RENT_FEE_PER_ITEM;
  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const total = subtotal + DELIVERY_FEE + gallonRentFee;

  // The maximum number of gallons that can be rented is the SMALLER of the two numbers:
  // 1. The total gallons in the cart.
  // 2. The hard limit of 100.
  const maxAllowedRent = Math.min(totalWaterGallons, MAX_RENTED_GALLONS);

  // Rewritten logic from scratch for robustness.
  const handleRentQuantityChange = (amount: number) => {
    setRentedGallonQuantity(currentQuantity => {
      const newQuantity = currentQuantity + amount;
      // This "clamps" the value, ensuring it NEVER goes below 0 or above the max allowed limit.
      // This is the definitive fix.
      return Math.max(0, Math.min(newQuantity, maxAllowedRent));
    });
  };

  const saveOrderToDB = useCallback(async () => {
    if (!user) return null;
    try {
      const { data: orderData, error: orderError } = await supabase.from('orders').insert({ user_id: user.id, total_amount: total, status: 'confirmed', shipping_address: shippingAddress, payment_method: paymentMethod }).select('id').single();
      if (orderError) throw orderError;
      const orderItems = items.map(cartItem => ({ order_id: orderData.id, product_id: cartItem.product.id, quantity: cartItem.quantity, price: cartItem.product.price }));
      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;
      clearCart();
      const { data: fullOrder, error: fullOrderError } = await supabase.from('orders').select('*, order_items(*, product:products(*)), profiles(*)').eq('id', orderData.id).single();
      if(fullOrderError) throw fullOrderError;
      return fullOrder as Order;
    } catch (error: any) {
      toast({ title: "Gagal Membuat Pesanan", description: error.message, variant: "destructive" });
      return null;
    }
  }, [user, total, shippingAddress, paymentMethod, items, toast, clearCart]);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: profile } = await supabase.from('profiles').select('full_name, address').eq('id', user.id).single();
        if (profile) { setUserName(profile.full_name || 'N/A'); setShippingAddress(profile.address || ''); }
      }
      setInitialLoading(false);
    };
    fetchUserAndProfile();
  }, []);

  // This safety hook adjusts the rented quantity if the cart changes (e.g., an item is removed).
  useEffect(() => {
    if (rentedGallonQuantity > maxAllowedRent) {
      setRentedGallonQuantity(maxAllowedRent);
    }
  }, [totalWaterGallons, rentedGallonQuantity, maxAllowedRent]);

  const handleConfirmOrder = async () => {
    if (!user || !shippingAddress) { toast({ title: "Informasi Kurang", description: "Silakan tambahkan alamat pengiriman di profil Anda.", variant: "destructive" }); return; }
    setOrderProcessing(true);
    const orderPayload = {
      order_id: `ORDER-${Date.now()}`,
      gross_amount: total,
      customer_details: {
          first_name: userName,
          email: user.email,
      }
    }
    if (paymentMethod === 'card') {
        try {
            const response = await fetch('http://localhost:3001/api/create-transaction', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderPayload) });
            if (!response.ok) throw new Error('Gagal membuat transaksi');
            const { token: transactionToken } = await response.json();
            (window as any).snap.pay(transactionToken, {
                onSuccess: async (result: any) => {
                    toast({ title: "Pembayaran Berhasil!", description: result.status_message });
                    const newOrder = await saveOrderToDB();
                    if (newOrder) onConfirmOrder(newOrder);
                },
                onPending: (result: any) => { toast({ title: "Pembayaran Tertunda", description: "Menunggu pembayaran Anda." }); setOrderProcessing(false); },
                onError: (result: any) => { toast({ title: "Pembayaran Gagal", description: result.status_message, variant: "destructive" }); setOrderProcessing(false); },
                onClose: () => { toast({ title: "Pembayaran Ditutup", description: "Anda menutup pop-up pembayaran.", variant: "destructive" }); setOrderProcessing(false); }
            });
        } catch (error: any) {
            toast({ title: "Kesalahan Transaksi", description: error.message, variant: "destructive" });
            setOrderProcessing(false);
        }
    } else {
        const newOrder = await saveOrderToDB();
        if (newOrder) onConfirmOrder(newOrder);
        setOrderProcessing(false);
    }
  };
  
  if (initialLoading) return <CheckoutSkeleton />;

  const exchangedGallons = totalWaterGallons - rentedGallonQuantity;

  return (
    <div className="bg-gradient-to-b from-orange-50 to-white min-h-screen">
      <div className="bg-white shadow-sm sticky top-0 z-10"><div className="max-w-3xl mx-auto px-4 py-4"><div className="flex items-center gap-3"><Button variant="ghost" size="icon" onClick={onBack} className="rounded-full"><ArrowLeft className="h-5 w-5" /></Button><h1 className="text-xl font-bold text-gray-900">Checkout</h1></div></div></div>
      <div className="max-w-3xl mx-auto px-4 py-6 pb-32">
        <Card className="mb-6 border-orange-100"><CardHeader className="pb-3 flex flex-row items-center justify-between"><CardTitle className="text-lg flex items-center gap-2"><MapPin className="h-5 w-5 text-orange-600" />Alamat Pengiriman</CardTitle><Button variant="link" className="text-orange-600" onClick={() => navigate('/profile')}>Ubah</Button></CardHeader><CardContent>{shippingAddress ? (<><p className="font-semibold text-gray-900">{userName}</p><p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{shippingAddress}</p></>) : (<div className="text-center text-gray-500 py-4"><p>Alamat pengiriman tidak ditemukan.</p><Button variant="secondary" className="mt-2" onClick={() => navigate('/profile')}>Tambah Alamat di Profil</Button></div>)}</CardContent></Card>
        
        <Card className="mb-6 border-orange-100"><CardHeader><CardTitle className="text-lg flex items-center gap-2"><WaterGallonIcon className="h-5 w-5 text-orange-600"/>Penyediaan Galon</CardTitle></CardHeader><CardContent className="space-y-4">
          {totalWaterGallons > 0 ? (
            <>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-semibold">Jumlah galon yang disewa</span>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="icon" className="rounded-full h-8 w-8" onClick={() => handleRentQuantityChange(-1)} disabled={rentedGallonQuantity <= 0}><Minus className="h-4 w-4" /></Button>
                  <span className="font-bold text-lg w-8 text-center">{rentedGallonQuantity}</span>
                  <Button variant="outline" size="icon" className="rounded-full h-8 w-8" onClick={() => handleRentQuantityChange(1)} disabled={rentedGallonQuantity >= maxAllowedRent}><Plus className="h-4 w-4" /></Button>
                </div>
              </div>
              <p className="text-sm text-gray-600 px-2">Biaya sewa: Rp {GALLON_RENT_FEE_PER_ITEM.toLocaleString('id-ID')} per galon.</p>
              {exchangedGallons > 0 && (
                <p className="text-sm text-gray-800 font-medium px-2 pt-2">Anda akan menukar <span className='font-bold'>{exchangedGallons}</span> galon milik sendiri.</p>
              )}
            </>
          ) : (
            <p className="text-center text-gray-500 py-3">Anda tidak memesan produk galon air.</p>
          )}
        </CardContent></Card>

        <Card className="mb-6 border-orange-100"><CardHeader><CardTitle className="text-lg">Ringkasan Pesanan</CardTitle></CardHeader><CardContent className="space-y-4">{items.map((item) => (<div key={item.product.id} className="flex justify-between items-start"><div className="flex gap-3 flex-1"><img src={item.product.image} alt={item.product.name} className="w-16 h-16 rounded-lg object-cover" /><div className="flex-1"><p className="font-semibold text-gray-900">{item.product.name}</p><p className="text-sm text-gray-600">Qty: {item.quantity}</p></div></div><p className="font-semibold text-gray-900">Rp {(item.product.price * item.quantity).toLocaleString('id-ID')}</p></div>))}<Separator /><div className="space-y-2"><div className="flex justify-between text-gray-600"><span>Subtotal</span><span>Rp {subtotal.toLocaleString('id-ID')}</span></div><div className="flex justify-between text-gray-600"><span>Biaya Pengiriman</span><span>Rp {DELIVERY_FEE.toLocaleString('id-ID')}</span></div>{gallonRentFee > 0 && (<div className="flex justify-between text-gray-600"><span>Biaya Sewa Galon ({rentedGallonQuantity}x)</span><span>Rp {gallonRentFee.toLocaleString('id-ID')}</span></div>)}<Separator /><div className="flex justify-between text-lg font-bold text-gray-900"><span>Total</span><span className="text-orange-600">Rp {total.toLocaleString('id-ID')}</span></div></div></CardContent></Card>
        
        <Card className="border-orange-100"><CardHeader><CardTitle className="text-lg">Metode Pembayaran</CardTitle></CardHeader><CardContent><RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="gap-4"><Label htmlFor="cash" className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 has-[:checked]:bg-orange-50 has-[:checked]:border-orange-400"><Wallet className="h-6 w-6 text-orange-600"/><span className="font-semibold flex-1">Bayar di Tempat (COD)</span><RadioGroupItem value="cash" id="cash" /></Label><Label htmlFor="card" className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 has-[:checked]:bg-orange-50 has-[:checked]:border-orange-400"><CreditCard className="h-6 w-6 text-blue-600"/><span className="font-semibold flex-1">Kartu Kredit/Debit</span><RadioGroupItem value="card" id="card" /></Label></RadioGroup></CardContent></Card>
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-20"><div className="max-w-3xl mx-auto"><Button onClick={handleConfirmOrder} disabled={orderProcessing || items.length === 0 || !shippingAddress} className="w-full bg-orange-600 hover:bg-orange-700 h-14 text-lg font-semibold rounded-xl shadow-lg">{orderProcessing ? 'Memproses...' : `Konfirmasi Pesanan - Rp ${total.toLocaleString('id-ID')}`}</Button></div></div>
    </div>
  );
}
