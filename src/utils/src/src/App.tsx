import { useState } from "react";
import "./index.css";

export default function Login() {
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(email==="test@test.com" && password==="123456"){
      alert("Login Success");
    }else{
      alert("Wrong email or password");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>EcoLens Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
          />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}
