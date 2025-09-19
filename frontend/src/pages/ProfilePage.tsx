import React from 'react'
import { useNavigate } from 'react-router-dom'
import { UserProfile } from '@/components/auth/UserProfile'
import { useAuthStore } from '@/store/authStore'

export const ProfilePage: React.FC = () => {
    const navigate = useNavigate()
    const { isAuthenticated } = useAuthStore()

    // Redirect if not authenticated
    React.useEffect(() => {
        if (!isAuthenticated) {
            navigate('/auth')
        }
    }, [isAuthenticated, navigate])

    if (!isAuthenticated) {
        return null // Will redirect
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        User Profile
                    </h1>
                    <p className="text-gray-600">
                        Manage your account settings
                    </p>
                </div>

                <UserProfile />
            </div>
        </div>
    )
}
