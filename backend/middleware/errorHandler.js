// Express error handler: one JSON shape { error } for every failure.
export function errorHandler(err, req, res, next) {
    if (res.headersSent) return next(err);

    // e.g. deleting a medicine that is still referenced by an order, or adding an item to a missing order
    if (err.code === 'SQLITE_CONSTRAINT' && /FOREIGN KEY/.test(err.message)) {
        return res.status(409).json({error: 'Operacja narusza powiązania danych (pozycja jest używana lub nie istnieje).'});
    }
    if (err.code === 'SQLITE_CONSTRAINT' && /UNIQUE/.test(err.message)) {
        return res.status(409).json({error: 'Taki rekord już istnieje.'});
    }
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({error: 'Plik jest za duży.'});
    }

    const status = err.statusCode || err.status || 500;
    if (status >= 500) console.error(err);
    res.status(status).json({error: err.message || 'Wewnętrzny błąd serwera'});
}
