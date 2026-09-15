import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://focmwcxmbilodzaklxpt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvY213Y3htYmlsb2R6YWtseHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0NDUwMTIsImV4cCI6MjEwNTAyMTAxMn0.rwDmxlly5uL8t4bOUkfJItlMBypIAuiQgWOhqouondM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ---- Auth helpers ----

export async function signUp(name: string, email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error) throw new Error(error.message);

  // Create the user's cart right away so it's ready when they shop
  if (data.user) {
    await supabase.from('carts').insert({ user_id: data.user.id });
  }
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function isLoggedIn(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

// ---- Books ----

export async function getBooks() {
  const { data, error } = await supabase.from('books').select('*').order('id');
  if (error) throw new Error(error.message);
  return data;
}

// ---- Cart ----

async function getOrCreateCartId(userId: string) {
  let { data: cart } = await supabase.from('carts').select('id').eq('user_id', userId).single();
  if (!cart) {
    const { data: newCart, error } = await supabase
      .from('carts')
      .insert({ user_id: userId })
      .select('id')
      .single();
    if (error) throw new Error(error.message);
    cart = newCart;
  }
  return cart.id;
}

export async function getCart() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not logged in');

  const cartId = await getOrCreateCartId(user.id);

  const { data, error } = await supabase
    .from('cart_items')
    .select('id, quantity, book_id, books(id, title, author, price, image)')
    .eq('cart_id', cartId);

  if (error) throw new Error(error.message);

  const items = (data || []).map((row: any) => ({
    cart_item_id: row.id,
    quantity: row.quantity,
    book_id: row.books.id,
    title: row.books.title,
    author: row.books.author,
    price: row.books.price,
    image: row.books.image,
  }));

  const subtotal = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  return { items, subtotal: Number(subtotal.toFixed(2)) };
}

export async function addToCart(bookId: number, quantity = 1) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not logged in');

  const cartId = await getOrCreateCartId(user.id);

  // Check if this book is already in the cart, to bump quantity instead of duplicating
  const { data: existing } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('cart_id', cartId)
    .eq('book_id', bookId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: existing.quantity + quantity })
      .eq('id', existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from('cart_items')
      .insert({ cart_id: cartId, book_id: bookId, quantity });
    if (error) throw new Error(error.message);
  }
}

export async function updateCartItem(cartItemId: number, quantity: number) {
  const { error } = await supabase.from('cart_items').update({ quantity }).eq('id', cartItemId);
  if (error) throw new Error(error.message);
}

export async function removeCartItem(cartItemId: number) {
  const { error } = await supabase.from('cart_items').delete().eq('id', cartItemId);
  if (error) throw new Error(error.message);
}

// ---- Checkout ----

export async function checkout() {
  const { data, error } = await supabase.rpc('checkout');
  if (error) throw new Error(error.message);
  return data;
}
