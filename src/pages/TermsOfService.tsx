
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Droplets } from 'lucide-react';

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-4xl mx-auto">
            <div className="absolute top-4 left-4">
                <Button onClick={() => navigate('/register')} variant="ghost" size="icon" className="rounded-full">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-6">
                <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                    <Droplets className="w-7 h-7 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-800">AirGalon</span>
            </div>

            <Card className="w-full p-6 sm:p-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">Ketentuan Layanan</h1>
                
                <div className="prose prose-sm sm:prose-base max-w-none mx-auto text-gray-600">
                    <p className="text-sm text-center mb-6 italic">Terakhir diperbarui: 24 Juli 2024</p>

                    <p>Harap baca Ketentuan Layanan ("Ketentuan", "Ketentuan Layanan") ini dengan saksama sebelum menggunakan aplikasi AirGalon ("Layanan") yang dioperasikan oleh kami.</p>

                    <h2 className="text-xl font-semibold mt-6 mb-2">1. Penerimaan Persyaratan</h2>
                    <p>Dengan mengakses atau menggunakan Layanan kami, Anda setuju untuk terikat oleh Ketentuan ini. Jika Anda tidak setuju dengan bagian mana pun dari persyaratan ini, maka Anda tidak diizinkan untuk mengakses Layanan.</p>

                    <h2 className="text-xl font-semibold mt-6 mb-2">2. Penggunaan Layanan</h2>
                    <p>Anda setuju untuk tidak menyalahgunakan Layanan atau membantu orang lain untuk melakukannya. Anda setuju untuk tidak menggunakan Layanan untuk tujuan apa pun yang melanggar hukum atau dilarang oleh Ketentuan ini.</p>
                    
                    <h2 className="text-xl font-semibold mt-6 mb-2">3. Akun</h2>
                    <p>Saat Anda membuat akun dengan kami, Anda harus memberikan informasi yang akurat, lengkap, dan terkini setiap saat. Kegagalan untuk melakukannya merupakan pelanggaran terhadap Ketentuan, yang dapat mengakibatkan penghentian segera akun Anda di Layanan kami.</p>

                    <h2 className="text-xl font-semibold mt-6 mb-2">4. Perubahan</h2>
                    <p>Kami berhak, atas kebijakan kami sendiri, untuk mengubah atau mengganti Ketentuan ini kapan saja. Apa yang merupakan perubahan material akan ditentukan atas kebijakan kami sendiri.</p>

                    <p className="mt-8 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800">
                        <strong>Penting:</strong> Ini adalah konten placeholder. Anda harus mengganti teks ini dengan Ketentuan Layanan Anda yang sebenarnya, yang disusun oleh seorang profesional hukum.
                    </p>
                </div>
            </Card>
        </div>
    </div>
  );
};

export default TermsOfService;
