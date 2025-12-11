# Air Galon - Water Delivery App

A modern, mobile-first water gallon delivery application built with React, TypeScript, and Tailwind CSS.

## Features

### 🛒 Product Selection
- Browse premium water gallon types (Mineral, Purified, Alkaline, Oxygenated)
- Interactive quantity controls with increment/decrement buttons
- Real-time cart updates
- Responsive grid layout

### 💳 Checkout Flow
- Order summary with itemized costs
- Multiple payment methods:
  - Cash on Delivery
  - E-Wallet (GoPay, OVO, Dana, ShopeePay)
  - Bank Transfer (BCA, Mandiri, BNI, BRI)
- Delivery fee calculation
- Clean, intuitive interface

### 📍 Real-time Order Tracking
- Live order status updates
- Interactive map visualization
- Driver information card with:
  - Photo and name
  - Rating display
  - Vehicle number
  - Contact button
- Estimated arrival time countdown
- Status timeline with visual indicators

### ✅ Order Completion
- Digital invoice with complete order details
- Payment breakdown
- Download PDF functionality
- WhatsApp sharing
- Rating prompt for driver feedback

### 🎨 Design System
- Blue and white color scheme for trust and cleanliness
- Large touch-friendly buttons
- Smooth transitions and animations
- Bottom navigation for easy access
- Responsive design for all screen sizes

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **Icons**: Lucide React
- **Routing**: React Router v6
- **Date Handling**: date-fns

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── ProductCard.tsx  # Individual product display
│   ├── ProductSelection.tsx  # Main product browsing screen
│   ├── Checkout.tsx     # Checkout and payment screen
│   ├── OrderTracking.tsx  # Real-time tracking screen
│   ├── OrderComplete.tsx  # Order completion and invoice
│   ├── BottomNav.tsx    # Bottom navigation bar
│   └── home.tsx         # Main app orchestrator
├── data/
│   └── products.ts      # Product catalog
├── types/
│   ├── order.ts         # Order-related TypeScript types
│   └── supabase.ts      # Supabase types (if needed)
└── lib/
    └── utils.ts         # Utility functions
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Key Components

### ProductSelection
Entry point for browsing and selecting water gallons. Features a responsive grid layout with real-time cart management.

### Checkout
Handles payment method selection and order confirmation. Displays order summary with delivery fee calculation.

### OrderTracking
Provides real-time order tracking with driver information, estimated arrival time, and status updates.

### OrderComplete
Shows digital invoice with options to download PDF or share via WhatsApp.

## Features Implementation

- ✅ Product selection with quantity controls
- ✅ Checkout flow with payment methods
- ✅ Real-time order tracking simulation
- ✅ Driver information display
- ✅ Order completion with digital invoice
- ✅ Responsive mobile-first design
- ✅ Bottom navigation
- ✅ Smooth transitions and animations

## Future Enhancements

- Integration with real mapping service (Google Maps/Mapbox)
- Backend API integration for order management
- User authentication and profile management
- Order history
- Push notifications for order updates
- Payment gateway integration
- Multi-language support
# algoplus-app
