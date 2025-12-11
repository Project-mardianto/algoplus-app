import { useLocation, Routes, Route, useNavigate } from "react-router-dom";
import { useCart } from "./context/CartContext";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import Home from "./components/home";
import Orders from "./components/Orders";
import Profile from "./components/Profile";
import BottomNav from "./components/BottomNav";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Notifications from "./components/Notifications";
import Checkout from "./components/Checkout";
import OrderComplete from "./components/OrderComplete";
import DriverApp from "./components/DriverApp";
import SupplierPanel from "./components/SupplierPanel";
import CorporateSubscription from "./components/CorporateSubscription";
import OrderHistory from "./components/OrderHistory";
import OrderTracking from "./components/OrderTracking";
import { Order } from "./types/order";
import './styles/transitions.css'; // Import the new transitions

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { itemCount } = useCart();

  const excludedPaths = [
    "/login", "/register", "/forgot-password", "/update-password",
    "/terms-of-service", "/privacy-policy", "/checkout", "/order-complete",
    "/driver", "/supplier", "/corporate", "/order-tracking"
  ];

  const showBottomNav = !excludedPaths.some(path => location.pathname.startsWith(path));
  const onHomePage = location.pathname === '/';

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.startsWith('/orders')) return 'orders';
    if (path.startsWith('/profile')) return 'profile';
    return 'home';
  };

  const handleConfirmOrder = (order: Order) => {
    navigate("/order-complete", { state: { order } });
  };

  const handleBackFromCheckout = () => {
    navigate(-1);
  };

  const getMainContentPadding = () => {
    if (!showBottomNav) return "";
    if (onHomePage && itemCount > 0) return "pb-44";
    return "pb-20";
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <main className={getMainContentPadding()}>
        <TransitionGroup component={null}>
          <CSSTransition key={location.key} classNames="slide-left" timeout={300}>
            <Routes location={location}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/update-password" element={<UpdatePassword />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />

              <Route path="/" element={<Home />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/checkout" element={<Checkout onConfirmOrder={handleConfirmOrder} onBack={handleBackFromCheckout} />} />
              <Route path="/order-complete" element={<OrderComplete />} />
              <Route path="/driver" element={<DriverApp />} />
              <Route path="/supplier" element={<SupplierPanel />} />
              <Route path="/corporate" element={<CorporateSubscription />} />
              <Route path="/order-history" element={<OrderHistory />} />
              <Route path="/order-tracking/:id" element={<OrderTracking />} />
            </Routes>
          </CSSTransition>
        </TransitionGroup>
      </main>
      {showBottomNav && <BottomNav activeTab={getActiveTab()} />}
    </div>
  );
}

export default App;
