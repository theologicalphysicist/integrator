export const generateRandomString = (length) => {
    let text = '';
    const POSSIBLE = 'ABCDEF0123456789';
  
    for (let i = 0; i < length; i++) {
        text += POSSIBLE.charAt(Math.floor(Math.random() * POSSIBLE.length));
    }
    return text;
};

export const SPOTIFY_ACCOUNTS_URL = 'https://accounts.spotify.com';
export const SPOTIFY_API_URL = 'https://api.spotify.com/v1';
export const MONGODB_URL = (username, password) => `mongodb+srv://${username}:${password}@integrator-cluster.bc07dt5.mongodb.net/?retryWrites=true&w=majority`