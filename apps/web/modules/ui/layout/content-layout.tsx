import { ModeToggle } from "@/components/mode-toggle"
import { SidebarTrigger } from "@workspace/ui/components/sidebar"

import { SidebarBreadcrumb } from "./sidebar-breadcrumb"
import { UserNav } from "./nav-user"

interface Props {
    children: React.ReactNode
}

export const ContentLayout = ({ children }: Props) => {
    return (
        <div className="flex-1 flex flex-col relative">
            <div className="flex items-center justify-between border-b px-2 py-1 h-16 bg-[#1D1E4E] sticky top-0 right-0 z-50">
                <div className="flex items-center gap-2">
                    <SidebarTrigger />
                    <SidebarBreadcrumb />
                </div>
                <div className="flex items-center gap-x-3">
                    <ModeToggle />
                    <UserNav />
                </div>
            </div>
            <div className="flex-1 p-4">
                {children}
            </div>
        </div>
    ) 
}