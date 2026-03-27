import React from "react";
import { FaHome, FaReceipt } from "react-icons/fa";
import { MdOutlineReorder, MdTableBar } from "react-icons/md";
import { useNavigate, useLocation } from "react-router-dom";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#262626] p-2 h-16 flex justify-around">
      <button
        onClick={() => navigate("/")}
        className={`flex items-center justify-center font-bold ${isActive("/") ? "text-[#f5f5f5] bg-[#343434]" : "text-[#ababab]"
          } w-[200px] rounded-[20px] transition-all`}
      >
        <FaHome className="inline mr-2" size={20} /> <p>POS</p>
      </button>

      <button
        onClick={() => navigate("/orders")}
        className={`flex items-center justify-center font-bold ${isActive("/orders") ? "text-[#f5f5f5] bg-[#343434]" : "text-[#ababab]"
          } w-[200px] rounded-[20px] transition-all`}
      >
        <MdOutlineReorder className="inline mr-2" size={20} /> <p>Kitchen</p>
      </button>

      <button
        onClick={() => navigate("/tables")}
        className={`flex items-center justify-center font-bold ${isActive("/tables") ? "text-[#f5f5f5] bg-[#343434]" : "text-[#ababab]"
          } w-[200px] rounded-[20px] transition-all`}
      >
        <MdTableBar className="inline mr-2" size={20} /> <p>Tables</p>
      </button>

      <button
        onClick={() => navigate("/receipts")}
        className={`flex items-center justify-center font-bold ${isActive("/receipts") ? "text-[#f5f5f5] bg-[#343434]" : "text-[#ababab]"
          } w-[200px] rounded-[20px] transition-all`}
      >
        <FaReceipt className="inline mr-2" size={20} /> <p>Receipts</p>
      </button>
    </div>
  );
};

export default BottomNav;
