'use client'
import { useState } from 'react'
import { Bell, Moon, Lock, Globe, Save } from 'lucide-react'

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        emailNotifications: true,
        pushNotifications: false,
        darkMode: false,
        twoFactor: true,
        language: 'en'
    })

    const handleToggle = (key: string) => {
        setSettings({ ...settings, [key]: !settings[key as keyof typeof settings] })
    }

    return (
        <div className="max-w-3xl mx-auto mt-10">
            <h1 className="text-2xl font-bold mb-8">Account Settings</h1>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
                
                {/* Notifications */}
                <div className="p-6">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                        <Bell size={20} className="text-blue-500" /> Notifications
                    </h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-medium text-gray-700">Email Notifications</p>
                                <p className="text-sm text-gray-500">Receive updates about your equipment requests.</p>
                            </div>
                            <button 
                                onClick={() => handleToggle('emailNotifications')}
                                className={`w-12 h-6 rounded-full transition relative ${settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'}`}
                            >
                                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition transform ${settings.emailNotifications ? 'translate-x-6' : ''}`} />
                            </button>
                        </div>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-medium text-gray-700">Push Notifications</p>
                                <p className="text-sm text-gray-500">Receive real-time alerts on your device.</p>
                            </div>
                            <button 
                                onClick={() => handleToggle('pushNotifications')}
                                className={`w-12 h-6 rounded-full transition relative ${settings.pushNotifications ? 'bg-blue-600' : 'bg-gray-200'}`}
                            >
                                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition transform ${settings.pushNotifications ? 'translate-x-6' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Appearance */}
                <div className="p-6">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                        <Moon size={20} className="text-purple-500" /> Appearance
                    </h2>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-medium text-gray-700">Dark Mode</p>
                            <p className="text-sm text-gray-500">Switch to a dark theme for low-light environments.</p>
                        </div>
                        <button 
                            onClick={() => handleToggle('darkMode')}
                            className={`w-12 h-6 rounded-full transition relative ${settings.darkMode ? 'bg-blue-600' : 'bg-gray-200'}`}
                        >
                            <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition transform ${settings.darkMode ? 'translate-x-6' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Security */}
                <div className="p-6">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                        <Lock size={20} className="text-emerald-500" /> Security
                    </h2>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-medium text-gray-700">Two-Factor Authentication</p>
                            <p className="text-sm text-gray-500">Add an extra layer of security to your account.</p>
                        </div>
                        <button 
                            onClick={() => handleToggle('twoFactor')}
                            className={`w-12 h-6 rounded-full transition relative ${settings.twoFactor ? 'bg-blue-600' : 'bg-gray-200'}`}
                        >
                            <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition transform ${settings.twoFactor ? 'translate-x-6' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Localization */}
                <div className="p-6">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                        <Globe size={20} className="text-orange-500" /> Language & Region
                    </h2>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">System Language</label>
                        <select 
                            className="w-full md:w-64 border border-gray-300 rounded-lg p-2.5 text-sm"
                            value={settings.language}
                            onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                        >
                            <option value="en">English (United States)</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                        </select>
                     </div>
                </div>

                <div className="p-6 bg-gray-50 flex justify-end">
                    <button 
                        onClick={() => {
                            localStorage.setItem('userSettings', JSON.stringify(settings))
                            // Simple Dark Mode Toggle for Demo
                            if (settings.darkMode) {
                                document.documentElement.classList.add('dark')
                            } else {
                                document.documentElement.classList.remove('dark')
                            }
                            alert("Settings saved successfully!")
                        }}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2 text-sm shadow-sm"
                    >
                        <Save size={16} /> Save Changes
                    </button>
                </div>

            </div>
        </div>
    )
}
