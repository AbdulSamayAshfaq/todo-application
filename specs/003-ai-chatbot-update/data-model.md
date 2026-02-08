# Enhanced Data Model: AI Chatbot Layer

## Overview
This document defines the enhanced data structures for the AI Chatbot Layer, focusing on advanced conversation and task operation entities that support sophisticated natural language task management.

## Enhanced Conversation Entity

### Enhanced Conversation
Represents a single user conversation session with the AI assistant with advanced context management.

**Fields:**
- `conversation_id` (UUID, required): Unique identifier for the conversation
- `user_id` (string, required): Reference to the authenticated user
- `created_at` (timestamp, required): When the conversation started
- `last_activity_at` (timestamp, required): Timestamp of last interaction
- `is_active` (boolean, default: true): Whether the conversation is currently active
- `context_state` (JSON, optional): Advanced conversation context and state
- `active_tasks` (array, optional): Currently active tasks in the conversation
- `user_preferences` (JSON, optional): User-specific preferences for this conversation
- `conversation_tags` (array, optional): Tags for conversation categorization
- `metadata` (JSON, optional): Additional conversation properties

**Relationships:**
- One-to-many with `EnhancedMessage` entity (via conversation_id)

### Enhanced Message
Represents an individual message within a conversation with rich formatting capabilities.

**Fields:**
- `message_id` (UUID, required): Unique identifier for the message
- `conversation_id` (UUID, required): Reference to parent conversation
- `sender_type` (enum, required): Values: 'user', 'ai', 'system'
- `content` (text, required): The message content
- `formatted_content` (JSON, optional): Rich formatting information for the message
- `timestamp` (timestamp, required): When message was sent/received
- `message_type` (enum, optional): Values: 'text', 'command', 'confirmation', 'error', 'info'
- `context_snapshot` (JSON, optional): Context at the time of message
- `metadata` (JSON, optional): Additional message properties

**Relationships:**
- Many-to-one with `EnhancedConversation` entity (via conversation_id)

## Enhanced Task Operation Entity

### EnhancedTaskOperation
Represents a natural language task management operation processed by the AI agent with detailed execution tracking.

**Fields:**
- `operation_id` (UUID, required): Unique identifier for the operation
- `conversation_id` (UUID, required): Reference to the conversation
- `user_intent` (string, required): The detected user intention (create, update, query, delete, prioritize, schedule, etc.)
- `extracted_parameters` (JSON, required): Parsed entities from user input (dates, priorities, categories, etc.)
- `mcp_tool_sequence` (JSON, required): Sequence of tool calls executed for this operation
- `execution_status` (enum, required): Values: 'pending', 'executing', 'success', 'partial', 'failed', 'rolled_back'
- `confidence_score` (float, required): AI's confidence in the operation (0.0-1.0)
- `dependencies` (array, optional): Other operations this operation depends on
- `rollback_info` (JSON, optional): Information for rolling back the operation if needed
- `audit_log` (JSON, optional): Complete audit trail for the operation
- `created_at` (timestamp, required): When the operation was initiated
- `completed_at` (timestamp, optional): When the operation was completed

**Relationships:**
- Many-to-one with `EnhancedConversation` entity (via conversation_id)

## Enhanced MCP Tool Entity

### EnhancedMCPTaskTool
Defines a specific operation available through the MCP server for advanced task management.

**Fields:**
- `tool_id` (UUID, required): Unique identifier for the tool
- `tool_name` (string, required): Name of the tool (create_task, update_task, query_tasks, etc.)
- `parameters_schema` (JSON, required): Expected parameters with validation schema
- `authentication_level` (enum, required): Values: 'basic', 'enhanced', 'sensitive'
- `rate_limits` (JSON, required): Rate limiting configuration for the tool
- `failure_modes` (array, required): Possible failure scenarios and handling
- `success_indicators` (array, required): Success criteria for the tool
- `monitoring_endpoints` (array, optional): Endpoints for monitoring tool performance
- `version_control` (string, required): Version of the tool implementation
- `created_at` (timestamp, required): When the tool was defined

## User Preference Entity

### UserPreference
Stores individual user preferences and behavior patterns for personalization.

**Fields:**
- `preference_id` (UUID, required): Unique identifier for the preference record
- `user_id` (string, required): Reference to the authenticated user
- `default_priority` (string, optional): Default priority for new tasks
- `preferred_categories` (array, optional): User's preferred task categories
- `timezone` (string, required): User's timezone for date/time processing
- `notification_settings` (JSON, required): User's notification preferences
- `frequently_used_phrases` (array, optional): Common phrases used by the user
- `conversation_style` (enum, optional): Values: 'formal', 'casual', 'direct'
- `accessibility_options` (JSON, optional): Accessibility preferences
- `updated_at` (timestamp, required): When preferences were last updated

**Relationships:**
- One-to-many with `EnhancedConversation` entity (via user_id)

## Validation Rules

### Enhanced Conversation Validation
- `conversation_id` must be unique
- `user_id` must reference a valid existing user
- `created_at` must be before or equal to `last_activity_at`
- `context_state` must be a valid JSON object
- `user_preferences` must match the expected schema

### Enhanced Message Validation
- `message_id` must be unique
- `conversation_id` must reference an active conversation
- `sender_type` must be one of the allowed values
- `content` must not be empty
- `timestamp` must be current or past time
- `message_type` must be one of the allowed values

### Enhanced TaskOperation Validation
- `operation_id` must be unique
- `user_intent` must be a valid task management action
- `confidence_score` must be between 0.0 and 1.0
- `execution_status` must be one of the allowed values
- `mcp_tool_sequence` must be a valid sequence of tool calls

### Enhanced MCPTaskTool Validation
- `tool_name` must be a predefined valid tool name
- `parameters_schema` must be a valid JSON schema
- `authentication_level` must be one of the allowed values
- `rate_limits` must have valid configuration values

### UserPreference Validation
- `user_id` must reference a valid existing user
- `timezone` must be a valid IANA timezone
- `default_priority` must be 'low', 'medium', or 'high'
- `conversation_style` must be one of the allowed values