// ==UserScript==
// @name		 YouTube Auto Shuffle and Loop & Volume - V0.9
// @match		https://www.youtube.com/*
// @version	  2025-06-13
// @description  Active lecture aléatoire, boucle vidéo, boucle playlist, règle le volume, et force la playlist définie si l'utilisateur quitte la page cible.
// @author	   Phoenixnoir
// @grant		none
// ==/UserScript==

(function () 
{
	'use strict';

	// === CONFIGURATION ===
	const VOLUME_LEVEL = 0; // Définir le volume entre 0 et 100
	const ENABLE_SHUFFLE = true;
	const ENABLE_LOOP_VIDEO = true;
	const ENABLE_LOOP_PLAYLIST = true;
	const ENABLE_VOLUME = true;

	const FORCE_REDIRECT_TO_PLAYLIST = true;
	const FORCED_PLAYLIST_URL = "https://www.youtube.com/watch?v=po648BN2bQY&list=PL6ghosw3zh7nevYIOhYiHEvRO-jxLXGht&index=8"; // Playlist cible
	const FORCED_PLAYLIST_ID = "PL6ghosw3zh7nevYIOhYiHEvRO-jxLXGht"; // Ref playliste utilisé pour les vérifications
	const CHECK_INTERVAL_MS = 30000; // 30 secondes
	// ======================

	const isOnAllowedPlaylist = () => window.location.href.includes(`&list=${FORCED_PLAYLIST_ID}`);

	// Vérifie immédiatement à l'ouverture
	if (FORCE_REDIRECT_TO_PLAYLIST && !isOnAllowedPlaylist()) 
	{
		console.log("🚫 Redirection initiale vers la playlist autorisée...");
		window.location.replace(FORCED_PLAYLIST_URL);
		return;
	}

	// Vérification périodique toutes les 30 secondes
	if (FORCE_REDIRECT_TO_PLAYLIST) 
	{
		setInterval(() => {
			if (!isOnAllowedPlaylist()) 
			{
				console.log("🚨 Détection de sortie de la playlist autorisée. Redirection...");
				window.location.replace(FORCED_PLAYLIST_URL);
			}
		}, CHECK_INTERVAL_MS);
	}

	// Si on n’est pas sur une playlist, on arrête là
	if (!window.location.href.includes('&list=')) return;

	const tryClick = (selector, label) => {
		const el = document.querySelector(selector);
		if (el) 
		{
			el.click();
			console.log(`✅ ${label} activé`);
			return true;
		}
		return false;
	};

	let shuffleDone = !ENABLE_SHUFFLE;
	let loopVideoDone = !ENABLE_LOOP_VIDEO;
	let loopPlaylistDone = !ENABLE_LOOP_PLAYLIST;
	let volumeDone = !ENABLE_VOLUME;
	let elapsed = 0;
	const maxTime = 50000; // 50 secondes max

	const checkButtons = () => 
	{
		if (!shuffleDone && ENABLE_SHUFFLE) 
		{
			shuffleDone = tryClick('button[aria-label="Playlist en mode aléatoire"]', "Lecture aléatoire");
		}
		if (!loopVideoDone && ENABLE_LOOP_VIDEO) 
		{
			loopVideoDone = tryClick('.ytp-loop-button', "Boucle vidéo");
		}
		if (!loopPlaylistDone && ENABLE_LOOP_PLAYLIST) 
		{
			loopPlaylistDone = tryClick('button[aria-label="Playlist en boucle"]', "Boucle playlist");
		}
		if (!volumeDone && ENABLE_VOLUME) 
		{
			const player = document.getElementById("movie_player");
			if (player && typeof player.setVolume === "function") 
			{
				player.setVolume(VOLUME_LEVEL);
				console.log(`✅ Volume défini à ${VOLUME_LEVEL}`);
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

			console.log("🎉 Paramètres appliqués :");
			if (ENABLE_SHUFFLE) console.log("• Lecture aléatoire ✅");
			if (ENABLE_LOOP_VIDEO) console.log("• Boucle vidéo ✅");
			if (ENABLE_LOOP_PLAYLIST) console.log("• Boucle playlist ✅");
			if (ENABLE_VOLUME) console.log(`• Volume à ${VOLUME_LEVEL}% ✅`);
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