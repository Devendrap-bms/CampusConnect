import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

export const roleEnum = pgEnum("role", ["student", "faculty"]);
export const resourceTypeEnum = pgEnum("resource_type", [
  "document",
  "pdf",
  "image",
  "video",
  "link",
]);
export const notificationTypeEnum = pgEnum("notification_type", [
  "announcement",
  "forum_activity",
  "event_reminder",
  "system_alert",
  "group_activity",
]);

// ─────────────────────────────────────────────
// BETTER AUTH TABLES (DO NOT RENAME)
// ─────────────────────────────────────────────

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
  // Campus Connect extras on user
  role: roleEnum("role").default("student").notNull(),
  studentId: text("student_id").unique(),
  facultyId: text("faculty_id").unique(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
});

// ─────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────

export const profile = pgTable("profile", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  bio: text("bio"),
  phone: text("phone"),
  department: text("department"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

// ─────────────────────────────────────────────
// ANNOUNCEMENTS
// ─────────────────────────────────────────────

export const announcement = pgTable("announcement", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: text("author_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

// ─────────────────────────────────────────────
// EVENTS
// ─────────────────────────────────────────────

export const event = pgTable("event", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  venue: text("venue"),
  category: text("category"),
  eventDate: timestamp("event_date").notNull(),
  authorId: text("author_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  isCancelled: boolean("is_cancelled")
    .$defaultFn(() => false)
    .notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

// ─────────────────────────────────────────────
// FORUMS & POSTS
// ─────────────────────────────────────────────

export const forum = pgTable("forum", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  createdById: text("created_by_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const forumMember = pgTable("forum_member", {
  id: text("id").primaryKey(),
  forumId: text("forum_id")
    .notNull()
    .references(() => forum.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joined_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const post = pgTable("post", {
  id: text("id").primaryKey(),
  forumId: text("forum_id")
    .notNull()
    .references(() => forum.id, { onDelete: "cascade" }),
  authorId: text("author_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  attachmentUrl: text("attachment_url"),
  isFlagged: boolean("is_flagged")
    .$defaultFn(() => false)
    .notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const comment = pgTable("comment", {
  id: text("id").primaryKey(),
  postId: text("post_id")
    .notNull()
    .references(() => post.id, { onDelete: "cascade" }),
  authorId: text("author_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  parentId: text("parent_id"), // for threaded replies
  content: text("content").notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const reaction = pgTable("reaction", {
  id: text("id").primaryKey(),
  postId: text("post_id")
    .notNull()
    .references(() => post.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

// ─────────────────────────────────────────────
// GROUPS & MESSAGES
// ─────────────────────────────────────────────

export const group = pgTable("group", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdById: text("created_by_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const groupMember = pgTable("group_member", {
  id: text("id").primaryKey(),
  groupId: text("group_id")
    .notNull()
    .references(() => group.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joined_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const message = pgTable("message", {
  id: text("id").primaryKey(),
  groupId: text("group_id")
    .notNull()
    .references(() => group.id, { onDelete: "cascade" }),
  senderId: text("sender_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

// ─────────────────────────────────────────────
// RESOURCES
// ─────────────────────────────────────────────

export const resource = pgTable("resource", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  fileUrl: text("file_url").notNull(),
  fileType: resourceTypeEnum("file_type").notNull(),
  uploadedById: text("uploaded_by_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  downloadCount: integer("download_count")
    .$defaultFn(() => 0)
    .notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const resourceComment = pgTable("resource_comment", {
  id: text("id").primaryKey(),
  resourceId: text("resource_id")
    .notNull()
    .references(() => resource.id, { onDelete: "cascade" }),
  authorId: text("author_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const resourceRating = pgTable("resource_rating", {
  id: text("id").primaryKey(),
  resourceId: text("resource_id")
    .notNull()
    .references(() => resource.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(), // 1–5
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

// ─────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────

export const notification = pgTable("notification", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: notificationTypeEnum("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  link: text("link"),
  isRead: boolean("is_read")
    .$defaultFn(() => false)
    .notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

// ─────────────────────────────────────────────
// RELATIONS
// ─────────────────────────────────────────────

export const userRelations = relations(user, ({ one, many }) => ({
  profile: one(profile, { fields: [user.id], references: [profile.userId] }),
  account: many(account),
  session: many(session),
  announcements: many(announcement),
  events: many(event),
  posts: many(post),
  comments: many(comment),
  reactions: many(reaction),
  messages: many(message),
  resources: many(resource),
  notifications: many(notification),
  forumMembers: many(forumMember),
  groupMembers: many(groupMember),
}));

export const profileRelations = relations(profile, ({ one }) => ({
  user: one(user, { fields: [profile.userId], references: [user.id] }),
}));

export const announcementRelations = relations(announcement, ({ one }) => ({
  author: one(user, { fields: [announcement.authorId], references: [user.id] }),
}));

export const eventRelations = relations(event, ({ one }) => ({
  author: one(user, { fields: [event.authorId], references: [user.id] }),
}));

export const forumRelations = relations(forum, ({ one, many }) => ({
  createdBy: one(user, { fields: [forum.createdById], references: [user.id] }),
  members: many(forumMember),
  posts: many(post),
}));

export const forumMemberRelations = relations(forumMember, ({ one }) => ({
  forum: one(forum, { fields: [forumMember.forumId], references: [forum.id] }),
  user: one(user, { fields: [forumMember.userId], references: [user.id] }),
}));

export const postRelations = relations(post, ({ one, many }) => ({
  forum: one(forum, { fields: [post.forumId], references: [forum.id] }),
  author: one(user, { fields: [post.authorId], references: [user.id] }),
  comments: many(comment),
  reactions: many(reaction),
}));

export const commentRelations = relations(comment, ({ one }) => ({
  post: one(post, { fields: [comment.postId], references: [post.id] }),
  author: one(user, { fields: [comment.authorId], references: [user.id] }),
}));

export const reactionRelations = relations(reaction, ({ one }) => ({
  post: one(post, { fields: [reaction.postId], references: [post.id] }),
  user: one(user, { fields: [reaction.userId], references: [user.id] }),
}));

export const groupRelations = relations(group, ({ one, many }) => ({
  createdBy: one(user, { fields: [group.createdById], references: [user.id] }),
  members: many(groupMember),
  messages: many(message),
}));

export const groupMemberRelations = relations(groupMember, ({ one }) => ({
  group: one(group, { fields: [groupMember.groupId], references: [group.id] }),
  user: one(user, { fields: [groupMember.userId], references: [user.id] }),
}));

export const messageRelations = relations(message, ({ one }) => ({
  group: one(group, { fields: [message.groupId], references: [group.id] }),
  sender: one(user, { fields: [message.senderId], references: [user.id] }),
}));

export const resourceRelations = relations(resource, ({ one, many }) => ({
  uploadedBy: one(user, { fields: [resource.uploadedById], references: [user.id] }),
  comments: many(resourceComment),
  ratings: many(resourceRating),
}));

export const resourceCommentRelations = relations(resourceComment, ({ one }) => ({
  resource: one(resource, { fields: [resourceComment.resourceId], references: [resource.id] }),
  author: one(user, { fields: [resourceComment.authorId], references: [user.id] }),
}));

export const resourceRatingRelations = relations(resourceRating, ({ one }) => ({
  resource: one(resource, { fields: [resourceRating.resourceId], references: [resource.id] }),
  user: one(user, { fields: [resourceRating.userId], references: [user.id] }),
}));

export const notificationRelations = relations(notification, ({ one }) => ({
  user: one(user, { fields: [notification.userId], references: [user.id] }),
}));