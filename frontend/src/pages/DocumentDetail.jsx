import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { toast } from 'react-toastify';
import {
  FileText,
  User,
  Calendar,
  Download,
  Trash2,
  Edit,
  ArrowLeft,
  Loader2,
  Layers,
  GraduationCap,
  BookOpen,
} from 'lucide-react';

export default function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchDoc = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/documents/${id}`);
        if (res.data.success) {
          setDoc(res.data.data);
        }
      } catch (err) {
        const message = err.response?.data?.message || 'Gagal memuat detail dokumen.';
        toast.error(message);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="w-10 h-10 text-primary-400 animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Memuat detail dokumen...</p>
      </div>
    );
  }

  if (!doc) return null;

  const tags = doc.kata_kunci
    ? doc.kata_kunci.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  const isOwner = isAuthenticated && user && doc.uploaded_by === user.id;
  const isPdf = doc.file_name?.toLowerCase().endsWith('.pdf');
  const fileUrl = `http://localhost:5000/${doc.file_path}`;
  const downloadUrl = `http://localhost:5000/api/documents/${doc.id}/download`;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await api.delete(`/documents/${doc.id}`);
      if (res.data.success) {
        toast.success(res.data.message || 'Dokumen berhasil dihapus.');
        navigate('/');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Gagal menghapus dokumen.';
      toast.error(message);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in relative">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link to="/" className="hover:text-white transition-colors">Beranda</Link>
        <span>/</span>
        <span className="text-primary-300 truncate max-w-[200px] sm:max-w-md">{doc.judul}</span>
      </div>

      {/* Grid Layout: Left Info, Right PDF Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (Metadata Details) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass rounded-2xl p-6 sm:p-8 border border-slate-700/50">
            {/* Action buttons (Back, Edit, Delete) */}
            <div className="flex items-center justify-between flex-wrap gap-3 mb-6 pb-6 border-b border-slate-800">
              <Link
                to="/"
                className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali
              </Link>

              {isOwner && (
                <div className="flex items-center gap-2">
                  <Link
                    to={`/dokumen/${doc.id}/edit`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-650 transition-all duration-200"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </Link>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/30 border border-red-500/20 hover:border-red-500/40 transition-all duration-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Hapus
                  </button>
                </div>
              )}
            </div>

            {/* Document Header */}
            <div className="mb-6">
              <span className="inline-block px-3 py-1 rounded-lg text-xs font-semibold border border-primary-500/20 bg-primary-500/10 text-primary-300 mb-3">
                {doc.jenis_karya}
              </span>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white leading-snug">
                {doc.judul}
              </h1>
            </div>

            {/* Meta Attributes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 mb-6 p-4.5 rounded-xl bg-slate-850 border border-slate-800">
              {/* Penulis */}
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Penulis</p>
                  <p className="text-sm font-medium text-white">{doc.penulis}</p>
                  <p className="text-xs text-slate-400">NPM/NIDN: {doc.npm_penulis}</p>
                </div>
              </div>

              {/* Tahun Terbit */}
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Tahun Terbit</p>
                  <p className="text-sm font-medium text-white">{doc.tahun_terbit}</p>
                </div>
              </div>

              {/* Prodi & Jurusan */}
              <div className="flex items-start gap-3 sm:col-span-2">
                <GraduationCap className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Program Studi / Jurusan</p>
                  <p className="text-sm font-medium text-white">
                    {doc.prodi} — <span className="text-slate-400">{doc.jurusan}</span>
                  </p>
                </div>
              </div>

              {/* Pembimbing */}
              {doc.dosen_pembimbing && (
                <div className="flex items-start gap-3 sm:col-span-2">
                  <Layers className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Dosen Pembimbing</p>
                    <p className="text-sm font-medium text-white">{doc.dosen_pembimbing}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Abstrak */}
            <div className="space-y-3 mb-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary-400" />
                Abstrak
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed text-justify whitespace-pre-line">
                {doc.abstrak}
              </p>
            </div>

            {/* Keywords */}
            {tags.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kata Kunci</h4>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700/60"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Download & PDF Preview) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Download card */}
          <div className="glass rounded-2xl p-6 border border-slate-700/50 shadow-lg text-center">
            <FileText className="w-12 h-12 text-primary-400 mx-auto mb-4" />
            <h3 className="text-base font-bold text-white truncate px-4">{doc.file_name}</h3>
            <p className="text-xs text-slate-500 mt-1">
              Format: {doc.file_name?.split('.').pop()?.toUpperCase()} • {doc.download_count} kali diunduh
            </p>

            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 text-white font-semibold text-sm hover:from-primary-500 hover:to-purple-500 transition-all duration-200 shadow-lg shadow-primary-500/25"
            >
              <Download className="w-4 h-4" />
              Unduh Dokumen Lengkap
            </a>
          </div>

          {/* Iframe PDF Preview */}
          {isPdf ? (
            <div className="glass rounded-2xl overflow-hidden border border-slate-700/50 shadow-lg flex flex-col h-[500px]">
              <div className="bg-slate-900 px-4 py-3 border-b border-slate-850 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Pratinjau PDF</span>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary-400 hover:underline"
                >
                  Buka tab baru
                </a>
              </div>
              <iframe
                src={`${fileUrl}#toolbar=0`}
                className="w-full flex-1 border-none"
                title={`Pratinjau PDF - ${doc.judul}`}
              />
            </div>
          ) : (
            <div className="glass rounded-2xl p-8 border border-slate-700/50 shadow-lg text-center text-slate-500 text-sm">
              Pratinjau tidak tersedia untuk format non-PDF ({doc.file_name?.split('.').pop()?.toUpperCase()}).
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass max-w-sm w-full rounded-2xl p-6 border border-red-500/30 animate-fade-in shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Hapus Dokumen?</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Apakah Anda yakin ingin menghapus <strong>{doc.judul}</strong>? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-lg text-xs font-semibold text-slate-400 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-500 transition-colors disabled:opacity-50"
              >
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
