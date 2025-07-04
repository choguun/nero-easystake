import React from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { TokenSearchInputProps } from "@/types";

const TokenSearchInput: React.FC<TokenSearchInputProps> = ({
  searchQuery,
  setSearchQuery,
  placeholder = "Search Tokens...",
  className = "relative flex-1 max-w-xs",
  inputClassName = "w-full pl-8 pr-8 py-1 text-sm border rounded-md focus:outline-none focus:border-black transition-all duration-300 ease-in-out",
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className={className} data-oid="2:cwvc.">
      <input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={handleSearchChange}
        className={inputClassName}
        data-oid="-l:t2jt"
      />

      <FiSearch
        className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
        data-oid="vwwkzry"
      />

      {searchQuery && (
        <FiX
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600"
          onClick={clearSearch}
          data-oid="9n92cwt"
        />
      )}
    </div>
  );
};

export default TokenSearchInput;
