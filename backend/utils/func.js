export const generateRandomString = (length) => {
    const POSSIBLE = "abcdef0123456789";
    let text = '';
  
    for (let i = 0; i < length; i++) {
        text += POSSIBLE.charAt(Math.floor(Math.random() * POSSIBLE.length));
    };

    return text;
};
//TODO: ENSURE ONLY UNIQUE VALUES GENERATED