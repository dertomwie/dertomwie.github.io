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
        document.getElementById("writable").innerHTML = "Amount of draws was not a number.";
        return;
    }

    let dayBasedMalus = dayMalus(parseInt(draws, 10));

    let singleLetter = true;

    if (singleLetter) {
        let chosenIndex = Math.floor(Math.random() * poolSource.length) + 1;

        let letter = poolSource[chosenIndex];

        let quality = rolld4(2) - 3 - letterMalus.get(letter) - dayBasedMalus;

        let firstRune = document.createElement("div");
        firstRune.innerHTML = letter + quality;
        firstRune.draggable = "true";
        firstRune.id = "drag_item" + id;
        id += 1;
        firstRune.classList.add("draggable_item");
        firstRune.addEventListener("dragstart", (e) => drag(e));
        document.getElementById("s0").appendChild(firstRune);

        //TODO: Add a rune for the description.
    }
}

function rolld4(n) {
    let result = 0;
    for (i = 0; i < n; i++) {
        result += Math.floor(Math.random() * 4) + 1;
    }
    return result;
}

function allowDrop(e) {
    e.preventDefault();
}

function drag(e) {
    document.getElementById("writable").innerHTML = "dragstart ";
    e.dataTransfer.setData("id", e.target.id);
}

function drop(e) {
    e.preventDefault();
    let data = e.dataTransfer.getData("id");
    document.getElementById("writable").innerHTML.concat("dropped " + data);
    e.target.appendChild(document.getElementById(data));
}
