import { Link } from 'react-router-dom';
import { Download, Calendar, User } from 'lucide-react';

const JENIS_COLORS = {
  Skripsi: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
  Tesis: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  Jurnal: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
  Makalah: 'bg-rose-500/15 text-rose-300 border-rose-500/20',
};

export default function DocumentCard({ doc }) {
  const tags = doc.kata_kunci
    ? doc.kata_kunci.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  const badgeClass = JENIS_COLORS[doc.jenis_karya] || 'bg-slate-500/15 text-slate-300 border-slate-500/20';

  return (
    <Link
      to={`/dokumen/${doc.id}`}
      className="glass glass-hover rounded-2xl p-5 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 group"
    >
      {/* Top row — badge + download count */}
      <div className="flex items-center justify-between">
        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${badgeClass}`}>
          {doc.jenis_karya}
        </span>
        <span className="flex items-center gap-1 text-xs text-slate-500">
          <Download className="w-3.5 h-3.5" />
          {doc.download_count || 0}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-sm sm:text-base font-semibold text-white leading-snug line-clamp-2 group-hover:text-primary-300 transition-colors">
        {doc.judul}
      </h3>

      {/* Penulis + Tahun */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <User className="w-3.5 h-3.5" />
          {doc.penulis}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {doc.tahun_terbit}
        </span>
      </div>

      {/* Abstrak preview */}
      {doc.abstrak && (
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
          {doc.abstrak}
        </p>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
          {tags.slice(0, 4).map((tag, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-medium"
            >
              {tag}
            </span>
          ))}
          {tags.length > 4 && (
            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-500 text-[10px]">
              +{tags.length - 4}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
