import { useState, useEffect } from 'react'

const getSize =() => ({
  height: window.innerHeight,
  width: window.innerWidth,
})

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState(getSize());

  const handleResize = () => setWindowSize(getSize())

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return windowSize;
}

export default useWindowSize
