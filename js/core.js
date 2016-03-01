/**
 * 	@author Felipe Alfonso
 * 
 * Core for the PixelPush app.
 *
 * (c) Copyright 2012 Felipe Alfonso. All Rights Reserved. 
*/


(function(window){
	window.mouse={
		x:0,
		y:0,
		isDown:false,
		global:{
			x:0,
			y:0,
			isDown:false
		}
	};
	
	window.keyboard={
		isDown:false
	};
	window.$={
		loadingDone:false,
		brush:null,
		editingName:false,
		checkLoading:function()
		{
			if(!$.loadingDone){ document.getElementById("output").innerHTML="loading..."; print("loading");}
			else document.getElementById("output").innerHTML="";
		},
		oldLayersHeight:0,
		canvas:null,
		context:null,
		layers:null,
		width:null,
		height:null,
		bgPattern:null,
		currentLayer:null,
		tools:null,
		scale:{x:1,y:1},
		drawOp:-1, //-1 = do nothing , 0 = fill , 1 = color pick , 2 = erase key
		drawStat:-1, // -1 = do nothing, 0 = draw , 1 = erase, 2 = draw rect, 3 = draw line
		brush:{
			b1:null,
			b2:null,
			b3:null,
			b4:null,
			b5:null
		},
		setScale:function(x,y)
		{
			x=Math.ceil(x);
			y=Math.ceil(y);
			if(x<1) x=1;
			else if(x>5) x=5;
			if(y<1) y=1;
			else if(y>5) y=5;
			
			$.scale.x=x;
			$.scale.y=y;
			$.canvas.width=$.width*x;
			$.canvas.height=$.height*y;
			$.context.fillStyle=$.bgPattern;
			$.context.scale(x,y);
			$.canvas.style.marginTop=(($.canvas.height/2)*-1)+"px";
			$.canvas.style.marginLeft=(($.canvas.width/2)*-1)+"px";
		},
		getCurrentLayer:function()
		{
			return $.layers[$.currentLayer];
		},
		showPopup:function()
		{
			var pop=document.getElementById("popup");
			pop.style.visibility="visible";
			pop.style.zIndex=999999;
			pop.style.marginLeft=(((pop.offsetWidth-10)/2)*-1)+"px";
			pop.style.marginTop=(((pop.offsetHeight-10)/2)*-1)+"px";
			pop.onclick=function(e)
			{
				pop.style.visibility="hidden";
				pop.style.zIndex=-9999;
			};
		},
		drawCanvas:function()
		{
			/*
			 * just a a small window update
			 */
			
			//$.checkLoading();
			var y=30;
			if(parseInt($.layerDiv.style.top)<y)
			{
				$.layerDiv.style.top =y+"px";
			}
			
			if(parseInt($.previewWrap.style.top)<y)
			{
				$.previewWrap.style.top = y+"px";
			}
			
			if(cp.wrap)
			{
				if(parseInt(cp.wrap.style.top)<y)
				{
					cp.wrap.style.top=y+"px";
				}
			}
					
					
			//
			
			$.context.webkitImageSmoothingEnabled = $.context.mozImageSmoothingEnabled = false;
			$.context.clearRect(0,0,$.canvas.width,$.canvas.height);
			$.context.fillRect(0,0,$.canvas.width,$.canvas.height);
			for(var i=0;i<$.layers.length;i++)
			{
				var ly=$.layers[i];
				if(ly.active)
				{
					$.context.globalAlpha=ly.bitmap.alpha;
					$.context.drawImage(ly.bitmap.bitmap,0,0);
					$.context.drawImage(ly.tmpbitmap.bitmap,0,0);
				}
			}
			$.context.globalAlpha=1;
			$.context.drawImage($.brush.bitmap,mouse.x,mouse.y);
			var t=setTimeout("$.drawCanvas()",16);
		},
		addLayer:function()
		{
			//print("add");
			var ly=new Layer(0,0,$.width,$.height);
			//ly.addHistory();
			$.layers.push(ly);
			$.currentLayer=$.layers.length-1;
			
			$.getCurrentLayer().setColorHex(cp.getColor());
			$.updateLayers();
			$.setCurrentLayer($.layers.length-1);
			$.saveCurrentHistory();
		},
		saveImage:function()
		{
			var c=document.createElement("canvas");
			var ct=c.getContext("2d");
			
			c.width=$.getCurrentLayer().bitmap.bitmap.width;
			c.height=$.getCurrentLayer().bitmap.bitmap.height;
			for(var i=0;i<$.layers.length;i++)
			{
				
				if($.getLayer(i).active)
				{
					ct.globalAlpha=$.getLayer(i).bitmap.alpha;
					ct.drawImage($.getLayer(i).bitmap.bitmap,0,0);
				}
			}
			ct.globalAlpha=1;
			if(c){
				$.prevctx.fillStyle=$.bgPattern;
				$.prevctx.fillRect(0,0,$.preview.width,$.preview.height);
				$.prevctx.drawImage(c,0,0);
			}
			
		},
		setCurrentLayer:function(idx)
		{
			if($.getLayer(idx))
			{
				$.currentLayer=idx;
				var i=$.layers.length;
				while(i--)
				{
					if($.getLayer(i)==$.getCurrentLayer())
					{
						$.getLayer(i).div.setAttribute("class","layerSelected");
						document.getElementById("layerName-"+i).className="layerNameSelect";
					}
					else
					{
						$.getLayer(i).div.setAttribute("class","layer");
						$.getLayer(i).div.setAttribute("onclick","$.setCurrentLayer("+i+")");
						document.getElementById("layerName-"+i).className="layerName";
					}
				}
			}
		},
		dragOffset:{
			x:0,
			y:0
		},
		drawPoint:{
			x:0,
			y:0
		},
		toolType:0, //0=draw , 1=erase, 2=fill, 3=fill clear, 4=rect, 5=line, 6=color pick
		setEvents:function()
		{
			
			// Mouse events.
			$.canvas.onmousedown=function(e)
			{
				mouse.isDown=true;
				
				mouse.x = Math.round((e.clientX-$.canvas.offsetLeft)/$.scale.x);
				mouse.y = Math.round((e.clientY-$.canvas.offsetTop)/$.scale.y);
				
				if(e.which==0 || e.button==0)
				{

					if($.toolType==0)
					{
						$.getCurrentLayer().add(mouse.x,mouse.y,false);
						$.getCurrentLayer().draw();
						$.drawStat=0;

					}
					else if($.toolType==4)
					{
						$.rectangle.x=mouse.x;
						$.rectangle.y=mouse.y;
						$.drawStat=2;
						
					}
					else if($.toolType==5)
					{
						$.drawPoint.x=mouse.x;
						$.drawPoint.y=mouse.y;
						$.drawStat=3;
						
					}
					else if($.toolType==1)
					{
						$.getCurrentLayer().add(mouse.x,mouse.y,false);
						$.getCurrentLayer().clearDraw();
						$.drawStat=1;
					}
					else if($.toolType==2)
					{
						$.getCurrentLayer().bitmap.floodFill(mouse.x,mouse.y);
						
					}
					else if($.toolType==3)
					{
						$.getCurrentLayer().bitmap.floodClear(mouse.x,mouse.y);
					}
					else if($.toolType==6)
					{
						
						var cn=document.createElement("canvas");
						var ct=cn.getContext("2d");
						cn.width=$.width;
						cn.height=$.height;
						
						for(var i=0;i<$.layers.length;i++)
						{
							var ly=$.getLayer(i);
							if(ly.active && ly.bitmap)
							{
								ct.globalAlpha=ly.bitmap.alpha;
								ct.drawImage(ly.bitmap.bitmap,0,0);
							}
							ct.globalAlpha=1;
						}
						
						var id=ct.getImageData(mouse.x,mouse.y,1,1);
						var c=id.data;
						cp.setColor(c[0],c[1],c[2]);
						$.setColor(cp.getColor());

					}
				}
				else if(e.which==2 || e.button==2)
				{
					if($.toolType==1)
					{
						$.getCurrentLayer().add(mouse.x,mouse.y,false);
						$.getCurrentLayer().clearDraw();
						$.drawStat=1;
					}
					else if($.toolType==3)
					{
						$.getCurrentLayer().bitmap.floodClear(mouse.x,mouse.y);
					}
				}
				
			};
			
			document.onmouseup=function(e)
			{
				if(mouse.isDown)
				{
					mouse.isDown=false;
					if($.getCurrentLayer() == "undefined" || !$.getCurrentLayer().active) return;
					if($.drawStat==2 || $.drawStat==3)
					{
						$.getCurrentLayer().saveTempRect();
					}
					$.drawStat=-1;
					$.getCurrentLayer().clearPos();
					$.saveCurrentHistory();
					$.saveImage();
				}
				$.layerDrag=false;
				$.prevDrag=false;
				cp.drag=false;
			};
			
			$.canvas.onmouseup=function(e)
			{
				
				if($.getCurrentLayer() == "undefined" || !$.getCurrentLayer().active) return;
				if(mouse.isDown)
				{
					mouse.isDown=false;
					if($.drawStat==2 || $.drawStat==3)
					{
						$.getCurrentLayer().saveTempRect();
					}
					$.drawStat=-1;
					$.getCurrentLayer().clearPos();
					$.saveCurrentHistory();
					
					$.saveImage();
				}
				
			};
			
			$.canvas.onmouseout=function(e)
			{
				if($.getCurrentLayer() == "undefined" || !$.getCurrentLayer().active) return;
				//if(mouse.isDown) $.getCurrentLayer().clearPos();
			};
			
			$.canvas.onmouseover=function(e)
			{
				if($.getCurrentLayer() == "undefined" || !$.getCurrentLayer().active) return;
				/*mouse.x = Math.round((e.clientX-$.canvas.offsetLeft)/$.scale.x);
				mouse.y = Math.round((e.clientY-$.canvas.offsetTop)/$.scale.y);
				if(mouse.isDown) $.getCurrentLayer().add(mouse.x,mouse.y);*/
			};
			
			$.canvas.onmousemove=function(e)
			{
				if($.getCurrentLayer() == "undefined" || !$.getCurrentLayer().active) return;
				mouse.x = Math.round((e.clientX-$.canvas.offsetLeft)/$.scale.x);
				mouse.y = Math.round((e.clientY-$.canvas.offsetTop)/$.scale.y);
				if(mouse.isDown)
				{
					if($.drawStat==0)
					{
						$.getCurrentLayer().add(mouse.x,mouse.y,true);
						$.getCurrentLayer().draw();
					}
					else if($.drawStat==1)
					{
						$.getCurrentLayer().add(mouse.x,mouse.y,true);
						$.getCurrentLayer().clearDraw();
					}
					else if($.drawStat==2)
					{
						$.getCurrentLayer().tempRectDraw($.rectangle.x,$.rectangle.y,mouse.x-$.rectangle.x,mouse.y-$.rectangle.y);
					}
					else if($.drawStat==3)
					{
						$.getCurrentLayer().tempLineDraw($.drawPoint.x,$.drawPoint.y,mouse.x,mouse.y);
					}
					
				}
			};
			
			// Keyboard events.
			document.onkeydown=function(e)
			{
				if($.editingName) return;
				//-1 = do nothing , 0 = fill , 1 = color pick , 2 = erase key 
				if(e.which==71 || e.keyCode==71)
				{
					$.drawOp=0;
					$.setToolType(2);
				}
				if(e.which==73 || e.keyCode==73)
				{
					$.drawOp=1;
					$.setToolType(6);
					
				}
				if(e.ctrlKey && !keyboard.isDown)
				{
					if(e.which==90 || e.keyCode==90)
					{
						if($.getCurrentLayer().history.length>1)
						{
							
							var c=$.getCurrentLayer().getLastHistory();
							
							//if(c)
							//{
								
								$.getCurrentLayer().bitmap.clear();
								$.getCurrentLayer().bitmap.context.drawImage(c,0,0);
								$.saveImage();
						//	}
						}
						
						keyboard.isDown=true;
					}
				}
				if(e.which==69 || e.keyCode==69)
				{
					$.drawOp=2;
					$.setToolType(1);
				}
				
				if(e.which==66 || e.keyCode==66)
				{
					$.drawOp=-1;
					$.setToolType(0);
				}
				
				if(e.which==76 || e.keyCode==76)
				{
					$.drawOp=-1;
					$.setToolType(5);
				}
				
				if(e.which==82 || e.keyCode==82)
				{
					$.drawOp=-1;
					$.setToolType(4);
				}
				
				if(e.which==67 || e.keyCode==67)
				{
					$.drawOp=-1;
					$.setToolType(3);
				}
			};
			
			document.onkeyup=function(e)
			{
				if(e.ctrlKey)
				{
					if(e.which==90 || e.keyCode==90)
					{
						keyboard.isDown=false;
					}
				}
				$.drawOp=-1;
			};
			
			//Mouse wheel zoom in and out.
			function handleMouseWheel(event)
			{
				var delta = 0;
		        if (!event) 
		                event = window.event;
		        if (event.wheelDelta) { 
		                delta = event.wheelDelta/120;
		        } else if (event.detail) { 

		                delta = -event.detail/3;
		        }

		        if (delta)
		        {
		        	if($.scale.x>1 && delta<0)
		        	{
		        		$.setScale($.scale.x-1,$.scale.y-1);
		        	}
		        	else if($.scale.x<=4 && delta>0)
		        	{
		        		$.setScale($.scale.x+1,$.scale.y+1);
		        	}
		        }
		              
		        if (event.preventDefault)
		                event.preventDefault();
			event.returnValue = false;
			};
			
			if(window.addEventListener) document.addEventListener('DOMMouseScroll', handleMouseWheel, false);
			document.onmousewheel=handleMouseWheel;
			
			// Drag elem
			
			$.previewTop.onmousedown=function(e)
			{
				if(e.which==0 || e.button==0)
				{
					$.dragOffset.x = e.clientX-$.previewWrap.offsetLeft;
					$.dragOffset.y = e.clientY-$.previewWrap.offsetTop;
					var x=e.clientX-$.dragOffset.x;
					var y=e.clientY-$.dragOffset.y;
					$.previewWrap.style.left = x+"px";
					$.previewWrap.style.top = y+"px";
					$.prevDrag=true;
					$.previewWrap.style.zIndex=999;
					$.layerDiv.style.zIndex=1;
					cp.wrap.style.zIndex=1;
				}
			};
			
			
			$.previewTop.onmousemove=function(e)
			{
				if($.prevDrag)
				{
					var x=e.clientX-$.dragOffset.x;
					var y=e.clientY-$.dragOffset.y;
					$.previewWrap.style.left = x+"px";
					$.previewWrap.style.top = y+"px";
				}
			};
			
			//Layer drag
			
			$.layerTopDiv.onmousedown=function(e)
			{
				if(e.which==0 || e.button==0)
				{
					$.dragOffset.x = e.clientX-$.layerDiv.offsetLeft;
					$.dragOffset.y = e.clientY-$.layerDiv.offsetTop;
					var x=e.clientX-$.dragOffset.x;
					var y=e.clientY-$.dragOffset.y;
					$.layerDiv.style.left = x+"px";
					$.layerDiv.style.top = y+"px";
					$.layerDrag=true;
					$.previewWrap.style.zIndex=1;
					$.layerDiv.style.zIndex=999;
					cp.wrap.style.zIndex=1;
				}
			};
			
			
			$.layerTopDiv.onmousemove=function(e)
			{
				if($.layerDrag)
				{
					var x=e.clientX-$.dragOffset.x;
					var y=e.clientY-$.dragOffset.y;
					$.layerDiv.style.left = x+"px";
					$.layerDiv.style.top = y+"px";
				}
			};
			
			document.onmousemove=function(e)
			{
				if($.layerDrag)
				{
					var x=e.clientX-$.dragOffset.x;
					var y=e.clientY-$.dragOffset.y;
					$.layerDiv.style.left =x+"px";
					$.layerDiv.style.top = y+"px";
				}
				
				if($.prevDrag)
				{
					var x=e.clientX-$.dragOffset.x;
					var y=e.clientY-$.dragOffset.y;
					$.previewWrap.style.left = x+"px";
					$.previewWrap.style.top = y+"px";
				}
				
				if(cp.drag)
				{
					var x=e.clientX-$.dragOffset.x;
					var y=e.clientY-$.dragOffset.y;
					cp.wrap.style.left=x+"px";
					cp.wrap.style.top=y+"px";
				}
				
				if(tools.drag)
				{
					var x=e.clientX-tools.offset.x;
					var y=e.clientY-tools.offset.y;
					tools.div.style.left=x+"px";
					tools.div.style.top=y+"px";
				}
				
				if(mouse.isDown)
				{
					var x=Math.round((e.clientX-$.canvas.offsetLeft)/$.scale.x);
					var y=Math.round((e.clientY-$.canvas.offsetTop)/$.scale.y);
					if($.drawStat==2)
					{
						$.getCurrentLayer().tempRectDraw($.rectangle.x,$.rectangle.y,x-$.rectangle.x,y-$.rectangle.y);
					}
					else if($.drawStat==0)
					{
						$.getCurrentLayer().add(x,y,true);
						$.getCurrentLayer().draw();
					}
					else if($.drawStat==1)
					{
						$.getCurrentLayer().add(x,y,true);
						$.getCurrentLayer().clearDraw();
					}
					else if($.drawStat==3)
					{
						$.getCurrentLayer().tempLineDraw($.drawPoint.x,$.drawPoint.y,x,y);
					}
				}
			}
		},
		rectangle:{
			x:0,y:0,w:0,h:0
		},
		removeLayer:function()
		{
			//print("remove");
			if($.layers.length<2) return;
			$.layers.splice($.currentLayer,1);
			if($.currentLayer==0)
			{
				$.setCurrentLayer(0);
			}
			else if($.currentLayer>=$.layers.length)
			{
				$.setCurrentLayer($.currentLayer-1);
			}
			else
			{
				$.setCurrentLayer($.currentLayer);
			}
			$.updateLayers();
		},
		enableFullScreen:function()
		{
			var e = document.getElementById("fullscreen");
			//e.onclick = function() {
				if (RunPrefixMethod(document, "FullScreen") || RunPrefixMethod(document, "IsFullScreen")) {
					RunPrefixMethod(document, "CancelFullScreen");
				}
				else {
					RunPrefixMethod(e, "RequestFullScreen");
				}
			//}
		},
		disableFullScreen:function()
		{
			
		},
		layerDiv:null,
		layerDraw:false,
		preview:null,
		prevDrag:false,
		getLayer:function(idx)
		{
			return $.layers[idx];
		},
		imageScale:1,
		layersDiv:null,
		downloadImage:function()
		{
			if(!$.loadingDone) return;
			var c=document.createElement("canvas");
			var ct=c.getContext("2d");
			
			c.width=$.getCurrentLayer().bitmap.bitmap.width;
			c.height=$.getCurrentLayer().bitmap.bitmap.height;
			for(var i=0;i<$.layers.length;i++)
			{
				
				if($.getLayer(i).active)
				{
					ct.globalAlpha=$.getLayer(i).bitmap.alpha;
					ct.drawImage($.getLayer(i).bitmap.bitmap,0,0);
				}
			}
			c.toBlob(function(blob) {
			    saveAs(blob, "pp-image.png");
			});
		},
		updateLayers:function()
		{
			if($.layersDiv==null) return;
			$.layersDiv.innerHTML="";
			var i=$.layers.length;
			while(i--)
			{
				var div=$.getLayer(i).div;
				if($.getLayer(i)==$.getCurrentLayer())
				{
					$.getLayer(i).div.setAttribute("class","layerSelected");
				}
				else
				{
					$.getLayer(i).div.setAttribute("class","layer");
					$.getLayer(i).div.setAttribute("onclick","$.setCurrentLayer("+i+")");
				}
				if(String($.getLayer(i).getName()).length<1)
				{
					 $.getLayer(i).setName("Layer "+i);
				}
				

				div.innerHTML="<div id='layerName-"+i+"' class='layerName' onblur='$.saveLayerName("+i+",this)' onclick='$.editLayerName("+i+",this);'>"+$.getLayer(i).getName()+"</div>";
				
				if($.getLayer(i).active) div.innerHTML+="Visible <input type='checkbox' checked='true' onclick='$.activateLayer("+i+",this)' />";
				else div.innerHTML+="Visible <input type='checkbox' onclick='$.activateLayer("+i+",this)'  /><br>";
				
				div.innerHTML+="<br>Alpha: <input type='range' min='0' max='100' value='"+$.getLayer(i).alpha+"'size='3' onchange='$.updateAlpha("+i+",this)'/>";
				
				
				$.layersDiv.appendChild(div);
			}
		},
		clearCurrentLayer:function()
		{
			$.getCurrentLayer().clear();
			$.saveImage();
		},
		updateAlpha:function(idx,elem)
		{
			var v=parseInt(elem.value);
			if(isNaN(v))
			{
				v = 100;
				elem.value = v;
			}
			$.getLayer(idx).setAlpha(v);
			$.saveImage();
		},
		activateLayer:function(idx,elem)
		{
			if($.getLayer(idx))
			{
				if(elem.checked==true)
				{
					$.getLayer(idx).active=true;
				}
				else
				{
					$.getLayer(idx).active=false;
				}
			}
		},
		moveLayerUp:function()
		{
			//print("up");
			if($.currentLayer!=$.layers.length-1)
			{
				$.layers.move($.currentLayer,$.currentLayer+1)
				$.updateLayers();
				$.setCurrentLayer($.currentLayer+1);
				
			}
		},
		moveLayerDown:function()
		{
			if($.currentLayer!=0)
			{
				$.layers.move($.currentLayer,$.currentLayer-1);
				$.updateLayers();
				$.setCurrentLayer($.currentLayer-1);
				
			}
		},
		editLayerName:function(idx,elem)
		{
			$.editingName=true;
			elem.contentEditable=true;
			elem.style.backgroundColor="#fff";
			elem.onkeydown=function(e)
			{

				if(e.which==13 || e.keyCode==13)
				{
					$.saveLayerName(idx);
					elem.contentEditable=false;
					if(elem) elem.style.backgroundColor="";
				}
			};
			$.getLayer(idx).nameEdited=true;
		},
		saveLayerName:function(idx,elem)
		{
			//return;
			$.editingName=false;
			var layer=document.getElementById("layerName-"+idx);
			var str = new String(layer.innerHTML);
			if(elem) elem.style.backgroundColor="";
			if(str.length<1)str = "Layer "+idx;
			else{
				str=str.replace("<br>","");
				str=str.replace("<div>","");
				str=str.replace("</div>","");
				str=str.replace("/","");
				str=str.replace("<","");
				str=str.replace(">","");
				str=str.slice(0,20);
				if(str.length<1)str = "Layer "+idx;
			}
			layer.innerHTML=str;
			$.getLayer(idx).setName(str);
		},
		layerTopDiv:null,
		previewTop:null,
		previewWrap:null,
		prevctx:null,
		setColor:function(color)
		{
			for(var i=0;i<$.layers.length;i++)
			{
				$.getLayer(i).setColorHex(color);
			}
			$.brush.setColorHex(color);
			$.brush.clear();
			$.brush.drawRect(0,0,1,1);
		},
		setColorRGBA:function(r,g,b,a)
		{
			for(var i=0;i<$.layers.length;i++)
			{
				$.getLayer(i).setColorRGBA(r,g,b,a);
			}
		},
		saveToLocal:function()
		{
			if(!$.loadingDone) return;
			if(typeof(Storage)=="undefined"){
				alert("Sorry, your browser doesn't support Local Storage.")
				return;
			} 
			var c=document.createElement("canvas");
			var ct=c.getContext("2d");
			c.width=$.width;
			c.height=$.height;
			for(var i=0;i<$.layers.length;i++)
			{
				
				if($.getLayer(i).active){
					ct.globalAlpha=$.getLayer(i).bitmap.alpha;
					ct.drawImage($.getLayer(i).bitmap.bitmap,0,0);
				}
				ct.globalAlpha=1;
			}
			if(c){
				var du = c.toDataURL();
				localStorage.imageSave=""+du;
				alert("Image Saved to local storage.");
			}
		},
		loadFromLocal:function()
		{
			if(!$.loadingDone) return;
			if(typeof(Storage)=="undefined")
			{
				alert("Sorry, your browser doesn't support Local Storage.");
				return;
			}
			
			
			if(localStorage.imageSave)
			{
				if(localStorage.imageSave.length<1)
				{
					alert("You haven't saved any Image.");
					return;
				}
				else
				{
					$.addLayer();
					if($.layers[$.layers.length-1])var ly=$.layers[$.layers.length-1];
					var img=new Image();
					img.src = localStorage.imageSave;
					img.onload=function()
					{
						if(ly)
						{
							ly.bitmap.clear();
							ly.bitmap.context.drawImage(img,0,0);
							alert("Image loaded on a new Layer.");
						}
					}
				}
			}
			else
			{
				alert("You haven't saved any Image.");
				return;
			}
		},
		hidePreviewPop:function()
		{
			document.getElementById("previewPopBtn").innerHTML="Show Preview";
			document.getElementById("previewPopBtn").setAttribute("onclick","$.showPreviewPop()");
			$.previewWrap.style.visibility="hidden";
		},
		showPreviewPop:function()
		{
			if(!$.loadingDone) return;
			document.getElementById("previewPopBtn").innerHTML="Hide Preview";
			document.getElementById("previewPopBtn").setAttribute("onclick","$.hidePreviewPop()");
			$.previewWrap.style.visibility="visible";
		},
		hidePreview:function()
		{
			$.preview.style.visibility="hidden";
			$.previewWrap.style.height="20px";
			document.getElementById("hide").setAttribute("onclick","$.showPreview()");
			document.getElementById("hide").innerHTML="[+]";
		},
		showPreview:function()
		{
			$.previewWrap.style.width=($.width)+"px";
			$.previewWrap.style.height=($.height)+"px";

			$.preview.style.visibility="visible";
			document.getElementById("hide").setAttribute("onclick","$.hidePreview()");
			document.getElementById("hide").innerHTML="[-]";
		},
		hideColor:function()
		{
			cp.oldWrapHeight=cp.wrap.offsetHeight-10;
			var cc=document.getElementById("currentColor");
			var cn=document.getElementById("colorName");
			cc.style.visibility="hidden";
			cn.style.visibility="hidden";
			cp.canvas.style.visibility="hidden";
			cp.tone.style.visibility="hidden";
			cp.wrap.style.height="20px";
			document.getElementById("hide1").setAttribute("onclick","$.showColor()");
			document.getElementById("hide1").innerHTML="[+]";
		},
		showColor:function()
		{
			var cc=document.getElementById("currentColor");
			var cn=document.getElementById("colorName");
			cc.style.visibility="visible";
			cn.style.visibility="visible";
			cp.canvas.style.visibility="visible";
			cp.tone.style.visibility="visible";
			cp.wrap.style.height=cp.oldWrapHeight+"px";
			document.getElementById("hide1").setAttribute("onclick","$.hideColor()");
			document.getElementById("hide1").innerHTML="[-]";
		},
		hideLayers:function()
		{
			$.oldLayersHeight=$.layerDiv.offsetHeight-10;
			$.layerDiv.style.height="20px";
			document.getElementById("buttons").style.visibility="hidden";
			document.getElementById("layers").style.visibility="hidden";
			document.getElementById("hide2").setAttribute("onclick","$.showLayers()");
			document.getElementById("hide2").innerHTML="[+]";
		},
		showLayers:function()
		{
			$.layerDiv.style.height=$.oldLayersHeight+"px";
			document.getElementById("buttons").style.visibility="visible";
			document.getElementById("layers").style.visibility="visible";
			document.getElementById("hide2").setAttribute("onclick","$.hideLayers()");
			document.getElementById("hide2").innerHTML="[-]";
		},
		setToolType:function(type)
		{
			if(type>6)type=0;
			$.toolType=type;
			
			if($.toolType==0)
			{
				document.getElementById("pencil").className="toolButtonSel";
				document.getElementById("eraser").className="toolButton";
				document.getElementById("fill").className="toolButton";
				document.getElementById("clearfill").className="toolButton";
				document.getElementById("rectangle").className="toolButton";
				document.getElementById("line").className="toolButton";
				document.getElementById("colorp").className="toolButton";
			}
			else if($.toolType==1)
			{
				document.getElementById("pencil").className="toolButton";
				document.getElementById("eraser").className="toolButtonSel";
				document.getElementById("fill").className="toolButton";
				document.getElementById("clearfill").className="toolButton";
				document.getElementById("rectangle").className="toolButton";
				document.getElementById("line").className="toolButton";
				document.getElementById("colorp").className="toolButton";
			}
			else if($.toolType==2)
			{
				document.getElementById("pencil").className="toolButton";
				document.getElementById("eraser").className="toolButton";
				document.getElementById("fill").className="toolButtonSel";
				document.getElementById("clearfill").className="toolButton";
				document.getElementById("rectangle").className="toolButton";
				document.getElementById("line").className="toolButton";
				document.getElementById("colorp").className="toolButton";
			}
			else if($.toolType==3)
			{
				document.getElementById("pencil").className="toolButton";
				document.getElementById("eraser").className="toolButton";
				document.getElementById("fill").className="toolButton";
				document.getElementById("clearfill").className="toolButtonSel";
				document.getElementById("rectangle").className="toolButton";
				document.getElementById("line").className="toolButton";
				document.getElementById("colorp").className="toolButton";
			}
			else if($.toolType==4)
			{
				document.getElementById("pencil").className="toolButton";
				document.getElementById("eraser").className="toolButton";
				document.getElementById("fill").className="toolButton";
				document.getElementById("clearfill").className="toolButton";
				document.getElementById("rectangle").className="toolButtonSel";
				document.getElementById("line").className="toolButton";
				document.getElementById("colorp").className="toolButton";
			}
			else if($.toolType==5)
			{
				document.getElementById("pencil").className="toolButton";
				document.getElementById("eraser").className="toolButton";
				document.getElementById("fill").className="toolButton";
				document.getElementById("clearfill").className="toolButton";
				document.getElementById("rectangle").className="toolButton";
				document.getElementById("line").className="toolButtonSel";
				document.getElementById("colorp").className="toolButton";
				
			}
			else if($.toolType==6)
			{
				document.getElementById("pencil").className="toolButton";
				document.getElementById("eraser").className="toolButton";
				document.getElementById("fill").className="toolButton";
				document.getElementById("clearfill").className="toolButton";
				document.getElementById("rectangle").className="toolButton";
				document.getElementById("line").className="toolButton";
				document.getElementById("colorp").className="toolButtonSel";
			}

			
		},
		oldToolsHeight:0,
		hideTools:function()
		{
			$.oldToolsHeight=$.tools.offsetHeight-10;
			$.tools.style.height="20px";
			document.getElementById("toolsBtnWrap").style.visibility="hidden";
			document.getElementById("hide3").setAttribute("onclick","$.showTools()");
			document.getElementById("hide3").innerHTML="[+]";
		},
		showTools:function()
		{
			$.tools.style.height=$.oldToolsHeight+"px";
			document.getElementById("toolsBtnWrap").style.visibility="visible";
			document.getElementById("hide3").setAttribute("onclick","$.hideTools()");
			document.getElementById("hide3").innerHTML="[-]";
		},
		saveCurrentHistory:function()
		{
			var img=new Image();
			var du=$.getCurrentLayer().bitmap.bitmap.toDataURL();
			img.src =du;

			$.getCurrentLayer().addHistory(img);
		},
		init:function()
		{
			var bg = document.createElement("canvas");
			var bgctx = bg.getContext("2d");
			bg.width = 10;
			bg.height = 10;
			bgctx.fillStyle="#E6E6E6";
			bgctx.fillRect(0,0,bg.width,bg.height);
			bgctx.fillStyle="#ffffff";
			bgctx.fillRect(0,0,5,5);
			bgctx.fillRect(5,5,5,5);
			
			//---------------
			$.brush = new Bitmap(0,0,1,1);
			$.brush.drawRect(0,0,1,1);
			$.tools = document.getElementById("toolsWrap");
			$.layerTopDiv = document.getElementById("layerTop");
			$.layerDiv = document.getElementById("layerWrap");
			$.layersDiv = document.getElementById("layers");
			$.previewTop = document.getElementById("imgTop");
			$.previewWrap = document.getElementById("imgWrap");
			$.canvas=document.getElementById("canvas");
			$.context=$.canvas.getContext("2d");
			$.context.webkitImageSmoothingEnabled = $.context.mozImageSmoothingEnabled = false;
			checkForSize($.canvas);
			
			$.bgPattern = $.context.createPattern(bg,"repeat");
			$.context.fillStyle=$.bgPattern;
			$.layers=[];
			
			$.width=$.canvas.width;
			$.height=$.canvas.height;
			$.drawCanvas();
			$.addLayer();
			
			$.saveCurrentHistory();
			
			$.setScale(2,2);
			$.preview = document.getElementById("prev");
			$.prevctx=$.preview.getContext("2d");
			$.previewWrap.style.width=($.width)+"px";
			$.previewWrap.style.height=($.height)+"px";
			$.preview.width=$.canvas.width/2;
			$.preview.height=$.canvas.height/2;
			$.hidePreviewPop();
			$.setCurrentLayer(0);
			$.saveImage();
			$.setEvents();
		},
		loadCount:0,
		loadArray:["top.png","draw.png","line.png","clearfill.png","colorpick.png","eraser.png","rect.png","inv.png","fill.png"],
		preload:function()
		{
			for(var i=0;i<$.loadArray.length;i++)
			{
				var img=new Image();
				img.src = "data/"+$.loadArray[i];
				img.onload=function(e)
				{
					$.loadCount++;
					if($.loadCount>=$.loadArray.length)
					{
						$.init();
						cp.init();
						tools.init();
						document.getElementById("output").innerHTML="";
						document.getElementById("content").style.visibility="visible";
						$.loadingDone=true;
					}
				};
			}
		},
		openAbout:function()
		{
			var opciones= "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=yes, width=600, height=425, top=85, left=140";
			window.open("about.html","",opciones);
		},
		newFile:function()
		{
			if(!confirm("Are you sure you want to create a new file?")) return;
			var w=prompt("Width of the new canvas:");
			var h=prompt("Height of the new canvas:");
			var w2=parseInt(w);
			var h2=parseInt(h);
			if(isNaN(w2) || isNaN(h2))
			{
				alert("The size of the canvas needs to be on numbers.");
				return;
			}
			window.location.href="?width="+w2+"&height="+h2;
		}
	};
})(window);

$.preload();

