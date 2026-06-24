import { SlidersHorizontal, RotateCcw } from 'lucide-react';

export default function FilterBar({ filters, filterOptions, onFilterChange, onReset }) {
  const selectClass =
    'px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all duration-200 appearance-none cursor-pointer';

  const hasActiveFilter = filters.tahun_terbit || filters.prodi || filters.jurusan || filters.jenis_karya;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase tracking-wider">
        <SlidersHorizontal className="w-3.5 h-3.5" />
        Filter
      </span>

      {/* Tahun */}
      <select
        value={filters.tahun_terbit || ''}
        onChange={(e) => onFilterChange('tahun_terbit', e.target.value)}
        className={selectClass}
      >
        <option value="">Semua Tahun</option>
        {filterOptions.tahun_terbit?.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>

      {/* Prodi */}
      <select
        value={filters.prodi || ''}
        onChange={(e) => onFilterChange('prodi', e.target.value)}
        className={selectClass}
      >
        <option value="">Semua Prodi</option>
        {filterOptions.prodi?.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      {/* Jurusan */}
      <select
        value={filters.jurusan || ''}
        onChange={(e) => onFilterChange('jurusan', e.target.value)}
        className={selectClass}
      >
        <option value="">Semua Jurusan</option>
        {filterOptions.jurusan?.map((j) => (
          <option key={j} value={j}>{j}</option>
        ))}
      </select>

      {/* Jenis Karya */}
      <select
        value={filters.jenis_karya || ''}
        onChange={(e) => onFilterChange('jenis_karya', e.target.value)}
        className={selectClass}
      >
        <option value="">Semua Jenis</option>
        {filterOptions.jenis_karya?.map((j) => (
          <option key={j} value={j}>{j}</option>
        ))}
      </select>

      {/* Reset */}
      {hasActiveFilter && (
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/40 transition-all duration-200"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      )}
    </div>
  );
}
