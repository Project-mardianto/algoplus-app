import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Droplets, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const UpdatePassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [isRecoverySession, setIsRecoverySession] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // This listener handles the PASSWORD_RECOVERY event.
    // When the user clicks the link in their email, they are redirected back to this page.
    // Supabase detects this and fires the PASSWORD_RECOVERY event.
    // We then set a state to confirm that we are in a valid recovery session.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        if (session) {
          setIsRecoverySession(true);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Block the update if we're not in a recovery session.
    if (!isRecoverySession) {
        setErrorMessage("Sesi pemulihan kata sandi tidak valid. Silakan minta tautan baru dari halaman Lupa Kata Sandi.");
        return;
    }

    setLoading(true);
    setErrorMessage(null);

    if (password.length < 6) {
        setErrorMessage('Kata sandi harus terdiri dari minimal 6 karakter.');
        setLoading(false);
        return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Kata sandi dan konfirmasi kata sandi tidak cocok.');
      setLoading(false);
      return;
    }

    try {
      // This function can only be called successfully within a PASSWORD_RECOVERY session.
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      // If successful, show the success screen.
      setUpdateSuccess(true);

    } catch (error: any) {
      setErrorMessage(error.message || 'Gagal memperbarui kata sandi. Tautan mungkin telah kedaluwarsa atau tidak valid.');
    } finally {
      setLoading(false);
    }
  };

  if (updateSuccess) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex flex-col items-center justify-center p-4">
            <div className="flex items-center gap-2 mb-6">
                <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                    <Droplets className="w-7 h-7 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-800">AirGalon</span>
            </div>
            <Card className="w-full max-w-md p-8 text-center shadow-lg">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 mb-3">Kata Sandi Diperbarui!</h1>
                <p className="text-gray-600 mb-8">Kata sandi Anda telah berhasil diubah. Silakan masuk dengan kata sandi baru Anda.</p>
                <Button onClick={() => navigate('/login')} className="w-full bg-orange-600 hover:bg-orange-700">
                    Lanjutkan ke Login
                </Button>
            </Card>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex flex-col items-center justify-center p-4">
        <div className="flex items-center gap-2 mb-6">
            <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                <Droplets className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-800">AirGalon</span>
        </div>

        <Card className="w-full max-w-md p-6">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold">Atur Kata Sandi Baru</h1>
                <p className="text-gray-500">Masukkan kata sandi baru Anda di bawah ini.</p>
            </div>

            <form className="space-y-4" onSubmit={handleUpdatePassword}>
                <div className="space-y-2">
                    <Label htmlFor="password">Kata Sandi Baru</Label>
                    <div className="relative">
                        <Input 
                            id="password" 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Minimal 6 karakter"
                            required 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi Baru</Label>
                    <div className="relative">
                        <Input 
                            id="confirmPassword" 
                            type={showConfirmPassword ? "text" : "password"} 
                            placeholder="Konfirmasi kata sandi baru"
                            required 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {errorMessage && <p className="text-sm text-red-500 text-center py-2 bg-red-50 rounded-md">{errorMessage}</p>}

                <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={loading || !isRecoverySession}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isRecoverySession ? 'Perbarui Kata Sandi' : 'Menunggu Sesi Pemulihan...'}
                </Button>
                 {!isRecoverySession && (
                    <p className="text-xs text-center text-gray-500 px-4">
                        Harap tunggu... Jika tidak ada yang terjadi, pastikan Anda mengakses halaman ini dari tautan di email Anda.
                    </p>
                )}
            </form>
        </Card>
    </div>
  );
};

export default UpdatePassword;
