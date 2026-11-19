import { useState, useEffect } from 'react';

export function useGridCols() {
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default to 5 cols * 2 rows

  useEffect(() => {
    const calculate = () => {
      const w = window.innerWidth;
      
      if (w <= 768) setItemsPerPage(4); // 2 cols * 2 rows
      else if (w <= 992) setItemsPerPage(6); // 3 cols * 2 rows
      else if (w <= 1300) setItemsPerPage(8); // 4 cols * 2 rows
      else if (w <= 1600) setItemsPerPage(10); // 5 cols * 2 rows
      else setItemsPerPage(12); // 6 cols * 2 rows
    };
    
    calculate();
    window.addEventListener("resize", calculate);
    return () => window.removeEventListener("resize", calculate);
  }, []);

  return itemsPerPage;
}
