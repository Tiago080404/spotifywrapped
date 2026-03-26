<template>
  <div class="story-overlay" @click="handleClick" @keydown="onKey"
    @touchstart.passive="onTouchStart" @touchend.passive="onTouchEnd"
    tabindex="0" ref="overlayRef">
    <!-- Progress bars -->
    <div class="story-progress">
      <div v-for="(_, i) in slides" :key="i" class="progress-seg">
        <div class="progress-seg-fill"
          :class="{ done: i < currentSlide, active: i === currentSlide }"
          :style="i === currentSlide ? { animationDuration: slideDuration + 'ms' } : {}">
        </div>
      </div>
    </div>

    <!-- Slide counter -->
    <div class="slide-counter">{{ currentSlide + 1 }} / {{ slides.length }}</div>

    <!-- Close button -->
    <button class="story-close" @click.stop="$emit('close')">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>

    <!-- Nav arrows -->
    <button class="nav-arrow nav-left" @click.stop="prevSlide">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
    </button>
    <button class="nav-arrow nav-right" @click.stop="nextSlide">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
    </button>

    <!-- Loading -->
    <div v-if="loading" class="story-loading">
      <div class="loader-ring"></div>
      <p>Lade deine Music Story...</p>
    </div>

    <!-- Slides -->
    <Transition v-else :name="slideDirection" mode="out-in">
      <div class="slide" :key="currentSlide" :style="{ background: slides[currentSlide]?.bg }">

        <!-- SLIDE 0: Welcome -->
        <div v-if="currentSlide === 0" class="slide-content slide-welcome">
          <div class="welcome-avatar" v-if="profile?.images?.[0]?.url">
            <img :src="profile.images[0].url" alt="" />
            <div class="avatar-ring"></div>
          </div>
          <h1 class="welcome-title">
            Hey {{ profile?.display_name?.split(' ')[0] || 'du' }}!
          </h1>
          <p class="welcome-sub">Bereit fuer deine persoenliche Music Story?</p>
          <div class="welcome-wave">
            <div v-for="n in 12" :key="n" class="w-bar" :style="{ animationDelay: (n * 0.08) + 's' }"></div>
          </div>
          <div class="welcome-stats-preview">
            <span>{{ allArtists.length }} Artists</span>
            <span class="dot"></span>
            <span>{{ allTracks.length }} Tracks</span>
            <span class="dot"></span>
            <span>{{ uniqueGenres.length }} Genres</span>
          </div>
          <p class="welcome-hint">Tippe um fortzufahren</p>
        </div>

        <!-- SLIDE 1: Numbers Overview -->
        <div v-if="currentSlide === 1" class="slide-content slide-stats">
          <p class="slide-overline">DEINE ZAHLEN</p>
          <h2 class="stats-headline">Dein Universum in Zahlen</h2>
          <div class="stat-grid">
            <div class="stat-card stat-artists">
              <span class="stat-number">{{ allArtists.length }}</span>
              <span class="stat-desc">Top Artists</span>
              <div class="stat-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
            </div>
            <div class="stat-card stat-tracks">
              <span class="stat-number">{{ allTracks.length }}</span>
              <span class="stat-desc">Top Tracks</span>
              <div class="stat-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
              </div>
            </div>
            <div class="stat-card stat-genres">
              <span class="stat-number">{{ uniqueGenres.length }}</span>
              <span class="stat-desc">Genres</span>
              <div class="stat-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              </div>
            </div>
            <div class="stat-card stat-albums">
              <span class="stat-number">{{ uniqueAlbums.length }}</span>
              <span class="stat-desc">Alben</span>
              <div class="stat-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
              </div>
            </div>
          </div>
        </div>

        <!-- SLIDE 2: #1 Artist -->
        <div v-if="currentSlide === 2 && allArtists[0]" class="slide-content slide-artist">
          <p class="slide-overline">DEIN #1 ARTIST</p>
          <div class="artist-hero-img">
            <img :src="allArtists[0].images[0]?.url" alt="" />
            <div class="artist-hero-gradient"></div>
            <div class="hero-pulse-ring"></div>
            <div class="hero-pulse-ring ring-2"></div>
          </div>
          <h2 class="artist-hero-name">{{ allArtists[0].name }}</h2>
          <p class="artist-hero-genres" v-if="allArtists[0].genres?.length">{{ allArtists[0].genres.slice(0, 3).join(' / ') }}</p>
          <div class="hero-pop-bar">
            <div class="hero-pop-fill" :style="{ width: allArtists[0].popularity + '%' }"></div>
          </div>
          <p class="hero-pop-label">
            <span class="pop-num">{{ allArtists[0].popularity }}</span> Popularity Score
          </p>
          <div class="hero-followers" v-if="allArtists[0].followers?.total">
            {{ formatNumber(allArtists[0].followers.total) }} Followers weltweit
          </div>
        </div>

        <!-- SLIDE 3: Top Genres -->
        <div v-if="currentSlide === 3" class="slide-content slide-genres">
          <p class="slide-overline">DEINE GENRES</p>
          <h2 class="genres-title">So klingt dein Leben</h2>
          <div v-if="topGenres.length" class="genre-bars">
            <div v-for="(genre, i) in topGenres.slice(0, 10)" :key="genre.name"
              class="genre-row" :style="{ animationDelay: (i * 0.08) + 's' }">
              <span class="genre-rank">#{{ i + 1 }}</span>
              <span class="genre-name">{{ genre.name }}</span>
              <div class="genre-bar-bg">
                <div class="genre-bar-fill"
                  :style="{
                    width: (genre.count / (topGenres[0]?.count || 1) * 100) + '%',
                    background: genreColor(i),
                  }">
                </div>
              </div>
              <span class="genre-count">{{ genre.count }}x</span>
            </div>
          </div>
          <p v-else class="no-data-msg">Keine Genre-Daten verfuegbar</p>
          <p class="genre-summary" v-if="topGenres.length">
            Dein #1 Genre: <strong>{{ topGenres[0]?.name }}</strong>
          </p>
        </div>

        <!-- SLIDE 4: Listening Personality -->
        <div v-if="currentSlide === 4" class="slide-content slide-personality">
          <p class="slide-overline">DEIN MUSIK-TYP</p>
          <div class="personality-emoji">{{ personality.emoji }}</div>
          <h2 class="personality-title">{{ personality.title }}</h2>
          <p class="personality-desc">{{ personality.desc }}</p>
          <div class="personality-traits">
            <div class="trait" v-for="trait in personality.traits" :key="trait.label">
              <div class="trait-label">{{ trait.label }}</div>
              <div class="trait-bar-bg">
                <div class="trait-bar-fill" :style="{ width: trait.value + '%', background: trait.color }"></div>
              </div>
              <div class="trait-value">{{ trait.value }}%</div>
            </div>
          </div>
        </div>

        <!-- SLIDE 5: #1 Track -->
        <div v-if="currentSlide === 5 && allTracks[0]" class="slide-content slide-track">
          <p class="slide-overline">DEIN #1 TRACK</p>
          <div class="track-hero-art">
            <img :src="allTracks[0].album?.images[0]?.url" alt="" />
            <div class="track-vinyl-overlay">
              <div class="vinyl-groove"></div>
              <div class="vinyl-groove groove-2"></div>
              <div class="vinyl-groove groove-3"></div>
            </div>
          </div>
          <h2 class="track-hero-name">{{ allTracks[0].name }}</h2>
          <p class="track-hero-artist">{{ allTracks[0].artists?.map((a: any) => a.name).join(', ') }}</p>
          <p class="track-hero-album">{{ allTracks[0].album?.name }}</p>
          <button class="play-hero-btn" @click.stop="playTrack(allTracks[0])">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Abspielen
          </button>
        </div>

        <!-- SLIDE 6: Top 5 Artists Mosaic -->
        <div v-if="currentSlide === 6" class="slide-content slide-mosaic">
          <p class="slide-overline">DEINE TOP 5 ARTISTS</p>
          <div class="mosaic-grid">
            <div v-for="(artist, i) in allArtists.slice(0, 5)" :key="artist.id"
              class="mosaic-item" :style="{ animationDelay: (i * 0.1) + 's' }">
              <div class="mosaic-img" :class="'mosaic-' + (i + 1)">
                <img :src="artist.images[0]?.url" :alt="artist.name" />
                <span class="mosaic-rank">{{ i + 1 }}</span>
              </div>
              <span class="mosaic-name">{{ artist.name }}</span>
              <span class="mosaic-genre">{{ artist.genres?.[0] || '' }}</span>
            </div>
          </div>
        </div>

        <!-- SLIDE 7: Mainstream vs Underground -->
        <div v-if="currentSlide === 7" class="slide-content slide-mainstream">
          <p class="slide-overline">DEIN VIBE</p>
          <h2 class="mainstream-title">{{ mainstreamLabel }}</h2>
          <div class="mainstream-meter">
            <div class="meter-bg">
              <div class="meter-fill" :style="{ width: avgPopularity + '%' }">
                <div class="meter-glow"></div>
              </div>
              <div class="meter-indicator" :style="{ left: avgPopularity + '%' }">
                <div class="indicator-dot"></div>
                <div class="indicator-label">{{ avgPopularity }}</div>
              </div>
            </div>
            <div class="meter-labels">
              <span>Underground</span>
              <span>Mainstream</span>
            </div>
          </div>
          <div class="mainstream-details">
            <div class="mainstream-stat">
              <span class="ms-value">{{ mostObscure?.name }}</span>
              <span class="ms-label">Geheimtipp (Pop. {{ mostObscure?.popularity }})</span>
            </div>
            <div class="mainstream-stat">
              <span class="ms-value">{{ mostPopular?.name }}</span>
              <span class="ms-label">Mainstream-Hit (Pop. {{ mostPopular?.popularity }})</span>
            </div>
          </div>
        </div>

        <!-- SLIDE 8: Top 5 Tracks -->
        <div v-if="currentSlide === 8" class="slide-content slide-top-tracks">
          <p class="slide-overline">DEINE TOP 5 TRACKS</p>
          <div class="top-tracks-list">
            <div v-for="(track, i) in allTracks.slice(0, 5)" :key="track.id"
              class="top-track-item" :style="{ animationDelay: (i * 0.1) + 's' }"
              @click.stop="playTrack(track)">
              <span class="tt-rank">{{ i + 1 }}</span>
              <div class="tt-art">
                <img :src="track.album?.images[0]?.url" :alt="track.name" />
                <div class="tt-play-overlay">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </div>
              </div>
              <div class="tt-info">
                <div class="tt-name">{{ track.name }}</div>
                <div class="tt-artist">{{ track.artists?.map((a: any) => a.name).join(', ') }}</div>
              </div>
              <div class="tt-pop-badge" :style="{ background: popColor(track.popularity) }">
                {{ track.popularity }}
              </div>
            </div>
          </div>
        </div>

        <!-- SLIDE 9: Top Albums -->
        <div v-if="currentSlide === 9" class="slide-content slide-albums">
          <p class="slide-overline">DEINE TOP ALBEN</p>
          <h2 class="albums-title">Die Alben deines Lebens</h2>
          <div class="albums-grid">
            <div v-for="(album, i) in topAlbums.slice(0, 6)" :key="album.id"
              class="album-card" :style="{ animationDelay: (i * 0.08) + 's' }">
              <div class="album-art">
                <img :src="album.image" :alt="album.name" />
              </div>
              <div class="album-info">
                <div class="album-name">{{ album.name }}</div>
                <div class="album-artist">{{ album.artist }}</div>
                <div class="album-count">{{ album.count }} Track{{ album.count > 1 ? 's' : '' }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- SLIDE 10: Decade Breakdown -->
        <div v-if="currentSlide === 10" class="slide-content slide-decades">
          <p class="slide-overline">DEINE JAHRZEHNTE</p>
          <h2 class="decades-title">Aus welcher Aera kommst du?</h2>
          <div class="decade-bars">
            <div v-for="(decade, i) in decadeData" :key="decade.label"
              class="decade-row" :style="{ animationDelay: (i * 0.1) + 's' }">
              <span class="decade-label">{{ decade.label }}</span>
              <div class="decade-bar-bg">
                <div class="decade-bar-fill"
                  :style="{ width: (decade.count / (decadeData[0]?.count || 1) * 100) + '%', background: decade.color }">
                </div>
              </div>
              <span class="decade-count">{{ decade.count }}</span>
            </div>
          </div>
          <p class="decade-verdict" v-if="decadeData[0]">
            Du bist ein <strong>{{ decadeData[0].label }}-Kind</strong>
          </p>
        </div>

        <!-- SLIDE 11: Hidden Gems -->
        <div v-if="currentSlide === 11" class="slide-content slide-hidden-gems">
          <p class="slide-overline">DEINE GEHEIMTIPPS</p>
          <h2 class="gems-title">Hidden Gems</h2>
          <p class="gems-subtitle">Songs die kaum jemand kennt</p>
          <div class="gems-list">
            <div v-for="(track, i) in hiddenGems" :key="track.id"
              class="gem-item" :style="{ animationDelay: (i * 0.1) + 's' }"
              @click.stop="playTrack(track)">
              <div class="gem-rank">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z"/></svg>
              </div>
              <div class="gem-art">
                <img :src="track.album?.images?.[0]?.url" :alt="track.name" />
              </div>
              <div class="gem-info">
                <div class="gem-name">{{ track.name }}</div>
                <div class="gem-artist">{{ track.artists?.map((a: any) => a.name).join(', ') }}</div>
              </div>
              <div class="gem-pop-badge">
                <span class="gem-pop-num">{{ track.popularity }}</span>
                <span class="gem-pop-label">Pop</span>
              </div>
            </div>
          </div>
          <p class="gems-footer" v-if="hiddenGems[0]">
            Dein geheimster Track hat nur <strong>{{ hiddenGems[0].popularity }}</strong> Popularity
          </p>
        </div>

        <!-- SLIDE 12: Loyalty Score -->
        <div v-if="currentSlide === 12" class="slide-content slide-loyalty">
          <p class="slide-overline">DEINE TREUE</p>
          <div class="loyalty-score-ring">
            <svg viewBox="0 0 120 120" class="loyalty-svg">
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="8"/>
              <circle cx="60" cy="60" r="52" fill="none" stroke="url(#loyaltyGrad)" stroke-width="8"
                stroke-linecap="round"
                :stroke-dasharray="(loyaltyData.score / 100 * 327) + ' 327'"
                transform="rotate(-90 60 60)"
                class="loyalty-progress"/>
              <defs>
                <linearGradient id="loyaltyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#7c3aed"/>
                  <stop offset="100%" stop-color="#ec4899"/>
                </linearGradient>
              </defs>
            </svg>
            <div class="loyalty-score-inner">
              <span class="loyalty-num">{{ loyaltyData.score }}</span>
              <span class="loyalty-pct">%</span>
            </div>
          </div>
          <h2 class="loyalty-title">{{ loyaltyData.label }}</h2>
          <p class="loyalty-desc">{{ loyaltyData.score }}% deiner Top Tracks gehoeren zu deinen Top 5 Artists</p>
          <div class="loyalty-artists">
            <div v-for="(artist, i) in loyaltyData.topArtists" :key="i"
              class="loyalty-artist-item" :style="{ animationDelay: (i * 0.08 + 0.3) + 's' }">
              <div class="la-img" v-if="artist.image">
                <img :src="artist.image" alt="" />
              </div>
              <span class="la-name">{{ artist.name }}</span>
              <span class="la-count">{{ artist.count }} Tracks</span>
            </div>
          </div>
        </div>

        <!-- SLIDE 13: Music DNA -->
        <div v-if="currentSlide === 13" class="slide-content slide-dna">
          <p class="slide-overline">DEINE MUSIK-DNA</p>
          <h2 class="dna-title">Dein Sound-Profil</h2>
          <div class="dna-helix">
            <div v-for="(segment, i) in musicDNA" :key="segment.name"
              class="dna-segment" :style="{ animationDelay: (i * 0.08) + 's' }">
              <div class="dna-bar-container">
                <div class="dna-bar" :style="{ height: segment.pct + '%', background: segment.color }">
                  <div class="dna-bar-glow" :style="{ background: segment.color }"></div>
                </div>
              </div>
              <span class="dna-pct">{{ segment.pct }}%</span>
              <span class="dna-label">{{ segment.name }}</span>
            </div>
          </div>
          <p class="dna-summary" v-if="musicDNA.length">
            Dein Sound ist zu <strong>{{ musicDNA[0]?.pct }}%</strong> von <strong>{{ musicDNA[0]?.name }}</strong> gepraegt
          </p>
        </div>

        <!-- SLIDE 14: Mood Gradient -->
        <div v-if="currentSlide === 14" class="slide-content slide-mood">
          <p class="slide-overline">DEINE STIMMUNG</p>
          <h2 class="mood-title">{{ moodData.dominant }}</h2>
          <div class="mood-grid">
            <div v-for="(mood, i) in moodData.moods" :key="mood.label"
              class="mood-card" :style="{ animationDelay: (i * 0.1 + 0.1) + 's' }">
              <span class="mood-emoji">{{ mood.emoji }}</span>
              <div class="mood-meter">
                <div class="mood-meter-fill" :style="{ width: mood.value + '%', background: mood.color }"></div>
              </div>
              <div class="mood-meta">
                <span class="mood-label">{{ mood.label }}</span>
                <span class="mood-value">{{ mood.value }}%</span>
              </div>
            </div>
          </div>
          <div class="mood-gradient-bar">
            <div class="mgb-inner" :style="{
              background: `linear-gradient(90deg, ${moodData.moods.map(m => m.color).join(', ')})`
            }"></div>
          </div>
          <p class="mood-footer">Basierend auf deinen Genres und Hoergewohnheiten</p>
        </div>

        <!-- SLIDE 15: Summary / Share -->
        <div v-if="currentSlide === 15" class="slide-content slide-summary">
          <div class="summary-card" ref="summaryCardRef">
            <h2 class="summary-title">Dein Wrapped</h2>
            <div class="summary-grid">
              <div class="summary-row" v-if="allArtists[0]">
                <span class="summary-label">#1 Artist</span>
                <span class="summary-value">{{ allArtists[0].name }}</span>
              </div>
              <div class="summary-row" v-if="allTracks[0]">
                <span class="summary-label">#1 Track</span>
                <span class="summary-value">{{ allTracks[0].name }}</span>
              </div>
              <div class="summary-row" v-if="topGenres[0]">
                <span class="summary-label">#1 Genre</span>
                <span class="summary-value">{{ topGenres[0].name }}</span>
              </div>
              <div class="summary-row" v-if="topAlbums[0]">
                <span class="summary-label">#1 Album</span>
                <span class="summary-value">{{ topAlbums[0].name }}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Musik-Typ</span>
                <span class="summary-value">{{ personality.emoji }} {{ personality.title }}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Vibe Score</span>
                <span class="summary-value">{{ avgPopularity }} / 100</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Treue-Score</span>
                <span class="summary-value">{{ loyaltyData.score }}%</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Artists</span>
                <span class="summary-value">{{ allArtists.length }}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Genres</span>
                <span class="summary-value">{{ uniqueGenres.length }}</span>
              </div>
              <div class="summary-row" v-if="decadeData[0]">
                <span class="summary-label">Aera</span>
                <span class="summary-value">{{ decadeData[0].label }}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Stimmung</span>
                <span class="summary-value">{{ moodData.dominant }}</span>
              </div>
            </div>
          </div>
          <div class="summary-actions">
            <button class="summary-btn btn-share" @click.stop="shareStory" :disabled="sharing">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
              {{ sharing ? 'Exportiere...' : 'Als Bild speichern' }}
            </button>
            <button class="summary-btn btn-playlist" @click.stop="createWrappedPlaylist" :disabled="creatingPlaylist || playlistCreated">
              <svg v-if="!playlistCreated" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {{ playlistCreated ? 'Playlist erstellt!' : (creatingPlaylist ? 'Erstelle...' : 'Playlist erstellen') }}
            </button>
            <button class="summary-btn btn-confetti" @click.stop="fireConfetti">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z"/>
              </svg>
              Feiern!
            </button>
          </div>
          <button class="restart-btn" @click.stop="currentSlide = 0; restartTimer()">
            Nochmal ansehen
          </button>
        </div>

      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { getAllTopArtists, getAllTopTracks, getUserProfile, createPlaylist, addTracksToPlaylist } from '@/services/spotify'
import { useAudioPlayer } from '@/composables/useAudioPlayer'
import html2canvas from 'html2canvas-pro'
import confetti from 'canvas-confetti'

defineEmits<{ close: [] }>()

const { play } = useAudioPlayer()

const overlayRef = ref<HTMLElement | null>(null)
const summaryCardRef = ref<HTMLElement | null>(null)
const profile = ref<any>(null)
const allArtists = ref<any[]>([])
const allTracks = ref<any[]>([])
const currentSlide = ref(0)
const slideDirection = ref('slide-right')
const loading = ref(true)
const slideDuration = 8000

const sharing = ref(false)
const creatingPlaylist = ref(false)
const playlistCreated = ref(false)

const slides = [
  { bg: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)' },
  { bg: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' },
  { bg: 'linear-gradient(135deg, #0a1628 0%, #1db954 100%)' },
  { bg: 'linear-gradient(135deg, #2d1b69 0%, #11001c 100%)' },
  { bg: 'linear-gradient(135deg, #1a0533 0%, #6d28d9 50%, #1a0533 100%)' },
  { bg: 'linear-gradient(135deg, #1a0a2e 0%, #ec4899 100%)' },
  { bg: 'linear-gradient(135deg, #0c1220 0%, #1e3a5f 100%)' },
  { bg: 'linear-gradient(135deg, #0a1a0a 0%, #065f46 100%)' },
  { bg: 'linear-gradient(135deg, #1c0a2e 0%, #be185d 100%)' },
  { bg: 'linear-gradient(135deg, #1a1a0a 0%, #ca8a04 100%)' },
  { bg: 'linear-gradient(135deg, #0c1a2e 0%, #0284c7 100%)' },
  // NEW: Hidden Gems
  { bg: 'linear-gradient(135deg, #0a1a1a 0%, #0d9488 100%)' },
  // NEW: Loyalty Score
  { bg: 'linear-gradient(135deg, #1a0a28 0%, #7c3aed 50%, #2e1065 100%)' },
  // NEW: Music DNA
  { bg: 'linear-gradient(135deg, #0a0a1a 0%, #3b82f6 50%, #1e40af 100%)' },
  // NEW: Mood Gradient
  { bg: 'linear-gradient(135deg, #1a0f0a 0%, #ea580c 50%, #9a3412 100%)' },
  // Summary (was 11, now 15)
  { bg: 'linear-gradient(135deg, #050505 0%, #1a1a1a 100%)' },
]

// ============== Computed data ==============

const uniqueGenres = computed(() => {
  const all: string[] = []
  allArtists.value.forEach((a: any) => {
    if (a.genres && Array.isArray(a.genres)) {
      all.push(...a.genres)
    }
  })
  return [...new Set(all)]
})

const topGenres = computed(() => {
  const map: Record<string, number> = {}
  allArtists.value.forEach((a: any) => {
    if (a.genres && Array.isArray(a.genres)) {
      a.genres.forEach((g: string) => {
        map[g] = (map[g] || 0) + 1
      })
    }
  })
  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
})

const uniqueAlbums = computed(() => {
  const seen = new Set<string>()
  const albums: any[] = []
  allTracks.value.forEach((t: any) => {
    const id = t.album?.id
    if (id && !seen.has(id)) {
      seen.add(id)
      albums.push(t.album)
    }
  })
  return albums
})

const topAlbums = computed(() => {
  const map: Record<string, { id: string; name: string; artist: string; image: string; count: number }> = {}
  allTracks.value.forEach((t: any) => {
    const id = t.album?.id
    if (!id) return
    if (!map[id]) {
      map[id] = {
        id,
        name: t.album.name,
        artist: t.artists?.map((a: any) => a.name).join(', ') ?? '',
        image: t.album.images?.[0]?.url ?? '',
        count: 0,
      }
    }
    map[id].count++
  })
  return Object.values(map).sort((a, b) => b.count - a.count)
})

const avgPopularity = computed(() => {
  if (!allArtists.value.length) return 0
  const sum = allArtists.value.reduce((acc: number, a: any) => acc + (a.popularity || 0), 0)
  return Math.round(sum / allArtists.value.length)
})

const mainstreamLabel = computed(() => {
  const p = avgPopularity.value
  if (p >= 75) return 'Total Mainstream'
  if (p >= 60) return 'Populaer mit Stil'
  if (p >= 45) return 'Der goldene Mittelweg'
  if (p >= 30) return 'Indie Entdecker'
  return 'Underground Explorer'
})

const mostObscure = computed(() => {
  if (!allArtists.value.length) return null
  return [...allArtists.value].sort((a, b) => a.popularity - b.popularity)[0]
})

const mostPopular = computed(() => {
  if (!allArtists.value.length) return null
  return [...allArtists.value].sort((a, b) => b.popularity - a.popularity)[0]
})

const decadeData = computed(() => {
  const map: Record<string, number> = {}
  allTracks.value.forEach((t: any) => {
    const year = parseInt(t.album?.release_date?.slice(0, 4))
    if (!year || isNaN(year)) return
    const decade = Math.floor(year / 10) * 10
    const label = `${decade}s`
    map[label] = (map[label] || 0) + 1
  })

  const colors = ['#1db954', '#a855f7', '#ec4899', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6']

  return Object.entries(map)
    .map(([label, count], i) => ({ label, count, color: colors[i % colors.length] }))
    .sort((a, b) => b.count - a.count)
})

const personality = computed(() => {
  const genres = topGenres.value.map(g => g.name.toLowerCase())
  const pop = avgPopularity.value
  const genreCount = uniqueGenres.value.length
  const topGenreStr = genres.slice(0, 10).join(' ')

  // Diversity score
  const diversity = Math.min(100, Math.round((genreCount / Math.max(allArtists.value.length, 1)) * 100))
  // Obscurity score (inverse of popularity)
  const obscurity = 100 - pop

  let title = 'Musikliebhaber'
  let emoji = '🎵'
  let desc = 'Du hoerst alles querbeet.'

  if (topGenreStr.includes('rock') || topGenreStr.includes('metal') || topGenreStr.includes('punk')) {
    title = 'Der Rockstar'
    emoji = '🎸'
    desc = 'Gitarren, Drums, Energie. Du lebst den Rock-Lifestyle.'
  } else if (topGenreStr.includes('hip hop') || topGenreStr.includes('rap') || topGenreStr.includes('trap')) {
    title = 'Der Beat-Rider'
    emoji = '🎤'
    desc = 'Bars, Beats und Flow. Hip-Hop ist dein Herzschlag.'
  } else if (topGenreStr.includes('pop')) {
    title = 'Der Pop-Connoisseur'
    emoji = '✨'
    desc = 'Catchy Hooks und gute Vibes. Du weisst, was ein Hit ist.'
  } else if (topGenreStr.includes('electro') || topGenreStr.includes('edm') || topGenreStr.includes('house') || topGenreStr.includes('techno')) {
    title = 'Der Raver'
    emoji = '🎛️'
    desc = 'Bass, Drops und endlose Energie. Die Nacht ist jung.'
  } else if (topGenreStr.includes('r&b') || topGenreStr.includes('soul') || topGenreStr.includes('neo soul')) {
    title = 'Der Smooth Operator'
    emoji = '🎷'
    desc = 'Smooth Vibes und Gefuehl. R&B fliesst durch deine Adern.'
  } else if (topGenreStr.includes('jazz') || topGenreStr.includes('blues')) {
    title = 'Der Jazz-Kenner'
    emoji = '🎹'
    desc = 'Improvisation und Soul. Du schaetzt die Kunst der Musik.'
  } else if (topGenreStr.includes('classical') || topGenreStr.includes('orchestra')) {
    title = 'Der Klassik-Aesthet'
    emoji = '🎻'
    desc = 'Zeitlose Eleganz. Von Bach bis Beethoven, dein Geschmack ist raffiniert.'
  } else if (topGenreStr.includes('indie') || topGenreStr.includes('alternative')) {
    title = 'Der Indie-Explorer'
    emoji = '🌿'
    desc = 'Abseits des Mainstreams. Du entdeckst, was andere noch nicht kennen.'
  } else if (topGenreStr.includes('latin') || topGenreStr.includes('reggaeton')) {
    title = 'Der Latin Lover'
    emoji = '💃'
    desc = 'Ritmo y sabor. Dein Beat bringt jeden zum Tanzen.'
  } else if (genreCount > 20) {
    title = 'Der Eklektiker'
    emoji = '🌍'
    desc = 'Dein Geschmack kennt keine Grenzen. Von allem ein bisschen, von allem das Beste.'
  }

  const traits = [
    { label: 'Mainstream', value: pop, color: 'linear-gradient(90deg, #1db954, #a855f7)' },
    { label: 'Vielfalt', value: diversity, color: 'linear-gradient(90deg, #06b6d4, #ec4899)' },
    { label: 'Entdecker', value: obscurity, color: 'linear-gradient(90deg, #f59e0b, #ef4444)' },
  ]

  return { title, emoji, desc, traits }
})

// Hidden Gems: tracks with lowest popularity
const hiddenGems = computed(() => {
  return [...allTracks.value]
    .filter((t: any) => t.popularity !== undefined && t.popularity !== null)
    .sort((a: any, b: any) => a.popularity - b.popularity)
    .slice(0, 5)
})

// Loyalty Score: how many artists appear across multiple time ranges
// Simulated by checking how concentrated the top tracks are among few artists
const loyaltyData = computed(() => {
  const artistTrackCount: Record<string, { name: string; count: number; image: string }> = {}
  allTracks.value.forEach((t: any) => {
    const artistId = t.artists?.[0]?.id
    const artistName = t.artists?.[0]?.name
    if (!artistId) return
    if (!artistTrackCount[artistId]) {
      artistTrackCount[artistId] = {
        name: artistName ?? 'Unknown',
        count: 0,
        image: t.album?.images?.[0]?.url ?? '',
      }
    }
    artistTrackCount[artistId].count++
  })
  const sorted = Object.values(artistTrackCount).sort((a, b) => b.count - a.count)
  // Loyalty score: how much of top tracks belong to top 5 artists
  const top5Count = sorted.slice(0, 5).reduce((acc, a) => acc + a.count, 0)
  const total = allTracks.value.length || 1
  const score = Math.round((top5Count / total) * 100)
  return {
    score,
    topArtists: sorted.slice(0, 5),
    label: score >= 60 ? 'Treue Seele' : score >= 40 ? 'Ausgewogen' : 'Entdecker',
  }
})

// Music DNA: genre distribution as a visual DNA strand
const musicDNA = computed(() => {
  const genreList = topGenres.value.slice(0, 8)
  const total = genreList.reduce((acc, g) => acc + g.count, 0) || 1
  return genreList.map((g, i) => ({
    name: g.name,
    pct: Math.round((g.count / total) * 100),
    color: [
      '#1db954', '#a855f7', '#ec4899', '#06b6d4',
      '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6',
    ][i % 8],
  }))
})

// Mood Gradient: based on track audio features approximation via popularity + tempo hints
const moodData = computed(() => {
  // We don't have audio features from basic API, so we approximate mood from:
  // - Average popularity (energy proxy)
  // - Genre keywords (mood keywords)
  const pop = avgPopularity.value
  const genreStr = topGenres.value.map(g => g.name.toLowerCase()).join(' ')

  let energy = Math.min(100, pop + 10)
  let chill = 100 - energy
  let happy = 50
  let melancholy = 50

  if (genreStr.includes('happy') || genreStr.includes('pop') || genreStr.includes('dance')) {
    happy = 75; melancholy = 25
  }
  if (genreStr.includes('sad') || genreStr.includes('emo') || genreStr.includes('blues') || genreStr.includes('melanchol')) {
    melancholy = 70; happy = 30
  }
  if (genreStr.includes('chill') || genreStr.includes('ambient') || genreStr.includes('lo-fi') || genreStr.includes('lofi')) {
    chill = 70; energy = 30
  }
  if (genreStr.includes('metal') || genreStr.includes('punk') || genreStr.includes('hardcore') || genreStr.includes('edm') || genreStr.includes('techno')) {
    energy = 85; chill = 15
  }
  if (genreStr.includes('hip hop') || genreStr.includes('rap') || genreStr.includes('trap')) {
    energy = 70; happy = 60; melancholy = 40
  }
  if (genreStr.includes('r&b') || genreStr.includes('soul') || genreStr.includes('jazz')) {
    chill = 60; happy = 55; melancholy = 45
  }

  return {
    moods: [
      { label: 'Energie', value: energy, color: '#ef4444', emoji: '⚡' },
      { label: 'Chill', value: chill, color: '#06b6d4', emoji: '🌊' },
      { label: 'Happy', value: happy, color: '#f59e0b', emoji: '☀️' },
      { label: 'Melancholie', value: melancholy, color: '#8b5cf6', emoji: '🌙' },
    ],
    dominant: energy >= chill
      ? (energy >= 70 ? 'Energiegeladen' : 'Ausgeglichen')
      : (chill >= 70 ? 'Tiefenentspannt' : 'Ausgeglichen'),
  }
})

// ============== Helpers ==============

function genreColor(i: number) {
  const colors = [
    'linear-gradient(90deg, #1db954, #a855f7)',
    'linear-gradient(90deg, #a855f7, #ec4899)',
    'linear-gradient(90deg, #ec4899, #f59e0b)',
    'linear-gradient(90deg, #06b6d4, #1db954)',
    'linear-gradient(90deg, #f59e0b, #ef4444)',
    'linear-gradient(90deg, #8b5cf6, #06b6d4)',
    'linear-gradient(90deg, #ef4444, #a855f7)',
    'linear-gradient(90deg, #1db954, #06b6d4)',
    'linear-gradient(90deg, #ec4899, #8b5cf6)',
    'linear-gradient(90deg, #f59e0b, #1db954)',
  ]
  return colors[i % colors.length]
}

function popColor(pop: number) {
  if (pop >= 80) return 'rgba(29, 185, 84, 0.3)'
  if (pop >= 60) return 'rgba(168, 85, 247, 0.3)'
  if (pop >= 40) return 'rgba(236, 72, 153, 0.3)'
  return 'rgba(245, 158, 11, 0.3)'
}

function formatNumber(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K'
  return n.toString()
}

// ============== Navigation ==============

let timer: ReturnType<typeof setInterval> | null = null

function startTimer() {
  stopTimer()
  timer = setInterval(() => {
    if (currentSlide.value < slides.length - 1) {
      slideDirection.value = 'slide-right'
      currentSlide.value++
    } else {
      stopTimer()
    }
  }, slideDuration)
}

function stopTimer() {
  if (timer) { clearInterval(timer); timer = null }
}

function restartTimer() { startTimer() }

function nextSlide() {
  if (currentSlide.value < slides.length - 1) {
    slideDirection.value = 'slide-right'
    currentSlide.value++
    startTimer()
  }
}

function prevSlide() {
  if (currentSlide.value > 0) {
    slideDirection.value = 'slide-left'
    currentSlide.value--
    startTimer()
  }
}

function handleClick(e: MouseEvent) {
  const el = e.currentTarget as HTMLElement
  const x = e.clientX / el.clientWidth
  if (x > 0.5) nextSlide()
  else prevSlide()
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); nextSlide() }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); prevSlide() }
  else if (e.key === 'Escape') { e.preventDefault() }
}

// Touch swipe support for mobile
const touchStartX = ref(0)
const touchStartY = ref(0)

function onTouchStart(e: TouchEvent) {
  const touch = e.touches[0]
  if (touch) {
    touchStartX.value = touch.clientX
    touchStartY.value = touch.clientY
  }
}

function onTouchEnd(e: TouchEvent) {
  const touch = e.changedTouches[0]
  if (!touch) return
  const dx = touch.clientX - touchStartX.value
  const dy = touch.clientY - touchStartY.value
  // Only trigger on horizontal swipes (not vertical scrolls)
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
    if (dx < 0) nextSlide()  // swipe left → next
    else prevSlide()         // swipe right → prev
  }
}

function playTrack(track: any) {
  stopTimer() // Pause auto-advance when playing
  play({
    id: track.id,
    name: track.name,
    artist: track.artists?.map((a: any) => a.name).join(', ') ?? '',
    albumArt: track.album?.images[0]?.url ?? '',
    previewUrl: track.preview_url,
    spotifyUri: track.uri ?? `spotify:track:${track.id}`,
    spotifyUrl: track.external_urls?.spotify ?? '',
  })
}

async function shareStory() {
  sharing.value = true
  try {
    const summaryEl = document.querySelector('.summary-card') as HTMLElement
    if (!summaryEl) return
    const canvas = await html2canvas(summaryEl, {
      backgroundColor: '#0a0a0a',
      scale: 2,
      useCORS: true,
    })
    const link = document.createElement('a')
    link.download = 'spotify-wrapped.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  } catch (err) {
    console.error('[Story] Share failed:', err)
  }
  sharing.value = false
}

async function createWrappedPlaylist() {
  const token = localStorage.getItem('spotify_token') || ''
  if (!token || creatingPlaylist.value) return
  creatingPlaylist.value = true
  try {
    const p = await getUserProfile(token)
    const now = new Date().toLocaleDateString('de-DE')
    const playlist = await createPlaylist(
      token,
      p.id,
      `Mein Wrapped - ${now}`,
      'Meine Top Tracks - erstellt von Spotify Wrapped',
      false,
    )
    const uris = allTracks.value.slice(0, 50).map((t: any) => t.uri || `spotify:track:${t.id}`)
    await addTracksToPlaylist(token, playlist.id, uris)
    playlistCreated.value = true
  } catch (err) {
    console.error('[Story] Playlist creation failed:', err)
  }
  creatingPlaylist.value = false
}

function fireConfetti() {
  const duration = 3000
  const end = Date.now() + duration
  const colors = ['#1db954', '#a855f7', '#ec4899', '#06b6d4', '#f59e0b']

  function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
    })
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
    })
    if (Date.now() < end) requestAnimationFrame(frame)
  }
  frame()
}

// ============== Lifecycle ==============

// Fire confetti when arriving at summary slide
watch(currentSlide, (val) => {
  if (val === slides.length - 1) {
    setTimeout(fireConfetti, 400)
  }
})

onMounted(async () => {
  const token = localStorage.getItem('spotify_token') || ''
  try {
    const [p, a, t] = await Promise.all([
      getUserProfile(token),
      getAllTopArtists(token),
      getAllTopTracks(token),
    ])
    profile.value = p
    allArtists.value = a
    allTracks.value = t
    console.log(`[Story] Loaded: ${a.length} artists, ${t.length} tracks, ${topGenres.value.length} genres`)
  } catch (err) {
    console.error('[Story] Failed to load data:', err)
  }
  loading.value = false
  await nextTick()
  overlayRef.value?.focus()
  startTimer()
})

onUnmounted(() => {
  stopTimer()
})
</script>

<style scoped>
.story-overlay {
  position: fixed;
  inset: 0;
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  outline: none;
}

/* ---- Loading ---- */
.story-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  z-index: 10;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.loader-ring {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(255,255,255,0.1);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spinnerRotate 0.8s linear infinite;
}

/* ---- Progress bars ---- */
.story-progress {
  position: absolute;
  top: 16px;
  left: 16px;
  right: 16px;
  display: flex;
  gap: 3px;
  z-index: 10;
}

.progress-seg {
  flex: 1;
  height: 3px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
  overflow: hidden;
}

.progress-seg-fill {
  height: 100%;
  border-radius: 2px;
  background: #fff;
  width: 0%;
}

.progress-seg-fill.done { width: 100%; }
.progress-seg-fill.active { animation: progressFill linear forwards; }

@keyframes progressFill {
  from { width: 0%; }
  to { width: 100%; }
}

/* ---- Slide counter ---- */
.slide-counter {
  position: absolute;
  top: 32px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  font-size: 0.6rem;
  font-weight: 600;
  color: rgba(255,255,255,0.4);
  letter-spacing: 0.1em;
}

/* ---- Close ---- */
.story-close {
  position: absolute;
  top: 28px;
  right: 20px;
  z-index: 10;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.story-close:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

/* ---- Nav arrows ---- */
.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  opacity: 0;
}

.story-overlay:hover .nav-arrow { opacity: 1; }
.nav-left { left: 16px; }
.nav-right { right: 16px; }
.nav-arrow:hover { background: rgba(255,255,255,0.15); color: #fff; }

/* On touch devices, always show nav arrows (with reduced opacity) */
@media (hover: none) and (pointer: coarse) {
  .nav-arrow { opacity: 0.6; }
}

/* ---- Slide ---- */
.slide {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
}

.slide-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 60px 24px 40px;
  max-width: 520px;
  width: 100%;
}

/* ---- Slide transitions ---- */
.slide-right-enter-active, .slide-right-leave-active,
.slide-left-enter-active, .slide-left-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-right-enter-from { opacity: 0; transform: translateX(60px) scale(0.95); }
.slide-right-leave-to { opacity: 0; transform: translateX(-60px) scale(0.95); }
.slide-left-enter-from { opacity: 0; transform: translateX(-60px) scale(0.95); }
.slide-left-leave-to { opacity: 0; transform: translateX(60px) scale(0.95); }

/* ---- Shared ---- */
.slide-overline {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: 16px;
  animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.no-data-msg {
  font-size: 0.85rem;
  color: var(--text-muted);
  padding: 40px 0;
}

/* ======= SLIDE 0: Welcome ======= */
.welcome-avatar {
  position: relative;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 24px;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
}

.welcome-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-ring {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid transparent;
  background: linear-gradient(135deg, var(--accent), var(--accent-2), var(--accent-3)) border-box;
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: logoSpin 4s linear infinite;
}

@keyframes logoSpin { to { transform: rotate(360deg); } }

.welcome-title {
  font-size: 2.2rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin: 0 0 8px;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
}

.welcome-sub {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0 0 32px;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
}

.welcome-wave {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 50px;
  margin-bottom: 24px;
  animation: fadeIn 0.8s ease 0.5s both;
}

.w-bar {
  width: 4px;
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(to top, var(--accent), var(--accent-2));
  animation: wBounce 1s ease-in-out infinite alternate;
}

@keyframes wBounce {
  0% { transform: scaleY(0.15); }
  100% { transform: scaleY(1); }
}

.welcome-stats-preview {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.72rem;
  color: var(--text-muted);
  margin-bottom: 24px;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.6s both;
}

.welcome-stats-preview .dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--text-muted);
}

.welcome-hint {
  font-size: 0.7rem;
  color: var(--text-muted);
  animation: pulse 2s ease-in-out infinite;
}

/* ======= SLIDE 1: Stats ======= */
.stats-headline {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0 0 24px;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
}

.stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  width: 100%;
  max-width: 320px;
}

.stat-card {
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
  overflow: hidden;
}

.stat-card:nth-child(1) { animation-delay: 0.1s; }
.stat-card:nth-child(2) { animation-delay: 0.2s; }
.stat-card:nth-child(3) { animation-delay: 0.3s; }
.stat-card:nth-child(4) { animation-delay: 0.4s; }

.stat-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  color: rgba(255,255,255,0.1);
}

.stat-number {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-artists .stat-number { background: linear-gradient(135deg, #1db954, #a855f7); -webkit-background-clip: text; background-clip: text; }
.stat-tracks .stat-number { background: linear-gradient(135deg, #a855f7, #ec4899); -webkit-background-clip: text; background-clip: text; }
.stat-genres .stat-number { background: linear-gradient(135deg, #06b6d4, #1db954); -webkit-background-clip: text; background-clip: text; }
.stat-albums .stat-number { background: linear-gradient(135deg, #f59e0b, #ef4444); -webkit-background-clip: text; background-clip: text; }

.stat-desc {
  font-size: 0.68rem;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* ======= SLIDE 2: #1 Artist ======= */
.artist-hero-img {
  position: relative;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  overflow: visible;
  margin-bottom: 24px;
  animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
}

.artist-hero-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.15);
  position: relative;
  z-index: 2;
}

.artist-hero-gradient {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.4) 100%);
  z-index: 3;
}

.hero-pulse-ring {
  position: absolute;
  inset: -12px;
  border-radius: 50%;
  border: 2px solid rgba(29, 185, 84, 0.3);
  z-index: 1;
  animation: heroPulse 2.5s ease-in-out infinite;
}

.hero-pulse-ring.ring-2 {
  inset: -24px;
  border-color: rgba(29, 185, 84, 0.15);
  animation-delay: 0.5s;
}

@keyframes heroPulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.05); opacity: 1; }
}

.artist-hero-name {
  font-size: 1.8rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0 0 6px;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.35s both;
}

.artist-hero-genres {
  font-size: 0.78rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 20px;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both;
}

.hero-pop-bar {
  width: 200px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 6px;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both;
}

.hero-pop-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
  border-radius: 2px;
  transition: width 1s cubic-bezier(0.16, 1, 0.3, 1);
}

.hero-pop-label {
  font-size: 0.65rem;
  color: var(--text-muted);
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.55s both;
}

.pop-num { font-weight: 800; color: var(--text-secondary); }

.hero-followers {
  margin-top: 12px;
  font-size: 0.7rem;
  color: var(--text-muted);
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.6s both;
}

/* ======= SLIDE 3: Genres ======= */
.genres-title {
  font-size: 1.4rem;
  font-weight: 800;
  margin: 0 0 24px;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
}

.genre-bars {
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.genre-row {
  display: flex;
  align-items: center;
  gap: 8px;
  animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.genre-rank {
  width: 28px;
  font-size: 0.6rem;
  font-weight: 700;
  color: var(--text-muted);
  text-align: center;
  flex-shrink: 0;
}

.genre-name {
  width: 80px;
  text-align: right;
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
}

.genre-bar-bg {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 4px;
  overflow: hidden;
}

.genre-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.genre-count {
  font-size: 0.6rem;
  font-weight: 700;
  color: var(--text-muted);
  width: 24px;
  text-align: right;
}

.genre-summary {
  margin-top: 20px;
  font-size: 0.82rem;
  color: var(--text-secondary);
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.8s both;
}

.genre-summary strong { color: #fff; }

/* ======= SLIDE 4: Personality ======= */
.personality-emoji {
  font-size: 3.5rem;
  margin-bottom: 12px;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
  filter: saturate(1.2);
}

.personality-title {
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0 0 8px;
  background: linear-gradient(135deg, #fff, rgba(255,255,255,0.8));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
}

.personality-desc {
  font-size: 0.88rem;
  color: var(--text-secondary);
  margin: 0 0 32px;
  max-width: 320px;
  line-height: 1.5;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
}

.personality-traits {
  width: 100%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.trait {
  display: flex;
  align-items: center;
  gap: 10px;
  animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.trait:nth-child(1) { animation-delay: 0.4s; }
.trait:nth-child(2) { animation-delay: 0.5s; }
.trait:nth-child(3) { animation-delay: 0.6s; }

.trait-label {
  width: 72px;
  text-align: right;
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.trait-bar-bg {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 4px;
  overflow: hidden;
}

.trait-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 1s cubic-bezier(0.16, 1, 0.3, 1);
}

.trait-value {
  width: 32px;
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--text-muted);
}

/* ======= SLIDE 5: #1 Track ======= */
.track-hero-art {
  position: relative;
  width: 200px;
  height: 200px;
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 24px;
  animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
  box-shadow: 0 16px 60px rgba(0, 0, 0, 0.5), 0 0 60px var(--accent-3-glow);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.track-hero-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.track-vinyl-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.vinyl-groove {
  position: absolute;
  inset: 20%;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 50%;
  animation: grooveSpin 12s linear infinite;
}

.vinyl-groove.groove-2 { inset: 30%; animation-duration: 10s; animation-direction: reverse; }
.vinyl-groove.groove-3 { inset: 40%; animation-duration: 8s; }

@keyframes grooveSpin { to { transform: rotate(360deg); } }

.track-hero-name {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0 0 4px;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.35s both;
}

.track-hero-artist {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0 0 4px;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both;
}

.track-hero-album {
  font-size: 0.72rem;
  color: var(--text-muted);
  margin: 0 0 20px;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.45s both;
}

.play-hero-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border-radius: 50px;
  border: none;
  background: var(--accent);
  color: #000;
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both;
}

.play-hero-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 24px var(--accent-glow);
}

/* ======= SLIDE 6: Top 5 Artists Mosaic ======= */
.mosaic-grid {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 12px;
}

.mosaic-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.mosaic-img {
  position: relative;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.12);
  transition: all 0.3s ease;
}

.mosaic-img.mosaic-1 {
  width: 96px;
  height: 96px;
  border-color: var(--accent);
  box-shadow: 0 0 24px var(--accent-glow);
}

.mosaic-img.mosaic-2 { border-color: rgba(192, 192, 192, 0.4); }
.mosaic-img.mosaic-3 { border-color: rgba(205, 127, 50, 0.4); }

.mosaic-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mosaic-rank {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--accent);
  color: #000;
  font-size: 0.6rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mosaic-name {
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--text-secondary);
  max-width: 88px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mosaic-genre {
  font-size: 0.55rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  max-width: 88px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ======= SLIDE 7: Mainstream vs Underground ======= */
.mainstream-title {
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0 0 32px;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
}

.mainstream-meter {
  width: 100%;
  max-width: 340px;
  margin-bottom: 32px;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
}

.meter-bg {
  position: relative;
  height: 12px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  overflow: visible;
}

.meter-fill {
  height: 100%;
  border-radius: 6px;
  background: linear-gradient(90deg, #06b6d4, #1db954, #a855f7, #ec4899);
  position: relative;
  transition: width 1.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.meter-glow {
  position: absolute;
  right: -4px;
  top: -4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 16px rgba(255,255,255,0.5);
  opacity: 0.8;
}

.meter-indicator {
  position: absolute;
  top: 20px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: left 1.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.indicator-dot {
  width: 2px;
  height: 8px;
  background: rgba(255,255,255,0.4);
  margin-bottom: 4px;
}

.indicator-label {
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--text-secondary);
}

.meter-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 28px;
  font-size: 0.62rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.mainstream-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 300px;
}

.mainstream-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 16px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px;
  animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.mainstream-stat:nth-child(1) { animation-delay: 0.4s; }
.mainstream-stat:nth-child(2) { animation-delay: 0.5s; }

.ms-value {
  font-size: 0.85rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ms-label {
  font-size: 0.62rem;
  color: var(--text-muted);
}

/* ======= SLIDE 8: Top 5 Tracks ======= */
.top-tracks-list {
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
}

.top-track-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 14px;
  transition: all 0.25s ease;
  animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.top-track-item:hover {
  background: rgba(255,255,255,0.06);
}

.tt-rank {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--text-muted);
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}

.tt-art {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid rgba(255,255,255,0.08);
}

.tt-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tt-play-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.top-track-item:hover .tt-play-overlay { opacity: 1; }

.tt-info {
  flex: 1;
  min-width: 0;
  text-align: left;
}

.tt-name {
  font-size: 0.82rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tt-artist {
  font-size: 0.65rem;
  color: var(--text-muted);
  margin-top: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tt-pop-badge {
  padding: 3px 8px;
  border-radius: 8px;
  font-size: 0.6rem;
  font-weight: 700;
  flex-shrink: 0;
}

/* ======= SLIDE 9: Top Albums ======= */
.albums-title {
  font-size: 1.3rem;
  font-weight: 800;
  margin: 0 0 20px;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
}

.albums-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  width: 100%;
  max-width: 360px;
}

.album-card {
  display: flex;
  gap: 10px;
  padding: 10px;
  border-radius: 14px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
  transition: all 0.25s ease;
}

.album-card:hover {
  background: rgba(255,255,255,0.08);
  transform: scale(1.02);
}

.album-art {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.album-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.album-info {
  flex: 1;
  min-width: 0;
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1px;
}

.album-name {
  font-size: 0.7rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-artist {
  font-size: 0.58rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-count {
  font-size: 0.55rem;
  color: var(--accent);
  font-weight: 600;
}

/* ======= SLIDE 10: Decades ======= */
.decades-title {
  font-size: 1.3rem;
  font-weight: 800;
  margin: 0 0 24px;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
}

.decade-bars {
  width: 100%;
  max-width: 340px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.decade-row {
  display: flex;
  align-items: center;
  gap: 10px;
  animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.decade-label {
  width: 44px;
  text-align: right;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.decade-bar-bg {
  flex: 1;
  height: 10px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 5px;
  overflow: hidden;
}

.decade-bar-fill {
  height: 100%;
  border-radius: 5px;
  transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.decade-count {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--text-muted);
  width: 24px;
  text-align: right;
}

.decade-verdict {
  margin-top: 24px;
  font-size: 0.88rem;
  color: var(--text-secondary);
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.6s both;
}

.decade-verdict strong { color: #fff; }

/* ======= SLIDE 11: Summary ======= */
.summary-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 28px;
  width: 100%;
  max-width: 360px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
  margin-bottom: 20px;
}

.summary-title {
  font-size: 1.3rem;
  font-weight: 800;
  margin: 0 0 16px;
  text-align: center;
  background: linear-gradient(135deg, var(--accent), var(--accent-2), var(--accent-3));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.summary-grid {
  display: flex;
  flex-direction: column;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.summary-row:last-child { border-bottom: none; }

.summary-label {
  font-size: 0.68rem;
  color: var(--text-muted);
  font-weight: 500;
}

.summary-value {
  font-size: 0.78rem;
  font-weight: 600;
  text-align: right;
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.restart-btn {
  padding: 12px 32px;
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  font-family: 'Inter', sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
}

.restart-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: scale(1.04);
}

/* Summary Actions */
.summary-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-bottom: 14px;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
}

.summary-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: 50px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.06);
  color: #fff;
  font-family: 'Inter', sans-serif;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.summary-btn:hover {
  background: rgba(255,255,255,0.12);
  transform: translateY(-2px);
}

.summary-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-share:hover { border-color: rgba(6, 182, 212, 0.4); color: #06b6d4; }
.btn-playlist:hover { border-color: rgba(29, 185, 84, 0.4); color: var(--accent); }
.btn-confetti:hover { border-color: rgba(245, 158, 11, 0.4); color: #f59e0b; }

/* ---- Responsive ---- */
@media (max-width: 768px) {
  .nav-arrow { width: 38px; height: 38px; }
  .nav-left { left: 8px; }
  .nav-right { right: 8px; }
  .slide-content { padding: 56px 20px 32px; max-width: 480px; }
  .hero-pop-bar { width: 160px; }
  .loyalty-score-ring { width: 120px; height: 120px; }
}

@media (max-width: 520px) {
  .stat-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
  .mosaic-grid { gap: 8px; }
  .artist-hero-img { width: 140px; height: 140px; }
  .track-hero-art { width: 160px; height: 160px; }
  .albums-grid { grid-template-columns: 1fr; }
  .mainstream-title { font-size: 1.3rem; }
  .slide-content { padding: 50px 16px 24px; }
  .dna-helix { gap: 6px; }
  .mood-grid { grid-template-columns: 1fr; max-width: 260px; }
  .nav-arrow { width: 34px; height: 34px; }
  .nav-left { left: 6px; }
  .nav-right { right: 6px; }
  .hero-pop-bar { width: 140px; }
}

@media (max-width: 380px) {
  .slide-content { padding: 46px 12px 20px; }
  .artist-hero-img { width: 120px; height: 120px; }
  .track-hero-art { width: 130px; height: 130px; }
  .loyalty-score-ring { width: 100px; height: 100px; }
  .dna-helix { height: 120px; }
  .stat-grid { gap: 6px; }
  .stat-number { font-size: 1.6rem; }
  .welcome-title { font-size: 1.5rem; }
  .nav-arrow { display: none; } /* On very small screens, rely on tap/swipe only */
}

/* ======= SLIDE 11: Hidden Gems ======= */
.gems-title {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0 0 4px;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
}

.gems-subtitle {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin: 0 0 24px;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both;
}

.gems-list {
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.gem-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.25s ease;
  animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.gem-item:hover {
  background: rgba(255,255,255,0.06);
  transform: translateX(4px);
}

.gem-rank {
  color: #0d9488;
  flex-shrink: 0;
  animation: pulse 3s ease-in-out infinite;
}

.gem-art {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid rgba(255,255,255,0.08);
}

.gem-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gem-info {
  flex: 1;
  min-width: 0;
  text-align: left;
}

.gem-name {
  font-size: 0.78rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gem-artist {
  font-size: 0.62rem;
  color: var(--text-muted);
  margin-top: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gem-pop-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 10px;
  border-radius: 10px;
  background: rgba(13, 148, 136, 0.15);
  border: 1px solid rgba(13, 148, 136, 0.2);
  flex-shrink: 0;
}

.gem-pop-num {
  font-size: 0.75rem;
  font-weight: 800;
  color: #0d9488;
}

.gem-pop-label {
  font-size: 0.45rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.gems-footer {
  margin-top: 20px;
  font-size: 0.78rem;
  color: var(--text-secondary);
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.6s both;
}

.gems-footer strong { color: #0d9488; font-weight: 800; }

/* ======= SLIDE 12: Loyalty Score ======= */
.loyalty-score-ring {
  position: relative;
  width: 140px;
  height: 140px;
  margin-bottom: 20px;
  animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
}

.loyalty-svg {
  width: 100%;
  height: 100%;
}

.loyalty-progress {
  transition: stroke-dasharray 1.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.loyalty-score-inner {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loyalty-num {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #7c3aed, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.loyalty-pct {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-muted);
  margin-top: 8px;
}

.loyalty-title {
  font-size: 1.6rem;
  font-weight: 800;
  margin: 0 0 6px;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
}

.loyalty-desc {
  font-size: 0.78rem;
  color: var(--text-secondary);
  margin: 0 0 24px;
  max-width: 300px;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.25s both;
}

.loyalty-artists {
  width: 100%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.loyalty-artist-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 12px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.la-img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.la-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.la-name {
  flex: 1;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.la-count {
  font-size: 0.62rem;
  color: var(--text-muted);
  font-weight: 600;
  flex-shrink: 0;
}

/* ======= SLIDE 13: Music DNA ======= */
.dna-title {
  font-size: 1.4rem;
  font-weight: 800;
  margin: 0 0 28px;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
}

.dna-helix {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  height: 160px;
  width: 100%;
  max-width: 380px;
  justify-content: center;
}

.dna-segment {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
  animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.dna-bar-container {
  width: 100%;
  height: 120px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.dna-bar {
  width: 100%;
  max-width: 28px;
  border-radius: 8px 8px 4px 4px;
  position: relative;
  transition: height 1s cubic-bezier(0.16, 1, 0.3, 1);
  min-height: 4px;
}

.dna-bar-glow {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  filter: blur(8px);
  opacity: 0.3;
}

.dna-pct {
  font-size: 0.6rem;
  font-weight: 800;
  color: var(--text-secondary);
}

.dna-label {
  font-size: 0.5rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  text-align: center;
  max-width: 56px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dna-summary {
  margin-top: 24px;
  font-size: 0.82rem;
  color: var(--text-secondary);
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.7s both;
}

.dna-summary strong { color: #fff; }

/* ======= SLIDE 14: Mood Gradient ======= */
.mood-title {
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0 0 28px;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
}

.mood-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  width: 100%;
  max-width: 340px;
  margin-bottom: 24px;
}

.mood-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  border-radius: 16px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.mood-emoji {
  font-size: 1.8rem;
  filter: saturate(1.2);
}

.mood-meter {
  width: 100%;
  height: 6px;
  background: rgba(255,255,255,0.06);
  border-radius: 3px;
  overflow: hidden;
}

.mood-meter-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 1.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.mood-meta {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.mood-label {
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.mood-value {
  font-size: 0.65rem;
  font-weight: 800;
  color: var(--text-muted);
}

.mood-gradient-bar {
  width: 100%;
  max-width: 300px;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  background: rgba(255,255,255,0.04);
  margin-bottom: 16px;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both;
}

.mgb-inner {
  width: 100%;
  height: 100%;
  border-radius: 4px;
}

.mood-footer {
  font-size: 0.65rem;
  color: var(--text-muted);
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.6s both;
}

@keyframes spinnerRotate { to { transform: rotate(360deg); } }
</style>
