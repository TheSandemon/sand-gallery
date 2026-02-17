import React from 'react';
import { Link } from 'react-router-dom';
import { Image, FolderOpen, Sparkles } from 'lucide-react';

const EmptyState = ({ type = 'gallery' }) => {
  const states = {
    gallery: {
      icon: Image,
      title: 'No projects yet',
      description: 'Your gallery is empty. Add your first project to get started.',
      action: { label: 'Go Home', to: '/' }
    },
    search: {
      icon: FolderOpen,
      title: 'No results found',
      description: 'Try adjusting your search terms or filters.',
      action: null
    },
    category: {
      icon: Sparkles,
      title: 'Nothing in this category',
      description: 'Check back later for new content in this area.',
      action: { label: 'Browse All', to: '/gallery' }
    }
  };

  const { icon: Icon, title, description, action } = states[type] || states.gallery;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-[var(--bg-card)] border border-[var(--text-primary)]/10 flex items-center justify-center">
          <Icon size={40} className="text-[var(--text-dim)]" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]/30 flex items-center justify-center">
          <Sparkles size={14} className="text-[var(--accent-primary)]" />
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
        {title}
      </h3>
      <p className="text-[var(--text-dim)] max-w-md mb-6">
        {description}
      </p>
      
      {action && (
        <Link
          to={action.to}
          className="px-6 py-3 bg-[var(--accent-primary)] text-black font-bold rounded-lg hover:opacity-90 transition-all duration-300"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
