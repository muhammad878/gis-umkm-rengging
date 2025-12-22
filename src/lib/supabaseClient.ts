
import { createClient } from '@supabase/supabase-js';

// Get environment variables
const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Validate URL format - must be a valid HTTP/HTTPS URL
const isValidUrl = (url: string) => {
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
};

// Use valid dummy URL if not configured properly
const supabaseUrl = isValidUrl(envUrl) ? envUrl : 'https://demo.supabase.co';
const supabaseAnonKey = envKey && envKey !== 'your_supabase_anon_key'
    ? envKey
    : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlbW8iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MTc2OTIwMCwiZXhwIjoxOTU3MzQ1MjAwfQ.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
