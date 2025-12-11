import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Droplets, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '@/components/ui/use-toast';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const getFriendlyErrorMessage = (message: string): string => {
    if (message.includes('Invalid login credentials')) {
      return 'Email atau kata sandi yang Anda masukkan salah.';
    }
    if (message.includes('Email not confirmed')) {
      return 'Email Anda belum diverifikasi. Silakan periksa kotak masuk Anda.';
    }
    return 'Terjadi kesalahan saat mencoba masuk. Silakan coba lagi.';
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast({ title: 'Sukses', description: 'Anda berhasil masuk.' });
      navigate('/'); // Redirect to home or dashboard
    } catch (error: any) {
      setErrorMessage(getFriendlyErrorMessage(error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
    setLoading(true);
    try {
      // The redirectTo option is removed.
      // Supabase will now use the Site URL from your project's URL configuration.
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
      });
      if (error) throw error;
    } catch (error: any) {
      setErrorMessage(`Terjadi kesalahan saat mencoba masuk dengan ${provider}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex flex-col items-center justify-center p-4 relative">
        <div className="absolute top-4 left-4">
            <Link to="/">
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
                <h1 className="text-2xl font-bold">Selamat Datang Kembali!</h1>
                <p className="text-gray-500">Masuk ke akun Anda untuk melanjutkan.</p>
            </div>

            <form className="space-y-4" onSubmit={handleLogin}>
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
                
                <div className="space-y-2">
                    <Label htmlFor="password">Kata Sandi</Label>
                    <div className="relative">
                        <Input 
                            id="password" 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Masukkan kata sandi Anda" 
                            required 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            onInvalid={e => (e.target as HTMLInputElement).setCustomValidity('Kolom ini wajib diisi.')} 
                            onInput={e => (e.target as HTMLInputElement).setCustomValidity('')} 
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <Checkbox id="remember-me" />
                        <Label htmlFor="remember-me" className="font-normal text-gray-600">Ingat saya</Label>
                    </div>
                    <Link to="/forgot-password" className="font-medium text-orange-600 hover:underline">
                        Lupa kata sandi?
                    </Link>
                </div>

                {errorMessage && <p className="text-sm text-red-500 text-center py-2">{errorMessage}</p>}

                <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Masuk
                </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500">Atau lanjutkan dengan</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={() => handleOAuthLogin('google')} disabled={loading}><img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" className="w-4 h-4 mr-2" />Google</Button>
                <Button variant="outline" onClick={() => handleOAuthLogin('facebook')} disabled={loading}><img src="https://upload.wikimedia.org/wikipedia/commons/f/fb/Facebook_icon_2013.svg" alt="Facebook" className="w-5 h-5 mr-2" />Facebook</Button>
            </div>

            <p className="mt-6 text-center text-sm text-gray-500">
                Belum punya akun?{' '}
                <Link to="/register" className="font-medium text-orange-600 hover:underline">
                    Daftar di sini
                </Link>
            </p>
        </Card>
    </div>
  );
};

export default Login;
