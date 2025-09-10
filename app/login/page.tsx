'use client'

import React, { useState } from 'react'
import LoginForm from '../components/LoginForm'
import RegisterForm from '../components/RegisterForm'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="w-full max-w-md rounded-xl shadow-lg p-8 mt-12 mx-auto">
      <h1 className="text-3xl font-extrabold text-indigo-700 mb-6 text-center">
      </h1>
      {isLogin ? (
        <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
      ) : (
        <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
      )}
    </div>
  )
}
