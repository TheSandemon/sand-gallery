import React from 'react';
import { Link } from 'react-router-dom';

const NavbarLogo = () => {
  return (
    <Link to="/" className="text-xl md:text-2xl font-bold tracking-tight text-[var(--text-primary)] z-[1001] relative pointer-events-auto">
      SAND<span className="text-[var(--accent-primary)]">.GALLERY</span>
    </Link>
  );
};

export default NavbarLogo;
