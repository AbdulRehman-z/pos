import React from "react";
import { FaSearch } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";
import { FaReceipt } from "react-icons/fa6";
import logo from "../../assets/images/logo.png";
import { useDispatch, useSelector } from "react-redux";
import { setSearchQuery } from "../../redux/slices/appSlice";
import { useNavigate } from "react-router-dom";
import { MdDashboard, MdDeleteSweep } from "react-icons/md";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAllOrders } from "../../https";
import { enqueueSnackbar } from "notistack";
import Modal from "../ui/Modal";
import { useState } from "react";

const Header = () => {
  const userData = useSelector((state) => state.user);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const deleteAllMutation = useMutation({
    mutationFn: deleteAllOrders,
    onSuccess: () => {
      queryClient.invalidateQueries(["orders"]);
      queryClient.invalidateQueries(["dashboardStats"]);
      enqueueSnackbar("All order records deleted successfully", { variant: "success" });
      setIsConfirmOpen(false);
      // navigate("/dashboard");
    },
    onError: () => {
      enqueueSnackbar("Failed to delete records", { variant: "error" });
    }
  });

  return (
    <header className="flex justify-between items-center py-4 px-8 bg-[#1a1a1a]">
      {/* LOGO */}
      <div onClick={() => navigate("/")} className="flex items-center gap-2 cursor-pointer">
        <img src={logo} className="h-8 w-8" alt="restro logo" />
        <h1 className="text-lg font-semibold text-[#f5f5f5] tracking-wide">
          FryDate Cafe
        </h1>
      </div>

      {/* ACTIONS */}
      <div className="flex items-center gap-4">
        {/* Dashboard - visible to all authenticated users */}
        <div
          onClick={() => navigate("/dashboard")}
          className="bg-[#1f1f1f] rounded-[15px] p-3 cursor-pointer hover:bg-orange-500/20 hover:text-orange-500 transition-all group"
          title="Dashboard"
        >
          <MdDashboard className="text-[#f5f5f5] text-2xl group-hover:text-orange-500" />
        </div>

        {/* Receipts - visible to all authenticated users */}
        <div
          onClick={() => navigate("/receipts")}
          className="bg-[#1f1f1f] rounded-[15px] p-3 cursor-pointer hover:bg-orange-500/20 hover:text-orange-500 transition-all group"
          title="Receipts"
        >
          <FaReceipt className="text-[#f5f5f5] text-2xl group-hover:text-orange-500" />
        </div>

        {/* Delete All Records - Only for Admins or if you want it visible to all */}
        <div
          onClick={() => setIsConfirmOpen(true)}
          className="bg-red-600/10 border border-red-600/20 rounded-[15px] p-3 cursor-pointer hover:bg-red-600 hover:text-white transition-all group"
          title="Delete All Records"
        >
          <MdDeleteSweep className="text-red-600 text-2xl group-hover:text-white" />
        </div>

        <div className="flex items-center gap-3 cursor-pointer bg-[#1f1f1f] py-2 px-4 rounded-[15px] border border-white/5">
          <FaUserCircle className="text-[#f5f5f5] text-3xl" />
          <div className="flex flex-col items-start mr-2">
            <h1 className="text-sm text-[#f5f5f5] font-semibold tracking-wide">
              {userData.name || "User"}
            </h1>
            <p className="text-[10px] text-[#ababab] font-medium uppercase tracking-wider">
              Mohib
            </p>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirm Bulk Deletion"
      >
        <div className="space-y-6">
          <div className="bg-red-600/10 border border-red-600/20 rounded-xl p-6 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white scale-110 shadow-xl shadow-red-600/30">
              <MdDeleteSweep size={32} />
            </div>
            <div>
              <p className="text-xl text-white font-black uppercase tracking-tight">Clear All Records?</p>
              <p className="text-gray-400 text-sm mt-3 font-medium">
                This will <span className="text-white font-bold underline decoration-red-500 underline-offset-4 tracking-wide">PERMANENTLY DELETE</span> all order data, transaction history, and dashboard metrics.
              </p>
              <p className="text-red-400 text-[10px] mt-2 font-bold uppercase tracking-widest italic">
                Products and Categories will be preserved.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setIsConfirmOpen(false)}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white py-4 rounded-xl font-black uppercase tracking-widest transition-all border border-white/5"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteAllMutation.mutate()}
              disabled={deleteAllMutation.isPending}
              className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-2xl shadow-red-600/40 transition-all"
            >
              {deleteAllMutation.isPending ? "Clearing..." : "Delete All"}
            </button>
          </div>
        </div>
      </Modal>
    </header>
  );
};

export default Header;
