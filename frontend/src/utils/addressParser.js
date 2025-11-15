/**
 * Parse an address string or object into components (state, city, country)
 * Handles various address formats
 * 
 * @param {string | object} address - Address string or object
 * @returns {object} Parsed address with { street, city, state, zipCode, country }
 */
export default function parseAddress(address) {
  const result = {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  }

  // Handle null/undefined
  if (!address) return result

  // Handle object format
  if (typeof address === 'object') {
    return {
      street: address.street || '',
      city: address.city || '',
      state: address.state || '',
      zipCode: address.zipCode || address.postalCode || '',
      country: address.country || ''
    }
  }

  // Handle string format (e.g., "123 Main St, Boston, MA 02134, USA")
  if (typeof address === 'string') {
    const parts = address.split(',').map(part => part.trim())
    
    if (parts.length === 0) return result

    // Try to parse common format: street, city, state zipcode, country
    result.street = parts[0] || ''
    result.city = parts[1] || ''

    if (parts.length >= 3) {
      // Parse state and zip code from third part (e.g., "MA 02134")
      const stateZip = parts[2].trim()
      const stateZipMatch = stateZip.match(/^([A-Z]{2})\s+(\d{5}(-\d{4})?)$/)
      
      if (stateZipMatch) {
        result.state = stateZipMatch[1]
        result.zipCode = stateZipMatch[2]
      } else {
        // Just state, no zip
        result.state = stateZip
      }
    }

    if (parts.length >= 4) {
      result.country = parts[3]
    }
  }

  return result
}

/**
 * Format address components back into a readable string
 * 
 * @param {object} addressObj - Parsed address object
 * @returns {string} Formatted address string
 */
export function formatAddress(addressObj) {
  const parts = []
  
  if (addressObj.street) parts.push(addressObj.street)
  if (addressObj.city) parts.push(addressObj.city)
  
  const stateZip = []
  if (addressObj.state) stateZip.push(addressObj.state)
  if (addressObj.zipCode) stateZip.push(addressObj.zipCode)
  if (stateZip.length > 0) parts.push(stateZip.join(' '))
  
  if (addressObj.country) parts.push(addressObj.country)
  
  return parts.join(', ')
}

/**
 * Get a short address (city, state format)
 * 
 * @param {string | object} address - Address string or object
 * @returns {string} Short address format (e.g., "Boston, MA")
 */
export function getShortAddress(address) {
  const parsed = parseAddress(address)
  const parts = []
  if (parsed.city) parts.push(parsed.city)
  if (parsed.state) parts.push(parsed.state)
  return parts.join(', ')
}
