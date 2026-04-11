import { useAuth } from "../contexts/AuthContext/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    await login(data);
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-teal-50/60 flex items-center justify-center">
      <div className="w-full max-w-sm rounded-xl border border-teal-100 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-black text-teal-700">EcoLens | Login</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="you@example.com"
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 ${
                errors.email ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:border-teal-500 focus:ring-teal-200"
              }`}
            />
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              {...register("password")}
              type="password"
              placeholder="Enter your password"
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 ${
                errors.password ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:border-teal-500 focus:ring-teal-200"
              }`}
            />
            {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            Login
          </button>
          <div className="font-sm text-gray-500">
            Don't have an account? <Link to={'/register'} className="font-bold text-teal-600">Register</Link>
          </div>
          <div className="font-sm text-gray-500">
             <Link to={'/register'} className=" text-teal-600">Forgot Password?</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
