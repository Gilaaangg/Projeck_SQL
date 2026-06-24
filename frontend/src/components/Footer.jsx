import { BookOpen, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-primary-500/80 to-purple-500/80 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-400">
              Repository Karya Ilmiah
            </span>
          </div>

          {/* Copyright */}
          <p className="text-xs text-slate-500 flex items-center gap-1">
            © {new Date().getFullYear()} — Politeknik Negeri Lampung. Dibuat dengan
            <Heart className="w-3 h-3 text-red-400 inline" />
          </p>
        </div>
      </div>
    </footer>
  );
}
