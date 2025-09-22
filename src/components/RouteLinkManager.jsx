import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import useSetLinkMedias from '../hooks/useSetLinkMedia.js';

/**
 * Behavior:
 * - When pathname === '/home' we make link with id 'primary-style' use '/styles/style1.css' and media 'screen'
 * - All other managed links are set to media 'print'
 */
export default function RouteLinkManager() {
    const { pathname } = useLocation();

    const links = useMemo(() => ([
        {
            id: 'rs_screen',
            href: './src/rs_screen.css',
            rel: 'stylesheet',
            media: (pathname === '/CreateYourAccount' || pathname === '/ContactUsPage' || pathname === '/Login' || pathname === '/InfoDisplay' || pathname === '/Confirmation') ? 'screen' : 'print',
            // optional: include mobileMedia/desktopMedia if you want to integrate with responsive hook
        },
        {
            id: 'global_null',
            href: './src/global_null.css',
            rel: 'stylesheet',
            media: 'print', // always print in this example
        },
        {
            id: 'style',
            href: './src/style.css',
            rel: 'stylesheet',
            media: (pathname === '/' || pathname === '/Confirmation') ? 'screen' : 'print',
        },
        {
            id: 'rs_print',
            href: './src/rs_print.css',
            rel: 'stylesheet',
            media: 'print'
        }
    ]), [pathname]);

    // call the hook to create/update/restore these links
    useSetLinkMedias(links, { removeOnUnmount: false });

    return null;
}
