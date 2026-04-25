import { useState, useEffect } from "react";
import type { RegistrationData } from "../interfaces/auth";
import { loginUser, registerUser, saveSpecializations } from "../services/authService";
import type { Specialization } from "../services/authService";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FlaskConicalIcon, SproutIcon, X, Plus } from "lucide-react";
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import Select from "react-select";
import { api } from "../lib/axiosConfig";


const LEVELS = [
  { value: "CLASS",   label: "Class"   },
  { value: "ORDER",   label: "Order"   },
  { value: "FAMILY",  label: "Family"  },
  { value: "GENUS",   label: "Genus"   },
  { value: "SPECIES", label: "Species" },
];

const STATIC_LEVELS = new Set(["CLASS", "ORDER", "FAMILY"]);
const CLASS_OPTIONS = [
  { value: "Insecta",  label: "Insecta (Insects)" },
  { value: "Plantae",  label: "Plantae (Plants)"  },
];


function SpecializationPicker({
  value,
  onChange,
}: {
  value: Specialization[];
  onChange: (v: Specialization[]) => void;
}) {
  const [selectedLevel, setSelectedLevel] = useState<string>("FAMILY");
  const [nameOptions, setNameOptions] = useState<{ value: string; label: string }[]>([]);
  const [nameInput, setNameInput] = useState("");
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [selectedName, setSelectedName] = useState<{ value: string; label: string } | null>(null);

  useEffect(() => {
    if (selectedLevel === "CLASS") {
      setNameOptions(CLASS_OPTIONS);
      return;
    }
    if (!STATIC_LEVELS.has(selectedLevel)) {
      setNameOptions([]);
      return;
    }
    setLoadingOptions(true);
    api.get(`/species/taxonomy-options/?level=${selectedLevel.toLowerCase()}`)
      .then(res => {
        setNameOptions((res.data as string[])
          .filter(Boolean)
          .map(v => ({ value: v, label: v }))
        );
      })
      .finally(() => setLoadingOptions(false));
  }, [selectedLevel]);

  useEffect(() => {
    if (STATIC_LEVELS.has(selectedLevel) || selectedLevel === "CLASS") return;
    if (nameInput.length < 2) { setNameOptions([]); return; }
    const t = setTimeout(() => {
      setLoadingOptions(true);
      api.get(`/species/taxonomy-options/?level=${selectedLevel.toLowerCase()}&q=${nameInput}`)
        .then(res => {
          setNameOptions((res.data as string[])
            .filter(Boolean)
            .map(v => ({ value: v, label: v }))
          );
        })
        .finally(() => setLoadingOptions(false));
    }, 300);
    return () => clearTimeout(t);
  }, [nameInput, selectedLevel]);

  const addSpecialization = () => {
    if (!selectedName) return;
    const next: Specialization = { level: selectedLevel, name: selectedName.value };
    const alreadyExists = value.some(s => s.level === next.level && s.name === next.name);
    if (!alreadyExists) onChange([...value, next]);
    setSelectedName(null);
    setNameInput("");
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-bold text-teal-800 uppercase tracking-wider">
        Research Specializations <span className="font-normal text-gray-400 normal-case tracking-normal">(optional)</span>
      </p>

      <div className="flex gap-2">
        <select
          value={selectedLevel}
          onChange={e => { setSelectedLevel(e.target.value); setSelectedName(null); setNameInput(""); }}
          className="rounded-xl border border-gray-300 px-3 py-2.5 text-sm bg-white outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 shrink-0"
        >
          {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>

        <div className="flex-1">
          <Select
            key={selectedLevel}
            options={nameOptions}
            value={selectedName}
            onChange={opt => setSelectedName(opt)}
            isLoading={loadingOptions}
            inputValue={STATIC_LEVELS.has(selectedLevel) || selectedLevel === "CLASS" ? undefined : nameInput}
            onInputChange={STATIC_LEVELS.has(selectedLevel) || selectedLevel === "CLASS" ? undefined : v => setNameInput(v)}
            placeholder={
              selectedLevel === "CLASS" ? "Select class..." :
              STATIC_LEVELS.has(selectedLevel) ? `Select ${selectedLevel.toLowerCase()}...` :
              `Type to search ${selectedLevel.toLowerCase()}...`
            }
            noOptionsMessage={() =>
              !STATIC_LEVELS.has(selectedLevel) && selectedLevel !== "CLASS" && nameInput.length < 2
                ? "Type at least 2 characters"
                : "No results"
            }
            menuPortalTarget={document.body}
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 999 }),
              control: (base) => ({
                ...base,
                borderColor: '#d1d5db',
                borderRadius: '0.75rem',
                padding: '1px',
                boxShadow: 'none',
                '&:hover': { borderColor: '#0d9488' },
              }),
            }}
            classNamePrefix="spec"
          />
        </div>

        <button
          type="button"
          onClick={addSpecialization}
          disabled={!selectedName}
          className="shrink-0 bg-teal-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-xl px-3 py-2.5 flex items-center gap-1 text-sm font-bold transition-colors hover:bg-teal-700"
        >
          <Plus size={15} />
        </button>
      </div>


      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {value.map((s, i) => (
            <span
              key={i}
              className="flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold px-3 py-1.5 rounded-full"
            >
              <span className="text-teal-400 font-bold">{s.level[0] + s.level.slice(1).toLowerCase()}</span>
              <span>{s.name}</span>
              <button
                type="button"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                className="text-teal-400 hover:text-teal-700 transition-colors"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}


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

  })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    });

  const navigate = useNavigate();

  const handleRegister = async (formData: FormData) => {

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
    if (res) {
      const user = await loginUser({
        username: formData.email,
        password: formData.password
      });
      if (user) {
        if (isResearcher && specializations.length > 0) {
          try {
            await saveSpecializations(specializations);
          } catch {
            //they can set specializations later from their profile
          }
        }
        navigate('/');
      }
      toast.success('Registered Successfully! 🌱🦋');
    }
  };

  type FormData = z.infer<typeof userSchema>;

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
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
            className={`w-1/2 p-4 h-40 flex flex-col justify-center items-center rounded-2xl border-2 transition-all duration-200 gap-2 ${!isResearcher
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
            className={`w-1/2 p-4 h-40 flex flex-col justify-center items-center rounded-2xl border-2 transition-all duration-200 gap-2 ${isResearcher
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
                      To verify your Researcher status, please upload a document such as a University ID, a letter of affiliation from a research center (e.g., RSCN), or a current CV highlighting your expertise in flora/fauna.
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

              <SpecializationPicker value={specializations} onChange={setSpecializations} />
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
