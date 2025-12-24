import { NextRequest, NextResponse } from "next/server";

interface Endpoint {
  method: string;
  path: string;
  description: string;
  requiresAuth: boolean;
  parameters?: string[];
}

interface EndpointCategory {
  category: string;
  description: string;
  endpoints: Endpoint[];
}

// GET API OVERVIEW
export async function GET(req: NextRequest) {
  const overview: EndpointCategory[] = [
    {
      category: "Authentication",
      description: "User authentication and session management",
      endpoints: [
        {
          method: "POST",
          path: "/api/admin/auth/register",
          description: "Register a new user",
          requiresAuth: false,
          parameters: ["email", "password", "first_name", "last_name", "phone_number"]
        },
        {
          method: "POST",
          path: "/api/admin/auth/login",
          description: "Login user and create session",
          requiresAuth: false,
          parameters: ["email", "password"]
        },
        {
          method: "POST",
          path: "/api/admin/auth/forget_password",
          description: "Request password reset",
          requiresAuth: false,
          parameters: ["email"]
        }
      ]
    },
    {
      category: "Users",
      description: "User management and profile operations",
      endpoints: [
        {
          method: "GET",
          path: "/api/admin/users",
          description: "List all users with pagination",
          requiresAuth: true,
          parameters: ["page", "limit"]
        },
        {
          method: "POST",
          path: "/api/admin/users",
          description: "Create a new user",
          requiresAuth: true,
          parameters: ["email", "password", "first_name", "last_name", "phone_number", "sex", "age_group"]
        },
        {
          method: "GET",
          path: "/api/admin/users/{id}",
          description: "Get user by ID",
          requiresAuth: true,
          parameters: ["id"]
        },
        {
          method: "PUT",
          path: "/api/admin/users/{id}",
          description: "Update user details",
          requiresAuth: true,
          parameters: ["id"]
        },
        {
          method: "DELETE",
          path: "/api/admin/users/{id}",
          description: "Delete user",
          requiresAuth: true,
          parameters: ["id"]
        }
      ]
    },
    {
      category: "Roles & Permissions",
      description: "Role-based access control management",
      endpoints: [
        {
          method: "GET",
          path: "/api/admin/roles",
          description: "List all roles with pagination",
          requiresAuth: true,
          parameters: ["page", "limit"]
        },
        {
          method: "POST",
          path: "/api/admin/roles",
          description: "Create a new role",
          requiresAuth: true,
          parameters: ["name"]
        },
        {
          method: "GET",
          path: "/api/admin/roles/{id}",
          description: "Get role by ID",
          requiresAuth: true,
          parameters: ["id"]
        },
        {
          method: "PUT",
          path: "/api/admin/roles/{id}",
          description: "Update role",
          requiresAuth: true,
          parameters: ["id", "name"]
        },
        {
          method: "DELETE",
          path: "/api/admin/roles/{id}",
          description: "Delete role",
          requiresAuth: true,
          parameters: ["id"]
        },
        {
          method: "GET",
          path: "/api/admin/permissions",
          description: "List all permissions",
          requiresAuth: true,
          parameters: ["page", "limit"]
        },
        {
          method: "POST",
          path: "/api/admin/permissions",
          description: "Create a new permission",
          requiresAuth: true,
          parameters: ["name", "description"]
        },
        {
          method: "GET",
          path: "/api/admin/permissions/{id}",
          description: "Get permission by ID",
          requiresAuth: true,
          parameters: ["id"]
        },
        {
          method: "PUT",
          path: "/api/admin/permissions/{id}",
          description: "Update permission",
          requiresAuth: true,
          parameters: ["id"]
        },
        {
          method: "DELETE",
          path: "/api/admin/permissions/{id}",
          description: "Delete permission",
          requiresAuth: true,
          parameters: ["id"]
        }
      ]
    },
    {
      category: "Projects",
      description: "Project management and tracking",
      endpoints: [
        {
          method: "GET",
          path: "/api/admin/projects",
          description: "List all projects with pagination",
          requiresAuth: true,
          parameters: ["page", "limit"]
        },
        {
          method: "POST",
          path: "/api/admin/projects",
          description: "Create a new project",
          requiresAuth: true,
          parameters: ["title", "description", "start_date", "end_date", "status"]
        },
        {
          method: "GET",
          path: "/api/admin/projects/{id}",
          description: "Get project by ID",
          requiresAuth: true,
          parameters: ["id"]
        },
        {
          method: "PUT",
          path: "/api/admin/projects/{id}",
          description: "Update project details",
          requiresAuth: true,
          parameters: ["id"]
        },
        {
          method: "DELETE",
          path: "/api/admin/projects/{id}",
          description: "Delete project",
          requiresAuth: true,
          parameters: ["id"]
        }
      ]
    },
    {
      category: "Activities",
      description: "Activity management within projects",
      endpoints: [
        {
          method: "GET",
          path: "/api/admin/activities",
          description: "List all activities with pagination",
          requiresAuth: true,
          parameters: ["page", "limit", "project_id"]
        },
        {
          method: "POST",
          path: "/api/admin/activities",
          description: "Create a new activity",
          requiresAuth: true,
          parameters: ["project_id", "title", "description", "date"]
        },
        {
          method: "GET",
          path: "/api/admin/activities/{id}",
          description: "Get activity by ID",
          requiresAuth: true,
          parameters: ["id"]
        },
        {
          method: "PUT",
          path: "/api/admin/activities/{id}",
          description: "Update activity details",
          requiresAuth: true,
          parameters: ["id"]
        },
        {
          method: "DELETE",
          path: "/api/admin/activities/{id}",
          description: "Delete activity",
          requiresAuth: true,
          parameters: ["id"]
        }
      ]
    },
    {
      category: "Cases",
      description: "Legal case management",
      endpoints: [
        {
          method: "GET",
          path: "/api/admin/cases",
          description: "List all legal cases",
          requiresAuth: true,
          parameters: ["page", "limit", "status"]
        },
        {
          method: "POST",
          path: "/api/admin/cases",
          description: "Create a new case",
          requiresAuth: true,
          parameters: ["title", "description", "case_type", "status"]
        },
        {
          method: "GET",
          path: "/api/admin/cases/{id}",
          description: "Get case details by ID",
          requiresAuth: true,
          parameters: ["id"]
        },
        {
          method: "PUT",
          path: "/api/admin/cases/{id}",
          description: "Update case details",
          requiresAuth: true,
          parameters: ["id"]
        },
        {
          method: "DELETE",
          path: "/api/admin/cases/{id}",
          description: "Delete case",
          requiresAuth: true,
          parameters: ["id"]
        }
      ]
    },
    {
      category: "Incidents",
      description: "Incident reporting and tracking",
      endpoints: [
        {
          method: "GET",
          path: "/api/admin/incidents",
          description: "List all incident reports",
          requiresAuth: true,
          parameters: ["page", "limit", "status"]
        },
        {
          method: "POST",
          path: "/api/admin/incidents",
          description: "Create new incident report",
          requiresAuth: true,
          parameters: ["title", "description", "location", "severity"]
        },
        {
          method: "GET",
          path: "/api/admin/incidents/{id}",
          description: "Get incident by ID",
          requiresAuth: true,
          parameters: ["id"]
        },
        {
          method: "PUT",
          path: "/api/admin/incidents/{id}",
          description: "Update incident status",
          requiresAuth: true,
          parameters: ["id"]
        }
      ]
    },
    {
      category: "Legal Aid",
      description: "Legal aid requests and queue management",
      endpoints: [
        {
          method: "GET",
          path: "/api/admin/legal-aid",
          description: "List all legal aid requests",
          requiresAuth: true,
          parameters: ["page", "limit", "status"]
        },
        {
          method: "POST",
          path: "/api/admin/legal-aid",
          description: "Submit legal aid request",
          requiresAuth: false,
          parameters: ["name", "phone_number", "case_description"]
        },
        {
          method: "GET",
          path: "/api/admin/legal-aid/queue",
          description: "View legal aid queue",
          requiresAuth: true,
          parameters: []
        },
        {
          method: "POST",
          path: "/api/admin/legal-aid/assign",
          description: "Assign legal aid request to lawyer",
          requiresAuth: true,
          parameters: ["request_id", "lawyer_id"]
        }
      ]
    },
    {
      category: "Reports",
      description: "Generate and retrieve reports",
      endpoints: [
        {
          method: "GET",
          path: "/api/admin/reports",
          description: "List all reports",
          requiresAuth: true,
          parameters: ["page", "limit", "type"]
        },
        {
          method: "POST",
          path: "/api/admin/reports/generate",
          description: "Generate a new report",
          requiresAuth: true,
          parameters: ["type", "start_date", "end_date"]
        },
        {
          method: "GET",
          path: "/api/admin/reports/{id}",
          description: "Get report by ID",
          requiresAuth: true,
          parameters: ["id"]
        }
      ]
    },
    {
      category: "Chatbot",
      description: "WhatsApp chatbot integration",
      endpoints: [
        {
          method: "POST",
          path: "/api/chatbot/webhook",
          description: "WhatsApp webhook for incoming messages",
          requiresAuth: false,
          parameters: ["message", "sender"]
        },
        {
          method: "GET",
          path: "/api/chatbot/logs",
          description: "View chatbot conversation logs",
          requiresAuth: true,
          parameters: ["page", "limit", "user_id"]
        }
      ]
    },
    {
      category: "Analytics",
      description: "Data analytics and insights",
      endpoints: [
        {
          method: "GET",
          path: "/api/analytics/metrics",
          description: "Get system metrics",
          requiresAuth: true,
          parameters: ["metric_type", "period"]
        },
        {
          method: "GET",
          path: "/api/analytics/insights",
          description: "Get GPT-powered insights",
          requiresAuth: true,
          parameters: ["category", "date_range"]
        }
      ]
    },
    {
      category: "Public",
      description: "Public-facing endpoints",
      endpoints: [
        {
          method: "GET",
          path: "/api/public/blogs",
          description: "List public blog posts",
          requiresAuth: false,
          parameters: ["page", "limit"]
        },
        {
          method: "GET",
          path: "/api/public/projects",
          description: "List public projects",
          requiresAuth: false,
          parameters: ["page", "limit"]
        },
        {
          method: "GET",
          path: "/api/public/resources",
          description: "List public resources",
          requiresAuth: false,
          parameters: ["page", "limit", "category"]
        }
      ]
    }
  ];

  const metadata = {
    version: "1.0.0",
    base_url: process.env.NEXT_PUBLIC_API_URL,
    documentation: "/docs/API_OVERVIEW.md",
    total_endpoints: overview.reduce((sum, cat) => sum + cat.endpoints.length, 0),
    total_categories: overview.length,
    generated_at: new Date().toISOString()
  };

  return NextResponse.json({
    metadata,
    categories: overview
  });
}
