import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const aiEnabled = process.env.ENABLE_AI_GENERATION === 'true';
        const geminiKey = process.env.GEMINI_API_KEY;

        return NextResponse.json({
            timestamp: new Date().toISOString(),
            aiEnabled,
            hasGeminiKey: !!geminiKey,
            geminiKeyLength: geminiKey?.length || 0,
            environment: process.env.NODE_ENV,
            status: 'AI system ready',
            message: aiEnabled
                ? (geminiKey ? 'AI generation enabled with Gemini' : 'AI enabled but no Gemini key')
                : 'AI disabled - using fallback content'
        });
    } catch (error) {
        return NextResponse.json({
            error: 'Status check failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}