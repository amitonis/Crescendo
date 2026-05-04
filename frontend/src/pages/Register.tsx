import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Music, Mic2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username must be at most 30 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['fan', 'artist']),
  bio: z.string().max(500, 'Bio must be at most 500 characters').optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'fan',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setSubmitError(null);
      await registerUser({
        username: data.username,
        email: data.email,
        password: data.password,
        role: data.role,
      });
      navigate('/marketplace');
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Registration failed. Please try again.';
      setSubmitError(msg);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-160px)] bg-[#F4F4F0] p-4 py-12">
      <div className="max-w-lg w-full bg-white shadow-sm rounded-lg p-8 border border-[#E0E0D8]">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Join Crescendo</h1>
          <p className="text-sm text-[#666660] mt-1">
            Create your account to start exploring independent music
          </p>
        </div>

        {submitError && (
          <div className="mb-6 p-3 bg-[#D64045]/10 border border-[#D64045]/20 text-[#D64045] rounded text-sm">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={() => setValue('role', 'fan')}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedRole === 'fan'
                  ? 'border-[#1DA0C3] bg-[#1DA0C3]/5'
                  : 'border-[#E0E0D8] hover:border-[#1DA0C3]/50'
              }`}
            >
              <Music className={`w-6 h-6 mb-2 ${selectedRole === 'fan' ? 'text-[#1DA0C3]' : 'text-[#666660]'}`} />
              <div className={`font-medium ${selectedRole === 'fan' ? 'text-[#1A1A1A]' : 'text-[#666660]'}`}>
                I'm a Fan
              </div>
              <div className="text-xs text-[#666660] mt-1">
                Discover and collect music
              </div>
            </button>
            <button
              type="button"
              onClick={() => setValue('role', 'artist')}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedRole === 'artist'
                  ? 'border-[#1DA0C3] bg-[#1DA0C3]/5'
                  : 'border-[#E0E0D8] hover:border-[#1DA0C3]/50'
              }`}
            >
              <Mic2 className={`w-6 h-6 mb-2 ${selectedRole === 'artist' ? 'text-[#1DA0C3]' : 'text-[#666660]'}`} />
              <div className={`font-medium ${selectedRole === 'artist' ? 'text-[#1A1A1A]' : 'text-[#666660]'}`}>
                I'm an Artist
              </div>
              <div className="text-xs text-[#666660] mt-1">
                Upload and sell your music
              </div>
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
              Username
            </label>
            <input
              type="text"
              {...register('username')}
              className="w-full border border-[#E0E0D8] rounded px-4 py-2 focus:border-[#1DA0C3] focus:ring-1 focus:ring-[#1DA0C3] bg-white outline-none transition-colors"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-[#D64045]">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
              Email
            </label>
            <input
              type="email"
              {...register('email')}
              className="w-full border border-[#E0E0D8] rounded px-4 py-2 focus:border-[#1DA0C3] focus:ring-1 focus:ring-[#1DA0C3] bg-white outline-none transition-colors"
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
            <p className="mt-1 text-xs text-[#666660]">Must be at least 8 characters</p>
            {errors.password && (
              <p className="mt-1 text-sm text-[#D64045]">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              {...register('confirmPassword')}
              className="w-full border border-[#E0E0D8] rounded px-4 py-2 focus:border-[#1DA0C3] focus:ring-1 focus:ring-[#1DA0C3] bg-white outline-none transition-colors"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-[#D64045]">{errors.confirmPassword.message}</p>
            )}
          </div>

          {selectedRole === 'artist' && (
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
                Artist Bio <span className="text-[#666660] font-normal">(Optional)</span>
              </label>
              <textarea
                {...register('bio')}
                className="w-full border border-[#E0E0D8] rounded px-4 py-2 focus:border-[#1DA0C3] focus:ring-1 focus:ring-[#1DA0C3] bg-white outline-none transition-colors min-h-[100px] resize-y"
                placeholder="Tell fans about yourself and your music..."
              />
              {errors.bio && (
                <p className="mt-1 text-sm text-[#D64045]">{errors.bio.message}</p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#1DA0C3] hover:bg-[#1589A8] text-white rounded py-2.5 font-medium transition-colors disabled:opacity-70 flex items-center justify-center mt-8"
          >
            {isSubmitting ? (
              <span className="inline-block h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-[#666660]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#1DA0C3] hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
