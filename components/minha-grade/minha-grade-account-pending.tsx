export function MinhaGradeAccountPending() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
      <h2 className="text-2xl font-bold text-foreground mb-2">Conta em análise</h2>
      <p className="text-muted-foreground max-w-md">
        Sua conta foi criada com sucesso. Aguarde enquanto um coach ou administrador vincula seu perfil de
        jogador.
      </p>
    </div>
  );
}
