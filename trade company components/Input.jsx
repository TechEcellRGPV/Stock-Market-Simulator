export function Input({ className, ...props }) {
  return (
    <input
      className={`border border-[#94AB71] rounded-md px-3 py-2 w-full text-sm text-[#385723]  focus:outline-none focus:ring-2 focus:ring-[#94AB71] focus:border-[#94AB71] ${className}`}
      {...props}
    />
  );
}
