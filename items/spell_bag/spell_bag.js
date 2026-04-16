var id = 0;

const letterMalus = new Map([
    ["e", 2],
    ["t", 2],
    ["a", 2],
    ["o", 2],
    ["i", 2],
    ["n", 1],
    ["s", 1],
    ["r", 1],
    ["h", 1],
    ["d", 1],
    ["l", 1],
    ["u", 1],
    ["c", 1],
    ["m", 1],
    ["f", 1],
    ["y", 0],
    ["w", 0],
    ["g", 0],
    ["p", 0],
    ["b", 0],
    ["v", -1],
    ["k", -1],
    ["x", -1],
    ["q", -1],
    ["j", -1],
    ["z", -1]
]);

function dayMalus(n) {
    if (n < 2) {
        return 0;
    } else if (n < 5) {
        return 1;
    } else if (n < 9) {
        return 2;
    }
    return 3;
}

function rollRunes() {
    let poolSource = document.getElementById("source").value.toLowerCase().split('').filter(char => /[a-zA-Z]/.test(char));
    let poolDescription = document.getElementById("description").value.toLowerCase().split('').filter(char => /[a-zA-Z]/.test(char));

    let draws = document.getElementById("usecount").value;

    if (isNaN(draws)) {
        document.getElementById("rollFeedback").innerHTML = "Amount of draws was not a number.";
        return;
    }

    let dayBasedMalus = dayMalus(parseInt(draws, 10));

    let singleRuneForSource = true;

    if (singleRuneForSource) {
        let chosenIndex = Math.floor(Math.random() * poolSource.length);

        let letter = poolSource[chosenIndex];

        let quality = Math.min(Math.max(rolld4(2) - 3 - letterMalus.get(letter) - dayBasedMalus, -2), 5);
        
        createRune(letter, quality);
    }

    let singleRuneForDescription = true;

    if (singleRuneForDescription) {
        let chosenIndex = Math.floor(Math.random() * poolDescription.length);

        let letter = poolDescription[chosenIndex];

        let quality = Math.min(Math.max(rolld4(2) - 3 - letterMalus.get(letter) - dayBasedMalus, -2), 5);
        
        createRune(letter, quality);
    }
}

function rolld4(n) {
    let result = 0;
    for (i = 0; i < n; i++) {
        result += Math.floor(Math.random() * 4) + 1;
    }
    return result;
}

function createRune(letter, quality) {
        let rune = document.createElement("div");
        rune.innerText = letter + " " + quality;
        rune.draggable = "true";
        rune.id = "rune" + id;
        id += 1;
        rune.classList.add("draggable_item");
        rune.addEventListener("dragstart", (e) => drag(e));
        document.getElementById("inventory").appendChild(rune);
}

function cast() {
    let spell = "";
    let strength = 0;
    let min = 5;
    let max = -2;
    
    let spellContainer = document.getElementById("spell");
    
    for (let element of spellContainer.children) {
        let arr = element.innerText.split(" ");
        spell += arr[0];
        let value = parseInt(arr[1], 10);
        strength += value;
        min = Math.min(value, min);
        max = Math.max(value, max);
    }
    
    spellContainer.replaceChildren();

    document.getElementById("castFeedback").innerText = "spell: " + spell + "\npower: " + strength + "\nmin: " + min + "\nmax: " + max;
}

function importRunes(s) {
    let runeArray = s.split(",");
    
    let malformed = "";
    
    let runeRegex = /^\s*([a-z][a-z]?)\s*(-?[0-5])\s*$/;
    
    for (let runeString of runeArray) {
        if (runeString.length == 0 || !runeRegex.test(runeString)) {
            malformed += runeString + ", ";
        } else {
            let parsed = runeString.match(runeRegex);
        
            if (/[a-z]/.test(parsed[1]) && !isNaN(parsed[2])) {
                createRune(parsed[1], parsed[2]);
            }
        }
    }
    
    if (malformed.length > 0) {
        document.getElementById("importFeedback").innerText = "There were malformed elements: " + malformed;
    }
}

function exportRunes() {
    let exportString = "";
    
    let inventoryContainer = document.getElementById("inventory");
    
    for (let element of inventoryContainer.children) {
        exportString += element.innerText + ",";
    }
    
    return exportString;
}

function importRunesFromText() {
    document.getElementById("importFeedback").innerText = "";
    
    let inventoryContainer = document.getElementById("inventory");
    
    let importContainer = document.getElementById("import");
    
    let importArray = importContainer.value;
    
    importRunes(importArray);
}

function exportRunesToText() {
    let runes = exportRunes();

    document.getElementById("exportField").innerText = runes;
}

const cookiename = "runeCookie";

function importRunesFromCookie() {
    let runeCookie = getCookie(cookiename);
    if (runeCookie == "") {
        document.getElementById("importFeedback").innerText = "No cookie was found.";
    } else {
        importRunes(runeCookie);
    }
}

function exportRunesToCookie() {
    let runes = exportRunes();
    
    setCookie(cookiename, runes, 365);
}

function allowDrop(e) {
    e.preventDefault();
}

function drag(e) {
    e.dataTransfer.setData("id", e.target.id);
}

function drop(e) {
    e.preventDefault();
    let data = e.dataTransfer.getData("id");
    e.target.appendChild(document.getElementById(data));
}

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  let expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

