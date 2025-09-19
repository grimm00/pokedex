import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface ProtectedRouteProps {
    children: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const navigate = useNavigate()
    const { isAuthenticated, loading, refreshAuth } = useAuthStore()

    useEffect(() => {
        const checkAuth = async () => {
            // If we have tokens but no user data, try to refresh
            const token = localStorage.getItem('access_token')
            if (token && !isAuthenticated && !loading) {
                try {
                    await refreshAuth()
                } catch (error) {
                    // If refresh fails, redirect to login
                    navigate('/auth')
                }
            } else if (!isAuthenticated && !loading) {
                // No token and not loading, redirect to login
                navigate('/auth')
            }
        }

        checkAuth()
    }, [isAuthenticated, loading, navigate, refreshAuth])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return null // Will redirect to login
    }

    return <>{children}</>
}
