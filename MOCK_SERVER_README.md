# Mock Server Setup

## Files

### `db.json`
This is the main database file used by `json-server`. It contains all the data for:
- **stores**: 50 store records
- **books**: 1000 book records  
- **authors**: 20 author records
- **inventory**: Store inventory linking books to stores with prices

This file is used when running `npm run server`.

### `public/data/` (Original Data)
The original JSON files are preserved in `public/data/`:
- `stores.json`
- `books.json`
- `authors.json`
- `inventory.json`

These files are used when the app runs in static file mode (when `VITE_USE_MOCK_SERVER=false` in `.env`).

### `mock-server.cjs` (Legacy)
The old mock server configuration file that dynamically loaded data from `public/data/`. This is no longer used but kept for reference.

## Usage

### Running the Mock Server
```bash
npm run server
```

This starts json-server on `http://localhost:3000` with the following endpoints:
- `GET /stores` - Get all stores
- `GET /stores/:id` - Get a specific store
- `POST /stores` - Create a new store
- `PATCH /stores/:id` - Update a store
- `DELETE /stores/:id` - Delete a store

Same pattern applies for `/books`, `/authors`, and `/inventory`.

### Regenerating db.json
If you update the files in `public/data/`, regenerate `db.json` by running:

```bash
node -e "const fs = require('fs'); const stores = JSON.parse(fs.readFileSync('public/data/stores.json', 'utf-8')); const books = JSON.parse(fs.readFileSync('public/data/books.json', 'utf-8')); const authors = JSON.parse(fs.readFileSync('public/data/authors.json', 'utf-8')); const inventory = JSON.parse(fs.readFileSync('public/data/inventory.json', 'utf-8')); const db = { stores, books, authors, inventory }; fs.writeFileSync('db.json', JSON.stringify(db, null, 2));"
```

## Configuration

The app uses environment variables to switch between static files and the mock server:

```env
VITE_API_URL=http://localhost:3000
VITE_USE_MOCK_SERVER=true
```

- When `VITE_USE_MOCK_SERVER=true`: Uses json-server at `http://localhost:3000`
- When `VITE_USE_MOCK_SERVER=false`: Uses static JSON files from `public/data/`
