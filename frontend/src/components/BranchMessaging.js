"use client"

import { useState, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { connectSocket, sendMessage, joinBranch } from "../features/message/messageSlice"

const BranchMessaging = () => {
  const [message, setMessage] = useState("")
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { messages, isConnected, currentBranchId } = useSelector((state) => state.message)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    // Connect to socket when component mounts
    if (!isConnected) {
      dispatch(connectSocket())
    }

    // Join branch room if user has a branch
    if (isConnected && user && user.branchId && (!currentBranchId || currentBranchId !== user.branchId)) {
      dispatch(joinBranch(user.branchId))
    }
  }, [dispatch, isConnected, user, currentBranchId])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (message.trim() === "") return

    dispatch(
      sendMessage({
        content: message,
        branchId: user.branchId,
      }),
    )

    setMessage("")
  }

  if (!user || !user.branchId) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-500">Branch messaging is only available for branch staff.</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Branch Communication</h2>

      <div className="border rounded-lg h-80 overflow-y-auto mb-4 p-4">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center">No messages yet.</p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-2 p-2 rounded-lg ${
                msg.senderId === user.id ? "bg-indigo-100 ml-auto" : "bg-gray-100"
              } max-w-xs`}
            >
              <p className="text-xs font-semibold">{msg.sender}</p>
              <p className="text-sm">{msg.content}</p>
              <p className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleTimeString()}</p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Send
        </button>
      </form>
    </div>
  )
}

export default BranchMessaging
