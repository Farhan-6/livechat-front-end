import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUsers, setSelectedUser } from "../store/AuthStore/ChatSlice.js"

const ChatHeader = () => {
    const dispatch = useDispatch()
    const {selectedUser} = useSelector((state) => state.chat);

    useEffect(()=>{
        dispatch(getUsers())
    },[dispatch])

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
        
          </div>
        </div>

        <button onClick={() => dispatch(setSelectedUser(null))}>
          x
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;