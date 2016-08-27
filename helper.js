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
    if (isNaN(x) || x === 0) return Math.random(); else return x * Math.random();
}

/**
 * gracefull round float to int (mimic old basic function)
 * @return {number}
 */
function int(x) {
    if (isNaN(x)) return 0;
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

/***
 * sets a cookie by name and value with expiry in n days
 * @param cookieName name of cookie to set
 * @param cookieValue value to set
 * @param expiryDays days to cookie expiration
 */
function setCookie(cookieName, cookieValue, expiryDays) {
    var d = new Date();
    d.setTime(d.getTime() + (expiryDays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cookieName + "=" + cookieValue + "; " + expires;
}

/***
 * gets value of named cookie if it exists
 * @param cookieName name of cookie to get
 * @returns {object}
 */
function getCookie(cookieName) {
    var name = cookieName + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}
