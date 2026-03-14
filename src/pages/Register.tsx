import { useState } from "react";

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
    credentials: null
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;

    if (name === "credentials") {
      setFormData({ ...formData, credentials: files ? files[0] : null });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    console.log("User Data:", formData);
    alert("Registered successfully");
  };

  return (

    <div>

      <h2>Create Account</h2>

      <form onSubmit={handleRegister}>

        <input
          type="text"
          name="username"
          placeholder="Username"
          onChange={handleChange}
        />

        <br />

        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
        />

        <br />

        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          onChange={handleChange}
        />

        <br />

        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          onChange={handleChange}
        />

        <br />

        <input
          type="text"
          name="phoneNumber"
          placeholder="Phone Number"
          onChange={handleChange}
        />

        <br />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
        />

        <br />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          onChange={handleChange}
        />

        <br />

        <label>
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
            />

            <br />

            <input
              type="file"
              name="credentials"
              onChange={handleChange}
            />

            <br />
          </>
        )}

        <button type="submit">
          Register
        </button>

      </form>

    </div>
  );
}

export default Register;