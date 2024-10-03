import generateDocx from './generateDocx.js'
export async function GET(){
	return new Response("Allotment")
}
export async function POST(req:Request){
	try {
		const { dutyData,shiftNameArray,text } = await req.json()
		console.log(dutyData)
    const buffer = await generateDocx(dutyData,shiftNameArray,text);

		const headers = new Headers({
      "Content-Disposition": 'attachment; filename="DutyChart.docx"',
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    return new Response(buffer, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error("Errors:", error);
    return new Response("Error processing request", { status: 500 });
  }
}