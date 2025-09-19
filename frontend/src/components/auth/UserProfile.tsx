import React, { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import type { User } from '@/types'

interface UserProfileProps {
    onClose?: () => void
}

export const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
    const { user, updateProfile, loading, error, clearError } = useAuthStore()
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState<Partial<User>>({
        username: '',
        email: ''
    })

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username,
                email: user.email
            })
        }
    }, [user])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        clearError()

        try {
            await updateProfile(formData)
            setIsEditing(false)
        } catch (error) {
            // Error is handled by the store
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleCancel = () => {
        if (user) {
            setFormData({
                username: user.username,
                email: user.email
            })
        }
        setIsEditing(false)
        clearError()
    }

    if (!user) {
        return null
    }

    return (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Profile</h2>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                )}
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}

            {!isEditing ? (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Username
                        </label>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                            {user.username}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                            {user.email}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Member Since
                        </label>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                            {new Date(user.created_at).toLocaleDateString()}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Role
                        </label>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                            {user.is_admin ? 'Administrator' : 'User'}
                        </p>
                    </div>

                    <button
                        onClick={() => setIsEditing(true)}
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                        Edit Profile
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter username"
                            disabled={loading}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter email"
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="flex space-x-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={loading}
                            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    )
}
