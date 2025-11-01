export default function StarBackground({ children }: { children?: React.ReactNode }) {
  return (
    <div className="absolute h-screen flex flex-col justify-center items-center w-full overflow-hidden bg-[#000814]">
      <div className="absolute inset-0 bg-[radial-gradient(white,transparent_1px)] bg-size-[20px_20px] opacity-20"></div>
      
      <div className="absolute inset-0 bg-[radial-gradient(white,transparent_1px)] bg-size-[25px_25px] opacity-10 animate-pulse"></div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}
