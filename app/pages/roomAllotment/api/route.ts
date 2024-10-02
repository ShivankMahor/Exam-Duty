import generateDocx from '../api/generateDocx copy.js'
import { NextApiRequest,NextApiResponse } from 'next';
export async function GET(){
	return new Response("Allotment")
}
export async function POST(req:Request){
	try {
		const { dutyData,shiftNameArray } = await req.json()
		console.log(dutyData)
    const buffer = await generateDocx(dutyData,shiftNameArray);
		console.log("Buffer length:", buffer.length);

		const headers = new Headers({
      "Content-Disposition": 'attachment; filename="DutyChart.docx"',
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    // Return a new Response with the .docx buffer as the body
    return new Response(buffer, {
      status: 200,
      headers,
    });

		// return new Response("Hello world")
  } catch (error) {
    console.error("Errors:", error);
    return new Response("Error processing request", { status: 500 });
  }
}