import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setSubmitError(null);
      await login(data.email, data.password);
      // Navigate to where they were trying to go, or fallback to marketplace
      const from = location.state?.from?.pathname || '/marketplace';
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Login failed. Please check your credentials.';
      setSubmitError(msg);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-160px)] bg-[#F4F4F0] p-4">
      <div className="max-w-md w-full bg-white shadow-sm rounded-lg p-8 border border-[#E0E0D8]">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Welcome Back</h1>
          <p className="text-sm text-[#666660] mt-1">Sign in to your account</p>
        </div>

        {submitError && (
          <div className="mb-4 p-3 bg-[#D64045]/10 border border-[#D64045]/20 text-[#D64045] rounded text-sm">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
              Email
            </label>
            <input
              type="email"
              {...register('email')}
              className="w-full border border-[#E0E0D8] rounded px-4 py-2 focus:border-[#1DA0C3] focus:ring-1 focus:ring-[#1DA0C3] bg-white outline-none transition-colors"
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-[#D64045]">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
              Password
            </label>
            <input
              type="password"
              {...register('password')}
              className="w-full border border-[#E0E0D8] rounded px-4 py-2 focus:border-[#1DA0C3] focus:ring-1 focus:ring-[#1DA0C3] bg-white outline-none transition-colors"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-[#D64045]">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#1DA0C3] hover:bg-[#1589A8] text-white rounded py-2.5 font-medium transition-colors disabled:opacity-70 flex items-center justify-center mt-6"
          >
            {isSubmitting ? (
              <span className="inline-block h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-[#666660]">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#1DA0C3] hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
