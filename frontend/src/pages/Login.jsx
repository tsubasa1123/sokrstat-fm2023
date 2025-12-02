// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Login() {
  const [mode, setMode] = useState('login'); // 'login', 'forgot', 'reset'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const resetMessages = () => {
    setMessage('');
    setError('');
  };

  // Connexion
  const handleLogin = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_username', data.username);
        navigate('/admin');
      } else {
        setError(data.error || 'Échec de la connexion');
      }
    } catch (err) {
      setError('Erreur réseau : ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Demander code de réinitialisation
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setGeneratedCode(data.code); // En dev uniquement
        setMode('reset');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur réseau : ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Réinitialiser le mot de passe
  const handleResetPassword = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          code: resetCode,
          new_password: newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Mot de passe réinitialisé ! Vous pouvez maintenant vous connecter.');
        setTimeout(() => {
          setMode('login');
          setPassword('');
          setResetCode('');
          setNewPassword('');
          setGeneratedCode('');
        }, 2000);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur réseau : ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Logo/Titre */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
             {mode === 'login' ? 'Connexion Admin' : 'Réinitialisation'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            SokrStat - Football Manager 2023
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          
          {/* Messages */}
          {message && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm">
              {message}
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* FORMULAIRE DE CONNEXION */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom d'utilisateur
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="admin"
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50"
              >
                {loading ? '⏳ Connexion...' : 'Se connecter'}
              </button>

              {/* Mot de passe oublié */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                   Mot de passe oublié ?
                </button>
              </div>
            </form>
          )}

          {/* FORMULAIRE MOT DE PASSE OUBLIÉ */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom d'utilisateur
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="admin"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50"
              >
                {loading ? '⏳ Envoi...' : 'Recevoir un code'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400"
                >
                  ← Retour à la connexion
                </button>
              </div>
            </form>
          )}

          {/* FORMULAIRE RÉINITIALISATION */}
          {mode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              {/* Code généré (dev uniquement) */}
              {generatedCode && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-yellow-800 dark:text-yellow-300 font-semibold">
                     Votre code (dev) :
                  </p>
                  <p className="text-2xl font-mono font-bold text-yellow-900 dark:text-yellow-200 text-center my-2">
                    {generatedCode}
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-400">
                    En production, ce code serait envoyé par email
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Code de réinitialisation
                </label>
                <input
                  type="text"
                  required
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-center text-2xl font-mono"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="••••••••"
                  minLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50"
              >
                {loading ? '⏳ Réinitialisation...' : 'Réinitialiser'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400"
                >
                  ← Retour à la connexion
                </button>
              </div>
            </form>
          )}

          {/* Info identifiants par défaut */}
          {mode === 'login' && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong> Identifiants :</strong>
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                • Username : <code className="bg-white dark:bg-gray-700 px-2 py-1 rounded">Votre login</code><br />
                • Password : <code className="bg-white dark:bg-gray-700 px-2 py-1 rounded">votre password</code>
              </p>
            </div>
          )}

        </div>

        {/* Retour accueil */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm"
          >
            ← Retour à l'accueil
          </button>
        </div>

      </div>
    </div>
  );
}