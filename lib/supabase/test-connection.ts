import { createClient } from './client';

export async function testSupabaseConnection() {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase.auth.getSession();
    console.log('Connection test result:', { data, error });
    return { success: !error, data, error };
  } catch (err) {
    console.error('Connection test error:', err);
    return { success: false, error: err };
  }
}
