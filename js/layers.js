/**
 * @author Felipe Alfonso
 * 
 * Layer Class 
 */

function Layer(x,y,width,height)
{
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.bitmap = new Bitmap(x,y,width,height);
	this.history=[];
	this.pixels=[];
	this.drag=[];
	this.active=true;
	this.alpha=100;
	this.scale={x:1,y:1};
	this.name="";
	this.nameEdited=false;
	this.index=-1;
	this.div=document.createElement("div");
	this.div.setAttribute("class","layer");
	this.tmpbitmap = new Bitmap(x,y,width,height);
}

Layer.prototype.setName=function(name)
{
	this.name = name;
};

Layer.prototype.getName=function()
{
	return this.name;
};

Layer.prototype.addHistory=function(data)
{
	this.history.push(data);
	if(this.history.length>100)
	{
		this.history.splice(0,1);
	}
};

Layer.prototype.getLastHistory=function()
{
	var h = this.history[this.history.length-2];
	this.history.splice(this.history.length-1,1);
	
	return h;
};

Layer.prototype.clear=function()
{
	if(!this.active) return;
	this.bitmap.clear();
};

Layer.prototype.setColor=function(r,g,b)
{
	//if(!this.active) return;
	this.bitmap.setColor(r,g,b);
	this.tmpbitmap.setColor(r,g,b);
};

Layer.prototype.setColorRGBA=function(r,g,b,a)
{
	this.bitmap.setColorRGBA(r,g,b,a);
	this.tmpbitmap.setColorRGBA(r,g,b,a);
};

Layer.prototype.setColorHex=function(color)
{
	this.bitmap.setColorHex(color);
	this.tmpbitmap.setColorHex(color);
};

Layer.prototype.setAlpha=function(al)
{
	if(!this.active) return;
	var a=parseInt(al);
	if(isNaN(a)) a=100;
	this.bitmap.setAlpha(a);
	this.alpha = a;
};

Layer.prototype.tempRectDraw=function(x,y,w,h)
{
	this.tmpbitmap.clear();
	this.tmpbitmap.drawRect(x,y,w,h);
};

Layer.prototype.tempLineDraw=function(x1,y1,x2,y2)
{
	this.tmpbitmap.clear();
	drawTo2(x1,y1,x2,y2,this.tmpbitmap);
};


Layer.prototype.saveTempRect=function()
{
	this.bitmap.drawBitmap(this.tmpbitmap,0,0);
	this.tmpbitmap.clear();
};

Layer.prototype.setScale=function(x,y)
{
	this.bitmap.setScale(x,y);
	this.tmpbitmap.setScale(x,y);
	this.width=this.width*x;
	this.height=this.height*y;
};

Layer.prototype.add=function(x,y,d)
{
	if(!this.active) return;
	var xx = Math.round(x/this.scale.x);
	var yy = Math.round(y/this.scale.y);
	this.pixels.push({x:xx,y:yy});
	this.drag.push(d);
};

Layer.prototype.clearPos=function()
{
	if(!this.active) return;
	this.pixels.splice(0,this.pixels.length);
	this.drag.splice(0,this.drag.length);
};

Layer.prototype.draw=function()
{
	if(!this.active) return;
	for(var i=0;i<this.pixels.length;i++)
	{
		if(this.drag[i])
		{
			if(i!=0)
			{
				try{
					drawTo2(this.pixels[i+1].x,this.pixels[i+1].y,this.pixels[i].x,this.pixels[i].y,this.bitmap);
				}catch(e){}
			}
			else
			{
				drawTo2(this.pixels[i].x,this.pixels[i].y,this.pixels[i].x,this.pixels[i].y,this.bitmap);
			}
		}
		else
		{
			drawTo2(this.pixels[i].x,this.pixels[i].y,this.pixels[i].x,this.pixels[i].y,this.bitmap);
		}
	}
};

Layer.prototype.clearDraw=function()
{
	if(!this.active) return;
	for(var i=0;i<this.pixels.length;i++)
	{
		if(this.drag[i])
		{
			if(i!=this.pixels.length)
			{
				try{
					clearTo2(this.pixels[i+1].x,this.pixels[i+1].y,this.pixels[i].x,this.pixels[i].y,this.bitmap);
				}catch(e){}
			}
			else
			{
				clearTo2(this.pixels[0].x,this.pixels[0].y,this.pixels[i].x,this.pixels[i].y,this.bitmap);
			}
		}
		else
		{
			clearTo2(this.pixels[i].x,this.pixels[i].y,this.pixels[i].x,this.pixels[i].y,this.bitmap);
		}
	}
};
