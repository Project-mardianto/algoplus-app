import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Droplets, Loader2, ArrowLeft, MailCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;

      setEmailSent(true);
    } catch (error: any) {
      setErrorMessage(error.message || 'Gagal mengirim email reset kata sandi.');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex flex-col items-center justify-center p-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
            <Droplets className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-800">AirGalon</span>
        </div>
        <Card className="w-full max-w-md p-8 text-center shadow-lg">
            <MailCheck className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-3">Periksa Email Anda</h1>
          <p className="text-gray-600 mb-8">
            Kami telah mengirimkan tautan untuk mengatur ulang kata sandi Anda ke <br />
            <strong className="text-gray-800">{email}</strong>.
          </p>
          <Button onClick={() => navigate('/login')} className="w-full bg-orange-600 hover:bg-orange-700">
            Kembali ke Halaman Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex flex-col items-center justify-center p-4 relative">
        <div className="absolute top-4 left-4">
            <Link to="/login">
                <Button variant="ghost" size="icon" className="rounded-full">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
            </Link>
        </div>

        <div className="flex items-center gap-2 mb-6">
            <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                <Droplets className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-800">AirGalon</span>
        </div>

        <Card className="w-full max-w-md p-6">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold">Lupa Kata Sandi?</h1>
                <p className="text-gray-500">Jangan khawatir! Masukkan email Anda untuk mendapatkan tautan reset.</p>
            </div>

            <form className="space-y-4" onSubmit={handleForgotPassword}>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                        id="email" 
                        type="email" 
                        placeholder="Masukkan email Anda"
                        required 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        onInvalid={e => (e.target as HTMLInputElement).setCustomValidity('Harap masukkan alamat email yang valid.')} 
                        onInput={e => (e.target as HTMLInputElement).setCustomValidity('')} 
                    />
                </div>

                {errorMessage && <p className="text-sm text-red-500 text-center">{errorMessage}</p>}

                <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Kirim Tautan Reset
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
                Ingat kata sandi Anda?{' '}
                <Link to="/login" className="font-medium text-orange-600 hover:underline">
                    Masuk di sini
                </Link>
            </p>
        </Card>
    </div>
  );
};

export default ForgotPassword;