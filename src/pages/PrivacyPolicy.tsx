
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Droplets } from 'lucide-react';

const PrivacyPolicy = () => {
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
                <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">Kebijakan Privasi</h1>
                
                <div className="prose prose-sm sm:prose-base max-w-none mx-auto text-gray-600">
                    <p className="text-sm text-center mb-6 italic">Terakhir diperbarui: 6 januari 2026</p>

                    <p>Kebijakan Privasi ini menjelaskan bagaimana informasi Anda dikumpulkan, digunakan, dan dibagikan saat Anda menggunakan Layanan kami.</p>

                    <h2 className="text-xl font-semibold mt-6 mb-2">1. Informasi yang Kami Kumpulkan</h2>
                    <p>Kami mengumpulkan informasi yang Anda berikan langsung kepada kami. Misalnya, kami mengumpulkan informasi saat Anda membuat akun, seperti nama, alamat email, dan kata sandi Anda.</p>

                    <h2 className="text-xl font-semibold mt-6 mb-2">2. Bagaimana Kami Menggunakan Informasi Anda</h2>
                    <p>Kami menggunakan informasi yang kami kumpulkan untuk menyediakan, memelihara, dan meningkatkan Layanan kami, termasuk untuk mempersonalisasi pengalaman Anda.</p>
                    
                    <h2 className="text-xl font-semibold mt-6 mb-2">3. Berbagi Informasi</h2>
                    <p>Kami tidak membagikan informasi pribadi Anda dengan pihak ketiga kecuali sebagaimana dijelaskan dalam Kebijakan Privasi ini atau dengan persetujuan Anda.</p>

                    <h2 className="text-xl font-semibold mt-6 mb-2">4. Keamanan</h2>
                    <p>Kami mengambil langkah-langkah yang wajar untuk melindungi informasi tentang Anda dari kehilangan, pencurian, penyalahgunaan, dan akses tidak sah.</p>

                    <p className="mt-8 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800">
                        <strong>Penting:</strong> Ini adalah konten placeholder. Anda harus mengganti teks ini dengan Kebijakan Privasi Anda yang sebenarnya, yang disusun oleh seorang profesional hukum.
                    </p>
                </div>
            </Card>
        </div>
    </div>
  );
};

export default PrivacyPolicy;
