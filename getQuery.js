const getQuery = async (req, res) => {
  const hash = req.body.hash || '';

  // Log the hash value
  console.log(`Hash: ${hash}`);

  // Send the hash value in the response
  res.send(`Hash: ${hash}`);
};

module.exports = { getQuery };
