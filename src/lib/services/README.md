# AI Property Wizard - AI Service Integration

This document explains the AI service integration for the Property Wizard, implemented as part of Task 3.

## Overview

The AI service provides automatic content generation for property listings using HuggingFace's free Inference API. It includes robust fallback mechanisms to ensure the wizard always works, even when AI services are unavailable.

## Features

- **Title Generation**: Creates compelling property titles based on type, location, and features
- **Description Generation**: Generates detailed property descriptions including all relevant details
- **Tags Generation**: Creates relevant tags for better property discoverability
- **Batch Generation**: Generate all content at once for efficiency
- **Fallback Templates**: Automatic fallback to template-based generation when AI fails
- **Multilingual Support**: Supports both Spanish and English content generation

## Architecture

### Server Actions (`lib/actions/ai-actions.ts`)

- `generatePropertyTitle()` - Generate property title
- `generatePropertyDescription()` - Generate property description
- `generatePropertyTags()` - Generate property tags
- `generateAllPropertyContent()` - Generate all content at once

### React Hook (`hooks/use-ai-generation.ts`)

- Provides React integration for AI generation
- Handles loading states and error management
- Shows user-friendly toast notifications
- Manages generation state and results

### UI Integration (`components/wizard/steps/general-info-step.tsx`)

- AI generation buttons in Step 1 of the wizard
- Real-time form field population
- Loading indicators and error handling
- Conditional enabling based on required fields

## Setup

### 1. Environment Configuration

Add your HuggingFace API key to `.env`:

```bash
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
```

**Note**: The API key is server-side only for security. Get a free API key from [HuggingFace](https://huggingface.co/settings/tokens).

### 2. Required Fields

For AI generation to work, the following fields must be filled:

- Property Type
- Price
- Surface Area

Optional fields that enhance generation:

- Bedrooms
- Bathrooms
- Selected characteristics

## Usage

### In React Components

```typescript
import { useAIGeneration } from "@/hooks/use-ai-generation";

function MyComponent() {
  const { generateTitle, generateDescription, generateAll, isGenerating } =
    useAIGeneration({
      language: "es",
      onSuccess: (type, content) => {
        // Handle successful generation
        console.log(`Generated ${type}:`, content);
      },
    });

  const handleGenerate = async () => {
    const propertyData = {
      type: "Casa",
      location: "Punta Cana",
      price: 450000,
      surface: 280,
      characteristics: ["Piscina", "Vista al Mar"],
      bedrooms: 3,
      bathrooms: 2,
    };

    await generateAll(propertyData);
  };

  return (
    <button onClick={handleGenerate} disabled={isGenerating}>
      {isGenerating ? "Generating..." : "Generate with AI"}
    </button>
  );
}
```

### Direct Server Action Usage

```typescript
import { generatePropertyTitle } from "@/lib/actions/ai-actions";

const result = await generatePropertyTitle(propertyData, { language: "es" });

if (result.success) {
  console.log("Generated title:", result.data);
} else {
  console.error("Generation failed:", result.error);
}
```

## Fallback System

The AI service includes a robust fallback system:

1. **Primary**: HuggingFace API call
2. **Fallback**: Template-based generation
3. **Always Works**: System never fails completely

### Template Examples

**Title Templates**:

- Spanish: `"Casa en Punta Cana con Piscina"`
- English: `"House in Punta Cana with Pool"`

**Description Templates**:

- Include property type, location, price, surface
- Add bedroom/bathroom counts if available
- List up to 3 main characteristics
- Professional, appealing language

## Error Handling

### Client-Side Errors

- Network connectivity issues
- API rate limiting
- Invalid responses
- Server errors

### User Experience

- Graceful degradation to templates
- Clear error messages
- Toast notifications
- No blocking failures

## Testing

Run the AI service tests:

```bash
npx jest lib/__tests__/ai-actions.test.ts
```

Tests cover:

- Successful generation with fallbacks
- Error handling scenarios
- Template generation
- Multilingual support
- Edge cases (missing data, large datasets)

## Models Used

### Primary Model

- **microsoft/DialoGPT-medium**: Conversational AI model good for creative text generation

### Backup Model

- **facebook/blenderbot-400M-distill**: Smaller, faster model for fallback scenarios

### Model Selection Criteria

- Free tier availability
- Spanish language support
- Real estate content generation capability
- Reasonable response times

## Performance

### Response Times

- AI Generation: 2-5 seconds (depending on HuggingFace load)
- Template Fallback: <100ms
- Total Timeout: 10 seconds before fallback

### Rate Limits

- HuggingFace Free Tier: ~1000 requests/month
- Automatic retry with exponential backoff
- Graceful fallback when limits exceeded

## Security

### API Key Protection

- Server-side only (not exposed to client)
- Environment variable configuration
- No API key in client-side code

### Input Sanitization

- All user inputs validated before AI generation
- Generated content cleaned and sanitized
- XSS protection on all outputs

## Monitoring

### Logging

- All AI generation attempts logged
- Error tracking for failed generations
- Performance metrics collection

### Analytics

- Generation success/failure rates
- Most common fallback scenarios
- User engagement with AI features

## Future Enhancements

### Planned Features

- Custom model fine-tuning for real estate
- Image-based property analysis
- Market trend integration
- SEO optimization suggestions

### Model Upgrades

- Integration with newer HuggingFace models
- Support for additional languages
- Specialized real estate models

## Troubleshooting

### Common Issues

**AI Generation Not Working**

1. Check HuggingFace API key in `.env`
2. Verify internet connectivity
3. Check HuggingFace service status
4. Ensure required fields are filled

**Poor Quality Generation**

1. Add more property characteristics
2. Provide detailed location information
3. Check language setting matches content
4. Consider using template fallback

**Performance Issues**

1. Check network connectivity
2. Monitor HuggingFace API status
3. Consider reducing concurrent requests
4. Use batch generation for multiple properties

### Debug Mode

Enable debug logging by setting:

```bash
LOG_LEVEL=debug
```

This will log all AI generation attempts and responses for troubleshooting.
