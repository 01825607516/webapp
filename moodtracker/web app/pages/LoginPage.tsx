 import React, { useState } from 'react';
import { apiLogin, apiRegister } from "../services/api";

interface LoginPageProps {
  onLogin: (token: string, user: any) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isLoginView) {
        // 🔐 LOGIN
        const data = await apiLogin(email, password);

        // ✅ SAVE FOR WHOLE APP
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user.id);

        onLogin(data.token, data.user);
        setError("");
      } else {
        // 🆕 REGISTER
        await apiRegister(name, email, password);
        alert("Account created! Please login.");
        setIsLoginView(true);
        setError("");
      }
    } catch (err) {
      setError(isLoginView
        ? "Invalid email or password"
        : "Registration failed"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-4">

          {!isLoginView && (
            <input
              type="text"
              placeholder="Your Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg"
            />
          )}

          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-primary text-white py-3 rounded-lg"
          >
            {isLoginView ? "Login" : "Create Account"}
          </button>
        </form>

        <button
          className="mt-4 text-blue-600 underline"
          onClick={() => {
            setIsLoginView(!isLoginView);
            setError("");
          }}
        >
          {isLoginView ? "Create new account" : "Already have an account?"}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
