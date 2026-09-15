import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, updateCartItem, removeCartItem, checkout, isLoggedIn } from '../../lib/supabase';

interface CartItem {
  cart_item_id: number;
  book_id: number;
  title: string;
  author: string;
  price: string | number;
  image: string;
  quantity: number;
}

const Cart = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);

  async function loadCart() {
    setLoading(true);
    try {
      const data = await getCart();
      setItems(data.items);
      setSubtotal(data.subtotal);
    } catch (err: any) {
      setError(err.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function init() {
      if (!(await isLoggedIn())) {
        navigate('/login');
        return;
      }
      loadCart();
    }
    init();
  }, []);

  async function handleQuantityChange(cartItemId: number, quantity: number) {
    if (quantity < 1) return;
    try {
      await updateCartItem(cartItemId, quantity);
      loadCart();
    } catch (err: any) {
      alert(err.message || 'Failed to update quantity');
    }
  }

  async function handleRemove(cartItemId: number) {
    try {
      await removeCartItem(cartItemId);
      loadCart();
    } catch (err: any) {
      alert(err.message || 'Failed to remove item');
    }
  }

  async function handleCheckout() {
    setPlacingOrder(true);
    try {
      await checkout();
      alert('Order placed successfully!');
      loadCart();
    } catch (err: any) {
      alert(err.message || 'Checkout failed');
    } finally {
      setPlacingOrder(false);
    }
  }

  if (loading) {
    return (
      <div className="py-8 md:py-16 px-5 md:px-[8%] bg-cream min-h-[70vh]">
        <p className="text-center text-ink/50">Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="py-8 md:py-16 px-5 md:px-[8%] bg-cream min-h-[70vh]">
      <h1 className="text-center font-display italic text-ink text-3xl md:text-4xl mb-2">Shopping Cart</h1>
      <p className="text-center text-ink/50 mb-10">Manage your items</p>

      {error && <p className="text-center text-coral-dark mb-6">{error}</p>}

      {items.length === 0 && !error ? (
        <p className="text-center text-ink/50 text-lg">
          Your cart is empty. <a href="/shop" className="text-coral hover:underline">Go shopping</a>.
        </p>
      ) : (
        <>
          <div className="bg-white rounded-xl overflow-x-auto border border-ink/5">
            <table className="w-full border-collapse min-w-150">
              <thead>
                <tr className="bg-charcoal text-cream">
                  <th className="p-4 text-left font-medium font-display">Book</th>
                  <th className="p-4 text-left font-medium font-display">Price</th>
                  <th className="p-4 text-left font-medium font-display">Quantity</th>
                  <th className="p-4 text-left font-medium font-display">Total</th>
                  <th className="p-4 text-left font-medium font-display">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const price = Number(item.price);
                  return (
                    <tr key={item.cart_item_id} className="border-b border-ink/5 hover:bg-cream/60 transition-colors">
                      <td className="p-5 align-middle">
                        <div className="flex items-center gap-4">
                          <img src={item.image} alt={item.title} className="w-15 h-20 object-cover rounded-lg shadow-sm" />
                          <div className="cart-info">
                            <h4 className="font-display text-ink mb-1">{item.title}</h4>
                            <p className="text-ink/50 text-sm">{item.author}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 align-middle text-ink font-medium">${price.toFixed(2)}</td>
                      <td className="p-5 align-middle">
                        <input
                          type="number"
                          className="w-16.25 p-2 border border-ink/15 bg-transparent text-ink rounded-lg text-center focus:outline-none focus:border-coral"
                          value={item.quantity}
                          min="1"
                          onChange={(e) => handleQuantityChange(item.cart_item_id, Number(e.target.value))}
                        />
                      </td>
                      <td className="p-5 align-middle font-semibold text-ink">${(price * item.quantity).toFixed(2)}</td>
                      <td className="p-5 align-middle">
                        <button
                          onClick={() => handleRemove(item.cart_item_id)}
                          className="bg-transparent border-none text-xl cursor-pointer text-ink/30 transition-colors hover:text-coral-dark"
                          type="button"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-7.5 mt-8 flex-wrap">
            <div className="bg-white p-6 rounded-xl min-w-70 border border-ink/5">
              <h3 className="font-display text-ink mb-5 pb-2 border-b-2 border-ink/10">Order Summary</h3>
              <div className="flex justify-between py-2 text-ink/70">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 text-ink/70">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <div className="h-px bg-ink/10 my-2"></div>
              <div className="flex justify-between py-2 text-xl font-semibold text-ink">
                <span>Total:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={placingOrder}
                className="w-full mt-4 mb-2 bg-coral border-none cursor-pointer text-cream py-3 rounded-full font-medium hover:bg-coral-dark transition-colors disabled:opacity-50"
                type="button"
              >
                {placingOrder ? 'Placing order...' : 'Proceed to Checkout'}
              </button>
              <a href="/shop" className="block text-center text-ink/50 no-underline text-sm hover:text-coral transition-colors">
                Continue Shopping
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
