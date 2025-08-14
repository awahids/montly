import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t py-6 text-sm">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 md:flex-row md:justify-between">
        <div className="flex gap-4">
          <Link href="#">Privacy</Link>
          <Link href="#">Terms</Link>
          <Link href="#">Contact</Link>
          <Link href="#">Status</Link>
        </div>
        <p className="text-muted-foreground">© {new Date().getFullYear()} Monli</p>
      </div>
    </footer>
  );
}
