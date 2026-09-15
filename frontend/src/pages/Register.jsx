import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
  // 1. Memory for the form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate(); // The router's teleport tool

  // 2. The Submit Logic
  const handleSubmit = (e) => {
    e.preventDefault(); // Stop the browser from refreshing the page
    setError('');

    // Pack the data, hardcoding the admin role behind the scenes
    const userData = {
      name: name,
      email: email,
      password: password,
      role: 'admin'
    };

    // Send the data to your Express backend
    axios.post('http://localhost:3000/api/auth/register', userData)
      .then(response => {
        // Grab the JWT token and save it to the browser's hard drive
        const token = response.data.token;
        localStorage.setItem('token', token);

        // Teleport the user to the Live Orders dashboard
        navigate('/');
      })
      .catch(err => {
        // If Express sends back an error (like "Email taken"), show it
        setError(err.response?.data?.message || "Registration failed");
      });
  };

  // 3. The UI (Tailwind full-screen centered card)
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-gray-200">

        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          System Setup: Create Admin
        </h2>

        {/* Error Message Box */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Abdellah Syani"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@quickbite.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 mt-4 transition-colors"
          >
            Create Admin Account
          </button>

        </form>
      </div>
    </div>
  );
}
