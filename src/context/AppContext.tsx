import { createContext, useContext, useState, ReactNode } from 'react'
import { User } from 'firebase/auth'
import { AppView, UserState } from '@types'

interface AppContextType {
    // UI State
    currentView: AppView
    setCurrentView: (view: AppView) => void
    isMobileMenuOpen: boolean
    toggleMobileMenu: () => void

    // User State
    user: User | null
    setUser: (user: User | null) => void
    userState: UserState
    setUserState: (state: UserState) => void

    // Loading
    loading: boolean
    setLoading: (loading: boolean) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
    const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [user, setUser] = useState<User | null>(null)
    const [userState, setUserState] = useState<UserState>({
        isSubscribed: false,
        credits: 0,
    })
    const [loading, setLoading] = useState(true)

    const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev)

    return (
        <AppContext.Provider
            value={{
                currentView,
                setCurrentView,
                isMobileMenuOpen,
                toggleMobileMenu,
                user,
                setUser,
                userState,
                setUserState,
                loading,
                setLoading,
            }}
        >
            {children}
        </AppContext.Provider>
    )
}

export function useApp() {
    const context = useContext(AppContext)
    if (!context) {
        throw new Error('useApp must be used within AppProvider')
    }
    return context
}
