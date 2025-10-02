import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { useAuthStore } from '@/store/authStore'

export const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true)
    const navigate = useNavigate()
    const { isAuthenticated } = useAuthStore()

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/')
        }
    }, [isAuthenticated, navigate])

    const handleAuthSuccess = () => {
        navigate('/dashboard')
    }

    const switchToRegister = () => {
        setIsLogin(false)
    }

    const switchToLogin = () => {
        setIsLogin(true)
    }

    if (isAuthenticated) {
        return null // Will redirect
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome to Pokehub
                    </h1>
                    <p className="text-gray-600">
                        {isLogin ? 'Sign in to your account' : 'Create your account'}
                    </p>
                </div>

                {isLogin ? (
                    <LoginForm
                        onSuccess={handleAuthSuccess}
                        onSwitchToRegister={switchToRegister}
                    />
                ) : (
                    <RegisterForm
                        onSuccess={handleAuthSuccess}
                        onSwitchToLogin={switchToLogin}
                    />
                )}
            </div>
        </div>
    )
}
