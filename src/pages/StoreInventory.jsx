import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Loading from './Loading';
import Table from '../components/Table/Table';
import Modal from '../components/Modal';
import TableActions from '../components/ActionButton/TableActions';
import useLibraryData from '../hooks/useLibraryData';
import { getApiUrl } from '../config';

const StoreInventory = () => {
    const { storeId } = useParams();
    const [searchParams] = useSearchParams();
    const searchTerm = searchParams.get('search') || '';
    const { storeBooks, isLoading, currentStore, setInventory, inventory, books } = useLibraryData({ storeId, searchTerm });

    const [editingRowId, setEditingRowId] = useState(null);
    const [editPrice, setEditPrice] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedBookId, setSelectedBookId] = useState('');
    const [newBookPrice, setNewBookPrice] = useState('');
    const [bookSearch, setBookSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Get books that are not already in this store's inventory
    const availableBooks = useMemo(() => {
        const inventoryBookIds = storeBooks.map(book => book.id);
        return books.filter(book => !inventoryBookIds.includes(book.id));
    }, [books, storeBooks]);

    // Filter available books by search term and limit to 7
    const filteredAvailableBooks = useMemo(() => {
        let filtered = availableBooks;

        if (bookSearch.trim()) {
            const searchLower = bookSearch.toLowerCase();
            filtered = filtered.filter(book =>
                book.name.toLowerCase().includes(searchLower)
            );
        }

        // Limit to 7 books
        return filtered.slice(0, 7);
    }, [availableBooks, bookSearch]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const columns = useMemo(
        () => [
            { header: 'Book Id', accessorKey: 'id' },
            { header: 'Name', accessorKey: 'name' },
            { header: 'Pages', accessorKey: 'page_count' },
            { header: 'Author', accessorKey: 'author_name' },
            {
                header: 'Price',
                accessorKey: 'price',
                cell: ({ row }) =>
                    editingRowId === row.original.id ? (
                        <input
                            type="number"
                            step="0.01"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSave(row.original);
                                if (e.key === 'Escape') handleCancel();
                            }}
                            className="border border-gray-300 rounded p-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                        />
                    ) : (
                        `$${row.original.price}`
                    ),
            },
            {
                header: 'Actions',
                id: 'actions',
                cell: ({ row }) => (
                    <TableActions
                        row={row}
                        onEdit={
                            editingRowId === row.original.id
                                ? handleCancel
                                : () => handleEdit(row.original)
                        }
                        onDelete={() => handleDelete(row.original)}
                    />
                ),
            },
        ],
        [editingRowId, editPrice]
    );

    const handleEdit = (book) => {
        setEditingRowId(book.id);
        setEditPrice(book.price);
    };

    const handleCancel = () => {
        setEditingRowId(null);
        setEditPrice('');
    };

    const handleSave = (book) => {
        const newPrice = parseFloat(editPrice);
        if (isNaN(newPrice)) {
            alert('Please enter a valid price');
            return;
        }

        const inventoryId = book.inventory_id;
        if (!inventoryId) return;

        // Optimistic update
        const updatedInventory = inventory.map((item) =>
            item.id === inventoryId ? { ...item, price: newPrice } : item
        );
        setInventory(updatedInventory);

        fetch(getApiUrl(`inventory/${inventoryId}`), {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ price: newPrice }),
        })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to update price');
                return res.json();
            })
            .catch((err) => {
                console.error(err);
                alert('Failed to update price');
            });

        setEditingRowId(null);
        setEditPrice('');
    };

    const handleDelete = (book) => {
        if (window.confirm(`Are you sure you want to remove "${book.name}" from this store?`)) {
            const inventoryId = book.inventory_id;
            if (!inventoryId) return;

            // Optimistic update
            const updatedInventory = inventory.filter((item) => item.id !== inventoryId);
            setInventory(updatedInventory);

            fetch(getApiUrl(`inventory/${inventoryId}`), {
                method: 'DELETE',
            })
                .then((res) => {
                    if (!res.ok) throw new Error('Failed to delete item');
                })
                .catch((err) => {
                    console.error(err);
                    alert('Failed to delete item');
                });
        }
    };

    const handleAddBook = async () => {
        if (!selectedBookId || !newBookPrice) {
            alert('Please select a book and enter a price');
            return;
        }

        const price = parseFloat(newBookPrice);
        if (isNaN(price) || price <= 0) {
            alert('Please enter a valid price');
            return;
        }

        const newInventoryItem = {
            book_id: parseInt(selectedBookId, 10),
            store_id: parseInt(storeId, 10),
            price: price
        };

        // Optimistic update with temporary ID
        const tempId = Date.now();
        const optimisticItem = { ...newInventoryItem, id: tempId };
        setInventory([...inventory, optimisticItem]);

        try {
            const response = await fetch(getApiUrl('inventory'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newInventoryItem)
            });

            if (!response.ok) throw new Error('Failed to add book');

            const createdItem = await response.json();
            // Replace temp item with real one
            setInventory(prev =>
                prev.map(item => item.id === tempId ? createdItem : item)
            );

            // Close modal and reset form
            setShowModal(false);
            setSelectedBookId('');
            setNewBookPrice('');
            setBookSearch('');
            setShowDropdown(false);
        } catch (error) {
            console.error(error);
            // Revert on failure
            setInventory(prev => prev.filter(item => item.id !== tempId));
            alert('Failed to add book to inventory');
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedBookId('');
        setNewBookPrice('');
        setBookSearch('');
        setShowDropdown(false);
    };

    if (isLoading) return <Loading />;

    return (
        <div className="py-6">
            <Header
                title={`Inventory: ${currentStore?.name || 'Store'}`}
                addNew={() => setShowModal(true)}
                buttonTitle="Add Book"
            />
            {storeBooks.length > 0 ? (
                <Table data={storeBooks} columns={columns} />
            ) : (
                <p className="text-gray-600 text-center mt-4">No books found in this store.</p>
            )}

            <Modal
                show={showModal}
                setShow={setShowModal}
                title="Add Book to Inventory"
                save={handleAddBook}
                cancel={handleCloseModal}
            >
                <div className="space-y-4 w-full">
                    <div className="relative" ref={dropdownRef}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Search and Select Book
                        </label>
                        <input
                            type="text"
                            value={bookSearch}
                            onChange={(e) => setBookSearch(e.target.value)}
                            onFocus={() => setShowDropdown(true)}
                            placeholder="Type to search books..."
                            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {showDropdown && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
                                {filteredAvailableBooks.length > 0 ? (
                                    <>
                                        {filteredAvailableBooks.map((book) => (
                                            <div
                                                key={book.id}
                                                onClick={() => {
                                                    setSelectedBookId(book.id.toString());
                                                    setBookSearch(book.name);
                                                    setShowDropdown(false);
                                                }}
                                                className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                            >
                                                <div className="font-medium text-gray-900">{book.name}</div>
                                                <div className="text-sm text-gray-500">ID: {book.id}</div>
                                            </div>
                                        ))}
                                        {filteredAvailableBooks.length < availableBooks.length && (
                                            <div className="px-3 py-2 text-sm text-gray-500 bg-gray-50 text-center">
                                                Showing {filteredAvailableBooks.length} of {availableBooks.length} books
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="px-3 py-2 text-sm text-gray-500 text-center">
                                        {bookSearch ? `No books found matching "${bookSearch}"` : 'No available books'}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Price ($)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={newBookPrice}
                            onChange={(e) => setNewBookPrice(e.target.value)}
                            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter price"
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default StoreInventory;