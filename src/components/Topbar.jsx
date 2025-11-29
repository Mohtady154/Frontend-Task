import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import usrImg from '../assets/usr.png'
import { useAuth } from '../context/AuthContext'
import Modal from './Modal'

const Topbar = () => {
  const location = useLocation()
  const path = location.pathname;
  const { user, isAuthenticated, signIn, signOut } = useAuth();
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const title = {
    '/': {
      title: 'Shop',
      subtitle: 'Shop > Books',
    },

    '/stores': {
      title: 'Stores',
      subtitle: 'Admin > Stores',
    },
    '/author': {
      title: 'Authors',
      subtitle: 'Admin > Authors',
    },
    '/books': {
      title: 'Books',
      subtitle: 'Admin > Books',
    },
    '/store/:storeId': {
      title: 'Store Inventory',
      subtitle: 'Admin > Store Inventory',
    },
    '/browsebooks': {
      title: 'Browse Books',
      subtitle: 'Shop > Books',
    },
    '/browseauthors': {
      title: 'Browse Authors',
      subtitle: 'Shop > Authors',
    },
  }

  const handleSignIn = async () => {
    setError('');
    const result = await signIn(username, password);
    if (result.success) {
      setShowSignInModal(false);
      setUsername('');
      setPassword('');
    } else {
      setError(result.error);
    }
  };

  const handleSignOut = () => {
    signOut();
  };

  const handleCloseModal = () => {
    setShowSignInModal(false);
    setUsername('');
    setPassword('');
    setError('');
  };

  return (
    <>
      <div className='h-24 border-b border-b-secondary-text flex justify-between items-center'>
        <div className='flex flex-col justify-start items-start '>
          <p className='text-lg text-secondary-text'>{title[path]?.title}</p>
          <p className='font-light text-secondary-text'>{title[path]?.subtitle}</p>
        </div>
        <div className='flex-1 flex justify-end items-center gap-3'>
          {isAuthenticated ? (
            <>
              <img src={usrImg} alt="profile" className='rounded w-10 h-10' />
              <p className='text-secondary-text font-light'>{user?.name}</p>
              <button
                onClick={handleSignOut}
                className='bg-red-500 hover:bg-red-600 text-white rounded px-4 py-2 ml-2 me-4'
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowSignInModal(true)}
              className='bg-main hover:bg-main/90 text-white rounded px-4 py-2 transition-colors me-4'
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      <Modal
        show={showSignInModal}
        setShow={setShowSignInModal}
        title="Sign In"
        save={handleSignIn}
        cancel={handleCloseModal}
      >
        <div className="flex flex-col gap-4 w-full">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="username" className="block text-gray-700 font-medium mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border border-gray-300 rounded p-2 w-full"
              placeholder="Enter username"
              autoComplete="username"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSignIn();
              }}
              className="border border-gray-300 rounded p-2 w-full"
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </div>
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
            <p className="font-medium mb-1">Demo Credentials:</p>
            <p>Username: <span className="font-mono">admin</span> | Password: <span className="font-mono">password</span></p>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default Topbar