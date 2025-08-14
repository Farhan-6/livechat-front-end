import React from 'react'

const NoChatSelected = () => {
  return (
     <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-base-100/50">
      <div className="max-w-md text-center space-y-6">
        

        {/* Welcome Text */}
        <h2 className="text-2xl font-bold">Welcome to Live Chat!</h2>
        <p className="text-base-content/60">
          Select a contact from the sidebar to start chat
        </p>
      </div>
    </div>
  )
}

export default NoChatSelected