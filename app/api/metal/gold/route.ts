import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth/server';

const OUNCE_TO_GRAM = 31.1034768;

export async function GET() {
  const supabase = createServerClient();
  try {
    const user = await getUser();
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single();
    if (profile?.plan !== 'PRO') {
      return NextResponse.json(
        { error: 'Forbidden (PRO required)' },
        { status: 403 }
      );
    }

    const key = process.env.METALPRICE_API_KEY;
    if (!key) {
      return NextResponse.json(
        { error: 'Missing METALPRICE_API_KEY' },
        { status: 500 }
      );
    }

    const url = new URL('https://api.metalpriceapi.com/v1/latest');
    url.searchParams.set('api_key', key);
    url.searchParams.set('base', 'IDR');
    url.searchParams.set('currencies', 'XAU');

    const upstream = await fetch(url.toString(), { cache: 'no-store' });
    if (!upstream.ok) {
      return NextResponse.json(
        { error: 'Upstream error' },
        { status: 502 }
      );
    }

    const data = await upstream.json();
    const idrPerOunce = data?.rates?.IDRXAU;
    if (typeof idrPerOunce !== 'number') {
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 502 }
      );
    }

    const idrPerGram = idrPerOunce / OUNCE_TO_GRAM;
    const tsJakarta = new Date((data.timestamp ?? Date.now() / 1000) * 1000)
      .toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

    return NextResponse.json(
      {
        source: 'metalpriceapi',
        idrPerOunce,
        idrPerGram,
        timestamp: data.timestamp,
        tsJakarta,
      },
      { headers: { 'Cache-Control': 'private, max-age=600' } }
    );
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 401 }
    );
  }
}
