import { useState, useEffect } from 'react';
import { getBooks, addToCart as addToCartSupabase, isLoggedIn } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface Book {
  id: number;
  image: string;
  title: string;
  author: string;
  price: number;
  category: string;
}

const Shop = () => {
  const navigate = useNavigate();
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingId, setAddingId] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedPriceRange, setSelectedPriceRange] = useState('All Prices');
  const [sortBy, setSortBy] = useState('default');
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);

  // Fetch real books from the backend once, when the page loads
  useEffect(() => {
    async function loadBooks() {
      try {
        const data = await getBooks();
        const normalized = data.map((b: any) => ({ ...b, price: Number(b.price) }));
        setAllBooks(normalized);
        setFilteredBooks(normalized);
      } catch (err: any) {
        setError('Could not load books. Please try again shortly.');
      } finally {
        setLoading(false);
      }
    }
    loadBooks();
  }, []);

  const getPriceRange = (range: string) => {
    switch(range) {
      case 'Under $10': return { min: 0, max: 9.99 };
      case '$10 - $13': return { min: 10, max: 12.99 };
      case '$13 - $15': return { min: 13, max: 14.99 };
      case 'Over $15': return { min: 15, max: 999 };
      default: return { min: null, max: null };
    }
  };

  useEffect(() => {
    let filtered = allBooks.filter((book) => {
      const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            book.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All Categories' || book.category === selectedCategory;

      const { min, max } = getPriceRange(selectedPriceRange);
      const matchesPrice = min === null || (book.price >= min && book.price <= max);

      return matchesSearch && matchesCategory && matchesPrice;
    });

    if (sortBy === 'price-low') {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'title-az') {
      filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    }

    setFilteredBooks(filtered);
  }, [searchTerm, selectedCategory, selectedPriceRange, sortBy, allBooks]);

  async function handleAddToCart(bookId: number) {
    if (!(await isLoggedIn())) {
      navigate('/login');
      return;
    }

    setAddingId(bookId);
    try {
      await addToCartSupabase(bookId, 1);
    } catch (err: any) {
      console.error('Add to cart failed:', err.message);
    } finally {
      setAddingId(null);
    }
  }

  return (
    <div className="py-10 md:py-16 px-5 md:px-[8%] bg-charcoal min-h-[70vh]">
      <div className="text-center mb-10 md:mb-12">
        <h1 className="font-display italic text-3xl md:text-5xl text-cream">The Gallery of Books</h1>
        <p className="text-cream/50 text-sm mt-2">Every cover is a small piece of art</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10 bg-charcoal-light p-4 rounded-xl border border-cream/10">
        <input
          type="text"
          className="w-full md:flex-1 px-5 py-3 border border-cream/15 bg-transparent text-cream placeholder:text-cream/40 rounded-full text-sm focus:outline-none focus:border-coral transition-colors"
          placeholder="Search books..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="w-full md:w-auto px-5 py-3 border border-cream/15 rounded-full bg-charcoal-light text-cream text-sm cursor-pointer hover:border-coral focus:outline-none focus:border-coral transition-colors"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option>All Categories</option>
          <option>Fiction</option>
          <option>Classics</option>
          <option>Fantasy</option>
          <option>Mystery</option>
        </select>

        <select
          className="w-full md:w-auto px-5 py-3 border border-cream/15 rounded-full bg-charcoal-light text-cream text-sm cursor-pointer hover:border-coral focus:outline-none focus:border-coral transition-colors"
          value={selectedPriceRange}
          onChange={(e) => setSelectedPriceRange(e.target.value)}
        >
          <option>All Prices</option>
          <option>Under $10</option>
          <option>$10 - $13</option>
          <option>$13 - $15</option>
          <option>Over $15</option>
        </select>

        <select
          className="w-full md:w-auto px-5 py-3 border border-cream/15 rounded-full bg-charcoal-light text-cream text-sm cursor-pointer hover:border-coral focus:outline-none focus:border-coral transition-colors"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="default">Sort by: Default</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="title-az">Title: A to Z</option>
        </select>
      </div>

      {loading && <p className="text-center py-12 text-cream/50">Loading books...</p>}
      {error && <p className="text-center py-12 text-coral-light">{error}</p>}

      {!loading && !error && (
        <>
          <p className="my-4 text-cream/40 text-sm">Showing {filteredBooks.length} of {allBooks.length} books</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="group bg-charcoal-light rounded-xl overflow-hidden transition-all duration-300 border border-cream/10 hover:border-coral/40 hover:-translate-y-1"
              >
                <div className="h-72 overflow-hidden flex items-center justify-center p-6 bg-gradient-to-b from-cream/5 to-transparent">
                  <img
                    src={book.image}
                    alt={book.title}
                    className="max-h-full max-w-full object-contain rounded shadow-[0_20px_40px_-10px_rgba(0,0,0,0.6)] transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <h3 className="font-display text-lg px-5 pt-4 pb-1 text-cream">{book.title}</h3>
                <p className="px-5 text-cream/50 text-sm">{book.author}</p>
                <span className="block px-5 py-2 text-xl font-semibold text-coral-light">${book.price.toFixed(2)}</span>
                <button
                  onClick={() => handleAddToCart(book.id)}
                  disabled={addingId === book.id}
                  className="mx-5 mb-5 w-[calc(100%-2.5rem)] bg-coral text-cream px-4 py-2.5 rounded-full font-medium border-none cursor-pointer text-sm transition-all hover:bg-coral-dark disabled:opacity-50"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>

          {filteredBooks.length === 0 && (
            <p className="text-center py-12 text-cream/50 text-lg">No books found. Try a different search.</p>
          )}
        </>
      )}
    </div>
  );
};

export default Shop;
