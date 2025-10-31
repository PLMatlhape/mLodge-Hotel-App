import React, { useState } from 'react'
import background from '../assets/image/background/login-background.jpeg'
import centerImage from '../assets/image/background/Offers-section.jpeg'
import backIcon from '../assets/icons/white/white-back-button-icon.png'
import logo from '../assets/image/Erxtras/Logo-mLodge-hotel.png'

const Register: React.FC = () => {
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Basic validation
    if (!firstname || !lastname || !email || !phone || !password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // On successful registration - redirect to dashboard (match Login behaviour)
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img src={background} alt="Register Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#001F4D]/80"></div>
      </div>

      {/* Back to Home Button */}
      <a href="/" className="absolute top-8 right-8 z-20 flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
        <img src={backIcon} alt="Back" className="w-6 h-6" />
        <span className="text-lg font-medium">Home</span>
      </a>

      {/* Logo */}
      <div className="absolute top-8 left-8 z-20 flex items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-[#001C43] flex items-center justify-center">
          <img src={logo} alt="mLodge Hotel Logo" className="w-10 h-10 object-contain" />
        </div>
        <h1 className="text-white text-2xl font-bold">mLodge Hotel</h1>
      </div>

      {/* Register Container */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 bg-white rounded-3xl overflow-hidden shadow-2xl">
          {/* Left Side - Image */}
          <div className="hidden lg:block relative h-[500px]">
            <img src={centerImage} alt="Hotel Interior" className="w-full h-full object-cover" />
          </div>

          {/* Right Side - Register Form */}
          <div className="bg-[#001F4D] p-4 lg:p-6 flex flex-col justify-center lg:h-[500px]">
            <h2 className="text-white text-2xl font-bold mb-3 text-center">Register</h2>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Firstname</label>
                  <input
                    value={firstname}
                    onChange={(e) => { setFirstname(e.target.value); setError(null); }}
                    placeholder="Enter Your firstname"
                    className="w-full px-3 py-2 rounded bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F51AF]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Lastname</label>
                  <input
                    value={lastname}
                    onChange={(e) => { setLastname(e.target.value); setError(null); }}
                    placeholder="Enter Your lastname"
                    className="w-full px-3 py-2 rounded bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F51AF]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  placeholder="Enter Email"
                  className="w-full px-3 py-2 rounded bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F51AF]"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Phone Number</label>
                <input
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setError(null); }}
                  placeholder="Enter Phone Number"
                  className="w-full px-3 py-2 rounded bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F51AF]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(null); }}
                    placeholder="Enter New Password"
                    className="w-full px-3 py-2 rounded bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F51AF]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
                    placeholder="Confirm Password"
                    className="w-full px-3 py-2 rounded bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F51AF]"
                    required
                  />
                </div>
              </div>

              {error && <p className="text-red-300 text-sm">{error}</p>}

              <button type="submit" className="w-full bg-[#0F51AF] text-white py-2 rounded font-semibold text-base hover:bg-[#0d4291] transition-colors">Register</button>

              

              
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
