import React from "react";
import { BaseInputComponentProps } from "@/types";

const BaseInput: React.FC<BaseInputComponentProps> = ({
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
  variant = "send",
  rightElement,
  leftElement,
  className = "",
  inputClassName = "",
  containerClassName = "",
  labelClassName = "",
  errorClassName = "",
  helpText,
  helpTextClassName = "",
  type = "text",
  inputRef,
  onClick,
  readOnly,
  ...rest
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  const baseContainerClass = variant === "send" ? "w-full mb-3" : "flex-1";
  const baseLabelClass = "block text-text-secondary text-1sm";
  const baseInputClass = `${
    variant === "send" ? "w-full" : ""
  } p-2 rounded-md text-secondary border border-border-primary bg-bg-primary outline-none transition-all duration-300 ease-in-out focus:border-black`;

  const baseErrorClass = "text-red-500 text-xs mt-1";
  const baseHelpTextClass = "text-text-secondary text-xs mt-1";

  return (
    <div
      className={`${baseContainerClass} ${containerClassName} ${className}`}
      data-oid="x6cn-3x"
    >
      {label && (
        <label
          className={`${baseLabelClass} ${labelClassName}`}
          data-oid="y3hg20-"
        >
          {label}
        </label>
      )}
      <div className="relative flex text-sm" data-oid="ld7la0:">
        {leftElement && (
          <div
            className="absolute left-2 top-1/2 transform -translate-y-1/2"
            data-oid="g9.7z36"
          >
            {leftElement}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          ref={inputRef}
          onClick={onClick}
          readOnly={readOnly}
          className={`${baseInputClass} ${leftElement ? "pl-8" : ""} ${
            rightElement ? "pr-8" : ""
          } ${error ? "border-red-500" : ""} ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          } ${readOnly ? "cursor-pointer" : ""} ${inputClassName}`}
          {...rest}
          data-oid="4wfwhjy"
        />

        {rightElement && (
          <div
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            data-oid="xxwfkzc"
          >
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <div
          className={`${baseErrorClass} ${errorClassName}`}
          data-oid="pqsw5uo"
        >
          {error}
        </div>
      )}
      {helpText && (
        <div
          className={`${baseHelpTextClass} ${helpTextClassName}`}
          data-oid="nkyz1ig"
        >
          {helpText}
        </div>
      )}
    </div>
  );
};

export default BaseInput;
