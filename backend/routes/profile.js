import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../supabaseClient.js';

export const profileRoutes = (app) => {
  // GET current user profile
  app.get('/api/profile/me', requireAuth, async (req, res) => {
    const userId = req.user.id;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
           // Not found
           return res.status(404).json({ error: 'Profile not found' });
        }
        return res.status(500).json({ error: error.message });
      }

      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // GET user profile by username
  app.get('/api/profile/:username', async (req, res) => {
    const { username } = req.params;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
           return res.status(404).json({ error: 'Profile not found' });
        }
        return res.status(500).json({ error: error.message });
      }

      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // PUT update or create current user profile
  app.put('/api/profile', requireAuth, async (req, res) => {
    const userId = req.user.id;
    const updates = req.body;

    try {
      // Basic validation and sanitization could go here
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: userId, ...updates, updated_at: new Date() })
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });
};
