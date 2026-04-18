import { useState } from "react";
import type { RegistrationData } from "../interfaces/auth";
import { loginUser, registerUser } from "../services/authService";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FlaskConicalIcon, SproutIcon } from "lucide-react";
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";

function Register() {

  const [isResearcher, setIsResearcher] = useState(false);

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

  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });


  const navigate = useNavigate();


  const handleRegister = async(formData: FormData) => {

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
    }
    
    const res = await registerUser(regData);
    if(res) {
      const user = await loginUser({
        username: formData.email,
        password: formData.password
      });
      if(user) {
        navigate('/');
      }
      toast.success('Registered Successfully! 🌱🦋');
    }
  };

  type FormData = z.infer<typeof userSchema>;

  const { register, handleSubmit, formState:{ errors } }  = useForm<FormData>({
    resolver: zodResolver(userSchema),
  });

  return (
    <div className="min-h-screen bg-teal-50/60 flex items-center justify-center py-10">
      <div className="w-full max-w-md bg-white border border-teal-100 p-8 rounded-2xl shadow-sm space-y-6">
  
        <div className="text-center space-y-1">
            <h2 className="font-black text-teal-800 text-3xl">EcoLens</h2>
            <p className="text-gray-500 font-medium">Create your account</p>
        </div>

        <div className="flex gap-4">
          <button 
            type="button"
            className={`w-1/2 p-4 h-40 flex flex-col justify-center items-center rounded-2xl border-2 transition-all duration-200 gap-2 ${
                !isResearcher 
                ? "border-teal-500 bg-teal-50/50 text-teal-800 ring-2 ring-teal-500/20" 
                : "border-gray-200 bg-white text-gray-500 hover:border-teal-300"
            }`}
            onClick={() => setIsResearcher(false)}
          >
            <SproutIcon size={28} className={!isResearcher ? "text-teal-600" : "text-gray-400"} />
            <h2 className="font-bold text-center leading-tight">Nature Enthusiast</h2>
            <span className="font-normal text-[11px] text-center leading-tight opacity-80">
              Capture findings, explore biodiversity in your area and connect with other enthusiasts and researchers
            </span>
          </button>

          <button 
            type="button"
            className={`w-1/2 p-4 h-40 flex flex-col justify-center items-center rounded-2xl border-2 transition-all duration-200 gap-2 ${
                isResearcher 
                ? "border-teal-500 bg-teal-50/50 text-teal-800 ring-2 ring-teal-500/20" 
                : "border-gray-200 bg-white text-gray-500 hover:border-teal-300"
            }`}
            onClick={() => setIsResearcher(true)}
          >
            <FlaskConicalIcon size={28} className={isResearcher ? "text-teal-600" : "text-gray-400"} />
            <h2 className="font-bold leading-tight">Researcher</h2>
            <span className="font-normal text-[11px] text-center leading-tight opacity-80">
              Verify species data, view species distribution and statistics and organize data collection events
            </span>
          </button>
        </div>
        <form onSubmit={handleSubmit(handleRegister)} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Username"
              {...register('username')}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
            />
            {errors.username && 
            <span className="text-red-400 text-sm">{errors.username.message}</span>}
          </div>
          <div>
            <input
              type="email"
              placeholder="Email Address"
              {...register('email')}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
            />
             {errors.email &&
              <span className="text-red-400 text-sm">{errors.email.message}</span>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                  type="text"
                  placeholder="First Name"
                  {...register('firstName')}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
              />
               {errors.firstName && 
              <span className="text-red-400 text-sm">{errors.firstName.message}</span>}
            </div>
            <div>
              <input
                  type="text"
                  placeholder="Last Name"
                  {...register('lastName')}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
              />
               {errors.lastName && 
              <span className="text-red-400 text-sm">{errors.lastName.message}</span>}
            </div>
          </div>
  
          <div>
            <input
              type="text"
              placeholder="Phone Number"
              {...register('phoneNumber')}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
            />
             {errors.phoneNumber && 
            <span className="text-red-400 text-sm">{errors.phoneNumber.message}</span>}
          </div>
  
          <div>
            <input
              type="password"
              placeholder="Password"
              {...register('password')}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
            />
             {errors.password && 
            <span className="text-red-400 text-sm">{errors.password.message}</span>}
          </div>
  
          <div>
            <input
              type="password"
              placeholder="Confirm Password"
              {...register('confirmPassword')}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
            />
             {errors.confirmPassword && 
            <span className="text-red-400 text-sm">{errors.confirmPassword.message}</span>}
          </div>

          {isResearcher && (
          <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-100 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-xs font-bold text-teal-800 uppercase tracking-wider">Researcher Details</p>
            
            <div>
              <input
                type="text"
                placeholder="Institute Name (e.g. University of Jordan)"
                {...register('institute')}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200 bg-white"
              />
              {errors.institute && (
                <span className="text-red-400 text-sm mt-1 block">{errors.institute.message}</span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <label className="text-xs text-gray-500 font-medium block">Upload Credentials</label>
                <div className="group relative">
                  <span className="cursor-help rounded-full bg-teal-100 px-1.5 py-0.5 text-[10px] font-bold text-teal-700">?</span>
                  <div className="invisible group-hover:visible absolute bottom-full left-0 mb-2 w-64 rounded-lg bg-gray-800 p-2 text-[11px] leading-relaxed text-white shadow-xl z-50">
                    To verify your Researcher status, please upload a document such as a University ID, a letter of affiliation from a research center (e.g., RSCN), or a current CV highlighting your expertise in flora/fauna."
                    <div className="absolute top-full left-2 -mt-1 border-4 border-transparent border-t-gray-800"></div>
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
                <span className="text-red-400 text-sm mt-1 block">
                  {String(errors.credentials.message)}
                </span>
              )}
            </div>
          </div>
        )}
  
          <button type="submit" className="bg-teal-600 font-black text-white rounded-xl w-full py-3 mt-2 hover:bg-teal-700 active:scale-[0.98] transition-all shadow-md">
            Create Account
          </button>

          <div className="text-sm text-center text-gray-500 pt-2">
            Already have an account? <Link to={'/login'} className="font-bold text-teal-600 hover:text-teal-700">Log in</Link>
          </div>
  
        </form>
      </div>
    </div>
  );
}

export default Register;