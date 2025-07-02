import React from "react";
import { ErrorDisplayProps } from "@/types/Paymaster";
import { getUserFriendlyErrorMessage } from "@/utils";

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => {
  return (
    <div className="w-full bg-white rounded-xl p-3" data-oid="i53:-6g">
      <div className="text-red-500 font-medium mb-1" data-oid="zeuslw0">
        Payment Service Error
      </div>
      <div className="text-sm text-gray-700" data-oid="5z31ny:">
        {getUserFriendlyErrorMessage(error)}
      </div>
      <button
        onClick={onRetry}
        className="mt-2 text-sm text-blue-500 hover:text-blue-700"
        data-oid="8nhncae"
      >
        Retry
      </button>
    </div>
  );
};

export default ErrorDisplay;
