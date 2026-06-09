// ============================================================
// WASTE2WEALTH HUB — Supabase Auth & Data Integration
// ============================================================

const SUPABASE_URL = 'https://snyyduwdwkpqkkneygse.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNueXlkdXdkd2twcWtrbmV5Z3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMTgyNzYsImV4cCI6MjA5NjU5NDI3Nn0.bbIssbYjby7w6L_zIcFeRzrYixExZmQwXyaQBf8VbF4';

let _supabaseClient = null;

function getSupabase() {
  if (!_supabaseClient) {
    if (typeof supabase === 'undefined') {
      console.warn('Supabase CDN not loaded. Configure SUPABASE_URL and SUPABASE_ANON_KEY.');
      return null;
    }
    _supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _supabaseClient;
}

// ── Auth Service ──────────────────────────────────────────
const SupabaseAuth = {
  async signUp({ firstName, lastName, email, password, phone, role, country, state, businessName }) {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase not configured. Please set up your project credentials.');
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: {
        data: { firstName, lastName, phone, role, country, state, businessName }
      }
    });
    if (error) throw error;
    if (data.user) {
      await sb.from('profiles').upsert({
        id: data.user.id,
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone || null,
        role: role || 'buyer',
        country: country || null,
        state: state || null,
        business_name: businessName || null,
        created_at: new Date().toISOString(),
      });
    }
    return data;
  },

  async signIn({ email, password }) {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase not configured.');
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();
    window.location.href = 'index.html';
  },

  async getSession() {
    const sb = getSupabase();
    if (!sb) return null;
    const { data: { session } } = await sb.auth.getSession();
    return session;
  },

  async requireAuth(redirectTo = 'login.html') {
    const session = await this.getSession();
    if (!session) { window.location.href = redirectTo; return null; }
    return session;
  },

  async getCurrentUser() {
    const sb = getSupabase();
    if (!sb) return null;
    const { data: { user } } = await sb.auth.getUser();
    return user;
  },

  async updatePassword(newPassword) {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase not configured.');
    const { error } = await sb.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },

  async resetPassword(email) {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase not configured.');
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/login.html'
    });
    if (error) throw error;
  }
};

// ── KYC Service ───────────────────────────────────────────
const KYCService = {
  async save(payload) {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase not configured.');
    const { data: { user } } = await sb.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { error } = await sb.from('kyc_profiles').upsert({
      user_id: user.id, ...payload, updated_at: new Date().toISOString()
    });
    if (error) throw error;
  },

  async getMine() {
    const sb = getSupabase();
    if (!sb) return null;
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return null;
    const { data } = await sb.from('kyc_profiles').select('*').eq('user_id', user.id).single();
    return data;
  },

  async uploadFile(file, folder) {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase not configured.');
    const ext  = file.name.split('.').pop();
    const path = `${folder}/${generateId()}.${ext}`;
    const { error } = await sb.storage.from('kyc-documents').upload(path, file);
    if (error) throw error;
    const { data: { publicUrl } } = sb.storage.from('kyc-documents').getPublicUrl(path);
    return publicUrl;
  }
};

// ── Listing Service ───────────────────────────────────────
const ListingService = {
  async create(listing) {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase not configured.');
    const { data: { user } } = await sb.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await sb.from('waste_listings').insert({
      ...listing, seller_id: user.id, created_at: new Date().toISOString()
    }).select().single();
    if (error) throw error;
    return data;
  },

  async getAll({ zone, category, country, state } = {}) {
    const sb = getSupabase();
    if (!sb) return [];
    let query = sb.from('waste_listings').select('*').eq('status', 'active');
    if (zone)     query = query.eq('zone', zone);
    if (category) query = query.eq('category', category);
    if (country)  query = query.eq('country', country);
    if (state)    query = query.eq('state', state);
    const { data } = await query.order('created_at', { ascending: false }).limit(50);
    return data || [];
  },

  async getMine() {
    const sb = getSupabase();
    if (!sb) return [];
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return [];
    const { data } = await sb.from('waste_listings').select('*').eq('seller_id', user.id)
      .order('created_at', { ascending: false });
    return data || [];
  }
};
