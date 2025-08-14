import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signup } from "../store/AuthStore/AuthSlice";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../Components/Navbar";

const SignUpPage = () => {
  const dispatch = useDispatch();
  const isSigningUp = useSelector((state) => state.auth.isSigningUp);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      dispatch(signup(formData));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-base-200">
      <Navbar/>
      <div className="w-full max-w-md bg-base-100 p-8 rounded-xl shadow-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-base-content/60">Get started with your free account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Full Name</span>
            </label>
            <input
              type="text"
              className="input w-full"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Email</span>
            </label>
            <input
              type="email"
              className="input w-full"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-control mb-7">
            <label className="label">
              <span className="label-text font-medium">Password</span>
            </label>
            <input
              type="password"
              className="input w-full"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="w-full mb-7 bg-blue-800 p-10 h-10 cursor-pointer  border rounded-md"
            disabled={isSigningUp}
          >
            {isSigningUp ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="text-center mt-4 p-10">
          <p className="text-base-content/60">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
