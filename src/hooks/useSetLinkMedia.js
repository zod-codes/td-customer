// src/hooks/useSetLinkMedias.js
import { useEffect, useRef, useMemo } from 'react';

export default function useSetLinkMedia(links = [], { removeOnUnmount = false } = {}) {
    const createdRef = useRef({}); // id -> boolean
    const prevAttrsRef = useRef({}); // id -> { href, rel, media }

    // Make a stable shallow copy of the links array (so deps can be a single stable value)
    const normalizedLinks = useMemo(() => {
        return Array.isArray(links) ? links.map(spec => ({ ...spec })) : [];
    }, [links]);

    useEffect(() => {
        if (typeof document === 'undefined') return; // SSR guard
        const list = normalizedLinks;

        list.forEach(spec => {
            const { id, href, rel = 'stylesheet', media } = spec || {};
            if (!id) return;

            let el = document.getElementById(id);
            if (!el) {
                el = document.createElement('link');
                el.id = id;
                el.rel = rel;
                if (href) el.href = href;
                document.head.appendChild(el);
                createdRef.current[id] = true;
                // mark previous as null so we know we created it
                prevAttrsRef.current[id] = { href: null, rel: null, media: null };
            } else {
                // snapshot current attributes so we can restore them later
                prevAttrsRef.current[id] = {
                    href: el.getAttribute('href'),
                    rel: el.getAttribute('rel'),
                    media: el.getAttribute('media'),
                };
                createdRef.current[id] = false;
            }

            // update attributes
            if (href !== undefined && href !== null) {
                if (el.getAttribute('href') !== href) el.setAttribute('href', href);
            }
            if (rel !== undefined && rel !== null) {
                if (el.getAttribute('rel') !== rel) el.setAttribute('rel', rel);
            }
            if (media !== undefined && media !== null) {
                if (el.getAttribute('media') !== String(media)) el.setAttribute('media', String(media));
            } else {
                el.removeAttribute('media');
            }
        });

        // take snapshots of the refs to use in cleanup (avoid ref value-change warning)
        const createdSnapshot = { ...createdRef.current };
        const prevAttrsSnapshot = { ...prevAttrsRef.current };

        return () => {
            list.forEach(spec => {
                const id = spec && spec.id;
                if (!id) return;
                const el = document.getElementById(id);
                if (!el) return;

                const prev = prevAttrsSnapshot[id];
                const created = !!createdSnapshot[id];

                if (created) {
                    if (removeOnUnmount) {
                        el.remove();
                    } else {
                        // restore previous attributes (which were null for created links)
                        if (prev) {
                            if (prev.href != null) el.setAttribute('href', prev.href);
                            else el.removeAttribute('href');

                            if (prev.rel != null) el.setAttribute('rel', prev.rel);
                            else el.removeAttribute('rel');

                            if (prev.media != null) el.setAttribute('media', prev.media);
                            else el.removeAttribute('media');
                        } else {
                            // no previous; remove attrs we set
                            el.removeAttribute('media');
                        }
                    }
                } else {
                    // we didn't create it — restore original attrs
                    if (prev) {
                        if (prev.href != null) el.setAttribute('href', prev.href);
                        else el.removeAttribute('href');

                        if (prev.rel != null) el.setAttribute('rel', prev.rel);
                        else el.removeAttribute('rel');

                        if (prev.media != null) el.setAttribute('media', prev.media);
                        else el.removeAttribute('media');
                    }
                }

                // cleanup snapshots
                delete prevAttrsRef.current[id];
                delete createdRef.current[id];
            });
        };
    }, [normalizedLinks, removeOnUnmount]);
}
