import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    try {
        const prompt = "Describe a beautiful property in Dominican Republic in Spanish. Keep it short and professional.";

        console.log('Testing Gemini with prompt:', prompt);

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': process.env.GEMINI_API_KEY || ''
                },
                body: JSON.stringify({
                    contents: [{
                        role: "user",
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 200,
                        topP: 0.9
                    }
                })
            }
        );

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            return NextResponse.json({
                success: false,
                error: `HTTP ${response.status}`,
                details: errorText
            });
        }

        const data = await response.json();
        console.log('Full Gemini response:', JSON.stringify(data, null, 2));

        // Try to extract text using different methods
        let extractedText = '';
        let extractionMethod = '';

        if (data.candidates && data.candidates[0]) {
            const candidate = data.candidates[0];

            if (candidate.content && candidate.content.parts && candidate.content.parts[0] && candidate.content.parts[0].text) {
                extractedText = candidate.content.parts[0].text;
                extractionMethod = 'candidates[0].content.parts[0].text';
            } else if (candidate.text) {
                extractedText = candidate.text;
                extractionMethod = 'candidates[0].text';
            } else if (candidate.output) {
                extractedText = candidate.output;
                extractionMethod = 'candidates[0].output';
            }
        }

        if (!extractedText && data.text) {
            extractedText = data.text;
            extractionMethod = 'data.text';
        }

        return NextResponse.json({
            success: true,
            extractedText,
            extractionMethod,
            textLength: extractedText.length,
            fullResponse: data,
            analysis: {
                hasCandidates: !!data.candidates,
                candidatesLength: data.candidates?.length || 0,
                firstCandidateKeys: data.candidates?.[0] ? Object.keys(data.candidates[0]) : [],
                hasContent: !!(data.candidates?.[0]?.content),
                hasParts: !!(data.candidates?.[0]?.content?.parts),
                partsLength: data.candidates?.[0]?.content?.parts?.length || 0
            }
        });

    } catch (error) {
        console.error('Test failed:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
    }
}