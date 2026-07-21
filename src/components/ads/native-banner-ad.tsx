'use client';

import { useEffect } from 'react';

const SCRIPT_SRC = 'https://pl30459969.effectivecpmnetwork.com/124d1599d2d58f7496dc903354d9211b/invoke.js';
const CONTAINER_ID = 'container-124d1599d2d58f7496dc903354d9211b';

let scriptInjected = false;

export function NativeBannerAd() {
  useEffect(() => {
    if (typeof window === 'undefined' || scriptInjected) {
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = SCRIPT_SRC;

    document.body.appendChild(script);
    scriptInjected = true;
  }, []);

  return (
    <div className="mx-auto my-6 flex w-full justify-center px-4 sm:px-6 lg:px-8">
      <div id={CONTAINER_ID} className="w-full max-w-5xl" />
    </div>
  );
}
