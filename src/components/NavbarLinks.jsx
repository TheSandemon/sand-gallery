import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavbarLinks = ({ links = [], isMobile = false }) => {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;
  const baseClasses = isMobile 
    ? 'text-2xl font-bold tracking-widest transition-colors duration-300'
    : 'text-sm font-semibold tracking-wide transition-colors duration-300';
  
  const activeClasses = isMobile
    ? 'text-[var(--accent-secondary)]'
    : 'text-[var(--accent-secondary)]';
  
  const inactiveClasses = isMobile
    ? 'text-[var(--text-dim)] hover:text-[var(--text-primary)]'
    : 'text-[var(--text-dim)] hover:text-[var(--text-primary)]';

  return (
    <>
      {links.map(link => (
        <Link
          key={link.path}
          to={link.path}
          className={`${baseClasses} ${isActive(link.path) ? activeClasses : inactiveClasses}`}
        >
          {link.label}
        </Link>
      ))}
    </>
  );
};

export default NavbarLinks;
