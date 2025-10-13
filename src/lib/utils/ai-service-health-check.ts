/**
 * AI Service Health Check Utilities
 * Provides health checking and diagnostics for AI services
 */

export interface AIServiceHealthStatus {
    isHealthy: boolean;
    models: {
        [key: string]: {
            available: boolean;
            responseTime?: number;
            error?: string;
        }
    };
    lastChecked: Date;
    recommendations: string[];
}

/**
 * Check the health of AI services
 */
export async function checkAIServiceHealth(): Promise<AIServiceHealthStatus> {
    const models = [
        'gpt2',
        'distilgpt2',
        'PlanTL-GOB-ES/gpt2-base-bne',
        'microsoft/DialoGPT-medium'
    ];

    const status: AIServiceHealthStatus = {
        isHealthy: false,
        models: {},
        lastChecked: new Date(),
        recommendations: []
    };

    let healthyModels = 0;

    for (const model of models) {
        const startTime = Date.now();

        try {
            // Simple test prompt
            const testPrompt = "Test prompt for health check";

            // This would need to be exposed from ai-actions.ts
            // For now, we'll simulate the check
            const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs: testPrompt,
                    parameters: {
                        max_length: 50,
                        return_full_text: false
                    }
                })
            });

            const responseTime = Date.now() - startTime;

            if (response.ok) {
                status.models[model] = {
                    available: true,
                    responseTime
                };
                healthyModels++;
            } else {
                status.models[model] = {
                    available: false,
                    error: `HTTP ${response.status}: ${response.statusText}`
                };
            }

        } catch (error) {
            status.models[model] = {
                available: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    status.isHealthy = healthyModels > 0;

    // Generate recommendations
    if (healthyModels === 0) {
        status.recommendations.push('All AI models are unavailable. Check API key and network connectivity.');
    } else if (healthyModels < models.length / 2) {
        status.recommendations.push('Some AI models are unavailable. Consider using fallback content.');
    }

    if (!status.models['gpt2']?.available) {
        status.recommendations.push('Primary text generation model (gpt2) is unavailable.');
    }

    if (!status.models['PlanTL-GOB-ES/gpt2-base-bne']?.available) {
        status.recommendations.push('Spanish language model is unavailable. Using English model for Spanish content.');
    }

    return status;
}

/**
 * Get a simple health status for quick checks
 */
export async function getSimpleHealthStatus(): Promise<{ healthy: boolean; message: string }> {
    try {
        const status = await checkAIServiceHealth();

        if (status.isHealthy) {
            const availableModels = Object.values(status.models).filter(m => m.available).length;
            const totalModels = Object.keys(status.models).length;

            return {
                healthy: true,
                message: `AI service healthy (${availableModels}/${totalModels} models available)`
            };
        } else {
            return {
                healthy: false,
                message: 'AI service unavailable - using fallback content'
            };
        }
    } catch (error) {
        return {
            healthy: false,
            message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}

/**
 * Test a specific model with a simple prompt
 */
export async function testModel(modelName: string, prompt: string = "Test"): Promise<{
    success: boolean;
    responseTime: number;
    error?: string;
    response?: any;
}> {
    const startTime = Date.now();

    try {
        const response = await fetch(`https://api-inference.huggingface.co/models/${modelName}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    max_length: 50,
                    return_full_text: false,
                    temperature: 0.7
                }
            })
        });

        const responseTime = Date.now() - startTime;

        if (response.ok) {
            const data = await response.json();
            return {
                success: true,
                responseTime,
                response: data
            };
        } else {
            return {
                success: false,
                responseTime,
                error: `HTTP ${response.status}: ${response.statusText}`
            };
        }

    } catch (error) {
        return {
            success: false,
            responseTime: Date.now() - startTime,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Get recommended models based on task and language
 */
export function getRecommendedModels(task: 'description' | 'title' | 'tags', language: 'es' | 'en'): string[] {
    const models = {
        description: {
            es: ['PlanTL-GOB-ES/gpt2-base-bne', 'gpt2', 'distilgpt2'],
            en: ['gpt2', 'distilgpt2']
        },
        title: {
            es: ['PlanTL-GOB-ES/gpt2-base-bne', 'gpt2', 'distilgpt2'],
            en: ['gpt2', 'distilgpt2']
        },
        tags: {
            es: ['gpt2', 'distilgpt2'],
            en: ['gpt2', 'distilgpt2']
        }
    };

    return models[task][language] || models[task]['en'];
}