import { useState } from "react";
import { sendMessage } from "../store/AuthStore/ChatSlice.js";
import { useDispatch } from "react-redux";
import LexicalEditor from "./LexicalEditor";

const MessageInput = () => {
  const dispatch = useDispatch();
  const [editorContent, setEditorContent] = useState({ plain: "", html: "" });
  const [clearSignal, setClearSignal] = useState(0); 

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!editorContent.plain.trim()) return;

    dispatch(sendMessage({ text: editorContent.html }));
    setEditorContent({ plain: "", html: "" });

    // trigger editor clear
    setClearSignal((prev) => prev + 1);
  };

  return (
    <div className="p-4 w-full">
      <form onSubmit={handleSendMessage} className="flex items-center gap-2 w-full">
        <div className="flex-1">
          <LexicalEditor
            initialValue=""
            onChange={(content) => setEditorContent(content)}
            clearSignal={clearSignal} // send signal to editor
          />
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={!editorContent.plain.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
