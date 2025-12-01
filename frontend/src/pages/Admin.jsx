// frontend/src/pages/Admin.jsx
import React, { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('add'); // 'add', 'update', 'delete'
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // États pour l'ajout
  const [addData, setAddData] = useState({
    name: '',
    age: '',
    nationality: '',
    club: '',
    position: '',
    preferred_foot: 'Right'
  });

  // États pour la modification
  const [updateId, setUpdateId] = useState('');
  const [updateData, setUpdateData] = useState({
    name: '',
    age: '',
    nationality: '',
    club: '',
    position: ''
  });

  // État pour la suppression
  const [deleteId, setDeleteId] = useState('');

  const resetMessages = () => {
    setMessage('');
    setError('');
  };

  // Ajouter un joueur
  const handleAdd = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...addData,
          age: parseInt(addData.age) || 0
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Joueur "${data.player.name}" ajouté avec succès (ID: ${data.id})`);
        setAddData({
          name: '',
          age: '',
          nationality: '',
          club: '',
          position: '',
          preferred_foot: 'Right'
        });
      } else {
        setError(`❌ Erreur : ${data.error || 'Échec de l\'ajout'}`);
      }
    } catch (err) {
      setError(`❌ Erreur réseau : ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Modifier un joueur
  const handleUpdate = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/players/${updateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updateData,
          age: updateData.age ? parseInt(updateData.age) : undefined
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Joueur ID ${updateId} mis à jour avec succès`);
        setUpdateId('');
        setUpdateData({ name: '', age: '', nationality: '', club: '', position: '' });
      } else {
        setError(`❌ Erreur : ${data.error || 'Échec de la mise à jour'}`);
      }
    } catch (err) {
      setError(`❌ Erreur réseau : ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un joueur
  const handleDelete = async (e) => {
    e.preventDefault();
    
    if (!window.confirm(`⚠️ Confirmer la suppression du joueur ID ${deleteId} ?`)) {
      return;
    }

    resetMessages();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/players/${deleteId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`${data.message}`);
        setDeleteId('');
      } else {
        setError(`❌ Erreur : ${data.error || 'Échec de la suppression'}`);
      }
    } catch (err) {
      setError(`❌ Erreur réseau : ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
             Administration
          </h1>
          <p className="text-gray-600">
            Gestion des joueurs (CRUD : Create, Read, Update, Delete)
          </p>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            {message}
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {/* Onglets */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('add')}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                activeTab === 'add'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ➕ Ajouter
            </button>
            <button
              onClick={() => setActiveTab('update')}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                activeTab === 'update'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
               Modifier
            </button>
            <button
              onClick={() => setActiveTab('delete')}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                activeTab === 'delete'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
               Supprimer
            </button>
          </div>

          <div className="p-6">
            {/* AJOUTER */}
            {activeTab === 'add' && (
              <form onSubmit={handleAdd} className="space-y-4">
                <h2 className="text-2xl font-bold mb-4">Ajouter un nouveau joueur</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom *
                    </label>
                    <input
                      type="text"
                      required
                      value={addData.name}
                      onChange={(e) => setAddData({ ...addData, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Kylian Mbappé"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Âge *
                    </label>
                    <input
                      type="number"
                      required
                      min="15"
                      max="45"
                      value={addData.age}
                      onChange={(e) => setAddData({ ...addData, age: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 24"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nationalité *
                    </label>
                    <input
                      type="text"
                      required
                      value={addData.nationality}
                      onChange={(e) => setAddData({ ...addData, nationality: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: France"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Club
                    </label>
                    <input
                      type="text"
                      value={addData.club}
                      onChange={(e) => setAddData({ ...addData, club: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Paris Saint-Germain"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Position *
                    </label>
                    <select
                      required
                      value={addData.position}
                      onChange={(e) => setAddData({ ...addData, position: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Sélectionner...</option>
                      <option value="GK">GK (Gardien)</option>
                      <option value="D (C)">D (C) (Défenseur Central)</option>
                      <option value="D (RL)">D (RL) (Latéral)</option>
                      <option value="DM">DM (Milieu Défensif)</option>
                      <option value="M (C)">M (C) (Milieu Central)</option>
                      <option value="M (RL)">M (RL) (Milieu Latéral)</option>
                      <option value="AM (C)">AM (C) (Milieu Offensif)</option>
                      <option value="AM (RL)">AM (RL) (Ailier)</option>
                      <option value="ST (C)">ST (C) (Attaquant)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pied préféré
                    </label>
                    <select
                      value={addData.preferred_foot}
                      onChange={(e) => setAddData({ ...addData, preferred_foot: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Right">Droit</option>
                      <option value="Left">Gauche</option>
                      <option value="Either">Les deux</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
                >
                  {loading ? '⏳ Ajout en cours...' : '➕ Ajouter le joueur'}
                </button>
              </form>
            )}

            {/* MODIFIER */}
            {activeTab === 'update' && (
              <form onSubmit={handleUpdate} className="space-y-4">
                <h2 className="text-2xl font-bold mb-4">Modifier un joueur existant</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID du joueur à modifier *
                  </label>
                  <input
                    type="number"
                    required
                    value={updateId}
                    onChange={(e) => setUpdateId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 12345"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                     Trouvez l'ID dans l'URL de la fiche joueur
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nouveau nom
                    </label>
                    <input
                      type="text"
                      value={updateData.name}
                      onChange={(e) => setUpdateData({ ...updateData, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nouvel âge
                    </label>
                    <input
                      type="number"
                      value={updateData.age}
                      onChange={(e) => setUpdateData({ ...updateData, age: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nouvelle nationalité
                    </label>
                    <input
                      type="text"
                      value={updateData.nationality}
                      onChange={(e) => setUpdateData({ ...updateData, nationality: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nouveau club
                    </label>
                    <input
                      type="text"
                      value={updateData.club}
                      onChange={(e) => setUpdateData({ ...updateData, club: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <p className="text-sm text-gray-500">
                  ℹ️ Laissez vide les champs que vous ne souhaitez pas modifier
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 transition font-semibold disabled:opacity-50"
                >
                  {loading ? '⏳ Modification en cours...' : 'Modifier le joueur'}
                </button>
              </form>
            )}

            {/* SUPPRIMER */}
            {activeTab === 'delete' && (
              <form onSubmit={handleDelete} className="space-y-4">
                <h2 className="text-2xl font-bold mb-4 text-red-600">Supprimer un joueur</h2>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800 font-semibold">⚠️ Attention</p>
                  <p className="text-red-700 text-sm">
                    Cette action est irréversible. Le joueur sera définitivement supprimé de la base de données.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID du joueur à supprimer *
                  </label>
                  <input
                    type="number"
                    required
                    value={deleteId}
                    onChange={(e) => setDeleteId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Ex: 12345"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                     Trouvez l'ID dans l'URL de la fiche joueur
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition font-semibold disabled:opacity-50"
                >
                  {loading ? '⏳ Suppression en cours...' : 'Supprimer le joueur'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Informations */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-bold text-blue-800 mb-2">Guide d'utilisation</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Ajouter</strong> : Créez un nouveau joueur en remplissant tous les champs obligatoires</li>
            <li>• <strong>Modifier</strong> : Mettez à jour les informations d'un joueur existant (via son ID)</li>
            <li>• <strong>Supprimer</strong> : Supprimez définitivement un joueur de la base de données</li>
            <li>• Pour trouver l'ID d'un joueur : Allez sur sa fiche, l'ID est dans l'URL (ex: /player/12345)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}