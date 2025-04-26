import React, { useEffect } from "react";

export function useScreenDimensions(): [number, number] {
  const [screenDimensions, setScreenDimensions] = React.useState<
    [number, number]
  >([window.innerWidth, window.innerHeight]);

  useEffect(() => {
    let listener = () =>
      setScreenDimensions([window.innerWidth, window.innerHeight]);
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, []);

  return screenDimensions;
}
