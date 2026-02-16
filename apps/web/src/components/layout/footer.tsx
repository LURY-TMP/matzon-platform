import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-accent to-accent-cyan flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">M</span>
            </div>
            <span className="font-display text-sm font-bold tracking-wider text-white/60">MATZON</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-white/35">
            <Link href="/about" className="hover:text-white/60 transition-colors">About</Link>
            <Link href="/terms" className="hover:text-white/60 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
            <Link href="/contact" className="hover:text-white/60 transition-colors">Contact</Link>
          </div>
          <p className="text-xs text-white/25">&copy; 2026 MATZON.gg</p>
        </div>
      </div>
    </footer>
  );
}
