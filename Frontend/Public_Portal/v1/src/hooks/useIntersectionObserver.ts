/**
 * useIntersectionObserver Hook
 *
 * Reusable hook for observing element visibility with IntersectionObserver API
 * Optimized for performance with single observer instance
 */

import { useEffect, useRef, useState } from 'react';

export interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): [React.RefObject<HTMLDivElement | null>, boolean] {
  const {
    threshold = 0.2,
    root = null,
    rootMargin = '0px',
    freezeOnceVisible = true,
  } = options;

  const elementRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // If already visible and frozen, don't observe
    if (freezeOnceVisible && isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold, root, rootMargin }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, root, rootMargin, freezeOnceVisible, isVisible]);

  return [elementRef, isVisible];
}

/**
 * useMultipleIntersectionObserver Hook
 *
 * Optimized hook for observing multiple elements with a single observer instance
 */
export function useMultipleIntersectionObserver<T = HTMLElement>(
  count: number,
  options: UseIntersectionObserverOptions = {}
): [Map<number, boolean>, (index: number) => React.RefObject<T>] {
  const {
    threshold = 0.2,
    root = null,
    rootMargin = '0px',
  } = options;

  const [visibleIndices, setVisibleIndices] = useState<Map<number, boolean>>(new Map());
  const elementRefs = useRef<Map<number, React.RefObject<T>>>(new Map());

  // Initialize refs for all elements
  for (let i = 0; i < count; i++) {
    if (!elementRefs.current.has(i)) {
      elementRefs.current.set(i, { current: null } as React.RefObject<T>);
    }
  }

  const getRef = (index: number): React.RefObject<T> => {
    const ref = elementRefs.current.get(index);
    if (!ref) {
      const newRef = { current: null } as React.RefObject<T>;
      elementRefs.current.set(index, newRef);
      return newRef;
    }
    return ref;
  };

  useEffect(() => {
    // Single observer instance for all elements
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.getAttribute('data-index'));
          if (!isNaN(index) && entry.isIntersecting) {
            setVisibleIndices((prev) => new Map(prev).set(index, true));
          }
        });
      },
      { threshold, root, rootMargin }
    );

    // Observe all elements
    elementRefs.current.forEach((ref, index) => {
      if (ref.current) {
        (ref.current as unknown as Element).setAttribute('data-index', String(index));
        observer.observe(ref.current as unknown as Element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [count, threshold, root, rootMargin]);

  return [visibleIndices, getRef];
}
