function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` });
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: 'The submitted data is invalid.', details: error.message });
  }
  if (error.name === 'CastError') {
    return res.status(400).json({ message: 'The requested resource identifier is invalid.' });
  }
  if (error.code === 11000) {
    return res.status(409).json({ message: 'This record already exists.' });
  }

  if (!error.status || error.status >= 500) console.error(error);
  return res.status(error.status || 500).json({
    message: error.status ? error.message : 'An unexpected server error occurred.'
  });
}

module.exports = { notFound, errorHandler };
