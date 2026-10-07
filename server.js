import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
    res.sendFile(process.cwd() + "/index.html");
});

app.get("/main.js", (req, res) => {
    res.sendFile(process.cwd() + "/main.js");
});

app.get("/style.css", (req, res) => {
    res.sendFile(process.cwd() + "/style.css");
});

app.use(
    "/models",
    express.static(process.cwd() + "/models")
);
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


app.post("/api/biology", async (req, res) => {

    try {

        const question =
            String(req.body.question || "").trim();

        if (!question) {

            return res.status(400).json({
                error: "Question is required."
            });

        }


        /* =============================================
           TEXT ANSWER
        ============================================= */

        const response =
            await client.responses.create({

                model: "gpt-5",

                instructions: `
You are a friendly Human Biology AI Assistant
inside a school science-expo project called
"3D Interactive Talking Human Body".

Answer questions about:
human anatomy, organs, physiology,
human biology, diseases and the human body.

Use easy language suitable for a school student.

Explain clearly and naturally.

For medical questions:
give educational information only.
Do not diagnose the user.

Stay focused on biology and the human body.
`,

                input: question

            });


        const answer =
            response.output_text ||
            "Sorry, answer generate panna mudiyala.";


        /* =============================================
           EDUCATIONAL IMAGE / DIAGRAM
        ============================================= */

        const imagePrompt = `
Create a clean educational biology diagram
for a school science exhibition.

Topic:
${question}

Requirements:
- scientifically appropriate
- simple and easy to understand
- human biology / anatomy focused
- clear labeled structures when useful
- dark-blue or clean educational background
- no graphic injury
- no unnecessary text
- suitable for an 11th-standard student
`;

        let image = null;


        try {

            const imageResponse =
                await client.images.generate({

                    model: "gpt-image-2",

                    prompt: imagePrompt,

                    size: "1024x1024",

                    quality: "low"

                });


            if (
                imageResponse.data &&
                imageResponse.data.length > 0
            ) {

                const base64 =
                    imageResponse.data[0].b64_json;

                if (base64) {

                    image =
                        `data:image/png;base64,${base64}`;

                }

            }

        }

        catch (imageError) {

            console.error(
                "IMAGE GENERATION ERROR:",
                imageError
            );

            /* Answer still works even if image fails */

            image = null;

        }


        /* =============================================
           SEND BOTH TO WEBSITE
        ============================================= */

        res.json({

            answer: answer,

            image: image

        });

    }

    catch (error) {

        console.error(
            "AI ERROR:",
            error
        );

        res.status(500).json({

            error:
                "AI assistant could not answer right now."

        });

    }

});


const PORT =
    process.env.PORT || 3000;


app.listen(
    PORT,
    () => {

        console.log(
            `🧠 Biology AI running at http://localhost:${PORT}`
        );

    }
);