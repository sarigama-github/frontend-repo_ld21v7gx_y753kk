import { useEffect, useMemo, useState } from 'react'

function App() {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const seed = useMemo(() => ({
    stations: [
      { code: 'AP', name: 'Akhbarnagar', line: 'Blue', order: 1 },
      { code: 'NS', name: 'Nehru Nagar', line: 'Blue', order: 2 },
      { code: 'SP', name: 'Shyamal', line: 'Blue', order: 3 },
      { code: 'VD', name: 'Vastrapur', line: 'Blue', order: 4 },
      { code: 'BD', name: 'Bodakdev', line: 'Blue', order: 5 },
      { code: 'TH', name: 'Thaltej', line: 'Blue', order: 6 },
    ],
    fares: [
      { from_code: 'AP', to_code: 'NS', price: 10 },
      { from_code: 'AP', to_code: 'SP', price: 15 },
      { from_code: 'AP', to_code: 'VD', price: 20 },
      { from_code: 'AP', to_code: 'BD', price: 25 },
      { from_code: 'AP', to_code: 'TH', price: 30 },
      { from_code: 'NS', to_code: 'SP', price: 10 },
      { from_code: 'NS', to_code: 'VD', price: 15 },
      { from_code: 'NS', to_code: 'BD', price: 20 },
      { from_code: 'NS', to_code: 'TH', price: 25 },
      { from_code: 'SP', to_code: 'VD', price: 10 },
      { from_code: 'SP', to_code: 'BD', price: 15 },
      { from_code: 'SP', to_code: 'TH', price: 20 },
      { from_code: 'VD', to_code: 'BD', price: 10 },
      { from_code: 'VD', to_code: 'TH', price: 15 },
      { from_code: 'BD', to_code: 'TH', price: 10 },
      // also include reverse fares
      { from_code: 'NS', to_code: 'AP', price: 10 },
      { from_code: 'SP', to_code: 'AP', price: 15 },
      { from_code: 'VD', to_code: 'AP', price: 20 },
      { from_code: 'BD', to_code: 'AP', price: 25 },
      { from_code: 'TH', to_code: 'AP', price: 30 },
      { from_code: 'SP', to_code: 'NS', price: 10 },
      { from_code: 'VD', to_code: 'NS', price: 15 },
      { from_code: 'BD', to_code: 'NS', price: 20 },
      { from_code: 'TH', to_code: 'NS', price: 25 },
      { from_code: 'VD', to_code: 'SP', price: 10 },
      { from_code: 'BD', to_code: 'SP', price: 15 },
      { from_code: 'TH', to_code: 'SP', price: 20 },
      { from_code: 'BD', to_code: 'VD', price: 10 },
      { from_code: 'TH', to_code: 'VD', price: 15 },
      { from_code: 'TH', to_code: 'BD', price: 10 },
    ],
  }), [])

  const [stations, setStations] = useState([])
  const [fromCode, setFromCode] = useState('')
  const [toCode, setToCode] = useState('')
  const [fare, setFare] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [userName, setUserName] = useState('')
  const [phone, setPhone] = useState('')
  const [bookings, setBookings] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        setError('')
        const res = await fetch(`${baseUrl}/api/stations`)
        const data = await res.json()
        if (data.stations && data.stations.length) {
          setStations(data.stations)
          setFromCode(data.stations[0].code)
          setToCode(data.stations[1]?.code || data.stations[0].code)
        } else {
          // seed data then refetch
          await fetch(`${baseUrl}/api/init`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(seed),
          })
          const r2 = await fetch(`${baseUrl}/api/stations`)
          const d2 = await r2.json()
          setStations(d2.stations || [])
          if (d2.stations?.length) {
            setFromCode(d2.stations[0].code)
            setToCode(d2.stations[1]?.code || d2.stations[0].code)
          }
        }
      } catch (e) {
        setError('Unable to connect to backend. Please check later.')
      }
    }
    load()
    fetchBookings()
  }, [baseUrl, seed])

  useEffect(() => {
    if (fromCode && toCode && fromCode !== toCode) {
      fetchFare(fromCode, toCode)
    } else {
      setFare(null)
    }
  }, [fromCode, toCode])

  const fetchFare = async (from, to) => {
    try {
      const res = await fetch(`${baseUrl}/api/fare?from_code=${from}&to_code=${to}`)
      if (!res.ok) throw new Error('Fare not configured')
      const data = await res.json()
      setFare(data.price)
    } catch (e) {
      setFare(null)
    }
  }

  const createBooking = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${baseUrl}/api/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_name: userName, phone, from_code: fromCode, to_code: toCode }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Failed to book' }))
        throw new Error(err.detail || 'Failed to book')
      }
      await res.json()
      setUserName('')
      setPhone('')
      await fetchBookings()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/bookings`)
      const data = await res.json()
      setBookings(data.bookings || [])
    } catch (e) {
      // ignore for now
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50">
      <header className="px-6 py-4 bg-white/70 backdrop-blur border-b border-indigo-100 sticky top-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-indigo-700">GMRC Metro Booking</h1>
          <a href="/test" className="text-sm text-indigo-600 hover:underline">System Test</a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 grid md:grid-cols-2 gap-6">
        <section className="bg-white rounded-xl shadow-sm border border-indigo-100 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">New Journey</h2>

          {error && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">{error}</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">From</label>
              <select
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={fromCode}
                onChange={(e) => setFromCode(e.target.value)}
              >
                {stations.map((s) => (
                  <option key={s.code} value={s.code}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">To</label>
              <select
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={toCode}
                onChange={(e) => setToCode(e.target.value)}
              >
                {stations.filter(s => s.code !== fromCode).map((s) => (
                  <option key={s.code} value={s.code}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-100">
            {fromCode && toCode && fromCode !== toCode ? (
              fare !== null ? (
                <p className="text-sm">Estimated fare: <span className="font-semibold">₹ {fare.toFixed(2)}</span></p>
              ) : (
                <p className="text-sm">Fare not available for this route.</p>
              )
            ) : (
              <p className="text-sm">Please choose different source and destination.</p>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Passenger Name</label>
              <input
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter full name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Phone</label>
              <input
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="10-digit number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={createBooking}
            disabled={loading || !userName || !phone || !fromCode || !toCode || fromCode === toCode || fare === null}
            className="mt-5 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-600 text-white disabled:bg-gray-300 hover:bg-indigo-700 transition"
          >
            {loading ? 'Booking...' : 'Confirm Booking'}
          </button>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-indigo-100 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Bookings</h2>
          {bookings.length === 0 ? (
            <p className="text-gray-600 text-sm">No bookings yet.</p>
          ) : (
            <ul className="divide-y">
              {bookings.map((b) => (
                <li key={b.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{b.user_name} <span className="text-xs text-gray-500">({b.phone})</span></p>
                    <p className="text-sm text-gray-600">{b.from_code} → {b.to_code}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-indigo-700 font-semibold">₹ {Number(b.fare).toFixed(2)}</p>
                    <p className="text-xs text-green-600 capitalize">{b.status}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <button onClick={fetchBookings} className="mt-4 text-sm text-indigo-600 hover:underline">Refresh</button>
        </section>
      </main>

      <footer className="max-w-5xl mx-auto p-6 text-center text-xs text-gray-500">
        Sample fares used for now. You can share official fare chart anytime; we can update instantly.
      </footer>
    </div>
  )
}

export default App
