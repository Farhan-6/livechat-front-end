import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/AuthStore/AuthSlice.js";

const Navbar = () => {
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.auth.authUser);

  const handleLogout = () => {
    dispatch(logout());
    // dispatch(disconnectSocket());
  };

  return (
    <header className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 mb-6">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80">
          <span className="text-lg font-bold">Live Chat</span>
        </Link>

        {authUser && (
          <button
            onClick={handleLogout}
            className="btn btn-ghost btn-sm cursor-pointer"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
