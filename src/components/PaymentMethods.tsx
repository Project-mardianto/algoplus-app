import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, Plus, MoreVertical } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import LoadingScreen from '@/components/LoadingScreen'; // Impor LoadingScreen

// Pemuat skrip Midtrans Snap
const useMidtransSnap = (clientKey: string) => {
  useEffect(() => {
    if (!clientKey) {
      console.warn('Kunci klien Midtrans tidak diatur. Fungsionalitas pembayaran akan dinonaktifkan.');
      return;
    }

    const script = document.createElement('script');
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js"; // Gunakan sandbox untuk pengembangan
    script.setAttribute('data-client-key', clientKey);
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [clientKey]);
};

interface SavedCard {
  id: string;
  card_type: string;
  masked_number: string;
  token: string; // Untuk menyimpan token Midtrans
}

export default function PaymentMethods() {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(true);

  const MIDTRANS_CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || 'Mid-client-VzNx7rMFZeWv_R9B';
  useMidtransSnap(MIDTRANS_CLIENT_KEY);

  useEffect(() => {
    const fetchUserAndCards = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data, error } = await supabase
          .from('saved_cards')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          console.error('Gagal mengambil kartu yang disimpan:', error);
          toast({ title: 'Kesalahan', description: 'Tidak dapat mengambil kartu yang disimpan.', variant: 'destructive' });
        } else {
          setSavedCards(data || []);
        }
      }
      setLoading(false);
    };

    fetchUserAndCards();
  }, [toast]);

  const handleAddCard = async () => {
    if (!(window as any).snap || !user) {
      toast({ title: 'Kesalahan', description: 'Gateway pembayaran tidak siap.', variant: 'destructive' });
      return;
    }

    try {
      // 1. Buat transaksi di backend Anda
      const response = await fetch('/api/create-transaction', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          },
          body: JSON.stringify({ userId: user.id, amount: 10000 }) // Contoh jumlah untuk registrasi kartu
      });

      if (!response.ok) throw new Error('Gagal membuat transaksi');
      
      const { token: transactionToken } = await response.json();

      // 2. Buka popup Midtrans Snap
      (window as any).snap.pay(transactionToken, {
        onSuccess: async (result: any) => {
          console.log('Sukses:', result);
          if (result.saved_card_token) {
              // 3. Simpan token kartu ke database Anda
              const { data: newCard, error } = await supabase.from('saved_cards').insert({
                  user_id: user.id,
                  token: result.saved_card_token,
                  card_type: result.card_type,
                  masked_number: result.masked_card,
              }).select().single();

              if (error) throw error;

              setSavedCards([...savedCards, newCard]);
              toast({ title: 'Sukses', description: 'Kartu berhasil ditambahkan!' });
          } else {
              toast({ title: 'Pendaftaran kartu berhasil', description: 'Kartu Anda telah disimpan.' });
          }
        },
        onPending: (result: any) => {
          console.log('Tertunda:', result);
          toast({ title: 'Pembayaran Tertunda', description: 'Menunggu konfirmasi pembayaran.' });
        },
        onError: (result: any) => {
          console.error('Kesalahan:', result);
          toast({ title: 'Pembayaran Gagal', description: result.status_message, variant: 'destructive' });
        },
        onClose: () => {
          console.log('Popup Snap ditutup');
        }
      });

    } catch (error: any) {
        console.error('Gagal membuat transaksi:', error);
        toast({ title: 'Kesalahan', description: 'Tidak dapat memulai pendaftaran kartu. Silakan coba lagi.', variant: 'destructive' });
    }
  };

  const handleRemoveCard = async (cardId: string) => {
    const { error } = await supabase.from('saved_cards').delete().eq('id', cardId);

    if (error) {
      toast({ title: 'Kesalahan', description: 'Tidak dapat menghapus kartu.', variant: 'destructive' });
    } else {
      setSavedCards(savedCards.filter(card => card.id !== cardId));
      toast({ title: 'Sukses', description: 'Kartu telah dihapus.' });
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-orange-50">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center gap-4">
          <Link to="/profile">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">Metode Pembayaran</h1>
        </div>

        {/* Daftar Kartu */}
        <div className="p-4 space-y-4">
          <h2 className="text-md font-semibold text-gray-600">Kartu Tersimpan</h2>
          {savedCards.length > 0 ? (
            savedCards.map((card) => (
              <Card key={card.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <CreditCard className="w-8 h-8 text-gray-400" />
                  <div>
                    <p className="font-semibold capitalize">{card.card_type}</p>
                    <p className="text-sm text-gray-500">{card.masked_number}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleRemoveCard(card.id)} className="text-red-500">
                      Hapus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </Card>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">Belum ada kartu yang disimpan.</p>
          )}

          <Button onClick={handleAddCard} className="w-full bg-orange-600 hover:bg-orange-700">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Kartu Baru
          </Button>
        </div>
      </div>
    </div>
  );
}
