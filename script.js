// Image caption generator - vanilla JS. Analyses colours/brightness with a canvas, then fills caption templates.
const $ = id => document.getElementById(id); let info = null;
function colourName(r, g, b) {
  const mx = Math.max(r, g, b) / 255, mn = Math.min(r, g, b) / 255, l = (mx + mn) / 2, d = mx - mn;
  if (d < 0.1) return l > 0.8 ? 'white' : l < 0.25 ? 'black' : 'grey';
  let h = mx === r / 255 ? ((g - b) / 255 / d) % 6 : mx === g / 255 ? (b - r) / 255 / d + 2 : (r - g) / 255 / d + 4; h = (h * 60 + 360) % 360;
  return h < 15 || h >= 345 ? 'red' : h < 45 ? 'orange' : h < 70 ? 'golden' : h < 170 ? 'green' : h < 260 ? 'blue' : h < 300 ? 'purple' : 'pink';
}
function analyse(img) {
  const c = document.createElement('canvas'); c.width = c.height = 32; const x = c.getContext('2d'); x.drawImage(img, 0, 0, 32, 32);
  const px = x.getImageData(0, 0, 32, 32).data; let r = 0, g = 0, b = 0; for (let i = 0; i < px.length; i += 4) { r += px[i]; g += px[i + 1]; b += px[i + 2]; }
  const n = px.length / 4; r /= n; g /= n; b /= n; const light = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const colour = colourName(r, g, b), warm = ['red', 'orange', 'golden', 'pink'].includes(colour);
  return { colour, mood: light > 0.65 ? 'bright' : light < 0.35 ? 'moody' : 'balanced', warm, shape: img.width > img.height * 1.1 ? 'landscape' : img.height > img.width * 1.1 ? 'portrait' : 'square', w: img.width, h: img.height };
}
const T = {
  Casual: k => [`Just ${k} and good ${info.colour} vibes.`, `Can't stop looking at this ${info.mood} shot.`, `Little moments like this ${k} make my day.`, `Saving this one for the memories.`],
  Professional: k => [`A ${info.mood} frame highlighting ${k}.`, `Capturing ${k} with a focus on detail and clarity.`, `Moments from ${k}, shared with the team.`, `Quality and care in every frame.`],
  Funny: k => [`Me pretending my ${k} photo was totally planned.`, `${info.colour[0].toUpperCase() + info.colour.slice(1)} is my favourite colour today, ask me tomorrow.`, `This ${info.mood} photo took 1 click and 47 retries.`, `Not a professional photographer, just very enthusiastic.`],
  Aesthetic: k => [`${info.warm ? 'warm' : 'cool'} tones, ${info.mood} light, ${k}.`, `lost in ${info.colour}.`, `soft ${info.shape} frame, quiet mood.`, `${k}, in shades of ${info.colour}.`]
};
function generate() {
  if (!info) return; const k = $('kw').value.trim() || 'this moment';
  $('facts').textContent = `Detected: mostly ${info.colour}, ${info.mood} light, ${info.warm ? 'warm' : 'cool'} tones, ${info.shape} (${info.w}x${info.h}).`;
  $('caps').innerHTML = ''; T[$('tone').value](k).forEach(t => { const li = document.createElement('li'); li.append(t); const b = document.createElement('button'); b.textContent = 'Copy'; b.onclick = () => { navigator.clipboard?.writeText(t); b.textContent = 'Copied'; setTimeout(() => b.textContent = 'Copy', 1200); }; li.append(b); $('caps').append(li); });
  const tags = [info.colour, info.mood, info.shape, info.warm ? 'warmtones' : 'cooltones', ...k.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 2), 'photooftheday'];
  $('tags').textContent = [...new Set(tags)].map(t => '#' + t).join(' '); $('out').hidden = false;
}
$('file').addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return; const img = new Image();
  img.onload = () => { info = analyse(img); $('pic').src = img.src; generate(); }; img.onerror = () => alert('Could not read this image. Please choose a JPG, PNG or WebP file.'); img.src = URL.createObjectURL(f);
});
$('tone').addEventListener('change', generate); $('kw').addEventListener('input', generate);
