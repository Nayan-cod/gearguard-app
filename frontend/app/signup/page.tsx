'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link' // FIX: Missing import added

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', re_password: '' 
  })
  const [error, setError] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (formData.password !== formData.re_password) {
      setError([{ msg: "Passwords do not match" }])
      return
    }

    try {
      // FIX: Changed localhost -> 127.0.0.1
      const res = await fetch('http://127.0.0.1:8000/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) {
        if (Array.isArray(data.detail)) {
             setError(data.detail)
        } else {
             setError([{ msg: data.detail }])
        }
      } else {
        router.push('/login')
      }
    } catch (err) {
      console.error("Signup Error:", err)
      setError([{ msg: "Cannot connect to server. Is backend running?" }])
    }
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Sign up page</h2>
        
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm border border-red-200">
             {error.map((err: any, idx: number) => (
                 <div key={idx}>• {err.msg || err.loc?.[1] + ' invalid'}</div>
             ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input 
              type="text" required
              className="w-full border-b-2 border-gray-300 focus:border-blue-500 outline-none py-2"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email id</label>
            <input 
              type="email" required
              className="w-full border-b-2 border-gray-300 focus:border-blue-500 outline-none py-2"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" required
              className="w-full border-b-2 border-gray-300 focus:border-blue-500 outline-none py-2"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Re-Enter password</label>
            <input 
              type="password" required
              className="w-full border-b-2 border-gray-300 focus:border-blue-500 outline-none py-2"
              value={formData.re_password}
              onChange={e => setFormData({...formData, re_password: e.target.value})}
            />
          </div>

          <button className="w-full bg-white border-2 border-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition mt-4">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  )
}