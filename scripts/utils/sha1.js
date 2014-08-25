// iVisDesigner - File: scripts/utils/sha1.js
// Copyright (c) 2013-2014, Donghao Ren
// University of California Santa Barbara, Peking University
// Advised by Prof. Tobias Hollerer and previously by Prof. Xiaoru Yuan.
//
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice,
//    this list of conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in the
//    documentation and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
// IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
// PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
// EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
// OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
// WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
// OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
(function() {
// Calculate SHA1 of the bytes array.
// Convert UTF-8 string to bytes array.
function sha1_str2bytes(str) {
    var bytes = [];
    for(var i = 0; i < str.length; i++) {
        bytes.push(str.charCodeAt(i) & 0xff);
    }
    return bytes;
}
// Convert UTF-8 bytes array back to string.
function sha1_bytes2str(bytes) {
    var string = "";
    var i = 0;
    var c;
    while(i < bytes.length) {
        c = bytes[i];
        string += String.fromCharCode(c);
        i++;
    }
    return string;
}
// Convert a hex string to bytes array.
function sha1_hex2bytes(hexstr) {
    var bytes = [];
    var trans = function(c) {
        if(c <= 0x39 && c >= 0x30) return c - 0x30;
        if(c <= 0x66 && c >= 0x61) return c - 0x61 + 10;
        if(c <= 0x46 && c >= 0x41) return c - 0x41 + 10;
        return 0;
    }
    for(var i = 0; i < hexstr.length; i += 2) {
        bytes.push(trans(hexstr.charCodeAt(i)) << 4 | trans(hexstr.charCodeAt(i + 1)));
    }
    return bytes;
}
// Convert bytes array to hex string.
function sha1_bytes2hex(bytes) {
    var str = "";
    var hex_digits = "0123456789abcdef";
    for(var i = 0; i < bytes.length; i++) {
        str += hex_digits[bytes[i] >> 4];
        str += hex_digits[bytes[i] % 16];
        //str += "("+bytes[i] + ")";
    }
    return str;
}
function sha1_hash(data) {
    var sha1_add = function(x, y) {
        var lb = (x & 0xFFFF) + (y & 0xFFFF);
        var hb = (x >> 16) + (y >> 16) + (lb >> 16);
        return (hb << 16) | (lb & 0xFFFF);
    };
    var sha1_S = function(n, x) {
        return (x << n) | (x >>> (32 - n));
    };
    var sha1_const_K = function(t) {
        if(t < 20) return 0x5A827999;
        if(t < 40) return 0x6ED9EBA1;
        if(t < 60) return 0x8F1BBCDC;
        return 0xCA62C1D6;
    };
    var sha1_func = function(t, B, C, D) {
        if(t < 20) return (B & C) | ((~B) & D);
        if(t < 40) return B ^ C ^ D;
        if(t < 60) return (B & C) | (B & D) | (C & D);
        return B ^ C ^ D;
    };
    var sha1_append = function(bytes) {
        var len = 8 * bytes.length;
        bytes.push(128);
        var n_append = 56 - bytes.length % 64;
        if(n_append < 0) n_append += 64;
        for(var i = 0; i < n_append; i++) bytes.push(0);
        bytes.push(0); bytes.push(0); bytes.push(0); bytes.push(0);
        bytes.push((len >> 24) & 0xFF);
        bytes.push((len >> 16) & 0xFF);
        bytes.push((len >> 8) & 0xFF);
        bytes.push(len & 0xFF);
        return bytes;
    };
    bytes = sha1_append(data);
    words = [];
    for(var i = 0; i < bytes.length; i += 4) {
        var w = bytes[i] << 24 | bytes[i + 1] << 16 | bytes[i + 2] << 8 | bytes[i + 3];
        words.push(w);
    }
    H = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0];
    for(var i = 0; i < words.length; i += 16) {
        W = [];
        for(var t = 0; t < 16; t++) W[t] = words[i + t];
        for(var t = 16; t < 80; t++)
            W[t] = sha1_S(1, W[t - 3] ^ W[t - 8] ^ W[t - 14] ^ W[t - 16]);
        A = H[0]; B = H[1]; C = H[2]; D = H[3]; E = H[4];
        for(var t = 0; t < 80; t++) {
            tmp = sha1_add(sha1_S(5, A),
                    sha1_add(sha1_add(sha1_add(sha1_func(t, B, C, D), E), W[t]), sha1_const_K(t)));
            E = D; D = C; C = sha1_S(30, B); B = A; A = tmp;
        }
        H[0] = sha1_add(H[0], A);
        H[1] = sha1_add(H[1], B);
        H[2] = sha1_add(H[2], C);
        H[3] = sha1_add(H[3], D);
        H[4] = sha1_add(H[4], E);
    }
    var rslt = [];
    for(var i = 0; i < 5; i++) {
        rslt.push((H[i] >> 24) & 0xFF);
        rslt.push((H[i] >> 16) & 0xFF);
        rslt.push((H[i] >> 8) & 0xFF);
        rslt.push(H[i] & 0xFF);
    }
    return rslt;
}
NS.sha1str = function(s) {
    return sha1_bytes2hex(sha1_hash(sha1_str2bytes(s)));
};
})();
