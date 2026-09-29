import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function AdminNotice() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0d0d0d] text-white">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-2xl w-full bg-[#161616] border border-[#d4af37]/30 rounded-2xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden">
          {/* Subtle gold glow background */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Desktop Icon Badge */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/40 mb-6 text-[#d4af37]">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37] font-semibold mb-2">
            DE-GRACE EXECUTIVE SUITE
          </p>
          <h1 className="text-3xl md:text-4xl font-serif text-white mb-4 tracking-wide font-normal">
            Desktop Management Terminal
          </h1>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-8 max-w-lg mx-auto">
            Store administration, live inventory management, order dispatch, and financial analytics have been transitioned to the dedicated <strong className="text-gray-200">C# Desktop Application</strong> for heightened enterprise security and native performance.
          </p>

          {/* Feature Specs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-left">
            <div className="bg-[#1f1f1f] p-4 rounded-xl border border-white/5">
              <div className="text-xs text-[#d4af37] uppercase font-bold tracking-wider mb-1">Architecture</div>
              <div className="text-sm text-gray-200 font-medium">C# .NET 8 WPF</div>
              <div className="text-xs text-gray-500 mt-1">Native Windows App</div>
            </div>
            <div className="bg-[#1f1f1f] p-4 rounded-xl border border-white/5">
              <div className="text-xs text-[#d4af37] uppercase font-bold tracking-wider mb-1">Security</div>
              <div className="text-sm text-gray-200 font-medium">Air-tight REST API</div>
              <div className="text-xs text-gray-500 mt-1">Isolated Admin Channel</div>
            </div>
            <div className="bg-[#1f1f1f] p-4 rounded-xl border border-white/5">
              <div className="text-xs text-[#d4af37] uppercase font-bold tracking-wider mb-1">Status</div>
              <div className="text-sm text-emerald-400 font-medium">Backend Ready</div>
              <div className="text-xs text-gray-500 mt-1">Phase 1 Verified (100%)</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-gradient-to-r from-[#d4af37] to-[#aa8c2c] text-black font-semibold rounded-lg hover:opacity-95 transition-all shadow-lg text-sm tracking-wider uppercase"
            >
              Return to Boutique Storefront
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-transparent border border-white/20 text-white font-medium rounded-lg hover:bg-white/5 transition-all text-sm tracking-wider uppercase"
            >
              Explore Collections
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default AdminNotice;
