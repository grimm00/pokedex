import React, { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import type { LoginCredentials } from '@/types'

interface LoginFormProps {
    onSuccess?: () => void
    onSwitchToRegister?: () => void
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToRegister }) => {
    const [credentials, setCredentials] = useState<LoginCredentials>({
        username: '',
        password: ''
    })
    const [errors, setErrors] = useState<Partial<LoginCredentials>>({})

    const { login, loading, error, clearError } = useAuthStore()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        clearError()
        setErrors({})

        // Basic validation
        const newErrors: Partial<LoginCredentials> = {}
        if (!credentials.username.trim()) {
            newErrors.username = 'Username is required'
        }
        if (!credentials.password) {
            newErrors.password = 'Password is required'
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        try {
            await login(credentials)
            onSuccess?.()
        } catch (error) {
            // Error is handled by the store
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setCredentials(prev => ({ ...prev, [name]: value }))

        // Clear error when user starts typing
        if (errors[name as keyof LoginCredentials]) {
            setErrors(prev => ({ ...prev, [name]: undefined }))
        }
    }

    return (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login</h2>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                        Username or Email
                    </label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={credentials.username}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.username ? 'border-red-300' : 'border-gray-300'
                            }`}
                        placeholder="Enter username or email"
                        autoComplete="username"
                        disabled={loading}
                    />
                    {errors.username && (
                        <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={credentials.password}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.password ? 'border-red-300' : 'border-gray-300'
                            }`}
                        placeholder="Enter password"
                        autoComplete="current-password"
                        disabled={loading}
                    />
                    {errors.password && (
                        <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>

            <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <button
                        type="button"
                        onClick={onSwitchToRegister}
                        className="text-blue-500 hover:text-blue-600 font-medium"
                        disabled={loading}
                    >
                        Register here
                    </button>
                </p>
            </div>
        </div>
    )
}
