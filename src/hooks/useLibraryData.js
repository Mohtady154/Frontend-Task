// src/hooks/useLibraryData.js
import { useEffect, useState, useMemo } from 'react';
import { getApiUrl } from '../config';

const useLibraryData = ({ storeId = null, searchTerm = '' } = {}) => {
  // State for data
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [stores, setStores] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        let inventoryUrl = getApiUrl('inventory');
        if (storeId) {
          inventoryUrl += `?store_id=${storeId}`;
        }

        console.log('Fetching Inventory URL:', inventoryUrl);

        const [storesRes, booksRes, authorsRes, inventoryRes] = await Promise.all([
          fetch(getApiUrl('stores')),
          fetch(getApiUrl('books')),
          fetch(getApiUrl('authors')),
          fetch(inventoryUrl)
        ]);

        const storesData = await storesRes.json();
        const booksData = await booksRes.json();
        const authorsData = await authorsRes.json();
        const inventoryData = await inventoryRes.json();

        setStores(Array.isArray(storesData) ? storesData : [storesData]);
        setBooks(Array.isArray(booksData) ? booksData : [booksData]);
        setAuthors(Array.isArray(authorsData) ? authorsData : [authorsData]);

        console.log('Fetched Inventory Data:', inventoryData);
        if (Array.isArray(inventoryData) && inventoryData.length === 0) {
          console.warn('No inventory found for this store (length is 0).');
          setInventory([]);
        } else {
          setInventory(Array.isArray(inventoryData) ? inventoryData : [inventoryData]);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [storeId]);

  // Create lookup maps
  const authorMap = useMemo(() => {
    return authors.reduce((map, author) => {
      map[author.id] = { ...author, name: `${author.first_name} ${author.last_name}` };
      return map;
    }, {});
  }, [authors]);

  const storeMap = useMemo(() => {
    return stores.reduce((map, store) => {
      map[store.id] = store;
      return map;
    }, {});
  }, [stores]);

  // Filter books for a specific store (for Inventory page)
  const storeBooks = useMemo(() => {
    if (!storeId) return books;

    // If we fetched specific store inventory, we might not need to filter by store_id again if the API did it,
    // but for safety (and if using static files), we keep the filter.
    const storeInventory = inventory.filter((item) => item.store_id === parseInt(storeId, 10));

    let filteredBooks = books
      .filter((book) => storeInventory.some((item) => item.book_id == book.id))
      .map((book) => {
        const inventoryItem = storeInventory.find((item) => item.book_id == book.id);
        const author = authorMap[book.author_id];
        return {
          ...book,
          price: inventoryItem ? inventoryItem.price : null,
          inventory_id: inventoryItem ? inventoryItem.id : null,
          author_name: author ? author.name : 'Unknown Author'
        };
      });

    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filteredBooks = filteredBooks.filter((book) =>
        Object.values({ ...book, author_name: authorMap[book.author_id]?.name || 'Unknown Author' })
          .some((value) => String(value).toLowerCase().includes(lowerSearch))
      );
    }

    return filteredBooks;
  }, [storeId, books, inventory, searchTerm, authorMap]);

  // Map books to their stores (for Browse page)
  const booksWithStores = useMemo(() => {
    return books.map((book) => {
      const bookInventory = inventory.filter((item) => item.book_id === book.id);
      const bookStores = bookInventory.map((item) => ({
        name: storeMap[item.store_id]?.name || 'Unknown Store',
        price: item.price,
      }));

      return {
        title: book.name,
        author: authorMap[book.author_id]?.name || 'Unknown Author',
        stores: bookStores,
      };
    });
  }, [books, inventory, authorMap, storeMap]);

  return {
    books,
    setBooks,
    authors,
    stores,
    inventory,
    setInventory,
    authorMap,
    storeMap,
    storeBooks,
    booksWithStores,
    isLoading,
    currentStore: stores.find((store) => store.id === parseInt(storeId, 10)),
  };
};

export default useLibraryData;