import React, { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import type { RegisterCredentials } from '@/types'

interface RegisterFormProps {
    onSuccess?: () => void
    onSwitchToLogin?: () => void
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchToLogin }) => {
    const [credentials, setCredentials] = useState<RegisterCredentials>({
        username: '',
        email: '',
        password: ''
    })
    const [confirmPassword, setConfirmPassword] = useState('')
    const [errors, setErrors] = useState<Partial<RegisterCredentials & { confirmPassword: string }>>({})

    const { register, loading, error, clearError } = useAuthStore()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        clearError()
        setErrors({})

        // Basic validation
        const newErrors: Partial<RegisterCredentials & { confirmPassword: string }> = {}

        if (!credentials.username.trim()) {
            newErrors.username = 'Username is required'
        } else if (credentials.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters'
        }

        if (!credentials.email.trim()) {
            newErrors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
            newErrors.email = 'Please enter a valid email address'
        }

        if (!credentials.password) {
            newErrors.password = 'Password is required'
        } else if (credentials.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters'
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password'
        } else if (credentials.password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        try {
            await register(credentials)
            onSuccess?.()
        } catch (error) {
            // Error is handled by the store
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        if (name === 'confirmPassword') {
            setConfirmPassword(value)
        } else {
            setCredentials(prev => ({ ...prev, [name]: value }))
        }

        // Clear error when user starts typing
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }))
        }
    }

    return (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Register</h2>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={credentials.username}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.username ? 'border-red-300' : 'border-gray-300'
                            }`}
                        placeholder="Choose a username"
                        autoComplete="username"
                        disabled={loading}
                    />
                    {errors.username && (
                        <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={credentials.email}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-300' : 'border-gray-300'
                            }`}
                        placeholder="Enter your email"
                        autoComplete="email"
                        disabled={loading}
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
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
                        placeholder="Create a password"
                        autoComplete="new-password"
                        disabled={loading}
                    />
                    {errors.password && (
                        <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                            }`}
                        placeholder="Confirm your password"
                        autoComplete="new-password"
                        disabled={loading}
                    />
                    {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? 'Creating Account...' : 'Register'}
                </button>
            </form>

            <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="text-blue-500 hover:text-blue-600 font-medium"
                        disabled={loading}
                    >
                        Login here
                    </button>
                </p>
            </div>
        </div>
    )
}
