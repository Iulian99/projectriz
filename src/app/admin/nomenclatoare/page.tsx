'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

interface Directie {
  id: number;
  codDir: string;
  denumireDir: string;
  createdAt: string;
  updatedAt: string;
}

interface Serviciu {
  id: number;
  codServ: string;
  denumireServ: string;
  codDir: string;
  directie: Directie;
  createdAt: string;
  updatedAt: string;
}

interface Functie {
  id: number;
  codFunctie: string;
  tipFunctie: string;
  denumireFunctie: string;
  createdAt: string;
  updatedAt: string;
}

export default function NomenclatoarePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('directii');
  const [directii, setDirectii] = useState<Directie[]>([]);
  const [servicii, setServicii] = useState<Serviciu[]>([]);
  const [functii, setFunctii] = useState<Functie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Funcții pentru loading date
  const loadDirectii = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/nomenclatoare/directii');
      if (response.ok) {
        const data = await response.json();
        setDirectii(data);
      } else {
        throw new Error('Eroare la încărcarea direcțiilor');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Eroare necunoscută');
    } finally {
      setLoading(false);
    }
  };

  const loadServicii = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/nomenclatoare/servicii');
      if (response.ok) {
        const data = await response.json();
        setServicii(data);
      } else {
        throw new Error('Eroare la încărcarea serviciilor');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Eroare necunoscută');
    } finally {
      setLoading(false);
    }
  };

  const loadFunctii = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/nomenclatoare/functii');
      if (response.ok) {
        const data = await response.json();
        setFunctii(data);
      } else {
        throw new Error('Eroare la încărcarea funcțiilor');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Eroare necunoscută');
    } finally {
      setLoading(false);
    }
  };

  // Load data când se schimbă tab-ul
  useEffect(() => {
    switch (activeTab) {
      case 'directii':
        loadDirectii();
        break;
      case 'servicii':
        loadServicii();
        break;
      case 'functii':
        loadFunctii();
        break;
    }
  }, [activeTab]);

  // Verificare acces admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Acces Restricționat
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Nu aveți permisiunile necesare pentru a accesa această pagină.
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'directii', label: 'Direcții', icon: '🏢' },
    { id: 'servicii', label: 'Servicii', icon: '🔧' },
    { id: 'functii', label: 'Funcții', icon: '👥' },
    { id: 'utilizatori', label: 'Utilizatori', icon: '👤' },
    { id: 'calendar', label: 'Calendar', icon: '📅' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-2">
            Gestionare Nomenclatoare
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-center">
            Administrare structură organizațională și nomenclatoare
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex justify-center space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Eroare
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Se încarcă...</p>
              </div>
            ) : (
              <>
                {/* Direcții Tab */}
                {activeTab === 'directii' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Direcții ({directii.length})
                    </h3>
                    <div className="grid gap-4">
                      {directii.map((directie) => (
                        <div
                          key={directie.id}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {directie.codDir}
                              </h4>
                              <p className="text-gray-600 dark:text-gray-400 mt-1">
                                {directie.denumireDir}
                              </p>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(directie.createdAt).toLocaleDateString('ro-RO')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Servicii Tab */}
                {activeTab === 'servicii' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Servicii ({servicii.length})
                    </h3>
                    <div className="grid gap-4">
                      {servicii.map((serviciu) => (
                        <div
                          key={serviciu.id}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {serviciu.codServ}
                              </h4>
                              <p className="text-gray-600 dark:text-gray-400 mt-1">
                                {serviciu.denumireServ}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Direcția: {serviciu.directie?.denumireDir || serviciu.codDir}
                              </p>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(serviciu.createdAt).toLocaleDateString('ro-RO')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Funcții Tab */}
                {activeTab === 'functii' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Funcții ({functii.length})
                    </h3>
                    <div className="grid gap-4">
                      {functii.map((functie) => (
                        <div
                          key={functie.id}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {functie.codFunctie}
                              </h4>
                              <p className="text-gray-600 dark:text-gray-400 mt-1">
                                {functie.denumireFunctie}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Tip: {functie.tipFunctie}
                              </p>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(functie.createdAt).toLocaleDateString('ro-RO')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Placeholder pentru alte tab-uri */}
                {['utilizatori', 'calendar'].includes(activeTab) && (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400">
                      Secțiunea {tabs.find(t => t.id === activeTab)?.label} este în dezvoltare.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Floating Action Button pentru adăugare */}
        <button className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  );
}