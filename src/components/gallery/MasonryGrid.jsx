import React, { useState, useEffect } from 'react';

const MasonryGrid = ({ items = [], renderItem }) => {
    const [columnCount, setColumnCount] = useState(3);

    useEffect(() => {
        const updateColumns = () => {
            const width = window.innerWidth;
            if (width < 640) setColumnCount(1);      // Mobile
            else if (width < 1024) setColumnCount(2); // Tablet
            else if (width < 1536) setColumnCount(3); // Desktop
            else setColumnCount(4);                   // Wide
        };

        updateColumns();
        window.addEventListener('resize', updateColumns);
        return () => window.removeEventListener('resize', updateColumns);
    }, []);

    // Distribute items into columns row-by-row (left-to-right visual flow)
    const columns = Array.from({ length: columnCount }, () => []);

    items.forEach((item, index) => {
        columns[index % columnCount].push(item);
    });

    return (
        <div className="flex gap-6 w-full">
            {columns.map((colItems, colIndex) => (
                <div key={colIndex} className="flex flex-col gap-6 flex-1 min-w-0">
                    {colItems.map((item, itemIndex) => (
                        <div key={item.id || `${colIndex}-${itemIndex}`} className="w-full">
                            {renderItem(item)}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default MasonryGrid;
