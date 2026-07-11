import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const authService = {
  async register(name: string, email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Registration failed');
    }
    return res.json();
  },

  async login(email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Login failed');
    }
    const data = await res.json();
    Cookies.set('token', data.access_token, { expires: 1 });
    const user = await this.getCurrentUser();
    if (user) {
      localStorage.setItem('finvise_user_id', String(user.id));
    }
    return data;
  },

  logout() {
    Cookies.remove('token');
    localStorage.removeItem('finvise_user_id');
  },

  isAuthenticated() {
    return !!Cookies.get('token');
  },

  async getCurrentUser() {
    const token = Cookies.get('token');
    if (!token) return null;

    try {
      const res = await fetch(`${API_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        Cookies.remove('token');
        localStorage.removeItem('finvise_user_id');
        return null;
      }
      const user = await res.json();
      localStorage.setItem('finvise_user_id', String(user.id));
      return user;
    } catch {
      return null;
    }
  },

  async updateUser(data: { name?: string }) {
    const token = Cookies.get('token');
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${API_URL}/users/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to update user profile');
    }
    
    return res.json();
  }
};
