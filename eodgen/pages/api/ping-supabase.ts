import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '@/lib/supabase';

export const runtime = 'edge';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Debug logging for environment variables
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY length:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length);
  try {
    // Ping Supabase to fetch a single client record
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('clients')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Supabase query error:', error);
      return res.status(500).json({ error });
    }

    return res.status(200).json({ data });
  } catch (err) {
    console.error('Handler exception:', err);
    return res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
}
