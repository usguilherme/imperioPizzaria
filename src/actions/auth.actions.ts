"use server";

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const senha = formData.get('senha') as string;
  
  // Em produção, isso virá de uma variável de ambiente (.env)
  // Por enquanto, a senha será "imperio2026"
  const SENHA_CORRETA = process.env.ADMIN_PASSWORD || 'imperio2026';

  if (senha === SENHA_CORRETA) {
    // Aguarda os cookies antes de manipular (Mudança do Next.js)
    const cookieStore = await cookies();
    
    // Cria um cookie seguro de sessão válido por 1 dia
    cookieStore.set('admin_session', 'autenticado', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, 
      path: '/',
    });
    
    // Redireciona para o painel após o login
    redirect('/admin');
  }

  // Retorna erro se a senha não bater
  return { error: 'Senha incorreta. Acesso negado.' };
}

export async function logoutAction() {
  // Aguarda os cookies antes de deletar
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
  
  redirect('/login');
}