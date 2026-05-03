import { useState } from "react";
import type { RegistrationData } from "../interfaces/auth";
import { loginUser, registerUser, saveSpecializations } from "../services/authService";
import type { Specialization } from "../services/authService";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FlaskConicalIcon, Loader2, SproutIcon } from "lucide-react";
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import SpecializationPicker from "../components/SpecializationPicker";

const inputClass = "w-full rounded-xl border border-gray-200 px-4 py-3 text-base sm:text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-50";
const errorClass = "text-red-500 text-xs font-medium mt-1.5 ml-1 block";

function Register() {
  const [isResearcher, setIsResearcher] = useState(false);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);

  const userSchema = z.object({
    username: z.string()
      .min(3, 'Username must be at least 3 characters')
      .max(50)
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),

    email: z.email(),

    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),

    phoneNumber: z.string()
      .regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number format'),

    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, "Password must have an uppercase letter")
      .regex(/[0-9]/, "Password must have a number"),

    confirmPassword: z.string(),

    institute: z.string().min(2, 'Please enter your university or organization').optional(),

    credentials: isResearcher
      ? z
        .custom<FileList>()
        .refine((files) => files?.length > 0, "File is required")
        .refine((files) => files?.[0]?.size <= 10 * 1024 * 1024, "Max size 10MB")
        .refine(
          (files) => ["image/jpeg", "image/png", "application/pdf"].includes(files?.[0]?.type),
          "Only .jpg, .png, and .pdf files are accepted"
        )
      : z.custom<FileList>().optional(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

  type FormData = z.infer<typeof userSchema>;

  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(userSchema),
  });

  const handleRegister = async (formData: FormData) => {
    try {
      const regData: RegistrationData = {
        username: formData.username,
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone_number: formData.phoneNumber,
        password1: formData.password,
        password2: formData.confirmPassword,
        institute: formData.institute,
        credentials: formData.credentials?.[0],
        role: isResearcher ? 'RESEARCHER' : 'USER',
      };

      await registerUser(regData);
      await loginUser({ username: formData.email, password: formData.password });

      if (isResearcher && specializations.length > 0) {
        try { await saveSpecializations(specializations); } catch { /* set later from profile */ }
      }

      toast.success('Welcome to EcoLens! 🌱');
      navigate('/');
    } catch (err: any) {
      const d = err?.response?.data;
      const firstField = d ? Object.values(d)[0] : null;
      const message =
        d?.detail ??
        d?.non_field_errors?.[0] ??
        (Array.isArray(firstField) ? firstField[0] : null) ??
        (typeof firstField === "string" ? firstField : null) ??
        "Registration failed. Please try again.";
      toast.error(String(message));
    }
  };

  return (
    <div className="min-h-dvh bg-white sm:bg-teal-50/60 flex flex-col sm:items-center sm:justify-center sm:py-10">
      <div className="w-full max-w-md flex-1 sm:flex-none sm:bg-white sm:border sm:border-teal-100 p-6 sm:p-8 sm:rounded-2xl sm:shadow-sm space-y-6">

        <header className="mt-4 sm:mt-0">
          <h2 className="font-black text-teal-800 text-3xl tracking-tight">EcoLens</h2>
          <p className="text-gray-500 mt-1">Create your account</p>
        </header>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setIsResearcher(false)}
            className={`w-1/2 p-3 sm:p-4 flex flex-col justify-center items-center rounded-2xl border-2 transition-all duration-200 gap-1.5 ${
              !isResearcher
                ? "border-teal-500 bg-teal-50/50 text-teal-800 ring-2 ring-teal-500/20"
                : "border-gray-200 bg-white text-gray-500"
            }`}
          >
            <SproutIcon size={26} className={!isResearcher ? "text-teal-600" : "text-gray-400"} />
            <span className="font-bold text-sm text-center leading-tight">Nature Enthusiast</span>
            <span className="font-normal text-[11px] text-center leading-tight opacity-70">
              Capture findings, explore biodiversity and connect with other enthusiasts and researchers
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsResearcher(true)}
            className={`w-1/2 p-3 sm:p-4 flex flex-col justify-center items-center rounded-2xl border-2 transition-all duration-200 gap-1.5 ${
              isResearcher
                ? "border-teal-500 bg-teal-50/50 text-teal-800 ring-2 ring-teal-500/20"
                : "border-gray-200 bg-white text-gray-500"
            }`}
          >
            <FlaskConicalIcon size={26} className={isResearcher ? "text-teal-600" : "text-gray-400"} />
            <span className="font-bold text-sm leading-tight">Researcher</span>
            <span className="font-normal text-[11px] text-center leading-tight opacity-70">
              Verify species data, view distribution stats and organize data collection events
            </span>
          </button>
        </div>

        <form onSubmit={handleSubmit(handleRegister)} className="space-y-3.5">
          <div>
            <input type="text" placeholder="Username" {...register('username')} className={inputClass} />
            {errors.username && <span className={errorClass}>{errors.username.message}</span>}
          </div>

          <div>
            <input type="email" placeholder="Email Address" {...register('email')} className={inputClass} />
            {errors.email && <span className={errorClass}>{errors.email.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <input type="text" placeholder="First Name" {...register('firstName')} className={inputClass} />
              {errors.firstName && <span className={errorClass}>{errors.firstName.message}</span>}
            </div>
            <div>
              <input type="text" placeholder="Last Name" {...register('lastName')} className={inputClass} />
              {errors.lastName && <span className={errorClass}>{errors.lastName.message}</span>}
            </div>
          </div>

          <div>
            <input type="text" placeholder="Phone Number" {...register('phoneNumber')} className={inputClass} />
            {errors.phoneNumber && <span className={errorClass}>{errors.phoneNumber.message}</span>}
          </div>

          <div>
            <input type="password" placeholder="Password" {...register('password')} className={inputClass} />
            {errors.password && <span className={errorClass}>{errors.password.message}</span>}
          </div>

          <div>
            <input type="password" placeholder="Confirm Password" {...register('confirmPassword')} className={inputClass} />
            {errors.confirmPassword && <span className={errorClass}>{errors.confirmPassword.message}</span>}
          </div>

          {isResearcher && (
            <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-100 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="text-xs font-bold text-teal-800 uppercase tracking-wider">Researcher Details</p>

              <div>
                <input
                  type="text"
                  placeholder="Institute Name (e.g. JUST)"
                  {...register('institute')}
                  className={inputClass + " bg-white"}
                />
                {errors.institute && <span className={errorClass}>{errors.institute.message}</span>}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-xs text-gray-500 font-medium">Upload Credentials</label>
                  <div className="group relative">
                    <span className="cursor-help rounded-full bg-teal-100 px-1.5 py-0.5 text-[10px] font-bold text-teal-700">?</span>
                    <div className="invisible group-hover:visible absolute bottom-full left-0 mb-2 w-64 rounded-lg bg-gray-800 p-2 text-[11px] leading-relaxed text-white shadow-xl z-50">
                      To verify your Researcher status, please upload a document such as a University ID, or a CV highlighting your flora/fauna expertise.
                      <div className="absolute top-full left-2 -mt-1 border-4 border-transparent border-t-gray-800" />
                    </div>
                  </div>
                </div>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  {...register('credentials')}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
                />
                {errors.credentials && (
                  <span className={errorClass}>{String(errors.credentials.message)}</span>
                )}
              </div>

              <SpecializationPicker value={specializations} onChange={setSpecializations} />
            </div>
          )}

          <div className="pt-2 space-y-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-teal-600 px-4 py-3.5 text-base font-bold text-white transition hover:bg-teal-700 active:scale-[0.98] disabled:bg-teal-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20"
            >
              {isSubmitting && <Loader2 size={18} className="animate-spin" />}
              {isSubmitting ? "Creating account…" : "Create Account"}
            </button>

            <p className="text-[15px] text-center text-gray-500 pb-6 sm:pb-0">
              Already have an account?{" "}
              <Link to="/login" className="font-bold text-teal-600 ml-1">Log in</Link>
            </p>
          </div>
        </form>

      </div>
    </div>
  );
}

export default Register;
