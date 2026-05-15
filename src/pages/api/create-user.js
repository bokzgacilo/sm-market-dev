// pages/api/create_user.ts
import { supabase } from '@/helper/supabase';

function generatePassword(length = 16) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);

  return Array.from(bytes, n => chars[n % chars.length]).join("");
}


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  try {
    const {
      last_name,
      first_name,
      email,
      phone,
      role = 'ITADMIN',
      status = 'active',
    } = req.body;

    const temporary_password = generatePassword();

    if (!last_name || !first_name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // 1. Check system_users first
    // const { data: existingProfile, error: existingProfileError } =
    //   await supabase
    //     .from('system_users')
    //     .select('id, email')
    //     .or(`email.eq.${email}`)
    //     .maybeSingle();

    // if (existingProfileError) {
    //   return res.status(400).json({
    //     success: false,
    //     message: existingProfileError.message,
    //   });
    // }

    // if (existingProfile) {
    //   return res.status(409).json({
    //     success: false,
    //     message: 'Email or username already exists',
    //   });
    // }

    console.log('email', email);
    console.log('phone', phone);
    console.log('role', role);
    console.log('temporary_password', temporary_password);

    console.log(supabase)


    // 2. Create Supabase Auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: temporary_password,
      options: {
        data: {
          last_name: last_name,
          first_name: first_name,
          phone: phone,
          role: role,
          temporary_password: temporary_password
        },
      },
    });

    console.log('authError', authError);

    if (authError) {
      return res.status(409).json({
        success: false,
        message: authError.message,
      });
    }

    const authUser = authData.user;
    console.log('authUser', authUser);

    // 3. Insert into system_users
    const { data: systemUser, error: systemUserError } = await supabase
      .from('system_users')
      .insert({
        id: authUser.id,
        last_name: last_name,
        first_name: first_name,
        email: email,
        phone: phone,
        role: role,
        status: status,
        created_at: new Date().toISOString(),
      })
      .select(
        'last_name, first_name, email, phone, role, status, created_at',
      )
      .single();

    // 4. Rollback Auth user if system_users insert fails
    if (systemUserError) {
      await supabase.auth.admin.deleteUser(authUser.id);

      return res.status(400).json({
        success: false,
        message: systemUserError.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: systemUser,
    });
  } catch (_err) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
