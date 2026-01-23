"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/Icons";
import "./login.css"; // Import the new CSS file

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="w-full max-w-sm flex flex-col gap-5 p-8">
        <h2 className="text-3xl font-bold mb-1 text-center md:text-left my-10">
          Welcome!
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-danger/10 text-danger text-sm font-medium">
              <span className="w-5 h-5">{Icons.alertCircle}</span>
              <span>{error}</span>
            </div>
          )}

          <div className="input-wrapper">
            <span className="input-icon">{Icons.user}</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
              autoFocus
              className="input-field"
            />
          </div>

          <div className="input-wrapper">
            <span className="input-icon">{Icons.lock}</span>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="input-field"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? Icons.eyeOff : Icons.eye}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full !mt-6 h-13"
          >
            {loading ? <span className="spinner" /> : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
