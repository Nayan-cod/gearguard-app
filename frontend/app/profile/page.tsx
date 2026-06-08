'use client'
import { useState, useEffect } from 'react'
import { User, Mail, Shield, Camera } from 'lucide-react'

export default function ProfilePage() {
    const [user, setUser] = useState<{name: string, email: string, role: string, image_url?: string | null}>({ name: '', email: '', role: 'Admin', image_url: null })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) return

        fetch('http://localhost:8000/api/users/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            setUser({ ...data, role: 'Facility Manager' }) // Role is hardcoded for now as it's not in DB
            setLoading(false)
        })
    }, [])

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editForm, setEditForm] = useState({ name: '', email: '' })

    // Open modal with current user data
    const openEditModal = () => {
        setEditForm({ name: user.name, email: user.email })
        setIsEditModalOpen(true)
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('http://localhost:8000/api/users/me', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(editForm)
            })
            
            if (res.ok) {
                const updatedUser = await res.json()
                setUser(prev => ({ ...prev, ...updatedUser }))
                setIsEditModalOpen(false)
                // Optional: Show toast
                alert("Profile updated successfully!")
            } else {
                alert("Failed to update profile.")
            }
        } catch (error) {
            console.error("Update failed", error)
        }
    }

    if (loading) return <div className="p-12 text-center text-gray-500">Loading Profile...</div>

    return (
        <div className="max-w-2xl mx-auto mt-10">
            <h1 className="text-2xl font-bold mb-8">My Profile</h1>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header / Banner */}
                <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                
                <div className="px-8 pb-8">
                    <div className="relative flex justify-between items-end -mt-12 mb-6">
                        <div className="relative">
                            {user.image_url ? (
                                <img 
                                    src={user.image_url} 
                                    className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-indigo-100 flex items-center justify-center text-4xl font-bold text-indigo-600">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <button className="absolute bottom-0 right-0 bg-gray-900 text-white p-1.5 rounded-full hover:bg-gray-700 transition border-2 border-white">
                                <Camera size={14} />
                            </button>
                        </div>
                        <button 
                            onClick={openEditModal}
                            className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 transition"
                        >
                            Edit Profile
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                            <p className="text-gray-500">{user.role}</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-4">
                                <div className="p-2 bg-white rounded-lg text-gray-400 shadow-sm"><User size={20} /></div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase">Full Name</p>
                                    <p className="font-medium text-gray-800">{user.name}</p>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-4">
                                <div className="p-2 bg-white rounded-lg text-gray-400 shadow-sm"><Mail size={20} /></div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase">Email Address</p>
                                    <p className="font-medium text-gray-800">{user.email}</p>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-4">
                                <div className="p-2 bg-white rounded-lg text-gray-400 shadow-sm"><Shield size={20} /></div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase">Account Role</p>
                                    <p className="font-medium text-gray-800">{user.role}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-900">Edit Profile</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition">
                                <span className="sr-only">Close</span>
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                                    <input 
                                        type="email" 
                                        required
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                                        value={editForm.email}
                                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                    />
                                </div>
                                <div className="pt-4">
                                    <button 
                                        type="submit" 
                                        className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 active:scale-[0.98]"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
