import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();

/* =========================================================
   FILE PATH
========================================================= */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


/* =========================================================
   APP SETUP
========================================================= */

const app = express();
app.use(express.static(__dirname));
app.use(express.json({ limit: "1mb" }));

/* Serve the complete website */
app.use(express.static(__dirname));


/* =========================================================
   OPENAI SETUP
========================================================= */

const apiKey = process.env.OPENAI_API_KEY;

const client = apiKey
    ? new OpenAI({
        apiKey: apiKey
    })
    : null;


/* =========================================================
   HOME PAGE
========================================================= */

app.get("/", function (req, res) {

    res.sendFile(
        path.join(
            __dirname,
            "index.html"
        )
    );

});


/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/health", function (req, res) {

    res.json({
        status: "ok",
        message: "Human Body server is running"
    });

});


/* =========================================================
   AI BIOLOGY ASSISTANT
========================================================= */

app.post(
    "/api/biology",
    async function (req, res) {

        try {

            const question =
                String(
                    req.body?.question || ""
                ).trim();


            if (!question) {

                return res.status(400).json({
                    error:
                        "Question is required."
                });

            }


            if (!client) {

                return res.status(500).json({
                    error:
                        "OPENAI_API_KEY is missing."
                });

            }


            const response =
                await client.responses.create({

                    model: "gpt-6-luna",

                    instructions: `
You are the Human Biology AI Assistant
inside a school science-expo project called
"3D Interactive Talking Human Body".

Answer questions about:
- human body
- human anatomy
- organs
- physiology
- human biology
- general diseases

Use simple language suitable for a school student.

Explain clearly and naturally.

For medical questions, provide educational
information only. Do not diagnose the user.

Stay focused on human biology.
`,

                    input: question

                });


            const answer =
                response.output_text ||
                "Sorry, answer generate panna mudiyala.";


            res.json({
                answer: answer
            });

        }

        catch (error) {

            console.error(
                "OPENAI ERROR:",
                error
            );


            res.status(500).json({

                error:
                    error?.message ||
                    "OpenAI request failed."

            });

        }

    }
);


/* =========================================================
   START SERVER
========================================================= */

const PORT =
    Number(
        process.env.PORT || 10000
    );


app.listen(
    PORT,
    "0.0.0.0",
    function () {

        console.log(
            `🧠 Human Body server running on port ${PORT}`
        );

    }
);