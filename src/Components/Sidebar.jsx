import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUsers, setSelectedUser } from "../store/AuthStore/ChatSlice.js"

const Sidebar = () => {
  const dispatch = useDispatch();

  const {
    users,
    selectedUser,
    isUsersLoading,
  } = useSelector((state) => state.chat);


  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);


//   if (isUsersLoading) return (
//     <div>loading...</div>
//   );

  return (
    <aside className="h-full w-10 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {users.map((user) => (
          <button
            key={user._id}
            onClick={() => dispatch(setSelectedUser(user))}
            className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors
              ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}`}
          >
            {/* <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.fullName}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
              )}
            </div> */}

            {/* User info - only visible on larger screens */}
            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium truncate">{user.fullName}</div>
              
            </div>
          </button>
        ))}

        {users.length === 0 && (
          <div className="text-center text-zinc-500 ">No users available</div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
