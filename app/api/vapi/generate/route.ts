import {google} from "@ai-sdk/google"
import { generateText } from "ai";

export async function GET(){
    return Response.json({ message: "Hello from the VAPI route!" },{status: 200});
}
