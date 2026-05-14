import { useAuth } from '../contexts/AuthContext/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const loginSchema = z.object({
  username: z.string().min(1, 'Email or Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login({
        username: data.username.trim(),
        password: data.password,
      } as any);
      toast.success('Logged in successfully!');
      navigate('/', { replace: true });
    } catch (err: any) {
      const d = err?.response?.data;
      const message =
        d?.non_field_errors?.[0] ??
        d?.detail ??
        (typeof d === 'string' ? d : null) ??
        'Login failed. Please check your credentials.';
      toast.error(message);
    }
  };

  return (
    <div className='min-h-dvh bg-white sm:bg-teal-50/60 flex flex-col items-center justify-center'>
      <div className='w-full max-w-sm flex-1 sm:flex-none flex flex-col justify-between sm:justify-start sm:rounded-2xl sm:border sm:border-teal-100 sm:bg-white p-6 sm:shadow-sm sm:my-8'>
        <header className='mb-8 mt-4 sm:mt-0'>
          <h1 className='text-3xl font-black text-teal-700 tracking-tight'>
            EcoLens | Login
          </h1>
          <p className='text-gray-500 mt-2 '>Welcome back!</p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
          <div>
            <label
              htmlFor='username'
              className='mb-1.5 block text-[13px] font-semibold text-gray-700 ml-1'
            >
              Email or Username
            </label>
            <input
              {...register('username')}
              type='text'
              placeholder='Enter email or username'
              className={`w-full rounded-xl border-2 px-4 py-3 text-base sm:text-sm outline-none transition focus:ring-4 ${
                errors.username
                  ? 'border-red-500 focus:ring-red-100'
                  : 'border-gray-200 focus:border-teal-500 focus:ring-teal-50'
              }`}
            />
            {errors.username && (
              <p className='mt-1.5 text-xs text-red-500 font-medium ml-1'>
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor='password'
              className='mb-1.5 block text-[13px] font-semibold text-gray-700 ml-1'
            >
              Password
            </label>
            <input
              {...register('password')}
              type='password'
              placeholder='Enter your password'
              className={`w-full rounded-xl border-2 px-4 py-3 text-base sm:text-sm outline-none transition focus:ring-4 ${
                errors.password
                  ? 'border-red-500 focus:ring-red-100'
                  : 'border-gray-200 focus:border-teal-500 focus:ring-teal-50'
              }`}
            />
            {errors.password && (
              <p className='mt-1.5 text-xs text-red-500 font-medium ml-1'>
                {errors.password.message}
              </p>
            )}
          </div>

          <div className='flex justify-end'>
            <button
              type='button'
              className='text-sm font-semibold text-teal-600 hover:text-teal-700'
            >
              Forgot password?
            </button>
          </div>
        </form>

        <div className='mt-10 sm:mt-8 space-y-4'>
          <button
            onClick={handleSubmit(onSubmit)}
            type='submit'
            disabled={isSubmitting}
            className='w-full rounded-xl bg-teal-600 px-4 py-3.5 text-base font-bold text-white transition hover:bg-teal-700 active:scale-[0.98] disabled:bg-teal-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20'
          >
            {isSubmitting && <Loader2 size={18} className='animate-spin' />}
            {isSubmitting ? 'Logging in…' : 'Login'}
          </button>

          <div className='text-[15px] text-center text-gray-500 pb-4 sm:pb-0'>
            Don't have an account?{' '}
            <Link to={'/register'} className='font-bold text-teal-600 ml-1'>
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
