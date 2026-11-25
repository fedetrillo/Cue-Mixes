// Cue Mixes: the pure part. Suggested groups from channel names, the level a cue send gets from
// its parts, and copy/paste of a cue. No LUNA calls here.

(function (root) {
  const CUES = 4;
  const DEFAULT_COLORS = ['yellow', 'red', 'green', 'blue'];
  const FLOOR = -40;     // a group or channel offset at the bottom of its slider means "off"
  const TOP = 12;
  const MINUS_INF = -144;

  // Suggested groups, from channel names in several languages. Key -> name key for the UI.
  const SUGGEST = [
    ['bv', /\b(bv|bvs|bgv|bgvs|backing|backs?|coros?|cor|choir|ch(oe|œ)urs?|harm(ony|onies)?|dbl|double|dobles?|ad.?libs?)\b/i],
    ['lead', /\b(lead|ld|lv|main ?vox|vox|vocals?|voz|veu|voix|voce|stimme|gesang|voice|singer|cantante|rap)\b/i],
    ['drums', /\b(kick|kik|bd|snare|snr|sn|sd|toms?|hh|hats?|hi.?hats?|oh|ohs|overheads?|rooms?|drums?|kit|perc|percussion|percusi[oó]n|cymbals?|ride|crash|clap|claps|bombo|caja|platos|bater[ií]a|shaker|tamb(ourine)?|conga|bongo|caj[oó]n|loop)\b/i],
    ['bass', /\b(bass|bajo|baix|basse|basso|sub|808|contrabajo|upright)\b/i],
    ['gtr', /\b(gtrs?|guitars?|guitarra|guitare|chitarra|gitarre|acoustic|ac ?gtr|electric)\b/i],
    ['keys', /\b(keys|piano|rhodes|wurli|organ|[oó]rgano|synths?|pad|pads|pluck|arp|strings|cuerdas|brass|horns?|sax)\b/i],
    ['fx', /\b(verb|reverb|rev|plate|hall|delay|dly|echo|fx|room ?fx)\b/i],
  ];
  const INSTR = /\b(gtrs?|guitars?|guitarra|synths?|keys|piano|organ|strings|brass|sax|horns?|pad)\b/i;
  const words = (name) => String(name ?? '').replace(/[_\-.]+/g, ' ').replace(/([a-z])(\d)/gi, '$1 $2');
  function suggestKey(name, isBus) {
    const w = words(name);
    if (isBus && /\b(verb|reverb|rev|plate|hall|delay|dly|echo|fx)\b/i.test(w)) return 'fx';
    const instrument = INSTR.test(w);
    for (const [k, re] of SUGGEST) {
      if (k === 'fx') continue;
      if (instrument && (k === 'lead' || k === 'bv')) continue;
      if (re.test(w)) return k;
    }
    return null;
  }
  // Groups for a session from its channels: [{ id, key, color }] and { channelId: groupId }.
  // `click` is always there; the rest only when some channel belongs to them.
  const GROUP_ORDER = ['drums', 'bass', 'gtr', 'keys', 'lead', 'bv', 'fx'];
  const GROUP_COLORS = { click: '#9a9fa8', drums: '#e8594f', bass: '#f29a3a', gtr: '#5cc861', keys: '#3fc7c0', lead: '#4f8ff0', bv: '#9a6cf0', fx: '#e46fc0' };
  const EXTRA_COLORS = ['#e9cf3c', '#c4d94f', '#59b8e8', '#d98ad1', '#8fa0b8'];
  function suggest(channels) {
    const assign = {}, used = new Set();
    for (const c of channels) {
      if (c.click) { assign[c.id] = 'click'; continue; }
      // No clue in its own name: the sub-mix buses it goes through may tell (II -> BATERIA).
      const k = suggestKey(c.name, c.bus) ?? (c.via ?? []).map((n) => suggestKey(n, false)).find((x) => x && x !== 'fx') ?? null;
      if (k) { assign[c.id] = k; used.add(k); }
    }
    const groups = [{ id: 'click', key: 'click', color: GROUP_COLORS.click, fixed: true }, ...GROUP_ORDER.filter((k) => used.has(k)).map((k) => ({ id: k, key: k, color: GROUP_COLORS[k] }))];
    return { groups, assign };
  }

  // A fresh cue: nothing copied yet, every offset at 0.
  const freshCue = (i) => ({ name: '', color: DEFAULT_COLORS[i], base: {}, gDb: {}, gMute: {}, cDb: {}, cMute: {}, more: 0, mine: [] });

  // The level a channel gets in a cue, in dB (MINUS_INF for silence), and whether it is muted.
  function level(cue, chId, groupId) {
    const b = cue.base[chId];
    const baseDb = b ? b.db : 0;
    const g = groupId ? (cue.gDb[groupId] ?? 0) : 0;
    const c = cue.cDb[chId] ?? 0;
    const mine = cue.mine.includes(chId) ? cue.more : 0;
    const off = (groupId && g <= FLOOR) || c <= FLOOR;
    let db = baseDb <= MINUS_INF + 1 || off ? MINUS_INF : baseDb + g + c + mine;
    db = Math.min(TOP, db);
    const mute = !!(b?.m) || !!(groupId && cue.gMute[groupId]) || !!cue.cMute[chId];
    return { db, mute };
  }

  // Paste `from` into `to`: the mix travels; the musician's own name, colour, "more me" and its
  // channels stay.
  function paste(from, to) {
    const copy = JSON.parse(JSON.stringify(from));
    return { ...to, base: copy.base, gDb: copy.gDb, gMute: copy.gMute, cDb: copy.cDb, cMute: copy.cMute };
  }

  const fmtDb = (db) => (db <= FLOOR ? '−∞' : `${db > 0 ? '+' : db < 0 ? '−' : ''}${Math.abs(Math.round(db * 10) / 10)}`);

  root.CueLogic = { CUES, DEFAULT_COLORS, FLOOR, TOP, MINUS_INF, GROUP_COLORS, EXTRA_COLORS, suggestKey, suggest, freshCue, level, paste, fmtDb };
})(typeof window !== 'undefined' ? window : globalThis);
