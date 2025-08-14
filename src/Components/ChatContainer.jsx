import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import DOMPurify from "dompurify";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import {
  getMessages,
  subscribeToMessages,
  unsubscribeFromMessages,
} from "../store/AuthStore/ChatSlice.js";
import { formatMessageTime } from "../lib/time.js";

const ChatContainer = () => {
  const dispatch = useDispatch();
  const messageEndRef = useRef(null);

  const { messages, isMessagesLoading, selectedUser } = useSelector(
    (state) => state.chat
  );
  const { authUser } = useSelector((state) => state.auth);

  const uniqueMessages = messages.filter(
    (msg, index, self) =>
      index === self.findIndex((m) => m._id === msg._id)
  );

  useEffect(() => {
    if (selectedUser?._id) {
      dispatch(getMessages(selectedUser._id));
      dispatch(subscribeToMessages());

      return () => {
        dispatch(unsubscribeFromMessages());
      };
    }
  }, [dispatch, selectedUser?._id]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [uniqueMessages]);

//   if (isMessagesLoading) {
//     return (
//       <div className="flex-1 flex flex-col overflow-auto">
//         loading...
//       </div>
//     );
//   }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {uniqueMessages.map((message) => (
          <div
            key={message._id}
            className={`chat ${
              message.senderId === authUser._id ? "chat-end" : "chat-start"
            }`}
            ref={messageEndRef}
          >
            <div
              className={`chat-bubble flex flex-col ${
                message.senderId === authUser._id
                  ? "bg-blue-600 text-white rounded-lg p-3 max-w-xs ml-auto"
                  : "bg-gray-200 text-black rounded-lg p-3 max-w-xs mr-auto"
              }`}
            >
              {message.text && (
                <div
                  className="prose max-w-full" // for nice default styles
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(message.text),
                  }}
                />
              )}
              <time className="text-xs opacity-50 mt-1 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
          </div>
        ))}
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
