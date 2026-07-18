// src/components/Footer.tsx
// Global footer component containing branding and copyright details.

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-800 bg-slate-900/40 py-6 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
        {/* Left Side: Brand Logo and Name */}
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="CarVault Logo" className="h-12 w-auto object-contain" />
          <span className="font-bold tracking-tight text-white text-base">CarVault</span>
        </div>

        {/* Right Side: Copyright */}
        <div className="text-center sm:text-right">
          <p className="text-sm text-slate-400">
            &copy; {currentYear} CarVault. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
