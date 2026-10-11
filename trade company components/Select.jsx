import { useState, useContext, createContext } from "react";
import { ChevronDown } from "lucide-react";

const SelectContext = createContext();

export function Select({ children, value, onValueChange }) {
  const [open, setOpen] = useState(false);

  const handleSelect = (newValue) => {
    onValueChange?.(newValue);
    setOpen(false);
  };

  return (
    <SelectContext.Provider value={{ open, setOpen, value, onValueChange: handleSelect }}>
      <div className="relative inline-block w-full">{children}</div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ children, className = "" }) {
  const { setOpen } = useContext(SelectContext);
  return (
    <button
      onClick={() => setOpen(prev => !prev)}
      className={`border px-4 py-2 rounded-md bg-white text-sm w-full flex items-center justify-between ${className}`}
    >
      {children}
      <ChevronDown className="w-4 h-4 ml-2" />
    </button>
  );
}

export function SelectValue({ placeholder }) {
  const { value } = useContext(SelectContext);
  return (
    <span className="truncate">
      {value ? value : <span className="">{placeholder}</span>}
    </span>
  );
}

export function SelectContent({ children }) {
  const { open } = useContext(SelectContext);
  if (!open) return null;

  return (
    <div className="absolute left-0 mt-1 w-full bg-white border rounded-md shadow-lg z-50">
      <div className="py-1 max-h-60 overflow-y-auto">{children}</div>
    </div>
  );
}

export function SelectItem({ children, value }) {
  const { onValueChange } = useContext(SelectContext);
  return (
    <div
      className="px-4 py-2 text-sm  text-[#618943] hover:bg-gray-100 cursor-pointer"
      onClick={() => onValueChange(value)}
    >
      {children}
    </div>
  );
}
