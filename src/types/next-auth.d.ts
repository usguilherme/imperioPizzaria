import { DefaultSession } from "next-auth";

// Módulo de augmentation: estende os tipos padrão do NextAuth
// para incluir os campos customizados (id, role) que adicionamos
// nos callbacks jwt/session do auth.config.ts.

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}
