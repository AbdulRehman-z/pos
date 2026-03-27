import React, { useState } from "react";
import { FaTrash, FaCheckDouble, FaLongArrowAltRight } from "react-icons/fa";
import { FaCircle } from "react-icons/fa";
import { formatDateAndTime, getAvatarName } from "../../utils/index";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteOrder } from "../../https";
import { enqueueSnackbar } from "notistack";
import Modal from "../ui/Modal";

const OrderCard = ({ order }) => {
  const queryClient = useQueryClient();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries(["orders"]);
      queryClient.invalidateQueries(["dashboardStats"]);
      enqueueSnackbar("Order deleted successfully", { variant: "success" });
    },
    onError: () => {
      enqueueSnackbar("Failed to delete order", { variant: "error" });
    }
  });

  const handleDelete = (e) => {
    e.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate(order._id);
    setIsDeleteModalOpen(false);
  };

  return (
    <>
      <div className="w-[500px] bg-[#262626] p-4 rounded-lg mb-4">
        <div className="flex items-center gap-5">
          <button className="bg-[#f6b100] p-3 text-xl font-bold rounded-lg">
            {getAvatarName(order.customerDetails.name)}
          </button>
          <div className="flex items-center justify-between w-[100%]">
            <div className="flex flex-col items-start gap-1">
              <h1 className="text-[#f5f5f5] text-lg font-semibold tracking-wide">
                {order.customerDetails.name}
              </h1>
              <p className="text-[#ababab] text-sm">#{Math.floor(new Date(order.orderDate).getTime())} / Dine in</p>
              <p className="text-[#ababab] text-sm">Table <FaLongArrowAltRight className="text-[#ababab] ml-2 inline" /> {order.table.tableNo}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {order.orderStatus === "Ready" ? (
                <>
                  <p className="text-green-600 bg-[#2e4a40] px-2 py-1 rounded-lg">
                    <FaCheckDouble className="inline mr-2" /> {order.orderStatus}
                  </p>
                  <p className="text-[#ababab] text-sm">
                    <FaCircle className="inline mr-2 text-green-600" /> Ready to
                    serve
                  </p>
                </>
              ) : (
                <>
                  <p className="text-yellow-600 bg-[#4a452e] px-2 py-1 rounded-lg">
                    <FaCircle className="inline mr-2" /> {order.orderStatus}
                  </p>
                  <p className="text-[#ababab] text-sm">
                    <FaCircle className="inline mr-2 text-yellow-600" /> Preparing your order
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-4 text-[#ababab]">
          <p>{formatDateAndTime(order.orderDate || order.timestamp)}</p>
          <div className="flex items-center gap-4">
            <p>{order.items.length} Items</p>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="text-red-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-all flex items-center gap-1 text-sm font-bold"
              title="Delete Order"
            >
              <FaTrash size={14} />
              {deleteMutation.isPending ? "..." : "Delete"}
            </button>
          </div>
        </div>
        <hr className="w-full mt-4 border-t-1 border-gray-500" />
        <div className="flex items-center justify-between mt-4">
          <h1 className="text-[#f5f5f5] text-lg font-semibold">Total</h1>
          <p className="text-[#f5f5f5] text-lg font-semibold">₹{order.bills.totalWithTax.toFixed(2)}</p>
        </div>
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="⚠️ DELETE ORDER WARNING"
      >
        <div className="space-y-6">
          <div className="bg-red-600/10 border border-red-600/20 rounded-xl p-6 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white scale-110 shadow-xl shadow-red-600/30">
              <FaTrash size={24} />
            </div>
            <div>
              <p className="text-xl text-white font-black uppercase tracking-tight text-center">Delete Order {order.order_id}?</p>
              <p className="text-red-400 text-sm mt-3 font-bold">WARNING:</p>
              <p className="text-gray-400 text-sm mt-1">
                This will <span className="text-white font-bold decoration-red-500 underline underline-offset-4 tracking-wide text-center">PERMANENTLY REMOVE</span> this order record from the system.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white py-4 rounded-xl font-black uppercase tracking-widest transition-all border border-white/5"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-2xl shadow-red-600/40 transition-all relative overflow-hidden group"
            >
              <span className="relative z-10">
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default OrderCard;
