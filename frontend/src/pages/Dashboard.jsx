import { useState, useEffect } from 'react';
import { Loader2, FileText, Download, TrendingUp, BarChart3, PieChart, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await api.get('/documents/stats/summary');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        const message = err.response?.data?.message || 'Gagal memuat statistik dashboard.';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="w-10 h-10 text-primary-400 animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Memuat dashboard statistik...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-400">
        Gagal memuat data statistik.
      </div>
    );
  }

  // --- Parse stats for Chart.js ---
  
  // 1. By Year (Bar Chart)
  const byYearLabels = stats.byYear?.map((item) => String(item.tahun_terbit)) || [];
  const byYearData = stats.byYear?.map((item) => Number(item.jumlah)) || [];

  const yearChartData = {
    labels: byYearLabels,
    datasets: [
      {
        label: 'Jumlah Dokumen',
        data: byYearData,
        backgroundColor: 'rgba(217, 119, 6, 0.65)',
        borderColor: '#D97706',
        borderWidth: 1.5,
        borderRadius: 6,
      },
    ],
  };

  // 2. By Jenis Karya (Doughnut Chart)
  const byJenisLabels = stats.byJenis?.map((item) => item.jenis_karya) || [];
  const byJenisData = stats.byJenis?.map((item) => Number(item.jumlah)) || [];

  const jenisChartData = {
    labels: byJenisLabels,
    datasets: [
      {
        data: byJenisData,
        backgroundColor: [
          'rgba(139, 94, 60, 0.65)',   // Skripsi: Brown
          'rgba(217, 119, 6, 0.65)',   // Tesis: Orange
          'rgba(243, 234, 211, 0.8)',  // Jurnal: Cream
          'rgba(194, 65, 12, 0.65)',   // Makalah: Rust
        ],
        borderColor: [
          '#8B5E3C',
          '#D97706',
          '#C8B38E',
          '#C2410C',
        ],
        borderWidth: 1.5,
      },
    ],
  };

  // 3. By Jurusan (Horizontal Bar Chart)
  const byJurusanLabels = stats.byJurusan?.map((item) => item.jurusan) || [];
  const byJurusanData = stats.byJurusan?.map((item) => Number(item.jumlah)) || [];

  const jurusanChartData = {
    labels: byJurusanLabels,
    datasets: [
      {
        label: 'Dokumen per Jurusan',
        data: byJurusanData,
        backgroundColor: 'rgba(139, 94, 60, 0.65)',
        borderColor: '#8B5E3C',
        borderWidth: 1.5,
        borderRadius: 6,
      },
    ],
  };

  // Chart Options
  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        grid: { color: 'rgba(139, 94, 60, 0.1)' },
        ticks: { color: '#553922' },
      },
      y: {
        grid: { color: 'rgba(139, 94, 60, 0.1)' },
        ticks: { color: '#553922', stepSize: 1 },
      },
    },
  };

  const horizontalBarOptions = {
    responsive: true,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        grid: { color: 'rgba(139, 94, 60, 0.1)' },
        ticks: { color: '#553922', stepSize: 1 },
      },
      y: {
        grid: { color: 'rgba(139, 94, 60, 0.1)' },
        ticks: { color: '#553922' },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#2C1A10',
          padding: 20,
          font: { size: 12 },
        },
      },
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          Dashboard Statistik
        </h1>
        <p className="text-slate-400 mt-2">Gambaran umum dan visualisasi persebaran dokumen karya ilmiah.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Documents */}
        <div className="glass rounded-2xl p-6 border border-slate-700/50 flex items-center gap-5 shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Dokumen</p>
            <p className="text-2xl font-bold text-white mt-0.5">{stats.totalDocuments}</p>
          </div>
        </div>

        {/* Total Downloads */}
        <div className="glass rounded-2xl p-6 border border-slate-700/50 flex items-center gap-5 shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Unduhan</p>
            <p className="text-2xl font-bold text-white mt-0.5">{stats.totalDownloads}</p>
          </div>
        </div>

        {/* Total Year Options */}
        <div className="glass rounded-2xl p-6 border border-slate-700/50 flex items-center gap-5 shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Tahun Aktif</p>
            <p className="text-2xl font-bold text-white mt-0.5">{stats.byYear?.length || 0}</p>
          </div>
        </div>

        {/* Total Jurusan */}
        <div className="glass rounded-2xl p-6 border border-slate-700/50 flex items-center gap-5 shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Jurusan</p>
            <p className="text-2xl font-bold text-white mt-0.5">{stats.byJurusan?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Year Bar Chart */}
        <div className="glass rounded-2xl p-6 border border-slate-700/50 flex flex-col justify-between shadow-lg lg:col-span-2">
          <div>
            <h3 className="text-base font-bold text-white mb-4">Jumlah Dokumen per Tahun Terbit</h3>
          </div>
          <div className="min-h-[260px] flex items-center justify-center">
            {byYearLabels.length > 0 ? (
              <Bar data={yearChartData} options={barOptions} />
            ) : (
              <p className="text-slate-500 text-sm">Tidak ada data tahun.</p>
            )}
          </div>
        </div>

        {/* Jenis Karya Pie Chart */}
        <div className="glass rounded-2xl p-6 border border-slate-700/50 flex flex-col justify-between shadow-lg">
          <div>
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-purple-400" />
              Persebaran Jenis Karya
            </h3>
          </div>
          <div className="min-h-[260px] flex items-center justify-center">
            {byJenisLabels.length > 0 ? (
              <Doughnut data={jenisChartData} options={doughnutOptions} />
            ) : (
              <p className="text-slate-500 text-sm">Tidak ada data jenis karya.</p>
            )}
          </div>
        </div>

        {/* Jurusan Chart */}
        <div className="glass rounded-2xl p-6 border border-slate-700/50 flex flex-col justify-between shadow-lg lg:col-span-2">
          <div>
            <h3 className="text-base font-bold text-white mb-4">Persebaran per Jurusan</h3>
          </div>
          <div className="min-h-[260px] flex items-center justify-center">
            {byJurusanLabels.length > 0 ? (
              <Bar data={jurusanChartData} options={horizontalBarOptions} />
            ) : (
              <p className="text-slate-500 text-sm">Tidak ada data jurusan.</p>
            )}
          </div>
        </div>

        {/* Stats Summary Panel */}
        <div className="glass rounded-2xl p-6 border border-slate-700/50 flex flex-col justify-between shadow-lg">
          <div>
            <h3 className="text-base font-bold text-white mb-4">Ringkasan Jenis Karya</h3>
          </div>
          <div className="space-y-4">
            {stats.byJenis?.map((item, idx) => {
              const percentages = stats.totalDocuments
                ? ((Number(item.jumlah) / stats.totalDocuments) * 100).toFixed(0)
                : 0;

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <span>{item.jenis_karya}</span>
                    <span>{item.jumlah} ({percentages}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        item.jenis_karya === 'Skripsi'
                          ? 'bg-primary-500'
                          : item.jenis_karya === 'Tesis'
                          ? 'bg-purple-500'
                          : item.jenis_karya === 'Jurnal'
                          ? 'bg-primary-300'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${percentages}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top 5 Trending Documents Table */}
      <div className="glass rounded-2xl p-6 border border-slate-700/50 shadow-lg">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <h2 className="text-lg font-bold text-white">5 Riset Terpopuler (Paling Banyak Diunduh)</h2>
        </div>

        {stats.trending && stats.trending.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-850 text-slate-500 border-b border-slate-850">
                <tr>
                  <th scope="col" className="px-6 py-4">Judul Dokumen</th>
                  <th scope="col" className="px-6 py-4">Penulis</th>
                  <th scope="col" className="px-6 py-4">Jenis Karya</th>
                  <th scope="col" className="px-6 py-4">Unduhan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {stats.trending.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4.5 font-medium text-white max-w-sm sm:max-w-md md:max-w-lg truncate">
                      <Link to={`/dokumen/${doc.id}`} className="hover:text-primary-400 transition-colors">
                        {doc.judul}
                      </Link>
                    </td>
                    <td className="px-6 py-4.5 text-slate-400">{doc.penulis}</td>
                    <td className="px-6 py-4.5">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold border border-slate-800 bg-slate-800 text-slate-400">
                        {doc.jenis_karya}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 font-semibold text-white">{doc.download_count} kali</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-500 text-sm text-center py-6">Tidak ada data trending.</p>
        )}
      </div>
    </div>
  );
}
