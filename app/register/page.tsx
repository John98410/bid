'use client'

import React, { useState } from 'react'
import LoginForm from '../components/LoginForm'
import RegisterForm from '../components/RegisterForm'

export default function RegisterPage() {
  const [isLogin, setIsLogin] = useState(false)

  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 mt-12 mx-auto">
        <h1 className="text-3xl font-extrabold text-indigo-700 mb-6 text-center">
          Register for Bid App
        </h1>
        {isLogin ? (
          <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  )
}
