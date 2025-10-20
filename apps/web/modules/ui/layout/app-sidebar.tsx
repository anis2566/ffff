"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@workspace/ui/components/sidebar";
import {
  LayoutDashboard,
  Shapes,
  School,
  BookOpen,
  UserPlus,
  Users,
  List,
  UserX,
  PlusCircle,
  Layers3,
  Warehouse,
  Calendar,
  History,
  BringToFront,
  LogIn,
  BookMarked,
  UsersRound,
  Printer,
  Files,
  NotebookPen,
  FileUser,
  DollarSign,
  HandCoins,
  House,
  Package,
  MessageSquareMore,
  Send,
  Settings,
  UserCog,
  Key,
  CalendarDays,
  Coins,
  UserRoundPen,
  TrendingUp,
  Wallet,
  ShieldEllipsis,
  ChevronRight,
  Loader,
} from "lucide-react";
import { Header } from "./header";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible";
import { cn } from "@workspace/ui/lib/utils";
import { usePermissions } from "@/hooks/use-user-permission";
import { UserPermission, UserRole } from "@/lib/get-permissions";

// Type definitions
export interface NavItem {
  title: string;
  url: string;
  icon: any;
  items: NavItem[];
  permission?: {
    module: string;
    action: string;
  };
  role?: string;
  anyPermissions?: Array<{
    module: string;
    action: string;
  }>;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
  permission?: {
    module: string;
    action: string;
  };
  role?: string;
}

// Navigation data with group labels and permission configuration
export const navigationData: NavGroup[] = [
  {
    items: [
      {
        title: "Dashboard",
        url: "/",
        icon: LayoutDashboard,
        items: [],
        permission: { module: "dashboard", action: "read" },
      },
    ],
  },
  {
    label: "Academic",
    items: [
      {
        title: "Class",
        url: "/class",
        icon: Shapes,
        items: [],
        permission: { module: "class", action: "read" },
      },
      {
        title: "Institute",
        url: "/institute",
        icon: School,
        items: [],
        permission: { module: "institute", action: "read" },
      },
      {
        title: "Subject",
        url: "/subject",
        icon: BookOpen,
        items: [],
        permission: { module: "subject", action: "read" },
      },
    ],
  },
  {
    label: "Student Management",
    items: [
      {
        title: "Admission",
        url: "/admission",
        icon: UserPlus,
        items: [],
        permission: { module: "student", action: "create" },
      },
      {
        title: "Student",
        url: "",
        icon: Users,
        permission: { module: "student", action: "read" },
        items: [
          {
            title: "List",
            url: "/student",
            icon: List,
            items: [],
            permission: { module: "student", action: "read" },
          },
          {
            title: "Absent",
            url: "/student/absent",
            icon: UserX,
            items: [],
            permission: { module: "student", action: "read" },
          },
        ],
      },
    ],
  },
  {
    label: "Attendance",
    items: [
      {
        title: "Student",
        url: "",
        icon: Users,
        permission: { module: "student_attendance", action: "read" },
        items: [
          {
            title: "Create",
            url: "/attendance/student/new",
            icon: PlusCircle,
            items: [],
            permission: { module: "student_attendance", action: "create" },
          },
          {
            title: "List",
            url: "/attendance/student",
            icon: List,
            items: [],
            permission: { module: "student_attendance", action: "read" },
          },
        ],
      },
    ],
  },
  {
    label: "Batch & Room",
    items: [
      {
        title: "Batch",
        url: "",
        icon: Layers3,
        permission: { module: "batch", action: "read" },
        items: [
          {
            title: "New",
            url: "/batch/new",
            icon: PlusCircle,
            items: [],
            permission: { module: "batch", action: "create" },
          },
          {
            title: "List",
            url: "/batch",
            icon: List,
            items: [],
            permission: { module: "batch", action: "read" },
          },
        ],
      },
      {
        title: "Room Plan",
        url: "/room-plan",
        icon: Warehouse,
        items: [],
        permission: { module: "batch", action: "room_plan" },
      },
    ],
  },
  {
    label: "Fee Management & Income",
    items: [
      {
        title: "Salary",
        url: "",
        icon: Calendar,
        permission: { module: "salary_payment", action: "read" },
        items: [
          {
            title: "Receive Fee",
            url: "/fee/salary/new",
            icon: PlusCircle,
            items: [],
            permission: { module: "salary_payment", action: "create" },
          },
          {
            title: "History",
            url: "/fee/salary",
            icon: History,
            items: [],
            permission: { module: "salary_payment", action: "read" },
          },
          {
            title: "Due",
            url: "/fee/salary/due",
            icon: List,
            items: [],
            permission: { module: "salary_payment", action: "read" },
          },
          {
            title: "Overview",
            url: "/fee/salary/overview",
            icon: BringToFront,
            items: [],
            permission: { module: "salary_payment", action: "read" },
          },
        ],
      },
      {
        title: "Admission",
        url: "",
        icon: LogIn,
        permission: { module: "admission_payment", action: "read" },
        items: [
          {
            title: "Due",
            url: "/fee/admission/due",
            icon: List,
            items: [],
            permission: { module: "admission_payment", action: "read" },
          },
          {
            title: "History",
            url: "/fee/admission",
            icon: History,
            items: [],
            permission: { module: "admission_payment", action: "read" },
          },
        ],
      },
      {
        title: "Income",
        url: "",
        icon: DollarSign,
        permission: { module: "income", action: "read" },
        items: [
          {
            title: "New",
            url: "/income/other/new",
            icon: PlusCircle,
            items: [],
            permission: { module: "income", action: "create" },
          },
          {
            title: "List",
            url: "/income/other",
            icon: List,
            items: [],
            permission: { module: "income", action: "read" },
          },
        ],
      },
    ],
  },
  {
    label: "Homework",
    items: [
      {
        title: "Homework",
        url: "",
        icon: BookMarked,
        permission: { module: "homework", action: "read" },
        items: [
          {
            title: "New",
            url: "/homework/new",
            icon: PlusCircle,
            items: [],
            permission: { module: "homework", action: "create" },
          },
          {
            title: "List",
            url: "/homework",
            icon: List,
            items: [],
            permission: { module: "homework", action: "read" },
          },
        ],
      },
    ],
  },
  {
    label: "Teacher",
    items: [
      {
        title: "Teacher",
        url: "",
        icon: UsersRound,
        permission: { module: "teacher", action: "read" },
        items: [
          {
            title: "New",
            url: "/teacher/new",
            icon: PlusCircle,
            items: [],
            permission: { module: "teacher", action: "create" },
          },
          {
            title: "List",
            url: "/teacher",
            icon: List,
            items: [],
            permission: { module: "teacher", action: "read" },
          },
        ],
      },
    ],
  },
  {
    label: "Document & Tasks",
    items: [
      {
        title: "Documents",
        url: "",
        icon: Files,
        permission: { module: "document", action: "read" },
        items: [
          {
            title: "New",
            url: "/document/new",
            icon: PlusCircle,
            items: [],
            permission: { module: "document", action: "create" },
          },
          {
            title: "List",
            url: "/document",
            icon: List,
            items: [],
            permission: { module: "document", action: "read" },
          },
        ],
      },
      {
        title: "Print",
        url: "/task/print",
        icon: Printer,
        items: [],
        permission: { module: "print_task", action: "read" },
      },
    ],
  },
  {
    label: "Exam & Results",
    items: [
      {
        title: "Exam",
        url: "",
        icon: NotebookPen,
        permission: { module: "exam", action: "read" },
        items: [
          {
            title: "New",
            url: "/exam/new",
            icon: PlusCircle,
            items: [],
            permission: { module: "exam", action: "create" },
          },
          {
            title: "List",
            url: "/exam",
            icon: List,
            items: [],
            permission: { module: "exam", action: "read" },
          },
        ],
      },
      {
        title: "Result",
        url: "",
        icon: FileUser,
        permission: { module: "result", action: "read" },
        items: [
          {
            title: "New",
            url: "/exam/result/new",
            icon: PlusCircle,
            items: [],
            permission: { module: "result", action: "create" },
          },
          {
            title: "List",
            url: "/exam/result",
            icon: List,
            items: [],
            permission: { module: "result", action: "read" },
          },
        ],
      },
      {
        title: "Category",
        url: "/exam/category",
        icon: Layers3,
        items: [],
        permission: { module: "exam_category", action: "read" },
      },
    ],
  },
  {
    label: "Expense",
    items: [
      {
        title: "Advance",
        url: "",
        icon: HandCoins,
        permission: { module: "teacher_advance", action: "read" },
        items: [
          {
            title: "New",
            url: "/expense/advance/new",
            icon: PlusCircle,
            items: [],
            permission: { module: "teacher_advance", action: "create" },
          },
          {
            title: "List",
            url: "/expense/advance",
            icon: List,
            items: [],
            permission: { module: "teacher_advance", action: "read" },
          },
        ],
      },
      {
        title: "Teacher Bill",
        url: "",
        icon: UsersRound,
        permission: { module: "teacher_payment", action: "read" },
        items: [
          {
            title: "New",
            url: "/expense/teacher/new",
            icon: PlusCircle,
            items: [],
            permission: { module: "teacher_payment", action: "create" },
          },
          {
            title: "List",
            url: "/expense/teacher",
            icon: List,
            items: [],
            permission: { module: "teacher_payment", action: "read" },
          },
        ],
      },
      {
        title: "House Rent",
        url: "",
        icon: House,
        permission: { module: "house_payment", action: "read" },
        items: [
          {
            title: "New",
            url: "/expense/house/new",
            icon: PlusCircle,
            items: [],
            permission: { module: "house_payment", action: "create" },
          },
          {
            title: "List",
            url: "/expense/house",
            icon: List,
            items: [],
            permission: { module: "house_payment", action: "read" },
          },
        ],
      },
      {
        title: "Utility Bill",
        url: "",
        icon: Package,
        permission: { module: "utility_payment", action: "read" },
        items: [
          {
            title: "New",
            url: "/expense/utility/new",
            icon: PlusCircle,
            items: [],
            permission: { module: "utility_payment", action: "create" },
          },
          {
            title: "List",
            url: "/expense/utility",
            icon: List,
            items: [],
            permission: { module: "utility_payment", action: "read" },
          },
        ],
      },
    ],
  },
  {
    label: "SMS",
    items: [
      {
        title: "SMS",
        url: "",
        icon: MessageSquareMore,
        permission: { module: "sms", action: "read" },
        items: [
          {
            title: "Bulk SMS",
            url: "/sms/new",
            icon: Send,
            items: [],
            permission: { module: "sms", action: "create" },
          },
          {
            title: "Due List SMS",
            url: "/sms/due",
            icon: Send,
            items: [],
            permission: { module: "sms", action: "create" },
          },
          {
            title: "History",
            url: "/sms",
            icon: History,
            items: [],
            permission: { module: "sms", action: "read" },
          },
          {
            title: "Settings",
            url: "/sms/setting",
            icon: Settings,
            items: [],
            permission: { module: "sms", action: "manage" },
          },
        ],
      },
    ],
  },
  {
    label: "Role & Permission",
    role: "Admin",
    items: [
      {
        title: "Role",
        url: "/role",
        icon: UserCog,
        items: [],
        // permission: { module: "sms", action: "read" },
        role: "Admin",
      },
      {
        title: "Permission",
        url: "/permission",
        icon: Key,
        items: [],
        // permission: { module: "sms", action: "read" },
        role: "Admin",
      },
    ],
  },
  {
    label: "Reports",
    permission: { module: "report", action: "read" },
    items: [
      {
        title: "Daily",
        url: "/report/daily",
        icon: CalendarDays,
        items: [],
        permission: { module: "report", action: "read" },
      },
      {
        title: "Income",
        url: "",
        icon: HandCoins,
        permission: { module: "report", action: "read" },
        items: [
          {
            title: "Salary",
            url: "/report/income/salary",
            icon: DollarSign,
            items: [],
            permission: { module: "report", action: "read" },
          },
          {
            title: "Admission",
            url: "/report/income/admission",
            icon: DollarSign,
            items: [],
            permission: { module: "report", action: "read" },
          },
          {
            title: "Other",
            url: "/report/income/other",
            icon: DollarSign,
            items: [],
            permission: { module: "report", action: "read" },
          },
          {
            title: "Overview",
            url: "/report/income",
            icon: TrendingUp,
            items: [],
            permission: { module: "report", action: "read" },
          },
        ],
      },
      {
        title: "Expense",
        url: "",
        icon: Coins,
        permission: { module: "report", action: "read" },
        items: [
          {
            title: "Teacher Bill",
            url: "/report/expense/teacher",
            icon: UserRoundPen,
            items: [],
            permission: { module: "report", action: "read" },
          },
          {
            title: "House rent",
            url: "/report/expense/house",
            icon: House,
            items: [],
            permission: { module: "report", action: "read" },
          },
          {
            title: "Utility",
            url: "/report/expense/utility",
            icon: Package,
            items: [],
            permission: { module: "report", action: "read" },
          },
          {
            title: "Overview",
            url: "/report/expense",
            icon: TrendingUp,
            items: [],
            permission: { module: "report", action: "read" },
          },
        ],
      },
      {
        title: "Final",
        url: "/report",
        icon: Wallet,
        items: [],
        permission: { module: "report", action: "read" },
      },
    ],
  },
  {
    label: "Messaging",
    items: [
      {
        title: "Chat",
        url: "/chat",
        icon: MessageSquareMore,
        // permission: { module: "house", action: "read" },
        role: "Admin",
        items: [],
      },
    ],
  },
  {
    label: "Room & Houses",
    items: [
      {
        title: "House",
        url: "",
        icon: House,
        permission: { module: "house", action: "read" },
        items: [
          {
            title: "New",
            url: "/house/new",
            icon: PlusCircle,
            items: [],
            permission: { module: "house", action: "create" },
          },
          {
            title: "List",
            url: "/house",
            icon: List,
            items: [],
            permission: { module: "house", action: "read" },
          },
        ],
      },
      {
        title: "Room",
        url: "",
        icon: Warehouse,
        permission: { module: "room", action: "read" },
        items: [
          {
            title: "New",
            url: "/room/new",
            icon: PlusCircle,
            items: [],
            permission: { module: "room", action: "create" },
          },
          {
            title: "List",
            url: "/room",
            icon: List,
            items: [],
            permission: { module: "room", action: "read" },
          },
        ],
      },
    ],
  },
  {
    label: "User Management",
    items: [
      {
        title: "Users",
        url: "/user",
        icon: UsersRound,
        permission: { module: "user", action: "read" },
        items: [],
      },
    ],
  },
  {
    label: "Utilities",
    items: [
      {
        title: "Admission Fee",
        url: "/utils/fee/admission",
        icon: LogIn,
        items: [],
        permission: { module: "admission_fee", action: "read" },
      },
      {
        title: "Salary Fee",
        url: "/utils/fee/salary",
        icon: Calendar,
        items: [],
        permission: { module: "salary_fee", action: "read" },
      },
      {
        title: "Counter",
        url: "/utils/counter",
        icon: ShieldEllipsis,
        items: [],
        permission: { module: "counter", action: "read" },
      },
    ],
  },
];

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  initialPermissions?: UserPermission[];
  initialRoles?: UserRole[];
};

export function AppSidebar({
  initialPermissions,
  initialRoles,
  ...props
}: AppSidebarProps) {
  const pathname = usePathname();

  // Pass initial data - no loading state!
  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading } =
    usePermissions({
      initialPermissions,
      initialRoles,
    });

  // returns true if the item is allowed to be shown
  const itemAllowed = (item: NavItem) => {
    // No permission metadata => public
    if (
      !item.permission &&
      !item.anyPermissions &&
      !(item as any).allPermissions
    ) {
      return true;
    }

    // Single permission: hasPermission expects (module, action)
    if (item.permission) {
      const { module, action } = item.permission;
      if (!hasPermission(module, action)) return false;
    }

    // anyPermissions: at least one must pass
    if (item.anyPermissions) {
      if (!hasAnyPermission(item.anyPermissions)) return false;
    }

    // optional allPermissions field (if you choose to use it)
    if ((item as any).allPermissions) {
      if (!hasAllPermissions((item as any).allPermissions)) return false;
    }

    return true;
  };

  // Recursive filter
  const filterNavItems = (items: NavItem[]): NavItem[] => {
    return items
      .map((item) => {
        const filteredChildren = item.items ? filterNavItems(item.items) : [];
        return {
          ...item,
          items: filteredChildren,
        };
      })
      .filter((item) => {
        // keep if any child remains visible
        if (item.items && item.items.length > 0) return true;

        // otherwise, keep only if the item itself is allowed
        return itemAllowed(item);
      });
  };

  const filteredNavigation = navigationData
    .filter((group) => {
      // groups may have permission as well
      if (group.permission) {
        const { module, action } = group.permission;
        return hasPermission(module, action);
      }
      return true;
    })
    .map((group) => ({
      ...group,
      items: filterNavItems(group.items),
    }))
    .filter((group) => group.items.length > 0);

  const renderNavItems = (items: NavItem[]) => {
    return (
      <SidebarMenu>
        {items
          .filter((item) => itemAllowed(item))
          .map((item) => {
            const isActive = pathname === item.url;
            const Icon = item.icon;

            if (!item.items || item.items.length === 0) {
              return (
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={isActive}
                  key={item.title}
                  asChild
                >
                  <Link href={item.url} prefetch>
                    {Icon && <Icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              );
            }

            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={isActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {Icon && <Icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={pathname === subItem.url}
                          >
                            <Link href={subItem.url} prefetch>
                              {subItem.icon && <subItem.icon />}
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          })}
      </SidebarMenu>
    );
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="bg-[#1D1E4E]">
        <Header />
      </SidebarHeader>
      <SidebarContent className="bg-[#1D1E4E] text-white">
        {/* This will only show if shouldFetch is true (no initial data) */}
        {isLoading && (
          <div className="flex h-full items-center justify-center">
            <Loader className="w-4 h-4 animate-spin" />
          </div>
        )}

        {/* With initial data, this renders immediately! */}
        {!isLoading &&
          filteredNavigation.map((group, idx) => (
            <SidebarGroup key={idx}>
              {group.label && (
                <SidebarGroupLabel className="text-gray-400 uppercase tracking-wide px-2 py-1 text-xs">
                  {group.label}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                {renderNavItems(group.items)}
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
