const getQuery = async (req, res) => {
  
  // Get the full URL from the request
  const fullUrl = req.originalUrl; // or req.url
  // Find the index of the hash (#) character
  const hashIndex = fullUrl.indexOf('#');

  let hash = '';
  // If hash character is found, extract the hash value
  if (hashIndex !== -1) {
    hash = fullUrl.substring(hashIndex + 1);
  }

  // Log the full URL and extracted hash value
  console.log(`Full URL: ${fullUrl}`);
  console.log(`Hash: ${hash}`);

  // Send the hash value in the response
  res.send(`Hash: ${hash}`)
};

module.exports = { getQuery };
