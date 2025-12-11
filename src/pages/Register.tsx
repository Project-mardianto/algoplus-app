import { useState } from "react";
import { Eye, EyeOff, Droplets, ArrowLeft, MailCheck, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Kata sandi dan konfirmasi kata sandi tidak cocok.");
      return;
    }
    
    if (!agreedToTerms) {
      setErrorMessage("Anda harus menyetujui Ketentuan Layanan dan Kebijakan Privasi.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            full_name: formData.name,
            phone: formData.phone,
          },
        },
      });

      if (error) throw error;

      setRegistrationComplete(true);

    } catch (error: any) {
      if (error.message.includes("User already registered")) {
        setErrorMessage("Pengguna dengan email ini sudah terdaftar.");
      } else {
        setErrorMessage(error.message || "Terjadi kesalahan saat pendaftaran.");
      }
    } finally {
      setLoading(false);
    }
  };
  
  if (registrationComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex flex-col items-center justify-center p-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
            <Droplets className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-800">AirGalon</span>
        </div>
        <Card className="w-full max-w-md p-8 text-center shadow-lg">
            <MailCheck className="w-16 h-16 text-orange-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-3">Periksa Email Anda</h1>
          <p className="text-gray-600 mb-6">
            Kami telah mengirimkan tautan verifikasi ke <br />
            <strong className="text-gray-800">{formData.email}</strong>.
          </p>
          <p className="text-sm text-gray-500 mb-8">Silakan klik tautan di email untuk mengaktifkan akun Anda.</p>
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
          <Button onClick={() => navigate(-1)} variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
          </Button>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
          <Droplets className="w-7 h-7 text-white" />
        </div>
        <span className="text-2xl font-bold text-gray-800">AirGalon</span>
      </div>

      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-center mb-2">Buat Akun Baru</h1>
        <p className="text-gray-500 text-center mb-6">Lengkapi data di bawah untuk mendaftar.</p>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input id="name" name="name" type="text" placeholder="Masukkan nama lengkap" value={formData.name} onChange={handleChange} required onInvalid={e => (e.target as HTMLInputElement).setCustomValidity('Kolom ini wajib diisi.')} onInput={e => (e.target as HTMLInputElement).setCustomValidity('')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="Masukkan email valid" value={formData.email} onChange={handleChange} required onInvalid={e => (e.target as HTMLInputElement).setCustomValidity('Harap masukkan alamat email yang valid.')} onInput={e => (e.target as HTMLInputElement).setCustomValidity('')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Nomor Telepon</Label>
            <Input id="phone" name="phone" type="tel" placeholder="+62 812 3456 7890" value={formData.phone} onChange={handleChange} required onInvalid={e => (e.target as HTMLInputElement).setCustomValidity('Kolom ini wajib diisi.')} onInput={e => (e.target as HTMLInputElement).setCustomValidity('')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Kata Sandi</Label>
            <div className="relative">
              <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="Minimal 6 karakter" value={formData.password} onChange={handleChange} required onInvalid={e => (e.target as HTMLInputElement).setCustomValidity('Kolom ini wajib diisi.')} onInput={e => (e.target as HTMLInputElement).setCustomValidity('')} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"><Eye className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi</Label>
            <div className="relative">
              <Input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Ulangi kata sandi" value={formData.confirmPassword} onChange={handleChange} required onInvalid={e => (e.target as HTMLInputElement).setCustomValidity('Kolom ini wajib diisi.')} onInput={e => (e.target as HTMLInputElement).setCustomValidity('')} />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"><Eye className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="flex items-start gap-3 pt-2">
            <Checkbox id="terms" checked={agreedToTerms} onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)} />
            <Label htmlFor="terms" className="text-sm font-normal text-gray-600">
              Saya telah membaca dan menyetujui <br/>
              <Link to="/terms-of-service" target="_blank" className="text-orange-600 hover:underline font-medium">Ketentuan Layanan</Link> dan <Link to="/privacy-policy" target="_blank" className="text-orange-600 hover:underline font-medium">Kebijakan Privasi</Link>.
            </Label>
          </div>

          {errorMessage && <p className="text-sm text-red-500 text-center pt-2">{errorMessage}</p>}

          <Button 
            type="submit" 
            className="w-full bg-orange-600 hover:bg-orange-700"
            disabled={loading || !agreedToTerms}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
            {loading ? "Membuat Akun..." : "Buat Akun"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Sudah punya akun?{" "}
          <Link to="/login" className="font-medium text-orange-600 hover:underline">
            Masuk di sini
          </Link>
        </p>
      </Card>
    </div>
  );
}
