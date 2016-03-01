/**
 * @author Felipe Alfonso
 * 
 * Bitmap Class
 * ------------
 * 
 * This is the core for drawing and pixel manipulation. 
 */

/**
 * Bitmap Class 
 * @param {Number} x
 * @param {Number} y
 * @param {Number} width
 * @param {Number} height
 */
function Bitmap(x,y,width,height)
{
	this.bitmap=document.createElement("canvas");
	this.context=this.bitmap.getContext("2d");
	this.context.webkitImageSmoothingEnabled = this.context.mozImageSmoothingEnabled = false;
	this.width=width;
	this.height=height;
	this.bitmap.width=width;
	this.bitmap.height=height;
	this.x=x;
	this.y=y;
	this.crisp=false;
	this.alpha=1;
}

Bitmap.prototype.drawCrisp=function()
{
	var p=this.context.createPattern(this.bitmap,"no-repeat");
	var oc=this.context.fillStyle;
	this.clear();
	this.context.rect(0,0,this.width,this.height);
	this.context.fillStyle=p;
	this.context.fillRect(0,0,this.width,this.height);
	this.context.fillStyle=oc;
};

Bitmap.prototype.setColor=function(r,g,b)
{
	var col=RGBtoHEX(r,g,b);
	this.context.fillStyle=col;
};

Bitmap.prototype.setColorRGBA=function(r,g,b,a)
{
	this.context.fillStyle="rgba("+r+","+g+","+b+","+a+")";
};

Bitmap.prototype.setColorHex=function(color)
{
	this.context.fillStyle=color;
};

Bitmap.prototype.setScale=function(x,y)
{
	var canv=document.createElement("canvas");
	var ctx=canv.getContext("2d");
	canv.width = this.width;
	canv.height = this.height;
	ctx.drawImage(this.bitmap,0,0);
	this.context.scale(x,y);
	this.width=this.width*x;
	this.height=this.height*y;
	this.clear();
	this.context.drawImage(canv,0,0);
	if(this.crisp) this.drawCrisp();
};

/**
 * 
 * @param {Bitmap} bit
 * @param {Number} x
 * @param {Number} y
 */
Bitmap.prototype.drawBitmap=function(bit,x,y)
{
	this.context.drawImage(bit.bitmap,x,y);
	if(this.crisp) this.drawCrisp();
};

/**
 * 
 * @param {Number} x
 * @param {Number} y
 * @param {Number} w
 * @param {Number} h
 */
Bitmap.prototype.drawRect=function(x,y,w,h)
{
	this.context.fillRect(x,y,w,h);
	if(this.crisp) this.drawCrisp();
};

/**
 * 
 * @param {Number} x
 * @param {Number} y
 * @param {String} color
 */
Bitmap.prototype.setPixel=function(x,y,color)
{
	var oc=this.context.fillStyle;
	this.context.fillStyle=color;
	this.context.fillRect(x,y,1,1);
	this.context.fillStyle=oc;
	if(this.crisp) this.drawCrisp();
};

/**
 * 
 * @param {Number} x
 * @param {Number} y
 * @param {Number} r
 * @param {Number} g
 * @param {Number} b
 */
Bitmap.prototype.setPixelRGB=function(x,y,r,g,b)
{
	var col=RGBtoHEX(r,g,b);
	this.context.fillStyle=col;
	this.context.fillRect(x,y,1,1);
	this.context.fillStyle=oc;
	if(this.crisp) this.drawCrisp();
};

/**
 * 
 * @param {Number} x
 * @param {Number} y
 * 
 * @return {String}
 */
Bitmap.prototype.getPixel=function(x,y)
{
	var id=this.context.getImageData(x,y,1,1);
	var data=id.data;
	var col=RGBtoHEX(data[0],data[1],data[2]);
	return col;
};

/**
 * 
 * @param {Number} x
 * @param {Number} y
 * 
 * @return {Array}
 */
Bitmap.prototype.getPixelRGB=function(x,y)
{
	var id=this.context.getImageData(x,y,1,1);
	var data=id.data;
	return data;
};


/**
 *@param {Number} x
 * @param {Number} y
 * @param {Array} color
 * @return {String}
 */
Bitmap.prototype.compare=function(x,y,color)
{
	var tmpc=this.getPixelRGB(x,y);
	return tmpc[0]==color[0] && tmpc[1]==color[1] && tmpc[2]==color[2] && tmpc[3]==color[3];
	//var tmpc=this.getPixel(x,y);
	//return tmpc==color;
};

Bitmap.prototype.drawPixel=function(x,y)
{
	this.context.fillRect(x,y,1,1);
	if(this.crisp) this.drawCrisp();
};

Bitmap.prototype.clearPixel=function(x,y)
{
	this.context.clearRect(x,y,1,1);
	if(this.crisp) this.drawCrisp();
};

Bitmap.prototype.clear=function()
{
	this.context.clearRect(0,0,this.width,this.height);
};

/**
 * 
 * @param {Number} x
 * @param {Number} y
 */
Bitmap.prototype.floodFill=function(x,y)
{
	var cc=HEXtoRGB(this.context.fillStyle);
	var ca=[cc.r,cc.g,cc.b,255];
	if(this.compare(x,y,ca)) return;
	$.loadingDone=false;
	var q = [];
	q.push({x:x,y:y});
	var oc = this.getPixelRGB(x,y);
	var it = 0;
	
	var tmpLayer = new Bitmap(this.x,this.y,this.width,this.height);
	var cP,nP;
	while(q.length>0)
	{
		
		cP=q.shift();
		++it;
		if(cP.x<0 || cP.x>=this.width) continue;
		if(cP.y<0 || cP.y>=this.height) continue;
		
		tmpLayer.setPixel(cP.x,cP.y,"#000");
		
		if(this.compare(cP.x,cP.y,oc))
		{
			this.drawPixel(cP.x,cP.y);
			var col=[0,0,0,0];
			
			if(tmpLayer.compare(cP.x+1,cP.y,col))
			{
				q.push({x:cP.x+1,y:cP.y});
			}
			
			if(tmpLayer.compare(cP.x,cP.y+1,col))
			{
				q.push({x:cP.x,y:cP.y+1});
			}
			
			if(tmpLayer.compare(cP.x-1,cP.y,col))
			{
				q.push({x:cP.x-1,y:cP.y});
			}
			
			if(tmpLayer.compare(cP.x,cP.y-1,col))
			{
				q.push({x:cP.x,y:cP.y-1});
			}
		}
	}
	$.loadingDone=true;
	if(this.crisp) this.drawCrisp();
};

Bitmap.prototype.floodClear=function(x,y)
{

	var cc=HEXtoRGB(this.context.fillStyle);
	var ca=[0,0,0,0];
	if(this.compare(x,y,ca)) return;
	var q = [];
	q.push({x:x,y:y});
	var oc = this.getPixelRGB(x,y);
	var it = 0;
	
	var tmpLayer = new Bitmap(this.x,this.y,this.width,this.height);
	var cP,nP;
	while(q.length>0)
	{
		cP=q.shift();
		++it;
		if(cP.x<0 || cP.x>=this.width) continue;
		if(cP.y<0 || cP.y>=this.height) continue;
		
		tmpLayer.setPixel(cP.x,cP.y,"#000");

		if(this.compare(cP.x,cP.y,oc))
		{
			this.clearPixel(cP.x,cP.y);
			
			var col=[0,0,0,0];
			
			if(tmpLayer.compare(cP.x+1,cP.y,col))
			{
				q.push({x:cP.x+1,y:cP.y});
			}
			
			if(tmpLayer.compare(cP.x,cP.y+1,col))
			{
				q.push({x:cP.x,y:cP.y+1});
			}
			
			if(tmpLayer.compare(cP.x-1,cP.y,col))
			{
				q.push({x:cP.x-1,y:cP.y});
			}
			
			if(tmpLayer.compare(cP.x,cP.y-1,col))
			{
				q.push({x:cP.x,y:cP.y-1});
			}
		}
	}
	if(this.crisp) this.drawCrisp();
};

/**
 * 
 * @param {Number} al
 */
Bitmap.prototype.setAlpha=function(al)
{
	var a=al/100;
	if(a>=100) return;
	if(a<0) a=0;
	this.alpha=a;
	/*var c=document.createElement("canvas");
	c.width=this.width;
	c.height=this.height;
	var ctx=c.getContext("2d");
	ctx.drawImage(this.bitmap,0,0);
	this.clear();
	this.context.globalAlpha=a;
	this.context.drawImage(c,0,0);
	//print(a);
	if(this.crisp) this.drawCrisp();*/
};
