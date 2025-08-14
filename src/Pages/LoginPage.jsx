import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../store/AuthStore/AuthSlice.js";
import { Link } from "react-router-dom";
import Navbar from "../Components/Navbar.jsx";

const LoginPage = () => {
  const dispatch = useDispatch();
  const isLoggingIn = useSelector((state) => state.auth.isLoggingIn);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(formData));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Navbar/>
      <div className="w-full max-w-md bg-base-100 rounded-xl shadow-lg p-8 space-y-8">
        {/* Heading */}
        <div className="text-center">
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-base-content/60">Sign in to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Email</span>
            </label>
            <input
              type="email"
              className="input input-bordered w-full"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          {/* Password */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Password</span>
            </label>
            <input
              type="password"
              className="input input-bordered w-full"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>

          <button
            type="submit"
            className=" w-full bg-blue-800 h-10 rounded-md"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? "Loading..." : "Sign in"}
          </button>
        </form>

        {/* Link */}
        <p className="text-center text-base-content/60">
          Don't have an account?{" "}
          <Link to="/signup" className="link link-primary text-blue-500">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
