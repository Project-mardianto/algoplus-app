import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { CartProvider } from "./context/CartContext"; // Import CartProvider
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS

const basename = import.meta.env.BASE_URL;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <CartProvider> {/* Add CartProvider here */}
        <App />
      </CartProvider> {/* And close it here */}
    </BrowserRouter>
  </React.StrictMode>,
);
