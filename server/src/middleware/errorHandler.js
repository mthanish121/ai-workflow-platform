export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.code === '23505') {
    return res.status(409).json({ message: 'Resource already exists' });
  }

  if (err.code === '23503') {
    return res.status(400).json({ message: 'Referenced resource not found' });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
