import { supabase } from "./supabase";

export async function signUp({ email, password, name, role, phone }) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { error };

  // 가입 직후 세션이 있으면 프로필 생성, 이메일 확인이 필요하면 첫 로그인 시 생성됨
  if (data.user) {
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      name,
      role,
      phone,
    });
    if (profileError) return { error: profileError };
  }
  return { data };
}

export async function signIn({ email, password }) {
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return await supabase.auth.signOut();
}

export async function getProfile(userId) {
  return await supabase.from("profiles").select("*").eq("id", userId).single();
}

export async function ensureProfile(user, fallback) {
  // 프로필이 없으면 (가입 직후 등) 생성
  const { data, error } = await getProfile(user.id);
  if (data) return data;
  if (error && fallback) {
    const { error: insertError } = await supabase.from("profiles").insert({
      id: user.id,
      ...fallback,
    });
    if (!insertError) return { id: user.id, ...fallback };
  }
  return null;
}
