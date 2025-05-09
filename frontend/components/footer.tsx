"use client";

import Link from "next/link";
import { Github, Linkedin, Mail, ExternalLink } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/BishalBudhathoki";
  const linkedinUrl = process.env.NEXT_PUBLIC_LINKEDIN_URL || "https://www.linkedin.com/in/bishalbudhathoki/";
  const twitterUrl = process.env.NEXT_PUBLIC_TWITTER_URL || "https://x.com/bis2vis?s=21";

  return (
    <footer className="bg-card border-t border-border py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold mb-4 text-foreground">
              <span className="text-accent-foreground">Bishal</span> Budhathoki
            </h3>
            <p className="text-muted-foreground max-w-md leading-relaxed">
              A passionate developer focused on creating intuitive and efficient
              solutions. Connect with me to discuss potential collaborations or
              opportunities.
            </p>
            <div className="mt-6 flex space-x-4">
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-muted text-muted-foreground hover:text-accent-foreground p-3 rounded-lg transition-colors border border-border hover:border-primary/50"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-muted text-muted-foreground hover:text-accent-foreground p-3 rounded-lg transition-colors border border-border hover:border-primary/50"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="mailto:contact@bishalbudhathoki.com"
                className="bg-muted text-muted-foreground hover:text-accent-foreground p-3 rounded-lg transition-colors border border-border hover:border-primary/50"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-5 text-foreground">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-accent-foreground transition-colors flex items-center"
                >
                  <span className="text-accent-foreground mr-2">›</span> Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-accent-foreground transition-colors flex items-center"
                >
                  <span className="text-accent-foreground mr-2">›</span> About
                </Link>
              </li>
              <li>
                <Link
                  href="/projects"
                  className="text-muted-foreground hover:text-accent-foreground transition-colors flex items-center"
                >
                  <span className="text-accent-foreground mr-2">›</span> Projects
                </Link>
              </li>
              <li>
                <Link
                  href="/skills"
                  className="text-muted-foreground hover:text-accent-foreground transition-colors flex items-center"
                >
                  <span className="text-accent-foreground mr-2">›</span> Skills
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-muted-foreground hover:text-accent-foreground transition-colors flex items-center"
                >
                  <span className="text-accent-foreground mr-2">›</span> Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-5 text-foreground">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <Mail className="mt-1 mr-3 h-5 w-5 text-accent-foreground" />
              <a
                  href="mailto:contact@bishalbudhathoki.com"
                  className="text-muted-foreground hover:text-accent-foreground transition-colors"
                >
                  contact@bishalbudhathoki.com
                </a>
              </li>
              <li className="flex items-start">
                <ExternalLink className="mt-1 mr-3 h-5 w-5 text-accent-foreground" />
              <a
                  href="https://bishalbudhathoki.com"
                target="_blank"
                rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-accent-foreground transition-colors"
                >
                  www.bishalbudhathoki.com
                </a>
              </li>
            </ul>
            <div className="mt-6">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors shadow-md"
              >
                Get In Touch
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground/70">
          <p>
            &copy; {currentYear} <span className="text-accent-foreground">Bishal Budhathoki</span>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 