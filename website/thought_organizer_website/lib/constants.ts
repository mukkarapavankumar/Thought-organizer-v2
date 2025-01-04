// Base path is different for local development vs production (GitHub Pages)
export const BASE_PATH = process.env.NODE_ENV === 'production' ? '/Thought-organizer-v2' : ''

// Direct download URL (used on the download page)
export const DOWNLOAD_URL = 'https://drive.google.com/uc?export=download&id=1pShvs7fkXgDw1NZBeo8TVj_wn4IGL8pe'

// Download page path (used in navigation)
export const DOWNLOAD_PAGE = '/download'

// Full download page URL (handles both local and production)
export const getDownloadPageUrl = () => {
  return process.env.NODE_ENV === 'production' 
    ? `${BASE_PATH}${DOWNLOAD_PAGE}`
    : DOWNLOAD_PAGE
} 