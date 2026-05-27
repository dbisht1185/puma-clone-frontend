"use client";

import React from "react";
import { FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaInfoCircle } from "react-icons/fa";

const ConfirmationModal = ({
  open,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning", // warning, danger, info, success
  icon: CustomIcon,
}) => {
  if (!open) return null;

  const getIcon = () => {
    if (CustomIcon) return <CustomIcon className="text-4xl" />;
    
    switch (type) {
      case "danger":
        return <FaTimesCircle className="text-4xl text-red-600" />;
      case "success":
        return <FaCheckCircle className="text-4xl text-green-600" />;
      case "info":
        return <FaInfoCircle className="text-4xl text-blue-600" />;
      default:
        return <FaExclamationTriangle className="text-4xl text-yellow-600" />;
    }
  };

  const getButtonColors = () => {
    switch (type) {
      case "danger":
        return {
          confirm: "bg-red-600 hover:bg-red-700 text-white",
          cancel: "bg-gray-200 hover:bg-gray-300 text-gray-800",
        };
      case "success":
        return {
          confirm: "bg-green-600 hover:bg-green-700 text-white",
          cancel: "bg-gray-200 hover:bg-gray-300 text-gray-800",
        };
      default:
        return {
          confirm: "bg-black hover:bg-gray-800 text-white",
          cancel: "bg-gray-200 hover:bg-gray-300 text-gray-800",
        };
    }
  };

  const buttonColors = getButtonColors();

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
      style={{ backdropFilter: 'blur(2px)' }}>
      <div className="bg-white rounded-lg max-w-md w-full shadow-2xl transform transition-all animate-in zoom-in duration-200 border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">{getIcon()}</div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-700 text-base leading-relaxed">{message}</p>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 cursor-pointer ${buttonColors.cancel}`}>
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-6 py-2 rounded font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 cursor-pointer ${buttonColors.confirm}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;

