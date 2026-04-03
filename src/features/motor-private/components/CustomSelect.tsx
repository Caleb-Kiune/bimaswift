"use client";

import { useState, useRef, useEffect } from "react";

export function CustomSelect({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.id === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="w-full flex items-center justify-between bg-white border border-zinc-300 rounded-lg py-2 pl-3 pr-2 text-sm text-zinc-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
      >
        <span className="block truncate">
          {selectedOption?.label || "Select an option..."}
        </span>
        <svg
          className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu with Animation */}
      <div
        className={`absolute z-20 mt-1 w-full bg-white border border-zinc-200 rounded-lg shadow-lg overflow-hidden transition-all duration-200 origin-top-right ${
          isOpen
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <ul className="max-h-60 overflow-auto py-1 focus:outline-none">
          {options.map((opt) => {
            const isSelected = opt.id === value;
            return (
              <li
                key={opt.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(opt.id);
                  setIsOpen(false);
                }}
                className={`relative cursor-pointer select-none py-2 pl-10 pr-4 text-sm transition-colors ${
                  isSelected
                    ? "bg-indigo-50 text-indigo-900"
                    : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                <span
                  className={`block truncate ${isSelected ? "font-medium" : "font-normal"}`}
                >
                  {opt.label}
                </span>
                {/* Selected Checkmark Icon */}
                {isSelected && (
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
