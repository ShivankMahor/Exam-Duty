import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeightRule, VerticalAlign, ImageRun, HorizontalPosition, HorizontalPositionRelativeFrom, HorizontalPositionAlign, VerticalPositionRelativeFrom, VerticalPositionAlign} from "docx";
import { readFileSync } from "fs";
import path from "path";
export default async function generateDocx(dutyData,shiftNames,text){
	console.log("dutyData in generateDocx2:",dutyData,text)

	const ShiftTable = dutyData.map((shift,shiftIndex)=>{
		const tableRows = [
			new TableRow({
				children: [
					new TableCell({
						children: [
							new Paragraph({
								children: [
									new TextRun({
											text: "S. No.",
											bold: true,
											size: 20,
									}),
								],
								alignment: AlignmentType.CENTER,
								verticalAlign: AlignmentType.CENTER
							})
						],
						verticalAlign: AlignmentType.CENTER,
						width: { size: 5, type: WidthType.PERCENTAGE },
					}),
					new TableCell({
						children: [
							new Paragraph({
								children: [
									new TextRun({
											text: "Room No",
											bold: true,
											size: 20,
									}),
								],
								alignment: AlignmentType.CENTER,
								verticalAlign: AlignmentType.CENTER
							})
						],
						verticalAlign: AlignmentType.CENTER,
						width: { size: 12, type: WidthType.PERCENTAGE },
					}),
					new TableCell({
						children: [
							new Paragraph({
								children: [
									new TextRun({
											text: "Floor",
											bold: true,
											size: 20,
									}),
								],
								alignment: AlignmentType.CENTER,
								verticalAlign: AlignmentType.CENTER
							})
						],
						verticalAlign: AlignmentType.CENTER,
						width: { size: 8, type: WidthType.PERCENTAGE },
					}),
					new TableCell({
						children: [
							new Paragraph({
								children: [
									new TextRun({
											text: "Invigilator",
											bold: true,
											size: 20,
									}),
								],
								alignment: AlignmentType.CENTER,
								verticalAlign: AlignmentType.CENTER
							})
						],
						verticalAlign: AlignmentType.CENTER,
						width: { size: 30, type: WidthType.PERCENTAGE },
					}),
					new TableCell({
						children: [
							new Paragraph({
								children: [
									new TextRun({
											text: "Signature",
											bold: true,
											size: 20,
									}),
								],
								alignment: AlignmentType.CENTER,
								verticalAlign: AlignmentType.CENTER
							})
						],
						verticalAlign: AlignmentType.CENTER,
						width: { size: 15, type: WidthType.PERCENTAGE },
					}),
					new TableCell({
						children: [
							new Paragraph({
								children: [
									new TextRun({
											text: "Reporting Time",
											bold: true,
											size: 20,
									}),
								],
								alignment: AlignmentType.CENTER,
								verticalAlign: AlignmentType.CENTER
							})
						],
						verticalAlign: AlignmentType.CENTER,
						width: { size: 15, type: WidthType.PERCENTAGE },
					}),
					new TableCell({
						children: [
							new Paragraph({
								children: [
									new TextRun({
											text: "Remark",
											bold: true,
											size: 20,
									}),
								],
								alignment: AlignmentType.CENTER,
								verticalAlign: AlignmentType.CENTER
							})
						],
						verticalAlign: AlignmentType.CENTER,
						width: { size: 15, type: WidthType.PERCENTAGE },
					}),
				],
			}),
		];
		
		let serialNo = 1;
		
			shift.forEach((room,roomIndex)=>{

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
		return tableRows
		}
	)
	const imagePath = path.join(__dirname, "../../../../../../app/images/image.png");
	console.log(__dirname)
	console.log(imagePath)
	const sections = dutyData.map((shift, shiftIndex) => ({
    children: [				
        new Paragraph({
            children: [
							new ImageRun({
								data: readFileSync(imagePath),
								transformation: {
									width: 60,  // Set the width as per your requirement
									height: 60, // Set the height as per your requirement
								},
								floating: {
									horizontalPosition: {
											relative: HorizontalPositionRelativeFrom.MARGIN,
											align: HorizontalPositionAlign.LEFT,
									},
									verticalPosition: {
											relative: VerticalPositionRelativeFrom.PARAGRAPH,
											align: VerticalPositionAlign.TOP,
									},
									wrap: {
										type: "square",
									},
								},
							}),
							new TextRun({
								text: "INDIAN INSTITUTE OF INFORMATION TECHNOLOGY SONEPAT",
								bold: true,
								size: 32,
							}),
            ],
						indent: {
							left: 720,  // Left margin in twips (720 twips = 0.5 inch; 1440 twips = 1 inch)
						},
            alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
            children: [
                new TextRun({
                    text: "भारतीय सूचना प्रौद्योगिकी संस्थान सोनीपत ",
                    bold: true,
                    size: 26,
                }),
            ],
            alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
					children: [
						new TextRun({
							text: "(An Autonomous Institute of National Importance under Act of Parliament)",
							bold: true,
							size: 22,
						}),
					],
					alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
					children: [
						new TextRun({
							text: "Phone: +91 1302987921, Email: sonepatiiit@gmail.com, website: www.iiitsonepat.ac.in ",
						}),
					],
					alignment: AlignmentType.CENTER,
        }),
				new Paragraph({ text: "" }),
				new Paragraph({ text: "" }),
        new Paragraph({
					children: [
						new TextRun({
							text: text.headingText1?.toString(),
							bold: true,
							size: 20,
						}),
					],
					alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
					children: [
						new TextRun({
							text: text.headingText2?.toString(),
							bold: true,
							size: 20,
						}),
					],
					alignment: AlignmentType.CENTER,
        }),

				new Paragraph({ text: " " }),
				new Paragraph({
					children: [
						new TextRun({
							text: shiftNames[shiftIndex],
							bold: true,
							size: 20,
						}),
					],
					alignment: AlignmentType.CENTER,
				}),
        new Table({
            rows: ShiftTable[shiftIndex], // Assuming shift has tableRows specific to each duty
            width: {
							size: 100,
							type: WidthType.PERCENTAGE,
            },
        }),
				new Paragraph({ text: " " }),
        new Paragraph({
					children: [
						new TextRun({
							text: "Reporting Time- 9.00 a.m.",
							bold: true,
							size: 20,
						}),
					],
        }),
        new Paragraph({
					children: [
						new TextRun({
							text: "Venue- Examination room, Ground Floor.",
							bold: true,
							size: 20,
						}),
					],
        }),
        new Paragraph({
					text: "Backup",
					size: 11,
        }),
        new Paragraph({
					text: "Mr. Monty Antil",
					size: 11,
        }),
        new Paragraph({
					text: "Mr. Mohit Antil",
					size: 11,
        }),
        new Paragraph({
					text: "Mr. Mukesh Khatri",
					size: 11,
        }),
				new Paragraph({ text: " " }),
        // Bottom-right text
        new Paragraph({
					children: [
						new TextRun({
							text: "InCharge- Examinations",
							bold: true,
							size: 20,
						}),
					],
					alignment: AlignmentType.RIGHT,
			}),
    ],
}));

// Create the document with the generated sections
const doc = new Document({
	sections: sections,  // Add all generated sections
});

	const buffer = await Packer.toBuffer(doc);
	return buffer; 
}