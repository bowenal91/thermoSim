LevelData = {
	levelTitle: 'Interactive Virtual Laboratories',
	
	spcDefs: [
		{spcName: 'spc1', m: 4, r: 4, col: Col(200, 0, 0), cv: 1.5 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.07, b:1730.6, c: 233.4-273.15}, cpLiq: 2.5* R, spcVolLiq: .3},
		{spcName: 'spc2', m: 3, r: 1.5, col: Col(255, 255, 255), cv: 1.5 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.07, b:1530.6, c: 239.4-273.15}, cpLiq: 2.5* R, spcVolLiq: .3},
		{spcName: 'spc3', m: 3, r: 1, col: Col(150, 100, 100), cv: 1.5 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.07, b:1530.6, c: 239.4-273.15}, cpLiq: 2.5* R, spcVolLiq: .3}
	],
	mainSequence: [
		
		
		{//Second Scene
			sceneData: {//Scene 2
				walls: [
					{pts: [P(40,60), P(510,60), P(510,380), P(40,380)], handler: 'staticAdiabatic', handle: 'SecondWall', border: {type: 'open'}}
				],
				dots: [
					{spcName: 'spc2', pos: P(55, 75), dims: V(450,300), count: 900, temp: 200, returnTo: 'SecondWall', tag: 'SecondWall'},
				],
				objs: [
					{type: 'Piston',
						attrs: {handle: 'PistonOne', wallInfo: 'SecondWall', min: 2, init: 1.5, max: 20, makeSlider: false}
					},	
					{
						type: 'Heater', attrs: {handle: 'heatery', wallInfo: 'SecondWall', max: 2} 
					}
				],
				dataReadouts: [
					{label: 'Temp: ', expr: 'tempSmooth("SecondWall")', units: 'K', decPlaces: 1, handle: 'someTemp', readout: 'mainReadout'},
					{label: 'Volume: ', expr: 'vol("SecondWall")', units: 'L', decPlaces: 1, handle: 'voluminous', readout: 'mainReadout'},
					// {label: 'Pressure: ', expr: 'pExt("SecondWall")', units: 'bar', decPlaces: 1, handle 'pressurous', readout: 'pistonPistonOneLeft', handle: 'foofoofoo'},
					{label: 'Work: ', expr: 'work("SecondWall")', units: 'kJ', decPlaces: 1, handle: 'worky', readout: 'mainReadout', handle: 'foooooooo'}
				]
			},
			prompts:[
				{//Prompt 0
					sceneData: undefined,
					quiz: [
						{	
							type: 'textSmall',
							preText: "Let's begin our experiment with the isothermal compression of 1.1 moles of perfectly ideal gas using a single block. Please place the block on the piston. Estimate the value of work in this compression process.",
							text: ' ', 
							units: 'kJ',
							storeAs: 'Ans1',
							CWQuestionId: 15
						}
					],
				}				
			]
		},	
		{
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
