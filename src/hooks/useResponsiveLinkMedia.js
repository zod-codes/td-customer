// src/hooks/useResponsiveLinkMedias.js
import { useEffect, useMemo } from 'react';

export default function useResponsiveLinkMedia({
    links = [],
    mobileQuery = '(max-width:640px)',
    getMediaFor = (spec, isMatch) => (isMatch ? spec.mobileMedia ?? spec.media ?? 'screen' : spec.desktopMedia ?? 'print'),
} = {}) {
    const normalizedLinks = useMemo(() => {
        return Array.isArray(links) ? links.map(spec => ({ ...spec })) : [];
    }, [links]);

    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

        const mql = window.matchMedia(mobileQuery);

        const apply = (isMatch) => {
            normalizedLinks.forEach(spec => {
                if (!spec || !spec.id) return;
                const { id, href, rel } = spec;
                let el = document.getElementById(id);
                if (!el) {
                    el = document.createElement('link');
                    el.id = id;
                    el.rel = rel ?? 'stylesheet';
                    if (href) el.href = href;
                    document.head.appendChild(el);
                } else {
                    if (href && el.getAttribute('href') !== href) el.setAttribute('href', href);
                    if (rel && el.getAttribute('rel') !== rel) el.setAttribute('rel', rel);
                }

                const media = getMediaFor(spec, isMatch);
                if (media !== undefined && media !== null) el.setAttribute('media', String(media));
                else el.removeAttribute('media');
            });
        };

        // initial apply
        apply(mql.matches);

        const handler = () => apply(mql.matches);

        if (typeof mql.addEventListener === 'function') {
            mql.addEventListener('change', handler);
        } else if (typeof mql.addListener === 'function') {
            mql.addListener(handler);
        }

        return () => {
            if (typeof mql.removeEventListener === 'function') {
                mql.removeEventListener('change', handler);
            } else if (typeof mql.removeListener === 'function') {
                mql.removeListener(handler);
            }
        };
    }, [normalizedLinks, mobileQuery, getMediaFor]);
}
