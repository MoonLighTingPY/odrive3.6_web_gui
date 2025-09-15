// Utility for managing favourites in localStorage

const FAVOURITES_KEY = 'odrive_property_favourites'

export function getFavourites() {
  try {
    return JSON.parse(localStorage.getItem(FAVOURITES_KEY) || '[]')
  } catch {
    return []
  }
}

export function addFavourite(path) {
  const favs = getFavourites()
  if (!favs.includes(path)) {
    favs.push(path)
    localStorage.setItem(FAVOURITES_KEY, JSON.stringify(favs))
  }
}

export function removeFavourite(path) {
  const favs = getFavourites().filter(p => p !== path)
  localStorage.setItem(FAVOURITES_KEY, JSON.stringify(favs))
}

export function isFavourite(path) {
  return getFavourites().includes(path)
}