//@author Kiran Gaitonde

var prop = require('./properties');
var Model = require('./model');
var captchapng = require('captchapng');


//************ Utility JS Functions ******************************//





//----------Email forgot password funtions--------
// create email text
var emailText = function (pwd, name) {
    var msg = '';
    msg += '<b>Hi' + ' ' + name + '</b>';
    msg += '<br> <br>';
    msg += '<p> Your password has been reset for Brady Intelligent Services account. <br>';
    msg += 'Your new password is : <b> ' + pwd + '</b><br>'
    msg += 'Please use this password to login. You can change your password once you login.<br><br>'
    msg += 'Brady Intelligent Services Team </p>';
    
    return msg;
};



var emailTextContactSender = function (name) {
    var msg = '';
    msg += '<b>Hi' + ' ' + name + '</b>';
    msg += '<br> <br>';
    msg += '<p> Thank you for contacting Brady Intelligent Services. <br>';    
    msg += 'We will get back to you soon!.<br><br>'
    msg += 'Brady Intelligent Services Team </p>';    
    return msg;
};


var emailTextContact = function (name, company, email, phone, msgTxt) {
    var msg = '';
    msg += '<b>New message sent from contact form</b>';
    msg += '<br> <br>';
    msg += '<p> Name:'+name+ '<br>'    ;
    msg += '<p> Company:'+company+ '<br>'    ;
    msg += '<p> Email:' + email + '<br>';
    msg += '<p> Contact#:' + phone + '<br>';
    msg += '<p> Message Text:' + msgTxt + '<br>';
    return msg;
};

//parseInt(Math.random() * 9000 + 1000)

var getCaptcha = function (number) {
    var p = new captchapng(80, 30, number); // width,height,numeric captcha
    p.color(115, 95, 197, 100);  // First color: background (red, green, blue, alpha)
    p.color(30, 104, 21, 255); // Second color: paint (red, green, blue, alpha)
    var img = p.getBase64();
    var imgbase64 = new Buffer(img, 'base64');
    return imgbase64;
} 

//send email (nodemailer)
var sendEmail = function (toEmail, msg, subject) {
    var nodemailer = require('nodemailer');
    var transporter = nodemailer.createTransport( {
        service: prop.emailService,  
        auth: {
            user: prop.emailAddress,
            pass: prop.emailPassword
        }
        
        /*
        host: prop.host, 
        secureConnection: prop.ssl, 
        port: prop.port,
        auth: {
            user: prop.emailAddress,
            pass: prop.emailPassword
        }*/
    });
    transporter.sendMail({
        from: 'BIS',
        to: toEmail,
        subject: subject,
        html: msg
    });
};


// generate random password
var randomString = function (length) {
    var chars = prop.randomPwdChars;
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
};




//-------------Skyspark integration functions-------------------------------
//Josh's code

var toBytes = function (s) {
    var bytes = [];
    for (var i = 0; i < s.length; i++)
        bytes[i] = s.charCodeAt(i)
    return bytes;
};

var toBase64 = function (bytes) {
    var base64chars = [
  //A  B  C  D  E  F  G  H  I  J  K  L  M  N  O  P  Q  R  S  T  U  V  W  X  Y  Z
        65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90,
  //a  b  c  d   e   f   g   h   i   j   k   l   m   n   o   p   q   r   s   t   u   v   w   x   y   z
        97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122,
  //0  1  2  3  4  5  6  7  8  9  +  /
        48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 43, 47];
    
    var buf = bytes;
    var size = bytes.length;
    var s = '';
    var i = 0;
    
    // append full 24-bit chunks
    var end = size - 2;
    for (; i < end; i += 3) {
        var n = ((buf[i] & 0xff) << 16) + ((buf[i + 1] & 0xff) << 8) + (buf[i + 2] & 0xff);
        s += String.fromCharCode(base64chars[(n >>> 18) & 0x3f]);
        s += String.fromCharCode(base64chars[(n >>> 12) & 0x3f]);
        s += String.fromCharCode(base64chars[(n >>> 6) & 0x3f]);
        s += String.fromCharCode(base64chars[n & 0x3f]);
    }
    
    // pad and encode remaining bits
    var rem = size - i;
    if (rem > 0) {
        var n = ((buf[i] & 0xff) << 10) | (rem == 2 ? ((buf[size - 1] & 0xff) << 2) : 0);
        s += String.fromCharCode(base64chars[(n >>> 12) & 0x3f]);
        s += String.fromCharCode(base64chars[(n >>> 6) & 0x3f]);
        s += rem == 2 ? String.fromCharCode(base64chars[n & 0x3f]) : '=';
        s += '=';
    }
    
    return s;
};

/*
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
 * in FIPS PUB 180-1
 * Version 2.1a Copyright Paul Johnston 2000 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for details.
 *
 * Modifications:
 *   10 July 2009  Andy Frank  Edited to run in Fantom and for size/usage
 */
var sha1 = function (buf, key) {
    var chrsz = 8;  /* bits per input character. 8 - ASCII; 16 - Unicode */
    
    /*
   * Calculate the SHA-1 of an array of big-endian words, and a bit length
   */
  function core_sha1(x, len) {
        /* append padding */
        x[len >> 5] |= 0x80 << (24 - len % 32);
        x[((len + 64 >> 9) << 4) + 15] = len;
        
        var w = Array(80);
        var a = 1732584193;
        var b = -271733879;
        var c = -1732584194;
        var d = 271733878;
        var e = -1009589776;
        
        for (var i = 0; i < x.length; i += 16) {
            var olda = a;
            var oldb = b;
            var oldc = c;
            var oldd = d;
            var olde = e;
            
            for (var j = 0; j < 80; j++) {
                if (j < 16) w[j] = x[i + j];
                else w[j] = rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
                var t = safe_add(safe_add(rol(a, 5), sha1_ft(j, b, c, d)),
                         safe_add(safe_add(e, w[j]), sha1_kt(j)));
                e = d;
                d = c;
                c = rol(b, 30);
                b = a;
                a = t;
            }
            
            a = safe_add(a, olda);
            b = safe_add(b, oldb);
            c = safe_add(c, oldc);
            d = safe_add(d, oldd);
            e = safe_add(e, olde);
        }
        return Array(a, b, c, d, e);
    }
    
    /*
   * Perform the appropriate triplet combination function for the current
   * iteration
   */
  function sha1_ft(t, b, c, d) {
        if (t < 20) return (b & c) | ((~b) & d);
        if (t < 40) return b ^ c ^ d;
        if (t < 60) return (b & c) | (b & d) | (c & d);
        return b ^ c ^ d;
    }
    
    /*
   * Determine the appropriate additive constant for the current iteration
   */
  function sha1_kt(t) {
        return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
           (t < 60) ? -1894007588 : -899497514;
    }
    
    /*
   * Calculate the HMAC-SHA1 of a key and some data
   */
  function core_hmac_sha1(key, data) {
        var bkey = bytesToWords(key);
        if (bkey.length > 16) bkey = core_sha1(bkey, key.length * chrsz);
        
        var ipad = Array(16), opad = Array(16);
        for (var i = 0; i < 16; i++) {
            ipad[i] = bkey[i] ^ 0x36363636;
            opad[i] = bkey[i] ^ 0x5C5C5C5C;
        }
        
        var hash = core_sha1(ipad.concat(bytesToWords(data)), 512 + data.length * chrsz);
        return core_sha1(opad.concat(hash), 512 + 160);
    }
    
    /*
   * Add integers, wrapping at 2^32. This uses 16-bit operations internally
   * to work around bugs in some JS interpreters.
   */
  function safe_add(x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }
    
    /*
   * Bitwise rotate a 32-bit number to the left.
   */
  function rol(num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
    }
    
    /*
   * Convert a byte array to an array of big-endian words.
   */
  function bytesToWords(bytes) {
        var words = new Array();
        var size = bytes.length;
        
        // handle full 32-bit words
        for (var i = 0; size > 3 && (i + 4) <= size; i += 4) {
            words.push((bytes[i] << 24) | (bytes[i + 1] << 16) | (bytes[i + 2] << 8) | bytes[i + 3]);
        }
        
        // handle remaning bytes
        var rem = bytes.length % 4;
        if (rem > 0) {
            if (rem == 3) words.push((bytes[size - 3] << 24) | (bytes[size - 2] << 16) | bytes[size - 1] << 8);
            if (rem == 2) words.push((bytes[size - 2] << 24) | bytes[size - 1] << 16);
            if (rem == 1) words.push(bytes[size - 1] << 24);
        }
        
        return words;
    }
    
    var dw = (key === undefined)
    ? core_sha1(bytesToWords(buf), buf.length * chrsz)
    : core_hmac_sha1(key, buf);
    
    var db = new Array();
    for (var i = 0; i < dw.length; i++) {
        db.push(0xff & (dw[i] >> 24));
        db.push(0xff & (dw[i] >> 16));
        db.push(0xff & (dw[i] >> 8));
        db.push(0xff & dw[i]);
    }
    return db;
};





//************export utility functions*****************

module.exports = {
    
    // email password
    emailText : emailText,
    sendEmail : sendEmail,
    randomString : randomString,
    
    //captcha
    getCaptcha: getCaptcha,
    
    //contact
    emailTextContact: emailTextContact,
    emailTextContactSender: emailTextContactSender,
    
  
    
    // skyspark integration
    toBytes : toBytes,
    toBase64 : toBase64,
    sha1 : sha1

};