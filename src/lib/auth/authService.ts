import bcrypt from 'bcryptjs'
import { supabase } from '@/lib/database/supabase_client'
import { RegisterInput } from './type'

export async function registerService(data: RegisterInput) {
  // 1. Create user in Supabase Auth

  const db = supabase(true)

  const userExists = await checkuserExistence(data.email, data.phone_number)
  
  if(userExists){
    return { success: false, error: 'User with this email or phone number already exists' }
  }

  const { data: authData, error: authError } = await db.auth.signUp({
    email: data.email,
    phone: data.phone_number,
    password: data.password
  })


  if (authError) {
    return { success: false, error: authError.message }
  }

  const authUser = authData.user
  if (!authUser) {
    return { success: false, error: 'Auth user creation failed' }
  }

  // 2. Insert into public.users (sync profile)
  const { error: insertError } = await db.from('users').insert({
    id: authUser.id, // ✅ Use same UUID
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    password: await bcrypt.hash(data.password, 10), // Optional if you want to store it
    phone_number: data.phone_number || null,
    sex: data.sex || null,
    age_group: data.age_group || null,
    photo_consent: data.photo_consent ?? false,
  })

  if (insertError) {
    return { success: false, error: insertError.message }
  }

  if(!data.role_id)
  {
    return { success: false, message: "User role is missing" }
  }

  const assign = await assignRole(data.role_id, authUser.id)

  if(!assign.success){
    return { success: false, message: assign.message || "Role assignment failed" }
  }
  
  return { success: true, user: authUser.user_metadata }
}

export async function checkuserExistence(_email: string, _phone_number: string | null = null) {

    const db = supabase(false)

    if(_email){
      const { data, error } = await db.from('users').select('id').eq('email', _email).single()
        if (error || !data) {
            return false
        }
        return true
    }
    if(_phone_number){
      const { data, error } = await db.from('users').select('id').eq('phone_number', _phone_number).single()
        if (error || !data) {
            return false
        }
        return true
    }
    return false
    
}

// ASSIGN ROLE TO USER
export async function assignRole(role_id: string, user_id: string, update = false) {

  const db = supabase(false)


  if (!user_id || !role_id) {
    return { success: false, message: "Missing user ID or role ID" }
  }

 if(update) {
   // update user_roles
  const { data, error } = await db.from("user_roles")
  .update({ role_id })
  .eq('user_id', user_id)
  .select()
  .single();

   if (error) return { success: false,  message: "User role update failed", error: error.message }
     
  return { success: true, message: "user role updated successfully", assignment: data }

 } else {

   // insert into user_roles
  const { data, error } = await db.from("user_roles")
    .insert({ user_id, role_id })
    .select()
    .single();

    if (error) return { success: false,  message: "User role assignment failed", error: error.message }

    return { success: true, message: "User role assigned successfully", assignment: data }
 }
 
}