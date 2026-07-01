'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface Siswa {
  id: string;
  ic: string;
  nama: string;
  alamat: string;
  ipta: string;
  no_tel: string;
  alt_number: string;
  email: string;
  daerah_mengundi: string;
  lokaliti: string;
  parlimen: string;
  dun: string;
  source_document: string;
  created_at: string;
  age: number;
}

type SortKey = 'age_asc' | 'age_desc' | 'nama_asc' | 'nama_desc' | 'created_at_desc' | 'created_at_asc';

const SORT_LABELS: Record<SortKey, string> = {
  age_asc: 'Umur ↑',
  age_desc: 'Umur ↓',
  nama_asc: 'Nama A-Z',
  nama_desc: 'Nama Z-A',
  created_at_desc: 'Terbaru',
  created_at_asc: 'Terlama',
};

const DUN_OPTIONS = ['', 'Pemanis', 'Kemelah'];

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function Home() {
  const [data, setData] = useState<Siswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortKey>('age_asc');

  const [nama, setNama] = useState('');
  const [alamat, setAlamat] = useState('');
  const [ipta, setIpta] = useState('');
  const [daerahMengundi, setDaerahMengundi] = useState('');
  const [lokaliti, setLokaliti] = useState('');
  const [parlimen, setParlimen] = useState('');
  const [dun, setDun] = useState('');
  const [universitiOnly, setUniversitiOnly] = useState(false);

  const dNama = useDebounce(nama, 300);
  const dAlamat = useDebounce(alamat, 300);
  const dIpta = useDebounce(ipta, 300);
  const dDaerah = useDebounce(daerahMengundi, 300);
  const dLokaliti = useDebounce(lokaliti, 300);
  const dParlimen = useDebounce(parlimen, 300);
  const dDun = useDebounce(dun, 300);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (dNama) params.set('nama', dNama);
    if (dAlamat) params.set('alamat', dAlamat);
    if (dIpta) params.set('ipta', dIpta);
    if (dDaerah) params.set('daerah_mengundi', dDaerah);
    if (dLokaliti) params.set('lokaliti', dLokaliti);
    if (dParlimen) params.set('parlimen', dParlimen);
    if (dDun) params.set('dun', dDun);
    if (universitiOnly) params.set('universiti_only', 'true');
    params.set('sort', sort);

    try {
      const res = await fetch(`/api/siswa?${params.toString()}`);
      const json = await res.json();
      setData(json);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [dNama, dAlamat, dIpta, dDaerah, dLokaliti, dParlimen, dDun, universitiOnly, sort]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const clearFilters = () => {
    setNama('');
    setAlamat('');
    setIpta('');
    setDaerahMengundi('');
    setLokaliti('');
    setParlimen('');
    setDun('');
    setUniversitiOnly(false);
    setSort('age_asc');
  };

  const hasFilters = nama || alamat || ipta || daerahMengundi || lokaliti || parlimen || dun || universitiOnly || sort !== 'age_asc';

  const handleSort = (key: SortKey) => {
    setSort(key);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Siswa Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Data pengurus siswa mengikut daerah mengundi</p>
        </div>
        <div className="text-sm text-gray-500">
          {loading ? '...' : `${data.length} rekod`}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Nama</label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Cari nama..."
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Alamat</label>
            <input
              type="text"
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              placeholder="Cari alamat..."
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">IPTA</label>
            <input
              type="text"
              value={ipta}
              onChange={(e) => setIpta(e.target.value)}
              placeholder="Cari IPTA..."
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Daerah Mengundi</label>
            <input
              type="text"
              value={daerahMengundi}
              onChange={(e) => setDaerahMengundi(e.target.value)}
              placeholder="Cari daerah..."
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Lokaliti</label>
            <input
              type="text"
              value={lokaliti}
              onChange={(e) => setLokaliti(e.target.value)}
              placeholder="Cari lokaliti..."
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Parlimen</label>
            <input
              type="text"
              value={parlimen}
              onChange={(e) => setParlimen(e.target.value)}
              placeholder="Cari parlimen..."
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">DUN</label>
            <select
              value={dun}
              onChange={(e) => setDun(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Semua</option>
              {DUN_OPTIONS.filter(Boolean).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={universitiOnly}
                onChange={(e) => setUniversitiOnly(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Universiti Sahaja</span>
            </label>
          </div>
          <div className="flex items-end">
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-gray-500">Sort:</span>
        {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
          <button
            key={key}
            onClick={() => handleSort(key)}
            className={`px-2 py-1 text-xs rounded-md transition-colors ${
              sort === key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {SORT_LABELS[key]}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Umur</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IPTA</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Tel</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Tel Alt</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">DUN</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Daerah Mengundi</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lokaliti</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parlimen</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alamat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-400">Memuatkan data...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-400">Tiada data ditemui</td>
                </tr>
              ) : (
                data.map((row, i) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap">{row.nama}</td>
                    <td className="px-4 py-2 text-gray-600">{row.age}</td>
                    <td className="px-4 py-2 text-gray-600 whitespace-nowrap">{row.ipta}</td>
                    <td className="px-4 py-2 text-gray-600 font-mono text-xs whitespace-nowrap">{row.no_tel || '-'}</td>
                    <td className="px-4 py-2 text-gray-600 font-mono text-xs whitespace-nowrap">{row.alt_number || '-'}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${
                        row.dun === 'Pemanis' ? 'bg-blue-100 text-blue-700' :
                        row.dun === 'Kemelah' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {row.dun || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-600 whitespace-nowrap">{row.daerah_mengundi}</td>
                    <td className="px-4 py-2 text-gray-600 whitespace-nowrap">{row.lokaliti}</td>
                    <td className="px-4 py-2 text-gray-600">{row.parlimen}</td>
                    <td className="px-4 py-2 text-gray-500 text-xs max-w-[200px] truncate" title={row.alamat}>{row.alamat}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
