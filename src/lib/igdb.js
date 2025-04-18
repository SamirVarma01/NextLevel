import axios from 'axios';

// IGDB API endpoints
const AUTH_URL = 'https://id.twitch.tv/oauth2/token';
const IGDB_BASE_URL = 'https://api.igdb.com/v4';

// Cache for the token
let tokenCache = {
  token: null,
  expiry: null,
};

/**
 * Get an access token for IGDB API
 */
async function getAccessToken() {
  // Check if we have a valid cached token
  if (tokenCache.token && tokenCache.expiry > Date.now()) {
    return tokenCache.token;
  }

  try {
    const response = await axios.post(
      `${AUTH_URL}?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`
    );

    // Cache the token
    tokenCache.token = response.data.access_token;
    // Set expiry time (subtract 10 minutes to be safe)
    tokenCache.expiry = Date.now() + (response.data.expires_in * 1000) - 600000;

    return response.data.access_token;
  } catch (error) {
    console.error('Error getting IGDB access token:', error);
    throw new Error('Failed to get IGDB access token');
  }
}

/**
 * Make an API request to IGDB
 */
async function makeIGDBRequest(endpoint, query) {
  try {
    const token = await getAccessToken();
    
    const response = await axios({
      url: `${IGDB_BASE_URL}/${endpoint}`,
      method: 'POST',
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'text/plain',
      },
      data: query,
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error making IGDB request to ${endpoint}:`, error);
    throw new Error(`IGDB API request failed: ${error.message}`);
  }
}

/**
 * Search for games
 */
export async function searchGames(searchTerm, limit = 10) {
  const query = `
    search "${searchTerm}";
    fields name, cover.url, genres.name, first_release_date, rating, summary;
    where version_parent = null;
    limit ${limit};
  `;
  
  return makeIGDBRequest('games', query);
}

/**
 * Get game details by ID
 */
export async function getGameById(id) {
  const query = `
    fields name, cover.url, genres.name, 
           first_release_date, rating, rating_count, aggregated_rating, aggregated_rating_count,
           summary, storyline, screenshots.url, videos.*, involved_companies.company.name,
           similar_games.name, similar_games.cover.url, platforms.name, websites.*;
    where id = ${id};
  `;
  
  const games = await makeIGDBRequest('games', query);
  return games[0];
}

/**
 * Get popular games
 */
export async function getPopularGames(limit = 20) {
  const query = `
    fields name, cover.url, genres.name, first_release_date, rating, rating_count, summary;
    where rating_count > 50 & cover != null;
    sort rating_count desc;
    limit ${limit};
  `;
  
  return makeIGDBRequest('games', query);
}

/**
 * Get recent games
 */
export async function getRecentGames(limit = 20) {
  const now = Math.floor(Date.now() / 1000);
  const sixMonthsAgo = now - (60 * 60 * 24 * 30 * 6);
  
  const query = `
    fields name, cover.url, genres.name, first_release_date, rating, summary;
    where first_release_date > ${sixMonthsAgo} & cover != null;
    sort first_release_date desc;
    limit ${limit};
  `;
  
  return makeIGDBRequest('games', query);
}

export default {
  searchGames,
  getGameById,
  getPopularGames,
  getRecentGames,
};