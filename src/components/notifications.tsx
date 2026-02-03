import { Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useNotifications } from '@/providers/notification-provider'

export default function Notifications({ userId }: { userId: string }) {
  const { unreadCount } = useNotifications()
  const router = useRouter()

  return (
    <div
      className="relative cursor-pointer p-2 hover:bg-slate-100 rounded-full transition-all active:scale-90 group"
      onClick={() => {
        router.push('/notifications')
      }}
    >
      <Bell size={24} className="text-slate-600 group-hover:text-blue-600 transition-colors" />

      {unreadCount > 0 && (
        <span
          className="absolute top-0 right-0 h-5 w-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm z-[100]"
          style={{ backgroundColor: '#ef4444' }}
        >
          <span
            className="text-[10px] font-black"
            style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
          >
            {unreadCount}
          </span>
        </span>
      )}
    </div>
  )
}
