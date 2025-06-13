// ==UserScript==
// @name		 YouTube Auto Shuffle and Loop & Volume - V0.6
// @match		https://www.youtube.com/*
// @version	  2025-06-13
// @description  Active lecture aléatoire, boucle vidéo, boucle playlist, et règle le volume à 20% sur les playlists YouTube si &list= est dans l'URL
// @author	   Phoenixnoir
// @grant		none
// ==/UserScript==

(function () 
{
	'use strict';
	
	if (!window.location.href.includes('&list=')) return;
	
	const tryClick = (selector) => 
	{
		const el = document.querySelector(selector);
		if (el) 
		{
			el.click();
			return true;
		}
		return false;
	};

	let shuffleDone = false;
	let loopVideoDone = false;
	let loopPlaylistDone = false;
	let volumeDone = false;
	let elapsed = 0;
	const maxTime = 50000; // 50 secondes max

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
		if (!volumeDone) 
		{
			const player = document.getElementById("movie_player");
			if (player && typeof player.setVolume === "function") 
			{
				player.setVolume(20); // Volume entre 0 et 100
				console.log("✅ Volume défini à 20");
				volumeDone = true;
			}
		}
	};

	checkButtons();

	const interval = setInterval(() => 
	{
		checkButtons();
		elapsed += 1000;
		if ((shuffleDone && loopVideoDone && loopPlaylistDone && volumeDone) || elapsed >= maxTime) 
		{
			clearInterval(interval);
			observer.disconnect();
		}
	}, 1000);

	const observer = new MutationObserver(() => 
	{
		if (!loopVideoDone || !loopPlaylistDone || !volumeDone) 
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