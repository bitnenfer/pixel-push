/**
 * @author Felipe Alfonso
 * Script for the tools 
 */

(function(window){
	window.tools={
		top:null,
		div:null,
		drag:false,
		offset:{x:0,y:0},
		setEvents:function()
		{
			tools.top.onmousedown=function(e)
			{
				if(e.which==0 || e.button==0){
					tools.drag = true;
					tools.offset.x = e.clientX-tools.div.offsetLeft;
					tools.offset.y = e.clientY-tools.div.offsetTop;
					var x=e.clientX-tools.offset.x;
					var y=e.clientY-tools.offset.y;
					tools.div.style.left=x+"px";
					tools.div.style.top=y+"px";
					tools.div.style.zIndex=999;
					$.previewWrap.style.zIndex=1;
					$.layerDiv.style.zIndex=1;
					cp.wrap.style.zIndex=1;
				}
			};
			
			tools.top.onmousemove=function(e)
			{
				if(tools.drag)
				{
					if(e.which==0 || e.button==0){
						var x=e.clientX-tools.offset.x;
						var y=e.clientY-tools.offset.y;
						tools.div.style.left=x+"px";
						tools.div.style.top=y+"px";
					}
				}
			};
			
			tools.top.onmouseup=function(e)
			{
				tools.drag = false;
			};
		},
		init:function()
		{
			tools.top = document.getElementById("toolsTop");
			tools.div = document.getElementById("toolsWrap");
			tools.setEvents();
			$.setToolType(0);
		}
	};
})(window);

