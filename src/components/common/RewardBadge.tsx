import React from 'react';
import {
  Award,
  BookOpen,
  CircleDot,
  Compass,
  Flame,
  Flower2,
  Gem,
  HandHeart,
  Heart,
  Lightbulb,
  Mountain,
  Search,
  Shield,
  Star,
  Tag,
} from 'lucide-react';
import { Reward } from '../../types';

type RewardTemplate = Reward['template'];

interface Props {
  template: RewardTemplate;
  size?: 'sm' | 'md' | 'lg';
  muted?: boolean;
  className?: string;
}

const SIZE = {
  sm: { box: 'w-12 h-12', icon: 'w-6 h-6', inner: 'w-9 h-9' },
  md: { box: 'w-16 h-16', icon: 'w-8 h-8', inner: 'w-12 h-12' },
  lg: { box: 'w-28 h-28 sm:w-32 sm:h-32', icon: 'w-14 h-14 sm:w-16 sm:h-16', inner: 'w-20 h-20 sm:w-24 sm:h-24' },
} as const;

type BadgeConfig = {
  from: string;
  to: string;
  metal: string;
  inner: string;
  shape: 'round' | 'shield' | 'hex' | 'diamond' | 'oval' | 'soft';
};

const CONFIG: Record<RewardTemplate, BadgeConfig> = {
  discovery_compass: { from: '#0ea5e9', to: '#0f766e', metal: '#fbbf24', inner: '#082f49', shape: 'round' },
  scholar_scroll: { from: '#f7e7c6', to: '#c08457', metal: '#8b5e34', inner: '#5b341b', shape: 'soft' },
  heritage_lantern: { from: '#ef4444', to: '#991b1b', metal: '#f59e0b', inner: '#7f1d1d', shape: 'hex' },
  nature_leaf: { from: '#22c55e', to: '#166534', metal: '#d4a72c', inner: '#14532d', shape: 'oval' },
  dragon_gem: { from: '#8b5cf6', to: '#4338ca', metal: '#facc15', inner: '#312e81', shape: 'diamond' },
  pottery_vase: { from: '#d97706', to: '#92400e', metal: '#f5d0a9', inner: '#78350f', shape: 'soft' },
  sea_pearl: { from: '#f472b6', to: '#7c3aed', metal: '#fef3c7', inner: '#831843', shape: 'round' },
  silk_ribbon: { from: '#ec4899', to: '#be185d', metal: '#fde68a', inner: '#831843', shape: 'oval' },

  hoi_an_lantern: { from: '#dc2626', to: '#7f1d1d', metal: '#d9a441', inner: '#6b1d16', shape: 'hex' },
  hoi_an_port_compass: { from: '#0f766e', to: '#134e4a', metal: '#d6b566', inner: '#0b3b37', shape: 'round' },
  hoi_an_heritage_heart: { from: '#e76f51', to: '#9f1239', metal: '#f3c969', inner: '#7a2840', shape: 'oval' },

  citadel_shield: { from: '#334155', to: '#0f172a', metal: '#b7793f', inner: '#1e293b', shape: 'shield' },
  historic_cannon_badge: { from: '#7f1d1d', to: '#3f1212', metal: '#c58b4b', inner: '#4a1717', shape: 'round' },
  guardian_star: { from: '#1d4ed8', to: '#1e3a8a', metal: '#e0b44f', inner: '#172554', shape: 'diamond' },

  enlightenment_book: { from: '#1e3a8a', to: '#312e81', metal: '#d6b566', inner: '#172554', shape: 'soft' },
  reform_torch: { from: '#b45309', to: '#7c2d12', metal: '#d7a64c', inner: '#5f250f', shape: 'shield' },
  junior_enlightener: { from: '#4338ca', to: '#312e81', metal: '#d9bd72', inner: '#26205f', shape: 'oval' },

  detective_magnifier: { from: '#0f766e', to: '#115e59', metal: '#c6a15b', inner: '#0d4f4b', shape: 'round' },
  artifact_card: { from: '#7c5c3b', to: '#3f2d1f', metal: '#d7bd86', inner: '#4a3625', shape: 'soft' },
  museum_conservator: { from: '#4d7c0f', to: '#365314', metal: '#d6b566', inner: '#304b16', shape: 'shield' },

  heritage_stone: { from: '#64748b', to: '#334155', metal: '#cbd5e1', inner: '#1e293b', shape: 'hex' },
  culture_lotus: { from: '#db2777', to: '#9d174d', metal: '#f3c969', inner: '#831843', shape: 'oval' },
  mountain_conservator: { from: '#0f766e', to: '#14532d', metal: '#d6b566', inner: '#134e4a', shape: 'diamond' },
};

const shapeStyle = (shape: BadgeConfig['shape']): React.CSSProperties => {
  if (shape === 'shield') return { clipPath: 'polygon(12% 5%,88% 5%,96% 38%,82% 78%,50% 98%,18% 78%,4% 38%)' };
  if (shape === 'hex') return { clipPath: 'polygon(25% 4%,75% 4%,98% 50%,75% 96%,25% 96%,2% 50%)' };
  if (shape === 'diamond') return { clipPath: 'polygon(50% 2%,96% 50%,50% 98%,4% 50%)' };
  if (shape === 'oval') return { borderRadius: '45% 55% 50% 50% / 55% 45% 55% 45%' };
  if (shape === 'soft') return { borderRadius: '30%' };
  return { borderRadius: '9999px' };
};

const iconForTemplate = (template: RewardTemplate, className: string) => {
  switch (template) {
    case 'hoi_an_lantern':
    case 'heritage_lantern':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <path d="M24 7h16M27 12h10M23 17c-8 8-8 22 0 30h18c8-8 8-22 0-30H23Z" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
          <path d="M32 18v28M23 29h18M27 51h10M32 51v7" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
        </svg>
      );
    case 'hoi_an_port_compass':
    case 'discovery_compass':
      return <Compass className={className} strokeWidth={1.8} />;
    case 'hoi_an_heritage_heart':
    case 'sea_pearl':
      return <Heart className={className} strokeWidth={1.8} />;
    case 'citadel_shield':
      return <Shield className={className} strokeWidth={1.8} />;
    case 'historic_cannon_badge':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <path d="M13 30h29l8 7H19l-6-7Z" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/>
          <path d="M42 29l7-8 5 3-5 10M22 37l-5 10M42 37l5 10" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
          <circle cx="18" cy="49" r="6" fill="none" stroke="currentColor" strokeWidth="4"/>
          <circle cx="47" cy="49" r="6" fill="none" stroke="currentColor" strokeWidth="4"/>
        </svg>
      );
    case 'guardian_star':
      return <Star className={className} strokeWidth={1.8} />;
    case 'enlightenment_book':
    case 'scholar_scroll':
      return <BookOpen className={className} strokeWidth={1.8} />;
    case 'reform_torch':
      return <Flame className={className} strokeWidth={1.8} />;
    case 'junior_enlightener':
      return <Lightbulb className={className} strokeWidth={1.8} />;
    case 'detective_magnifier':
      return <Search className={className} strokeWidth={1.8} />;
    case 'artifact_card':
      return <Tag className={className} strokeWidth={1.8} />;
    case 'museum_conservator':
      return <HandHeart className={className} strokeWidth={1.8} />;
    case 'heritage_stone':
    case 'dragon_gem':
      return <Gem className={className} strokeWidth={1.8} />;
    case 'culture_lotus':
      return <Flower2 className={className} strokeWidth={1.8} />;
    case 'mountain_conservator':
      return <Mountain className={className} strokeWidth={1.8} />;
    case 'nature_leaf':
      return <Mountain className={className} strokeWidth={1.8} />;
    case 'pottery_vase':
      return <CircleDot className={className} strokeWidth={1.8} />;
    case 'silk_ribbon':
      return <Award className={className} strokeWidth={1.8} />;
    default:
      return <Award className={className} strokeWidth={1.8} />;
  }
};

export const RewardBadge: React.FC<Props> = ({ template, size = 'md', muted = false, className = '' }) => {
  const cfg = CONFIG[template] ?? CONFIG.discovery_compass;
  const sz = SIZE[size];
  return (
    <div
      className={`${sz.box} ${className} relative shrink-0 flex items-center justify-center shadow-lg`}
      style={{
        ...shapeStyle(cfg.shape),
        background: `linear-gradient(145deg, ${cfg.from}, ${cfg.to})`,
        border: `3px solid ${cfg.metal}`,
        boxShadow: muted ? 'none' : `0 8px 18px ${cfg.to}40, inset 0 0 0 2px rgba(255,255,255,.18)`,
        filter: muted ? 'grayscale(1) opacity(.55)' : undefined,
      }}
      aria-hidden="true"
    >
      <div
        className={`${sz.inner} flex items-center justify-center`}
        style={{
          ...shapeStyle(cfg.shape === 'shield' ? 'shield' : cfg.shape === 'diamond' ? 'diamond' : 'round'),
          background: cfg.inner,
          color: '#fff7db',
          border: `1px solid ${cfg.metal}`,
          boxShadow: 'inset 0 1px 5px rgba(255,255,255,.18)',
        }}
      >
        {iconForTemplate(template, sz.icon)}
      </div>
      <span
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: size === 'lg' ? 8 : 3,
          width: size === 'lg' ? 34 : 18,
          height: size === 'lg' ? 4 : 2,
          borderRadius: 999,
          background: cfg.metal,
          opacity: .9,
        }}
      />
    </div>
  );
};
