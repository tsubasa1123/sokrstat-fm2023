// frontend/src/components/ExportButton.jsx
import React, { useState } from 'react';
import { exportPlayers } from '../services/api';

export default function ExportButton({ 
  filters = {}, 
  columns = null,
  buttonText = "📥 Exporter",
  className = "",
  showOptions = true 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [selectedColumns, setSelectedColumns] = useState(columns || [
    'name', 'age', 'nationality', 'club', 'position',
    'finishing', 'dribbling', 'passing', 'pace', 'stamina'
  ]);
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  // Colonnes disponibles par catégorie
  const availableColumns = {
    base: [
      { key: 'name', label: 'Nom' },
      { key: 'age', label: 'Âge' },
      { key: 'nationality', label: 'Nationalité' },
      { key: 'club', label: 'Club' },
      { key: 'position', label: 'Position' },
      { key: 'height', label: 'Taille' },
      { key: 'weight', label: 'Poids' },
      { key: 'preferred_foot', label: 'Pied préféré' },
      { key: 'transfer_value', label: 'Valeur' },
    ],
    carriere: [
      { key: 'career_apps', label: 'Matchs carrière' },
      { key: 'career_goals', label: 'Buts carrière' },
      { key: 'league_apps', label: 'Matchs championnat' },
      { key: 'league_goals', label: 'Buts championnat' },
      { key: 'caps', label: 'Sélections' },
    ],
    technique: [
      { key: 'corners', label: 'Corners' },
      { key: 'crossing', label: 'Crossing' },
      { key: 'dribbling', label: 'Dribbling' },
      { key: 'finishing', label: 'Finishing' },
      { key: 'first_touch', label: 'First Touch' },
      { key: 'free_kicks', label: 'Free Kicks' },
      { key: 'heading', label: 'Heading' },
      { key: 'long_shots', label: 'Long Shots' },
      { key: 'marking', label: 'Marking' },
      { key: 'passing', label: 'Passing' },
      { key: 'penalty_taking', label: 'Penalties' },
      { key: 'tackling', label: 'Tackling' },
      { key: 'technique', label: 'Technique' },
    ],
    mental: [
      { key: 'aggression', label: 'Aggression' },
      { key: 'anticipation', label: 'Anticipation' },
      { key: 'bravery', label: 'Bravery' },
      { key: 'composure', label: 'Composure' },
      { key: 'concentration', label: 'Concentration' },
      { key: 'decisions', label: 'Decisions' },
      { key: 'determination', label: 'Determination' },
      { key: 'flair', label: 'Flair' },
      { key: 'leadership', label: 'Leadership' },
      { key: 'off_the_ball', label: 'Off The Ball' },
      { key: 'positioning', label: 'Positioning' },
      { key: 'teamwork', label: 'Teamwork' },
      { key: 'vision', label: 'Vision' },
      { key: 'work_rate', label: 'Work Rate' },
    ],
    physique: [
      { key: 'acceleration', label: 'Acceleration' },
      { key: 'agility', label: 'Agility' },
      { key: 'balance', label: 'Balance' },
      { key: 'jumping', label: 'Jumping' },
      { key: 'pace', label: 'Pace' },
      { key: 'stamina', label: 'Stamina' },
      { key: 'strength', label: 'Strength' },
    ],
    gardien: [
      { key: 'aerial_reach', label: 'Aerial Reach' },
      { key: 'command_of_area', label: 'Command of Area' },
      { key: 'communication', label: 'Communication' },
      { key: 'eccentricity', label: 'Eccentricity' },
      { key: 'handling', label: 'Handling' },
      { key: 'kicking', label: 'Kicking' },
      { key: 'one_on_ones', label: 'One on Ones' },
      { key: 'reflexes', label: 'Reflexes' },
      { key: 'rushing_out', label: 'Rushing Out' },
      { key: 'throwing', label: 'Throwing' },
    ],
  };

  const handleExport = async (format) => {
    setLoading(true);
    try {
      await exportPlayers({
        filters: filters,
        columns: selectedColumns,
        format: format
      });
      
      // Fermer le menu après succès
      setTimeout(() => {
        setIsOpen(false);
      }, 500);
    } catch (error) {
      console.error('Erreur export:', error);
      alert('Erreur lors de l\'export. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const toggleColumn = (columnKey) => {
    if (selectedColumns.includes(columnKey)) {
      setSelectedColumns(selectedColumns.filter(c => c !== columnKey));
    } else {
      setSelectedColumns([...selectedColumns, columnKey]);
    }
  };

  const selectAllInCategory = (category) => {
    const categoryColumns = availableColumns[category].map(c => c.key);
    const newColumns = [...new Set([...selectedColumns, ...categoryColumns])];
    setSelectedColumns(newColumns);
  };

  const deselectAllInCategory = (category) => {
    const categoryColumns = availableColumns[category].map(c => c.key);
    setSelectedColumns(selectedColumns.filter(c => !categoryColumns.includes(c)));
  };

  if (!showOptions) {
    // Mode simple : bouton direct
    return (
      <button
        onClick={() => handleExport(selectedFormat)}
        disabled={loading}
        className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 font-semibold ${className}`}
      >
        {loading ? '⏳ Export en cours...' : buttonText}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold flex items-center gap-2 ${className}`}
      >
        {buttonText}
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <>
          {/* Overlay pour fermer */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />

          {/* Menu d'export */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl z-50 border border-gray-200 max-h-96 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                📥 Options d'export
              </h3>

              {/* Sélection du format */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Format de fichier
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedFormat('csv')}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition ${
                      selectedFormat === 'csv'
                        ? 'border-green-600 bg-green-50 text-green-700 font-bold'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    📄 CSV
                  </button>
                  <button
                    onClick={() => setSelectedFormat('excel')}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition ${
                      selectedFormat === 'excel'
                        ? 'border-green-600 bg-green-50 text-green-700 font-bold'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    📊 Excel
                  </button>
                </div>
              </div>

              {/* Sélection des colonnes */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Colonnes à exporter ({selectedColumns.length})
                  </label>
                  <button
                    onClick={() => setShowColumnSelector(!showColumnSelector)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {showColumnSelector ? 'Masquer' : 'Personnaliser'}
                  </button>
                </div>

                {showColumnSelector && (
                  <div className="border border-gray-200 rounded-lg p-3 max-h-64 overflow-y-auto bg-gray-50">
                    {Object.entries(availableColumns).map(([category, cols]) => (
                      <div key={category} className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm text-gray-700 capitalize">
                            {category}
                          </h4>
                          <div className="flex gap-1">
                            <button
                              onClick={() => selectAllInCategory(category)}
                              className="text-xs text-blue-600 hover:text-blue-700"
                            >
                              Tout
                            </button>
                            <span className="text-xs text-gray-400">|</span>
                            <button
                              onClick={() => deselectAllInCategory(category)}
                              className="text-xs text-red-600 hover:text-red-700"
                            >
                              Aucun
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          {cols.map(col => (
                            <label
                              key={col.key}
                              className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-100 p-1 rounded"
                            >
                              <input
                                type="checkbox"
                                checked={selectedColumns.includes(col.key)}
                                onChange={() => toggleColumn(col.key)}
                                className="rounded text-green-600"
                              />
                              <span className="text-xs">{col.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Infos sur les filtres */}
              {Object.keys(filters).length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>ℹ️ Filtres actifs :</strong>
                  </p>
                  <div className="text-xs text-blue-700 mt-1 space-y-1">
                    {filters.position && <p>• Position : {filters.position}</p>}
                    {filters.nationality && <p>• Nationalité : {filters.nationality}</p>}
                    {filters.club && <p>• Club : {filters.club}</p>}
                    {filters.min_age && <p>• Âge min : {filters.min_age}</p>}
                    {filters.max_age && <p>• Âge max : {filters.max_age}</p>}
                  </div>
                </div>
              )}

              {/* Boutons d'action */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleExport(selectedFormat)}
                  disabled={loading || selectedColumns.length === 0}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition disabled:opacity-50 font-semibold"
                >
                  {loading ? '⏳ Export...' : `📥 Exporter ${selectedFormat.toUpperCase()}`}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}