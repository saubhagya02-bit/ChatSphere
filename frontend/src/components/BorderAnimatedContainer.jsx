function BorderAnimatedContainer({ children }) {
  return (
    <div className="relative w-full h-full p-1 bg-[#020617] rounded-xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 animate-gradient-xy blur-[60px] opacity-50" />

      <div className="relative w-full h-full bg-[#020617] rounded-xl p-4">
        {children}
      </div>
    </div>
  );
}

export default BorderAnimatedContainer;
