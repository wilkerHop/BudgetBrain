import HomePage from '@/components/home-page';

// Allow streaming responses up to 60 seconds (Vercel limit)
export const maxDuration = 60;

export default function Page() {
  return <HomePage />;
}
