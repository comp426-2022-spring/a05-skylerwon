//coin functions

function countFlips(array) {
    var heads = 0;
    var tails = 0;
    if (array.length == 1) {
        if (array[0] == "heads") {
            return "{ heads: " + 1 + " }";
        }
        if (array[0] == "tails") {
            return "{ tails: " + 1 + " }";
        }
    }
    for (let i = 0; i < array.length; i++) {
        if (array[i] == "heads") {
            heads += 1;
        } else {
            tails += 1;
        }
    }
    return {"heads": heads, "tails": tails };
}

function flipACoin(call) {
    var result = "";
    var flip = "";
    flip = coinFlip();
    if (call == flip) {
        result = "win";
    } else {
        result = "lose"
    }
    return {"call": call, "flip": flip, "result": result };
}

function coinFlips(flips) {
    if (flips == null) {
        return coinFlip();
    }
    var arr = [];
    for (let i = 0; i < flips; i++) {
        arr[i] = coinFlip()
    }
    return arr;
}
function coinFlip() {
    var coin = Math.floor(Math.random() * 2)
    if (coin == 0) {
        return "heads"
    }
    if (coin == 1) {
        return "tails"
    }
    return "oops";
}      