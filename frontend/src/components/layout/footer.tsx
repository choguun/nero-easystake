import Link from "next/link";
import { Twitter, Github, Linkedin } from "lucide-react"; // Using placeholder icons

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="py-6 md:py-8 w-full border-t border-border/40 bg-background px-10"
      data-oid="aencxz."
    >
      <div
        className="container flex flex-col items-center justify-between gap-4 md:flex-row"
        data-oid=":s9vr94"
      >
        <p className="text-sm text-muted-foreground" data-oid="9_rj4l2">
          &copy; {currentYear} EasyStake. All rights reserved.
        </p>
        <div className="flex items-center gap-4" data-oid="x.wu4m0">
          <Link
            href="https://twitter.com/neroeasystake"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            className="text-muted-foreground hover:text-foreground transition-colors"
            data-oid="1_.z_fu"
          >
            <Twitter className="h-5 w-5" data-oid="5a_zvyf" />
          </Link>
          <Link
            href="https://github.com/neroeasystake"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-muted-foreground hover:text-foreground transition-colors"
            data-oid="wdxrgks"
          >
            <Github className="h-5 w-5" data-oid="z7_p685" />
          </Link>
          <Link
            href="https://linkedin.com/company/neroeasystake"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="text-muted-foreground hover:text-foreground transition-colors"
            data-oid="hpn6u5j"
          >
            <Linkedin className="h-5 w-5" data-oid=":qa6b8h" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
