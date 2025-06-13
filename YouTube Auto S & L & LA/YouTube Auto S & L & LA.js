// ==UserScript==
// @name         YouTube Auto Shuffle and Loop & Loop All - V0.5
// @match        https://www.youtube.com/*
// @version      2025-06-13
// @description  Active lecture aléatoire, boucle vidéo, et boucle playlist sur playlists YouTube si &list= dans l'URL
// @author       Phoenixnoir
// @grant        none
// ==/UserScript==

(function()
{
    'use strict';

    if (!window.location.href.includes('&list=')) return;

    const tryClick = (selector) =>
	{
        const el = document.querySelector(selector);
        if (el) {
            el.click();
            return true;
        }
        return false;
    };

    let shuffleDone = false;
    let loopVideoDone = false;
    let loopPlaylistDone = false;
    let elapsed = 0;
    const maxTime = 20000; // 20 secondes max

    const checkButtons = () =>
	{
        if (!shuffleDone)
        {
            shuffleDone = tryClick('button[aria-label="Playlist en mode aléatoire"]');
        }
        if (!loopVideoDone)
        {
            loopVideoDone = tryClick('.ytp-loop-button');
        }
        if (!loopPlaylistDone)
        {
            loopPlaylistDone = tryClick('button[aria-label="Playlist en boucle"]');
        }
    };

    checkButtons();

    const interval = setInterval(() =>
	{
        checkButtons();
        elapsed += 1000;
        if ((shuffleDone && loopVideoDone && loopPlaylistDone) || elapsed >= maxTime) {
            clearInterval(interval);
            observer.disconnect();
        }
    }, 1000);

    const observer = new MutationObserver(() =>
	{
        if (!loopVideoDone || !loopPlaylistDone)
		{
            checkButtons();
        }
    });

    const playerControls = document.querySelector('.ytp-chrome-bottom');
    if (playerControls)
	{
        observer.observe(playerControls, { childList: true, subtree: true });
    }
	else
	{
        observer.observe(document.body, { childList: true, subtree: true });
    }
})();
