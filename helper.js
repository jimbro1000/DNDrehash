/**
 * Created by Julian Brown on 26/08/2016.
 */

/**
 * generate a random number (mimic old basic function)
 * if x is 0 the result is in the range 0..1
 * otherwise the result is in the range 0..x
 * @return {number}
 */
function rnd(x) {
    if (x === 0) return Math.random(); else return x * Math.random();
}

/**
 * gracefull round float to int (mimic old basic function)
 * @return {number}
 */
function int(x) {
    if (x < 0) return Math.ceil(x); else return Math.floor(x);
}

/***
 * tests if supplied argument is a valid number
 * @param n
 * @returns {boolean}
 */
function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

