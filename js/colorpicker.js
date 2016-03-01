/**
 * @author Felipe Alfonso 
 * Basic color picker.
 * (c) Copyright 2012 Administrador. All Rights Reserved. 
 */
(function(window){
	window.cp={
		canvas:null,
		context:null,
		tone:null,
		tonectx:null,
		currentColor:[0,0,0],
		mouseDown:false,
		mouseDownT:false,
		wrap:null,
		top:null,
		drag:false,
		offset:{x:0,y:0},
		oldWrapHeight:null,
		setEvents:function()
		{
			cp.canvas.onmousedown=function(e)
			{
				var id=cp.context.getImageData(e.clientX-cp.wrap.offsetLeft-cp.canvas.offsetLeft,e.clientY-cp.wrap.offsetTop-cp.canvas.offsetTop,1,1);
				var c=id.data;
				cp.setColor(c[0],c[1],c[2]);
				$.setColor(cp.getColor());
				cp.mouseDown=true;
				cp.redrawTone();
			};
			
			cp.canvas.onmouseup=function(e)
			{
				if(cp.mouseDown)
				{
					cp.mouseDown=false;
					$.setColor(cp.getColor());
					cp.redrawTone();
				}
			};
			
			cp.canvas.onmousemove=function(e)
			{
				if(cp.mouseDown)
				{
					var id=cp.context.getImageData(e.clientX-cp.wrap.offsetLeft-cp.canvas.offsetLeft,e.clientY-cp.wrap.offsetTop-cp.canvas.offsetTop,1,1);
					var c=id.data;
					cp.setColor(c[0],c[1],c[2]);
					$.setColor(cp.getColor());
					cp.redrawTone();
				}
			};
			
			//tone
			cp.tone.onmousedown=function(e)
			{
				var id=cp.tonectx.getImageData(e.clientX-cp.wrap.offsetLeft-cp.tone.offsetLeft,e.clientY-cp.wrap.offsetTop-cp.tone.offsetTop,1,1);
				var c=id.data;
				cp.setColor(c[0],c[1],c[2]);
				$.setColor(cp.getColor());
				
				cp.mouseDownT=true;
			};
			
			cp.tone.onmouseup=function(e)
			{
				if(cp.mouseDownT)
				{
					cp.mouseDownT=false;
					$.setColor(cp.getColor());
				}
			};
			
			cp.tone.onmousemove=function(e)
			{
				if(cp.mouseDownT)
				{
					var id=cp.tonectx.getImageData(e.clientX-cp.wrap.offsetLeft-cp.tone.offsetLeft,e.clientY-cp.wrap.offsetTop-cp.tone.offsetTop,1,1);
					var c=id.data;
					cp.setColor(c[0],c[1],c[2]);
					$.setColor(cp.getColor());
				}
			};
			
			cp.top.onmousedown=function(e)
			{
				if(e.which==0 || e.button==0){
					cp.drag=true;
					$.dragOffset.x = e.clientX-cp.wrap.offsetLeft;
					$.dragOffset.y = e.clientY-cp.wrap.offsetTop;
					var x=e.clientX-$.dragOffset.x;
					var y=e.clientY-$.dragOffset.y;
					cp.wrap.style.left=x+"px";
					cp.wrap.style.top=y+"px";
					$.previewWrap.style.zIndex=1;
					$.layerDiv.style.zIndex=1;
					cp.wrap.style.zIndex=999;
				}
			};
			
			cp.top.onmouseup=function(e)
			{
				cp.drag=false;
			};
			
			cp.top.onmousemove=function(e)
			{
				if(cp.drag)
				{
					if(e.which==0 || e.button==0){
						var x=e.clientX-$.dragOffset.x;
						var y=e.clientY-$.dragOffset.y;
						cp.wrap.style.left=x+"px";
						cp.wrap.style.top=y+"px";
					}
				}
				
			};
			
			/*cp.alpha.onmousedown=function(e)
			{
				cp.alphactx.clearRect(0,0,cp.alpha.width,cp.alpha.height);
				
				//cp.alphactx.fillStyle=$.bgPattern;
				
		        cp.alphactx.fillRect(0,0,cp.alpha.width,cp.alpha.height);
		        var al=cp.alphactx.createLinearGradient(0,0,cp.alpha.width,0);
		        al.addColorStop(0,"rgba(0,0,0,0)");
		        al.addColorStop(.9,RGBtoHEX(cp.currentColor[0],cp.currentColor[1],cp.currentColor[2]));
		        al.addColorStop(1,RGBtoHEX(cp.currentColor[0],cp.currentColor[1],cp.currentColor[2]));
		        cp.alphactx.fillStyle=al;
		        cp.alphactx.fillRect(0,0,cp.alpha.width,cp.alpha.height);
		        
		        var id=cp.alphactx.getImageData(e.clientX-cp.wrap.offsetLeft-cp.alpha.offsetLeft,e.clientY-cp.wrap.offsetTop-cp.alpha.offsetTop,1,1);
		        var c=id.data;
		        $.setColorRGBA(cp.currentColor[0],cp.currentColor[1],cp.currentColor[2],c[3]);
		        
		        print(c[0]+" - "+c[1]+" - "+c[2]+" - "+c[3]);
		        
		        cp.alphactx.fillStyle=$.bgPattern;
				
		        cp.alphactx.fillRect(0,0,cp.alpha.width,cp.alpha.height);
		        var al=cp.alphactx.createLinearGradient(0,0,cp.alpha.width,0);
		        al.addColorStop(0,"rgba(0,0,0,0)");
		        al.addColorStop(.9,RGBtoHEX(cp.currentColor[0],cp.currentColor[1],cp.currentColor[2]));
		        al.addColorStop(1,RGBtoHEX(cp.currentColor[0],cp.currentColor[1],cp.currentColor[2]));
		        cp.alphactx.fillStyle=al;
		        cp.alphactx.fillRect(0,0,cp.alpha.width,cp.alpha.height);
			};*/
		},
		redrawTone:function()
		{
			var tone=cp.tonectx.createLinearGradient(0,0,cp.tone.width,0);
	        tone.addColorStop(0,RGBtoHEX(255,255,255));
	        tone.addColorStop(.1,RGBtoHEX(255,255,255));
	        tone.addColorStop(.5,RGBtoHEX(cp.currentColor[0],cp.currentColor[1],cp.currentColor[2]));
	        tone.addColorStop(.9,RGBtoHEX(0,0,0));
	        tone.addColorStop(1,RGBtoHEX(0,0,0));
	        cp.tonectx.clearRect(0,0,cp.tone.width,cp.tone.height);
	        cp.tonectx.fillStyle=tone;
	        cp.tonectx.fillRect(0,0,cp.tone.width,cp.tone.height);
	        //alpha
	        
	        /*cp.alphactx.fillStyle=$.bgPattern;
	        cp.alphactx.fillRect(0,0,cp.alpha.width,cp.alpha.height);
	        var al=cp.alphactx.createLinearGradient(0,0,cp.alpha.width,0);
	        al.addColorStop(0,"rgba(0,0,0,0)");
	        al.addColorStop(.9,RGBtoHEX(cp.currentColor[0],cp.currentColor[1],cp.currentColor[2]));
	        al.addColorStop(1,RGBtoHEX(cp.currentColor[0],cp.currentColor[1],cp.currentColor[2]));
	        cp.alphactx.fillStyle=al;
	        cp.alphactx.fillRect(0,0,cp.alpha.width,cp.alpha.height);*/
		},
		setColor:function(r,g,b)
		{
			cp.currentColor[0]=r;
			cp.currentColor[1]=g;
			cp.currentColor[2]=b;
			var cc=document.getElementById("currentColor");
			cc.style.backgroundColor=cp.getColor();
			var cn=document.getElementById("colorName");
			cn.innerHTML=cp.getRGBString();
		},
		setColorRGBA:function(r,g,b,a)
		{
			cp.currentColor[0]=r;
			cp.currentColor[1]=g;
			cp.currentColor[2]=b;
			cp.currentColor[3]=a;
			var cc=document.getElementById("currentColor");
			cc.style.backgroundColor=cp.getRBGAvalue();
			var cn=document.getElementById("colorName");
			cn.innerHTML=cp.getRGBString();
		},
		getColor:function()
		{
			return RGBtoHEX(cp.currentColor[0],cp.currentColor[1],cp.currentColor[2]);
		},
		getRGBString:function()
		{
			return "R: "+cp.currentColor[0]+" | G: "+cp.currentColor[1]+" | B: "+cp.currentColor[2];
		},
		getRBGAvalue:function()
		{
			return "rgba("+cp.currentColor[0]+","+cp.currentColor[1]+","+cp.currentColor[2]+","+cp.currentColor[3]+")";
		},
		alpha:null,
		alphactx:null,
		init:function()
		{
			cp.canvas=document.getElementById("colorPick");
			cp.tone=document.getElementById("colorTone");
			cp.tonectx=cp.tone.getContext("2d");
			cp.wrap=document.getElementById("colorPickWrap");
			cp.top=document.getElementById("colorTop");
			cp.context=cp.canvas.getContext("2d");
			//cp.alpha=document.getElementById("colorAlpha");
		//	cp.alphactx=cp.alpha.getContext("2d");
			
			var grd=cp.context.createLinearGradient(0,0,cp.canvas.width,0);
			grd.addColorStop(0,    RGBtoHEX(255,0,0));
	        grd.addColorStop(0.15, RGBtoHEX(255,0,255));
	        grd.addColorStop(0.33, RGBtoHEX(0,0,255));
	        grd.addColorStop(0.49, RGBtoHEX(0,255,255));
	        grd.addColorStop(0.67, RGBtoHEX(0,255,0));
	        grd.addColorStop(0.84, RGBtoHEX(255,255,0));
	        grd.addColorStop(1,    RGBtoHEX(255,0,0)); 
	        cp.context.fillStyle=grd;
	        cp.context.fillRect(0,0,cp.canvas.width,cp.canvas.height);
	        
	        var tone=cp.tonectx.createLinearGradient(0,0,cp.tone.width,0);
	        tone.addColorStop(0,RGBtoHEX(255,255,255));
	        tone.addColorStop(.5,RGBtoHEX(cp.currentColor[0],cp.currentColor[1],cp.currentColor[2]));
	        tone.addColorStop(1,RGBtoHEX(0,0,0));
	        
	       /* cp.alphactx.fillStyle=$.bgPattern;
	        cp.alphactx.fillRect(0,0,cp.alpha.width,cp.alpha.height);
	        var al=cp.alphactx.createLinearGradient(0,0,cp.alpha.width,0);
	        al.addColorStop(0,"rgba(0,0,0,0)");
	        al.addColorStop(.9,RGBtoHEX(0,0,0));
	        al.addColorStop(1,RGBtoHEX(0,0,0));
	        cp.alphactx.fillStyle=al;
	        cp.alphactx.fillRect(0,0,cp.alpha.width,cp.alpha.height);*/
	        
	        cp.tonectx.fillStyle=tone;
	        cp.tonectx.fillRect(0,0,cp.tone.width,cp.tone.height);
	        cp.setEvents();
		}
	};
})(window);
