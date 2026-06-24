import { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, ArrowUpDown, TrendingUp, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import DocumentCard from '../components/DocumentCard';
import FilterBar from '../components/FilterBar';
import Pagination from '../components/Pagination';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function DocumentList() {
  const { isAuthenticated } = useAuth();
  
  // States for main document fetching
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('terbaru');
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  
  // Filters state
  const [filters, setFilters] = useState({
    tahun_terbit: '',
    prodi: '',
    jurusan: '',
    jenis_karya: '',
  });
  
  // Filter options state
  const [filterOptions, setFilterOptions] = useState({
    tahun_terbit: [],
    prodi: [],
    jurusan: [],
    jenis_karya: [],
  });

  // Pagination metadata
  const [pagination, setPagination] = useState({
    totalData: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 9,
  });

  // Trending documents state
  const [trending, setTrending] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);

  // Fetch filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const res = await api.get('/documents/filters/options');
        if (res.data.success) {
          setFilterOptions(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching filter options:', err);
      }
    };
    fetchFilterOptions();
  }, []);

  // Fetch trending documents (top 5 by download count)
  useEffect(() => {
    const fetchTrending = async () => {
      setLoadingTrending(true);
      try {
        const res = await api.get('/documents/stats/summary');
        if (res.data.success && res.data.data.trending) {
          setTrending(res.data.data.trending);
        }
      } catch (err) {
        console.error('Error fetching trending documents:', err);
      } finally {
        setLoadingTrending(false);
      }
    };
    fetchTrending();
  }, []);

  // Fetch documents list with search, filter, sort, page
  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        sort,
      };

      if (search.trim()) params.search = search;
      if (filters.tahun_terbit) params.tahun_terbit = filters.tahun_terbit;
      if (filters.prodi) params.prodi = filters.prodi;
      if (filters.jurusan) params.jurusan = filters.jurusan;
      if (filters.jenis_karya) params.jenis_karya = filters.jenis_karya;

      const res = await api.get('/documents', { params });
      if (res.data.success) {
        setDocuments(res.data.data || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Gagal mengambil data dokumen.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, sort, search, filters]);

  // Debounced/delayed search effect or simple trigger
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchDocuments();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search, filters, sort, page, fetchDocuments]);

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset to page 1 on filter change
  };

  // Handle filter reset
  const handleResetFilters = () => {
    setFilters({
      tahun_terbit: '',
      prodi: '',
      jurusan: '',
      jenis_karya: '',
    });
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in relative min-h-[80vh]">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Hero section / Branding */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
          Cari & Temukan <span className="gradient-text">Karya Ilmiah</span> Kampus
        </h1>
        <p className="text-sm sm:text-base text-slate-400">
          Repository skripsi, tesis, jurnal, dan makalah Politeknik Negeri Lampung.
          Temukan riset terbaik yang Anda butuhkan secara bebas dan mudah.
        </p>
      </div>

      {/* Trending Section (Top 5 popular documents) */}
      {trending.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Riset Populer (Trending)</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {trending.map((doc) => (
              <Link
                key={doc.id}
                to={`/dokumen/${doc.id}`}
                className="glass glass-hover rounded-xl p-4 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300"
              >
                <div>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold border border-amber-500/25 bg-amber-500/10 text-amber-300 mb-2">
                    {doc.jenis_karya}
                  </span>
                  <h3 className="text-xs font-semibold text-white leading-snug line-clamp-2 mb-2">
                    {doc.judul}
                  </h3>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-800">
                  <span className="truncate max-w-[80px]">{doc.penulis}</span>
                  <span className="text-slate-500">{doc.download_count} unduh</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Controls Bar: Search & Sort */}
      <div className="glass rounded-2xl p-5 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center border border-slate-700/50">
        {/* Search Input */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Cari judul, penulis, kata kunci..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-850 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all duration-200"
          />
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5" />
            Urutkan
          </span>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 cursor-pointer"
          >
            <option value="terbaru">Terbaru</option>
            <option value="terlama">Terlama</option>
            <option value="terpopuler">Terpopuler</option>
          </select>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="mb-8">
        <FilterBar
          filters={filters}
          filterOptions={filterOptions}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />
      </div>

      {/* Main Grid Section */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <Loader2 className="w-10 h-10 text-primary-400 animate-spin mb-4" />
          <p className="text-slate-400 text-sm">Memuat data dokumen...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center bg-slate-900/20 rounded-2xl border border-dashed border-slate-800 p-8">
          <p className="text-slate-400 mb-2">Tidak ada dokumen yang ditemukan.</p>
          <p className="text-xs text-slate-600">Coba ganti filter pencarian atau kata kunci Anda.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </>
      )}

      {/* Floating Action Button (FAB) for Upload (Only if logged in) */}
      {isAuthenticated && (
        <Link
          to="/upload"
          className="fixed bottom-6 right-6 md:hidden w-14 h-14 rounded-full bg-gradient-to-r from-primary-600 to-purple-600 text-white flex items-center justify-center shadow-2xl shadow-primary-500/30 hover:scale-105 transition-transform"
          title="Upload Dokumen Baru"
        >
          <Plus className="w-6 h-6" />
        </Link>
      )}
    </div>
  );
}
