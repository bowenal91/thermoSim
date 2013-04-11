LevelData = {
	levelTitle: 'Work',
	
	spcDefs: [
		{spcName: 'spc1', m: 4, r: 4, col: Col(200, 0, 0), cv: 2.5 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.07, b:1730.6, c: 233.4-273.15}, cpLiq: 2.5* R, spcVolLiq: .3},
		{spcName: 'spc2', m: 3, r: 2, col: Col(200, 0, 0), cv: 2.5 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.07, b:1530.6, c: 239.4-273.15}, cpLiq: 2.5* R, spcVolLiq: .3},
		{spcName: 'spc3', m: 3, r: 1, col: Col(150, 100, 100), cv: 2.5 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.07, b:1530.6, c: 239.4-273.15}, cpLiq: 2.5* R, spcVolLiq: .3}
	],
	mainSequence: [
		{//First Questions
			sceneData: {
							objs: [
								{type:'AuxImage',
									attrs: {handle: 'piston1', imgFunc: 'img("img/work/block0Pic2.jpg")', slotNum: 1}
								},
								{type:'AuxImage',
									attrs: {handle: 'piston2', imgFunc: 'img("img/work/block0Pic1.jpg")', slotNum: 2}
								}
							],
						},
				prompts:[ 
					{//Prompt 1
						sceneData: undefined,
						cutScene:true,
						text: "Today we're going to investigate how work transfers energy to a system.  First we're going to develop the equations that describe a process on an adiabatic system. </p><p>If we compress the adiabatic system pictured to the right at a constant external pressure from state 1 to state 2, which of the following equations best represents the work done?</p>",
						quiz: [
							{type: 'multChoice',
								options:[
									{text:"## W = -\\int_{V_{1}}^{V_{2}}P_{sys}dV ##", isCorrect: false, message:"That's not correct"},
									{text:"## W = - V\\Delta P_{ext} ##", isCorrect: false, message:"That's not correct"},
									{text:"## W = -P_{ext}\\Delta V ##", isCorrect: true},
									{text:"## W = -T\\Delta V ##", isCorrect: false, message:"That's not correct"}
								]
							},
						]
					},
					{//Prompt 2
						sceneData:undefined,
						cutScene:true,
						text: "$$ W = -P_{ext}\\Delta V $$ <p> Indeed. This equation tells us that work done on a system is equal to how hard you compress a container per area times how much you compress it. <p> Now from the first law, we know $$ \\Delta U = Q + W $$ <p> For our adiabatic system, which of the following relations is correct, if we asume constant heat capacity?",
						quiz: [
							{type: 'multChoice',
								options:[
									{text:"## nc_v\\Delta T = Q ##", isCorrect: false, message:"But it's adiabatic!"},
									{text:"##nc_v\\Delta T = -P_{ext}\\Delta V ##", isCorrect: true},
									{text:"##nc_p\\Delta T = -P_{ext}\\Delta V ##", isCorrect: false, message:"Why Cp?"},
									{text:"None of these are correct", isCorrect: false, message:"Yes it can.  What is Q equal to for an adiabatic system?"}
								]
							}
						]
					}			
				]	
		},
		{//First Scene
			sceneData: {
				walls: [
					{pts: [P(40,30), P(510,30), P(510,440), P(40,440)], handler: 'staticAdiabatic', handle: 'FirstWall', border: {type: 'open'}, hitMode: 'ArrowSpd'},
				],
				dots: [
					{spcName: 'spc1', pos: P(55, 210), dims: V(150,150), count: 1, temp: 400, returnTo: 'FirstWall', tag: 'FirstWall'},
				],
				objs: [
					{type: 'CompArrow',
						attrs: {handle: 'compArrow', wallInfo: 'FirstWall', speed: 2, bounds: {y: {max:380, min: 30}}, stops: true}
					}
				]
			},
			prompts:[
				{
					sceneData: {
						listeners: [
							{handle: 'firstCheck', expr: 'fracDiff(temp("FirstWall"), 400) > .05', alertUnsatisfied: "Try to hit the molecule with the slider and see what happens!", priorityUnsatisfied: 1}
						]
					},
					text: "<center>##nc_v\\Delta T = -P_{ext}\\Delta V ## </center> <p>From the equation above we see that temperature increases as we do work by decreasing volume.  Temperature is an expression is molecular kinetic energy, so as the system is compressed, the molecules must speed up.  These ideal gas molecules can be thought of as perfectly elastic bouncy balls.  Using the movable wall above, can you determine what event causes the molecule's speed to change?  Can you explain why that would cause a temperature change in many molecules?<p>",
					quiz: [
						{type: 'text', storeAs: 'FirstSceneAnswer', Text: 'Type your answer here.'}
					],
					
				},
				{
				sceneData: undefined,
				text: "<p>So the molecules speed up when they collide with the moving wall.  Those collisions add kinetic energy, which means that the temperature increases.</p><p>Now let's do an experiment where we compress our adiabatic system.",
				}
			]
		},
		{//Second Scene
			sceneData: {
				walls: [
					{pts: [P(40,60), P(510,60), P(510,380), P(40,380)], handler: 'staticAdiabatic', handle: 'SecondWall', border: {type: 'open'}}
				],
				dots: [
					{spcName: 'spc2', pos: P(55, 75), dims: V(450,300), count: 800, temp: 200, returnTo: 'SecondWall', tag: 'SecondWall'},
					{spcName: 'spc3', pos: P(55, 75), dims: V(450,300), count: 800, temp: 200, returnTo: 'SecondWall', tag: 'SecondWall'}
				],
				objs: [
					{type: 'Piston',
						attrs: {handle: 'PistonOne', wallInfo: 'SecondWall', min: 2, init: 0, max: 20, makeSlider: false}
					},
					{type: 'DragWeights',
						attrs: {handle: 'DragsOne', wallInfo: 'SecondWall', weightDefs: [{count:1, pressure:13}], weightScalar: 10, pInit: 2, pistonOffset: V(130,-41), displayText: false}
					}			
				],
				dataReadouts: [
					{handle: 'pistonpext1', expr: 'pExt("SecondWall")', readout: 'pistonReadoutPistonOne', label: 'pExt: ', units: 'bar', sigFigs: 3}
				],
				graphs: [
					{type: 'Scatter', handle: 'PvsVOne', xLabel: "Volume (L)", yLabel: "Pressure (Bar)", axesInit:{x:{min:6, step:2}, y:{min:0, step:4}}, 
						sets:[
							{handle:'pExt', label:'pExt', pointCol:Col(255,50,50), flashCol:Col(255,200,200), data:{x: 'vol("SecondWall")', y: 'pExt("SecondWall")'}, trace: true, fillInPts: true, fillInPtsMin: 5}
						]
					}
				],
			},
			prompts:[
				{
					sceneData:{
						listeners: [
								{handle: 'CheckP', expr: 'pExt("SecondWall")==15', satisfyCmmds: ['curLevel.dragWeightsDragsOne.disable()'], priorityUnsatisfied: 1},
								{handle: 'CheckVol', expr: 'vol("SecondWall")<8', alertUnsatisfied: "Compress the system!", priorityUnsatisfied: 1}
							]
					},
						text: "Above is a well insulated piston cylinder assembly.  Place the block on top of the piston and observe the response.  Calculate the amount of work that the piston and block did on the system?",
						quiz: [
							{type: 'textSmall', storeAs: 'WorkDoneAnswer', units: 'kJ', text: ''}
						]
				},
				{
					sceneData: undefined,
						text: "The system had an initial temperature of 200 K and contains 1.8 moles of an ideal monatomic gas.  You wrote that get('WorkDoneAnswer','int') kJ of work were done.  What final temperature should the system have?",
						quiz: [
							{type: 'textSmall', storeAs: 'TempAnswer', units: 'K', text: ''}
						]
				},
			]
		},
		{//Third Scene
			sceneData: {
				walls: [
					{pts: [P(40,60), P(510,60), P(510,380), P(40,380)], handler: 'staticAdiabatic', handle: 'ThirdWall', border: {type: 'open'}}
				],
				dots: [
					{spcName: 'spc2', pos: P(55, 75), dims: V(450,300), count: 800, temp: 200, returnTo: 'ThirdWall', tag: 'ThirdWall'},
					{spcName: 'spc3', pos: P(55, 75), dims: V(450,300), count: 800, temp: 200, returnTo: 'ThirdWall', tag: 'ThirdWall'}
				],
				objs: [
					{type: 'Piston',
						attrs: {handle: 'PistonOne', wallInfo: 'ThirdWall', min: 2, init: 0, max: 20, makeSlider: false}
					},
					{type: 'DragWeights',
						attrs: {handle: 'DragsTwo', wallInfo: 'ThirdWall', weightDefs: [{count:1, pressure:13}], weightScalar: 10, pInit: 2, pistonOffset: V(130,-41), displayText: false}
					}			
				],
				dataReadouts: [
					{handle: 'pistonpext2', expr: 'pExt("ThirdWall")', readout: 'pistonReadoutPistonOne', label: 'pExt: ', units: 'bar', sigFigs: 2},
					{handle: 'pistontemp1', expr: 'temp("ThirdWall")', readout: 'pistonReadoutPistonOne', label: 'temp: ', units: 'K', sigFigs: 3},
					{handle: 'pistonwork1', expr: 'work("ThirdWall")', readout: 'pistonReadoutPistonOne', label: 'work: ', units: 'kJ', sigFigs: 3}
				],
				graphs: [
					{type: 'Scatter', handle: 'PvsVTwo', xLabel: "Volume (L)", yLabel: "Pressure (Bar)", axesInit:{x:{min:6, step:2}, y:{min:0, step:4}}, 
						sets:[
							{handle:'pExt', label:'pExt', pointCol:Col(255,50,50), flashCol:Col(255,200,200), data:{x: 'vol("ThirdWall")', y: 'pExt("ThirdWall")'}, trace: true, fillInPts: true, fillInPtsMin: 5}
						]
					},
					{type: 'Scatter', handle: 'TvsVOne', xLabel: "Volume (L)", yLabel: "Temperature (K)", axesInit:{x:{min:6, step:2}, y:{min:0, step:200}}, 
						sets:[
							{handle:'temp', label:'T sys', pointCol:Col(50,50,255), flashCol:Col(50,50,255), data:{x: 'vol("ThirdWall")', y: 'temp("ThirdWall")'}, trace: true, fillInPts: true, fillInPtsMin: 5}
						]
					}	
				]
			},
			prompts:[
				{
					sceneData: {
						listeners: [
							{handle: 'checkPext', expr: 'pExt("ThirdWall")==15', satisfyCmmds: ['curLevel.dragWeightsDragsTwo.disable()'] , priorityUnsatisfied: 1},
							{handle: 'checkVol2', expr: 'vol("ThirdWall")<8', alertUnsatisfied: "Compress the system!", priorityUnsatisfied: 1}
						]
					},
					text: "Previously you answered that the compression did get('WorkDoneAnswer','int') KJ on the system bringing it to a final temperature of get('TempAnswer','int') K.  Here's the same compression, but this time we're displaying work done and temperature. How do the results compare?  If there's a discrepency, can you account for it?",
					quiz: [
						{type: 'text', storeAs: 'DiscrepencyAnswer'}
					]
				},
				{
					sceneData: undefined,
						cutScene: true,
						text: "<center> ## nc_v\\Delta T = -P_{ext}\\Delta V ## </center> <p> If you'll notice, the T vs. V graph is linear.  Using the equation above, find what its slope should should be with 1.8 moles of an ideal monatomic gas.  Do the slopes from the equation and from the graph match?",
						quiz: [
							{type: 'textSmall', label: 'Slope from graph', storeAs: 'slopeFromGraph', text: " "},
							{type: 'textSmall', label: 'Slope from equation', storeAs: 'slopeFromEquation', text: " "},
							{type: 'text', preText: "Given our ## P_{ext} ## should the graph be linear or did something go wrong? Explain.", text: " "}
						]
				},
				{
					sceneData: undefined,
						cutScene: true,
						text: "Now we'll look at expanding the same system of 1.8 moles with ## P_{ext} ## of 2 bar from 7.5L to 15 L. <p> How much work will the system do on its surroundings in this expansion, and what will its final temperature be?",
						quiz: [
							{type: 'textSmall', label: "Work Done:",storeAs: 'workAnswer', text: " ", units: "kJ"},
							{type: 'textSmall', label: 'Final Temperature:', storeAs: 'tempAnswer', text: " ", units: "K"}
						]
				},
				{
					sceneData: {
						listeners: [
							{handle: 'checkPext2', expr: 'pExt("ThirdWall")==15', satisfyCmmds: ['curLevel.dragWeightsDragsTwo.enable()'], priorityUnsatisfied: 1},
							{handle: 'checkPext3', expr: 'pExt("ThirdWall")==2', satisfyCmmds: ['curLevel.dragWeightsDragsTwo.disable()'], priorityUnsatisfied: 1},
							{handle: 'checkPext4', expr: 'pExt("ThirdWall")==15', satisfyCmmds: ['walls.ThirdWall.resetWork()'], priorityUnsatisfied: 1},
							{handle: 'checkVole3', expr: 'fracDiff(vol("ThirdWall"),14.9)<.01', satisfyStore: [{storeAs:'Temp', expr: 'temp("ThirdWall")'}]}
						],
						objs: [
							{type: 'Stops',
								attrs: { handle: 'stopper', wallInfo: 'ThirdWall', stopPt: {vol: 15}}
							}
						]
					},
					text: "You wrote that the system would do get('workAnswer', 'int') kJ of work for a final temperature of get('tempAnswer', 'int') K. Find out if you were right by performing the experiment above. ",
				},
				{
					sceneData:undefined, 
					text: "The system has undergone a two-step process.  First it was compressed by adding a block.  Then it was expanded to its original volume by removing the block.  Before the compression, the system's temperature was 200K.  After the expansion, the temperature was get('Temp', 'int') K.  Why is the system temperature higher after going through this two-step process?",
					quiz: [
						{type: 'text', text: "type your answer here."}
					]
				}
			]
		},
	]
}
