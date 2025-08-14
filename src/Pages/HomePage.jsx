import Sidebar from "../Components/Sidebar";
import NoChatSelected from "../Components/NoChatSelected";
import ChatContainer from "../Components/ChatContainer";
import { useSelector } from "react-redux";
import Navbar from "../Components/Navbar";

const HomePage = () => {
  const selectedUser = useSelector((state) => state.chat.selectedUser);

  return (
    <div className="h-screen bg-base-200">
      <Navbar/>
      <div className="flex items-center justify-center pt-20 ">
        <div className="bg-base-100 rounded-lg shadow-cl w-full p-5 h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />

            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;