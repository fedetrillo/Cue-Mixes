// Cue Mixes: four headphone mixes built on LUNA's cue sends (every channel's cue_0..cue_3
// outputs, which LUNA routes to CUE 1-4). Each cue starts from your channel faders, then moves
// by groups (Click always, the rest the session's own), by channel, and "more me" for the
// musician's own channels. Your main mix is never touched.
// The pure part (suggested groups, the level of a send, paste) lives in logic.js.

(() => {
  const $ = (id) => document.getElementById(id);
  const C = window.CueLogic;
  const VERSION = '1.0.0';
  const KEY = 'com.fedetrillo.cuemixes.';
  const store = {
    get: (k) => { try { return JSON.parse(localStorage.getItem(KEY + k)); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(KEY + k, JSON.stringify(v)); } catch { /* not fatal */ } },
  };

  const I18N = {
    en: {
      kSub: "Sub-mix", subTag: "Via its channels", subTip: "A bus your channels go through: the cues take its channels one by one, so it stays silent in the cues and nothing is heard twice.", mineFirst: "Choose this musician’s channels first: Volume turns them up or down against the rest.", _name: 'English',
      sends: 'Sends', pre: 'Pre-fader', post: 'Post-fader', view: 'View', vGroups: 'Groups', vChannels: 'Channels',
      groupsBtn: 'Groups…', allFaders: "From the mix in all 4", musician: 'Musician {n}',
      more: "Volume", mineNone: 'Choose your channels…', mineN: '{list}',
      fromFaders: "From the mix", copy: 'Copy', copied: 'Copied', paste: 'Paste', volume: 'Cue level · drag up or down, double-click for 0 dB',
      colorOf: 'Colour of this cue', noMembers: 'No channels in this group: add them in Groups…', noClick: 'This session has no click track', mute: 'Mute in this cue',
      g_click: 'Click', g_drums: 'Drums', g_bass: 'Bass', g_gtr: 'Guitars', g_keys: 'Keys', g_lead: 'Vocal', g_bv: 'Backing', g_fx: 'Reverb/FX', newGroup: 'Group {n}',
      dTitle: 'Session groups', fAll: 'All', fAudio: 'Audio', fInst: 'Instruments', fBus: 'Buses', fNone: 'No group', groupsHead: 'Groups · a fader in every cue', always: 'always',
      addGroup: '+ New group', suggest: 'Suggest from names', dHint: 'Click a channel’s group to change it. Channels with no group are set one by one in the Channels view.', done: 'Done', noGroup: 'No group',
      kSystem: 'System', kAudio: 'Audio', kInst: 'Instrument', kBus: 'Bus',
      sFaders: "“{c}” now starts from your mix", sAll: "The four cues now start from your mix", sCopied: '“{c}” copied: press Paste on another cue', sPasted: '“{a}” pasted into “{b}” (its own more-me stays)', sPre: 'Cue sends are now {m}',
      noCues: 'This session has no cue buses', error: 'Error: {e}', waiting: 'Waiting for LUNA…', noSession: 'Open a session in LUNA.', report: 'Report copied', yourMix: 'Your main mix is never changed.',
      dark: 'Dark', grey: 'Grey', color: 'Colour', cYellow: 'Yellow', cOrange: 'Orange', cRed: 'Red', cGreen: 'Green', cBlue: 'Blue', cPink: 'Pink', cPurple: 'Purple',
    },
    es: {
      kSub: "Subgrupo", subTag: "Por sus canales", subTip: "Un bus por el que pasan tus canales: los cues toman sus canales uno a uno, así que el bus no suena en los cues y nada se oye dos veces.", mineFirst: "Elige antes los canales de este músico: Volumen los sube o baja respecto al resto.", _name: 'Español',
      sends: 'Envíos', pre: 'Pre-fader', post: 'Post-fader', view: 'Vista', vGroups: 'Grupos', vChannels: 'Canales',
      groupsBtn: 'Grupos…', allFaders: "Desde la mezcla en los 4", musician: 'Músico {n}',
      more: "Volumen", mineNone: 'Elige sus canales…', mineN: '{list}',
      fromFaders: "Desde la mezcla", copy: 'Copiar', copied: 'Copiado', paste: 'Pegar', volume: 'Nivel del cue · arrastra arriba o abajo, doble clic para 0 dB',
      colorOf: 'Color de este cue', noMembers: 'Este grupo no tiene canales: añádelos en Grupos…', noClick: 'Esta sesión no tiene pista de click', mute: 'Silenciar en este cue',
      g_click: 'Click', g_drums: 'Batería', g_bass: 'Bajo', g_gtr: 'Guitarras', g_keys: 'Teclados', g_lead: 'Voz', g_bv: 'Coros', g_fx: 'Reverb/FX', newGroup: 'Grupo {n}',
      dTitle: 'Grupos de la sesión', fAll: 'Todos', fAudio: 'Audio', fInst: 'Instrumentos', fBus: 'Buses', fNone: 'Sin grupo', groupsHead: 'Grupos · un fader en cada cue', always: 'siempre',
      addGroup: '+ Nuevo grupo', suggest: 'Sugerir por nombres', dHint: 'Pulsa el grupo de un canal para cambiarlo. Los canales sin grupo se ajustan uno a uno en la vista Canales.', done: 'Listo', noGroup: 'Sin grupo',
      kSystem: 'Sistema', kAudio: 'Audio', kInst: 'Instrumento', kBus: 'Bus',
      sFaders: "«{c}» parte ahora de tu mezcla", sAll: "Los cuatro cues parten ahora de tu mezcla", sCopied: '«{c}» copiado: pulsa Pegar en otro cue', sPasted: '«{a}» pegado en «{b}» (conserva su Más yo)', sPre: 'Los envíos de cue son ahora {m}',
      noCues: 'Esta sesión no tiene buses de cue', error: 'Error: {e}', waiting: 'Esperando a LUNA…', noSession: 'Abre una sesión en LUNA.', report: 'Informe copiado', yourMix: 'Tu mezcla principal no cambia nunca.',
      dark: 'Oscuro', grey: 'Gris', color: 'Color', cYellow: 'Amarillo', cOrange: 'Naranja', cRed: 'Rojo', cGreen: 'Verde', cBlue: 'Azul', cPink: 'Rosa', cPurple: 'Morado',
    },
  };

  Object.assign(I18N, {"ca": { "mineFirst": "Tria abans els canals d’aquest músic: Volum els puja o abaixa respecte a la resta.", "subTip": "Un bus pel qual passen els teus canals: els cues en prenen els canals un a un, així que el bus no sona als cues i res no se sent dues vegades.", "subTag": "Pels seus canals", "kSub": "Subgrup", "sAll": "Els quatre cues parteixen ara de la teva mescla", "sFaders": "«{c}» parteix ara de la teva mescla", "fromFaders": "Des de la mescla", "more": "Volum","_name": "Català", "sends": "Envios", "pre": "Pre-fader", "post": "Post-fader", "view": "Vista", "vGroups": "Grups", "vChannels": "Canals", "groupsBtn": "Grups…", "allFaders": "Des de la mescla als 4", "musician": "Músic {n}", "more": "Més jo", "mineNone": "Tria els seus canals…", "mineN": "{list}", "fromFaders": "Des dels faders", "copy": "Copiar", "copied": "Copiat", "paste": "Enganxar", "volume": "Nivell del cue · arrossega amunt o avall, doble clic per a 0 dB", "colorOf": "Color d’aquest cue", "noMembers": "Aquest grup no té canals: afegeix-los a Grups…", "noClick": "Aquesta sessió no té pista de click", "mute": "Silenciar en aquest cue", "g_click": "Click", "g_drums": "Bateria", "g_bass": "Baix", "g_gtr": "Guitarres", "g_keys": "Teclats", "g_lead": "Veu", "g_bv": "Cors", "g_fx": "Reverb/FX", "newGroup": "Grup {n}", "dTitle": "Grups de la sessió", "fAll": "Tots", "fAudio": "Àudio", "fInst": "Instruments", "fBus": "Busos", "fNone": "Sense grup", "groupsHead": "Grups · un fader a cada cue", "always": "sempre", "addGroup": "+ Nou grup", "suggest": "Suggerir pels noms", "dHint": "Prem el grup d’un canal per canviar-lo. Els canals sense grup s’ajusten un a un a la vista Canals.", "done": "Fet", "noGroup": "Sense grup", "kSystem": "Sistema", "kAudio": "Àudio", "kInst": "Instrument", "kBus": "Bus", "sFaders": "«{c}» parteix ara dels teus faders", "sAll": "Els quatre cues parteixen ara dels teus faders", "sCopied": "«{c}» copiat: prem Enganxar en un altre cue", "sPasted": "«{a}» enganxat a «{b}» (conserva el seu Més jo)", "sPre": "Els envios de cue són ara {m}", "noCues": "Aquesta sessió no té busos de cue", "error": "Error: {e}", "waiting": "Esperant LUNA…", "noSession": "Obre una sessió a LUNA.", "report": "Informe copiat", "yourMix": "La teva mescla principal no canvia mai.", "dark": "Fosc", "grey": "Gris", "color": "Color", "cYellow": "Groc", "cOrange": "Taronja", "cRed": "Vermell", "cGreen": "Verd", "cBlue": "Blau", "cPink": "Rosa", "cPurple": "Morat"}, "fr": { "mineFirst": "Choisissez d’abord les canaux de ce musicien : Volume les monte ou les baisse par rapport au reste.", "subTip": "Un bus par lequel passent vos canaux : les cues prennent ses canaux un par un, donc le bus reste muet dans les cues et rien n’est entendu deux fois.", "subTag": "Par ses canaux", "kSub": "Sous-groupe", "sAll": "Les quatre cues partent maintenant de votre mix", "sFaders": "« {c} » part maintenant de votre mix", "fromFaders": "Depuis le mix", "more": "Volume","_name": "Français", "sends": "Envois", "pre": "Pré-fader", "post": "Post-fader", "view": "Vue", "vGroups": "Groupes", "vChannels": "Canaux", "groupsBtn": "Groupes…", "allFaders": "Depuis le mix sur les 4", "musician": "Musicien {n}", "more": "Plus de moi", "mineNone": "Choisir ses canaux…", "mineN": "{list}", "fromFaders": "Depuis les faders", "copy": "Copier", "copied": "Copié", "paste": "Coller", "volume": "Niveau du cue · glisser vers le haut ou le bas, double-clic pour 0 dB", "colorOf": "Couleur de ce cue", "noMembers": "Ce groupe n’a pas de canaux : ajoutez-les dans Groupes…", "noClick": "Cette session n’a pas de piste de clic", "mute": "Couper dans ce cue", "g_click": "Clic", "g_drums": "Batterie", "g_bass": "Basse", "g_gtr": "Guitares", "g_keys": "Claviers", "g_lead": "Voix", "g_bv": "Chœurs", "g_fx": "Reverb/FX", "newGroup": "Groupe {n}", "dTitle": "Groupes de la session", "fAll": "Tous", "fAudio": "Audio", "fInst": "Instruments", "fBus": "Bus", "fNone": "Sans groupe", "groupsHead": "Groupes · un fader dans chaque cue", "always": "toujours", "addGroup": "+ Nouveau groupe", "suggest": "Suggérer d’après les noms", "dHint": "Cliquez sur le groupe d’un canal pour le changer. Les canaux sans groupe se règlent un par un dans la vue Canaux.", "done": "OK", "noGroup": "Sans groupe", "kSystem": "Système", "kAudio": "Audio", "kInst": "Instrument", "kBus": "Bus", "sFaders": "« {c} » part maintenant de vos faders", "sAll": "Les quatre cues partent maintenant de vos faders", "sCopied": "« {c} » copié : cliquez sur Coller dans un autre cue", "sPasted": "« {a} » collé dans « {b} » (il garde son Plus de moi)", "sPre": "Les envois de cue sont maintenant {m}", "noCues": "Cette session n’a pas de bus de cue", "error": "Erreur : {e}", "waiting": "En attente de LUNA…", "noSession": "Ouvrez une session dans LUNA.", "report": "Rapport copié", "yourMix": "Votre mix principal ne change jamais.", "dark": "Sombre", "grey": "Gris", "color": "Couleur", "cYellow": "Jaune", "cOrange": "Orange", "cRed": "Rouge", "cGreen": "Vert", "cBlue": "Bleu", "cPink": "Rose", "cPurple": "Violet"}, "de": { "mineFirst": "Wähle zuerst die Kanäle dieses Musikers: Lautstärke hebt oder senkt sie gegenüber dem Rest.", "subTip": "Ein Bus, über den deine Kanäle laufen: die Cues nehmen seine Kanäle einzeln, deshalb bleibt der Bus in den Cues stumm und nichts ist doppelt zu hören.", "subTag": "Über ihre Kanäle", "kSub": "Subgruppe", "sAll": "Alle vier Cues starten jetzt von deinem Mix", "sFaders": "„{c}“ startet jetzt von deinem Mix", "fromFaders": "Vom Mix", "more": "Lautstärke","_name": "Deutsch", "sends": "Sends", "pre": "Pre-Fader", "post": "Post-Fader", "view": "Ansicht", "vGroups": "Gruppen", "vChannels": "Kanäle", "groupsBtn": "Gruppen…", "allFaders": "Vom Mix in alle 4", "musician": "Musiker {n}", "more": "Mehr ich", "mineNone": "Eigene Kanäle wählen…", "mineN": "{list}", "fromFaders": "Von den Fadern", "copy": "Kopieren", "copied": "Kopiert", "paste": "Einfügen", "volume": "Cue-Pegel · nach oben oder unten ziehen, Doppelklick für 0 dB", "colorOf": "Farbe dieses Cues", "noMembers": "Diese Gruppe hat keine Kanäle: füge sie unter Gruppen… hinzu", "noClick": "Diese Session hat keine Klick-Spur", "mute": "In diesem Cue stummschalten", "g_click": "Klick", "g_drums": "Drums", "g_bass": "Bass", "g_gtr": "Gitarren", "g_keys": "Keys", "g_lead": "Gesang", "g_bv": "Chöre", "g_fx": "Hall/FX", "newGroup": "Gruppe {n}", "dTitle": "Gruppen der Session", "fAll": "Alle", "fAudio": "Audio", "fInst": "Instrumente", "fBus": "Busse", "fNone": "Ohne Gruppe", "groupsHead": "Gruppen · ein Fader in jedem Cue", "always": "immer", "addGroup": "+ Neue Gruppe", "suggest": "Aus Namen vorschlagen", "dHint": "Klicke auf die Gruppe eines Kanals, um sie zu ändern. Kanäle ohne Gruppe stellst du einzeln in der Ansicht Kanäle ein.", "done": "Fertig", "noGroup": "Ohne Gruppe", "kSystem": "System", "kAudio": "Audio", "kInst": "Instrument", "kBus": "Bus", "sFaders": "„{c}“ startet jetzt von deinen Fadern", "sAll": "Alle vier Cues starten jetzt von deinen Fadern", "sCopied": "„{c}“ kopiert: drücke Einfügen in einem anderen Cue", "sPasted": "„{a}“ in „{b}“ eingefügt (sein Mehr ich bleibt)", "sPre": "Die Cue-Sends sind jetzt {m}", "noCues": "Diese Session hat keine Cue-Busse", "error": "Fehler: {e}", "waiting": "Warte auf LUNA…", "noSession": "Öffne eine Session in LUNA.", "report": "Bericht kopiert", "yourMix": "Dein Hauptmix ändert sich nie.", "dark": "Dunkel", "grey": "Grau", "color": "Farbe", "cYellow": "Gelb", "cOrange": "Orange", "cRed": "Rot", "cGreen": "Grün", "cBlue": "Blau", "cPink": "Pink", "cPurple": "Lila"}, "it": { "mineFirst": "Scegli prima i canali di questo musicista: Volume li alza o abbassa rispetto al resto.", "subTip": "Un bus da cui passano i tuoi canali: i cue prendono i suoi canali uno a uno, quindi il bus resta muto nei cue e nulla si sente due volte.", "subTag": "Tramite i suoi canali", "kSub": "Sottogruppo", "sAll": "I quattro cue ora partono dal tuo mix", "sFaders": "«{c}» ora parte dal tuo mix", "fromFaders": "Dal mix", "more": "Volume","_name": "Italiano", "sends": "Mandate", "pre": "Pre-fader", "post": "Post-fader", "view": "Vista", "vGroups": "Gruppi", "vChannels": "Canali", "groupsBtn": "Gruppi…", "allFaders": "Dal mix in tutti e 4", "musician": "Musicista {n}", "more": "Più me", "mineNone": "Scegli i suoi canali…", "mineN": "{list}", "fromFaders": "Dai fader", "copy": "Copia", "copied": "Copiato", "paste": "Incolla", "volume": "Livello del cue · trascina su o giù, doppio clic per 0 dB", "colorOf": "Colore di questo cue", "noMembers": "Questo gruppo non ha canali: aggiungili in Gruppi…", "noClick": "Questa sessione non ha una traccia di click", "mute": "Muto in questo cue", "g_click": "Click", "g_drums": "Batteria", "g_bass": "Basso", "g_gtr": "Chitarre", "g_keys": "Tastiere", "g_lead": "Voce", "g_bv": "Cori", "g_fx": "Riverb/FX", "newGroup": "Gruppo {n}", "dTitle": "Gruppi della sessione", "fAll": "Tutti", "fAudio": "Audio", "fInst": "Strumenti", "fBus": "Bus", "fNone": "Senza gruppo", "groupsHead": "Gruppi · un fader in ogni cue", "always": "sempre", "addGroup": "+ Nuovo gruppo", "suggest": "Suggerisci dai nomi", "dHint": "Clicca il gruppo di un canale per cambiarlo. I canali senza gruppo si regolano uno a uno nella vista Canali.", "done": "Fatto", "noGroup": "Senza gruppo", "kSystem": "Sistema", "kAudio": "Audio", "kInst": "Strumento", "kBus": "Bus", "sFaders": "«{c}» ora parte dai tuoi fader", "sAll": "I quattro cue ora partono dai tuoi fader", "sCopied": "«{c}» copiato: premi Incolla in un altro cue", "sPasted": "«{a}» incollato in «{b}» (mantiene il suo Più me)", "sPre": "Le mandate di cue ora sono {m}", "noCues": "Questa sessione non ha bus di cue", "error": "Errore: {e}", "waiting": "In attesa di LUNA…", "noSession": "Apri una sessione in LUNA.", "report": "Rapporto copiato", "yourMix": "Il tuo mix principale non cambia mai.", "dark": "Scuro", "grey": "Grigio", "color": "Colore", "cYellow": "Giallo", "cOrange": "Arancione", "cRed": "Rosso", "cGreen": "Verde", "cBlue": "Blu", "cPink": "Rosa", "cPurple": "Viola"}, "pt": { "mineFirst": "Escolhe primeiro os canais deste músico: Volume sobe-os ou baixa-os em relação ao resto.", "subTip": "Um bus por onde passam os teus canais: os cues usam os seus canais um a um, por isso o bus não soa nos cues e nada se ouve duas vezes.", "subTag": "Pelos seus canais", "kSub": "Subgrupo", "sAll": "Os quatro cues partem agora da tua mistura", "sFaders": "«{c}» parte agora da tua mistura", "fromFaders": "Da mistura", "more": "Volume","_name": "Português", "sends": "Envios", "pre": "Pré-fader", "post": "Pós-fader", "view": "Vista", "vGroups": "Grupos", "vChannels": "Canais", "groupsBtn": "Grupos…", "allFaders": "Da mistura nos 4", "musician": "Músico {n}", "more": "Mais eu", "mineNone": "Escolhe os seus canais…", "mineN": "{list}", "fromFaders": "Dos faders", "copy": "Copiar", "copied": "Copiado", "paste": "Colar", "volume": "Nível do cue · arrasta para cima ou para baixo, duplo clique para 0 dB", "colorOf": "Cor deste cue", "noMembers": "Este grupo não tem canais: acrescenta-os em Grupos…", "noClick": "Esta sessão não tem faixa de click", "mute": "Silenciar neste cue", "g_click": "Click", "g_drums": "Bateria", "g_bass": "Baixo", "g_gtr": "Guitarras", "g_keys": "Teclados", "g_lead": "Voz", "g_bv": "Coros", "g_fx": "Reverb/FX", "newGroup": "Grupo {n}", "dTitle": "Grupos da sessão", "fAll": "Todos", "fAudio": "Áudio", "fInst": "Instrumentos", "fBus": "Buses", "fNone": "Sem grupo", "groupsHead": "Grupos · um fader em cada cue", "always": "sempre", "addGroup": "+ Novo grupo", "suggest": "Sugerir pelos nomes", "dHint": "Clica no grupo de um canal para o mudar. Os canais sem grupo ajustam-se um a um na vista Canais.", "done": "Feito", "noGroup": "Sem grupo", "kSystem": "Sistema", "kAudio": "Áudio", "kInst": "Instrumento", "kBus": "Bus", "sFaders": "«{c}» parte agora dos teus faders", "sAll": "Os quatro cues partem agora dos teus faders", "sCopied": "«{c}» copiado: carrega em Colar noutro cue", "sPasted": "«{a}» colado em «{b}» (mantém o seu Mais eu)", "sPre": "Os envios de cue são agora {m}", "noCues": "Esta sessão não tem buses de cue", "error": "Erro: {e}", "waiting": "À espera do LUNA…", "noSession": "Abre uma sessão no LUNA.", "report": "Relatório copiado", "yourMix": "A tua mistura principal nunca muda.", "dark": "Escuro", "grey": "Cinzento", "color": "Cor", "cYellow": "Amarelo", "cOrange": "Laranja", "cRed": "Vermelho", "cGreen": "Verde", "cBlue": "Azul", "cPink": "Rosa", "cPurple": "Roxo"}});

  let lang = store.get('lang') ?? (() => { for (const l of navigator.languages ?? [navigator.language]) { const c = String(l || '').slice(0, 2).toLowerCase(); if (I18N[c]) return c; } return 'en'; })();
  if (!I18N[lang]) lang = 'en';
  const t = (k, v = {}) => String(I18N[lang]?.[k] ?? I18N.en[k] ?? k).replace(/\{(\w+)\}/g, (m, x) => (x in v ? String(v[x]) : m));
  const COLORS = ['yellow', 'orange', 'red', 'green', 'blue', 'pink', 'purple'];
  let theme = store.get('theme') === 'grey' ? 'grey' : 'dark';
  let color = COLORS.includes(store.get('color')) ? store.get('color') : 'orange';
  let statusTimer;
  const say = (key, vars = {}, kind = '', ms = 0) => { clearTimeout(statusTimer); $('status').textContent = key ? t(key, vars) : ''; $('status').className = `status ${kind}`; if (ms) statusTimer = setTimeout(() => say(null), ms); };
  const log = [];
  const note = (what, extra = {}) => { log.push({ t: new Date().toISOString().slice(11, 23), what, ...extra }); if (log.length > 200) log.shift(); };
  const errText = (e) => String(e?.message || e);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };

  let app = null;
  const closeColors = () => { $('colorMenu').hidden = true; $('colorBtn').classList.remove('open'); };
  function seg(box, items, cur, onPick) {
    box.replaceChildren(...items.map(([v, label]) => { const b = el('button', v === cur ? 'on' : '', label); b.onclick = () => onPick(v); return b; }));
  }

  // A horizontal slider: click or drag to set, double-click for `reset`, wheel to nudge.
  function slider({ min, max, value, zero = null, big = false, disabled = false, onInput, reset }) {
    const box = el('div', `sl${big ? ' big' : ''}${disabled ? ' dis' : ''}`);
    const fill = el('i'), knob = el('b');
    if (zero !== null) { const u = el('u'); u.style.left = `${((zero - min) / (max - min)) * 100}%`; box.append(u); }
    box.append(fill, knob);
    const paint = (v) => { const f = Math.max(0, Math.min(1, (v - min) / (max - min))); fill.style.width = `${f * 100}%`; knob.style.left = `${f * 100}%`; };
    paint(value);
    const at = (x) => { const r = box.getBoundingClientRect(); const f = Math.max(0, Math.min(1, (x - r.left) / r.width)); return Math.round((min + f * (max - min)) * 2) / 2; };
    box.onpointerdown = (e) => {
      if (e.detail > 1) return;
      box.setPointerCapture(e.pointerId);
      const set = (x) => { const v = at(x); paint(v); onInput(v); };
      set(e.clientX);
      box.onpointermove = (m) => set(m.clientX);
      box.onpointerup = () => { box.onpointermove = null; box.onpointerup = null; };
    };
    box.ondblclick = () => { paint(reset); onInput(reset); };
    box.onwheel = (e) => { e.preventDefault(); const r = box.getBoundingClientRect(); void r; };
    box.paint = paint;
    return box;
  }

  // A popover under `anchor`; closes on an outside click.
  function openPop(anchor, fill) {
    const p = $('pop');
    p.replaceChildren(); fill(p); p.hidden = false;
    const r = anchor.getBoundingClientRect(), pw = p.offsetWidth, ph = p.offsetHeight;
    p.style.left = `${Math.max(6, Math.min(window.innerWidth - pw - 6, r.right - pw))}px`;
    p.style.top = `${r.bottom + ph + 8 > window.innerHeight ? Math.max(6, r.top - ph - 6) : r.bottom + 6}px`;
  }
  const closePop = () => { $('pop').hidden = true; };
  document.addEventListener('mousedown', (ev) => {
    if (!ev.target.closest?.('.colors')) closeColors();
    if (!ev.target.closest?.('#pop') && !ev.target.closest?.('[data-pop]')) closePop();
  });

  function paintStatic() {
    document.documentElement.lang = lang;
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.color = color;
    $('ver').textContent = `v${VERSION}`;
    $('lang').replaceChildren(...Object.keys(I18N).map((c) => Object.assign(el('option', '', I18N[c]._name), { value: c })));
    $('lang').value = lang;
    for (const [id, name] of [['tDark', 'dark'], ['tGrey', 'grey']]) { $(id).classList.toggle('on', theme === name); $(id).title = t(name); }
    $('colorBtn').title = t('color');
    $('colorMenu').replaceChildren(...COLORS.map((c) => {
      const b = el('button', c === color ? 'on' : '');
      b.innerHTML = `<i class="sw" data-color="${c}" data-theme="${theme}"></i><span></span><svg viewBox="0 0 12 12"><path d="M2.5 6.5L5 9L9.5 3.5"/></svg>`;
      b.querySelector('span').textContent = t(`c${c[0].toUpperCase()}${c.slice(1)}`);
      b.onclick = () => { color = c; store.set('color', c); closeColors(); paintStatic(); };
      return b;
    }));
    $('sendsLbl').textContent = t('sends');
    $('groupsBtn').textContent = t('groupsBtn'); $('allFaders').textContent = t('allFaders');
    app?.paint();
  }
  $('lang').onchange = () => { lang = $('lang').value; store.set('lang', lang); paintStatic(); };
  for (const b of [$('tDark'), $('tGrey')]) b.onclick = () => { theme = b.dataset.t; store.set('theme', theme); paintStatic(); };
  $('colorBtn').onclick = (ev) => { ev.stopPropagation(); const open = $('colorMenu').hidden; $('colorMenu').hidden = !open; $('colorBtn').classList.toggle('open', open); };
  paintStatic();

  let luna, built;
  async function build() {
    const s = luna.sessions.current();
    if (s === built) return;
    built = s;
    app = null;
    if (!s) { say('noSession'); $('cues').replaceChildren(); return; }
    await s.ready();
    if (s !== built) return;
    say(null);
    const skey = `${s.id}.state`;

    // ---- Channels ------------------------------------------------------------------------------
    const kindOf = (ch) => {
      if (ch instanceof Luna.Bus) return 'bus';
      const tt = ch.trackType.value;
      if (tt === 'click') return 'system';
      return tt === 'instrument' ? 'inst' : 'audio';
    };
    const isRow = (ch) => {
      if (ch instanceof Luna.Track) return ch.trackType.value !== 'count_in';
      if (ch instanceof Luna.Bus) return !ch.isMaster && String(ch.busType.value ?? 'aux') === 'aux';
      return false;
    };
    let rows = [];
    const cueOut = (r, i) => r.ch.outputs?.byId?.(`cue_${i}`) ?? null;
    async function loadRows() {
      const list = (s.channelsInOrder ?? [...s.tracks.items, ...s.buses.items]).filter(isRow);
      rows = list.map((ch) => ({ id: ch.id, ch, name: ch.name.value ?? ch.id, kind: kindOf(ch), bus: ch instanceof Luna.Bus, click: kindOf(ch) === 'system' }));
      await Promise.all(rows.map(async (r) => {
        try {
          await r.ch.loadStrip?.();
          await r.ch.outputs.load();
          await Promise.all([0, 1, 2, 3].map((i) => cueOut(r, i)?.controls.load().catch(() => undefined)));
        } catch (e) { note('load', { ch: r.name, e: errText(e) }); }
      }));
      rows = rows.filter((r) => cueOut(r, 0));
      // Routing: where each channel's main output goes. An aux bus fed that way is a sub-mix
      // (a drum bus, a vocal bus): the cues take its channels one by one, and the bus itself
      // stays silent in the cues, so nothing is heard twice. Buses fed only by sends (reverbs,
      // parallel buses) are ordinary channels.
      const byId = new Map(rows.map((r) => [r.id, r]));
      for (const r of rows) {
        const main = r.ch.outputs.byId?.('main');
        const ids = [...(main?.assignments?.value ?? []).map((x) => x?.value), main?.busUid?.value].filter(Boolean);
        r.dest = ids.find((id) => byId.get(id)?.bus) ?? null;
      }
      const fed = new Set(rows.map((r) => r.dest).filter(Boolean));
      for (const r of rows) r.sub = r.bus && fed.has(r.id);
      rows.forEach((r) => { if (r.sub) r.kind = 'sub'; });
      for (const r of rows) r.via = subOf(r).map((b) => b.name);
    }
    const subOf = (r) => { const out = []; let d = r.dest; const seen = new Set(); while (d && !seen.has(d)) { seen.add(d); const b = rows.find((x) => x.id === d); if (!b) break; out.push(b); d = b.dest; } return out; };
    const cueRows = () => rows.filter((r) => !r.sub);
    const cueBus = (i) => s.buses.items.find((b) => String(b.busType.value) === `cue_${i}`) ?? null;

    // ---- State: groups, assignments and the four cues ------------------------------------------
    await loadRows();
    // Kept in the session itself (LUNA's session storage), so the cues, names and groups travel
    // with the session and survive reinstalling the Add On; this computer keeps a copy too.
    const SS = s.storage?.context?.('com.fedetrillo.cuemixes') ?? null;
    let inSession = null;
    try { await SS?.load(); inSession = SS?.value('state', 'json')?.value ?? null; } catch (e) { note('storage', { e: errText(e) }); }
    let S = (typeof inSession === 'string' ? (() => { try { return JSON.parse(inSession); } catch { return null; } })() : inSession) ?? store.get(skey);
    if (!S || !Array.isArray(S.cues)) {
      const sug = C.suggest(cueRows());
      S = { groups: sug.groups, assign: sug.assign, cues: [0, 1, 2, 3].map(C.freshCue), pre: true, view: 'groups', seen: Object.fromEntries(rows.map((r) => [r.id, 1])) };
    }
    let saveT = 0, added = inSession !== null;
    const save = () => {
      store.set(skey, S);
      clearTimeout(saveT);
      saveT = setTimeout(async () => {
        if (!SS) return;
        const json = JSON.stringify(S);
        try {
          if (added) await SS.set('state', 'json', json);
          else { await SS.add('state', 'json', json); added = true; }
        } catch (e) {
          note('storage save', { e: errText(e) });
          try { await SS.add('state', 'json', json); await SS.set('state', 'json', json); added = true; } catch { /* the copy on this computer stays */ }
        }
      }, 700);
    };
    // A channel a cue has not seen yet starts from what its cue send is now, so opening the Add On
    // never changes what a musician hears.
    // A channel never seen before also gets the group its name suggests (the group is made if
    // needed); one you have taken out of a group stays out.
    function adopt() {
      S.seen ??= Object.fromEntries(rows.map((r) => [r.id, 1]));
      for (const r of rows) {
        if (r.click && !S.assign[r.id]) S.assign[r.id] = 'click';
        if (!S.seen[r.id]) {
          S.seen[r.id] = 1;
          const k = r.click ? 'click' : r.sub ? null : (C.suggestKey(r.name, r.bus) ?? r.via.map((n) => C.suggestKey(n, false)).find((x) => x && x !== 'fx') ?? null);
          if (k && !S.assign[r.id]) {
            if (!S.groups.some((g) => g.id === k)) {
              S.groups.push({ id: k, key: k, color: C.GROUP_COLORS[k] });
              const order = ['click', 'drums', 'bass', 'gtr', 'keys', 'lead', 'bv', 'fx'];
              const rank = (g) => (g.key ? order.indexOf(g.key) : 99);
              S.groups.sort((x, y) => rank(x) - rank(y));
            }
            S.assign[r.id] = k;
          }
        }
        for (let i = 0; i < C.CUES; i++) {
          const cue = S.cues[i];
          if (cue.base[r.id]) continue;
          const o = cueOut(r, i);
          if (!o) continue;
          const db = Number(o.gain.real.value);
          cue.base[r.id] = { db: Number.isFinite(db) ? db : C.MINUS_INF, pans: o.pans.map((p) => p.normalized.value ?? 0.5), m: !!o.mute.on };
        }
      }
      if (!S.groups.some((g) => g.id === 'click')) S.groups.unshift({ id: 'click', key: 'click', color: C.GROUP_COLORS.click, fixed: true });
      save();
    }
    adopt();
    const groupName = (g) => g.name || (g.key ? t(`g_${g.key}`) : g.id);
    const groupOf = (r) => S.groups.find((g) => g.id === S.assign[r.id]) ?? null;
    const cueName = (i) => S.cues[i].name || t('musician', { n: i + 1 });

    // ---- Writing the cue sends --------------------------------------------------------------------
    const pending = new Set();
    let raf = 0;
    function schedule(i) { pending.add(i); if (!raf) raf = requestAnimationFrame(flush); }
    function flush() {
      raf = 0;
      const list = [...pending]; pending.clear();
      for (const i of list) write(i).catch((e) => { note('write', { cue: i, e: errText(e) }); say('error', { e: errText(e) }, 'bad', 6000); });
    }
    async function write(i) {
      const cue = S.cues[i];
      const jobs = [];
      for (const r of rows) {
        const o = cueOut(r, i);
        if (!o) continue;
        const g = groupOf(r);
        const { db, mute } = r.sub ? { db: C.MINUS_INF, mute: false } : C.level(cue, r.id, g?.id ?? null);
        const tp = o.gain.taper.value;
        const norm = db <= C.MINUS_INF + 1 || !tp ? 0 : tp.toNormalized(Math.max(tp.minDb, Math.min(tp.maxDb, db)));
        if (Math.abs((o.gain.normalized.value ?? -1) - norm) > 1e-4) jobs.push(o.gain.normalized.set(norm));
        if (o.mute.on !== mute) jobs.push(o.mute.real.set(mute));
        if (o.controls.byId('enabled') && o.enabled.real.value !== true) jobs.push(o.enabled.real.set(true));
        if (o.controls.byId('pre_fader') && !!o.preFader.real.value !== !!S.pre) jobs.push(o.preFader.real.set(!!S.pre));
        const pans = cue.base[r.id]?.pans ?? [];
        o.pans.forEach((p, k) => { const v = pans[k]; if (typeof v === 'number' && Math.abs((p.normalized.value ?? -1) - v) > 1e-4) jobs.push(p.normalized.set(v)); });
      }
      await Promise.all(jobs);
    }
    const writeAll = () => { for (let i = 0; i < C.CUES; i++) schedule(i); };

    // "From the faders": the cue becomes your mix (fader level, pan, mute of each channel), and
    // every group and channel offset goes back to 0. "More me" and its channels stay.
    // A channel's level in your mix counts the sub-mix buses it goes through (their faders and
    // mutes). The click is never taken muted: it is usually muted in the mix, never in a cue.
    const faderDb = (ch) => { const v = Number(ch.gain?.real?.value); return Number.isFinite(v) ? v : C.MINUS_INF; };
    const muted = (ch) => !!(ch.main?.controls?.byId?.('mute') && ch.mute.on);
    function fromFaders(i) {
      const cue = S.cues[i];
      for (const r of rows) {
        if (r.sub) continue;
        let db = faderDb(r.ch), m = muted(r.ch);
        for (const b of subOf(r)) { db = db <= C.MINUS_INF + 1 || faderDb(b.ch) <= C.MINUS_INF + 1 ? C.MINUS_INF : db + faderDb(b.ch); m = m || muted(b.ch); }
        if (r.click) { m = false; if (db <= C.MINUS_INF + 1) db = 0; }
        cue.base[r.id] = { db, pans: (r.ch.main?.pans ?? []).map((p) => p.normalized.value ?? 0.5), m };
      }
      cue.gDb = {}; cue.gMute = {}; cue.cDb = {}; cue.cMute = {};
      save(); schedule(i);
    }

    // ---- Painting ------------------------------------------------------------------------------
    let clip = null;   // the cue copied, by index
    const meterOffs = [];
    function meterFor(i, bars) {
      const bus = cueBus(i);
      if (!bus?.meter) return;
      const upd = () => { const lv = bus.meter.level.value ?? []; bars.forEach((b, k) => { const v = lv[k] ?? lv[0] ?? 0; b.style.width = `${Math.max(0, Math.min(1, v)) * 100}%`; }); };
      try { meterOffs.push(bus.meter.onChange(upd)); } catch { /* no meter */ }
      upd();
    }
    function volFor(i, label) {
      const bus = cueBus(i);
      const g = bus?.main?.controls?.byId?.('gain') ? bus.gain : null;
      if (!g) { label.textContent = ''; return; }
      const show = () => { const db = Number(g.real.value); label.textContent = Number.isFinite(db) ? (db <= -100 ? '−∞' : C.fmtDb(Math.round(db * 2) / 2)) : ''; };
      show();
      label.title = t('volume');
      label.onpointerdown = (e) => {
        label.setPointerCapture(e.pointerId);
        const y0 = e.clientY, tp = g.taper.value, n0 = g.normalized.value ?? 0;
        label.onpointermove = (m) => { const n = Math.max(0, Math.min(1, n0 + (y0 - m.clientY) / 300)); g.normalized.set(n).then(show).catch(() => undefined); void tp; };
        label.onpointerup = () => { label.onpointermove = null; label.onpointerup = null; };
      };
      label.ondblclick = () => { const tp = g.taper.value; if (tp) g.normalized.set(tp.toNormalized(0)).then(show).catch(() => undefined); };
    }
    function minePicker(anchor, i) {
      const cue = S.cues[i];
      openPop(anchor, (p) => {
        const list = el('div', 'plist');
        const byGroup = new Map();
        for (const r of cueRows()) { const g = groupOf(r); const k = g ? groupName(g) : t('noGroup'); if (!byGroup.has(k)) byGroup.set(k, []); byGroup.get(k).push(r); }
        for (const [k, rs] of byGroup) {
          list.append(el('h5', '', k));
          for (const r of rs) {
            const lb = el('label'); const cb = el('input'); cb.type = 'checkbox'; cb.checked = cue.mine.includes(r.id);
            cb.onchange = () => { cue.mine = cb.checked ? [...new Set([...cue.mine, r.id])] : cue.mine.filter((x) => x !== r.id); save(); schedule(i); paintCue(i); };
            lb.append(cb, el('span', '', r.name)); list.append(lb);
          }
        }
        p.append(list);
      });
    }
    function colorPicker(anchor, i) {
      openPop(anchor, (p) => {
        const pal = el('div', 'pal');
        for (const c of COLORS) {
          const b = el('button', c === S.cues[i].color ? 'on' : ''); b.dataset.color = c; b.dataset.theme = theme; b.title = t(`c${c[0].toUpperCase()}${c.slice(1)}`);
          b.onclick = () => { S.cues[i].color = c; save(); closePop(); paintCue(i); };
          pal.append(b);
        }
        p.append(pal);
      });
    }
    const cols = [];
    function paintCue(i) {
      const cue = S.cues[i];
      const box = cols[i];
      box.dataset.color = cue.color;
      box.replaceChildren();
      // Header: name and the CUE chip that picks the colour.
      const ch = el('div', 'ch');
      const name = el('input'); name.value = cue.name; name.placeholder = t('musician', { n: i + 1 }); name.spellcheck = false; name.maxLength = 30;
      name.onkeydown = (e) => { e.stopPropagation(); if (e.key === 'Enter') name.blur(); };
      name.onchange = () => { cue.name = name.value.trim(); save(); };
      const cn = el('button', 'cn', `${cueBus(i)?.name.value ?? `CUE ${i + 1}`} ▾`); cn.dataset.pop = '1'; cn.title = t('colorOf');
      cn.onclick = () => colorPicker(cn, i);
      ch.append(name, cn);
      // Level: meters of the cue bus and its fader.
      const lvl = el('div', 'lvl'), mts = el('div', 'mts'), bars = [el('i'), el('i')];
      for (const b of bars) { const m = el('div', 'mt'); m.append(b); mts.append(m); }
      const vol = el('span', 'vol');
      lvl.append(mts, vol);
      meterFor(i, bars); volFor(i, vol);
      // More me.
      const me = el('div', 'me');
      const meh = el('div', 'meh'); const mv = el('span', 'mv', `${C.fmtDb(cue.more)} dB`);
      meh.append(el('b', '', t('more')), mv);
      const sl = slider({ min: -24, max: 12, value: cue.more, zero: 0, big: true, reset: 0, disabled: !cue.mine.length, onInput: (v) => { cue.more = v; mv.textContent = `${C.fmtDb(v)} dB`; save(); schedule(i); } });
      const names = rows.filter((r) => cue.mine.includes(r.id)).map((r) => r.name);
      const mine = el('button', 'mine', names.length ? names.join(', ') : t('mineNone')); mine.dataset.pop = '1';
      mine.onclick = () => minePicker(mine, i);
      if (!cue.mine.length) { me.classList.add('nomine'); me.title = t('mineFirst'); }
      me.append(meh, sl, mine);
      // Groups or channels.
      const list = el('div', 'rows');
      const rowEl = (label, dot, value, mute, onValue, onMute, disabled, tip) => {
        const r = el('div', `gr${disabled ? ' off' : ''}`);
        const gl = el('span', 'gl'); const em = el('em'); em.style.background = dot; gl.append(em, el('span', '', label)); gl.title = tip || label;
        const gv = el('span', 'gv', C.fmtDb(value));
        const s2 = slider({ min: C.FLOOR, max: C.TOP, value, zero: 0, disabled, reset: 0, onInput: (v) => { gv.textContent = C.fmtDb(v); onValue(v); } });
        const m = el('button', `m${mute ? ' on' : ''}`, 'M'); m.title = t('mute'); m.disabled = disabled;
        m.onclick = () => { const on = !m.classList.contains('on'); m.classList.toggle('on', on); onMute(on); };
        r.append(gl, s2, gv, m);
        return r;
      };
      // Each cue chooses how it is mixed: by groups (each group's fader, opened with ▸ to retouch
      // its channels), or every channel on its own fader. In the channel list a fader shows the
      // channel's whole offset (its group's plus its own); moving it changes only its own part.
      cue.open ??= {};
      cue.view ??= 'groups';
      const vs = el('div', 'seg vsw');
      seg(vs, [['groups', t('vGroups')], ['channels', t('vChannels')]], cue.view, (v) => { cue.view = v; save(); paintCue(i); });
      if (cue.view === 'channels') {
        for (const r of cueRows()) {
          const g = groupOf(r);
          const gd = g && (cue.gDb[g.id] ?? 0) > C.FLOOR ? (cue.gDb[g.id] ?? 0) : 0;
          const e = rowEl(r.name, g?.color ?? 'var(--edge)', Math.max(C.FLOOR, gd + (cue.cDb[r.id] ?? 0)), !!cue.cMute[r.id],
            (v) => { const own = v <= C.FLOOR ? C.FLOOR : v - gd; if (Math.abs(own) > 1e-9) cue.cDb[r.id] = own; else delete cue.cDb[r.id]; save(); schedule(i); },
            (on) => { if (on) cue.cMute[r.id] = true; else delete cue.cMute[r.id]; save(); schedule(i); }, false, r.name);
          e.prepend(el('span'));
          if (g && cue.gMute[g.id]) { e.classList.add('gm'); e.title = `${groupName(g)}: M`; }
          list.append(e);
        }
      } else {
      const chRow = (r, g) => {
        const e = rowEl(r.name, g?.color ?? 'var(--edge)', cue.cDb[r.id] ?? 0, !!cue.cMute[r.id],
          (v) => { if (v) cue.cDb[r.id] = v; else delete cue.cDb[r.id]; save(); schedule(i); },
          (on) => { if (on) cue.cMute[r.id] = true; else delete cue.cMute[r.id]; save(); schedule(i); }, false, r.name);
        e.classList.add('sub');
        e.prepend(el('span'));
        return e;
      };
      const caret = (key, open) => { const b = el('button', `car${open ? ' open' : ''}`, '▸'); b.onclick = () => { cue.open[key] = !cue.open[key]; save(); paintCue(i); }; return b; };
      for (const g of S.groups) {
        const members = cueRows().filter((r) => S.assign[r.id] === g.id);
        const n = members.length;
        const e = rowEl(groupName(g), g.color, cue.gDb[g.id] ?? 0, !!cue.gMute[g.id],
          (v) => { if (v) cue.gDb[g.id] = v; else delete cue.gDb[g.id]; save(); schedule(i); },
          (on) => { if (on) cue.gMute[g.id] = true; else delete cue.gMute[g.id]; save(); schedule(i); },
          n === 0, n === 0 ? t(g.id === 'click' ? 'noClick' : 'noMembers') : groupName(g));
        const open = !!cue.open[g.id] && n > 0;
        const tweaked = members.some((r) => cue.cDb[r.id] || cue.cMute[r.id]);
        const c = caret(g.id, open); c.disabled = n === 0; if (tweaked) c.classList.add('tw');
        e.prepend(c);
        list.append(e);
        if (open) for (const r of members) list.append(chRow(r, g));
      }
      const loose = cueRows().filter((r) => !groupOf(r));
      if (loose.length) {
        const h = el('div', 'gr head');
        const open = !!cue.open.__none;
        h.append(caret('__none', open), el('span', 'gl', `${t('noGroup')} · ${loose.length}`));
        list.append(h);
        if (open) for (const r of loose) list.append(chRow(r, null));
      }
      }
      // Buttons.
      const cb2 = el('div', 'cb2'); const ff = el('button', '', t('fromFaders'));
      ff.onclick = () => { fromFaders(i); paintCue(i); say('sFaders', { c: cueName(i) }, 'ok', 4000); };
      cb2.append(ff);
      const cb = el('div', 'cb');
      const cp = el('button', `cp${clip === i ? ' on' : ''}`, clip === i ? t('copied') : t('copy'));
      cp.onclick = () => { clip = i; paintAll(); say('sCopied', { c: cueName(i) }, 'ok', 5000); };
      const ps = el('button', 'paste', t('paste')); ps.disabled = clip === null || clip === i;
      ps.onclick = () => { if (clip === null || clip === i) return; S.cues[i] = C.paste(S.cues[clip], S.cues[i]); save(); schedule(i); paintCue(i); say('sPasted', { a: cueName(clip), b: cueName(i) }, 'ok', 5000); };
      cb.append(cp, ps);
      box.append(ch, lvl, me, vs, list, cb2, cb);
    }
    function paintAll() {
      while (meterOffs.length) { try { meterOffs.pop()(); } catch { /* gone */ } }
      for (let i = 0; i < C.CUES; i++) paintCue(i);
    }
    function paint() {
      seg($('sends'), [[true, t('pre')], [false, t('post')]], !!S.pre, (v) => { S.pre = v; save(); writeAll(); paint(); say('sPre', { m: v ? t('pre') : t('post') }, 'ok', 4000); });
      if (cols.length !== C.CUES) {
        $('cues').replaceChildren();
        for (let i = 0; i < C.CUES; i++) { const sct = el('section', 'cue'); cols.push(sct); $('cues').append(sct); }
      }
      paintAll();
      paintDialog();
    }
    $('allFaders').onclick = () => { for (let i = 0; i < C.CUES; i++) fromFaders(i); paintAll(); say('sAll', {}, 'ok', 4000); };

    // ---- Groups dialog ---------------------------------------------------------------------------
    let filter = 'all';
    function groupPicker(anchor, r) {
      openPop(anchor, (p) => {
        const box = el('div', 'gpick');
        for (const g of S.groups) {
          if (g.fixed && !r.click) continue;
          const b = el('button', '', groupName(g)); b.style.setProperty('--g', g.color);
          b.onclick = () => { S.assign[r.id] = g.id; save(); closePop(); writeAll(); paint(); };
          box.append(b);
        }
        const none = el('button', 'none', t('noGroup'));
        none.onclick = () => { delete S.assign[r.id]; save(); closePop(); writeAll(); paint(); };
        box.append(none); p.append(box);
      });
    }
    function paintDialog() {
      $('dTitle').textContent = t('dTitle'); $('dHint').textContent = t('dHint'); $('dDone').textContent = t('done');
      seg($('dFilter'), [['all', t('fAll')], ['audio', t('fAudio')], ['inst', t('fInst')], ['bus', t('fBus')], ['none', t('fNone')]], filter, (v) => { filter = v; paintDialog(); });
      const shown = rows.filter((r) => (filter === 'all' ? true : filter === 'none' ? !r.sub && !S.assign[r.id] : filter === 'bus' ? r.bus : r.kind === filter));
      $('dList').replaceChildren(...shown.map((r) => {
        const d = el('div', 'cr');
        const g = groupOf(r);
        let chip;
        if (r.sub) { chip = el('span', 'chipg none', t('subTag')); chip.title = t('subTip'); }
        else {
          chip = el('button', `chipg${g ? '' : ' none'}`, g ? groupName(g) : t('noGroup')); chip.dataset.pop = '1';
          if (g) chip.style.setProperty('--g', g.color);
          chip.onclick = () => groupPicker(chip, r);
        }
        d.append(el('span', 'kd', t({ system: 'kSystem', audio: 'kAudio', inst: 'kInst', bus: 'kBus', sub: 'kSub' }[r.kind])), el('b', '', r.name), chip);
        return d;
      }));
      const side = $('dGroups');
      side.replaceChildren(el('h4', '', t('groupsHead')));
      for (const g of S.groups) {
        const gi = el('div', 'gi'); const dot = el('i'); dot.style.background = g.color;
        const inp = el('input'); inp.value = groupName(g); inp.maxLength = 24; inp.disabled = !!g.fixed;
        inp.onkeydown = (e) => { e.stopPropagation(); if (e.key === 'Enter') inp.blur(); };
        inp.onchange = () => { g.name = inp.value.trim() || undefined; save(); paintAll(); };
        const n = cueRows().filter((r) => S.assign[r.id] === g.id).length;
        gi.append(dot, inp, el('span', 'ct', String(n)));
        if (g.fixed) gi.append(el('em', '', t('always')));
        else {
          const x = el('button', 'x', '✕'); x.title = '✕';
          x.onclick = () => { S.groups = S.groups.filter((y) => y !== g); for (const [k, v] of Object.entries(S.assign)) if (v === g.id) delete S.assign[k]; for (const c of S.cues) { delete c.gDb[g.id]; delete c.gMute[g.id]; } save(); writeAll(); paint(); };
          gi.append(x);
        }
        side.append(gi);
      }
      const add = el('button', 'add', t('addGroup'));
      add.onclick = () => {
        const n = S.groups.filter((g) => !g.key).length + 1;
        const used = new Set(S.groups.map((g) => g.color));
        const colorNew = [...Object.values(C.GROUP_COLORS), ...C.EXTRA_COLORS].find((c) => !used.has(c)) ?? C.EXTRA_COLORS[n % C.EXTRA_COLORS.length];
        S.groups.push({ id: `g${Date.now().toString(36)}`, name: t('newGroup', { n }), color: colorNew });
        save(); paint();
        const inputs = side.querySelectorAll('.gi input'); inputs[inputs.length - 1]?.select();
      };
      const sug = el('button', 'add', t('suggest'));
      sug.onclick = () => {
        const s2 = C.suggest(cueRows());
        for (const g of s2.groups) if (!S.groups.some((x) => x.id === g.id)) S.groups.push(g);
        for (const [k, v] of Object.entries(s2.assign)) if (!S.assign[k]) S.assign[k] = v;
        save(); writeAll(); paint();
      };
      side.append(add, sug);
    }
    $('groupsBtn').onclick = () => { $('dlg').hidden = false; paintDialog(); };
    $('dDone').onclick = () => { $('dlg').hidden = true; closePop(); paintAll(); };

    // Alt-click the version: a short report for support.
    $('ver').onclick = async (ev) => {
      if (!ev.altKey) return;
      const text = JSON.stringify({ version: VERSION, session: s.name?.value, pre: S.pre, inSession: added,
        cueBuses: [0, 1, 2, 3].map((i) => cueBus(i)?.name.value ?? null),
        groups: S.groups.map((g) => ({ id: g.id, name: groupName(g), n: rows.filter((r) => S.assign[r.id] === g.id).length })),
        rows: rows.map((r) => ({ name: r.name, kind: r.kind, sub: !!r.sub, to: rows.find((x) => x.id === r.dest)?.name ?? null, group: S.assign[r.id] ?? null, cues: [0, 1, 2, 3].map((i) => { const o = cueOut(r, i); return o ? { db: o.gain.real.value, m: o.mute.on, en: o.controls.byId('enabled') ? o.enabled.real.value : null, pre: o.controls.byId('pre_fader') ? o.preFader.real.value : null } : null; }) })),
        cues: S.cues.map((c) => ({ name: c.name, color: c.color, more: c.more, mine: c.mine.length, g: c.gDb, c: Object.keys(c.cDb).length })),
        log: log.slice(-40) }, null, 2);
      try { await navigator.clipboard.writeText(text); say('report', {}, 'ok', 3000); } catch { console.log(text); }
    };

    app = { paint };
    if (!cueBus(0)) say('noCues', {}, 'bad', 8000);
    paint();
    // New or renamed channels: adopt them without changing what anyone hears.
    let timer;
    const later = () => { clearTimeout(timer); timer = setTimeout(async () => { await loadRows(); adopt(); paint(); }, 400); };
    for (const c of [s.tracks, s.buses]) { try { c.onChange?.(later); } catch { /* not observable */ } }
    window.addEventListener('focus', later);
  }

  (async () => {
    for (;;) {
      try { luna = await Luna.connect(); break; }
      catch { say('waiting'); await sleep(1500); }
    }
    Luna.bindShortcuts(luna, { onError: () => undefined });
    await luna.sessions.ready();
    luna.sessions.focused.onChange(() => void build());
    await build();
  })();
})();
