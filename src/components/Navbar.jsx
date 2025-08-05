// src/components/Navbar.jsx
import { FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <h1 className="text-lg font-bold">Todo App</h1>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 bg-red-500 px-3 py-1 rounded hover:bg-red-600"
      >
        <FaSignOutAlt /> Logout
      </button>
    </nav>
  );
}
