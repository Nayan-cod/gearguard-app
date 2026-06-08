'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      // FIX: Changed localhost -> 127.0.0.1
      const res = await fetch('http://127.0.0.1:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.detail || "Login failed") 
      } else {
        localStorage.setItem('token', data.access_token)
        router.push('/')
      }
    } catch (err) {
      console.error("Login Error:", err)
      setError("Cannot connect to server. Is backend running?")
    }
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Login Page</h2>
        
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm text-center border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email id</label>
            <input 
              type="email" 
              required
              className="w-full border-b-2 border-gray-300 focus:border-blue-500 outline-none py-2 transition"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full border-b-2 border-gray-300 focus:border-blue-500 outline-none py-2 transition"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button className="w-full bg-white border-2 border-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition">
            Sign in
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-blue-500 cursor-pointer">Forget Password ?</span>
          <span className="mx-2 text-gray-300">|</span>
          <Link href="/signup" className="text-blue-500 font-semibold">Sign Up</Link>
        </div>
      </div>
    </div>
  )
}