-- Migration: Add unified wizard tables
-- This migration adds the new unified wizard_drafts and wizard_media tables
-- while keeping the existing specific tables for backward compatibility

-- Create unified wizard_drafts table
CREATE TABLE IF NOT EXISTS wizard_drafts (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wizard_type TEXT NOT NULL,
    wizard_config_id TEXT NOT NULL,
    form_data JSONB NOT NULL,
    current_step TEXT NOT NULL,
    step_progress JSONB DEFAULT '{}',
    completion_percentage INTEGER DEFAULT 0,
    title TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for wizard_drafts
CREATE INDEX IF NOT EXISTS idx_wizard_drafts_user_type ON wizard_drafts(user_id, wizard_type);
CREATE INDEX IF NOT EXISTS idx_wizard_drafts_updated ON wizard_drafts(updated_at);
CREATE INDEX IF NOT EXISTS idx_wizard_drafts_config ON wizard_drafts(wizard_config_id);
CREATE INDEX IF NOT EXISTS idx_wizard_drafts_completion ON wizard_drafts(completion_percentage);

-- Create unified wizard_media table
CREATE TABLE IF NOT EXISTS wizard_media (
    id VARCHAR(36) PRIMARY KEY,
    draft_id VARCHAR(36) REFERENCES wizard_drafts(id) ON DELETE CASCADE,
    published_id INTEGER,
    wizard_type TEXT NOT NULL,
    media_type TEXT NOT NULL,
    url TEXT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255),
    size INTEGER NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    width INTEGER,
    height INTEGER,
    duration INTEGER,
    display_order INTEGER DEFAULT 0,
    uploaded_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for wizard_media
CREATE INDEX IF NOT EXISTS idx_wizard_media_draft ON wizard_media(draft_id);
CREATE INDEX IF NOT EXISTS idx_wizard_media_published ON wizard_media(published_id, wizard_type);
CREATE INDEX IF NOT EXISTS idx_wizard_media_type ON wizard_media(wizard_type, media_type);

-- Add comments for documentation
COMMENT ON TABLE wizard_drafts IS 'Unified table for all wizard types (property, land, blog) drafts';
COMMENT ON TABLE wizard_media IS 'Unified table for media files associated with wizard drafts';

COMMENT ON COLUMN wizard_drafts.wizard_type IS 'Type of wizard: property, land, blog';
COMMENT ON COLUMN wizard_drafts.wizard_config_id IS 'Configuration ID: property-wizard, land-wizard, blog-wizard';
COMMENT ON COLUMN wizard_drafts.form_data IS 'Partial wizard data as JSON';
COMMENT ON COLUMN wizard_drafts.current_step IS 'Current step ID in the wizard';
COMMENT ON COLUMN wizard_drafts.step_progress IS 'Progress tracking per step as JSON object';
COMMENT ON COLUMN wizard_drafts.completion_percentage IS 'Overall completion percentage (0-100)';

COMMENT ON COLUMN wizard_media.draft_id IS 'Reference to wizard_drafts.id (for drafts)';
COMMENT ON COLUMN wizard_media.published_id IS 'Reference to final published entity (property.id, land.id, etc.)';
COMMENT ON COLUMN wizard_media.media_type IS 'Type of media: image, video';
COMMENT ON COLUMN wizard_media.duration IS 'Video duration in seconds (null for images)';