"use client"

import { useState, useRef, useEffect } from "react"
import { Bell, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [readNotifications, setReadNotifications] = useState<number[]>([])
  const [notifications] = useState<{
    id: number
    title: string
    message: string
    time: string
    type: string
  }[]>([])
  
  const popupRef = useRef<HTMLDivElement>(null)
  
  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'info':
        return 'bg-blue-100 text-blue-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'success':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Count unread notifications
  const unreadCount = notifications.filter(n => !readNotifications.includes(n.id)).length

  // Mark all as read handler
  const handleMarkAllAsRead = () => {
    setReadNotifications(notifications.map(n => n.id))
  }

  return (
    <div className="relative" ref={popupRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full transition-all hover:scale-110 p-1 sm:p-0"
        aria-label="Notifications"
      >
        <Bell className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-gray-700 ${unreadCount > 0 ? 'animate-shake' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full border border-white sm:border-2 border-white animate-pulse" />
        )}
      </button>

      {/* Notification Popup */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[min(calc(100vw-1rem),20rem)] sm:w-80 md:w-96 bg-white rounded-lg shadow-2xl border-2 border-gray-300 z-50 animate-fade-in flex flex-col max-h-[calc(100vh-8rem)] sm:max-h-96">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 sm:p-4 flex items-center justify-between flex-shrink-0 rounded-t-lg gap-2">
            <h3 className="font-semibold text-xs sm:text-sm md:text-base flex items-center gap-1.5 sm:gap-2 whitespace-nowrap flex-shrink-0">
              <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span>Notifications</span>
            </h3>
            <Badge className="bg-white/20 text-white border-white/30 text-xs sm:text-sm px-1.5 sm:px-2 py-0.5 sm:py-1 flex-shrink-0">
              {unreadCount}
            </Badge>
          </div>

          {/* Notifications List - Scrollable */}
          <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400" style={{ maxHeight: '320px' }}>
            {notifications.length > 0 ? (
              notifications.map((notification) => {
                const isRead = readNotifications.includes(notification.id)
                return (
                  <div
                    key={notification.id}
                    className={`p-3 sm:p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${isRead ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      {!isRead ? (
                        <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mt-2 flex-shrink-0 ${
                          notification.type === 'info' ? 'bg-blue-500' :
                          notification.type === 'warning' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`} />
                      ) : (
                        <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 mt-2 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start sm:items-center justify-between mb-1 gap-2 flex-col sm:flex-row">
                          <h4 className={`text-xs sm:text-sm ${isRead ? 'text-gray-500' : 'font-medium text-gray-900'} break-words`}>{notification.title}</h4>
                          <Badge className={`${getBadgeColor(notification.type)} text-[10px] sm:text-xs flex-shrink-0`}>
                            {notification.type}
                          </Badge>
                        </div>
                        <p className="text-[11px] sm:text-xs text-gray-600 mb-1 sm:mb-2 break-words">{notification.message}</p>
                        <p className="text-[10px] sm:text-xs text-gray-400">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="p-6 sm:p-8 text-center">
                <Bell className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
                <p className="text-xs sm:text-sm text-gray-500">No notifications</p>
              </div>
            )}
          </div>

          {/* Footer - Fixed at bottom */}
          {unreadCount > 0 && (
            <div className="border-t bg-gray-50 p-2 sm:p-3 flex-shrink-0 rounded-b-lg">
              <Button
                variant="ghost"
                onClick={handleMarkAllAsRead}
                className="w-full text-xs sm:text-sm text-green-600 hover:text-green-700 hover:bg-green-50 py-1.5 sm:py-2"
              >
                Mark All as Read
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

