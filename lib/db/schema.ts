import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  numeric,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";

// user Table
export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID for user ID
  name: varchar("name", { length: 100 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").default(false),
  image: text("image"),
  role: text("role").notNull(),
  // Campos adicionales del perfil
  firstName: varchar("first_name", { length: 50 }),
  lastName: varchar("last_name", { length: 50 }),
  phone: varchar("phone", { length: 20 }),
  bio: text("bio"),
  location: varchar("location", { length: 100 }),
  website: varchar("website", { length: 255 }),
  // Preferencias del usuario (JSON)
  preferences: jsonb("preferences").default({
    notifications: {
      email: true,
      push: true,
      marketing: false
    },
    privacy: {
      profileVisible: true,
      showEmail: false,
      showPhone: false
    },
    display: {
      theme: "light",
      language: "es",
      currency: "USD"
    }
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// session Table
export const session = pgTable("session", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID for session ID
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id), // FK to user.id
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// account Table
export const accounts = pgTable("accounts", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID for account ID
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id), // FK to user.id
  accountId: varchar("account_id", { length: 100 }).notNull(),
  providerId: varchar("provider_id", { length: 100 }).notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  idToken: text("id_token"),
  password: text("password"), // For email/password auth
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Verification Table
export const verification = pgTable("verification", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID for verification ID
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Posts Table
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: varchar("author_id", { length: 36 })
    .notNull()
    .references(() => users.id), // FK to user.id
  createdAt: timestamp("created_at").defaultNow(),
});

// Services Table
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
});



// Reviews Table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  name: varchar("name"),
  rating: varchar("rating"),
  body: varchar("body"),
  status: varchar("status"),
  created_at: timestamp("created_at").defaultNow(),
  userId: varchar("user_id", { length: 36 }).references(() => users.id), // FK to user.id
});

// Properties Table
export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  type: text("type").notNull(),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  area: integer("area").notNull(),
  location: text("location").notNull(),
  status: text("status").notNull(),
  featured: boolean("featured").default(false),
  images: jsonb("images").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Lands Table
export const lands = pgTable("lands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  area: integer("area").notNull(),
  price: integer("price").notNull(),
  location: text("location").notNull(),
  type: text("type").notNull(),
  images: jsonb("images").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Blog Posts Table
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  author: text("author").notNull(),
  category: text("category").notNull().default("property-news"),
  status: text("status").notNull().default("draft"),
  image: text("image"),
  readingTime: integer("reading_time").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Categories Table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  href: text("href").notNull(),
  status: text("status").notNull().default("active"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Favorites Table - Relación entre usuarios y propiedades/terrenos favoritos
export const userFavorites = pgTable("user_favorites", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }), // FK to user.id
  itemType: text("item_type").notNull(), // "property" o "land"
  propertyId: integer("property_id")
    .references(() => properties.id, { onDelete: "cascade" }), // FK to property.id (opcional)
  landId: integer("land_id")
    .references(() => lands.id, { onDelete: "cascade" }), // FK to land.id (opcional)
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Page Sections Table - Para contenido modificable por admin
export const pageSections = pgTable("page_sections", {
  id: serial("id").primaryKey(),
  page: text("page").notNull(), // "home", "contact", "about", etc.
  section: text("section").notNull(), // "hero", "categories", "team", "faq", "contact-form", etc.
  title: text("title"),
  subtitle: text("subtitle"),
  description: text("description"),
  content: jsonb("content").default({}), // Contenido específico de cada sección
  images: jsonb("images").default([]), // Array de URLs de imágenes
  settings: jsonb("settings").default({}), // Configuraciones específicas (colores, layout, etc.)
  isActive: boolean("is_active").default(true),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contact Information Table - Para datos de contacto modificables
export const contactInfo = pgTable("contact_info", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // "phone", "email", "address", "social"
  label: text("label").notNull(), // "Teléfono Principal", "Email Soporte", etc.
  value: text("value").notNull(), // El valor actual
  icon: text("icon"), // Nombre del icono de Lucide
  isActive: boolean("is_active").default(true),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Type Inference
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export type Verification = typeof verification.$inferSelect;
export type NewVerification = typeof verification.$inferInsert;

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;

export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;

export type Land = typeof lands.$inferSelect;
export type NewLand = typeof lands.$inferInsert;


export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type UserFavorite = typeof userFavorites.$inferSelect;
export type NewUserFavorite = typeof userFavorites.$inferInsert;

export type PageSection = typeof pageSections.$inferSelect;
export type NewPageSection = typeof pageSections.$inferInsert;

export type ContactInfo = typeof contactInfo.$inferSelect;
export type NewContactInfo = typeof contactInfo.$inferInsert;

// Unified Wizard System Tables

// Unified Wizard Drafts Table - For all wizard types (property, land, blog)
export const wizardDrafts = pgTable("wizard_drafts", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID for draft ID
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }), // FK to user.id
  wizardType: text("wizard_type").notNull(), // 'property', 'land', 'blog'
  wizardConfigId: text("wizard_config_id").notNull(), // 'property-wizard', 'land-wizard', etc.
  formData: jsonb("form_data").notNull(), // Partial wizard data
  currentStep: text("current_step").notNull(), // Current step ID
  stepProgress: jsonb("step_progress").default({}), // Track completion per step
  completionPercentage: integer("completion_percentage").default(0), // 0-100%
  title: text("title"), // For easy identification in draft list
  description: text("description"), // Brief description for draft list
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Wizard Media Table - Unified for all wizard types
export const wizardMedia = pgTable("wizard_media", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID for media ID
  draftId: varchar("draft_id", { length: 36 })
    .references(() => wizardDrafts.id, { onDelete: "cascade" }), // FK to wizard_drafts.id
  publishedId: integer("published_id"), // References final published entity (property.id, land.id, etc.)
  wizardType: text("wizard_type").notNull(), // 'property', 'land', 'blog'
  mediaType: text("media_type").notNull(), // 'image', 'video'
  url: text("url").notNull(), // Cloud storage URL
  filename: varchar("filename", { length: 255 }).notNull(),
  originalFilename: varchar("original_filename", { length: 255 }), // User's original filename
  size: integer("size").notNull(), // File size in bytes
  contentType: varchar("content_type", { length: 100 }).notNull(), // MIME type
  width: integer("width"), // Image width in pixels
  height: integer("height"), // Image height in pixels
  duration: integer("duration"), // Video duration in seconds
  displayOrder: integer("display_order").default(0), // Order for display
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Property Drafts Table - Para guardar borradores del wizard (DEPRECATED - use wizardDrafts)
export const propertyDrafts = pgTable("property_drafts", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID for draft ID
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }), // FK to user.id
  formData: jsonb("form_data").notNull(), // Partial PropertyFormData
  stepCompleted: integer("step_completed").default(0), // Last completed step (0-4)
  title: text("title"), // For easy identification in draft list
  propertyType: text("property_type"), // For filtering drafts
  completionPercentage: integer("completion_percentage").default(0), // 0-100%
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// AI Generations Table - Para trackear generaciones de IA
export const aiGenerations = pgTable("ai_generations", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID for generation ID
  propertyId: integer("property_id").references(() => properties.id, { onDelete: "cascade" }), // FK to property.id (opcional)
  draftId: varchar("draft_id", { length: 36 }).references(() => propertyDrafts.id, { onDelete: "cascade" }), // FK to draft.id (opcional)
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }), // FK to user.id
  generationType: text("generation_type").notNull(), // 'title', 'description', 'tags', 'market_insights'
  inputData: jsonb("input_data").notNull(), // PropertyBasicInfo used for generation
  generatedContent: text("generated_content").notNull(), // AI generated text
  modelUsed: varchar("model_used", { length: 100 }), // HuggingFace model identifier
  language: text("language").notNull().default("es"), // 'es' or 'en'
  success: boolean("success").default(true), // Whether generation was successful
  errorMessage: text("error_message"), // Error details if failed
  processingTimeMs: integer("processing_time_ms"), // Time taken for generation
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Property Images Table - Para metadatos de imágenes del wizard
export const propertyImages = pgTable("property_images", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID for image ID
  propertyId: integer("property_id").references(() => properties.id, { onDelete: "cascade" }), // FK to property.id (opcional)
  draftId: varchar("draft_id", { length: 36 }).references(() => propertyDrafts.id, { onDelete: "cascade" }), // FK to draft.id (opcional)
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }), // FK to user.id
  url: text("url").notNull(), // Cloud storage URL
  filename: varchar("filename", { length: 255 }).notNull(),
  originalFilename: varchar("original_filename", { length: 255 }), // User's original filename
  size: integer("size").notNull(), // File size in bytes
  contentType: varchar("content_type", { length: 100 }).notNull(), // MIME type
  width: integer("width"), // Image width in pixels
  height: integer("height"), // Image height in pixels
  displayOrder: integer("display_order").default(0), // Order for display
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Property Videos Table - Para metadatos de videos del wizard
export const propertyVideos = pgTable("property_videos", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID for video ID
  propertyId: integer("property_id").references(() => properties.id, { onDelete: "cascade" }), // FK to property.id (opcional)
  draftId: varchar("draft_id", { length: 36 }).references(() => propertyDrafts.id, { onDelete: "cascade" }), // FK to draft.id (opcional)
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }), // FK to user.id
  url: text("url").notNull(), // Cloud storage URL
  filename: varchar("filename", { length: 255 }).notNull(),
  originalFilename: varchar("original_filename", { length: 255 }), // User's original filename
  size: integer("size").notNull(), // File size in bytes
  contentType: varchar("content_type", { length: 100 }).notNull(), // MIME type
  duration: integer("duration"), // Video duration in seconds
  displayOrder: integer("display_order").default(0), // Order for display
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Property Characteristics Table - Para características dinámicas
export const propertyCharacteristics = pgTable("property_characteristics", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID for characteristic ID
  name: varchar("name", { length: 100 }).notNull(),
  category: text("category").notNull(), // 'amenity', 'feature', 'location'
  propertyType: text("property_type"), // Optional: specific to property type
  isDefault: boolean("is_default").default(false), // System-defined vs user-created
  isActive: boolean("is_active").default(true),
  order: integer("order").default(0),
  createdBy: varchar("created_by", { length: 36 }).references(() => users.id), // User who created custom characteristic
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Property Draft Characteristics Junction Table
export const propertyDraftCharacteristics = pgTable("property_draft_characteristics", {
  id: serial("id").primaryKey(),
  draftId: varchar("draft_id", { length: 36 })
    .notNull()
    .references(() => propertyDrafts.id, { onDelete: "cascade" }),
  characteristicId: varchar("characteristic_id", { length: 36 })
    .notNull()
    .references(() => propertyCharacteristics.id, { onDelete: "cascade" }),
  selected: boolean("selected").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Wizard Analytics Table - Para métricas y análisis
export const wizardAnalytics = pgTable("wizard_analytics", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID for analytics ID
  userId: varchar("user_id", { length: 36 })
    .references(() => users.id, { onDelete: "cascade" }), // FK to user.id (opcional para usuarios anónimos)
  sessionId: varchar("session_id", { length: 100 }), // Browser session ID
  wizardType: text("wizard_type").notNull(), // 'property', 'land', 'blog'
  propertyDraftId: varchar("property_draft_id", { length: 36 }).references(() => propertyDrafts.id, { onDelete: "cascade" }), // FK to property draft (opcional)
  landDraftId: varchar("land_draft_id", { length: 36 }).references(() => landDrafts.id, { onDelete: "cascade" }), // FK to land draft (opcional)
  blogDraftId: varchar("blog_draft_id", { length: 36 }).references(() => blogDrafts.id, { onDelete: "cascade" }), // FK to blog draft (opcional)
  eventType: text("event_type").notNull(), // 'step_started', 'step_completed', 'ai_generated', 'draft_saved', 'published'
  stepNumber: integer("step_number"), // 1-4 for step events
  eventData: jsonb("event_data").default({}), // Additional event-specific data
  timeSpentMs: integer("time_spent_ms"), // Time spent on step/action
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Land Drafts Table - Para guardar borradores del wizard de terrenos (DEPRECATED - use wizardDrafts)
export const landDrafts = pgTable("land_drafts", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID for draft ID
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }), // FK to user.id
  formData: jsonb("form_data").notNull(), // Partial LandFormData
  stepCompleted: integer("step_completed").default(0), // Last completed step (0-4)
  title: text("title"), // For easy identification in draft list
  landType: text("land_type"), // For filtering drafts
  completionPercentage: integer("completion_percentage").default(0), // 0-100%
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Blog Drafts Table - Para guardar borradores del wizard de blog (DEPRECATED - use wizardDrafts)
export const blogDrafts = pgTable("blog_drafts", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID for draft ID
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }), // FK to user.id
  formData: jsonb("form_data").notNull(), // Partial BlogWizardData
  stepCompleted: integer("step_completed").default(0), // Last completed step (0-4)
  title: text("title"), // For easy identification in draft list
  category: text("category"), // For filtering drafts
  completionPercentage: integer("completion_percentage").default(0), // 0-100%
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Type Inference for new tables
export type WizardDraft = typeof wizardDrafts.$inferSelect;
export type NewWizardDraft = typeof wizardDrafts.$inferInsert;

export type WizardMedia = typeof wizardMedia.$inferSelect;
export type NewWizardMedia = typeof wizardMedia.$inferInsert;

export type PropertyDraft = typeof propertyDrafts.$inferSelect;
export type NewPropertyDraft = typeof propertyDrafts.$inferInsert;

export type LandDraft = typeof landDrafts.$inferSelect;
export type NewLandDraft = typeof landDrafts.$inferInsert;

export type BlogDraft = typeof blogDrafts.$inferSelect;
export type NewBlogDraft = typeof blogDrafts.$inferInsert;

export type AIGeneration = typeof aiGenerations.$inferSelect;
export type NewAIGeneration = typeof aiGenerations.$inferInsert;

export type PropertyImage = typeof propertyImages.$inferSelect;
export type NewPropertyImage = typeof propertyImages.$inferInsert;

export type PropertyVideo = typeof propertyVideos.$inferSelect;
export type NewPropertyVideo = typeof propertyVideos.$inferInsert;

export type PropertyCharacteristic = typeof propertyCharacteristics.$inferSelect;
export type NewPropertyCharacteristic = typeof propertyCharacteristics.$inferInsert;

export type PropertyDraftCharacteristic = typeof propertyDraftCharacteristics.$inferSelect;
export type NewPropertyDraftCharacteristic = typeof propertyDraftCharacteristics.$inferInsert;

export type WizardAnalytic = typeof wizardAnalytics.$inferSelect;
export type NewWizardAnalytic = typeof wizardAnalytics.$inferInsert;
