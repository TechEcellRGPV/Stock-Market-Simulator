export function Table({ children }) {
  return <table className="min-w-full divide-y divide-gray-200">{children}</table>;
}

export function TableHeader({ children }) {
  return <thead className="bg-[#d8e5cc] ">{children}</thead>;
}

export function TableRow({ children }) {
  return <tr className="hover:bg-gray-50">{children}</tr>;
}

export function TableHeaderRow({ children }) {
  return <tr className="text-[#385723]">{children}</tr>;
}

export function TableHead({ children }) {
  return (
    <th className="px-6 py-3 text-left text-xs font-medium text-[#385723] uppercase tracking-wider">
      {children}
    </th>
  );
}

export function TableBody({ children }) {
  return <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>;
}

// ✅ Updated TableCell to support className prop
export function TableCell({ children, className = "" }) {
  return (
    <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-700 ${className}`}>
      {children}
    </td>
  );
}
