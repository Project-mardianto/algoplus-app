import express from 'express';
import cors from 'cors';
import midtransClient from 'midtrans-client';
import dotenv from 'dotenv';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// --- Environment Variable Validation ---
const requiredEnv = [
  'MIDTRANS_SERVER_KEY',
  'VITE_MIDTRANS_CLIENT_KEY',
  'VITE_APP_URL',
  'RESEND_API_KEY',
  'VITE_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY'
];

const missingEnv = requiredEnv.filter(key => !process.env[key]);

if (missingEnv.length > 0) {
  console.error(`FATAL ERROR: Missing required environment variables: ${missingEnv.join(', ')}`);
  process.exit(1);
}

// --- Client Initialization ---
const app = express();
const port = 8082;

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const midtrans = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.VITE_MIDTRANS_CLIENT_KEY!
});

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- API Endpoints ---

// Endpoint for Midtrans Transaction
app.post('/api/create-transaction', async (req, res) => {
  try {
    const { order_id, gross_amount, customer_details } = req.body;

    if (!order_id || !gross_amount || !customer_details) {
      return res.status(400).json({ error: 'order_id, gross_amount, and customer_details are required' });
    }

    const parameter = {
      transaction_details: { order_id, gross_amount },
      credit_card: { secure: true },
      customer_details,
      callbacks: { finish: `${process.env.VITE_APP_URL}/orders` },
    };

    const transaction = await midtrans.createTransaction(parameter);
    res.status(200).json(transaction);

  } catch (error: any) {
    console.error('Midtrans API Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint for Sending Password Reset Email
app.post('/api/send-password-reset', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // 1. Generate a password reset link using Supabase Admin
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${process.env.VITE_APP_URL}/update-password`
      }
    });

    if (linkError) {
      // Log the specific Supabase error
      console.error('Supabase Link Generation Error:', linkError.message);
      // Provide a more user-friendly error message
      return res.status(500).json({ error: 'Gagal membuat tautan reset kata sandi.', details: linkError.message });
    }

    const resetLink = linkData.properties.action_link;

    // 2. Send the link via email using Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'AirGalon <noreply@app.algoplus.com>', // Using your actual domain
      to: [email],
      subject: 'Reset Kata Sandi Akun AirGalon Anda',
      html: `
        <h1>Reset Kata Sandi Anda</h1>
        <p>Anda menerima email ini karena ada permintaan untuk mereset kata sandi akun Anda.</p>
        <p>Klik tautan di bawah ini untuk melanjutkan:</p>
        <a href="${resetLink}" style="color: white; background-color: #F97316; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Kata Sandi</a>
        <p>Jika Anda tidak merasa meminta ini, abaikan saja email ini.</p>
        <p>Tautan ini akan kedaluwarsa dalam 1 jam.</p>
      `,
    });

    if (emailError) {
      // If email sending fails, throw the specific error from Resend
      throw emailError;
    }

    res.status(200).json({ message: 'Password reset email sent successfully.', emailData });

  } catch (error: any) {
    // Log the detailed error object for better debugging
    console.error('--- Full Error on Password Reset ---');
    console.error(`Name: ${error.name}`);
    console.error(`Message: ${error.message}`);
    console.error(`Stack: ${error.stack}`);
    console.error('------------------------------------');
    
    // Respond with a structured error message
    res.status(500).json({ 
      error: 'Gagal mengirim email pemulihan.',
      details: error.message // Send the specific error message to the frontend
    });
  }
});


// --- Server Start ---
app.listen(port, () => {
  console.log(`Express server running at http://localhost:${port}`);
});
