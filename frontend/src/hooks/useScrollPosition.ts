import { RefObject, useEffect, useRef, useState } from 'react';

type TScrollPosition<T> = {
  scrolledToBottom: boolean;
  scrolledToTop: boolean;
  elementRef: RefObject<T>;
};

export const useScrollPosition = <T extends HTMLElement>(offset: number = 0, throttleTime: number = 100): TScrollPosition<T> => {
  const [isAtTop, setIsAtTop] = useState<boolean>(false);
  const [isAtBottom, setIsAtBottom] = useState<boolean>(false);
  const elementRef = useRef<T>(null);

  const handleScroll = () => {
    if (!elementRef.current) return;

    const scrollTop = elementRef.current.scrollTop;
    const scrollHeight = elementRef.current.scrollHeight;
    const clientHeight = elementRef.current.clientHeight;

    setIsAtTop(scrollTop <= offset);
    setIsAtBottom(scrollTop + clientHeight >= scrollHeight - offset);
  };

  const throttledScrollHandler = throttle(handleScroll, throttleTime);

  useEffect(() => {
    const element = elementRef.current;
    if (element) {
      throttledScrollHandler();
      element.addEventListener('scroll', throttledScrollHandler);
    }

    const mutationObserver = new MutationObserver(() => {
      handleScroll();
    });

    const resizeObserver = new ResizeObserver(() => {
      handleScroll();
    });

    if (element) {
      mutationObserver.observe(element, { childList: true, subtree: true });
      resizeObserver.observe(element);
    }

    return () => {
      if (element) {
        element.removeEventListener('scroll', handleScroll);
        mutationObserver.disconnect();
        resizeObserver.disconnect();
      }
    };
  }, []);

  return {
    scrolledToBottom: isAtBottom,
    scrolledToTop: isAtTop,
    elementRef,
  };
};

const throttle = <T extends (...args: any[]) => any>(callback: T, delay: number) => {
  let lastTime = 0;

  return function (this: any, ...args: Parameters<T>) {
    const now = new Date().getTime();

    if (now - lastTime >= delay) {
      lastTime = now;
      return callback.apply(this, args);
    }
  };
};
