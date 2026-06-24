import { useForm } from 'react-hook-form';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { LogIn, Eye, EyeOff, BookOpen, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { npm: '', password: '' },
  });

  // Already logged in → redirect to home
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const success = await login(data.npm, data.password);
      if (success) {
        navigate('/', { replace: true });
      }
    } catch (err) {
      const message =
        err.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative animate-fade-in">
        {/* Card */}
        <div className="gradient-border">
          <div className="glass rounded-2xl p-8 sm:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary-500/20 animate-pulse-glow">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Selamat Datang</h1>
              <p className="text-sm text-slate-400">
                Masuk untuk mengelola karya ilmiah Anda
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* NPM */}
              <div>
                <label htmlFor="npm" className="block text-sm font-medium text-slate-300 mb-1.5">
                  NPM / NIDN
                </label>
                <input
                  id="npm"
                  type="text"
                  placeholder="Masukkan NPM"
                  autoComplete="username"
                  className={`w-full px-4 py-3 rounded-xl bg-slate-800/80 border text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.npm
                      ? 'border-red-500/50 focus:ring-red-500/30'
                      : 'border-slate-700 focus:ring-primary-500/30 focus:border-primary-500/50'
                  }`}
                  {...register('npm', {
                    required: 'NPM wajib diisi',
                  })}
                />
                {errors.npm && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.npm.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Tanggal lahir (DDMMYYYY)"
                    autoComplete="current-password"
                    className={`w-full px-4 py-3 pr-12 rounded-xl bg-slate-800/80 border text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${
                      errors.password
                        ? 'border-red-500/50 focus:ring-red-500/30'
                        : 'border-slate-700 focus:ring-primary-500/30 focus:border-primary-500/50'
                    }`}
                    {...register('password', {
                      required: 'Password wajib diisi',
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 text-white font-semibold text-sm hover:from-primary-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all duration-200 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Masuk
                  </>
                )}
              </button>
            </form>

            {/* Hint */}
            <div className="mt-6 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <p className="text-xs text-slate-500 text-center">
                <span className="text-slate-400 font-medium">Info:</span> Gunakan NPM sebagai username dan tanggal lahir (DDMMYYYY) sebagai password.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
