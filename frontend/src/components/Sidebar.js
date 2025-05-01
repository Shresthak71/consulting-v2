import { Link, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"
import { Home, Users, FileText, Briefcase, Building, BarChart2, Settings, Upload, AlertTriangle } from "lucide-react"

const Sidebar = () => {
  const location = useLocation()
  const { user } = useSelector((state) => state.auth)
  const { unreadCount } = useSelector((state) => state.notification)

  // Define navigation items based on user role
  const getNavItems = () => {
    const items = [
      {
        name: "Dashboard",
        path: "/dashboard",
        icon: <Home className="w-5 h-5" />,
        roles: ["admin", "super_admin", "counselor", "branch_manager", "student"],
      },
      {
        name: "Students",
        path: "/students",
        icon: <Users className="w-5 h-5" />,
        roles: ["admin", "super_admin", "counselor", "branch_manager"],
      },
      {
        name: "Applications",
        path: "/applications",
        icon: <FileText className="w-5 h-5" />,
        roles: ["admin", "super_admin", "counselor", "branch_manager", "student"],
      },
      {
        name: "Documents",
        path: "/documents",
        icon: <Briefcase className="w-5 h-5" />,
        roles: ["admin", "super_admin", "counselor", "branch_manager", "student"],
      },
      // New item for expiring documents
      {
        name: "Expiring Documents",
        path: "/documents/expiring",
        icon: <AlertTriangle className="w-5 h-5" />,
        roles: ["admin", "super_admin", "counselor", "branch_manager"],
      },
      {
        name: "Branches",
        path: "/branches",
        icon: <Building className="w-5 h-5" />,
        roles: ["admin", "super_admin"],
      },
      {
        name: "Users",
        path: "/users",
        icon: <Users className="w-5 h-5" />,
        roles: ["admin", "super_admin", "branch_manager"],
      },
      {
        name: "Analytics",
        path: "/analytics",
        icon: <BarChart2 className="w-5 h-5" />,
        roles: ["admin", "super_admin", "branch_manager"],
      },
      // New item for bulk operations
      {
        name: "Bulk Operations",
        path: "/bulk",
        icon: <Upload className="w-5 h-5" />,
        roles: ["admin", "super_admin", "branch_manager"],
      },
      {
        name: "Settings",
        path: "/settings",
        icon: <Settings className="w-5 h-5" />,
        roles: ["admin", "super_admin"],
      },
    ]

    // Filter items based on user role
    return items.filter((item) => item.roles.includes(user.role))
  }

  const navItems = getNavItems()

  return (
    <div className="bg-indigo-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
      <div className="flex items-center space-x-2 px-4">
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          ></path>
        </svg>
        <span className="text-2xl font-extrabold">EduConsult</span>
      </div>

      <nav>
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`flex items-center space-x-2 py-2.5 px-4 rounded transition duration-200 ${
                  location.pathname === item.path ? "bg-indigo-900 text-white" : "hover:bg-indigo-700"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
                {item.name === "Notifications" && unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

export default Sidebar
