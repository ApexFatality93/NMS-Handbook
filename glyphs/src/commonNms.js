'use strict';

// Copyright 2019-2023 Black Hole Suns
// Written by Stephen Piper
// cc by sa nc

export const findex = window.location.pathname.includes("index")
export const fcedata = window.location.pathname.includes("upload")
export const fnmsce = window.location.pathname.includes("nmsce") || window.location.pathname == "/"
export const fpreview = window.location.pathname.includes("preview")

export function addGlyphButtons(loc, fcn) {
    const gbtn = `
        <button type="button" class="btn-def btn btn-sm col-sm-p125 col-p250">
            <span class="txt-glyph-disp">title</span>
            &nbsp;title
        </button>`

    let h = ""
    for (let i = 0; i < 16; ++i) {
        h += /title/g[Symbol.replace](gbtn, i.toString(16).toUpperCase())
    }

    loc.append(h)

    loc.find(":button").click(function () {
        fcn(this)
    })
}

export function reformatAddress(addr) {
    let out = ""
    if (!addr)
        return out

    addr = addr.toUpperCase()

    if (addr.match(/^[0-9A-F]{12}$/))
        out = glyphToAddr(addr)
    else {
        let str = /[^0-9A-F]+/g[Symbol.replace](addr.toUpperCase(), ":")
        str = str[0] == ":" ? str.slice(1) : str

        for (let i = 0; i < 4; ++i) {
            let idx = str.indexOf(":")
            let end = idx > 4 || idx == -1 ? 4 : idx
            let s = str.slice(0, end)
            str = str.slice(end + (idx <= 4 && idx >= 0 ? 1 : 0))
            out += "0000".slice(0, 4 - s.length) + s + (i < 3 ? ":" : "")
        }
    }

    return out
}

export function addrToGlyph(addr, planet) {
    let s = ""
    //const portalFormat = "psssyyxxxzzz"

    if (addr) {
        let xyz = addressToXYZ(addr)
        let xs = "00" + xyz.s.toString(16).toUpperCase()
        let xx = "00" + (xyz.x + 0x801).toString(16).toUpperCase()
        let xy = "00" + (xyz.y + 0x81).toString(16).toUpperCase()
        let xz = "00" + (xyz.z + 0x801).toString(16).toUpperCase()

        planet = typeof planet === "undefined" || planet === "" || planet < 0 || planet > 15 ? 0 : parseInt(planet)

        s = planet.toString(16).toUpperCase().slice(0, 1)
        s += xs.slice(xs.length - 3)
        s += xy.slice(xy.length - 2)
        s += xz.slice(xz.length - 3)
        s += xx.slice(xx.length - 3)
    }

    return s
}

export function addressToXYZ(addr) {
    let out = {
        x: 0,
        y: 0,
        z: 0,
        s: 0
    }

    // xxx:yyy:zzz:sss
    if (addr) {
        out.p = 0
        out.x = parseInt(addr.slice(0, 4), 16)
        out.y = parseInt(addr.slice(5, 9), 16)
        out.z = parseInt(addr.slice(10, 14), 16)
        out.s = parseInt(addr.slice(15), 16)
    }

    return out
}

function xyzToAddress(xyz) {
    let x = "000" + xyz.x.toString(16).toUpperCase()
    let z = "000" + xyz.z.toString(16).toUpperCase()
    let y = "000" + xyz.y.toString(16).toUpperCase()
    let s = "000" + xyz.s.toString(16).toUpperCase()

    x = x.slice(x.length - 4)
    z = z.slice(z.length - 4)
    y = y.slice(y.length - 4)
    s = s.slice(s.length - 4)

    let addr = x + ":" + y + ":" + z + ":" + s
    return addr
}

export function xyzToGlyph(xyz) {
    let xs = "00" + xyz.s.toString(16).toUpperCase()
    let xx = "00" + (xyz.x + 0x801).toString(16).toUpperCase()
    let xy = "00" + (xyz.y + 0x81).toString(16).toUpperCase()
    let xz = "00" + (xyz.z + 0x801).toString(16).toUpperCase()

    //const portalFormat = "psssyyxxxzzz"
    s = xyz.p.toString(16).toUpperCase()
    s += xs.slice(xs.length - 3)
    s += xy.slice(xy.length - 2)
    s += xz.slice(xz.length - 3)
    s += xx.slice(xx.length - 3)

    return s
}

function glyphToAddr(glyph) {
    //const portalFormat = "psssyyzzzxxx"

    if (glyph) {
        let xyz = {}
        xyz.p = parseInt(glyph.slice(0, 1), 16)
        xyz.s = parseInt(glyph.slice(1, 4), 16)
        xyz.y = (parseInt(glyph.slice(4, 6), 16) - 0x81) & 0xff
        xyz.z = (parseInt(glyph.slice(6, 9), 16) - 0x801) & 0xfff
        xyz.x = (parseInt(glyph.slice(9, 12), 16) - 0x801) & 0xfff

        return xyzToAddress(xyz)
    }

    return ""
}

export function mergeObjects(o, n) {
    if (typeof n !== "object") {
        o = n
    } else if (n) {
        if (typeof o === "undefined")
            o = {}
        for (let x of Object.keys(n))
            o[x] = mergeObjects(o[x], n[x])
    }

    return o
}

export function addObjects(o, n) {
    if (typeof n != "object") {
        if (typeof n == "number") {
            if (typeof o == "undefined")
                o = 0
            o += n
        } else if (typeof n != "undefined")
            o = n
    } else if (n) {
        if (typeof o == "undefined")
            o = {}
        for (let x of Object.keys(n))
            o[x] = addObjects(o[x], n[x])
    }

    return o
}

export function validateAddress(addr, ck) {
    if (addr === "")
        return "No address"

    let c = addressToXYZ(addr)
    let error = ""

    if (c.x > 0xfff) error = "x " + c.x.toString(16) + " > fff"
    else if (c.y > 0xff) error = "y " + c.y.toString(16) + " > ff"
    else if (c.z > 0xfff) error = "z " + c.z.toString(16) + " > fff"
    else if (c.s > 0x2ff) error = "system " + c.s.toString(16) + " > 2ff"

    return error === "" ? "" : addr + " " + error
}

String.prototype.idToName = function () {
    return /-/g[Symbol.replace](this, " ")
}

export function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    )
}

String.prototype.nameToId = function () {
    return /[^a-z0-9_-]/ig[Symbol.replace](this, "-")
}

String.prototype.stripColons = function () {
    return /:/g[Symbol.replace](this, "")
}

String.prototype.stripID = function () {
    return this.replace(/^.*?-(.*)/, "$1")
}

String.prototype.stripMarginWS = function () {
    return this.replace(/^\s*(.*?)\s*$/g, "$1")
}

String.prototype.stripNumber = function () {
    return this.replace(/\s*-?\d*\.*\s*(\D*)\s*/, "$1")
}

const zero = {
    x: 2048,
    y: 128,
    z: 2048,
}

const aboveZero = {
    x: 0x7ff,
    y: 0xfe,
    z: 0x7ff
}

Array.prototype.intersects = function (array) {
    return this.filter(x => array.includes(x))
}

Date.prototype.toDateLocalTimeString = function () {
    const ten = function (i) {
        return i < 10 ? '0' + i : i
    }

    return this.getFullYear() +
        "-" + ten(this.getMonth() + 1) +
        "-" + ten(this.getDate()) +
        " " + ten(this.getHours()) +
        ":" + ten(this.getMinutes()) +
        ":" + ten(this.getSeconds())
}

export function buildGalaxyInfo() {
    for (let l of galaxyRaw)
        for (let j = l.start, step = 1; j <= 255;) {
            if (typeof galaxyList[j - 1].color === "undefined")
                galaxyList[j - 1].color = l.color

            j += step++ % 2 ? l.step1 : l.step2
        }

    for (let i = 0; i < galaxyList.length; ++i) 
        galaxyList[i].name += "  (" + (i + 1) + ")"

    for (let l of economyList)
        l.color = levelRgb[l.number]
}
