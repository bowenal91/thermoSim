function WallHandler(pts, handlers, handles){
	this.hitMode = 'Std';
	this.pts = pts;
	this.handles = handles;
	this.gridDim=20;
	if(this.handles.length!=this.pts.length){
		console.log('NAME YOUR WALLS');
	}
	
	this.wallUVs = [];
	this.wallPerpUVs = [];
	this.wallGrids = [];
	this.handlers = {};
	if(handlers){
		this.doInitHandlers(handlers);
	}
	this.xSpan = Math.floor(myCanvas.width/this.gridDim);
	this.ySpan = Math.floor(myCanvas.height/this.gridDim);
	this.numCols = Math.ceil(myCanvas.width/this.gridDim);
	this.numRows = Math.ceil(myCanvas.height/this.gridDim);
	this.setup();
};
WallHandler.prototype = {
	setup: function(){
		this.closeWalls();
		this.ptsInit = [];
		this.setPtsInit();
		for (var wallIdx=0; wallIdx<this.pts.length; wallIdx++){
			this.setupWall(wallIdx);
		}
		
	},
	setHitMode: function(inputMode){
		this.hitMode = inputMode;
	},
	doInitHandlers: function(handlers){
		
		if (handlers instanceof Array){//NOTE - HANDLERS HAD BETTER BE THE SAME LENGTH AT walls.pts.  I AM ASSUMING IT IS.
			for (var handlerIdx=0; handlerIdx<handlers.length; handlerIdx++){
				if(handlers[handlerIdx] instanceof Array){
					var handlerArray = handlers[handlerIdx];
					for (var subHandlerIdx=0; subHandlerIdx<handlerArray.length; subHandlerIdx++){
						var subHandler = handlerArray[subHandlerIdx]
						this.setSubWallHandler(handlerIdx, subHandlerIdx, subHandler);
					}
				}else if(typeof handlers[handlerIdx] == 'object'){
					var handler = handlers[handlerIdx];
					this.setWallHandler(handlerIdx, handler)
				}
			}
		} else if(typeof handlers == 'object'){
			this.setAllHandler(handlers);
		}else{
			console.log('YOU SEND POOR WALL HANDLERS.  THEY ARE NEITHER OBJECT NOR ARRAY');
		}
	},
	setAllHandler: function(handler){
		for(var wallIdx=0; wallIdx<this.pts.length; wallIdx++){
			this.setWallHandler(wallIdx, handler);
		}
	},
	setWallHandler: function(wallInfo, handler){
		var wallIdx = this.idxByInfo(wallInfo);//info can be handle or idx
		for (var subWallIdx=0; subWallIdx<this.pts[wallIdx].length; subWallIdx++){
			this.setSubWallHandler(wallIdx, subWallIdx, handler);
		}
	},
	
	setSubWallHandler: function(wallInfo, subWallIdx, handler){
		var wallIdx = this.idxByInfo(wallInfo)
		this.handlers[wallIdx+ '-' + subWallIdx] = handler;
	},
	setupWall: function(wallIdx){
		this.wallUVs[wallIdx] = this.getWallUV(wallIdx);
		this.wallPerpUVs[wallIdx] = this.getPerpUVs(wallIdx);
		this.wallGrids[wallIdx] = this.getSubwallGrid(wallIdx);
	},
	addWall: function(pts, handler, handle){
		//this.handlers.push(new Array(pts.length));
		this.handles.push(handle)
		this.closeWall(pts);
		this.pts.push(pts);
		this.ptsInit[this.pts.length-1] = this.copyWall(this.pts[this.pts.length-1]);
		this.setupWall(this.pts.length-1);
		this.setWallHandler(this.pts.length-1, handler);
	},
	setPtsInit: function(){
		for (var wallIdx=0; wallIdx<this.pts.length; wallIdx++){
			this.ptsInit[wallIdx] = this.copyWall(this.pts[wallIdx]);
		}
	},
	restoreWall: function(wallIdx){
		var init = this.ptsInit[wallIdx];
		this.pts[wallIdx] = this.copyWall(init);
		this.setupWall(wallIdx);
	},
	copyWall: function(wall){
		var len = wall.length;
		var copy = new Array(len);
		for (var ptIdx=0; ptIdx<len; ptIdx++){
			copy[ptIdx] = wall[ptIdx].copy();
		}
		return copy;
	},
	idxByHandle: function(handle){
		var handles = this.handles;
		for (var idx=0; idx<handles.length; idx++){
			if(handle==handles[idx]){
				return idx;
			}
		}
		console.log('Failed to get wall idx by handle\nHandle:'+handle);
		
	},
	idxByInfo: function(info){
		var wallIdx;
		if(parseFloat(info)!=info){
			var wallIdx = this.idxByHandle(info)
		}else{
			wallIdx = info;
		}
		return wallIdx;
	},
	removeWall: function(wallIdx){
		this.handles.splice(wallIdx, 1);
		this.pts.splice(wallIdx, 1);
		this.ptsInit.splice(wallIdx, 1);
		this.wallUVs.splice(wallIdx, 1);
		this.wallPerpUVs.splice(wallIdx, 1);
		this.wallGrids.splice(wallIdx, 1);
		this.handlers.splice(wallIdx, 1);
	},
	closeWalls: function(){
		for (var wallIdx=0; wallIdx<this.pts.length; wallIdx++){
			var wall = this.pts[wallIdx];
			this.closeWall(wall);
		}
	},
	closeWall: function(wall){
		wall.push(P(wall[0].x, wall[0].y))
	},
	getPerpUVs: function(wallIdx){
		var wallUVSet = this.wallUVs[wallIdx];
		var perpUVs = new Array(wallUVSet.length);
		for (var wallUVIdx=0; wallUVIdx<wallUVSet.length; wallUVIdx++){
			var wallUV = wallUVSet[wallUVIdx];
			perpUVs[wallUVIdx] = V(-wallUV.dy, wallUV.dx);
		}
		return perpUVs;
	},
	getWallUV: function(wallIdx){
		var wall = this.pts[wallIdx];
		var numUVs = wall.length-1
		var wallUVs = new Array(numUVs);
		for (var ptIdx=0; ptIdx<numUVs; ptIdx++){
			var ptA = wall[ptIdx];
			var ptB = wall[ptIdx+1];
			wallUVs[ptIdx] = V(ptB.x-ptA.x, ptB.y-ptA.y).UV();
		}
		return wallUVs;
	},
	getSubwallGrid: function(wallIdx){
		var subwallGrid = new Array(this.numCols);
		for (var x=0; x<this.numCols; x++){ //HEY - you changed this from .floor +1
			var column = new Array(this.numRows);
			for (var y=0; y<this.numRows; y++){
				column[y] = (this.getSubwallsInGrid(wallIdx, x, y));
			}
			subwallGrid[x] = (column);
		}
		return subwallGrid;
		
		
	},
	getSubwallsInGrid: function(wallIdx, x, y){
		var subwallsInGrid = [];
		var wall = this.pts[wallIdx];
		for (var ptIdx=0; ptIdx<wall.length-1; ptIdx++){
			if (this.isInBox(x, y, [wallIdx, ptIdx])){
				subwallsInGrid.push(ptIdx);
			}
		}
		return subwallsInGrid;
	},
	isInBox: function(x, y, pt){
		if (this.crossesLine(x, y, x+1, y, pt, "min") || this.crossesLine(x+1, y, x+1, y+1, pt, "max") || this.crossesLine(x+1, y+1, x, y+1, pt, "max") || this.crossesLine(x, y+1, x, y, pt, "min")){
			return true;
		};
		return false;
	},
	crossesLine: function(x1, y1, x2, y2, pt, type){
		x1*=this.gridDim;
		x2*=this.gridDim;
		y1*=this.gridDim;
		y2*=this.gridDim;
		pt1 = this.pts[pt[0]][pt[1]];
		pt2 = this.pts[pt[0]][pt[1]+1];
		var angleLine = this.getAngle(pt1.x, pt1.y, pt2.x, pt2.y);
		var anglePt1 = this.getAngle(pt1.x, pt1.y, x1, y1);
		var anglePt2 = this.getAngle(pt1.x, pt1.y, x2, y2);
		if (this.getBetweenAngle(angleLine, anglePt1, anglePt2)){
			if(x1==x2){
				return this.getBetweenPoint(x1, pt1.x, pt2.x, type);
			} else if (y1==y2){
				return this.getBetweenPoint(y1, pt1.y, pt2.y, type);
			}
		}
		return false;
	},
	getAngle: function(x1, y1, x2, y2){
		var angle = Math.atan2((y2-y1),(x2-x1))
		if(angle<0){
			angle+=2*Math.PI;
		}
		return angle;
	},
	getBetweenAngle: function(line, pt1, pt2){
		var big = Math.max(pt1, pt2);
		var small = Math.min(pt1, pt2);
		if (big >= line && line >= small){
			return true;
		} else if (big-small > Math.PI){
			if (line >= big || line <= small){
				return true;
			}
		}
		return false;
	},
	getBetweenPoint: function(gridPt, wallPt1, wallPt2, type){
		if (Math.min(wallPt1, wallPt2) <= gridPt && gridPt <= Math.max(wallPt1, wallPt2)){
			return true;
		} else if (type=="min"){
			if (gridPt + this.gridDim >= wallPt1 && wallPt1 >= gridPt && gridPt + this.gridDim >= wallPt1 && wallPt1 >= gridPt){
				return true;
			}
		} else if (type=="max"){
			if(gridPt - this.gridDim >= wallPt1 && wallPt1 >= gridPt && gridPt - this.gridDim >= wallPt1 && wallPt1 >= gridPt){
				return true;
			}
		}
		return false;
	},

	check: function(){
		var gridDim = this.gridDim;
		var xSpan = this.xSpan;
		var ySpan = this.ySpan;
		var wallGrids = this.wallGrids;
		for (var spcName in spcs){
			var spc = spcs[spcName];
			for (var dotIdx=0; dotIdx<spc.dots.length; dotIdx++){
				var dot = spc.dots[dotIdx];
				var checkedWalls = [];
				var gridX = Math.floor(dot.x/gridDim);
				var gridY = Math.floor(dot.y/gridDim);
				if(gridX>xSpan || gridX<0 || gridY>ySpan || gridY<0){
					returnEscapist(dot);
					console.log("ball out of bounds");				
				}
				else{
					for (var x=Math.max(gridX-1, 0); x<=Math.min(gridX+1, xSpan); x++){
						for (var y=Math.max(gridY-1, 0); y<=Math.min(gridY+1, ySpan); y++){
							
							for (var subwallIdx=0; subwallIdx<walls.wallGrids.length; subwallIdx++){
								for (var lineIdx=0; lineIdx<wallGrids[subwallIdx][x][y].length; lineIdx++){
									var line = wallGrids[subwallIdx][x][y][lineIdx];
									if (!this.haveChecked([subwallIdx, line], checkedWalls)){
										this.checkWallHit(dot, [subwallIdx, line]);
										checkedWalls.push([subwallIdx, line]);
									}
								}
							}
		
								
						}
					}
				}
			}
		}
	},
	checkWallHit: function(dot, line){
		var wallIdx = line[0];
		var subWallIdx = line[1];
		var wallPt = this.pts[wallIdx][subWallIdx];
		var wallUV = this.wallUVs[wallIdx][subWallIdx];
		var perpUV = this.wallPerpUVs[wallIdx][subWallIdx]
		var dotVec = V(dot.x + dot.v.dx - perpUV.dx*dot.r - wallPt.x, dot.y + dot.v.dy - perpUV.dy*dot.r - wallPt.y);
		var distFromWall = perpUV.dotProd(dotVec);
		var perpV = -perpUV.dotProd(dot.v);
		if (distFromWall<0 && distFromWall>-30 && this.isBetween(dot, wallIdx, subWallIdx, wallUV)){
			this['didHit'+this.hitMode](dot, wallIdx, subWallIdx, wallUV, perpV, perpUV);
		}
	},
	isBetween: function(dot, wallIdx, subWallIdx, wallUV){
		var wallAdjust = dot.v.dotProd(wallUV);
		var xAdj = wallAdjust*wallUV.dx;
		var yAdj = wallAdjust*wallUV.dy;
		var wallPtA = P(walls.pts[wallIdx][subWallIdx].x+xAdj, walls.pts[wallIdx][subWallIdx].y+yAdj);
		var wallPtB = P(walls.pts[wallIdx][subWallIdx+1].x+xAdj, walls.pts[wallIdx][subWallIdx+1].y+yAdj);
		var reverseWallUV = V(-wallUV.dx, -wallUV.dy);
		var dotVecA = V(dot.x-wallPtA.x, dot.y-wallPtA.y);
		var dotVecB = V(dot.x-wallPtB.x, dot.y-wallPtB.y);
		return (dotVecA.dotProd(wallUV)>=0 && dotVecB.dotProd(reverseWallUV)>=0)
	},
	didHitStd: function(dot, wallIdx, subWallIdx, wallUV, perpV, perpUV){
		var handler = this.handlers[wallIdx + '-' + subWallIdx];
		handler.func.apply(handler.obj,[dot, wallIdx, subWallIdx, wallUV, perpV, perpUV]);		
	},
	didHitArrow: function(dot, wallIdx, subWallIdx, wallUV, perpV, perpUV){
		var vo = dot.v.copy();
		var handler = this.handlers[wallIdx + '-' + subWallIdx];
		handler.func.apply(handler.obj,[dot, wallIdx, subWallIdx, wallUV, perpV, perpUV]);
		var pos = P(dot.x, dot.y);
		var vf = dot.v.copy();
		var perpVf = -perpUV.dotProd(dot.v);
		this.drawArrow(pos, vo, vf, perpV, perpVf);  // HEY - modify this so you can get deltaV for difference escape velocity (moving wall)
	},
	haveChecked: function(wall, list){
		for (var listIdx=0; listIdx<list.length; listIdx++){
			if(list[listIdx][0]==wall[0] && list[listIdx][1]==wall[1]){
				return true;
			}
		}
		return false;
	},
	area: function(wallIdx){
		var wall = walls.pts[wallIdx];
		var area = 0;
		var originPt = wall[0];
		for (var ptIdx=2; ptIdx<wall.length-1; ptIdx++){
			pt1 = wall[ptIdx-1];
			pt2 = wall[ptIdx];
			area += originPt.area(pt1, pt2);
		}
		return area;
	},
	surfArea: function(){
		var SA=0;
		for (var wallIdx=0; wallIdx<walls.pts.length; wallIdx++){
			var wall = walls.pts[wallIdx];
			for (ptIdx=0; ptIdx<wall.length-1; ptIdx++){
				var pt = wall[ptIdx];
				var ptNext = wall[ptIdx+1];
				SA+=pt.distTo(ptNext);
			}
		}
		return SA;
	},
	border: function(wallInfo, wallPts, thickness, col, ptAdjusts){
		var drawCanvas = c;
		var wallIdx = this.idxByInfo(wallInfo);
		var pts = new Array(wallPts.length);
		var perpUVs = new Array(wallPts.length-1)
		var borderPts = [];
		var targetWallPts = this.pts[wallIdx];
		var targetWallPerps = this.wallPerpUVs[wallIdx];
		for (var wallPtIdx=0; wallPtIdx<wallPts.length; wallPtIdx++){
			pts[wallPtIdx] = targetWallPts[wallPts[wallPtIdx]].copy();
		}
		for (var wallPtIdx=0; wallPtIdx<wallPts.length-1; wallPtIdx++){
			perpUVs[wallPtIdx] = targetWallPerps[wallPts[wallPtIdx]].copy().neg();
		}
		for (var ptIdx=0; ptIdx<pts.length; ptIdx++){
			var pt = pts[ptIdx];
			//can give either vector or absolute position
			pt.movePt(ptAdjusts[ptIdx]);
			pt.position(ptAdjusts[ptIdx]);
			borderPts.push(pt);
		}
		var lastAdj = perpUVs[perpUVs.length-1].copy().mult(thickness)
		borderPts.push(pts[pts.length-1].copy().movePt(lastAdj));
		for (var ptIdx=pts.length-2; ptIdx>0; ptIdx-=1){
			var UVs = [perpUVs[ptIdx], perpUVs[ptIdx-1]];
			var pt = pts[ptIdx];
			borderPts.push(this.spacedPt(pt, UVs, thickness));
		}
		var firstAdj = perpUVs[0].mult(thickness)
		borderPts.push(pts[0].copy().movePt(firstAdj));
		borderPts.push(pts[0]);
		addListener(curLevel, 'update', 'drawBorder' + wallIdx, 
			function(){
				draw.fillPts(borderPts, col, drawCanvas);
			}
		,'');
	},
	spacedPt: function(pt, UVs, thickness){
		var UV1 = UVs[0];
		var UV2 = UVs[1];
		var adjust = UV1.add(UV2)
		return pt.copy().movePt(adjust.mult(thickness));
	},
	removeBorder: function(wallInfo){
		var wallIdx = this.idxByInfo(wallInfo);
		removeListener(curLevel, 'update', 'drawBorder' + wallIdx);
	},
	////////////////////////////////////////////////////////////
	//EXTRAS
	////////////////////////////////////////////////////////////
	drawArrow: function(pos, vo, vf, perpVo, perpVf){
		var arrowPts = new Array(3);
		arrowPts[0] = pos.copy().movePt(vo.copy().mult(10).neg());
		arrowPts[1] = pos.copy();
		arrowPts[2] = pos.copy().movePt(vf.copy().mult(10));
		var lifeSpan = 50;
		var arrowTurn = 0;
		var handle = 'drawArrow'+round(pos.x,0)+round(pos.y,0);
		var arrow = new Arrow(handle, arrowPts, Col(255,0,0),c).show(lifeSpan);


		var textPos = pos.copy().movePt(vf.mult(15));
		var delV = (Math.abs(perpVo)+Math.abs(perpVf))*pxToMS;
		animText.newAnim({pos:textPos}, 
				{pos:textPos.copy().movePt({dy:-20}), col:curLevel.bgCol},
				{text:'deltaV = '+round(delV,1)+'m/s', time:3000}
		);
	},	
}