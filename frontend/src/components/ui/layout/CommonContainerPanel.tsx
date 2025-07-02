import React, { ReactNode } from "react";
import { CommonContainerPanelProps } from "@/types";

const CommonContainerPanel: React.FC<CommonContainerPanelProps> = ({
  children,
  footer,
  isOpen,
  onClose,
  title,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    // Overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={onClose} // Optional: close when clicking overlay
    >
      {/* Modal Panel - stop propagation to prevent overlay click from closing when clicking panel itself */}
      <div
        className="relative bg-white text-text-primary border border-border-primary font-roboto rounded-lg shadow-xl w-full max-w-md m-4" // Responsive width
        onClick={(e) => e.stopPropagation()}
      >
        {/* Optional Header with Title and Close Button */}
        {(title || onClose) && (
          <div className="flex items-center justify-between p-4 border-b border-border-secondary">
            {title && <h3 className="text-lg font-semibold">{title}</h3>}
            {onClose && (
              <button
                onClick={onClose}
                className="text-text-secondary hover:text-text-primary transition-colors"
                aria-label="Close panel"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Main Content Area - Add padding if not handled by children */}
        <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {" "}
          {/* Scrollable content */}
          {children}
        </div>

        {/* Footer Area - Add padding and border if needed */}
        {footer && (
          <div className="p-4 border-t border-border-secondary flex justify-center items-center">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommonContainerPanel;
