// PartyKeys Help Center — AI search endpoint
// Vercel Edge Function. POST { question, lang } → text/event-stream of Claude tokens.
// Requires env var: ANTHROPIC_API_KEY

export const config = { runtime: 'edge' };

// Compact FAQ knowledge base. Format: [qa-key] (Section) Question \n short factual answer.
const FAQ = `
=== QUICK START ===

[qa-q1] What's in the box?
PartyKeys 36-key keyboard, USB-C charging cable, printed quick-start guide. PartyStudio speaker is sold separately or as a bundle, depending on SKU. Final box contents pending launch.

[qa-q2] How do I turn on PartyKeys?
Press and hold the power button for 3 seconds. Keys light up in a colorful breathing pattern when ready. Hold 3 seconds again to turn off.

[qa-q3] How do I get my first sound out of PartyKeys?
PartyKeys is a MIDI keyboard with no built-in sound. Three options: (1) NFC tap to PartyStudio (easiest, no app), (2) Bluetooth to PopuMusic app on phone/tablet, (3) USB-C to Mac/Windows with any DAW like GarageBand, Logic Pro, Cubase, FL Studio, or Studio One.

[qa-q4] Do I need an app to use PartyKeys?
No. With PartyStudio, NFC tap and play immediately. PopuMusic app is optional, adds Game & Course (lessons), Play & Sing (sing-along), and Freeplay (creation).

[qa-q5] Where do I download the PopuMusic app?
App Store (iOS) or Google Play (Android), search "PopuMusic". Compatibility: iPhone 12+ / iPad 8+ (iOS 16+), or Android 11+. M-series Mac can also run the iPad version.

=== PARTYKEYS KEYBOARD ===

[qa-keys-count] How many keys does PartyKeys have?
36 keys (3 octaves) on a single board. Up to 3 PartyKeys can be magnetically connected side-by-side and treated as one continuous keyboard when paired with PartyStudio.

[qa-key-feel] Are the keys velocity-sensitive or weighted?
No. Unweighted, no velocity sensing. Every press produces the same volume. Designed for consistent feel and learning, not piano emulation. For serious piano practice, an acoustic or weighted digital piano is a better fit.

[qa-mpe] Does PartyKeys support MPE, aftertouch, or pitch bend?
Not in this model. PartyKeys focuses on simplicity. MPE/aftertouch are being considered for future products.

[qa-mfb] What does the multi-function button do?
The MFB (small square button next to octave shift) opens shortcuts. Press once: black keys light up. Hold MFB + black key: C# (left)=pair wireless pedal, D# (left)=enter/exit Play & Sing, F#/G#/A# (left)=drum fill-in/fill-end/cut-end, C#/D# (middle)=volume +/-, F#/G#/A# (middle)=timbre next/default/prev, C#/D# (right)=switch dazzling modes, F#/G#/A# (right)=color next/default/prev. Release to return to playing.

[qa-octave] How do I shift octaves or transpose?
Octave shift: tap the slider next to the power button left/right. Semitone transpose: hold MFB + tap slider left/right.

[qa-battery] How long does PartyKeys' battery last and how do I charge it?
2200mAh, ~8 hours typical use, ~1.5 hours to charge from empty using included USB-C cable + 5V/2A adapter. Supports PD fast charging and BC standard. Charging indicator glows white while charging, off when full.

[qa-fast-charge] Can I use a fast charger?
Yes — PartyKeys supports PD fast charging at 5V/2A. Use a safety-certified adapter; off-brand chargers may damage the device.

[qa-battery-check] How do I check the battery level?
With PartyKeys on, briefly press the power button. Keys light green showing 20%/40%/60%/80%/100%. Below 10%: red flashing light on left side.

[qa-colors] How many color themes does PartyKeys have?
Built into keyboard: 12+ color themes via MFB shortcut (hold MFB + right F#/G#/A#). Through PopuMusic app: 100+ colors with per-key customization, scale visualization, atmosphere skins.

[qa-dazzling] How many dazzling (light show) modes are there?
6+ at launch, more added in firmware updates. Switch via MFB + right C#/D#.

[qa-startup-color] Can I change the default startup color?
Yes. After connecting to PartyStudio or the PopuMusic app, set custom default color via the app's lighting settings (lightbulb icon). Remembered next power-on.

[qa-multi-keyboard] Can I connect multiple PartyKeys together?
Yes — up to 3, via magnetic connectors on each side. Place on flat surface, slide together until magnets snap, all keyboards on. Connect to PartyStudio via NFC; PartyStudio treats the chain as one keyboard, assigns each board a different color.

[qa-keyboard-link-fail] The keyboards aren't recognizing each other.
Infrared sensors on both sides need clear line of sight (no stickers/dust). Magnets only align cleanly when keyboards are at same height (use flat hard surface). All keyboards must be powered on with battery.

[qa-pedal] Can I use a sustain pedal?
PartyKeys supports a wireless pedal — currently in development, release date TBA. Pair via MFB + C# (left). For wired sustain, plug a 3.5mm pedal into the back of PartyStudio.

=== PARTYSTUDIO SPEAKER ===

[qa-ps-what] What is PartyStudio?
70W RMS hi-fi Bluetooth speaker (2× 10W tweeters + 2× 25W mid-bass) built for PartyKeys. Includes 128 instruments, 35+ drum patterns, touchscreen with two rotary dials, USB MIDI, Bluetooth MIDI, 3.5mm audio out, NFC tap-to-connect. Also works as a regular Bluetooth speaker for music.

[qa-ps-connect] How do I connect PartyKeys to PartyStudio?
Easiest: NFC tap — bring NFC zones together, auto-pairs. Wired alternative: double-headed USB-C cable from PartyKeys' charging port to PartyStudio's MIDI port (back).

[qa-ps-battery] How long does PartyStudio's battery last?
~8 hours typical use, depends on volume. ~3.5 hours to charge from empty. Works while plugged in for continuous AC use.

[qa-ps-charger] What charger does PartyStudio use?
USB-C with PD support: 15V/2A, 12V/2A, 9V/2A, or 5V/2A. Safety-certified PD adapter recommended for fastest charging.

[qa-ps-instruments] How many instruments are built into PartyStudio?
128 timbres, organized into categories on the touchscreen. Browse with Instrument Dial — rotate to scroll, press to confirm.

[qa-ps-switch-instrument] How do I switch instruments?
Move Instrument Setting Slider to middle position (instrument selection mode), rotate Instrument Dial to scroll. Slider three positions: top=volume, middle=instrument choice, bottom=transpose.

[qa-ps-drum] How do I use the drum machine?
Drum machine on right side. Press dial once=start, press again while playing=fill-in, double-press=stop. Drum slider three positions: top=volume, middle=BPM, bottom=rhythm pattern (35+ available). Can also trigger fill-ins from PartyKeys: hold MFB + F# (left)=fill-in, G# (left)=fill-end, A# (left)=cut-end.

[qa-ps-headphones] Can I plug in headphones or external speakers?
Yes — 3.5mm audio output jack on the back. Output only (cannot be used as mic/audio input).

[qa-ps-bt-music] Can I use PartyStudio as a Bluetooth speaker for music?
Yes — standard Bluetooth audio. Pair "PartyStudio" from phone's Bluetooth settings, stream music/podcasts/video. Independent of MIDI playback from PartyKeys; both run simultaneously.

[qa-ps-other-midi] Can I connect other MIDI keyboards to PartyStudio?
Yes — supports any standard BLE MIDI or USB MIDI device. Wired: USB-C cable into MIDI port. Wireless: pair via Bluetooth MIDI in the Explore menu on touchscreen.

[qa-ps-multi-midi] How many MIDI devices can connect at once?
Up to 3 PartyKeys via NFC/BLE MIDI plus 1 standard MIDI device via the wired MIDI port (4 total). When multiple PartyKeys connect, each gets a different color; treated as one long keyboard. MFB on any PartyKeys takes control of PartyStudio's parameters.

[qa-ps-touchscreen] What does the touchscreen do?
Slide finger along screen edge to adjust overall speaker volume (clockwise=louder). Center of screen displays current mode: Instrument Settings, Drum Machine Settings, Play & Sing, or Explore (Bluetooth pairing, settings, exploratory features).

=== POPUMUSIC APP ===

[qa-app-name] Why is the app still called "PopuMusic" and not "PartyKeys"?
Current app supports both PopuPiano (Gen1) and the new PartyKeys lineup. Rolling out new features over the next few releases; will rename to PartyKeys once complete. Account, courses, songs, and progress carry over automatically when renamed.

[qa-app-features] What can the app do?
Three main features: (1) Game & Course — bite-sized light-guided lessons. (2) Play & Sing — 400+ pop songs with chord lights, no music-reading required. (3) Freeplay — 38 sounds, record up to 7 tracks, customize keyboard colors. Also: Pop Hits (waterfall sheet music), AIGC (AI song generation), tuners, metronome, chord library.

[qa-app-free] Is the app free?
Yes — PopuMusic is free, no in-app subscriptions or paywalls. All courses and songs included.

[qa-app-devices] What devices does the app support?
iOS: iPhone 12+ / iPad 8+ (iOS 16+). Android 11+. Mac M-series can run iPad version from Mac App Store. Does NOT support Windows tablets, Intel-based Macs, or Android emulators on PC.

[qa-app-offline] Can I use the app offline?
No. Needs internet to load courses and song content from servers. Offline modes being investigated for future releases.

[qa-app-import] Can I import my own songs or MIDI files?
App supports adding chord-and-lyric data for Play & Sing (no melody import yet). For full MIDI playback, recommend Synthesia (compatible with PartyKeys as standard MIDI keyboard).

[qa-app-daw] Can I use my own DAW?
Yes — PartyKeys is a standard USB MIDI keyboard, works in any DAW. Connect via USB-C data cable. Officially tested: GarageBand, Logic Pro, Cubase, FL Studio, Studio One. Other MIDI software should also work.

[qa-app-courses] How many courses are in the app?
7 chapter-based courses: The Basics, Finger Skills, Chords, Both Hands, Sing Along, Piano Solo, Advanced Keyboard. New content added regularly.

[qa-app-languages] What languages does the app support?
English, Simplified Chinese, Traditional Chinese, Spanish, Japanese, Korean, Vietnamese, Turkish. More based on demand.

[qa-app-record] Can I record audio or vocals in the app?
Freeplay records up to 7 tracks of MIDI (via app's built-in instruments). Cannot record vocals — no microphone input. To save composition as audio: screen-record on phone, MP4 will include sound.

=== TROUBLESHOOTING ===

[qa-bt-fail] PartyKeys won't connect via Bluetooth.
Try in order: (1) Connect via PopuMusic app, NOT phone's Bluetooth settings — BLE MIDI doesn't appear in system Bluetooth list on most phones. (2) Power on (3-sec hold), keys should breathe colorfully = ready. (3) Charge if low. (4) Disconnect other Bluetooth devices, toggle Bluetooth off/on, retry. (5) Android only: turn on Location Services + grant app location permission (required for BLE MIDI scanning).

[qa-nfc-fail] NFC tap isn't connecting PartyKeys to PartyStudio.
Make sure PartyKeys is on with battery. If already paired to phone via Bluetooth, disconnect first — only one host at a time. Bring NFC zones close (<2cm), hold steady ~1 second.

[qa-pc-fail] PartyKeys won't work or lights flicker on PC.
Use USB 3.0 (blue) port on computer — USB 2.0 may not supply stable power. Confirm DAW is set up to receive MIDI from PartyKeys. Some USB-C cables only carry power, not data; use the included cable or a verified data cable.

[qa-no-response] I press a key but nothing happens.
If using PartyStudio: check speaker on, touchscreen edge volume not muted (slide clockwise). If using app: confirm PartyKeys shows connected (Bluetooth icon). Power-cycle PartyKeys (3-sec off, 5-sec wait, 3-sec on).

[qa-dead-key] One specific key isn't producing sound.
Power-cycle first. If still silent while other keys work: hardware defect. Email support@partykeys.com with order number + short video of the silent key. Free replacement under warranty within 1 business day.

[qa-no-sound-ps] No sound coming out of PartyStudio.
Slide touchscreen edge clockwise to raise volume. Check 3.5mm output jack — if cable plugged in, sound routes there instead of speakers. Confirm PartyKeys is connected and instrument selected.

[qa-bt-find] My phone's Bluetooth can't find PartyStudio.
PartyStudio may already be paired to another device. Open Explore menu on touchscreen, disable auto-connection or manually disconnect, retry pairing from phone.

[qa-latency] Noticeable lag between key press and sound (Android).
Bluetooth MIDI latency varies: well-optimized Android phones 50–80ms (imperceptible to most), unoptimized 200ms (noticeable). For lowest latency: USB-C cable instead of Bluetooth (~20ms). PartyStudio NFC also very low latency.

[qa-latency-ios] Slight lag on iOS / iPad.
iOS BLE MIDI latency typically very low (~50ms), most users don't notice. If you do: switch to USB-C wired, close other Bluetooth-using apps, restart PopuMusic.

[qa-reset] How do I reset PartyKeys if it stops responding?
Long-press power for 15 seconds = force reset. If still unresponsive, charge at least 30 minutes (battery may be fully drained, low levels won't power on instantly even when plugged in), then retry.

[qa-charge-issue] PartyKeys isn't charging.
Confirm adapter is 5V/2A (or higher PD) safety-certified — voltages below 5V won't charge. Try a different USB-C cable (some are charge-only). Test adapter with phone to verify it works. If charging indicator erratic: 15-sec power-button reset.

=== COMPATIBILITY ===

[qa-compat-phones] What phones and tablets are supported?
iOS: iPhone 12+, iPad 8+, iOS 16+. Android 11+ (most flagship phones from 2020+). Mac M-series can install iPad version from Mac App Store. Bluetooth 4.0 BLE required; non-BLE-MIDI devices can use USB-C.

[qa-compat-old] My phone is older than the supported list. Can I still use PartyKeys?
Yes — connect to Mac or Windows via USB-C and use any DAW (GarageBand, Logic Pro, Cubase, FL Studio, Studio One all officially tested). Also works app-free with PartyStudio via NFC.

[qa-compat-windows] Is there a Windows version of the PopuMusic app?
Not yet. Currently runs on iOS, iPadOS, Android, M-series Mac. Windows users: PartyKeys works as USB MIDI controller in any Windows DAW.

[qa-compat-fire] Will the app work on Amazon Fire / Pixel / less common Android tablets?
Theoretically any Android 11+ device works, but not every model tested. Email support@partykeys.com with exact tablet model for confirmation.

[qa-compat-emulator] Can I use an Android emulator on my PC?
No. PC emulators don't relay MIDI signals correctly. Use a real Android device, iOS device, or M-series Mac.

=== WARRANTY & RETURNS ===

[qa-warr-period] What's the warranty period?
1 year from original purchase date from authorized dealer (Amazon, official site, licensed resellers). Keep proof of purchase.

[qa-warr-covered] What's covered by the warranty?
Manufacturing defects: documented functions not working, keyboard won't power on or connect to phones/PartyStudio, can't reset/restart with sufficient battery, other hardware defects causing function failure.

[qa-warr-not-covered] What's not covered?
Disassembled/modified units, accidental damage or misuse, normal wear (scratches/discoloration), purchases from unauthorized resellers, shipping damage (refuse delivery and contact us — we'll re-ship), extreme heat/cold/humidity damage, beyond 1-year period.

[qa-return-policy] Can I return for a refund?
7-day no-reason returns for unused/like-new products. After 7 days, evaluated case-by-case (we're flexible). Email support@partykeys.com with order number to start.

[qa-return-shipping] Who pays for return shipping?
Manufacturing defects in warranty: we cover return shipping + send replacement. Buyer's-remorse returns: buyer pays return shipping.

[qa-return-address] Where do I ship a return to?
Email support@partykeys.com first — return address varies by region (US, EU, Asia). Don't ship without authorization; uncoordinated returns can get lost.

[qa-damaged] The package arrived damaged.
Best: refuse delivery, ask carrier to return to sender, contact us with photos. If already signed: still contact us within 24 hours with photos of damage (box and product). We'll handle carrier claim and ship replacement.

[qa-shipping-time] How long does shipping take?
Estimated: US 3–7 business days, EU 5–10 business days, rest of world 7–14 business days. Final times being finalized for launch.

=== ACCOUNT ===

[qa-acc-login] I can't log into the app.
Try "Forgot Password" in the app. If verification email doesn't arrive within 5 minutes, check spam. Still stuck: email support@partykeys.com with registered email + screenshot of account ID (tap avatar in app). Reply within 24 hours.

[qa-acc-progress] I reinstalled the app and lost my courses and progress.
Progress is tied to account, not device. Sign in with same email or Facebook account; courses, progress, and atmosphere skins sync back. Still missing? Email account ID, we'll restore.

[qa-acc-email] How do I change my email address?
In the app: tap avatar → Edit Profile → Change Email → follow verification.

[qa-acc-multi] Can multiple accounts share one PartyKeys?
Yes. PartyKeys is a hardware MIDI device — anyone can pair. Each user's account stores own progress/courses/unlocks separately.

=== POPUPIANO (GEN1) USERS ===

[qa-gen1-upgrade] I own a PopuPiano. Should I upgrade to PartyKeys?
Two big reasons: (1) Self-contained sound — PartyKeys + PartyStudio gives you a 70W speaker with 128 instruments + 35+ drum patterns, no app/laptop required, NFC tap to play. (2) Cleaner design — single 36-key board with magnetic connectors (up to 3), instead of 29 keys + ChordPad + extension. ChordPad's chord shortcuts are now in Play & Sing mode and the multi-function button. Reasons to keep PopuPiano: if you love the ChordPad strips or rely on PopuSound's 10 instruments, PopuPiano still works great. PopuMusic app supports both.

[qa-gen1-app] Will the PopuMusic app work with PartyKeys?
Yes — same app supports both. Switch in the "Select Instrument" screen on home page. Account, courses, progress shared across both keyboards.

[qa-gen1-popusound] Is my PopuSound speaker compatible with PartyKeys?
No. PopuSound was designed specifically for PopuPiano (own protocol, 10 sounds). PartyKeys uses NFC + USB MIDI with PartyStudio (128 sounds, different engine). The two systems aren't cross-compatible.

[qa-gen1-support] I have a PopuPiano question — where do I get support?
Legacy email support@popumusic.com still works. Consolidating to support@partykeys.com — both reach the same team.
`;

const SYSTEM_INSTRUCTIONS = `You are the PartyKeys customer support assistant.

ABOUT THE PRODUCTS:
- PartyKeys: a 36-key portable MIDI keyboard. Unweighted keys, no velocity. NFC + Bluetooth + USB-C. 100+ colors, 12+ themes built into hardware, 6+ dazzling modes. 8h battery, 1.5h charge.
- PartyStudio: 70W RMS Hi-Fi speaker (2x10W tweeters + 2x25W mid-bass). 128 built-in instruments, 35+ drum patterns. Pairs with up to 3 PartyKeys via NFC.
- PopuMusic app: free companion (iOS 16+ / Android 11+ / M-series Mac), with Game & Course (lessons), Play & Sing (400+ songs), Freeplay (creation).
- Support email: support@partykeys.com (legacy support@popumusic.com also works during transition).

YOUR JOB:
1. Solve the customer's actual question. Do not just paraphrase the FAQ — synthesize the relevant facts into a direct answer.
2. Use ONLY information from the FAQ knowledge base below. Never invent specs, prices, dates, or features.
3. If the FAQ doesn't cover the question, honestly say so and suggest emailing support@partykeys.com.
4. Match the language of the user's question. Reply in the same language they asked (English, 简体中文, 繁體中文, Español, Français, Deutsch, 日本語, 한국어, Português, Tiếng Việt). Keep brand names (PartyKeys, PartyStudio, PopuMusic, PopuPiano) and technical terms (MIDI, USB-C, Bluetooth, BLE, DAW, NFC) in English universally.
5. Tone: friendly, concise, confident. 2–4 sentences for simple questions; up to 8 for complex multi-step answers. Use **bold** for emphasis. Avoid bullet lists unless absolutely needed — write in flowing prose.
6. Be empathetic when the user is frustrated, but get to the answer fast.

OUTPUT FORMAT (strict):
First: the direct answer in plain prose with **bold** when helpful.
Then on a new line at the end, output exactly two tags:
[SOURCES: qa-key1, qa-key2]
[RELATED: qa-key3, qa-key4, qa-key5]

SOURCES = 1–3 qa-keys you actually drew from to construct the answer.
RELATED = 2–4 qa-keys the user might want to read next (different from sources, genuinely related).
qa-keys must be REAL keys from the FAQ below (e.g. qa-bt-fail, qa-battery). Never invent qa-keys.

Be helpful. Solve their problem.`;

const FAQ_BLOCK = `FAQ KNOWLEDGE BASE:\n${FAQ}`;

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'POST, OPTIONS',
        'access-control-allow-headers': 'content-type',
      },
    });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json' },
    });
  }

  let question, lang;
  try {
    const body = await req.json();
    question = (body.question || '').trim();
    lang = body.lang || 'en';
  } catch (e) {
    return jsonError('Invalid JSON', 400);
  }

  if (!question || question.length < 2) return jsonError('Question too short', 400);
  if (question.length > 500) return jsonError('Question too long', 400);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return jsonError('Server not configured (missing ANTHROPIC_API_KEY)', 500);

  let upstream;
  try {
    upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        stream: true,
        system: [
          { type: 'text', text: SYSTEM_INSTRUCTIONS },
          {
            type: 'text',
            text: FAQ_BLOCK,
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: [{ role: 'user', content: question }],
      }),
    });
  } catch (e) {
    return jsonError('Upstream fetch failed: ' + (e && e.message), 502);
  }

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => '');
    return jsonError('Upstream error: ' + (text || upstream.status), upstream.status || 502);
  }

  // Pass through SSE stream from Anthropic to the client.
  return new Response(upstream.body, {
    status: 200,
    headers: {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache, no-transform',
      'x-accel-buffering': 'no',
    },
  });
}

function jsonError(msg, status) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
