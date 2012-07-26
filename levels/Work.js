function Work(){
	dataHandler = new DataHandler();
	this.data = {};
	this.data.t = [];
	this.data.pInt = [];
	this.data.v = [];
	this.data.p = [];
	this.eUnits = 'kJ';
	this.bgCol = Col(5, 17, 26);
	this.wallCol = Col(255,255,255);
	this.numUpdates = 0;
	this.forceInternal = 0;
	this.wallV = 0;
	this.wallSpeed = 1;
	this.makeListeners();
	this.readout = new Readout('mainReadout', 30, myCanvas.width-180, 25, '13pt calibri', Col(255,255,255),this, 'left');
	this.compMode = 'Isothermal';
	this.graphs = {}
	this.promptIdx = -1;
	this.blockIdx=-1;
	this.g = 1.75;

	this.prompts=[
		{block:0, title: '', finished: false, text:''},
		{block:1, title: 'Current step', finished: false, text:"Alright, let�s fit a model to what we just described.  Above we have a piston and cylinder setup.  You can change the piston�s pressure with the pressure slider.  If you compress the system, how does the temperature behave?  Does this make sense in the context of doing work on the system?"},
		{block:1, title: 'Current step', finished: false, text:"Now these molecules undergo perfectly elastic collisions when they hit a wall.  That is to say they behave like a bouncy ball would when you throw it against a wall.  If the wall is stationary, the ball bounces back with the same speed.  If the wall is moving, that is not true."},
		{block:2, title: 'Current step', finished: false, text:"Let�s see if we can relate that idea to work by looking at just one molecule. If you compress the cylinder, why does the molecule�s speed change?  How does this relate to temperature?"},
		{block:3, title: '', finished: false, text:''},
		{block:4, title: 'Current step', finished: false, text:'So here we have a big weight we can use to bring our system to a pressure of n atm.  There are some stops on the piston that give us a max volume change of M L.  We have 1.4 moles of gas with a heat capacity of 8.31 J/mol*K.  What temperature change should we expect?  Try the experiment!  Did the two results match?'},
	]
	walls = new WallHandler([[P(40,30), P(510,30), P(510,440), P(40,440)]], {func:this.staticAdiabatic, obj:this}, ['container']);
	addSpecies(['spc1', 'spc3', 'spc4', 'spc5']);
	this.yMin = 30;
	this.yMax = 350;
	addListener(this, 'update', 'run', this.updateRun, this);
	addListener(this, 'data', 'run', this.dataRun, this);
	collide.setDefaultHandler({func:collide.impactStd, obj:collide})
}
_.extend(Work.prototype, 
			LevelTools.prototype, 
			WallCollideMethods.prototype, 
{
	init: function(){
		for (var initListenerName in this.initListeners.listeners){
			var func = this.initListeners.listeners[initListenerName].func;
			var obj = this.initListeners.listeners[initListenerName].obj;
			func.apply(obj);
		}		
		nextPrompt();
	},

	block0Start: function(){
		this.cutSceneStart("<p>Good afternoon!</p>"+
		"Today we're going to try to figure out why work does work.  Let's start with the equations that relate work to a temperature change:"+
		"<p><center><img src='img/work/eq1.gif' alt='hoverhoverhover'></img></center></p>"+
		"<p>This equation says that work is equal to how hard you push on a container times how much you compress it.  It also says that as you compress that container, the gas inside heats up.  But why does that happen?  What is it about pushing on a container makes its molecules speed up?</p>"+
		"<p> One might say that it�s because energy is being added, and that is true, but we�re going to try to pin down the physical event that makes a molecule speed up as a result of the container compressing.",
		'intro'
		);
		
	},
	block0CleanUp: function(){
		this.cutSceneEnd()
	},
	
	block1Start: function(){
		var self = this;
		walls = new WallHandler([[P(40,30), P(510,30), P(510,440), P(40,440)]], {func:this.staticAdiabatic, obj:this}, ['container']);
		walls.setSubWallHandler('container', 0, {func:this.cPAdiabaticDamped, obj:this});		
		populate('spc1', P(45,35), V(460, 350), 800, 300);
		populate('spc3', P(45,35), V(450, 350), 600, 300);
		
		$('#canvasDiv').show();
		$('#clearGraphs').hide();
		$('#dashRun').show();
		$('#sliderPressureHolder').show();
		$('#base').show();
		
		this.graphs.pVSv = new GraphScatter('pVSv', 400,275, "Volume (L)", "Pressure (atm)",
							{x:{min:0, step:4}, y:{min:0, step:3}});
		this.graphs.tVSv = new GraphScatter('tVSv', 400, 275,"Volume (L)", "Temperature (K)",
							{x:{min:0, step:4}, y:{min:250, step:50}});
		this.graphs.pVSv.addSet('p', 'P Int.', Col(50,50,255), Col(200,200,255),
								{data:this.data, x:'v', y:'p'});

		this.graphs.tVSv.addSet('t', 'Sys\nTemp', Col(255,0,0), Col(255,200,200),
								{data:this.data, x:'v', y:'t'});		
		
		
		this.piston = new Piston('tootoo', 500, function(){return walls.pts[0][0].y}, 40, 470, c, 2, function(){return self.g}, this);
		this.piston.show();
		this.piston.trackWork();
		this.piston.trackPressure();
		this.borderStd();
		//this.heater = new Heater('spaceHeater', P(150,360), V(250,50), 0, 20, c);//P(40,425), V(470,10)
		//this.heater.init();

	},

	block1CleanUp: function(){
		$('#sliderPressureHolder').hide();
		this.removeAllGraphs();
		this.readout.removeAllEntries();
		this.readout.hide();
		this.piston.remove();
		this.piston = undefined;
		removeListener(curLevel, 'update', 'moveWalls');
		removeListener(curLevel, 'update', 'addGravity');
		walls.setWallHandler(0, {func:this.staticAdiabatic, obj:this})
		walls.removeBorder('container');
	},
	block2Start: function(){
		walls = new WallHandler([[P(40,30), P(510,30), P(510,440), P(40,440)]], {func:this.staticAdiabatic, obj:this}, ['container']);
		walls.setHitMode('Arrow');
		this.borderStd();
		this.compArrow = this.makeCompArrow({mode:'adiabatic'});
		populate('spc4', P(45,35), V(460, 350), 1, 600);
	},
	block2CleanUp: function(){
		walls.removeBorder('container');
		this.compArrow.remove();
		this.compArrow = undefined;
		walls.setHitMode('Std');
		removeListenerByName(curLevel, 'update', 'drawArrow');
		removeListenerByName(curLevel, 'update', 'animText');
	},
	block3Start: function(){
		this.cutSceneStart("<p>So it would seem the molecule speeds up as a result of its collisions with a moving wall!  Could simple elastic collisions with moving walls really explain why compressing or expanding (against non-zero pressure) changes system temperature? I think that�s it, but to make sure, we need to do an experiment. </p><p> First we should note that the only way energy is added to the system in these simulations is through <a href=� http://en.wikipedia.org/wiki/Elastic_collision � target=�_blank�>elastic collisions</a> with the wall.  There�s no magically speeding up the molecules so the their changes in temperatures match the amount of work put in.  Our experiment will simply use the behavior of the molecule in the previous step, but with many molecules.  If work is expressed in some way other than through elastic collisions with the wall, this simulation will produce an incorrect result. </p><p>That being said, I propose the following experiment:<br>From the equation <p><center><img src='img/work/eq2.gif' alt='Don�t click me, it hurts!'></img></center></p><p>If we compress with a fixed pressure over some volume, we can calculate the expected temperature change and compare it to experiment.  If they match, we�ve verified that when you do work on a system, the system�s temperature increases because of elastic collisions with a moving wall (remember the bouncy ball model).</p>");
	},
	block3CleanUp: function(){
		this.cutSceneEnd();
	},
	block4Start: function(){
		$('#reset').show()
		
		this.readout.show();
		wallHandle = 'container';
		walls = new WallHandler([[P(40,30), P(510,30), P(510,350), P(40,350)]], {func:this.staticAdiabatic, obj:this}, [wallHandle]);
		walls.setSubWallHandler(0, 0, {func:this.cPAdiabaticDamped, obj:this});
		this.stops = new Stops(10, 'container').init();
		this.borderStd();
		populate('spc1', P(45,35), V(445, 325), 650, 250);
		
		populate('spc3', P(45,35), V(445, 325), 450, 250);
		this.dragWeights = this.makeDragWeights(wallHandle)
		this.trackVolumeStart(0);
	},
	block4CleanUp: function(){
		$('#reset').hide();
		this.trackVolumeStop();
		walls.removeBorder(0);
		this.yMax = this.yMaxSave;
		this.yMaxSave = undefined;
	},
	borderStd: function(){
		walls.border('container', [1,2,3,4], 5, this.wallCol.copy().adjust(-100,-100,-100), [{y:this.yMin}, {}, {}, {y:this.yMin}]);
	},
	makeDragWeights: function(wallHandle){
		var self = this;
		var massInit = 25;
		var dragWeights = new DragWeights([{name:'lrg', count:1, mass:75}
									],
									walls.pts[0][2].y,
									function(){return walls.pts[0][0].y},
									myCanvas.height-15,
									20,
									Col(218, 187, 41),
									Col(150, 150, 150),
									function(){return self.g},
									massInit,
									this.readout,
									wallHandle,
									this
									);
		dragWeights.trackEnergyStop();
		dragWeights.trackPressureStart();
		dragWeights.init();
		return dragWeights;		
	},

	dataRun: function(){
		var wall = walls.pts[0];
		var SA = getLen([wall[0], wall[1], wall[2], wall[3], wall[4]]);//HEY - FOR TESTING PURPOSES ONLY.  DOES NOT WORK WITH MOVING WALL AS WE DO NOT ADD FORCE INTERNAL THERE  //What?
		this.data.p.push(dataHandler.pressureInt(this.forceInternal, this.numUpdates, SA))
		this.data.t.push(dataHandler.temp());
		this.data.v.push(dataHandler.volOneWall());
		
		for(var graphName in this.graphs){
			this.graphs[graphName].addLast();
		}
		this.numUpdates=0;
		this.forceInternal=0;
	},
	vol: function(){
		return walls.area(0) - walls.area(1);
	},

	changePressure: function(event, ui){
		this.piston.setP(ui.value);
	},
	changeTemp: function(event, ui){
		this.heater.setTemp(ui.value);
	},
	reset: function(){
		var curPrompt = this.prompts[this.promptIdx];
		if(this['block'+this.blockIdx+'CleanUp']){
			this['block'+this.blockIdx+'CleanUp']()
		}
		if(curPrompt.cleanUp){
			curPrompt.cleanUp();
		}	
		for (var spcName in spcs){
			depopulate(spcName);
		}
		this.numUpdates = 0;

		this.forceInternal = 0;
		this.wallV = 0;

		for (resetListenerName in this.resetListeners.listeners){
			var func = this.resetListeners.listeners[resetListenerName].func;
			var obj = this.resetListeners.listeners[resetListenerName].obj;
			func.apply(obj);
		}

		if(this['block'+this.blockIdx+'Start']){
			this['block'+this.blockIdx+'Start']()
		}
		
		if(curPrompt.start){
			curPrompt.start();
		}	
		
	},


}
)