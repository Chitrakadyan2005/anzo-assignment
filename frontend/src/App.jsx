import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Navbar from "./components/layout/Navbar";

import Dashboard from "./pages/Dashboard";
import Items from "./pages/Items";
import Pallets from "./pages/Pallets";
import PalletDetails from "./pages/PalletDetails";
import Inventory from "./pages/Inventory";

function App() {
  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-section">
        <Navbar />

        <div className="page-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/items" element={<Items />} />
            <Route path="/pallets" element={<Pallets />} />
            <Route path="/pallets/:id" element={<PalletDetails />} />
            <Route path="/inventory" element={<Inventory />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;