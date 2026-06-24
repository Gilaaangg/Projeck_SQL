import { useForm } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { Edit as EditIcon, FileText, X, Loader2, ArrowLeft } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const JENIS_KARYA_OPTIONS = ['Skripsi', 'Tesis', 'Jurnal', 'Makalah'];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const ALLOWED_EXT = '.pdf,.doc,.docx';

export default function Edit() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [existingFileName, setExistingFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  // Load existing data
  useEffect(() => {
    const fetchDoc = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/documents/${id}`);
        if (res.data.success) {
          const doc = res.data.data;
          
          // Verify ownership in frontend
          if (doc.uploaded_by !== user?.id) {
            toast.error('Anda tidak memiliki izin untuk mengubah dokumen ini.');
            navigate(`/dokumen/${id}`);
            return;
          }

          // Reset react-hook-form default values
          reset({
            judul: doc.judul,
            penulis: doc.penulis,
            npm_penulis: doc.npm_penulis,
            prodi: doc.prodi,
            jurusan: doc.jurusan,
            tahun_terbit: doc.tahun_terbit,
            jenis_karya: doc.jenis_karya,
            abstrak: doc.abstrak,
            dosen_pembimbing: doc.dosen_pembimbing || '',
          });

          setExistingFileName(doc.file_name);
          if (doc.kata_kunci) {
            setTags(doc.kata_kunci.split(',').map((t) => t.trim()).filter(Boolean));
          }
        }
      } catch (err) {
        const message = err.response?.data?.message || 'Gagal memuat data dokumen.';
        toast.error(message);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id, reset, user, navigate]);

  // ===== File handling =====
  const handleFileSelect = (file) => {
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Format file tidak didukung. Hanya menerima PDF, DOC, atau DOCX.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Ukuran file melebihi 20MB.');
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ===== Tag (kata kunci) handling =====
  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput('');
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  // ===== Submit =====
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      // Only append new file if uploader chooses to update it
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      formData.append('judul', data.judul);
      formData.append('penulis', data.penulis);
      formData.append('npm_penulis', data.npm_penulis);
      formData.append('prodi', data.prodi);
      formData.append('jurusan', data.jurusan);
      formData.append('tahun_terbit', data.tahun_terbit);
      formData.append('jenis_karya', data.jenis_karya);
      formData.append('abstrak', data.abstrak);
      formData.append('kata_kunci', tags.join(','));
      formData.append('dosen_pembimbing', data.dosen_pembimbing || '');

      const res = await api.put(`/documents/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Dokumen berhasil diperbarui!');
        navigate(`/dokumen/${id}`);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Gagal memperbarui dokumen.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (hasError) =>
    `w-full px-4 py-3 rounded-xl bg-slate-800/80 border text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${
      hasError
        ? 'border-red-500/50 focus:ring-red-500/30'
        : 'border-slate-700 focus:ring-primary-500/30 focus:border-primary-500/50'
    }`;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="w-10 h-10 text-primary-400 animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Memuat data dokumen...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link to="/" className="hover:text-white transition-colors">Beranda</Link>
        <span>/</span>
        <Link to={`/dokumen/${id}`} className="hover:text-white transition-colors truncate max-w-[150px]">Detail Dokumen</Link>
        <span>/</span>
        <span className="text-primary-300">Edit Dokumen</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
            <EditIcon className="w-5 h-5 text-white" />
          </div>
          Edit Metadata Dokumen
        </h1>
        <p className="text-slate-400 mt-2">Ubah informasi dokumen karya ilmiah di bawah ini.</p>
      </div>

      {/* Form Card */}
      <div className="glass rounded-2xl p-6 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* ===== File Upload Zone (Optional) ===== */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              File Dokumen (Opsional - isi hanya jika ingin mengganti file lama)
            </label>
            {!selectedFile ? (
              <div className="space-y-3">
                {/* Existing file tag */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <FileText className="w-4 h-4 text-primary-400" />
                    <span>File lama tetap dipakai: <strong className="text-slate-300">{existingFileName}</strong></span>
                  </div>
                </div>

                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                    dragActive
                      ? 'border-primary-400 bg-primary-500/10'
                      : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/30'
                  }`}
                >
                  <FileText className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-300">
                    Pilih file baru untuk menggantikan file lama, atau <span className="text-primary-400">klik di sini</span>
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">PDF, DOC, DOCX — Maks. 20MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ALLOWED_EXT}
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files?.[0])}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-850 border border-slate-700">
                <FileText className="w-8 h-8 text-primary-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{selectedFile.name}</p>
                  <p className="text-xs text-slate-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB (Baru)</p>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* ===== Form Grid ===== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Judul */}
            <div className="sm:col-span-2">
              <label htmlFor="judul" className="block text-sm font-medium text-slate-300 mb-1.5">
                Judul <span className="text-red-400">*</span>
              </label>
              <input
                id="judul"
                type="text"
                className={inputClass(errors.judul)}
                {...register('judul', { required: 'Judul wajib diisi' })}
              />
              {errors.judul && <p className="mt-1.5 text-xs text-red-400">{errors.judul.message}</p>}
            </div>

            {/* Penulis */}
            <div>
              <label htmlFor="penulis" className="block text-sm font-medium text-slate-300 mb-1.5">
                Penulis <span className="text-red-400">*</span>
              </label>
              <input
                id="penulis"
                type="text"
                className={inputClass(errors.penulis)}
                {...register('penulis', { required: 'Penulis wajib diisi' })}
              />
              {errors.penulis && <p className="mt-1.5 text-xs text-red-400">{errors.penulis.message}</p>}
            </div>

            {/* NPM Penulis */}
            <div>
              <label htmlFor="npm_penulis" className="block text-sm font-medium text-slate-300 mb-1.5">
                NPM / NIDN Penulis <span className="text-red-400">*</span>
              </label>
              <input
                id="npm_penulis"
                type="text"
                className={inputClass(errors.npm_penulis)}
                {...register('npm_penulis', { required: 'NPM/NIDN penulis wajib diisi' })}
              />
              {errors.npm_penulis && <p className="mt-1.5 text-xs text-red-400">{errors.npm_penulis.message}</p>}
            </div>

            {/* Prodi */}
            <div>
              <label htmlFor="prodi" className="block text-sm font-medium text-slate-300 mb-1.5">
                Program Studi <span className="text-red-400">*</span>
              </label>
              <input
                id="prodi"
                type="text"
                className={inputClass(errors.prodi)}
                {...register('prodi', { required: 'Program studi wajib diisi' })}
              />
              {errors.prodi && <p className="mt-1.5 text-xs text-red-400">{errors.prodi.message}</p>}
            </div>

            {/* Jurusan */}
            <div>
              <label htmlFor="jurusan" className="block text-sm font-medium text-slate-300 mb-1.5">
                Jurusan <span className="text-red-400">*</span>
              </label>
              <input
                id="jurusan"
                type="text"
                className={inputClass(errors.jurusan)}
                {...register('jurusan', { required: 'Jurusan wajib diisi' })}
              />
              {errors.jurusan && <p className="mt-1.5 text-xs text-red-400">{errors.jurusan.message}</p>}
            </div>

            {/* Tahun Terbit */}
            <div>
              <label htmlFor="tahun_terbit" className="block text-sm font-medium text-slate-300 mb-1.5">
                Tahun Terbit <span className="text-red-400">*</span>
              </label>
              <input
                id="tahun_terbit"
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                className={inputClass(errors.tahun_terbit)}
                {...register('tahun_terbit', {
                  required: 'Tahun terbit wajib diisi',
                  valueAsNumber: true,
                  min: { value: 1900, message: 'Tahun tidak valid' },
                  max: { value: new Date().getFullYear(), message: 'Tahun tidak valid' },
                })}
              />
              {errors.tahun_terbit && <p className="mt-1.5 text-xs text-red-400">{errors.tahun_terbit.message}</p>}
            </div>

            {/* Jenis Karya */}
            <div>
              <label htmlFor="jenis_karya" className="block text-sm font-medium text-slate-300 mb-1.5">
                Jenis Karya <span className="text-red-400">*</span>
              </label>
              <select
                id="jenis_karya"
                className={inputClass(errors.jenis_karya)}
                {...register('jenis_karya', { required: 'Jenis karya wajib dipilih' })}
              >
                <option value="">— Pilih Jenis Karya —</option>
                {JENIS_KARYA_OPTIONS.map((jenis) => (
                  <option key={jenis} value={jenis}>{jenis}</option>
                ))}
              </select>
              {errors.jenis_karya && <p className="mt-1.5 text-xs text-red-400">{errors.jenis_karya.message}</p>}
            </div>

            {/* Dosen Pembimbing */}
            <div>
              <label htmlFor="dosen_pembimbing" className="block text-sm font-medium text-slate-300 mb-1.5">
                Dosen Pembimbing
              </label>
              <input
                id="dosen_pembimbing"
                type="text"
                className={inputClass(false)}
                {...register('dosen_pembimbing')}
              />
            </div>
          </div>

          {/* Abstrak */}
          <div>
            <label htmlFor="abstrak" className="block text-sm font-medium text-slate-300 mb-1.5">
              Abstrak <span className="text-red-400">*</span>
            </label>
            <textarea
              id="abstrak"
              rows={5}
              className={`${inputClass(errors.abstrak)} resize-y`}
              {...register('abstrak', { required: 'Abstrak wajib diisi' })}
            />
            {errors.abstrak && <p className="mt-1.5 text-xs text-red-400">{errors.abstrak.message}</p>}
          </div>

          {/* Kata Kunci */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Kata Kunci
            </label>
            <div className="flex flex-wrap items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 focus-within:ring-2 focus-within:ring-primary-500/30 focus-within:border-primary-500/50 transition-all duration-200">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-500/15 text-primary-300 text-xs font-medium"
                >
                  {tag}
                  <button type="button" onClick={() => removeTag(i)} className="hover:text-red-400 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={addTag}
                placeholder={tags.length === 0 ? 'Ketik lalu tekan Enter...' : ''}
                className="flex-1 min-w-[100px] bg-transparent text-white placeholder-slate-500 text-sm outline-none"
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-500">Tekan Enter atau koma untuk menambah kata kunci.</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
            <Link
              to={`/dokumen/${id}`}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-200 border border-slate-700 hover:border-slate-600"
            >
              <ArrowLeft className="w-4 h-4" />
              Batal
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 text-white font-semibold text-sm hover:from-primary-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all duration-200 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <EditIcon className="w-4 h-4" />
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
