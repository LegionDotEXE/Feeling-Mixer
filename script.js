// script.js
// feeling mixer logic. 

var scene = document.getElementById("scene");
var caption = document.getElementById("caption");
var stars = document.getElementById("stars");
var sparkles = document.getElementById("sparkles");
var shelfMixes = document.getElementById("shelf-mixes");

var feelings = ["hope", "dread", "nostalgia", "calm", "longing", "joy"];
// i originally had "sadness" instead of dread but dread sounds cooler

var words = {
  hope: "a lift of light",
  dread: "a low, pressing weight",
  nostalgia: "the ache of something remembered",
  calm: "a long, steady breath",
  longing: "a reach toward something far",
  joy: "a bright, quickening warmth"
  // tried adding "anger" but it didn't really fit the mood of the project
};

var presets = {
  "3am": { hope: 15, dread: 70, nostalgia: 20, calm: 20, longing: 65, joy: 5 },
  "sunday": { hope: 60, dread: 10, nostalgia: 30, calm: 80, longing: 20, joy: 55 },
  "drivehome": { hope: 35, dread: 20, nostalgia: 75, calm: 50, longing: 60, joy: 25 },
  "goodnews": { hope: 85, dread: 5, nostalgia: 15, calm: 60, longing: 10, joy: 90 },
  "reply": { hope: 40, dread: 60, nostalgia: 15, calm: 15, longing: 75, joy: 15 }
};
// "reply" used to have dread at 90 but that felt a bit much

var defaults = { hope: 50, dread: 20, nostalgia: 30, calm: 60, longing: 25, joy: 40 };

function num(id) {
  return Number(document.getElementById(id).value);
}

function clamp(x, a, b) {
  if (x < a) return a;
  if (x > b) return b;
  return x;
}

// copied the formula from stackoverflow
function mix(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t)
  ];
}

function rgb(c) {
  return "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")";
}

function setVar(name, val) {
  scene.style.setProperty(name, val);
}

function readSliders() {
  var r = {};
  for (var i = 0; i < feelings.length; i++) {
    r[feelings[i]] = num(feelings[i]);
  }
  return r;
}

function update() {
  var r = readSliders();
  for (var i = 0; i < feelings.length; i++) {
    document.getElementById(feelings[i] + "-val").textContent = r[feelings[i]];
  }

  // normalizing to 0-1 makes the math way easier to read
  var hope = r.hope / 100;
  var dread = r.dread / 100;
  var nostalgia = r.nostalgia / 100;
  var calm = r.calm / 100;
  var longing = r.longing / 100;
  var joy = r.joy / 100;

  var dayness = clamp(hope - dread * 0.5, 0, 1); 
  var sepia = [210, 170, 115]; // color of old photos, roughly

  // sky colors. mixing night and day
  // if nostalgia is high, the sky is more sepia toned

  var skyTop = mix(mix([10, 14, 32], [120, 160, 205], dayness), sepia, nostalgia * 0.35);
  var skyBottom = mix(mix([20, 22, 44], [255, 185, 105], dayness), sepia, nostalgia * 0.35);
  // var skyBottom = [0,0,0]; // test 4 - nope, too dark

  // brightness and saturation filters. 
  var bright = clamp(0.75 + hope * 0.45 - dread * 0.35, 0.35, 1.25);
  var sat = clamp(0.55 + joy * 0.9 - dread * 0.3, 0.2, 1.5);
  setVar("--scene-filter", "brightness(" + bright + ") saturate(" + sat + ")");

  setVar("--sky-top", rgb(skyTop));
  setVar("--sky-bottom", rgb(skyBottom));

  // the sun/moon thing
  setVar("--light-top", (58 - hope * 42) + "%"); // hope makes it rise
  setVar("--light-left", "50%");
  setVar("--light-size", (46 + hope * 44) + "px");
  setVar("--light-color", rgb(mix([215, 220, 235], [255, 215, 130], hope))); // cold to warm
  setVar("--light-glow", rgb(mix([150, 160, 190], [255, 190, 90], hope)));
  setVar("--light-opacity", clamp(0.35 + hope * 0.6 - dread * 0.15, 0.15, 1));

  setVar("--stars-opacity", clamp(calm * (1 - hope * 1.3) * (1 - dread * 0.5), 0, 1) * 0.9);
  // stars only show up when it's calm and dark (no hope). 
  setVar("--fog-opacity", clamp(dread * 0.85 - calm * 0.35, 0, 0.8));
  setVar("--distant-opacity", clamp(longing * (0.25 + (1 - dayness) * 0.75), 0, 1));
  setVar("--sparkles-opacity", clamp(joy * 0.9, 0, 1));
  setVar("--sepia-opacity", nostalgia * 0.25);
  setVar("--hills-color", rgb(mix(mix([8, 10, 20], [45, 55, 66], dayness * 0.4), sepia, nostalgia * 0.3)));

  caption.textContent = makeCaption(r);
}

function makeCaption(r) {
  var entries = [];
  for (var k in words) {
    entries.push([k, r[k]]);
  }
  //highest to lowest
  entries.sort(function (a, b) {
    return b[1] - a[1];
  });
  
  var top = entries[0];
  var second = entries[1];
  
  if (top[1] < 20) {
    return "a quiet grey, waiting to be mixed.";
  }
  if (second[1] < 20) {
    return words[top[0]] + ", and not much else.";
  }
  return words[top[0]] + ", with " + words[second[0]] + " underneath.";
}

function makeDots(container, count, cls) {
  for (var i = 0; i < count; i++) {
    var d = document.createElement("div");
    d.className = cls;
    d.style.left = Math.random() * 100 + "%";
    d.style.top = Math.random() * 62 + "%"; // kept them in the top 62% so they don't overlap the hills
    d.style.animationDelay = Math.random() * 3 + "s";
    container.appendChild(d);
  }
}

function setSliders(vals) {
  for (var i = 0; i < feelings.length; i++) {
    document.getElementById(feelings[i]).value = vals[feelings[i]];
  }
  update();
}

for (var i = 0; i < feelings.length; i++) {
  document.getElementById(feelings[i]).addEventListener("input", update);
}

var presetButtons = document.querySelectorAll(".preset");
for (var i = 0; i < presetButtons.length; i++) {
  presetButtons[i].addEventListener("click", function () {
    setSliders(presets[this.getAttribute("data-preset")]);
  });
}

document.getElementById("save").addEventListener("click", function () {
  var name = prompt("name this mix");
  if (!name) return;
  var saved = JSON.parse(localStorage.getItem("mixes") || "[]");
  saved.push({ name: name, values: readSliders() });
  localStorage.setItem("mixes", JSON.stringify(saved));
  renderShelf();
});

document.getElementById("clear").addEventListener("click", function () {
  setSliders(defaults);
});

function renderShelf() {
  shelfMixes.innerHTML = ""; 
  var saved = JSON.parse(localStorage.getItem("mixes") || "[]");
  for (var i = 0; i < saved.length; i++) {
    (function (mix) {
      var b = document.createElement("button");
      b.className = "saved-mix";
      b.textContent = mix.name;
      b.addEventListener("click", function () {
        setSliders(mix.values);
      });
      shelfMixes.appendChild(b);
    })(saved[i]);
  }
}

makeDots(stars, 40, "star");
makeDots(sparkles, 18, "sparkle");
renderShelf();
update();