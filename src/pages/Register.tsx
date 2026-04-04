import { useState } from "react";
import type { RegistrationData } from "../interfaces/auth";
import { loginUser, registerUser } from "../services/authService";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Register() {

  const [isResearcher, setIsResearcher] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    institute: "",
    credentials:  null as File | null
  });

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;

    if (name === "credentials") {
      setFormData({ ...formData, credentials: files ? files[0] : null });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };


  const handleRegister = async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const regData: RegistrationData = {
      username: formData.username,
      email: formData.email,
      first_name: formData.firstName,
      last_name: formData.lastName,
      phone_number: formData.phoneNumber,
      password1: formData.password,
      password2: formData.confirmPassword,
      institute: formData.institute,
      credentials: formData.credentials,
      role: isResearcher? 'RESEARCHER' : 'USER',
    }
    
    const res = await registerUser(regData);
    if(res) {
      const user = await loginUser({
        email: formData.email,
        password: formData.password
      });
      if(user) {
        navigate('/');
      }
      toast.success('Registered Successfully! 🌱🦋');
    }
  };

  return (

    <div className="min-h-screen bg-teal-50/60 flex items-center justify-center">
      <div className="w-full max-w-sm border-1 border-teal-100 p-6 rounded-xl shadow-sm space-y-4">
  
        <h2 className="font-black text-teal-700 text-2xl bg-white">EcoLens | Create Account</h2>
  
        <form onSubmit={handleRegister} className="space-y-4">
  
          <input
            type="text"
            name="username"
            placeholder="Username"
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
          />
  
          <br />
  
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
          />
  
          <br />
  
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
          />
  
          <br />
  
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
          />
  
          <br />
  
          <input
            type="text"
            name="phoneNumber"
            placeholder="Phone Number"
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
          />
  
          <br />
  
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
          />
  
          <br />
  
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
          />
  
          <br />
  
          <label className="text-gray-500 text-sm font-bold">
            <input
              type="checkbox"
              onChange={() => setIsResearcher(!isResearcher)}
            />
            Register as Researcher
          </label>
  
          <br />
  
          {isResearcher && (
            <>
              <input
                type="text"
                name="institute"
                placeholder="Institute"
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
              />
  
              <br />
  
              <input
                type="file"
                name="credentials"
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
              />
  
              <br />
            </>
          )}
  
          <button type="submit" className="bg-teal-600 font-black text-white rounded-lg w-full p-2 hover:bg-teal-700 transition-colors">
            Register
          </button>

          <div className="font-sm text-gray-500">
            Already have an account? <Link to={'/login'} className="font-bold text-teal-600">Login</Link>
          </div>
  
        </form>
      </div>
    </div>
  );
}

export default Register;