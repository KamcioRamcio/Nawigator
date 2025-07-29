export function errorHandler(err, req, res, next) {
    console.error('Error:', err.message);
    console.error(err.stack);

    res.status(err.statusCode || 500).json({
        error: err.message || 'Internal Server Error'
    });
}