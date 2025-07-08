// hooks/usePrompt.js
import { useEffect } from 'react';
import { UNSAFE_NavigationContext as NavigationContext } from 'react-router-dom';
import { useContext } from 'react';

export function usePrompt(message, when) {
  const navigator = useContext(NavigationContext).navigator;

  useEffect(() => {
    if (!when) return;

    const push = navigator.push;

    navigator.push = (...args) => {
      const result = window.confirm(message);
      if (result) {
        navigator.push = push;
        navigator.push(...args);
      }
    };

    return () => {
      navigator.push = push;
    };
  }, [when, message, navigator]);
}
