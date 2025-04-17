import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '@/lib/supabase';

export const runtime = 'edge';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Ping Supabase to fetch a single client record
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('clients')
    .select('id')
    .limit(1);

  if (error) {
    return res.status(500).json({ error });
  }

  return res.status(200).json({ data });
}
