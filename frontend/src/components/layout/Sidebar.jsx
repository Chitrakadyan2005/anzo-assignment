import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>Anzo IMS</h2>
        <p>Inventory System</p>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className="sidebar-link">
          Dashboard
        </NavLink>

        <NavLink to="/items" className="sidebar-link">
          Items
        </NavLink>

        <NavLink to="/pallets" className="sidebar-link">
          Pallets
        </NavLink>

        <NavLink to="/inventory" className="sidebar-link">
          Inventory
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;