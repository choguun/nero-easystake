'use client'

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Wallet } from 'lucide-react';
import { CustomConnectButton } from '../features/connect';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center px-10">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
             {/* Placeholder for Logo - replace with actual SVG or Image */}
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            <span className="font-bold text-primary">EasyStake</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Home
            </Link>
             <Link
              href="/stake"
              className="transition-colors hover:text-foreground/80 text-foreground/60 font-medium" // Highlight Stake link
            >
              Stake
            </Link>
          </nav>
        </div>
        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden mr-2"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0 pt-12">
             <Link href="/" className="flex items-center space-x-2 mb-8 px-4">
                {/* Placeholder for Logo */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                <span className="font-bold text-primary">EasyStake</span>
            </Link>
            <nav className="flex flex-col gap-4 px-4">
               {/* <Link
                href="/#features"
                className="transition-colors hover:text-foreground text-foreground/80 py-2"
              >
                Features
              </Link> */}
              <Link
              href="/"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Home
            </Link>
               <Link
                  href="/stake"
                  className="transition-colors hover:text-foreground text-foreground/80 py-2 font-medium" // Highlight Stake link
                >
                  Stake
                </Link>
               {/* <Link
                href="/#account-abstraction"
                className="transition-colors hover:text-foreground text-foreground/80 py-2"
              >
                Account Abstraction
              </Link>
              <Link
                href="/#ai-optimizer"
                className="transition-colors hover:text-foreground text-foreground/80 py-2"
              >
                AI Optimizer
              </Link>
               <Link
                href="/#dashboard"
                className="transition-colors hover:text-foreground text-foreground/80 py-2"
              >
                Dashboard
              </Link>
              <Link
                href="/#how-it-works"
                className="transition-colors hover:text-foreground text-foreground/80 py-2"
              >
                How It Works
              </Link> */}
            </nav>
          </SheetContent>
        </Sheet>
         {/* Logo for Mobile View (centered when menu is closed) */}
         <div className="flex flex-1 items-center justify-start md:hidden">
             <Link href="/" className="flex items-center space-x-2">
                {/* Placeholder for Logo */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                <span className="font-bold text-primary">EasyStake</span>
            </Link>
        </div>

          {/* <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Wallet className="mr-2 h-4 w-4" /> Connect Wallet
          </Button> */}
          <CustomConnectButton mode={'button'} />
      </div>
    </header>
  );
}
