"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Wallet, Award } from "lucide-react";
import { CustomConnectButton } from "../features/connect";

export function Header() {
  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      data-oid="a:mlw00"
    >
      <div
        className="container flex h-16 max-w-screen-2xl items-center px-10"
        data-oid="9j:zd.9"
      >
        <div className="mr-4 hidden md:flex" data-oid="fx1:h60">
          <Link
            href="/"
            className="mr-6 flex items-center space-x-2"
            data-oid="4nidl-5"
          >
            {/* Placeholder for Logo - replace with actual SVG or Image */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-primary"
              data-oid="fw7.083"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" data-oid="ruli5fy" />
              <path d="M2 17l10 5 10-5" data-oid="-aox9p0" />
              <path d="M2 12l10 5 10-5" data-oid="vdqfarw" />
            </svg>
            <span className="font-bold text-primary" data-oid="1s4mmm1">
              EasyStake
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm" data-oid="f6qg2_b">
            <Link
              href="/"
              className="transition-colors hover:text-foreground/80 text-foreground/60 cursor-pointer"
              data-oid="ava4bg7"
            >
              Home
            </Link>
            <Link
              href="/stake"
              className="transition-colors hover:text-foreground/80 text-foreground/60 font-medium cursor-pointer"
              data-oid="m..a_fy"
            >
              Stake
            </Link>
            <Link
              href="/swap"
              className="transition-colors hover:text-foreground/80 text-foreground/60 font-medium cursor-pointer"
              data-oid="qyfzj92"
            >
              Swap
            </Link>
            <Link
              href="/liquidity"
              className="transition-colors hover:text-foreground/80 text-foreground/60 font-medium cursor-pointer"
              data-oid="ggij5vd"
            >
              Liquidity
            </Link>
            <Link
              href="/rewards"
              className="transition-colors hover:text-foreground/80 text-foreground/60 font-medium flex items-center gap-1 cursor-pointer"
              data-oid="ud:_rtk"
            >
              <Award className="h-4 w-4" data-oid="1rshmqe" /> Rewards
            </Link>
            <Link
              href="/leaderboard"
              className="transition-colors hover:text-foreground/80 text-foreground/60 font-medium cursor-pointer"
              data-oid="ko0x.rk"
            >
              Leaderboard
            </Link>
          </nav>
        </div>
        {/* Mobile Menu */}
        <Sheet data-oid="akeebp:">
          <SheetTrigger asChild data-oid="7c3y:-:">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden mr-2"
              data-oid="sgkklwa"
            >
              <Menu className="h-5 w-5" data-oid="pnqhuj7" />
              <span className="sr-only" data-oid="wpio7_3">
                Toggle Menu
              </span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0 pt-12" data-oid="fxrj3yf">
            <Link
              href="/"
              className="flex items-center space-x-2 mb-8 px-4"
              data-oid="h_ahodm"
            >
              {/* Placeholder for Logo */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary"
                data-oid="lx8v_.0"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" data-oid="g33vmb_" />
                <path d="M2 17l10 5 10-5" data-oid="c3mf2fh" />
                <path d="M2 12l10 5 10-5" data-oid="3deue2x" />
              </svg>
              <span className="font-bold text-primary" data-oid="f:thtlp">
                EasyStake
              </span>
            </Link>
            <nav className="flex flex-col gap-4 px-4" data-oid="dhy-lm9">
              {/* <Link
                      href="/#features"
                      className="transition-colors hover:text-foreground text-foreground/80 py-2"
                      >
                      Features
                      </Link> */}
              <Link
                href="/"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
                data-oid="oj138tj"
              >
                Home
              </Link>
              <Link
                href="/stake"
                className="transition-colors hover:text-foreground text-foreground/80 py-2 font-medium" // Highlight Stake link
                data-oid="vlp1-w-"
              >
                Stake
              </Link>
              <Link
                href="/swap"
                className="transition-colors hover:text-foreground/80 text-foreground/60 font-medium cursor-pointer"
                data-oid="0n2-czl"
              >
                Swap
              </Link>
              <Link
                href="/liquidity"
                className="transition-colors hover:text-foreground/80 text-foreground/60 font-medium cursor-pointer"
                data-oid=".szsp7e"
              >
                Liquidity
              </Link>
              <Link
                href="/rewards"
                className="transition-colors hover:text-foreground/80 text-foreground/60 font-medium flex items-center gap-1 cursor-pointer"
                data-oid="0ezzr_4"
              >
                <Award className="h-4 w-4" data-oid="xrj-82." /> Rewards
              </Link>
              <Link
                href="/leaderboard"
                className="transition-colors hover:text-foreground/80 text-foreground/60 font-medium cursor-pointer"
                data-oid="ffgk0bk"
              >
                Leaderboard
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
        <div
          className="flex flex-1 items-center justify-start md:hidden"
          data-oid="cv:fr30"
        >
          <Link
            href="/"
            className="flex items-center space-x-2"
            data-oid="71_mg:0"
          >
            {/* Placeholder for Logo */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-primary"
              data-oid="-4fym7s"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" data-oid="qdxi33y" />
              <path d="M2 17l10 5 10-5" data-oid="bqztq-6" />
              <path d="M2 12l10 5 10-5" data-oid="lo-gek5" />
            </svg>
            <span className="font-bold text-primary" data-oid="itsbvbg">
              EasyStake
            </span>
          </Link>
        </div>

        {/* <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                 <Wallet className="mr-2 h-4 w-4" /> Connect Wallet
                </Button> */}
        <CustomConnectButton mode={"button"} data-oid="emh_ws." />
      </div>
    </header>
  );
}
