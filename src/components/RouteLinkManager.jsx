// src/components/RouteLinkManager.jsx
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import useSetLinkMedias from '../hooks/useSetLinkMedia.js';

function assetHref(relPathFromSrcStyles) {
    // relPathFromSrcStyles example: 'rs_screen.css' (file located at src/styles/rs_screen.css)
    // import.meta.url is the current module file URL; new URL will let Vite rewrite to hashed asset in build
    return new URL(`../styles/${relPathFromSrcStyles}`, import.meta.url).href;
}

export default function RouteLinkManager() {
    const { pathname } = useLocation();

    const links = useMemo(() => ([
        {
            id: 'rs_screen',
            href: assetHref('rs_screen.css'),
            rel: 'stylesheet',
            media: ['/CreateYourAccount', '/ContactUsPage', '/Login', '/InfoDisplay', '/Confirmation'].includes(pathname) ? 'screen' : 'print'
        },
        {
            id: 'global_null',
            href: assetHref('global_null.css'),
            rel: 'stylesheet',
            media: 'print'
        },
        {
            id: 'style',
            href: assetHref('style.css'),
            rel: 'stylesheet',
            media: (pathname === '/' || pathname === '/Confirmation') ? 'screen' : 'print'
        },
        {
            id: 'rs_print',
            href: assetHref('rs_print.css'),
            rel: 'stylesheet',
            media: 'print'
        }
    ]), [pathname]);

    useSetLinkMedias(links, { removeOnUnmount: false });
    return null;
}
