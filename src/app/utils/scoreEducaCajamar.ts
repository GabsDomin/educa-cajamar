interface ScoreEducaInput {
  nota_portugues_saresp?: number | string | null;
  nota_matematica_saresp?: number | string | null;
  taxa_aprovacao?: number | string | null;
  taxa_evolucao?: number | string | null;
}

export interface ScoreEducaResult {
  pontos_portugues: number;
  pontos_matematica: number;
  pontos_aprovacao: number;
  pontos_evolucao: number;
  score_educa_cajamar: number;
  classificacao_score: 'Excelente' | 'Boa' | 'Regular' | 'Em atenção';
}

const toNumber = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const getEvolutionPoints = (taxaEvolucao: number) => {
  if (taxaEvolucao >= 10) return 200;
  if (taxaEvolucao >= 5) return 160;
  if (taxaEvolucao >= 1) return 120;
  if (taxaEvolucao === 0) return 100;
  if (taxaEvolucao >= -4.9) return 60;
  return 20;
};

const getClassification = (score: number): ScoreEducaResult['classificacao_score'] => {
  if (score >= 850) return 'Excelente';
  if (score >= 700) return 'Boa';
  if (score >= 500) return 'Regular';
  return 'Em atenção';
};

export const calculateScoreEducaCajamar = (input: ScoreEducaInput): ScoreEducaResult | null => {
  const notaPortugues = toNumber(input.nota_portugues_saresp);
  const notaMatematica = toNumber(input.nota_matematica_saresp);
  const taxaAprovacao = toNumber(input.taxa_aprovacao);
  const taxaEvolucao = toNumber(input.taxa_evolucao);

  if (
    notaPortugues === null ||
    notaMatematica === null ||
    taxaAprovacao === null ||
    taxaEvolucao === null ||
    notaPortugues < 0 ||
    notaMatematica < 0 ||
    taxaAprovacao < 0 ||
    taxaAprovacao > 100
  ) {
    return null;
  }

  const pontos_portugues = Math.round(clamp(notaPortugues * 30, 0, 300));
  const pontos_matematica = Math.round(clamp(notaMatematica * 30, 0, 300));
  const pontos_aprovacao = Math.round(clamp(taxaAprovacao * 2, 0, 200));
  const pontos_evolucao = Math.round(getEvolutionPoints(taxaEvolucao));
  const score = Math.round(
    clamp(pontos_portugues + pontos_matematica + pontos_aprovacao + pontos_evolucao, 0, 1000)
  );

  return {
    pontos_portugues,
    pontos_matematica,
    pontos_aprovacao,
    pontos_evolucao,
    score_educa_cajamar: score,
    classificacao_score: getClassification(score),
  };
};
