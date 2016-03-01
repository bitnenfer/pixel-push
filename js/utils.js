/**
 * @author Felipe Alfonso
 * 
 * Just some utils. 
 */

/**
	 * Checks just 3 basic browsers ( Chrome, FireFox and Opera).
	 * @return {String} Returns the name of the current browser.
	 */
	window.checkBrowser=function()
	{
		if(navigator.userAgent.indexOf("Chrome")>=0) return "chrome";
		else if(navigator.userAgent.indexOf("Firefox")>=0) return "firefox";
		else if(navigator.userAgent.indexOf("Opera")>=0) return "opera";
		else return "else";
	};

function get(val)
{
	var url = window.location.href.split("?");
	var values = url[url.length-1].split("&");
	for(var i=0;i<values.length;i++)
	{
		var v = values[i].split("=");
		if(v[0]==val)
		{
			return v[1];
		}
	}
	return "";
}

var pfx = ["webkit", "moz", "ms", "o", ""];
function RunPrefixMethod(obj, method) {
	var p = 0, m, t;
	while (p < pfx.length && !obj[m]) {
		m = method;
		if (pfx[p] == "") {
			m = m.substr(0,1).toLowerCase() + m.substr(1);
		}
		m = pfx[p] + m;
		t = typeof obj[m];
		if (t != "undefined") {
			pfx = [pfx[p]];
			return (t == "function" ? obj[m]() : obj[m]);
		}
		p++;
	}
}

function checkForSize(canvas)
{
	if(get("width").length>0 && get("width").length<=4)
	{
		var w=parseInt(get("width"));
		if(!isNaN(w))
		{
			if(w>0 && w<=1000)
			{
				canvas.width=w;
			}
		}
		
	}
	
	if(get("height").length>0 && get("height").length<=4)
	{
		var h=parseInt(get("height"));
		if(!isNaN(h))
		{
			if(h>0 && h<=1000)
			{
				canvas.height=h;
			}
		}
		
	}
}

Array.prototype.move = function (old_index, new_index) {
    if (new_index >= this.length) {
        var k = new_index - this.length;
        while ((k--) + 1) {
            this.push(undefined);
        }
    }
    this.splice(new_index, 0, this.splice(old_index, 1)[0]);
    return this;
};

function print(m)
{
	var c=document.getElementById("console");
	if(c) c.innerHTML=m+"<br>"+c.innerHTML;
	console.log(m);
}

function getHex(n)
{
	var h=n.toString(16);
	return h.length  == 1 ? "0" + h:h;
}

function RGBtoHEX(r,g,b)
{	
	return "#"+getHex(r)+getHex(g)+getHex(b);
}

function HEXtoRGB(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function drawTo(x,y,x1,y1,bitmap)
{		
	var l = Math.sqrt( (x-x1)*(x-x1)+(y-y1)*(y-y1) );
	for(var i=0;i<l;i++)
	{
		var x=Math.round( x+(x1-x)*i/l );
		var y=Math.round( y+(y1-y)*i/l );
		bitmap.drawPixel(x,y);
	}
}

function clearTo(x,y,x1,y1,bitmap)
{		
	var l = Math.sqrt( (x-x1)*(x-x1)+(y-y1)*(y-y1) );
	for(var i=0;i<l;i++)
	{
		var x=Math.round( x+(x1-x)*i/l );
		var y=Math.round( y+(y1-y)*i/l );
		bitmap.clearPixel(x,y);
	}
}

/**
 * Algorithm and Function taken from:
 * http://www.gamedev.net/page/resources/_/technical/game-programming/line-drawing-algorithm-explained-r1275
 */

function drawTo2(x1,y1,x2,y2,bitmap)
{
	var deltax,deltay,x,y,xinc1,yinc1,xinc2,yinc2,den,num,numadd,numpixels;
	
	deltax = Math.abs(x2-x1);
	deltay = Math.abs(y2-y1);
	x = x1;
	y = y1;
	
	if(x2>=x1)
	{
		xinc1 = 1;
		xinc2 = 1;
	}
	else
	{
		xinc1 = -1;
		xinc2 = -1;
	}
	
	if(y2>=y1)
	{
		yinc1 = 1;
		yinc2 = 1;
	}
	else
	{
		yinc1 = -1;
		yinc2 = -1;
	}
	
	if(deltax >= deltay)
	{
		xinc1 = 0;
		yinc2 = 0;
		den = deltax;
		num = deltax/2;
		numadd = deltay;
		numpixels = deltax;
	}
	else
	{
		xinc2 = 0;
		yinc1 = 0;
		den = deltay;
		num = deltay/2;
		numadd = deltax;
		numpixels = deltay;
	}
	
	for(var curpixel = 0;curpixel<=numpixels;curpixel++)
	{
		bitmap.drawPixel(x,y);
		num+=numadd;
		if(num>=den)
		{
			num-=den;
			x+=xinc1;
			y+=yinc1;
		}
		x+=xinc2;
		y+=yinc2;
	}
}

function clearTo2(x1,y1,x2,y2,bitmap)
{
	var deltax,deltay,x,y,xinc1,yinc1,xinc2,yinc2,den,num,numadd,numpixels;
	
	deltax = Math.abs(x2-x1);
	deltay = Math.abs(y2-y1);
	x = x1;
	y = y1;
	
	if(x2>=x1)
	{
		xinc1 = 1;
		xinc2 = 1;
	}
	else
	{
		xinc1 = -1;
		xinc2 = -1;
	}
	
	if(y2>=y1)
	{
		yinc1 = 1;
		yinc2 = 1;
	}
	else
	{
		yinc1 = -1;
		yinc2 = -1;
	}
	
	if(deltax >= deltay)
	{
		xinc1 = 0;
		yinc2 = 0;
		den = deltax;
		num = deltax/2;
		numadd = deltay;
		numpixels = deltax;
	}
	else
	{
		xinc2 = 0;
		yinc1 = 0;
		den = deltay;
		num = deltay/2;
		numadd = deltax;
		numpixels = deltay;
	}
	
	for(var curpixel = 0;curpixel<=numpixels;curpixel++)
	{
		bitmap.clearPixel(x,y);
		num+=numadd;
		if(num>=den)
		{
			num-=den;
			x+=xinc1;
			y+=yinc1;
		}
		x+=xinc2;
		y+=yinc2;
	}
}