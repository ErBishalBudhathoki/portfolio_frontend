'use client';

import React, { useEffect } from 'react';
import { X, ExternalLink, Github, Layers, Calendar, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface ProjectDetailData {
  title: string;
  name?: string;
  description: string;
  date_range?: string;
  url?: string;
  repository?: string;
  live_demo?: string;
  image?: string;
  technologies?: string[];
  features?: string[];
  architecture?: string;
}

interface ProjectDetailModalProps {
  project: ProjectDetailData | null;
  onClose: () => void;
}

export default function ProjectDetailModal({ project, onClose }: ProjectDetailModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (project) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  const title = project.title || project.name || 'Project Overview';
  const repository = project.repository || (project.url?.includes('github.com') ? project.url : undefined);
  const liveDemo = project.live_demo;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-background/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden rounded-3xl border border-border/80 bg-card shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient backdrop */}
        <div className="relative p-6 sm:p-8 border-b border-border/60 bg-gradient-to-br from-primary/15 via-accent/10 to-transparent">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full border border-border/60 bg-background/80 text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary font-medium text-xs">
              Project Specification
            </Badge>
            {project.date_range && (
              <span className="inline-flex items-center text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5 mr-1 text-accent-foreground" />
                {project.date_range}
              </span>
            )}
          </div>

          <h2 id="project-modal-title" className="text-2xl sm:text-3xl font-bold text-foreground">
            {title}
          </h2>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Main Description */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-primary" />
              Executive Overview
            </h3>
            <p className="text-base text-foreground/90 leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Key Deliverables / Highlights */}
          {title.toLowerCase().includes('care') && (
            <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                Platform Capabilities
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-foreground/85">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  NDIS Line-Item Bulk Invoicing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  Shift Time & GPS Attendance
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  Client Progress Notes & Compliance
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  Cross-Platform Flutter Mobile UI
                </li>
              </ul>
            </div>
          )}

          {/* Tech Stack Pills */}
          {project.technologies && project.technologies.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Technologies & Architecture
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full text-xs font-medium border border-border/70 bg-secondary/60 text-secondary-foreground"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-border/60 bg-muted/20 flex flex-wrap items-center justify-end gap-3">
          {repository && (
            <Button asChild variant="outline" size="sm" className="rounded-full gap-2 border-border/80">
              <a href={repository} target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4" />
                View Code
              </a>
            </Button>
          )}

          {liveDemo && (
            <Button asChild size="sm" className="rounded-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
              <a href={liveDemo} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
                Live Demo / Store
              </a>
            </Button>
          )}

          <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
