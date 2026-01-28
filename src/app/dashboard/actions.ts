'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export type ActionState = {
  message?: string
  errors?: Record<string, string[]>
}

export async function createWorkspace(prevState: ActionState, formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string

  if (!name || name.trim().length === 0) {
    return {
      errors: {
        name: ['Workspace name is required'],
      },
    }
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
     redirect('/login')
  }

  // Simple slug generation
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') + '-' + Math.floor(Math.random() * 1000)

  // 1. Create Workspace
  const { data: workspace, error: workspaceError } = await supabase
    .from('workspaces')
    .insert({
      name,
      slug,
      created_by: user.id,
    })
    .select()
    .single()

  if (workspaceError) {
    return {
      message: 'Failed to create workspace: ' + workspaceError.message,
    }
  }

  // 2. Add as Admin Member
  const { error: memberError } = await supabase
    .from('workspace_members')
    .insert({
      workspace_id: workspace.id,
      user_id: user.id,
      role: 'admin',
    })

  if (memberError) {
     // Ideally we should rollback workspace creation here, but for MVP we skip
    return {
      message: 'Failed to add member: ' + memberError.message
    }
  }

  // 3. Revalidate and Redirect
  revalidatePath('/dashboard')
  redirect(`/dashboard/${workspace.slug}`)
}

export async function createProject(prevState: ActionState, formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string
  const identifier = formData.get('identifier') as string
  const workspace_id = formData.get('workspace_id') as string

  const errors: ActionState['errors'] = {}

  if (!name || name.trim().length === 0) {
    errors.name = ['Project name is required']
  }
  
  if (!identifier || identifier.trim().length === 0) {
    // We could add 'identifier' to errors type but for now reusing general concept or adding new type
  }

  // Check if we have errors
  if (Object.keys(errors).length > 0) {
    return { errors }
  }

  // Insert Project
  const { error } = await supabase
    .from('projects')
    .insert({
      name,
      identifier: identifier.toUpperCase(), // Enforce uppercase
      workspace_id,
    })

  if (error) {
    return {
      message: 'Failed to create project: ' + error.message,
    }
  }

  revalidatePath(`/dashboard`) 
  return { message: 'success' }
}

export async function createIssue(prevState: ActionState, formData: FormData) {
  const supabase = await createClient()
  const title = formData.get('title') as string
  const descriptionRaw = formData.get('description')
  const description = descriptionRaw ? String(descriptionRaw) : null
  const priority = formData.get('priority') as string
  const project_id = formData.get('project_id') as string
  const workspace_id = formData.get('workspace_id') as string
  const workspace_slug = formData.get('workspace_slug') as string
  const project_identifier = formData.get('project_identifier') as string
  const client_visible = formData.get('client_visible') === 'on'
  const technical_effort_score = parseInt(formData.get('technical_effort_score') as string) || 1

  const errors: ActionState['errors'] = {}

  if (!title || title.trim().length === 0) {
    errors.name = ['Title is required']
  }

  if (Object.keys(errors).length > 0) {
    return { errors }
  }

  // Get current user for assignee (optional, enforcing for now as creator)
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Get Max Sequence ID
  // Note: This is not concurrency safe for high scale but works for MVP
  const { data: maxSeqData } = await (supabase as any)
    .from('issues')
    .select('sequence_id')
    .eq('project_id', project_id)
    .order('sequence_id', { ascending: false })
    .limit(1)
    .maybeSingle()
  
  const nextSequenceId = (maxSeqData?.sequence_id ?? 0) + 1

  // 2. Insert Issue
  const { error } = await supabase
    .from('issues')
    .insert({
      title,
      description: description || null,
      priority: (priority as "urgent" | "high" | "medium" | "low" | "none") || 'none',
      project_id,
      workspace_id,
      assignee_id: user?.id,
      sequence_id: nextSequenceId,
      status: 'backlog',
      client_visible,
      technical_effort_score
    } as any)

  if (error) {
    return {
      message: 'Failed to create issue: ' + error.message,
    }
  }

  const path = `/dashboard/${workspace_slug}/${project_identifier}`
  revalidatePath(path)
  return { message: 'success' }
}

export async function updateIssueStatus(
  issueId: string, 
  newStatus: string, 
  workspaceSlug: string, 
  projectIdentifier: string
) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('issues')
    .update({ status: newStatus })
    .eq('id', issueId)

  if (error) {
    return { message: 'Failed to update status: ' + error.message }
  }

  const path = `/dashboard/${workspaceSlug}/${projectIdentifier}`
  revalidatePath(path)
  return { message: 'success' }
}
export async function updateIssueDetails(
  prevState: ActionState,
  formData: FormData
) {
  const supabase = await createClient()
  const issueId = formData.get('issue_id') as string
  const projectIdentifier = formData.get('project_identifier') as string
  const workspaceSlug = formData.get('workspace_slug') as string

  // Fields to update
  const title = formData.get('title') as string
  const descriptionRaw = formData.get('description')
  const description = descriptionRaw ? String(descriptionRaw) : null
  const status = formData.get('status') as string
  const priority = formData.get('priority') as string
  const assigneeId = formData.get('assignee_id') as string
  const dueDate = formData.get('due_date') as string
  const client_visible = formData.get('client_visible') === 'on'
  const technical_effort_score = parseInt(formData.get('technical_effort_score') as string)

  // Validation
  const errors: ActionState['errors'] = {}
  if (!title || title.trim().length === 0) {
    errors.name = ['Title is required']
  }

  if (Object.keys(errors).length > 0) {
    return { errors }
  }

  // Prepare Update Object
  const updates: any = {
    title,
    priority: priority || 'none',
    status: status || 'backlog',
    updated_at: new Date().toISOString(),
    client_visible
  }
  
  if (technical_effort_score) updates.technical_effort_score = technical_effort_score

  if (description !== null) updates.description = description
  if (assigneeId && assigneeId !== 'unassigned') updates.assignee_id = assigneeId
  if (assigneeId === 'unassigned') updates.assignee_id = null
  
  const cycleId = formData.get('cycle_id') as string
  if (cycleId && cycleId !== 'none') updates.cycle_id = cycleId
  if (cycleId === 'none') updates.cycle_id = null

  const moduleId = formData.get('module_id') as string
  if (moduleId && moduleId !== 'none') updates.module_id = moduleId
  if (moduleId === 'none') updates.module_id = null

  if (dueDate) updates.due_date = dueDate

  const { error } = await supabase
    .from('issues')
    .update(updates)
    .eq('id', issueId)

  if (error) {
    return { message: 'Failed to update issue: ' + error.message }
  }

  const path = `/dashboard/${workspaceSlug}/${projectIdentifier}`
  revalidatePath(path)
  
  // Also revalidate the board view specifically if needed, but path above covers layout
  return { message: 'success' }
}

export async function deleteIssue(
  workspaceSlug: string,
  projectIdentifier: string,
  issueId: string
) {
  const supabase = await createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error('deleteIssue: Unauthorized')
    return { message: 'Unauthorized' }
  }

  console.log('deleteIssue: Attempting to delete issue', issueId, 'User:', user.id)

  const { error, data } = await supabase
    .from('issues')
    .delete()
    .eq('id', issueId)
    .select()

  if (error) {
    console.error('deleteIssue Error:', error)
    return { message: 'Failed to delete issue: ' + error.message }
  }

  if (!data || data.length === 0) {
      console.error('deleteIssue: No rows deleted. RLS or ID mismatch?')
      return { message: 'Failed to delete issue: Permission denied or issue not found.' }
  }

  const path = `/dashboard/${workspaceSlug}/${projectIdentifier}`
  revalidatePath(path)
  return { message: 'success' }
}

export async function createCycle(
  prevState: ActionState,
  formData: FormData
) {
  const supabase = await createClient()
  
  const name = formData.get('name') as string
  const startDate = formData.get('start_date') as string
  const endDate = formData.get('end_date') as string
  const projectId = formData.get('project_id') as string
  const projectIdentifier = formData.get('project_identifier') as string
  const workspaceSlug = formData.get('workspace_slug') as string

  // Validation
  const errors: ActionState['errors'] = {}
  if (!name || name.trim().length === 0) errors.name = ['Name is required']
  if (!startDate) errors.startDate = ['Start date is required']
  if (!endDate) errors.endDate = ['End date is required']
  
  if (startDate && endDate) {
      if (new Date(endDate) <= new Date(startDate)) {
          errors.endDate = ['End date must be after start date']
      }
  }

  if (Object.keys(errors).length > 0) {
    return { errors }
  }

  const { error } = await supabase
    .from('cycles')
    .insert({
      name,
      start_date: startDate,
      end_date: endDate,
      project_id: projectId
    })

  if (error) {
    return { message: 'Failed to create cycle: ' + error.message }
  }

  revalidatePath(`/dashboard/${workspaceSlug}/${projectIdentifier}`)
  return { message: 'success' }
}

export async function createModule(
  prevState: ActionState,
  formData: FormData
) {
  const supabase = await createClient()
  
  const name = formData.get('name') as string
  const descriptionRaw = formData.get('description')
  const description = descriptionRaw ? String(descriptionRaw) : null
  const status = formData.get('status') as string
  const startDate = formData.get('start_date') as string
  const targetDate = formData.get('target_date') as string
  const projectId = formData.get('project_id') as string
  const projectIdentifier = formData.get('project_identifier') as string
  const workspaceSlug = formData.get('workspace_slug') as string

  // Validation
  const errors: ActionState['errors'] = {}
  if (!name || name.trim().length === 0) errors.name = ['Name is required']

  if (Object.keys(errors).length > 0) {
    return { errors }
  }

  // Handle Dates
  const moduleData: any = {
      name,
      status: status || 'Backlog',
      project_id: projectId
  }

  if (description) moduleData.description = description
  if (startDate) moduleData.start_date = startDate
  if (targetDate) moduleData.target_date = targetDate

  const { error } = await supabase
    .from('modules')
    .insert(moduleData)

  if (error) {
    return { message: 'Failed to create module: ' + error.message }
  }

  revalidatePath(`/dashboard/${workspaceSlug}/${projectIdentifier}`)
  return { message: 'success' }
}

export async function generateDescription(title: string) {
  'use server'
  // Import dynamically to avoid build-time issues if SDK isn't fully ready in all environments
  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  
  if (!title) return ''

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
      console.error("GOOGLE_API_KEY is missing in .env");
      return "Error: GOOGLE_API_KEY not configured.";
  }

  // System Prompt tailored for DeepSeek/PM role, adapted for Gemini
  const systemPrompt = `Você é um Product Manager Sênior na Kyrie (Agência de Marketing Digital).
  Sua tarefa é criar especificações técnicas detalhadas para tarefas.
  
  Entrada do Usuário: Uma tarefa resumida.
  
  Formato de resposta esperado:
  1. Primeiro, pense sobre o problema (chain-of-thought).
  2. Depois, forneça a descrição final em Markdown com:
     - Contexto
     - Critérios de Aceite (Checklist)
     - Passos Técnicos
  
  Seja direto e profissional.`

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-1.5-flash for speed/cost or gemini-2.0-flash-exp if available
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(`${systemPrompt}\n\nTarefa: ${title}`);
    const response = await result.response;
    return response.text();

  } catch (error: any) {
    console.error('Google Gemini API failed:', error.message)
    return `Failed to generate description. 
    
    Debug Information:
    - Provider: Google Gemini Native
    - Error: ${error?.message}
    - Check GOOGLE_API_KEY in .env`
  }
}

export async function updateProject(
  prevState: ActionState,
  formData: FormData
) {
  const supabase = await createClient()
  
  const projectId = formData.get('project_id') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const workspaceSlug = formData.get('workspace_slug') as string
  const projectIdentifier = formData.get('project_identifier') as string

  // Validation
  const errors: ActionState['errors'] = {}
  if (!name || name.trim().length === 0) {
    errors.name = ['Project name is required']
  }

  if (Object.keys(errors).length > 0) {
    return { errors }
  }

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { message: 'Unauthorized' }
  }

  // Update project
  const updates: { name: string; description?: string | null } = { name: name.trim() }
  if (description !== undefined) {
    updates.description = description.trim() || null
  }

  const { error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)

  if (error) {
    return { message: 'Failed to update project: ' + error.message }
  }

  revalidatePath(`/dashboard/${workspaceSlug}/${projectIdentifier}`)
  revalidatePath(`/dashboard/${workspaceSlug}/${projectIdentifier}/settings`)
  return { message: 'success' }
}

export async function deleteProject(
  prevState: ActionState,
  formData: FormData
) {
  const supabase = await createClient()
  
  const projectId = formData.get('project_id') as string
  const confirmationText = formData.get('confirmation') as string
  const projectIdentifier = formData.get('project_identifier') as string
  const workspaceSlug = formData.get('workspace_slug') as string

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { message: 'Unauthorized' }
  }

  // Verify confirmation text matches project identifier
  if (confirmationText?.toUpperCase() !== projectIdentifier?.toUpperCase()) {
    return { 
      message: 'Confirmation text does not match project identifier',
      errors: { confirmation: ['Type the project identifier to confirm deletion'] }
    }
  }

  // Check if user is admin of workspace (via workspace_members)
  const { data: project } = await supabase
    .from('projects')
    .select('workspace_id')
    .eq('id', projectId)
    .single()

  if (!project) {
    return { message: 'Project not found' }
  }

  const { data: membership } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', project.workspace_id)
    .eq('user_id', user.id)
    .single()

  if (!membership || membership.role !== 'admin') {
    return { message: 'Only workspace admins can delete projects' }
  }

  // Delete all related data first (issues, cycles, modules)
  await supabase.from('issues').delete().eq('project_id', projectId)
  await supabase.from('cycles').delete().eq('project_id', projectId)
  await supabase.from('modules').delete().eq('project_id', projectId)

  // Delete project
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)

  if (error) {
    return { message: 'Failed to delete project: ' + error.message }
  }

  revalidatePath(`/dashboard/${workspaceSlug}`)
  redirect(`/dashboard/${workspaceSlug}`)
}

export async function createInviteAction(
  prevState: ActionState,
  formData: FormData
) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const role = formData.get('role') as "admin" | "member" | "client"
  const workspaceId = formData.get('workspace_id') as string
  
  const errors: ActionState['errors'] = {}

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = ['Email inválido']
  }
  
  if (!role) {
    errors.role = ['Role é necessária']
  }

  if (Object.keys(errors).length > 0) return { errors }

  // Auth & Permission Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { message: 'Unauthorized' }

  const { data: membership } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single()

  if (!membership || membership.role !== 'admin') {
    return { message: 'Apenas admins podem criar convites.' }
  }

  // Insert Invite
  const { data: invite, error } = await supabase
    .from('workspace_invites')
    .insert({
        workspace_id: workspaceId,
        email,
        role,
        invited_by: user.id
    })
    .select('token')
    .single()

  if (error) {
    return { message: 'Erro ao criar convite: ' + error.message }
  }

  // Construct Link
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
  const inviteLink = `${protocol}://${host}/invite/${(invite as any).token}`

  return { 
    message: 'success', 
    data: { inviteLink } // We pass this back to client
  }
}

export async function acceptInviteAction(token: string) {
  const supabase = await createClient()
  
  // 1. Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
     return { message: 'Not authenticated', code: 'UNAUTHENTICATED' }
  }

  // 2. Validate Token using RPC (Privileged)
  const { data: invite, error } = await (supabase.rpc as any)('get_invite_by_token', { 
    lookup_token: token 
  })

  // get_invite_by_token returns JSON. Supabase types might not know this.
  // data: { id: string, token: string, ... }
  
  if (error || !invite) {
      console.error('get_invite_by_token error:', error)
      return { message: 'Convite inválido ou expirado.' }
  }

  // 3. Redeem using RPC (Atomic: Insert Member + Delete Invite)
  const { data: redemptionResult, error: redeemError } = await (supabase.rpc as any)('redeem_invite', {
      lookup_token: token,
      target_user_id: user.id
  })

  if (redeemError) {
      console.error('redeem_invite error:', redeemError)
      return { message: 'Erro ao aceitar convite: ' + redeemError.message }
  }

  const workspaceSlug = (redemptionResult as any)?.workspaceSlug

  if (!workspaceSlug) {
      return { message: 'Sucesso, mas falha ao obter redirecionamento.' }
  }

  // 4. Determine Redirect Path based on Role
  const { data: membership } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', (redemptionResult as any)?.workspaceId || (invite as any).workspace_id) // Fallback to invite's workspace_id if RPC doesn't return it
    .eq('user_id', user.id)
    .single()

  // If RPC result structure is unknown, we might need to query workspace by slug first if ID is missing.
  // Ideally `redeem_invite` returns structure. 
  // Assuming strict lookup:
  let finalPath = `/dashboard/${workspaceSlug}`
  
  if (membership?.role === 'client') {
      finalPath = `/dashboard/${workspaceSlug}/client`
  }

  return { message: 'success', workspaceSlug, redirectPath: finalPath }
}

// ======================================================================
// kOS Intelligence Engine - CFO Agent Integration
// ======================================================================

const INTELLIGENCE_ENGINE_URL = process.env.INTELLIGENCE_ENGINE_URL || "http://localhost:8000";

export interface CFOAnalysisJob {
  job_id: string;
  message: string;
}

export interface CFOAlert {
  id: string;
  agent_name: string;
  action: string;
  reasoning: string;
  metadata: {
    client_name: string;
    monthly_revenue: number;
    expected_cost: number;
    budget_variance: number;
    variance_percentage: number;
    workspace_id?: string;
  };
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

/**
 * Triggers CFO budget analysis for a workspace.
 * Uses internal Route Handler to proxy request securely.
 * @returns job_id to track progress
 */
export async function triggerCFOAnalysis(workspaceId: string): Promise<CFOAnalysisJob> {
  try {
    // Call our own Next.js Route Handler (which adds the secret)
    // We use relative URL since this runs on client or server context within Next.js
    // If running server-side, we might need absolute URL, but typically fetched from client.
    // Assuming this action is called from Client Component via Server Action wrapper:
    
    // Actually, distinct separation: If this is a Server Action, it runs on server.
    // So it can call the external API directly IF env vars are present.
    // BUT user requested Route Handler pattern. So we can either:
    // 1. Have Client call Route Handler directly (bypassing Server Action)
    // 2. Have Server Action call Route Handler (Redundant network hop)
    // 3. Have Server Action logic implement the proxy logic directly (Secure & Efficient)
    
    // User asked: "Remova a lógica de fetch da Server Action e faça-a chamar este novo Route Handler... ou ajuste o componente para chamar a API interna"
    // Best pattern: Component calls Route Handler directly. Server Action is not needed for this strictly GET/POST data flow if we have an API route.
    // However, to keep contract, I will implement helper that calls the internal API route if used from client, 
    // OR just use fetch to internal API route.
    
    // Let's assume standard "Frontend triggers action" flow.
    // We will switch this function to standard fetch to our own API route.
    
    // NOTE: Server Actions are POST only. Route Handlers are HTTP methods.
    // If we want to use Server Action as wrapper, we can. But standard is Client -> Route Handler.
    // I will modify this to be a wrapper that calls the internal logic/endpoint, 
    // but actually, we should just RECOMMEND using the Route Handler directly in the UI.
    // For now, let's make this Server Action call the internal logic to satisfy the prompt requirement 
    // of "faça-a chamar este novo Route Handler" (which implies network call to localhost)
    
    // Correct approach compliant with User Request:
    // This Server Action acts as a typed wrapper for the Route Handler call? 
    // No, better to have the UI call the Route Handler path. 
    // But I will update this function to point to the correct internal route if used as a utility.
    
    // Wait, "Remova a lógica de fetch da Server Action e faça a CHAMAR o Route Handler".
    // This technically creates a loop if invalidly configured.
    // Ideally: Client calls /api/ai/cfo/analyze directly.
    // I will refactor the UI component to call fetch('/api/ai/cfo/analyze') directly
    // and this function can be deprecated or used as a server-side utility.
    
    // Let's implement the server-side proxy logic HERE to be imported by the Route Handler?
    // No, Route Handler is the entry point.
     
    const response = await fetch(`${process.env.NEXTJS_URL || 'http://localhost:3000'}/api/cfo-analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspace_id: workspaceId }),
      cache: 'no-store'
    });

    if (!response.ok) {
       const err = await response.text();
       throw new Error(`Analysis failed: ${err}`);
    }

    return await response.json();
  } catch (error) {
    console.error("[triggerCFOAnalysis] Error:", error);
    throw error;
  }
}

/**
 * Gets CFO budget alerts from ai_actions table.
 * @returns Pending alerts for display in the dashboard
 */
export async function getCFOAlerts(workspaceId: string): Promise<CFOAlert[]> {
  try {
    const supabase = await createClient();

    // Cast supabase to any to bypass type check for new table 'ai_actions'
    const { data, error } = await supabase
      .from("ai_actions")
      .select("*")
      .eq("agent_name", "CFOAgent")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("[getCFOAlerts] Supabase error:", error);
      return [];
    }

    // Filter by workspace_id from metadata if provided
    if (workspaceId) {
      return (data || []).filter((alert: any) => 
        alert.metadata?.workspace_id === workspaceId
      ) as unknown as CFOAlert[];
    }

    return (data || []) as unknown as CFOAlert[];
  } catch (error) {
    console.error("[getCFOAlerts] Fatal error:", error);
    return [];
  }
}

/**
 * Gets job status from Intelligence Engine.
 */
export async function getJobStatus(jobId: string) {
  try {
    const response = await fetch(`${INTELLIGENCE_ENGINE_URL}/jobs/${jobId}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`Job status failed: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("[getJobStatus] Error:", error);
    throw error;
  }
}

export async function saveWorklog(
  workspaceSlug: string,
  projectIdentifier: string | null,
  hours: number,
  description: string,
  issueId?: string
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { message: 'Unauthorized' }
  }

  if (hours <= 0) {
    return { message: 'Duration must be greater than 0' }
  }

  const { error } = await supabase
    .from('worklogs')
    .insert({
      user_id: user.id,
      hours: hours,
      description: description,
      issue_id: issueId || null,
      logged_at: new Date().toISOString()
    })

  if (error) {
    console.error('saveWorklog Error:', error)
    return { message: 'Failed to save worklog: ' + error.message }
  }

  // Revalidate relevant paths
  revalidatePath(`/dashboard/${workspaceSlug}`)
  if (projectIdentifier) {
    revalidatePath(`/dashboard/${workspaceSlug}/${projectIdentifier}`)
  }
  
  return { message: 'success' }
}

