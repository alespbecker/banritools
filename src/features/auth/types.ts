// Roles válidos no sistema. Mantemos `admin` e `user` para retrocompatibilidade
// com o modelo legado e adicionamos os novos perfis usados nas features v2.
export type AppRole = "admin" | "user" | "funcionario" | "gerente" | "viewer";
