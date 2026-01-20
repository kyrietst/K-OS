'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

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
  const { data: maxSeqData } = await supabase
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
      description: description ? { content: description } : null,
      priority: (priority as "urgent" | "high" | "medium" | "low" | "none") || 'none',
      project_id,
      workspace_id,
      assignee_id: user?.id,
      sequence_id: nextSequenceId,
      status: 'backlog'
    })

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
    updated_at: new Date().toISOString()
  }

  if (description !== null) updates.description = { content: description }
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
  const { openai } = await import('@/lib/ai')
  
  if (!title) return ''

  // System Prompt tailored for DeepSeek/PM role
  const systemPrompt = `Você é um Product Manager Sênior na Kyrie (Agência de Marketing Digital).
  Sua tarefa é criar especificações técnicas detalhadas para tarefas.
  
  Formato de resposta esperado:
  1. Primeiro, pense sobre o problema dentro de tags <think>...</think>.
  2. Depois, forneça a descrição final em Markdown com:
     - Contexto
     - Critérios de Aceite (Checklist)
     - Passos Técnicos
  
  Seja direto.`

  const primaryModel = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-r1' // Removed :free to avoid 404
  const fallbackModels = ['google/gemini-2.0-flash-exp:free', 'meta-llama/llama-3.3-70b-instruct:free', 'deepseek/deepseek-chat:free']

  async function tryGenerate(model: string): Promise<string> {
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Tarefa: ${title}` }
      ],
      temperature: 0.7, 
    })
    return completion.choices[0]?.message?.content || ''
  }

  try {
    return await tryGenerate(primaryModel)
  } catch (error: any) {
    console.warn(`Primary model ${primaryModel} failed. Trying fallbacks...`, error.message)
    
    for (const fallback of fallbackModels) {
      try {
        console.log(`Trying fallback model: ${fallback}`)
        return await tryGenerate(fallback)
      } catch (fallbackError) {
        console.warn(`Fallback ${fallback} failed.`, fallbackError)
        continue
      }
    }

    console.error('All OpenRouter models failed:', error)
    return `Failed to generate description. 
    
    Debug Information:
    - Primary Model: ${primaryModel} (${error?.message})
    - Please check your OPENROUTER_API_KEY in .env
    - Verify model availability at openrouter.ai`
  }
}
