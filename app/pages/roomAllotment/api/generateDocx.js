import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeightRule} from "docx";

export default async function generateDocx(dutyData,shiftNames){
	console.log("dutyData in generateDocx:",dutyData)
	// const dutyData = [
	// 	{
	// 		roomNo: "2101",
	// 		floor: "1st",
	// 		invigilators: ["Dr. Diddi Kumara Swamy", "Dr. Sourabh Jain"], // Multiple invigilators
	// 		signature: "",
	// 		reportingTime: "",
	// 		remarks: "",
	// 	},
	// 	{
	// 		roomNo: "2102",
	// 		floor: "1st",
	// 		invigilators: ["Dr. Wakar Ahamad"], // Single invigilator
	// 		signature: "",
	// 		reportingTime: "",
	// 		remarks: "",
	// 	},
	// 	{
	// 		roomNo: "2111",
	// 		floor: "1st",
	// 		invigilators: ["Dr. Vinay Pathak", "Dr. Mohan Bansal"], // Multiple invigilators
	// 		signature: "",
	// 		reportingTime: "",
	// 		remarks: "",
	// 	},
	// ];
	
	// Create the table rows dynamically with merged cells
	const tableRows = [
		new TableRow({
			children: [
				new TableCell({
					children: [
						new Paragraph({ text: "S No.", bold:true, alignment: AlignmentType.CENTER }),
					],
					width: { size: 5, type: WidthType.PERCENTAGE },
					verticalAlign: AlignmentType.CENTER,
				}),
				new TableCell({
					children: [
						new Paragraph({
							text: "Room No.",
							bold:true,
							alignment: AlignmentType.CENTER,
						}),
					],
					width: { size: 12, type: WidthType.PERCENTAGE },
					verticalAlign: AlignmentType.CENTER,
				}),
				new TableCell({
					children: [
						new Paragraph({ text: "Floor", bold:true, alignment: AlignmentType.CENTER }),
					],
					width: { size: 8, type: WidthType.PERCENTAGE },
					verticalAlign: AlignmentType.CENTER,
				}),
				new TableCell({
					children: [
						new Paragraph({
							text: "Invigilator",
							bold:true,
							alignment: AlignmentType.CENTER,
						}),
					],
					width: { size: 30, type: WidthType.PERCENTAGE },
					verticalAlign: AlignmentType.CENTER,
				}),
				new TableCell({
					children: [
						new Paragraph({ text: "Signature", bold:true, alignment: AlignmentType.CENTER }),
					],
					width: { size: 15, type: WidthType.PERCENTAGE },
					verticalAlign: AlignmentType.CENTER,
				}),
				new TableCell({
					children: [
						new Paragraph({
							text: "Reporting Time", bold:true,
							alignment: AlignmentType.CENTER,
						}),
					],
					width: { size: 15, type: WidthType.PERCENTAGE },
					verticalAlign: AlignmentType.CENTER,
				}),
				new TableCell({
					children: [
						new Paragraph({ text: "Remarks", bold:true, alignment: AlignmentType.CENTER }),
					],
					width: { size: 15, type: WidthType.PERCENTAGE },
					verticalAlign: AlignmentType.CENTER,
				}),
			],
		}),
	];
	
	// // Function to add rows with merged cells
	let serialNo = 1;
	
	dutyData.forEach((duty,index) => {
		duty.forEach((room,roomIndex)=>{

			console.log("Duty:",roomIndex,room)
			const rowCount = room.invigilators.length;
			console.log("rowCount: ",rowCount)
			// Add the first row (merged cells for Room No. and Floor)
		
			tableRows.push(
				new TableRow({
					children: [
						new TableCell({
							children: [
								new Paragraph({
									text: serialNo.toString() + ".",
									alignment: AlignmentType.CENTER,
								}),
							],
							rowSpan: rowCount, // Merge S No. across multiple rows
							verticalAlign: AlignmentType.CENTER,
						}),
						new TableCell({
							children: [
								new Paragraph({
									text: room.roomNo.toString(),
									alignment: AlignmentType.CENTER,
								}),
							],
							rowSpan: rowCount,
							verticalAlign: AlignmentType.CENTER,
						}),
						new TableCell({
							children: [
								new Paragraph({
									text: room.floor.toString(),
									alignment: AlignmentType.CENTER,
								}),
							],
							rowSpan: rowCount,
							verticalAlign: AlignmentType.CENTER,
						}),
						new TableCell({
							children: [
								new Paragraph({
									text: room.invigilators[0],
									alignment: AlignmentType.CENTER,
									verticalAlign: AlignmentType.CENTER,
								}),
							],
							verticalAlign: AlignmentType.CENTER,
						}),
						new TableCell({
							children: [
								new Paragraph({
									text: " ",
									alignment: AlignmentType.CENTER,
									verticalAlign: AlignmentType.CENTER,
								}),
							],
							verticalAlign: AlignmentType.CENTER,
						}),
						new TableCell({
							children: [
								new Paragraph({
									text: " ",
									alignment: AlignmentType.CENTER,
									verticalAlign: AlignmentType.CENTER,
								}),
							],
							verticalAlign: AlignmentType.CENTER,
						}),
						new TableCell({
							children: [
								new Paragraph({
									text: " ",
									alignment: AlignmentType.CENTER,
									verticalAlign: AlignmentType.CENTER,
								}),
							],
							verticalAlign: AlignmentType.CENTER,
						}),
					],
					height: { value: "1cm", type: HeightRule.EXACT },
				})
			);
		
			// Add additional rows for more invigilators (without Room No. and Floor columns)
			for (let i = 1; i < rowCount; i++) {
				tableRows.push(
					new TableRow({
						children: [
							new TableCell({
								children: [
									new Paragraph({
										text: room.invigilators[i],
										alignment: AlignmentType.CENTER,
									}),
								],
								verticalAlign: AlignmentType.CENTER,
							}),
							new TableCell({ children: [new Paragraph({ text: " " })] }),
							new TableCell({ children: [new Paragraph({ text: " " })] }),
							new TableCell({ children: [new Paragraph({ text: " " })] }),
						],
						height: { value: "1cm", type: HeightRule.EXACT },
					})
				);
			}
		
			serialNo++;
		})
	});
	
	// Create the Word document
	try{
	const doc = new Document({
		sections: [
			{
				children: [
					new Paragraph({
						children: [
							new TextRun({
								text: "INDIAN INSTITUTE OF INFORMATION TECHNOLOGY SONEPAT",
								bold: true,
								size: 32,
							}),
						],
						alignment: AlignmentType.CENTER,
					}),
					new Paragraph({
						text: "DUTY CHART OF MID-I SEMESTER EXAMINATION SEPTEMBER-2024",
						bold: true,
						alignment: AlignmentType.CENTER,
					}),
					new Paragraph({
						text: "Date: 18.09.2024 to 20.09.2024, Time: 09:30 AM to 10:30 AM (1st Shift), 12:00 NN to 01:00 PM (2nd Shift), 3:00 PM to 04:00 PM (3rd Shift)",
						alignment: AlignmentType.CENTER,
					}),
					new Paragraph({ text: " " }),
					new Table({
						rows: tableRows,
						width: {
							size: 100,
							type: WidthType.PERCENTAGE,
						},
					}),
					new Paragraph({
							text: "Reporting Time- 9.00 a.m.",
							bold: true,
							size: 11
					}),
					new Paragraph({
							text: "Venue- Examination room, Ground Floor.",
							bold: true,
							size: 11
					}),
					new Paragraph({
							text: "Backup",
							size: 11
					}),
					new Paragraph({
							text: "Mr. Monty Antil",
							size: 11
					}),
					new Paragraph({
							text: "Mr. Mohit Antil",size: 11
					}),
					new Paragraph({
							text: "Mr. Mukesh Khatri",size: 11
					}),
					new Paragraph({
						children: [
							new TextRun({
								text: "InCharge- Examinations",  // The text you want to display
								bold: true,
								size: 12, // Adjust size if needed
							}),
						],
						alignment: AlignmentType.RIGHT,  // Align text to the right
					}),
				],
			},
		],
	});

	const buffer = await Packer.toBuffer(doc);
	return buffer; 
	}catch (error) {
		console.error("Error generating docx:", error);
		throw new Error("Error generating docx file");
	}
}