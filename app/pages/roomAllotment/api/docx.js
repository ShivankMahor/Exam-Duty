import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeightRule } from "docx";
import fs from 'fs';
import path from 'path';

// Function to generate and send the .docx file
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).send({ message: 'Only GET requests are allowed' });
  }
  console.log("APi REquest")
// Example Data (Two invigilators for some rooms)

const dutyData = [
  {
    roomNo: "2101",
    floor: "1st",
    invigilators: ["Dr. Diddi Kumara Swamy", "Dr. Sourabh Jain"], // Multiple invigilators
    signature: "",
    reportingTime: "",
    remarks: "",
  },
  {
    roomNo: "2102",
    floor: "1st",
    invigilators: ["Dr. Wakar Ahamad"], // Single invigilator
    signature: "",
    reportingTime: "",
    remarks: "",
  },
  {
    roomNo: "2111",
    floor: "1st",
    invigilators: ["Dr. Vinay Pathak", "Dr. Mohan Bansal"], // Multiple invigilators
    signature: "",
    reportingTime: "",
    remarks: "",
  },
];

// Create the table rows dynamically with merged cells
const tableRows = [
  new TableRow({
    children: [
      new TableCell({
        children: [
          new Paragraph({ text: "S No.", alignment: AlignmentType.CENTER }),
        ],
        width: { size: 6, type: WidthType.PERCENTAGE },
        verticalAlign: "center",
      }),
      new TableCell({
        children: [
          new Paragraph({
            text: "Room No.",
            alignment: AlignmentType.CENTER,
          }),
        ],
        width: { size: 15, type: WidthType.PERCENTAGE },
        verticalAlign: "center",
      }),
      new TableCell({
        children: [
          new Paragraph({ text: "Floor", alignment: AlignmentType.CENTER }),
        ],
        width: { size: 10, type: WidthType.PERCENTAGE },
        verticalAlign: "center",
      }),
      new TableCell({
        children: [
          new Paragraph({
            text: "Invigilator",
            alignment: AlignmentType.CENTER,
          }),
        ],
        width: { size: 30, type: WidthType.PERCENTAGE },
        verticalAlign: "center",
      }),
      new TableCell({
        children: [
          new Paragraph({ text: "Signature", alignment: AlignmentType.CENTER }),
        ],
        width: { size: 15, type: WidthType.PERCENTAGE },
        verticalAlign: "center",
      }),
      new TableCell({
        children: [
          new Paragraph({
            text: "Reporting Time",
            alignment: AlignmentType.CENTER,
          }),
        ],
        width: { size: 15, type: WidthType.PERCENTAGE },
        verticalAlign: "center",
      }),
      new TableCell({
        children: [
          new Paragraph({ text: "Remarks", alignment: AlignmentType.CENTER }),
        ],
        width: { size: 15, type: WidthType.PERCENTAGE },
        verticalAlign: "center",
      }),
    ],
  }),
];

// Function to add rows with merged cells
let serialNo = 1;

dutyData.forEach((duty) => {
  const rowCount = duty.invigilators.length;

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
              text: duty.roomNo,
              alignment: AlignmentType.CENTER,
            }),
          ],
          rowSpan: rowCount,
          verticalAlign: AlignmentType.CENTER,
        }),
        new TableCell({
          children: [
            new Paragraph({
              text: duty.floor,
              alignment: AlignmentType.CENTER,
            }),
          ],
          rowSpan: rowCount,
          verticalAlign: AlignmentType.CENTER,
        }),
        new TableCell({
          children: [
            new Paragraph({
              text: duty.invigilators[0],
              alignment: AlignmentType.CENTER,
              verticalAlign: AlignmentType.CENTER,
            }),
          ],
          verticalAlign: AlignmentType.CENTER,
        }),
        new TableCell({
          children: [
            new Paragraph({
              text: "",
              alignment: AlignmentType.CENTER,
              verticalAlign: AlignmentType.CENTER,
            }),
          ],
          verticalAlign: AlignmentType.CENTER,
        }),
        new TableCell({
          children: [
            new Paragraph({
              text: "",
              alignment: AlignmentType.CENTER,
              verticalAlign: AlignmentType.CENTER,
            }),
          ],
          verticalAlign: AlignmentType.CENTER,
        }),
        new TableCell({
          children: [
            new Paragraph({
              text: "",
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
                text: duty.invigilators[i],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: AlignmentType.CENTER,
          }),
          new TableCell({ children: [new Paragraph("")] }),
          new TableCell({ children: [new Paragraph("")] }),
          new TableCell({ children: [new Paragraph("")] }),
        ],
        height: { value: "1cm", type: HeightRule.EXACT },
      })
    );
  }

  serialNo++;
});

// Create the Word document
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
          alignment: "center",
        }),
        new Paragraph({
          text: "DUTY CHART OF MID-I SEMESTER EXAMINATION SEPTEMBER-2024",
          bold: true,
          alignment: "center",
        }),
        new Paragraph({
          text: "Date: 18.09.2024 to 20.09.2024, Time: 09:30 AM to 10:30 AM (1st Shift), 12:00 NN to 01:00 PM (2nd Shift), 3:00 PM to 04:00 PM (3rd Shift)",
          alignment: "center",
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
        }),
        new Paragraph({
            text: "Venue- Examination room, Ground Floor.",
            bold: true,
        }),
        new Paragraph({
            text: "Backup"
        }),
        new Paragraph({
            text: "Mr. Monty Antil"
        }),
        new Paragraph({
            text: "Mr. Mohit Antil"
        }),
        new Paragraph({
            text: "Mr. Mukesh Khatri"
        }),
      ],
    },
  ],
});

const buffer = await Packer.toBuffer(doc);

  // Set headers to download the file
  res.setHeader('Content-Disposition', 'attachment; filename=DutyChart.docx');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  
  res.send(buffer); // Send the file as response
}