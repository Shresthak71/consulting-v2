"use client"

import { useState, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getUserNotifications, markAsRead } from "../features/notification/notificationSlice"
import { Bell } from "lucide-react"

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const dispatch = useDispatch()
  const { notifications, unreadCount, isLoading } = useSelector((state) => state.notification)

  useEffect(() => {
    dispatch(getUserNotifications())

    // Set up polling for notifications
    const interval = setInterval(() => {
      dispatch(getUserNotifications())
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [dispatch])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleMarkAsRead = (notificationId) => {
    dispatch(markAsRead(notificationId))
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-indigo-600 focus:outline-none"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20">
          <div className="py-2 px-3 bg-indigo-600 text-white font-semibold flex justify-between items-center">
            <span>Notifications</span>
            <span className="text-xs bg-white text-indigo-600 px-2 py-1 rounded-full">{unreadCount} unread</span>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-4 px-3 text-gray-500 text-center">No notifications</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.notification_id}
                  className={`py-2 px-3 border-b hover:bg-gray-50 ${!notification.is_read ? "bg-blue-50" : ""}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(notification.created_at)}</p>
                    </div>
                    {!notification.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.notification_id)}
                        className="text-xs text-indigo-600 hover:text-indigo-800"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="py-2 px-3 bg-gray-100 text-center">
            <button onClick={() => setIsOpen(false)} className="text-sm text-indigo-600 hover:text-indigo-800">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationDropdown
