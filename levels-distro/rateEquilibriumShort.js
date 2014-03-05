LevelData = {
	levelTitle: 'Chemical Reaction Rate and Equilibrium',
	spcDefs: [
		{spcName: 'spc1', m: 4, r: 2, sF298: 0, col: Col(200, 0, 0), cv: 3 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.07, b: 1730.6, c: 233.4-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3}, 
		{spcName: 'ugly', m: 4, r: 2, sF298: 0, col: Col(52, 90, 224), cv: 3 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.08, b: 1582.27, c: 239.7-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3},
		{spcName: 'uglier', m: 4, r: 2, sF298: 20, col: Col(255, 30, 62), cv: 3 * R, hF298: -12, hVap298: 10, antoineCoeffs: {a: 8.08, b: 1582.27, c: 239.7-273.15}, cpLiq: 2.5 * R, spcVolLiq: .3},
		{spcName: 'duckling', m: 4, r: 2, sF298: 0, col: Col(255, 255, 255), cv: 3 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.08, b: 1582.27, c: 239.7-273.15}, cpLiq: 2.5 * R, spcVolLiq: 0.3},
		{spcName: 'ugliest', m: 4, r: 2, sF298: -3.3, col: Col(255, 30, 62), cv: 3 * R, hF298: -12.5, hVap298: 10, antoineCoeffs: {}, cpLiq: 12, spcVolLiq: 1}
	],
	mainSequence: [
		{//First Scene
			sceneData: undefined, 
			cutScene: true,
			prompts:[
				{
					sceneData: undefined, 
					cutScene: true, 
					quiz:[
							{
								storeAs: 'foo1', 
								questionText: "Today we are going to examine the difference between reaction rate and equilibrium. For the reaction of ##A \\rightarrow B##: $$\\Delta{h}_{rxn} = -2.5\\frac{kJ}{mol}$$ and $$\\Delta{s}_{rxn} = -3.3\\frac{J}{mol-K}$$ You may assume that both of these values are constant with temperature. The reaction is to take place in an isothermal system held at 300 K. What will be the equilibrium mole fraction of B?", 
								type:'textSmall',
								units: '',
								text:'', 
								CWQuestionId: 193
							},
					]
				}
			]
		},
		{//Second Scene
			sceneData: {
				walls: [
						{pts: [P(50, 50), P(500, 50), P(500, 350), P(50, 350)], handler: 'cVIsothermal', temp: 300, isothermalRate: 5, handle: 'wally', vol: 12, border: {type: 'wrap', thickness: 5, yMin: 30}} 
					],
				dots: [
				//	{spcName: 'spc1', pos: P(55, 55), dims: V(150, 200), count: 500, temp: 350, returnTo: 'wally', tag: 'wally'},
					{spcName: 'ugly', pos: P(70, 100), dims: V(400, 250), count: 600, temp: 300, returnTo: 'wally', tag: 'wally'}
					//{spcName: 'duckling', pos: P(55, 55), dims: V(200, 200), count: 100, temp: 200, returnTo: 'wally', tag: 'wally'}
				],
				objs: [
				],
				triggers: [
					{handle: 'trigger5', expr: "dotManager.lists.ugliest.length >= 362", message: 'Enable the reaction and allow it to reach equilibrium.', requiredFor: 'prompt0', checkOn: 'conditions'},
				],
				dataRecord: [
					{wallInfo: 'wally', data: 'frac', attrs: {spcName: 'ugliest', tag: 'wally'}}
				],
				dataReadouts: [
					{label: 'Temp: ', expr: 'tempSmooth("wally")', units: 'K', decPlaces: 1, handle: 'someTemp', readout: 'mainReadout'},
				],
				buttonGroups: [
					{handle: 'rxnControl', label: 'Rxn control', isRadio: true, buttons: [
						{groupHandle: 'rxnControl', handle: 'rxnOn', label: 'Enable', exprs: ['collide.rxnHandlerNonEmergent.enableRxn("reacty7")', 'collide.rxnHandlerNonEmergent.enableRxn("reacty8")']},
						{groupHandle: 'rxnControl', isDown: true, handle: 'rxnOff', label: 'Disable', exprs: ['collide.rxnHandlerNonEmergent.disableRxn("reacty7")', 'collide.rxnHandlerNonEmergent.disableRxn("reacty8")']},
						],
					}
				],	
				rxnsNonEmergent: [
					{rcts: [{spcName: 'ugly', count: 2}], prods: [{spcName: 'ugliest', count: 2}], preExpForward: 100, activeEForward: 8, handle: 'reacty7'},
					// {rcts: [{spcName: 'ugliest', count: 2}], prods: [{spcName: 'ugly', count: 2}], preExpForward: 1, activeEForward: .08, handle: 'reacty8'},
				],
				graphs: [
					{type: 'Scatter', handle: 'PvsVOne', xLabel: "Time (s)", yLabel: "Product Mole Fraction", axesInit:{x:{min:0, step:5}, y:{min:0, step:.2}}, numGridLines: {y: 6}, axesFixed: {y: true},
						sets:[
							{handle:'frac', label:'products', pointCol:Col(255,50,50), flashCol:Col(255,200,200), data:{x: 'time("wally")', y: "frac('wally', {spcName: 'ugliest', tag: 'wally'})"}, trace: true, showPts: false, fillInPts: true, fillInPtsMin: 5}
						]
					},
				],
			},
			prompts:[
				{
					sceneData: undefined,
					resetId: 212,
					cutScene: false, 
					quiz:[
							{
								storeAs: 'foo2', 
								questionText: "We will now perform an experiment to test your calculations. Click Enable to start the reaction. How long does it take for the system at 300 K to reach the equilibrium mole fraction of the product B?", 
								type:'textSmall',
								units:'seconds',
								text:'', 
								CWQuestionId: 194
							},
							{
								storeAs: 'foo3',
								questionText: "How does the equilibrium mole fraction compare to what you calculated?",
								type: 'text',
								text: 'Type your answer here',
								CWQuestionId: 195
							},
					
					]
				},
				{
					sceneData: undefined, 
					resetId: 213,
					cutScene: false,
					quiz:[
							{
								storeAs: 'foo4', 
								questionText: "What can you say about the rates of the forward and reverse reactions now that the system is at equilibrium?",
								type:'text',
								text:'Type your answer here.', 
								CWQuestionId:196
							},
					
					]
				}
			]
		},
		{//Third Scene
			sceneData: undefined, 
			cutScene: true,
			prompts:[
				{
					sceneData: undefined, 
					cutScene: true, 
					quiz:[
							{
								storeAs: 'foo5', 
								questionText: "Next, we are going to conduct the reaction at 500 K. What will the equilibrium mole fraction of B be at this temperature?<br><br>Enter the value as a decimal between 0 and 1", 
								type:'textSmall',
								text:'', 
								CWQuestionId: 197
							},
					]
				},
				{
					sceneData: undefined, 
					cutScene: true, 
					quiz:[
							{
								storeAs: 'foo6', 
								questionText: "How does this value compare to the equilibrium mole fraction at 300 K?<br>What accounts for the change?", 
								type:'text',
								text:'Type your answer here.', 
								CWQuestionId: 198
							},
					
					]
				},
				{
					sceneData: undefined, 
					cutScene: true, 
					quiz:[
							{
								storeAs: 'foo7', 
								questionText: "At 300 K, you said it took get('foo2', 'string', 'noValue') seconds to reach equilibrium.  How do you think this value will compare to the time required to reach equilibrium at 500 K?", 
								type:'text',
								text:'Type your answer here.', 
								CWQuestionId: 199
							},
					]	
				}
			]
		},
		{//Fourth Scene
			sceneData: {
				walls: [
						{pts: [P(50, 50), P(500, 50), P(500, 350), P(50, 350)], handler: 'cVIsothermal', temp: 500, isothermalRate: 5, handle: 'wally', vol: 12, border: {type: 'wrap', thickness: 5, yMin: 30}} 
					],
				dots: [
				//	{spcName: 'spc1', pos: P(55, 55), dims: V(150, 200), count: 500, temp: 350, returnTo: 'wally', tag: 'wally'},
					{spcName: 'ugly', pos: P(70, 100), dims: V(400, 250), count: 600, temp: 500, returnTo: 'wally', tag: 'wally'}
					//{spcName: 'duckling', pos: P(55, 55), dims: V(200, 200), count: 100, temp: 200, returnTo: 'wally', tag: 'wally'}
				],
				objs: [
				],
				triggers: [
					{handle: 'trigger6', expr: "dotManager.lists.ugliest.length >= 320", message: 'Enable the reaction and allow it to reach equilibrium.', requiredFor: 'prompt0', checkOn: 'conditions'},
				],
				dataRecord: [
					{wallInfo: 'wally', data: 'frac', attrs: {spcName: 'ugliest', tag: 'wally'}}
				],
				dataReadouts: [
					{label: 'Temp: ', expr: 'tempSmooth("wally")', units: 'K', decPlaces: 1, handle: 'someTemp', readout: 'mainReadout'},
				],
				buttonGroups: [
					{handle: 'rxnControl', label: 'Rxn control', isRadio: true, buttons: [
						{groupHandle: 'rxnControl', handle: 'rxnOn', label: 'Enable', exprs: ['collide.rxnHandlerNonEmergent.enableRxn("reacty3")', 'collide.rxnHandlerNonEmergent.enableRxn("reacty4")']},
						{groupHandle: 'rxnControl', isDown: true, handle: 'rxnOff', label: 'Disable', exprs: ['collide.rxnHandlerNonEmergent.disableRxn("reacty3")', 'collide.rxnHandlerNonEmergent.disableRxn("reacty4")']},
						],
					}
				],	
				rxnsNonEmergent: [
					{rcts: [{spcName: 'ugly', count: 2}], prods: [{spcName: 'ugliest', count: 2}], preExpForward: 100, activeEForward: 8, handle: 'reacty3'},
					// {rcts: [{spcName: 'ugliest', count: 2}], prods: [{spcName: 'ugly', count: 2}], preExpForward: 0.8, activeEForward: .0008, handle: 'reacty4'},
				],
				graphs: [
					{type: 'Scatter', handle: 'PvsVOne', xLabel: "Time (s)", yLabel: "Product Mole Fraction", axesInit:{x:{min:0, step:5}, y:{min:0, step:.2}}, numGridLines: {y: 6}, axesFixed: {y: true},
						sets:[
							{handle:'frac', label:'products', pointCol:Col(255,50,50), flashCol:Col(255,200,200), data:{x: 'time("wally")', y: "frac('wally', {spcName: 'ugliest', tag: 'wally'})"}, trace: true, showPts: false, fillInPts: true, fillInPtsMin: 5}
						]
					},
				],
			},
			prompts: [
				{
					sceneData: undefined, 
					resetId: 214,
					quiz:[
							{
								storeAs: 'foo8', 
								questionText: 'Above is the same isothermal system but now at 500 K.  Click Enable to start the reaction.  You wrote it took get("foo2", "string", "noValue") seconds to reach equilibrium at 300 K.  How long does it take at 500 K?',
								type:'textSmall',
								text:'', 
								units: 'seconds',
								CWQuestionId: 200
							},
					]
				},
				{
					sceneData: undefined, 
					resetId: 215,
					quiz:[
							{
								storeAs: 'foo9', 
								questionText: 'Does the new equilibrium mole fraction match your predicted value of get("foo5", "string", "noValue")?',
								type:'text',
								text:'Type your answer here', 
								CWQuestionId: 201
							},
					]
				},
				{
					sceneData: undefined, 
					cutScene: true,
					quiz:[
							{
								storeAs: 'foo10', 
								questionText: "Now we will lower the temperature to 100 K.  What will be the equilibrium mole fraction of product B at this temperature?",
								type:'textSmall',
								text:'', 
								CWQuestionId: 202
							},
					
					]
				},
				{
					sceneData: undefined, 
					cutScene: true,
					quiz:[
							{
								storeAs: 'foo11', 
								questionText: "How do you think the time required to reach equilibrium at 100 K will compare to the times in the other two experiments?",
								type:'text',
								text:'Type your answer here.', 
								CWQuestionId: 203
							},
					]
				}
			]
		},
		{//Fifth Scene
			sceneData: {
				walls: [
						{pts: [P(50, 50), P(500, 50), P(500, 350), P(50, 350)], handler: 'cVIsothermal', temp: 100, isothermalRate: 5, handle: 'wally', vol: 12, border: {type: 'wrap', thickness: 5, yMin: 30}} 
					],
				dots: [
				//	{spcName: 'spc1', pos: P(55, 55), dims: V(150, 200), count: 500, temp: 350, returnTo: 'wally', tag: 'wally'},
					{spcName: 'ugly', pos: P(70, 100), dims: V(400, 250), count: 600, temp: 100, returnTo: 'wally', tag: 'wally'}
					//{spcName: 'duckling', pos: P(55, 55), dims: V(200, 200), count: 100, temp: 200, returnTo: 'wally', tag: 'wally'}
				],
				objs: [
				],
				triggers: [
					{handle: 'trigger7', expr: "collide.rxnHandlerNonEmergent.rxnIsEnabled('reacty5')",message: 'Enable the reaction', requiredFor: 'prompt0', checkOn:'conditions'},
				],
				dataRecord: [
					{wallInfo: 'wally', data: 'frac', attrs: {spcName: 'ugliest', tag: 'wally'}}
				],
				dataReadouts: [
					{label: 'Temp: ', expr: 'tempSmooth("wally")', units: 'K', decPlaces: 1, handle: 'someTemp', readout: 'mainReadout'},
				],
				buttonGroups: [
					{handle: 'rxnControl', label: 'Rxn control', isRadio: true, buttons: [
						{groupHandle: 'rxnControl', handle: 'rxnOn', label: 'Enable', exprs: ['collide.rxnHandlerNonEmergent.enableRxn("reacty5")', 'collide.rxnHandlerNonEmergent.enableRxn("reacty6")']},
						{groupHandle: 'rxnControl', isDown: true, handle: 'rxnOff', label: 'Disable', exprs: ['collide.rxnHandlerNonEmergent.disableRxn("reacty5")', 'collide.rxnHandlerNonEmergent.disableRxn("reacty6")']},
						],
					}
				],	
				rxnsNonEmergent: [
					{rcts: [{spcName: 'ugly', count: 2}], prods: [{spcName: 'ugliest', count: 2}], preExpForward: 10, activeEForward: 8, handle: 'reacty5'},
				],
				graphs: [
					{type: 'Scatter', handle: 'PvsVOne', xLabel: "Time (s)", yLabel: "Product Mole Fraction", axesInit:{x:{min:0, step:5}, y:{min:0, step:.2}}, numGridLines: {y: 6}, axesFixed: {y: true},
						sets:[
							{handle:'frac', label:'products', pointCol:Col(255,50,50), flashCol:Col(255,200,200), data:{x: 'time("wally")', y: "frac('wally', {spcName: 'ugliest', tag: 'wally'})"}, trace: true, showPts: false, fillInPts: true, fillInPtsMin: 5}
						]
					},
				],
			},
			prompts: [
				{
					sceneData: undefined,
					resetId: 216,
					text: "Click Enable to start the reaction. You may proceed once the reaction is enabled.",
				},
				{
					sceneData: undefined, 
					resetId: 217,
					quiz:[
							{
								questionText: 'Why is the reaction not proceeding?',
								storeAs: 'foo12', 
								type:'text',
								text:'Type your answer here.', 
								CWQuestionId: 204
							},
					]
				},
				{
					sceneData: undefined, 
					resetId: 218,
					quiz:[
							{
								questionText: 'Although it appears nothing is happening, there is a non-zero rate constant in the forward direction. What will be the mole fraction of A if you wait for a very long time?',
								storeAs: 'foo13', 
								type:'textSmall',
								text:'', 
								CWQuestionId: 205
							},
					]
				},
				{
					sceneData: undefined, 
					cutScene: true,
					quiz:[
							{
								questionText: '<br>Describe how the reaction equilibrium changed with temperature for the exothermic reaction ##A \\rightarrow B##.<br>',
								storeAs: 'foo14', 
								type:'text',
								text:'Type your answer here', 
								CWQuestionId: 206
							},
							{
								questionText: 'Why does reaction equilibrium behave this way? Does it behave this way for all reactions?',
								storeAs: 'foo15',
								type: 'text',
								text: 'Type your answer here',
								CWQuestionId: 207
							}
					]
				},
				{
					sceneData: undefined, 
					cutScene: true,
					quiz:[
							{
								questionText: '<br>Describe how the reaction rate changed with temperature for the exothermic reaction ##A \\rightarrow B##.<br>',
								storeAs: 'foo16', 
								type:'text',
								text:'Type your answer here', 
								CWQuestionId: 208
							},
							{
								questionText: 'Why does the reaction rate behave this way? Does it behave this way for all reactions?',
								storeAs: 'foo17',
								type: 'text',
								text: 'Type your answer here',
								CWQuestionId: 209
							}
					]
				},
			]
		},
		{//Sixth Scene
			sceneData: undefined,
			prompts: [
				{
					cutScene: true,
					quiz: [
						{
							type: 'text',
							questionText: '<p>Identify and describe in 1-2 sentences the most important concepts about reaction kinetics and equilibria this interactive virtual laboratory addressed.',
							text: 'type your response here',
							storeAs: 'finalAns1',
							CWQuestionId: 210
							
						},
						{
							type: 'text',
							questionText: '<p>How do these concepts connect to what you have been learning in class?',
							text: 'type your response here',
							storeAs: 'finalAns2',
							CWQuestionId: 211
							
						}
					]
				}
			]
		},
		{//Completion Scene
			sceneData: undefined,
			prompts: [
				{
					cutScene: true,
					title: '',
					text: 'You have completed the simulation.',
					quiz: [
						{
							type: 'multChoice',
							CWQuestionId: 106,
							questionText: "<p>By selecting the button below and clicking 'Submit' you will exit the simulation. If you are not finished or would like to return to a previous page, click 'back' to return to the simulation.",
							options:[
								{text:"I would like to exit the simulation", correct: true, message:"Select the button labeled 'I would like to exit the simulation'", CWAnswerId: 17},
							]
						},
					]
				},
				{
					sceneData: {
						cmmds: [
							'location.reload()'
						]
					}	
				}
			]
		}
	]
}

