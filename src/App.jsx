import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [countries, setCountries] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredCountries, setFilteredCountries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCountry, setSelectedCountry] = useState(null)


  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true)
        const response = await fetch('https://codejudge-question-artifacts-dev.s3.amazonaws.com/q-1709/data.json')
        if (!response.ok) throw new Error('Failed to fetch countries data')
        const data = await response.json()
        setCountries(data)
        setFilteredCountries(data)

     
        const urlParams = new URLSearchParams(window.location.search)
        const countryName = urlParams.get('country')
        if (countryName) {
          const found = data.find(c => c.name.toLowerCase() === countryName.toLowerCase())
          if (found) setSelectedCountry(found)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCountries()
  }, [])

  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCountries(countries)
    } else {
      const filtered = countries.filter(country =>
        country.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredCountries(filtered)
    }
  }, [searchTerm, countries])

  useEffect(() => {
    const url = new URL(window.location)
    if (selectedCountry) {
      url.searchParams.set('country', selectedCountry.name)
    } else {
      url.searchParams.delete('country')
    }
    window.history.replaceState({}, '', url)
  }, [selectedCountry])

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleCountryClick = (country) => {
    setSelectedCountry(country)
    setSearchTerm(country.name)
  }

  const getCountryFlagEmoji = (countryCode) => {
    if (!countryCode) return '🏳️'
    const codePoints = countryCode.toUpperCase().split('').map(ch => 127397 + ch.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
  }

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <div className="loading-spinner"></div>
          <div>Loading countries...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app">
        <div className="error">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="app">
      <h1 style={{ marginBottom: '1.5rem' }}>Country Search</h1>

      <div className="search-card">
        <div className="search-area">
          <div className="search-input-wrapper card-search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>
        </div>

        <div className="card-body">
          <div className="left-column">
            <div className="countries-list-content card-left-list">
              {filteredCountries.length === 0 ? (
                <div className="no-results">No countries found!</div>
              ) : (
                filteredCountries.map((country) => (
                  <div
                    key={country.name}
                    className={`country-item ${selectedCountry?.name === country.name ? 'selected' : ''}`}
                    onClick={() => handleCountryClick(country)}
                  >
                    {country.flag ? (
                      <img
                        src={country.flag}
                        alt={`${country.name} flag`}
                        className="country-flag"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <div className="country-flag-emoji" style={{ display: country.flag ? 'none' : 'flex' }}>
                      {getCountryFlagEmoji(country.alpha2Code)}
                    </div>
                    <span className="country-name">{country.name}</span>
                    <span className="country-arrow">→</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="right-column">
            <div className="country-detail-card small">
              {selectedCountry ? (
                <>
                  {selectedCountry.flag ? (
                    <img
                      src={selectedCountry.flag}
                      alt={`${selectedCountry.name} flag`}
                      className="country-detail-flag"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <div className="country-detail-flag-emoji" style={{ display: selectedCountry.flag ? 'none' : 'flex' }}>
                    {getCountryFlagEmoji(selectedCountry.alpha2Code)}
                  </div>

                  <h2 className="country-detail-name">{selectedCountry.name}</h2>
                  <p className="country-detail-title">{selectedCountry.region}</p>

                  <div className="country-detail-info">
                    <p><strong>Capital:</strong> {selectedCountry.capital || 'N/A'}</p>
                    <p><strong>Population:</strong> {selectedCountry.population ? selectedCountry.population.toLocaleString() : 'N/A'}</p>
                    <p><strong>Region:</strong> {selectedCountry.region || 'N/A'}</p>
                    <p><strong>Subregion:</strong> {selectedCountry.subregion || 'N/A'}</p>
                    {selectedCountry.area && (
                      <p><strong>Area:</strong> {selectedCountry.area.toLocaleString()} km²</p>
                    )}
                    {selectedCountry.currencies && selectedCountry.currencies.length > 0 && (
                      <p><strong>Currency:</strong> {selectedCountry.currencies.map(c => `${c.name} (${c.symbol})`).join(', ')}</p>
                    )}
                    {selectedCountry.languages && selectedCountry.languages.length > 0 && (
                      <p><strong>Languages:</strong> {selectedCountry.languages.map(l => l.name).join(', ')}</p>
                    )}
                    {selectedCountry.callingCodes && selectedCountry.callingCodes.length > 0 && (
                      <p><strong>Calling Code:</strong> +{selectedCountry.callingCodes.join(', ')}</p>
                    )}
                    {selectedCountry.timezones && selectedCountry.timezones.length > 0 && (
                      <p><strong>Timezones:</strong> {selectedCountry.timezones.join(', ')}</p>
                    )}
                  </div>

                  <button
                    className="view-profile-btn"
                    onClick={() => window.open(selectedCountry.flag || '#', '_blank')}
                  >
                    View Profile
                  </button>
                </>
              ) : (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                  Select a country to view details
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
