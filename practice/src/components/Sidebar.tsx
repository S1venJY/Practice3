import React from 'react';

export const Sidebar: React.FC = () => {
  return (
    <aside style={{ display: 'none' }}>
      <nav>
        <ul>
          <li>Головна галерея</li>
          <li>Мої альбоми</li>
        </ul>
      </nav>
    </aside>
  );
};